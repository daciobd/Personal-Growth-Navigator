export type Therapy =
  | "TCC"
  | "ACT"
  | "Mindfulness"
  | "Psicologia Positiva"
  | "Terapia Narrativa"
  | "Focada em Compaixão";

export type Intervention = {
  id: string;
  therapy: Therapy;
  title: string;
  description: string;
  steps: string[];
  duration: string;
  fromAdjectives: string[];
  toAdjectives: string[];
  icon: string;
};

export const INTERVENTIONS: Intervention[] = [
  {
    id: "tcc-pensamento-automatico",
    therapy: "TCC",
    title: "Registre Seu Pensamento",
    description:
      "Identifique e questione pensamentos automáticos que reforçam sua forma atual de ser e bloqueiam sua transformação.",
    steps: [
      "Anote uma situação recente que te incomodou.",
      "Escreva o pensamento automático que surgiu (ex: 'Não vou conseguir').",
      "Qual emoção esse pensamento trouxe? (0-10)",
      "Qual evidência apoia esse pensamento? E contra?",
      "Reformule com uma perspectiva mais equilibrada.",
      "Como você se sente agora? (0-10)",
    ],
    duration: "10 min",
    fromAdjectives: ["ansioso", "inseguro", "negativo", "pessimista", "rígido"],
    toAdjectives: ["confiante", "equilibrado", "racional", "positivo", "flexível"],
    icon: "edit-3",
  },
  {
    id: "act-aceitacao-valores",
    therapy: "ACT",
    title: "Conecte-se com Seus Valores",
    description:
      "Quando agimos em direção ao que mais importa, nos movemos naturalmente rumo a quem queremos ser.",
    steps: [
      "Feche os olhos e respire fundo 3 vezes.",
      "Pense em alguém que admira profundamente. O que faz essa pessoa especial?",
      "Essas qualidades refletem algo que você valoriza? Anote-as.",
      "Em qual área da sua vida você pode agir mais alinhado a esses valores hoje?",
      "Comprometa-se com uma ação pequena e concreta nas próximas 24h.",
    ],
    duration: "8 min",
    fromAdjectives: ["perdido", "vazio", "desmotivado", "passivo", "conformado"],
    toAdjectives: ["propósito", "comprometido", "motivado", "ativo", "corajoso"],
    icon: "compass",
  },
  {
    id: "mindfulness-ancoragem",
    therapy: "Mindfulness",
    title: "Técnica 5-4-3-2-1",
    description:
      "Ancore-se no presente para sair do piloto automático e abrir espaço para novas formas de ser.",
    steps: [
      "Observe 5 coisas que você pode VER ao redor.",
      "Toque 4 objetos e perceba sua TEXTURA.",
      "Preste atenção em 3 SONS diferentes.",
      "Identifique 2 cheiros ao seu redor.",
      "Note 1 coisa que você pode SABOREAR agora.",
      "Respire fundo e reconheça: você está presente.",
    ],
    duration: "5 min",
    fromAdjectives: ["agitado", "acelerado", "distraído", "impulsivo", "ansioso"],
    toAdjectives: ["calmo", "presente", "consciente", "focado", "sereno"],
    icon: "wind",
  },
  {
    id: "psicologia-positiva-gratidao",
    therapy: "Psicologia Positiva",
    title: "Diário de Gratidão",
    description:
      "Treinar a atenção ao que é bom recalibra o cérebro para enxergar oportunidades de crescimento.",
    steps: [
      "Anote 3 coisas pelas quais você é grato HOJE (podem ser pequenas).",
      "Para cada uma, escreva por que ela é significativa.",
      "Qual qualidade sua ajudou a criar ou perceber essas coisas?",
      "Como você pode cultivar mais momentos assim amanhã?",
    ],
    duration: "7 min",
    fromAdjectives: ["negativo", "pessimista", "ressentido", "insatisfeito", "fechado"],
    toAdjectives: ["grato", "positivo", "generoso", "satisfeito", "aberto"],
    icon: "heart",
  },
  {
    id: "narrativa-reescrita",
    therapy: "Terapia Narrativa",
    title: "Reescreva Sua Narrativa",
    description:
      "Você não é o problema — o problema é o problema. Separe-se dele e encontre exceções para reescrever sua história.",
    steps: [
      "Descreva em 2 frases o 'problema' que te define atualmente.",
      "Dê um nome externo a esse problema (ex: 'O Medo', 'A Procrastinação').",
      "Pense numa vez que você agiu de forma diferente, apesar desse problema.",
      "O que isso diz sobre quem você realmente é, além do problema?",
      "Escreva 3 qualidades que existem em você mesmo quando o problema aparece.",
    ],
    duration: "12 min",
    fromAdjectives: ["limitado", "preso", "conformado", "inseguro", "passivo"],
    toAdjectives: ["livre", "autêntico", "corajoso", "seguro", "protagonista"],
    icon: "book-open",
  },
  {
    id: "compaixao-carta",
    therapy: "Focada em Compaixão",
    title: "Carta do Amigo Compassivo",
    description:
      "Trate-se como trataria um amigo querido. A autocompaixão é o alicerce de toda mudança duradoura.",
    steps: [
      "Pense numa dificuldade que você está enfrentando agora.",
      "Imagine que um amigo muito querido está passando pela mesma coisa.",
      "O que você diria a ele com gentileza e sabedoria?",
      "Escreva uma carta curta para si mesmo com essas palavras.",
      "Leia a carta em voz alta, devagar.",
    ],
    duration: "10 min",
    fromAdjectives: ["autocrítico", "rígido", "exigente", "duro", "culpado"],
    toAdjectives: ["gentil", "compassivo", "paciente", "amoroso", "equilibrado"],
    icon: "mail",
  },
  {
    id: "act-defusao",
    therapy: "ACT",
    title: "Defusão Cognitiva",
    description:
      "Distancie-se de pensamentos que te limitam. Você não é seus pensamentos — você os observa.",
    steps: [
      "Identifique um pensamento limitante recorrente (ex: 'Sou tímido demais').",
      "Repita esse pensamento com um prefixo: 'Estou tendo o pensamento de que...'",
      "Agora tente: 'Minha mente está me dizendo que...'",
      "Imagine esse pensamento como uma nuvem passando no céu. Observe-o sem julgamento.",
      "Retorne ao que importa: qual ação você pode fazer agora, independente desse pensamento?",
    ],
    duration: "8 min",
    fromAdjectives: ["ansioso", "rígido", "preso", "limitado", "autocrítico"],
    toAdjectives: ["livre", "flexível", "consciente", "corajoso", "autônomo"],
    icon: "cloud",
  },
  {
    id: "mindfulness-respiracao",
    therapy: "Mindfulness",
    title: "Respiração 4-7-8",
    description:
      "Esta técnica ativa o sistema nervoso parassimpático, criando calma e clareza mental imediatas.",
    steps: [
      "Sente-se confortavelmente com a coluna ereta.",
      "Inspire pelo nariz contando até 4.",
      "Segure o ar contando até 7.",
      "Expire pela boca contando até 8.",
      "Repita 4 vezes.",
      "Observe como seu corpo e mente se sentem agora.",
    ],
    duration: "5 min",
    fromAdjectives: ["agitado", "tenso", "ansioso", "impulsivo", "acelerado"],
    toAdjectives: ["calmo", "centrado", "sereno", "presente", "equilibrado"],
    icon: "activity",
  },
  {
    id: "pp-forcas",
    therapy: "Psicologia Positiva",
    title: "Descubra Suas Forças",
    description:
      "Identificar e usar suas forças naturais é um dos caminhos mais eficazes para a transformação pessoal.",
    steps: [
      "Liste 3 momentos em que você se sentiu totalmente você mesmo, no seu melhor.",
      "O que você estava fazendo em cada um desses momentos?",
      "Quais qualidades estavam em ação? (ex: criatividade, liderança, cuidado)",
      "Como você pode usar uma dessas forças hoje, numa situação específica?",
      "Comprometa-se com um momento intencional de usar essa força.",
    ],
    duration: "10 min",
    fromAdjectives: ["inseguro", "limitado", "desmotivado", "passivo", "conformado"],
    toAdjectives: ["confiante", "capaz", "motivado", "ativo", "realizado"],
    icon: "star",
  },
  {
    id: "tcc-experimento",
    therapy: "TCC",
    title: "Experimento Comportamental",
    description:
      "Teste suas crenças na prática. A ação gera mais evidência que qualquer raciocínio.",
    steps: [
      "Identifique uma crença limitante (ex: 'Se falar em público, vou me humilhar').",
      "Qual seria um experimento pequeno e seguro para testá-la?",
      "Faça uma previsão: o que você acha que vai acontecer? (0-10 de probabilidade)",
      "Execute o experimento hoje ou amanhã.",
      "O que de fato aconteceu? Como foi comparado à sua previsão?",
      "O que isso sugere sobre sua crença original?",
    ],
    duration: "15 min",
    fromAdjectives: ["medroso", "inseguro", "passivo", "evitativo", "limitado"],
    toAdjectives: ["corajoso", "confiante", "ativo", "protagonista", "crescendo"],
    icon: "zap",
  },
];

