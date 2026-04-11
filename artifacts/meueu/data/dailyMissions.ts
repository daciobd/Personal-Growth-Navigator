// ─── Daily Missions — New Catalog (18 micro-missions) ─────────────────────
// Source of truth for the Daily Loop mission library.
// Categories: action / reflection / alternative
// Origins: dbt / act
//
// Consumed via the adapter in features/daily-loop/data/missions.ts which
// re-shapes these into the legacy DailyMission type used by the UI and
// analytics layer (adds default difficulty="normal" and rewardXp=15).

export type DailyMission = {
  id: string;
  title: string;
  subtitle: string;
  category: "action" | "reflection" | "alternative";
  durationMin: number;
  steps: string[];
  origin: "dbt" | "act";
  sourceFlow: string;
  // Optional energy tag — used by getPersonalizedMission's energyLevel filter.
  // Currently no missions are tagged; the filter is a runtime no-op until
  // missions get this field populated.
  energy?: "low" | "medium";
};

export const missions: DailyMission[] = [
  // ─── DBT ─────────────────────────────────────────────────────────────
  {
    id: "dbt-aceitacao-notar",
    title: "Notar o que estou empurrando",
    subtitle: "1 minuto pra reconhecer a resistência",
    category: "reflection",
    durationMin: 1,
    origin: "dbt",
    sourceFlow: "Aceitação Radical",
    steps: [
      "Qual realidade você está resistindo agora? Só observe — não tente resolver, não tente mudar.",
      'Diga pra si mesmo, no seu ritmo: "Essa é a realidade agora. Não preciso gostar. Mas posso parar de lutar contra ela."',
    ],
  },
  {
    id: "dbt-aceitacao-corpo",
    title: 'Relaxar o "não"',
    subtitle: "Deixa o corpo soltar um pouco",
    category: "action",
    durationMin: 2,
    origin: "dbt",
    sourceFlow: "Aceitação Radical",
    steps: [
      "Solte os ombros, a mandíbula, as mãos. Só um pouco.",
      'Deixe o corpo dizer um pequeno "sim" à realidade por alguns segundos. Sem forçar nada.',
      "A mente vai voltar a resistir, e isso é normal. Voltar pro corpo de novo já é a prática.",
    ],
  },
  {
    id: "dbt-redirecionar-presa",
    title: "Onde a mente está presa?",
    subtitle: "Nomear o loop que não sai",
    category: "reflection",
    durationMin: 1,
    origin: "dbt",
    sourceFlow: "Turning the Mind",
    steps: [
      "Que pensamento ou sentimento continua voltando? Só reconheça — sem querer mudar.",
      'A mente está em modo de luta? De "isso não deveria ser assim"? Só nomeie essa posição, sem julgar.',
    ],
  },
  {
    id: "dbt-redirecionar-espaco",
    title: "Um segundo de espaço",
    subtitle: "Redirecionar sem fugir",
    category: "alternative",
    durationMin: 2,
    origin: "dbt",
    sourceFlow: "Turning the Mind",
    steps: [
      "Escolha conscientemente mover a atenção pra algo presente: sua respiração, o peso do corpo na cadeira, um som próximo, o ar na pele.",
      "Não é pra escapar. É pra criar um segundo de espaço gentil antes de voltar ao difícil.",
      "Quando a mente voltar a puxar, redirecione de novo. Isso é treino, não estado permanente.",
    ],
  },
  {
    id: "dbt-willingness-passo",
    title: "O menor passo possível",
    subtitle: "Não precisa ter vontade pra escolher",
    category: "action",
    durationMin: 2,
    origin: "dbt",
    sourceFlow: "Willingness vs Willfulness",
    steps: [
      'Nomeie a resistência: "Estou sentindo resistência pra ___." Reconhecer já é o primeiro movimento.',
      "Pergunte com gentileza: se eu colocasse a resistência de lado por um instante, qual seria o menor passo alinhado com algo que importa pra mim?",
      "Escolha esse passo agora. Uma ação de 2 minutos, uma palavra, um gesto. Não amanhã. Agora.",
    ],
  },
  {
    id: "dbt-oposta-nomear",
    title: "O que a emoção está pedindo?",
    subtitle: "Nomear o impulso sem agir nele",
    category: "reflection",
    durationMin: 1,
    origin: "dbt",
    sourceFlow: "Opposite Action",
    steps: [
      "Observe o que a emoção está pedindo agora. Isolamento? Ataque? Fuga? Só nomeie o impulso.",
      "Você não precisa agir nele pra reconhecer. Nomear já cria um pouco de espaço.",
    ],
  },
  {
    id: "dbt-oposta-passo",
    title: "Ir pro outro lado, devagar",
    subtitle: "Um micro-passo na direção contrária",
    category: "action",
    durationMin: 2,
    origin: "dbt",
    sourceFlow: "Opposite Action",
    steps: [
      "Considere uma ação oposta suave — não o oposto extremo, só um passo na direção contrária ao impulso.",
      "Ansiedade pedindo isolamento: uma mensagem curta pra alguém. Vergonha pedindo fuga: ficar presente por mais 2 minutos. Raiva pedindo ataque: respirar e esperar 10 segundos.",
      "Escolha uma dessas. Uma versão pequena já conta.",
    ],
  },
  {
    id: "dbt-checar-historia",
    title: "Qual é a história que minha mente tá contando?",
    subtitle: "Separar o fato da interpretação",
    category: "alternative",
    durationMin: 2,
    origin: "dbt",
    sourceFlow: "Checking the Facts",
    steps: [
      'Nomeie o pensamento: "Minha mente está dizendo que ___." Não é verdade automática. É uma interpretação.',
      "Isso é baseado em fatos que qualquer pessoa poderia confirmar? Ou tem suposição, leitura de mente, cenário do pior misturados?",
      "Existe uma leitura mais neutra que também se encaixa nos fatos? Não é negar o que você sente. É criar espaço entre o fato e a história.",
    ],
  },
  {
    id: "dbt-surfar-onda",
    title: "Surfar a onda da vontade",
    subtitle: "A vontade é uma onda, não é você",
    category: "reflection",
    durationMin: 3,
    origin: "dbt",
    sourceFlow: "Urge Surfing",
    steps: [
      "Perceba a vontade chegando. Onde ela aparece no corpo — barriga, peito, garganta? Só observe, sem julgar.",
      "Respire devagar. A cada expiração, imagine que você está equilibrado — sem ser arrastado. Você não é a vontade. Você é quem observa.",
      "Vontades fortes em geral duram menos de 20 minutos quando você não as alimenta e nem luta contra. A onda passa.",
    ],
  },
  {
    id: "dbt-accepts-menu",
    title: "Escolher um respiro pro sistema",
    subtitle: "Sete jeitos rápidos de regular o estado",
    category: "alternative",
    durationMin: 3,
    origin: "dbt",
    sourceFlow: "ACCEPTS",
    steps: [
      "Escolha uma destas sete: Atividade (algo que absorva a atenção), Contribuir (um gesto pequeno por alguém), Comparar (lembrar um momento difícil que você já superou), Emoção diferente (música, algo engraçado), Afastar (colocar o pensamento numa caixinha imaginária), Pensamento alternativo (contar de 3 em 3 até 100), Sensação física (gelo no pulso, água fria no rosto, chá morno).",
      "Faça a versão mais simples da que escolheu. Um minuto já conta.",
      "Não é pra resolver nada. É só dar um respiro ao sistema nervoso.",
    ],
  },

  // ─── ACT ─────────────────────────────────────────────────────────────
  {
    id: "act-defusao-frase",
    title: "Estou tendo o pensamento de que…",
    subtitle: "Mudar a frase, mudar a relação",
    category: "reflection",
    durationMin: 1,
    origin: "act",
    sourceFlow: "Cognitive Defusion",
    steps: [
      'Note um pensamento difícil. Em vez de "vou falhar", experimente "estou tendo o pensamento de que vou falhar".',
      "Só adicionar essa frase já cria espaço entre você e o pensamento. Você não é ele. Você é quem observa.",
    ],
  },
  {
    id: "act-defusao-nuvens",
    title: "Nuvens passando",
    subtitle: "Observar sem segurar nem empurrar",
    category: "reflection",
    durationMin: 2,
    origin: "act",
    sourceFlow: "Cognitive Defusion",
    steps: [
      "Escolha um pensamento que está difícil. Imagine ele como uma nuvem passando, ou uma folha flutuando num rio.",
      "Ele aparece, passa pela sua visão, segue em frente. Você não precisa segurar nem empurrar.",
      "Pensamentos são eventos mentais, não fatos. Ter um pensamento difícil não significa que ele é verdade.",
    ],
  },
  {
    id: "act-valores-area",
    title: "O que importa nessa parte da minha vida?",
    subtitle: "Clarificar um valor sem cobrança",
    category: "reflection",
    durationMin: 2,
    origin: "act",
    sourceFlow: "Values",
    steps: [
      "Escolha uma área que está ocupando sua mente hoje — relacionamento, trabalho, saúde, como você quer ser pra si mesmo.",
      "Com curiosidade, sem julgamento: o que realmente importa pra você nessa área? Não o que deveria importar. O que de fato importa.",
      "Nomeie uma ou duas qualidades que você quer viver ali: presença, gentileza, coragem, honestidade, conexão…",
    ],
  },
  {
    id: "act-valores-semana",
    title: "Onde já agi alinhado esta semana?",
    subtitle: "Notar o que já conta",
    category: "reflection",
    durationMin: 1,
    origin: "act",
    sourceFlow: "Values",
    steps: [
      "Pense num valor que importa pra você agora.",
      "Nesta última semana, teve algum momento — mesmo mínimo — em que você agiu alinhado com ele?",
      "Não é pra julgar o que deixou de fazer. É só pra notar que esse movimento já conta, e não desaparece mesmo num dia pesado.",
    ],
  },
  {
    id: "act-acao-passo-hoje",
    title: "Um passo que cabe hoje",
    subtitle: "A menor ação alinhada com o que importa",
    category: "action",
    durationMin: 2,
    origin: "act",
    sourceFlow: "Committed Action",
    steps: [
      "Escolha um valor que importa. Qual é a menor ação possível alinhada com ele que você pode fazer hoje?",
      'Pode ser uma mensagem, uma pausa consciente, um "não" gentil, um "sim" verdadeiro. Um passo só.',
      "Não amanhã. Não quando tiver vontade. Hoje.",
    ],
  },
  {
    id: "act-acao-com-desconforto",
    title: "Agir com o desconforto junto",
    subtitle: "Não precisa resolver o incômodo antes",
    category: "action",
    durationMin: 2,
    origin: "act",
    sourceFlow: "Committed Action",
    steps: [
      "Tem um desconforto — cansaço, incerteza, resistência — que tem te impedido de agir na direção do que importa?",
      "Não precisa resolver esse desconforto agora. Reconheça que ele está lá e se mova mesmo assim. Leva ele junto.",
      "Faça o passo pequeno agora. O movimento em direção ao valor já é o valor em ação.",
    ],
  },

  // ─── Alternative fillers (approved by spec) ──────────────────────────
  {
    id: "alt-diminuir-pressao",
    title: "Diminuir a pressão",
    subtitle: "Aliviar o peso de fazer perfeito agora",
    category: "alternative",
    durationMin: 1,
    origin: "act",
    sourceFlow: "Committed Action",
    steps: [
      "Perceba onde você está se cobrando",
      "Pergunte: isso precisa ser perfeito agora?",
      "Escolha fazer de forma mais leve",
    ],
  },
  {
    id: "alt-dar-espaco",
    title: "Dar um espaço",
    subtitle: "Ver a situação com um pouco mais de distância",
    category: "alternative",
    durationMin: 1,
    origin: "act",
    sourceFlow: "Cognitive Defusion",
    steps: [
      "Dê um passo para trás mentalmente",
      "Imagine isso com um pouco mais de distância",
      "Veja o que muda",
    ],
  },
];

