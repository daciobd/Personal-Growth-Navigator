// ─── Daily Practice Variations ──────────────────────────────────────────────
// 5 variations, cycled by day number. Each has 3-4 action steps.
// Completion step is appended automatically.
// Step 3 text is subject to A/B experiment "guided_step3_copy".

import type { GuidedStep } from "@/features/guided-practice/data/guidedSteps";
import { getExperimentVariant, type Variant } from "@/utils/experiments";

export type DailyPractice = {
  id: number;
  steps: GuidedStep[];
};

const PRACTICES: DailyPractice[] = [
  {
    id: 0,
    steps: [
      { id: 1, text: "Pare por um instante.", helper: "Só isso por agora.", cta: "Ok" },
      { id: 2, text: "Pense em algo que te incomodou hoje.", helper: "Pode ser pequeno.", cta: "Já pensei" },
      { id: 3, text: "", helper: "", cta: "Ok" }, // filled by experiment
      { id: 4, text: "Pronto. Você fez.", cta: "Continuar" },
    ],
  },
  {
    id: 1,
    steps: [
      { id: 1, text: "Pare por alguns segundos.", helper: "Não precisa de mais que isso.", cta: "Ok" },
      { id: 2, text: "Note um pensamento que apareceu agora.", helper: "Qualquer um. O primeiro que vier.", cta: "Já notei" },
      { id: 3, text: "", helper: "", cta: "Ok" },
      { id: 4, text: "Isso já conta.", cta: "Continuar" },
    ],
  },
  {
    id: 2,
    steps: [
      { id: 1, text: "Respira um pouco.", helper: "Devagar. Sem pressa.", cta: "Ok" },
      { id: 2, text: "Observe algo que você está evitando.", helper: "Não precisa agir sobre isso.", cta: "Já pensei" },
      { id: 3, text: "", helper: "", cta: "Ok" },
      { id: 4, text: "Você apareceu.", cta: "Continuar" },
    ],
  },
  {
    id: 3,
    steps: [
      { id: 1, text: "Desacelera.", cta: "Ok" },
      { id: 2, text: "Pense em uma coisa que está pendente.", helper: "Só uma. A primeira que vier.", cta: "Já pensei" },
      { id: 3, text: "", helper: "", cta: "Ok" },
      { id: 4, text: "Perceber já é agir.", cta: "Continuar" },
    ],
  },
  {
    id: 4,
    steps: [
      { id: 1, text: "Para um segundo.", helper: "Literalmente. Um segundo.", cta: "Ok" },
      { id: 2, text: "O que está na sua cabeça agora?", helper: "Não filtre. Pode ser qualquer coisa.", cta: "Já sei" },
      { id: 3, text: "", helper: "", cta: "Ok" },
      { id: 4, text: "Você acabou de praticar.", cta: "Continuar" },
    ],
  },
];

// ─── Step 3 experiment variants ─────────────────────────────────────────────

const STEP3_VARIANTS: Record<Variant, { text: string; helper: string }> = {
  A: {
    text: "Só note esse pensamento aí.",
    helper: "Não precisa resolver nada.",
  },
  B: {
    text: "Por alguns segundos, só note isso aí.",
    helper: "Não precisa mudar nada.",
  },
  C: {
    text: "Fica com esse pensamento por um instante, como se estivesse só olhando para ele.",
    helper: "",
  },
};

function applyStep3Variant(steps: GuidedStep[], variant: Variant): GuidedStep[] {
  const { text, helper } = STEP3_VARIANTS[variant];
  return steps.map((s) =>
    s.id === 3 ? { ...s, text, helper: helper || undefined } : s
  );
}

// ─── Completion step ────────────────────────────────────────────────────────

export const COMPLETION_STEP: GuidedStep = {
  id: 99,
  text: "Você apareceu hoje.",
  helper: "Pequeno, mas consistente.",
  cta: "Continuar",
};

// ─── Selection (async — resolves experiment) ────────────────────────────────

export function getDailyPractice(dayNumber: number): DailyPractice {
  const idx = dayNumber % PRACTICES.length;
  return PRACTICES[idx];
}

export async function getDailySteps(dayNumber: number): Promise<GuidedStep[]> {
  const practice = getDailyPractice(dayNumber);
  const variant = await getExperimentVariant("guided_step3_copy");
  const steps = applyStep3Variant(practice.steps, variant);
  return [...steps, COMPLETION_STEP];
}