export const CURRENT_ADJECTIVES = [
  "ansioso", "inseguro", "impulsivo", "tímido", "pessimista",
  "procrastinador", "perfeccionista", "rígido", "passivo", "agitado",
  "solitário", "autocrítico", "distraído", "dependente", "conformado",
  "ressentido", "tenso", "evitativo", "desmotivado", "fechado",
  "culpado", "perdido", "vazio", "acelerado", "medroso",
];

export const FUTURE_ADJECTIVES = [
  "confiante", "calmo", "corajoso", "presente", "positivo",
  "determinado", "flexível", "ativo", "focado", "autêntico",
  "generoso", "equilibrado", "compassivo", "criativo", "sereno",
  "motivado", "livre", "protagonista", "realizado", "aberto",
  "grato", "paciente", "amoroso", "consciente", "crescendo",
];

export function getRelevantInterventions(
  currentAdjs: string[],
  futureAdjs: string[]
): Intervention[] {
  const scored = INTERVENTIONS.map((intervention) => {
    let score = 0;
    for (const adj of currentAdjs) {
      if (intervention.fromAdjectives.includes(adj)) score += 2;
    }
    for (const adj of futureAdjs) {
      if (intervention.toAdjectives.includes(adj)) score += 2;
    }
    return { intervention, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .map((s) => s.intervention);
}

export const THERAPY_COLORS: Record<Therapy, { bg: string; text: string }> = {
  TCC: { bg: "#E8F4FD", text: "#1A6B9A" },
  ACT: { bg: "#F0F9F4", text: "#1B6B5A" },
  Mindfulness: { bg: "#FDF5E8", text: "#8A5A1A" },
  "Psicologia Positiva": { bg: "#FDF0F8", text: "#8A1A6B" },
  "Terapia Narrativa": { bg: "#F5F0FD", text: "#5A1A8A" },
  "Focada em Compaixão": { bg: "#FDF0F0", text: "#8A1A1A" },
};
