// artifacts/meueu/data/big5Estimator.ts
//
// Estima o perfil Big Five a partir de adjetivos selecionados.
// Retorna scores por dimensão (0-100) e faceta (0-100),
// mais um indicador de confiança baseado na quantidade e cobertura.

import {
  ADJECTIVE_B5_MAP,
  FACET_TO_DIM,
  type DimKey,
  type FacetKey,
} from "./adjectiveBig5Map";

export type B5Estimate = {
  dims: Record<DimKey, number>;        // 0-100
  facets: Record<FacetKey, number>;    // 0-100
  confidence: number;                  // 0-100
  confidenceLabel: "muito baixa" | "baixa" | "moderada" | "boa" | "alta";
  dominantDims: DimKey[];              // dimensões com sinal mais forte
  missingDims: DimKey[];               // dimensões sem cobertura suficiente
};

// Número mínimo de adjetivos para uma estimativa útil
const MIN_ADJECTIVES = 5;
// Número ideal para alta confiança
const IDEAL_ADJECTIVES = 15;

export function estimateB5FromAdjectives(
  currentAdjectives: string[],
  futureAdjectives: string[] = []
): B5Estimate | null {
  const all = [...currentAdjectives, ...futureAdjectives];
  const mapped = all.filter(a => ADJECTIVE_B5_MAP[a.toLowerCase()]);

  if (mapped.length < 3) return null;

  // Acumula pesos por faceta
  const facetScores: Record<string, { sum: number; count: number; maxAbs: number }> = {};

  mapped.forEach(adj => {
    const weights = ADJECTIVE_B5_MAP[adj.toLowerCase()];
    if (!weights) return;

    Object.entries(weights).forEach(([facet, weight]) => {
      if (!facetScores[facet]) {
        facetScores[facet] = { sum: 0, count: 0, maxAbs: 0 };
      }
      facetScores[facet].sum += weight;
      facetScores[facet].count += 1;
      facetScores[facet].maxAbs = Math.max(facetScores[facet].maxAbs, Math.abs(weight));
    });
  });

  // Converte para percentual 0-100
  // -1.0 → 0%, 0.0 → 50%, +1.0 → 100%
  const facets = {} as Record<FacetKey, number>;
  const ALL_FACETS = Object.keys(FACET_TO_DIM) as FacetKey[];

  ALL_FACETS.forEach(facet => {
    if (!facetScores[facet]) {
      facets[facet] = 50; // valor neutro para facetas sem dados
      return;
    }
    const { sum, count } = facetScores[facet];
    const avg = sum / count;
    // Normaliza: avg clamped a [-1, 1] → [0, 100]
    const clamped = Math.max(-1, Math.min(1, avg));
    facets[facet] = Math.round((clamped + 1) / 2 * 100);
  });

  // Agrega facetas → dimensões (média das 6 facetas de cada dimensão)
  const dims = {} as Record<DimKey, number>;
  const DIMS: DimKey[] = ["N", "E", "O", "A", "C"];

  DIMS.forEach(dim => {
    const dimFacets = ALL_FACETS.filter(f => FACET_TO_DIM[f] === dim);
    const coveredFacets = dimFacets.filter(f => facetScores[f]);

    if (coveredFacets.length === 0) {
      dims[dim] = 50;
      return;
    }

    // Média ponderada: facetas com mais dados têm mais peso
    let weightedSum = 0;
    let totalWeight = 0;

    dimFacets.forEach(facet => {
      const score = facetScores[facet];
      const weight = score ? Math.min(score.count, 3) : 0.3; // facetas sem dados têm peso mínimo
      weightedSum += facets[facet] * weight;
      totalWeight += weight;
    });

    dims[dim] = Math.round(weightedSum / totalWeight);
  });

  // Confiança baseada em:
  // 1. Quantidade de adjetivos mapeados
  // 2. Cobertura de dimensões (quantas têm dados reais)
  const dimCoverage = DIMS.filter(dim => {
    const dimFacets = ALL_FACETS.filter(f => FACET_TO_DIM[f] === dim);
    return dimFacets.some(f => facetScores[f]);
  }).length;

  const quantityScore = Math.min(mapped.length / IDEAL_ADJECTIVES, 1) * 60;
  const coverageScore = (dimCoverage / 5) * 40;
  const confidence = Math.round(quantityScore + coverageScore);

  let confidenceLabel: B5Estimate["confidenceLabel"];
  if (confidence < 20) confidenceLabel = "muito baixa";
  else if (confidence < 40) confidenceLabel = "baixa";
  else if (confidence < 60) confidenceLabel = "moderada";
  else if (confidence < 80) confidenceLabel = "boa";
  else confidenceLabel = "alta";

  // Dimensões dominantes (diferença > 20 pontos do neutro 50)
  const dominantDims = DIMS.filter(d => Math.abs(dims[d] - 50) > 20)
    .sort((a, b) => Math.abs(dims[b] - 50) - Math.abs(dims[a] - 50));

  // Dimensões sem cobertura
  const missingDims = DIMS.filter(dim => {
    const dimFacets = ALL_FACETS.filter(f => FACET_TO_DIM[f] === dim);
    return !dimFacets.some(f => facetScores[f]);
  });

  return { dims, facets, confidence, confidenceLabel, dominantDims, missingDims };
}

// Gera texto interpretativo curto para exibir na prévia
export function generatePreviewInsight(estimate: B5Estimate): string {
  const { dims, dominantDims, confidence } = estimate;

  if (dominantDims.length === 0) {
    return "Seu perfil parece equilibrado. Adicione mais adjetivos para revelar padrões.";
  }

  const insights: string[] = [];

  if (dims.N > 65) insights.push("tendência a experienciar emoções intensas");
  if (dims.N < 35) insights.push("estabilidade emocional elevada");
  if (dims.E > 65) insights.push("energia social alta");
  if (dims.E < 35) insights.push("preferência por introspecção e solitude");
  if (dims.O > 65) insights.push("abertura intensa a novas experiências");
  if (dims.O < 35) insights.push("preferência pelo concreto e estabelecido");
  if (dims.A > 65) insights.push("forte orientação ao cuidado com os outros");
  if (dims.A < 35) insights.push("estilo mais direto e independente");
  if (dims.C > 65) insights.push("alto grau de organização e autodisciplina");
  if (dims.C < 35) insights.push("estilo mais espontâneo e flexível");

  if (insights.length === 0) return "Continue selecionando adjetivos para revelar seu perfil.";

  const text = insights.slice(0, 2).join(" e ");
  const conf = confidence < 40 ? " (estimativa inicial)" : "";
  return `Os adjetivos revelam ${text}${conf}.`;
}
