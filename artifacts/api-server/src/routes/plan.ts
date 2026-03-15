import { Router, type IRouter } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { db, planLogsTable } from "@workspace/db";

const router: IRouter = Router();

type Big5Scores = {
  O: number; C: number; E: number; A: number; N: number;
  facets: Record<string, number>;
};

const DIM_NAMES: Record<string, string> = {
  O: "Abertura à Experiência",
  C: "Conscienciosidade",
  E: "Extroversão",
  A: "Amabilidade",
  N: "Neuroticismo",
};

const FACET_NAMES: Record<string, string> = {
  O1: "Fantasia", O2: "Estética", O3: "Sentimentos", O4: "Busca por Variedade", O5: "Intelecto", O6: "Valores",
  C1: "Competência", C2: "Ordem", C3: "Senso de Dever", C4: "Busca por Realizações", C5: "Autodisciplina", C6: "Deliberação",
  E1: "Cordialidade", E2: "Gregarismo", E3: "Assertividade", E4: "Nível de Atividade", E5: "Busca por Emoções", E6: "Emoções Positivas",
  A1: "Confiança", A2: "Franqueza", A3: "Altruísmo", A4: "Complacência", A5: "Modéstia", A6: "Sensibilidade",
  N1: "Ansiedade", N2: "Hostilidade", N3: "Tristeza", N4: "Autoconsciência Social", N5: "Impulsividade", N6: "Vulnerabilidade",
};

function qualLevel(s: number): string {
  if (s <= 20) return "muito baixo";
  if (s <= 35) return "baixo";
  if (s <= 65) return "médio";
  if (s <= 80) return "alto";
  return "muito alto";
}

function buildBig5PromptBlock(scores: Big5Scores): string {
  const dims = ["O", "C", "E", "A", "N"];
  const lines: string[] = [
    "\nPERFIL DE PERSONALIDADE (Big Five) DO CLIENTE:",
  ];

  for (const d of dims) {
    const score = (scores as any)[d];
    const facetsForDim = Object.entries(scores.facets)
      .filter(([k]) => k.startsWith(d))
      .sort(([, a], [, b]) => b - a);

    const topFacets = facetsForDim.slice(0, 2).map(([k, v]) => `${FACET_NAMES[k] ?? k} (${v}%)`);
    const lowFacets = facetsForDim.slice(-2).map(([k, v]) => `${FACET_NAMES[k] ?? k} (${v}%)`);

    lines.push(
      `${DIM_NAMES[d]}: ${score}% (${qualLevel(score)}) — mais alto em ${topFacets.join(", ")}; mais baixo em ${lowFacets.join(", ")}`
    );
  }

  lines.push(
    "\nUse este perfil para personalizar AINDA MAIS o plano: adapte as técnicas ao estilo do cliente. " +
    "Por exemplo: alta Abertura → práticas criativas e reflexivas; alta Conscienciosidade → estrutura e metas claras; " +
    "alto Neuroticismo → técnicas de regulação emocional e mindfulness; baixa Amabilidade → foco em compaixão; " +
    "baixa Extroversão → práticas introspectivas e individuais."
  );

  return lines.join("\n");
}

router.post("/plan/generate", async (req, res) => {
  const { currentAdjectives, futureAdjectives, sessionId, big5Scores } = req.body as {
    currentAdjectives: string[];
    futureAdjectives: string[];
    sessionId?: string;
    big5Scores?: Big5Scores | null;
  };

  if (!Array.isArray(currentAdjectives) || !Array.isArray(futureAdjectives)) {
    res.status(400).json({ error: "currentAdjectives and futureAdjectives são obrigatórios" });
    return;
  }

  const big5Block = big5Scores ? buildBig5PromptBlock(big5Scores) : "";

  const prompt = `Você é um psicólogo especializado em psicoterapias baseadas em evidências (TCC, ACT, Psicologia Positiva, Mindfulness/DBT). 
Um cliente fez uma autoavaliação e você deve criar um plano personalizado de desenvolvimento pessoal.

EU HOJE (adjetivos que descrevem o cliente atualmente):
${currentAdjectives.join(", ")}

EU FUTURO (adjetivos que descrevem quem o cliente quer se tornar):
${futureAdjectives.join(", ")}
${big5Block}

Com base nessas informações, gere um plano em JSON com a seguinte estrutura exata:

{
  "sintese": "Uma síntese narrativa de 2-3 frases sobre a jornada de transformação do cliente, conectando quem ele é hoje com quem quer se tornar. Deve ser empática, esperançosa e profissional.",
  "fraseIntencao": "Uma frase de intenção poderosa e pessoal (começando com 'Eu escolho...' ou 'Eu me comprometo...') que capture a essência da transformação desejada.",
  "praticas": [
    {
      "abordagem": "TCC",
      "nome": "Nome da técnica específica",
      "justificativa": "Uma frase explicando por que esta técnica é especificamente relevante para a jornada DESTE cliente (mencione os adjetivos concretos).",
      "passos": [
        "Passo 1 concreto e específico",
        "Passo 2 concreto e específico",
        "Passo 3 concreto e específico",
        "Passo 4 concreto e específico"
      ],
      "frequencia": "Ex: Diariamente por 10 minutos"
    },
    {
      "abordagem": "ACT",
      "nome": "Nome da técnica específica",
      "justificativa": "Justificativa personalizada para este cliente.",
      "passos": ["Passo 1", "Passo 2", "Passo 3", "Passo 4"],
      "frequencia": "Frequência sugerida"
    },
    {
      "abordagem": "Psicologia Positiva",
      "nome": "Nome da técnica específica",
      "justificativa": "Justificativa personalizada para este cliente.",
      "passos": ["Passo 1", "Passo 2", "Passo 3", "Passo 4"],
      "frequencia": "Frequência sugerida"
    }
  ]
}

REGRAS IMPORTANTES:
- As 3 práticas devem ser de abordagens DIFERENTES (use TCC, ACT e Psicologia Positiva exatamente como mostrado)
- Os passos devem ser concretos, acionáveis e específicos para a jornada DESTE cliente
- Use a primeira pessoa ("você") ao falar com o cliente
- O plano deve criar uma ponte real entre os adjetivos atuais e os desejados${big5Scores ? "\n- Adapte as técnicas ao perfil Big Five do cliente" : ""}
- Responda APENAS com o JSON válido, sem texto adicional antes ou depois`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = message.content[0].type === "text" ? message.content[0].text : "";

    let planData: any;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        planData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      planData = { rawText, parseError: true };
    }

    // Log plan to database (non-blocking)
    if (!planData.parseError) {
      db.insert(planLogsTable).values({
        sessionId: sessionId ?? null,
        currentAdjectives,
        futureAdjectives,
        sintese: planData.sintese ?? null,
        fraseIntencao: planData.fraseIntencao ?? null,
        praticas: planData.praticas ?? null,
      }).catch((err: Error) => console.error("Failed to log plan:", err));
    }

    res.json({ success: true, plan: planData });
  } catch (error) {
    console.error("Error generating plan:", error);
    res.status(500).json({ error: "Erro ao gerar plano. Tente novamente." });
  }
});

export default router;
