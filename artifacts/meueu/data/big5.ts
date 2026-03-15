export type Dimension = "O" | "C" | "E" | "A" | "N";

export type FacetKey =
  | "O1" | "O2" | "O3" | "O4" | "O5" | "O6"
  | "C1" | "C2" | "C3" | "C4" | "C5" | "C6"
  | "E1" | "E2" | "E3" | "E4" | "E5" | "E6"
  | "A1" | "A2" | "A3" | "A4" | "A5" | "A6"
  | "N1" | "N2" | "N3" | "N4" | "N5" | "N6";

export type Big5Item = {
  id: number;
  text: string;
  facet: FacetKey;
  dimension: Dimension;
  reversed: boolean;
};

export type Big5Scores = {
  O: number;
  C: number;
  E: number;
  A: number;
  N: number;
  facets: Record<FacetKey, number>;
};

export type DimensionInfo = {
  key: Dimension;
  name: string;
  fullName: string;
  description: string;
  lowDesc: string;
  highDesc: string;
  color: string;
};

export type FacetInfo = {
  key: FacetKey;
  name: string;
  dimension: Dimension;
};

export const DIMENSION_INFO: Record<Dimension, DimensionInfo> = {
  O: {
    key: "O",
    name: "Abertura",
    fullName: "Abertura à Experiência",
    description: "Reflete sua curiosidade, criatividade e abertura para novas ideias, experiências e perspectivas.",
    lowDesc: "Prefere o familiar, é prático e com os pés no chão.",
    highDesc: "É criativo, curioso e aprecia arte, ideias e novidades.",
    color: "#7C3AED",
  },
  C: {
    key: "C",
    name: "Conscienciosidade",
    fullName: "Conscienciosidade",
    description: "Indica seu grau de organização, disciplina, confiabilidade e foco em objetivos e metas.",
    lowDesc: "É flexível e espontâneo, mas pode procrastinar.",
    highDesc: "É organizado, meticuloso e trabalha com afinco.",
    color: "#0891B2",
  },
  E: {
    key: "E",
    name: "Extroversão",
    fullName: "Extroversão",
    description: "Mede sua energia em interações sociais, assertividade e busca por estimulação externa.",
    lowDesc: "É reservado e introspectivo, prefere ambientes calmos.",
    highDesc: "É sociável, falante e animado em grupos.",
    color: "#EA580C",
  },
  A: {
    key: "A",
    name: "Amabilidade",
    fullName: "Amabilidade",
    description: "Reflete sua tendência à cooperação, empatia, confiança e harmonia nos relacionamentos.",
    lowDesc: "É mais cético, competitivo e direto.",
    highDesc: "É cooperativo, compassivo e fácil de conviver.",
    color: "#16A34A",
  },
  N: {
    key: "N",
    name: "Neuroticismo",
    fullName: "Neuroticismo",
    description: "Indica sua sensibilidade a emoções negativas, estresse e instabilidade emocional.",
    lowDesc: "É emocionalmente estável, calmo e resiliente.",
    highDesc: "Experimenta emoções negativas com mais intensidade.",
    color: "#DC2626",
  },
};

export const FACET_INFO: Record<FacetKey, FacetInfo> = {
  O1: { key: "O1", name: "Fantasia", dimension: "O" },
  O2: { key: "O2", name: "Estética", dimension: "O" },
  O3: { key: "O3", name: "Sentimentos", dimension: "O" },
  O4: { key: "O4", name: "Busca por Variedade", dimension: "O" },
  O5: { key: "O5", name: "Intelecto", dimension: "O" },
  O6: { key: "O6", name: "Valores", dimension: "O" },
  C1: { key: "C1", name: "Competência", dimension: "C" },
  C2: { key: "C2", name: "Ordem", dimension: "C" },
  C3: { key: "C3", name: "Senso de Dever", dimension: "C" },
  C4: { key: "C4", name: "Busca por Realizações", dimension: "C" },
  C5: { key: "C5", name: "Autodisciplina", dimension: "C" },
  C6: { key: "C6", name: "Deliberação", dimension: "C" },
  E1: { key: "E1", name: "Cordialidade", dimension: "E" },
  E2: { key: "E2", name: "Gregarismo", dimension: "E" },
  E3: { key: "E3", name: "Assertividade", dimension: "E" },
  E4: { key: "E4", name: "Nível de Atividade", dimension: "E" },
  E5: { key: "E5", name: "Busca por Emoções", dimension: "E" },
  E6: { key: "E6", name: "Emoções Positivas", dimension: "E" },
  A1: { key: "A1", name: "Confiança", dimension: "A" },
  A2: { key: "A2", name: "Franqueza", dimension: "A" },
  A3: { key: "A3", name: "Altruísmo", dimension: "A" },
  A4: { key: "A4", name: "Complacência", dimension: "A" },
  A5: { key: "A5", name: "Modéstia", dimension: "A" },
  A6: { key: "A6", name: "Sensibilidade", dimension: "A" },
  N1: { key: "N1", name: "Ansiedade", dimension: "N" },
  N2: { key: "N2", name: "Hostilidade", dimension: "N" },
  N3: { key: "N3", name: "Tristeza", dimension: "N" },
  N4: { key: "N4", name: "Autoconsciência Social", dimension: "N" },
  N5: { key: "N5", name: "Impulsividade", dimension: "N" },
  N6: { key: "N6", name: "Vulnerabilidade", dimension: "N" },
};

