// ─── Guided Practice Steps ──────────────────────────────────────────────────
// Each step = one screen, one action. No explanations. Just guidance.
//
// Step 0 is the intro — not counted in the progress indicator.
// Steps 1–6 are the practice. Progress shows "Passo 1 de 6".

export type GuidedStep = {
  id: number;
  text: string;
  subtitle?: string;
  helper?: string;
  cta: string;
  secondaryCta?: string;
};

export const GUIDED_STEPS: GuidedStep[] = [
  {
    id: 0,
    text: "Sua primeira prática começa agora",
    subtitle: "Leva menos de 2 minutos.\nEu vou te guiar passo a passo.",
    cta: "Começar",
  },
  {
    id: 1,
    text: "Antes de começar, só desacelera um pouco.",
    helper: "Não precisa fazer perfeito. Só seguir.",
    cta: "Ok",
  },
  {
    id: 2,
    text: "Pense em algo que te incomodou hoje.",
    helper: "Pode ser pequeno. Não precisa ser algo grande.",
    cta: "Já pensei",
  },
  {
    id: 3,
    text: "Por alguns segundos, só note esse pensamento aí.",
    helper: "Não precisa mudar nada. Só perceber que ele está ali.",
    cta: "Ok",
  },
  {
    id: 4,
    text: "Você percebeu que conseguiu parar por um momento?",
    cta: "Sim",
  },
  {
    id: 5,
    text: "Isso já é prática.",
    helper: "Se pareceu simples, é porque era para ser simples.",
    cta: "Continuar",
  },
  {
    id: 6,
    text: "É assim que começa.",
    helper: "Amanhã vai parecer ainda mais natural.",
    cta: "Finalizar",
    secondaryCta: "Fazer de novo",
  },
];

export const TOTAL_STEPS = GUIDED_STEPS.length;

// Number of practice steps (excluding intro)
export const PRACTICE_STEPS = TOTAL_STEPS - 1;
