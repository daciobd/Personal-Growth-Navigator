// artifacts/api-server/src/routes/plan.ts
// Integra as 8 abordagens do "eu futuro" ao prompt do Claude.
// A abordagem é selecionada automaticamente pelo perfil Big Five.
// Retorna `approach` no JSON para o frontend exibir ao usuário.

import { Router, type IRouter } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { db } from "@workspace/db";
import { planLogsTable } from "@workspace/db/schema";
import { selectFutureApproach } from "../data/futureApproaches.js";

const router: IRouter = Router();

// ── Helpers ───────────────────────────────────────────────
type DimKey = "N" | "E" | "O" | "A" | "C";

const DIM_NAMES: Record<DimKey, string> = {
  N: "Neuroticismo", E: "Extroversão", O: "Abertura",
  A: "Amabilidade",  C: "Conscienciosidade",
};

const FACET_NAMES: Record<string, string> = {
  N1:"Ansiedade",N2:"Hostilidade",N3:"Depressão",N4:"Autoconsciência",N5:"Impulsividade",N6:"Vulnerabilidade",
  E1:"Cordialidade",E2:"Gregarismo",E3:"Assertividade",E4:"Atividade",E5:"Busca de excitação",E6:"Emoções positivas",
  O1:"Fantasia",O2:"Estética",O3:"Sentimentos",O4:"Ações",O5:"Ideias",O6:"Valores",
  A1:"Confiança",A2:"Franqueza",A3:"Altruísmo",A4:"Complacência",A5:"Modéstia",A6:"Sensibilidade",
  C1:"Competência",C2:"Ordem",C3:"Senso de dever",C4:"Realização",C5:"Autodisciplina",C6:"Deliberação",
};

function levelLabel(p: number): string {
  if (p < 20) return "muito baixo";
  if (p < 35) return "baixo";
  if (p < 50) return "moderado-baixo";
  if (p < 65) return "moderado";
  if (p < 80) return "alto";
  return "muito alto";
}

// ── Route ─────────────────────────────────────────────────
router.post("/plan/generate", async (req, res) => {
  const {
    currentAdjectives,
    futureAdjectives,
    big5Scores,
    assessmentNumber = 1,
  } = req.body as {
    currentAdjectives: string[];
    futureAdjectives: string[];
    big5Scores?: {
      dims: Record<string, number>;
      facets: Record<string, number>;
    };
    assessmentNumber?: number;
  };

  if (!Array.isArray(currentAdjectives) || !Array.isArray(futureAdjectives)) {
    res.status(400).json({ error: "currentAdjectives e futureAdjectives são obrigatórios" });
    return;
  }

  // ── 1. Seleciona abordagem do eu futuro ──────────────────
  const approach = selectFutureApproach(big5Scores?.dims, assessmentNumber);

  // ── 2. Bloco Big Five (opcional) ─────────────────────────
  let big5Block = "";
  if (big5Scores?.dims) {
    const dimLines = (["N","E","O","A","C"] as DimKey[]).map(d => {
      const pct = big5Scores.dims[d] ?? 50;
      const top2 = Object.entries(big5Scores.facets ?? {})
        .filter(([k]) => k.startsWith(d))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([k, v]) => `${FACET_NAMES[k] ?? k}:${v}%`)
        .join(", ");
      return `  ${DIM_NAMES[d]}: ${pct}% (${levelLabel(pct)})${top2 ? ` | facetas elevadas: ${top2}` : ""}`;
    });
    big5Block = `PERFIL BIG FIVE (IPIP-NEO-120):\n${dimLines.join("\n")}\n\n`;
  }

  // ── 3. Monta o prompt enriquecido ────────────────────────
  const prompt = `Você é um psicólogo clínico especialista em psicoterapia integrativa.

${big5Block}EU HOJE:
${currentAdjectives.join(", ")}

EU FUTURO DESEJADO:
${futureAdjectives.join(", ")}

=== PERSPECTIVA TERAPÊUTICA DESTA SESSÃO ===
Abordagem: ${approach.name}

${approach.systemInstruction}

SÍNTESE: ${approach.synthesisLens}
FRASE DE INTENÇÃO: ${approach.intentionFrame}
PRÁTICAS: ${approach.practiceFrame}

===========================================

Gere o plano em JSON com esta estrutura exata:

{
  "sintese": "2-3 frases usando a perspectiva ${approach.name}. ${approach.synthesisLens}",
  "fraseIntencao": "Frase de intenção. ${approach.intentionFrame}",
  "praticas": [
    {
      "abordagem": "TCC",
      "nome": "Nome da técnica",
      "justificativa": "Por que esta técnica é relevante para ESTE perfil${big5Block ? " (mencione dimensões ou facetas)" : ""}.",
      "passos": ["Passo 1", "Passo 2", "Passo 3", "Passo 4"],
      "frequencia": "Sugestão prática"
    },
    { "abordagem": "ACT", "nome": "...", "justificativa": "...", "passos": ["...","...","...","..."], "frequencia": "..." },
    { "abordagem": "Psicologia Positiva", "nome": "...", "justificativa": "...", "passos": ["...","...","...","..."], "frequencia": "..." }
  ],
  "perguntaReflexao": "${approach.anchorQuestion}"
}

REGRAS:
- 3 práticas de abordagens DIFERENTES (TCC, ACT, Psicologia Positiva)
- Passos concretos e acionáveis para ESTE perfil específico
- Use segunda pessoa ("você")
- A síntese e a frase de intenção DEVEM refletir a perspectiva ${approach.key}
- "perguntaReflexao" é sempre exatamente: "${approach.anchorQuestion}"
- Responda APENAS com JSON válido, sem texto antes ou depois`;

  // ── 4. Chama o Claude ─────────────────────────────────────
  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = message.content[0].type === "text" ? message.content[0].text : "";

    let planData: Record<string, unknown>;
    try {
      const match = rawText.match(/\{[\s\S]*\}/);
      planData = match ? JSON.parse(match[0]) : { rawText, parseError: true };
    } catch {
      planData = { rawText, parseError: true };
    }

    // Log não-bloqueante
    db.insert(planLogsTable).values({
      currentAdjectives,
      futureAdjectives,
      plan: planData,
    }).catch(err => console.error("Plan log error:", err));

    res.json({
      success: true,
      plan: planData,
      approach: {
        key:             approach.key,
        name:            approach.name,
        anchorQuestion:  approach.anchorQuestion,
      },
      hasBig5: !!big5Scores,
    });

  } catch (err) {
    console.error("Plan generation error:", err);
    res.status(500).json({ error: "Erro ao gerar plano. Tente novamente." });
  }
});

export default router;