export const BIG5_ITEMS: Big5Item[] = [
  // --- ABERTURA (O) ---
  // O1 - Fantasia
  { id: 1,  text: "Tenho uma imaginação muito ativa.", facet: "O1", dimension: "O", reversed: false },
  { id: 2,  text: "Frequentemente fico absorto em devaneios e fantasias.", facet: "O1", dimension: "O", reversed: false },
  { id: 3,  text: "Não sou muito dado a fantasias ou devaneios.", facet: "O1", dimension: "O", reversed: true },
  { id: 4,  text: "Minha imaginação é limitada e prática.", facet: "O1", dimension: "O", reversed: true },
  // O2 - Estética
  { id: 5,  text: "Aprecio profundamente a beleza na arte e na natureza.", facet: "O2", dimension: "O", reversed: false },
  { id: 6,  text: "Fico facilmente emocionado com obras de arte ou música.", facet: "O2", dimension: "O", reversed: false },
  { id: 7,  text: "Raramente noto quando lugares ou objetos são bonitos.", facet: "O2", dimension: "O", reversed: true },
  { id: 8,  text: "Não me importo muito com arte, poesia ou música.", facet: "O2", dimension: "O", reversed: true },
  // O3 - Sentimentos
  { id: 9,  text: "Estou bem sintonizado com meus próprios sentimentos.", facet: "O3", dimension: "O", reversed: false },
  { id: 10, text: "Experimento uma grande variedade de emoções e sentimentos.", facet: "O3", dimension: "O", reversed: false },
  { id: 11, text: "Raramente presto atenção aos meus estados emocionais.", facet: "O3", dimension: "O", reversed: true },
  { id: 12, text: "Prefiro não me aprofundar em sentimentos complexos.", facet: "O3", dimension: "O", reversed: true },
  // O4 - Busca por Variedade
  { id: 13, text: "Prefiro variedade e novidade à rotina.", facet: "O4", dimension: "O", reversed: false },
  { id: 14, text: "Gosto de experimentar coisas novas e diferentes.", facet: "O4", dimension: "O", reversed: false },
  { id: 15, text: "Prefiro ficar com o que já conheço.", facet: "O4", dimension: "O", reversed: true },
  { id: 16, text: "Resisto a mudanças e prefiro o familiar.", facet: "O4", dimension: "O", reversed: true },
  // O5 - Intelecto
  { id: 17, text: "Gosto de refletir sobre problemas filosóficos e abstratos.", facet: "O5", dimension: "O", reversed: false },
  { id: 18, text: "Fico fascinado por ideias teóricas e conceituais.", facet: "O5", dimension: "O", reversed: false },
  { id: 19, text: "Não tenho muito interesse em teorias ou ideias abstratas.", facet: "O5", dimension: "O", reversed: true },
  { id: 20, text: "Prefiro o concreto e o prático ao teórico.", facet: "O5", dimension: "O", reversed: true },
  // O6 - Valores
  { id: 21, text: "Acredito que devemos questionar autoridades e tradições.", facet: "O6", dimension: "O", reversed: false },
  { id: 22, text: "Estou aberto a reexaminar meus valores e crenças.", facet: "O6", dimension: "O", reversed: false },
  { id: 23, text: "Prefiro seguir tradições estabelecidas a questioná-las.", facet: "O6", dimension: "O", reversed: true },
  { id: 24, text: "Acredito que é melhor seguir as regras do que questioná-las.", facet: "O6", dimension: "O", reversed: true },

  // --- CONSCIENCIOSIDADE (C) ---
  // C1 - Competência
  { id: 25, text: "Me sinto capaz e bem preparado para lidar com desafios.", facet: "C1", dimension: "C", reversed: false },
  { id: 26, text: "Sou eficaz e competente no que faço.", facet: "C1", dimension: "C", reversed: false },
  { id: 27, text: "Frequentemente me sinto despreparado para as tarefas.", facet: "C1", dimension: "C", reversed: true },
  { id: 28, text: "Duvido da minha capacidade de realizar as coisas.", facet: "C1", dimension: "C", reversed: true },
  // C2 - Ordem
  { id: 29, text: "Mantenho meu ambiente organizado e arrumado.", facet: "C2", dimension: "C", reversed: false },
  { id: 30, text: "Sou uma pessoa metódica e ordenada.", facet: "C2", dimension: "C", reversed: false },
  { id: 31, text: "Frequentemente deixo as coisas bagunçadas.", facet: "C2", dimension: "C", reversed: true },
  { id: 32, text: "Tenho dificuldade em manter a organização.", facet: "C2", dimension: "C", reversed: true },
  // C3 - Senso de Dever
  { id: 33, text: "Cumpro sempre minhas obrigações e compromissos.", facet: "C3", dimension: "C", reversed: false },
  { id: 34, text: "Tenho um forte senso de dever e responsabilidade.", facet: "C3", dimension: "C", reversed: false },
  { id: 35, text: "Evito responsabilidades sempre que possível.", facet: "C3", dimension: "C", reversed: true },
  { id: 36, text: "Acho que as regras existem para ser quebradas.", facet: "C3", dimension: "C", reversed: true },
  // C4 - Busca por Realizações
  { id: 37, text: "Trabalho arduamente para atingir meus objetivos.", facet: "C4", dimension: "C", reversed: false },
  { id: 38, text: "Tenho metas claras e me esforço consistentemente para alcançá-las.", facet: "C4", dimension: "C", reversed: false },
  { id: 39, text: "Prefiro fazer o mínimo necessário.", facet: "C4", dimension: "C", reversed: true },
  { id: 40, text: "Não sou muito ambicioso.", facet: "C4", dimension: "C", reversed: true },
  // C5 - Autodisciplina
  { id: 41, text: "Começo as tarefas imediatamente e me concentro até terminar.", facet: "C5", dimension: "C", reversed: false },
  { id: 42, text: "Sou capaz de resistir a distrações e tentações.", facet: "C5", dimension: "C", reversed: false },
  { id: 43, text: "Tenho dificuldade em iniciar tarefas importantes.", facet: "C5", dimension: "C", reversed: true },
  { id: 44, text: "Procrastino com frequência.", facet: "C5", dimension: "C", reversed: true },
  // C6 - Deliberação
  { id: 45, text: "Penso cuidadosamente antes de tomar decisões.", facet: "C6", dimension: "C", reversed: false },
  { id: 46, text: "Sou cauteloso e ponderado ao agir.", facet: "C6", dimension: "C", reversed: false },
  { id: 47, text: "Ajo por impulso, sem pensar nas consequências.", facet: "C6", dimension: "C", reversed: true },
  { id: 48, text: "Frequentemente faço coisas sem avaliar os riscos.", facet: "C6", dimension: "C", reversed: true },

  // --- EXTROVERSÃO (E) ---
  // E1 - Cordialidade
  { id: 49, text: "Faço amizades com facilidade.", facet: "E1", dimension: "E", reversed: false },
  { id: 50, text: "Sou caloroso e afetivo com as pessoas.", facet: "E1", dimension: "E", reversed: false },
  { id: 51, text: "Não sou muito aberto ou caloroso com os outros.", facet: "E1", dimension: "E", reversed: true },
  { id: 52, text: "Mantenho os outros à distância.", facet: "E1", dimension: "E", reversed: true },
  // E2 - Gregarismo
  { id: 53, text: "Gosto de estar com muitas pessoas.", facet: "E2", dimension: "E", reversed: false },
  { id: 54, text: "Prefiro estar em grupos a ficar sozinho.", facet: "E2", dimension: "E", reversed: false },
  { id: 55, text: "Prefiro passar o tempo sozinho a ir a festas.", facet: "E2", dimension: "E", reversed: true },
  { id: 56, text: "Evito multidões e aglomerações.", facet: "E2", dimension: "E", reversed: true },
  // E3 - Assertividade
  { id: 57, text: "Não tenho medo de me impor e expressar minha opinião.", facet: "E3", dimension: "E", reversed: false },
  { id: 58, text: "Tomo a liderança quando trabalho em grupo.", facet: "E3", dimension: "E", reversed: false },
  { id: 59, text: "Prefiro deixar que os outros tomem as decisões.", facet: "E3", dimension: "E", reversed: true },
  { id: 60, text: "Prefiro seguir do que liderar.", facet: "E3", dimension: "E", reversed: true },
  // E4 - Nível de Atividade
  { id: 61, text: "Sou sempre ocupado e cheio de energia.", facet: "E4", dimension: "E", reversed: false },
  { id: 62, text: "Meu ritmo de vida é acelerado.", facet: "E4", dimension: "E", reversed: false },
  { id: 63, text: "Prefiro ir devagar e com calma.", facet: "E4", dimension: "E", reversed: true },
  { id: 64, text: "Não gosto de ritmos frenéticos.", facet: "E4", dimension: "E", reversed: true },
  // E5 - Busca por Emoções
  { id: 65, text: "Gosto de atividades emocionantes e que envolvem algum risco.", facet: "E5", dimension: "E", reversed: false },
  { id: 66, text: "Fico entediado facilmente com a mesmice.", facet: "E5", dimension: "E", reversed: false },
  { id: 67, text: "Prefiro segurança e previsibilidade ao risco.", facet: "E5", dimension: "E", reversed: true },
  { id: 68, text: "Evito situações perigosas ou de alta adrenalina.", facet: "E5", dimension: "E", reversed: true },
  // E6 - Emoções Positivas
  { id: 69, text: "Me divirto e me animo facilmente.", facet: "E6", dimension: "E", reversed: false },
  { id: 70, text: "Rio bastante e me sinto alegre com frequência.", facet: "E6", dimension: "E", reversed: false },
  { id: 71, text: "Raramente sinto alegria ou entusiasmo.", facet: "E6", dimension: "E", reversed: true },
  { id: 72, text: "Não me considero uma pessoa muito animada ou alegre.", facet: "E6", dimension: "E", reversed: true },

  // --- AMABILIDADE (A) ---
  // A1 - Confiança
  { id: 73, text: "Acredito que as pessoas são, em geral, bem-intencionadas.", facet: "A1", dimension: "A", reversed: false },
  { id: 74, text: "Confio nas pessoas com facilidade.", facet: "A1", dimension: "A", reversed: false },
  { id: 75, text: "Sou desconfiado e cauteloso com os outros.", facet: "A1", dimension: "A", reversed: true },
  { id: 76, text: "Suspeito das intenções das pessoas.", facet: "A1", dimension: "A", reversed: true },
  // A2 - Franqueza
  { id: 77, text: "Prefiro ser direto e honesto, mesmo que seja difícil.", facet: "A2", dimension: "A", reversed: false },
  { id: 78, text: "Não gosto de fingir ou de enganar as pessoas.", facet: "A2", dimension: "A", reversed: false },
  { id: 79, text: "Às vezes uso a lisonja para conseguir o que quero.", facet: "A2", dimension: "A", reversed: true },
  { id: 80, text: "Sei manipular situações para obter o que desejo.", facet: "A2", dimension: "A", reversed: true },
  // A3 - Altruísmo
  { id: 81, text: "Gosto genuinamente de ajudar os outros.", facet: "A3", dimension: "A", reversed: false },
  { id: 82, text: "Sinto satisfação em fazer coisas para o bem-estar das pessoas.", facet: "A3", dimension: "A", reversed: false },
  { id: 83, text: "Não gosto de gastar meu tempo com problemas alheios.", facet: "A3", dimension: "A", reversed: true },
  { id: 84, text: "Priorizo meus interesses acima dos dos outros.", facet: "A3", dimension: "A", reversed: true },
  // A4 - Complacência
  { id: 85, text: "Procuro evitar conflitos e discordâncias.", facet: "A4", dimension: "A", reversed: false },
  { id: 86, text: "Cedo facilmente em discussões para manter a harmonia.", facet: "A4", dimension: "A", reversed: false },
  { id: 87, text: "Não recuo facilmente das minhas posições.", facet: "A4", dimension: "A", reversed: true },
  { id: 88, text: "Gosto de debater e defender minha opinião com vigor.", facet: "A4", dimension: "A", reversed: true },
  // A5 - Modéstia
  { id: 89, text: "Não gosto de me vangloriar das minhas conquistas.", facet: "A5", dimension: "A", reversed: false },
  { id: 90, text: "Prefiro que os outros me conheçam sem precisar me autopromover.", facet: "A5", dimension: "A", reversed: false },
  { id: 91, text: "Me sinto melhor do que a maioria das pessoas.", facet: "A5", dimension: "A", reversed: true },
  { id: 92, text: "Acredito que mereço um tratamento especial.", facet: "A5", dimension: "A", reversed: true },
  // A6 - Sensibilidade
  { id: 93, text: "Fico comovido com o sofrimento dos outros.", facet: "A6", dimension: "A", reversed: false },
  { id: 94, text: "Me preocupo profundamente com os sentimentos das pessoas.", facet: "A6", dimension: "A", reversed: false },
  { id: 95, text: "Não me abalo muito diante de situações difíceis dos outros.", facet: "A6", dimension: "A", reversed: true },
  { id: 96, text: "Acredito que as pessoas deveriam resolver seus próprios problemas.", facet: "A6", dimension: "A", reversed: true },

  // --- NEUROTICISMO (N) ---
  // N1 - Ansiedade
  { id: 97,  text: "Me preocupo frequentemente com coisas que podem dar errado.", facet: "N1", dimension: "N", reversed: false },
  { id: 98,  text: "Me sinto ansioso e tenso com frequência.", facet: "N1", dimension: "N", reversed: false },
  { id: 99,  text: "Raramente me sinto preocupado ou ansioso.", facet: "N1", dimension: "N", reversed: true },
  { id: 100, text: "Sou uma pessoa muito calma e tranquila.", facet: "N1", dimension: "N", reversed: true },
  // N2 - Hostilidade
  { id: 101, text: "Fico irritado com facilidade.", facet: "N2", dimension: "N", reversed: false },
  { id: 102, text: "Perco a paciência com frequência.", facet: "N2", dimension: "N", reversed: false },
  { id: 103, text: "Raramente me sinto irritado ou com raiva.", facet: "N2", dimension: "N", reversed: true },
  { id: 104, text: "É muito difícil me tirar do sério.", facet: "N2", dimension: "N", reversed: true },
  // N3 - Tristeza
  { id: 105, text: "Com frequência me sinto triste, melancólico ou desanimado.", facet: "N3", dimension: "N", reversed: false },
  { id: 106, text: "Às vezes me sinto sem valor ou sem propósito.", facet: "N3", dimension: "N", reversed: false },
  { id: 107, text: "Raramente me sinto triste ou deprimido.", facet: "N3", dimension: "N", reversed: true },
  { id: 108, text: "Me sinto bem comigo mesmo na maior parte do tempo.", facet: "N3", dimension: "N", reversed: true },
  // N4 - Autoconsciência Social
  { id: 109, text: "Me preocupo muito com o que os outros pensam de mim.", facet: "N4", dimension: "N", reversed: false },
  { id: 110, text: "Sinto vergonha ou constrangimento com facilidade em situações sociais.", facet: "N4", dimension: "N", reversed: false },
  { id: 111, text: "Não me preocupo muito com a opinião dos outros sobre mim.", facet: "N4", dimension: "N", reversed: true },
  { id: 112, text: "Raramente sinto vergonha ou embaraço.", facet: "N4", dimension: "N", reversed: true },
  // N5 - Impulsividade
  { id: 113, text: "Tenho dificuldade em resistir aos meus impulsos e desejos.", facet: "N5", dimension: "N", reversed: false },
  { id: 114, text: "Às vezes ajo por impulso e me arrependo depois.", facet: "N5", dimension: "N", reversed: false },
  { id: 115, text: "Consigo controlar bem meus impulsos.", facet: "N5", dimension: "N", reversed: true },
  { id: 116, text: "Raramente cedo a tentações.", facet: "N5", dimension: "N", reversed: true },
  // N6 - Vulnerabilidade
  { id: 117, text: "Em situações de pressão, fico confuso e sem saber o que fazer.", facet: "N6", dimension: "N", reversed: false },
  { id: 118, text: "Quando estou sob estresse, fico facilmente sobrecarregado.", facet: "N6", dimension: "N", reversed: false },
  { id: 119, text: "Consigo lidar bem com situações de estresse.", facet: "N6", dimension: "N", reversed: true },
  { id: 120, text: "Em crises, me mantenho calmo e sei o que fazer.", facet: "N6", dimension: "N", reversed: true },
];

