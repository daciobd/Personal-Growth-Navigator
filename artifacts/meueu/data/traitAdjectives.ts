// artifacts/meueu/data/traitAdjectives.ts
//
// Adjetivos de TRAÇO — descrevem padrões estáveis de personalidade.
// Pergunta-guia: "Como você tende a ser na maioria das situações?"
// Usados para estimar o Big Five via adjectiveBig5Map.
//
// Baseados nos marcadores de Goldberg (1992) traduzidos e validados
// para o português brasileiro por Nunes et al. (2010).

export type TraitAdj = {
  text: string;
  pole: "high" | "low";   // high = traço presente, low = traço ausente/oposto
  valence: "positive" | "negative" | "neutral";
  category: "neuroticismo" | "extroversao" | "abertura" | "amabilidade" | "conscienciosidade";
  example?: string;       // exemplo contextual para clareza
};

export const TRAIT_ADJECTIVES: TraitAdj[] = [

  // ── NEUROTICISMO ────────────────────────────────────────────────────────
  // Alto N (instabilidade emocional)
  { text: "ansioso",        pole:"high", valence:"negative", category:"neuroticismo",         example:"Preocupo-me com muitas coisas" },
  { text: "tenso",          pole:"high", valence:"negative", category:"neuroticismo" },
  { text: "emotivo",        pole:"high", valence:"neutral",  category:"neuroticismo",         example:"Sinto as emoções com intensidade" },
  { text: "temperamental",  pole:"high", valence:"negative", category:"neuroticismo" },
  { text: "autocrítico",    pole:"high", valence:"negative", category:"neuroticismo",         example:"Cobro muito de mim mesmo" },
  { text: "sensível",       pole:"high", valence:"neutral",  category:"neuroticismo",         example:"Afeto-me facilmente com críticas" },
  { text: "impulsivo",      pole:"high", valence:"negative", category:"neuroticismo" },
  { text: "inseguro",       pole:"high", valence:"negative", category:"neuroticismo" },
  // Baixo N (estabilidade emocional)
  { text: "calmo",          pole:"low",  valence:"positive", category:"neuroticismo",         example:"Raramente fico perturbado" },
  { text: "equilibrado",    pole:"low",  valence:"positive", category:"neuroticismo" },
  { text: "sereno",         pole:"low",  valence:"positive", category:"neuroticismo" },
  { text: "resiliente",     pole:"low",  valence:"positive", category:"neuroticismo",         example:"Me recupero rápido de dificuldades" },
  { text: "estável",        pole:"low",  valence:"positive", category:"neuroticismo" },

  // ── EXTROVERSÃO ─────────────────────────────────────────────────────────
  // Alta E
  { text: "sociável",       pole:"high", valence:"positive", category:"extroversao",          example:"Gosto de estar com pessoas" },
  { text: "falante",        pole:"high", valence:"neutral",  category:"extroversao" },
  { text: "animado",        pole:"high", valence:"positive", category:"extroversao" },
  { text: "assertivo",      pole:"high", valence:"positive", category:"extroversao",          example:"Me posiciono com facilidade" },
  { text: "energético",     pole:"high", valence:"positive", category:"extroversao" },
  { text: "entusiasmado",   pole:"high", valence:"positive", category:"extroversao" },
  { text: "expansivo",      pole:"high", valence:"neutral",  category:"extroversao" },
  // Baixa E
  { text: "reservado",      pole:"low",  valence:"neutral",  category:"extroversao",          example:"Prefiro grupos pequenos" },
  { text: "quieto",         pole:"low",  valence:"neutral",  category:"extroversao" },
  { text: "introspectivo",  pole:"low",  valence:"positive", category:"extroversao",          example:"Gosto de tempo a sós para refletir" },
  { text: "tímido",         pole:"low",  valence:"negative", category:"extroversao" },
  { text: "independente",   pole:"low",  valence:"positive", category:"extroversao",          example:"Prefiro trabalhar sozinho" },

  // ── ABERTURA ────────────────────────────────────────────────────────────
  // Alta O
  { text: "criativo",       pole:"high", valence:"positive", category:"abertura" },
  { text: "curioso",        pole:"high", valence:"positive", category:"abertura",             example:"Gosto de aprender coisas novas" },
  { text: "imaginativo",    pole:"high", valence:"positive", category:"abertura" },
  { text: "reflexivo",      pole:"high", valence:"positive", category:"abertura",             example:"Gosto de pensar sobre ideias complexas" },
  { text: "artístico",      pole:"high", valence:"positive", category:"abertura" },
  { text: "filosófico",     pole:"high", valence:"neutral",  category:"abertura" },
  { text: "aberto",         pole:"high", valence:"positive", category:"abertura",             example:"Aceito bem perspectivas diferentes" },
  // Baixa O
  { text: "prático",        pole:"low",  valence:"positive", category:"abertura",             example:"Prefiro o concreto ao teórico" },
  { text: "convencional",   pole:"low",  valence:"neutral",  category:"abertura" },
  { text: "objetivo",       pole:"low",  valence:"positive", category:"abertura",             example:"Foco em resultados tangíveis" },
  { text: "rotineiro",      pole:"low",  valence:"neutral",  category:"abertura",             example:"Prefiro estabilidade a novidades" },

  // ── AMABILIDADE ─────────────────────────────────────────────────────────
  // Alta A
  { text: "empático",       pole:"high", valence:"positive", category:"amabilidade",          example:"Entendo facilmente o que os outros sentem" },
  { text: "caloroso",       pole:"high", valence:"positive", category:"amabilidade" },
  { text: "generoso",       pole:"high", valence:"positive", category:"amabilidade" },
  { text: "cooperativo",    pole:"high", valence:"positive", category:"amabilidade" },
  { text: "confiante",      pole:"high", valence:"positive", category:"amabilidade",          example:"Acredito na boa intenção das pessoas" },
  { text: "compreensivo",   pole:"high", valence:"positive", category:"amabilidade" },
  { text: "paciente",       pole:"high", valence:"positive", category:"amabilidade" },
  // Baixa A
  { text: "direto",         pole:"low",  valence:"neutral",  category:"amabilidade",          example:"Digo o que penso sem rodeios" },
  { text: "competitivo",    pole:"low",  valence:"neutral",  category:"amabilidade" },
  { text: "cético",         pole:"low",  valence:"neutral",  category:"amabilidade",          example:"Questiono intenções e afirmações" },
  { text: "exigente",       pole:"low",  valence:"neutral",  category:"amabilidade",          example:"Tenho padrões altos para mim e outros" },
  { text: "independente",   pole:"low",  valence:"positive", category:"amabilidade",          example:"Priorizo minhas próprias necessidades" },

  // ── CONSCIENCIOSIDADE ───────────────────────────────────────────────────
  // Alta C
  { text: "organizado",     pole:"high", valence:"positive", category:"conscienciosidade" },
  { text: "disciplinado",   pole:"high", valence:"positive", category:"conscienciosidade" },
  { text: "responsável",    pole:"high", valence:"positive", category:"conscienciosidade" },
  { text: "persistente",    pole:"high", valence:"positive", category:"conscienciosidade",    example:"Continuo mesmo quando é difícil" },
  { text: "meticuloso",     pole:"high", valence:"neutral",  category:"conscienciosidade",    example:"Presto atenção em detalhes" },
  { text: "planejador",     pole:"high", valence:"positive", category:"conscienciosidade" },
  { text: "pontual",        pole:"high", valence:"positive", category:"conscienciosidade" },
  // Baixa C
  { text: "espontâneo",     pole:"low",  valence:"positive", category:"conscienciosidade",    example:"Prefiro agir sem planejar muito" },
  { text: "flexível",       pole:"low",  valence:"positive", category:"conscienciosidade",    example:"Adapto planos conforme necessário" },
  { text: "desorganizado",  pole:"low",  valence:"negative", category:"conscienciosidade" },
  { text: "procrastinador", pole:"low",  valence:"negative", category:"conscienciosidade",    example:"Adio tarefas importantes" },
  { text: "impulsivo",      pole:"low",  valence:"negative", category:"conscienciosidade",    example:"Ajo sem pensar nas consequências" },
];