// ─── Selection helpers ────────────────────────────────────────────────

export function getMissionsByCategory(category: DailyMission["category"]) {
  return missions.filter((m) => m.category === category);
}

type Checkin = {
  mood?: "stuck" | "confused" | "anxious" | string;
};

function pickRandom(category: DailyMission["category"]) {
  const pool = getMissionsByCategory(category);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getDailyMission(checkin: Checkin) {
  if (checkin.mood === "stuck") return pickRandom("action");
  if (checkin.mood === "confused") return pickRandom("reflection");
  if (checkin.mood === "anxious") return pickRandom("alternative");
  return pickRandom("reflection");
}

// ─── Personalized selection (V2) ─────────────────────────────────────
// Brings the catalog mood vocabulary, deduplication by recent IDs, and an
// optional energy-level filter. Returns undefined when nothing matches —
// callers should fall back to the simpler chooseMission/getDailyMission.

type CatalogMood = "stuck" | "confused" | "anxious";

const MOOD_MAP: Record<string, CatalogMood> = {
  overwhelmed: "anxious",
  anxious: "anxious",
  neutral: "confused",
  good: "confused",
  motivated: "stuck",
};

export function normalizeMood(mood: string): CatalogMood {
  return MOOD_MAP[mood] ?? "confused";
}

export function getPersonalizedMission(params: {
  mood?: string;
  energyLevel?: "low" | "medium";
  recentMissionIds?: string[];
}): DailyMission | undefined {
  const { mood, energyLevel, recentMissionIds = [] } = params;

  let category: DailyMission["category"];
  if (mood === "stuck") category = "action";
  else if (mood === "confused") category = "reflection";
  else if (mood === "anxious") category = "alternative";
  else category = "reflection";

  const fullPool = getMissionsByCategory(category);
  const recentSet = new Set(recentMissionIds);
  const freshPool = fullPool.filter((m) => !recentSet.has(m.id));
  let pool = freshPool.length > 0 ? freshPool : fullPool;

  if (energyLevel === "low") {
    const lowEnergyPool = pool.filter((m) => m.energy === "low");
    if (lowEnergyPool.length > 0) pool = lowEnergyPool;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}