const ITEMS_PER_PAGE = 10;
export const TOTAL_PAGES = Math.ceil(BIG5_ITEMS.length / ITEMS_PER_PAGE);

export function getPageItems(page: number): Big5Item[] {
  const start = (page - 1) * ITEMS_PER_PAGE;
  return BIG5_ITEMS.slice(start, start + ITEMS_PER_PAGE);
}

export function scoreAnswers(answers: Record<number, number>): Big5Scores {
  const facetScores: Partial<Record<FacetKey, number>> = {};

  const facetKeys = Object.keys(FACET_INFO) as FacetKey[];
  for (const facetKey of facetKeys) {
    const items = BIG5_ITEMS.filter((i) => i.facet === facetKey);
    let total = 0;
    let count = 0;
    for (const item of items) {
      const raw = answers[item.id];
      if (raw === undefined) continue;
      const score = item.reversed ? 6 - raw : raw;
      total += score;
      count++;
    }
    if (count === 0) {
      facetScores[facetKey] = 50;
    } else {
      const minPossible = count * 1;
      const maxPossible = count * 5;
      facetScores[facetKey] = Math.round(((total - minPossible) / (maxPossible - minPossible)) * 100);
    }
  }

  const dimScore = (dim: Dimension): number => {
    const dimFacets = facetKeys.filter((fk) => FACET_INFO[fk].dimension === dim);
    const avg = dimFacets.reduce((sum, fk) => sum + (facetScores[fk] ?? 50), 0) / dimFacets.length;
    return Math.round(avg);
  };

  return {
    O: dimScore("O"),
    C: dimScore("C"),
    E: dimScore("E"),
    A: dimScore("A"),
    N: dimScore("N"),
    facets: facetScores as Record<FacetKey, number>,
  };
}