// ── Adjetivos de ESTADO ──────────────────────────────────────────────────
// Descrevem como a pessoa está se sentindo AGORA (última semana/mês).
// Pergunta-guia: "Como você tem se sentido ultimamente?"
// Estes NÃO são usados para estimar Big Five — alimentam o contexto do plano.

export type StateAdj = {
  text: string;
  valence: "positive" | "negative";
  domain: "emocional" | "energia" | "relacoes" | "proposito" | "corpo";
};

export const STATE_ADJECTIVES: StateAdj[] = [
  // Emocional negativo
  { text: "ansioso",        valence:"negative", domain:"emocional" },
  { text: "triste",         valence:"negative", domain:"emocional" },
  { text: "irritado",       valence:"negative", domain:"emocional" },
  { text: "sobrecarregado", valence:"negative", domain:"emocional" },
  { text: "vazio",          valence:"negative", domain:"emocional" },
  { text: "confuso",        valence:"negative", domain:"emocional" },
  { text: "culpado",        valence:"negative", domain:"emocional" },
  { text: "frustrado",      valence:"negative", domain:"emocional" },
  { text: "entorpecido",    valence:"negative", domain:"emocional" },
  { text: "inquieto",       valence:"negative", domain:"emocional" },
  // Emocional positivo
  { text: "tranquilo",      valence:"positive", domain:"emocional" },
  { text: "grato",          valence:"positive", domain:"emocional" },
  { text: "esperançoso",    valence:"positive", domain:"emocional" },
  { text: "alegre",         valence:"positive", domain:"emocional" },
  { text: "satisfeito",     valence:"positive", domain:"emocional" },
  // Energia negativo
  { text: "esgotado",       valence:"negative", domain:"energia" },
  { text: "desmotivado",    valence:"negative", domain:"energia" },
  { text: "apático",        valence:"negative", domain:"energia" },
  { text: "travado",        valence:"negative", domain:"energia" },
  { text: "lento",          valence:"negative", domain:"energia" },
  // Energia positivo
  { text: "energizado",     valence:"positive", domain:"energia" },
  { text: "focado",         valence:"positive", domain:"energia" },
  { text: "motivado",       valence:"positive", domain:"energia" },
  { text: "produtivo",      valence:"positive", domain:"energia" },
  { text: "fluindo",        valence:"positive", domain:"energia" },
  // Relações negativo
  { text: "isolado",        valence:"negative", domain:"relacoes" },
  { text: "incompreendido", valence:"negative", domain:"relacoes" },
  { text: "desconectado",   valence:"negative", domain:"relacoes" },
  { text: "ressentido",     valence:"negative", domain:"relacoes" },
  // Relações positivo
  { text: "conectado",      valence:"positive", domain:"relacoes" },
  { text: "amado",          valence:"positive", domain:"relacoes" },
  { text: "apoiado",        valence:"positive", domain:"relacoes" },
  // Propósito negativo
  { text: "perdido",        valence:"negative", domain:"proposito" },
  { text: "sem propósito",  valence:"negative", domain:"proposito" },
  { text: "estagnado",      valence:"negative", domain:"proposito" },
  { text: "insatisfeito",   valence:"negative", domain:"proposito" },
  // Propósito positivo
  { text: "alinhado",       valence:"positive", domain:"proposito" },
  { text: "crescendo",      valence:"positive", domain:"proposito" },
  { text: "realizado",      valence:"positive", domain:"proposito" },
  // Corpo
  { text: "tenso",          valence:"negative", domain:"corpo" },
  { text: "cansado",        valence:"negative", domain:"corpo" },
  { text: "leve",           valence:"positive", domain:"corpo" },
  { text: "presente",       valence:"positive", domain:"corpo" },
];
