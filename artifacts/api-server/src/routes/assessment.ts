import { Router, type IRouter } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";

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

router.post("/assessment/interpret", async (req, res) => {
  const { scores } = req.body as { scores: Big5Scores };

  if (!scores) {
    res.status(400).json({ error: "scores é obrigatório" });
    return;
  }

  const dims = ["O", "C", "E", "A", "N"];
  const profileLines = dims.map((d) => {
    const score = (scores as any)[d];
    const facetsForDim = Object.entries(scores.facets)
      .filter(([k]) => k.startsWith(d))
      .sort(([, a], [, b]) => b - a);

    const topFacets = facetsForDim.slice(0, 2).map(([k, v]) => `${FACET_NAMES[k]} (${v}%)`);
    const lowFacets = facetsForDim.slice(-2).map(([k, v]) => `${FACET_NAMES[k]} (${v}%)`);

    return `${DIM_NAMES[d]}: ${score}% (${qualLevel(score)}) — mais alto em ${topFacets.join(", ")}; mais baixo em ${lowFacets.join(", ")}`;
  });

  const prompt = `Você é um psicólogo especializado em psicologia da personalidade. Um usuário completou o inventário Big Five de personalidade e obteve os seguintes resultados:

${profileLines.join("\n")}

Escreva uma interpretação personalizada e empática em português brasileiro, de 3 a 4 parágrafos. Seja:
- Específico para ESTE perfil (mencione os traços mais marcantes)
- Positivo e orientado ao crescimento
- Claro e acessível (sem jargão técnico)
- Honesto sobre desafios, mas sempre encorajador

NÃO use listas, bullets ou headers — apenas texto corrido em parágrafos.
NÃO comece com "Com base no seu perfil" ou frases genéricas.
Comece diretamente com algo específico sobre o perfil.`;

  let interpretation = "Seu perfil revela uma combinação única de traços que moldam como você pensa, sente e se relaciona com o mundo.";

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type === "text") {
      interpretation = content.text.trim();
    }
  } catch {
    // keep default
  }

  res.json({ interpretation });
});

export default router;