export function qualitativeLevel(score: number): string {
  if (score <= 20) return "Muito baixo";
  if (score <= 35) return "Baixo";
  if (score <= 65) return "Médio";
  if (score <= 80) return "Alto";
  return "Muito alto";
}

export function buildBig5PromptBlock(scores: Big5Scores): string {
  const dims: Dimension[] = ["O", "C", "E", "A", "N"];

  const lines: string[] = [
    "PERFIL DE PERSONALIDADE — BIG FIVE:",
    "",
  ];

  for (const dim of dims) {
    const info = DIMENSION_INFO[dim];
    const score = scores[dim];
    const level = qualitativeLevel(score);

    const dimFacets = (Object.keys(FACET_INFO) as FacetKey[]).filter(
      (fk) => FACET_INFO[fk].dimension === dim
    );

    const topFacets = [...dimFacets]
      .sort((a, b) => scores.facets[b] - scores.facets[a])
      .slice(0, 2)
      .map((fk) => `${FACET_INFO[fk].name} (${scores.facets[fk]}%)`);

    const bottomFacets = [...dimFacets]
      .sort((a, b) => scores.facets[a] - scores.facets[b])
      .slice(0, 2)
      .map((fk) => `${FACET_INFO[fk].name} (${scores.facets[fk]}%)`);

    lines.push(`${info.fullName} (${dim}): ${score}% — ${level}`);
    lines.push(`  Facetas mais altas: ${topFacets.join(", ")}`);
    lines.push(`  Facetas mais baixas: ${bottomFacets.join(", ")}`);
    lines.push("");
  }

  lines.push("Considere estas informações ao elaborar o plano. Adapte as abordagens e técnicas ao perfil de personalidade.");

  return lines.join("\n");
}

export const BIG5_STORAGE_KEY = "@meueu_big5_v1";

export type StoredBig5 = {
  scores: Big5Scores;
  completedAt: string;
  answers: Record<number, number>;
};
