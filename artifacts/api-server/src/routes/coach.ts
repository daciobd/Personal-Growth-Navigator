import { Router, type IRouter } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { db, coachMessagesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router: IRouter = Router();

// ─── Abordagem por chave ──────────────────────────────────────────────────────
const APPROACH_INSTRUCTIONS: Record<string, string> = {
  tcc: `Você usa a linguagem da TCC. Foca em pensamentos automáticos, evidências, registros.
Pergunta "o que você estava pensando?" em vez de "como se sentiu?".
Propõe experimentos comportamentais concretos.`,

  act: `Você usa a linguagem da ACT. Foca em valores e ação comprometida.
Não tenta mudar pensamentos — ajuda a agir apesar deles.
Usa metáforas de ACT (passageiros no ônibus, desfusão cognitiva).`,

  "psicologia-positiva": `Você usa Psicologia Positiva. Foca no que está funcionando.
Busca exceções, forças de caráter, pequenas vitórias.
Nunca começa pela análise do problema — começa pelo que já existe de bom.`,

  cft: `Você usa CFT (Terapia Focada na Compaixão). Tom sempre gentil, nunca exigente.
Usa a voz do "amigo compassivo". Normaliza o sofrimento como parte humana.
Propõe práticas de autocompaixão antes de qualquer mudança comportamental.`,

  narrativa: `Você usa Terapia Narrativa. Vê a vida como história que pode ser reescrita.
Busca "resultados únicos" — momentos em que a pessoa agiu diferente da história-problema.
Externaliza o problema: não "você é ansioso" mas "a ansiedade aparece quando...".`,

  tfs: `Você usa TFS (Terapia Focada na Solução). Zero análise de problema.
Foca no que a pessoa quer, não no que não quer. Usa escalas de 0 a 10.
Pergunta: "o que estaria diferente na sua vida se o problema já estivesse resolvido?"`,

  humanista: `Você usa abordagem Humanista/Rogeriana. Confia na sabedoria do usuário.
Usa reflexão empática mais que conselhos. Cria espaço, não dá direção.
Acredita na tendência atualizante — a pessoa sabe o que precisa.`,
};

// ─── System prompt base ───────────────────────────────────────────────────────
const BASE_SYSTEM = `Você é o Coach IA do MeuEu — um coach de desenvolvimento pessoal.

LINGUAGEM OBRIGATÓRIA:
- Português brasileiro casual, como um amigo inteligente
- Frases curtas. Máximo 3 frases por parágrafo
- NUNCA use: "ressignificar", "protagonismo", "potencializar", "acolher", "processar emoções"
- USE: "entender" (não "compreender"), "mudar" (não "transformar"), "ajuda" (não "suporte")
- Seja direto. Evite enrolação.

REGRAS:
- Nunca diagnostique condições clínicas
- Se a pessoa parecer em crise, indique ajuda profissional
- Máximo de 4 parágrafos por resposta
- Termine com UMA pergunta ou UMA sugestão prática — nunca os dois`;

type Message = { role: "user" | "assistant"; content: string };

type HealthContext = {
  careMode?: string;
  biomarkerFocus?: { key: string; label: string; status: string; value?: number; unit?: string };
  clinicalSummary?: string;
  targetOutcome?: string;
  barriers?: string[];
};

function buildSystemPrompt(
  preferredApproach?: string,
  practiceName?: string,
  planContext?: string,
  healthContext?: HealthContext
): string {
  let system = BASE_SYSTEM;

  // Abordagem preferida
  if (preferredApproach && APPROACH_INSTRUCTIONS[preferredApproach]) {
    system += `\n\nABORDAGEM PREFERIDA PELO USUÁRIO:\n${APPROACH_INSTRUCTIONS[preferredApproach]}`;
    system += `\nSe o usuário pedir uma perspectiva diferente, mude sem resistência.`;
  }

  // Contexto da prática
  if (practiceName) {
    system += `\n\nCONTEXTO: O usuário acabou de fazer (ou está pensando em fazer) a prática "${practiceName}". Relate sua resposta a isso quando relevante.`;
  }

  // Contexto do plano
  if (planContext) {
    system += `\n\nPLANO DO USUÁRIO:\n${planContext}`;
  }

  // Contexto de saúde (Longevi)
  if (healthContext) {
    const lines: string[] = [];
    if (healthContext.clinicalSummary) lines.push(`Contexto clínico: ${healthContext.clinicalSummary}`);
    if (healthContext.biomarkerFocus) {
      const b = healthContext.biomarkerFocus;
      const v = b.value !== undefined ? ` (${b.value} ${b.unit ?? ""})` : "";
      lines.push(`Biomarcador em atenção: ${b.label}${v} — ${b.status}`);
    }
    if (healthContext.targetOutcome) lines.push(`Objetivo do usuário: ${healthContext.targetOutcome}`);
    if (healthContext.barriers?.length) lines.push(`Barreiras relatadas: ${healthContext.barriers.join(", ")}`);
    if (lines.length > 0) {
      system += `\n\nCONTEXTO DE SAÚDE (via Longevi — use para personalizar, sem alarmismo):\n${lines.join("\n")}\nAdapte suas sugestões para endereçar as barreiras do usuário. Nunca faça diagnósticos.`;
    }
  }

  return system;
}

// ─── POST /message ────────────────────────────────────────────────────────────
router.post("/message", async (req, res) => {
  const {
    deviceId,
    message,
    history,
    preferredApproach,
    practiceName,
    planContext,
    healthContext,
  } = req.body as {
    deviceId: string;
    message: string;
    history?: Message[];
    preferredApproach?: string;
    practiceName?: string;
    planContext?: string;
    healthContext?: HealthContext;
  };

  if (!deviceId || !message) {
    res.status(400).json({ error: "deviceId e message são obrigatórios" });
    return;
  }

  // Carrega histórico do DB se não veio no body
  let dbHistory: Message[] = [];
  if (!history || history.length === 0) {
    const stored = await db
      .select()
      .from(coachMessagesTable)
      .where(eq(coachMessagesTable.deviceId, deviceId))
      .orderBy(asc(coachMessagesTable.createdAt))
      .limit(20);

    dbHistory = stored.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
  } else {
    dbHistory = history.slice(-20);
  }

  const messages: Message[] = [...dbHistory, { role: "user", content: message }];

  let response = "Estou aqui com você. Pode continuar.";

  try {
    const aiResponse = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 600,
      system: buildSystemPrompt(preferredApproach, practiceName, planContext, healthContext),
      messages,
    });

    const content = aiResponse.content[0];
    if (content.type === "text") {
      response = content.text.trim();
    }
  } catch (err) {
    console.error("Coach error:", err);
  }

  await db.insert(coachMessagesTable).values([
    { deviceId, role: "user", content: message, xpEarned: 0 },
    { deviceId, role: "assistant", content: response, xpEarned: 2 },
  ]);

  res.json({ response, xpEarned: 2 });
});

// ─── GET /history ─────────────────────────────────────────────────────────────
router.get("/history", async (req, res) => {
  const { deviceId } = req.query as { deviceId: string };

  if (!deviceId) {
    res.status(400).json({ error: "deviceId é obrigatório" });
    return;
  }

  const history = await db
    .select()
    .from(coachMessagesTable)
    .where(eq(coachMessagesTable.deviceId, deviceId))
    .orderBy(asc(coachMessagesTable.createdAt))
    .limit(50);

  res.json({
    history: history.map((m) => ({
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    })),
  });
});

export default router;
