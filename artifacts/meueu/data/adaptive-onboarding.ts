// ─── Adaptive Onboarding Configuration ───────────────────────────────────────
// All mappings for the 3-step adaptive onboarding flow:
// current_primary_issue → current_deep_dive → adaptive_frequency

export type PrimaryStruggleId =
  | "start"
  | "continue"
  | "focus"
  | "organize"
  | "understand"
  | "cant_explain";

export type DeepDiveId =
  | "waiting_motivation"
  | "too_big_procrastinate"
  | "perfectionism_freeze"
  | "dont_know_first_step"
  | "lose_steam_midway"
  | "get_bored_easily"
  | "no_clear_progress"
  | "low_energy"
  | "distracted_by_everything"
  | "jump_between_tasks"
  | "cant_filter_priorities"
  | "hyperfocus_wrong_thing"
  | "too_many_options"
  | "conflicting_priorities"
  | "no_system_or_routine"
  | "forget_tasks"
  | "no_clarity_on_goals"
  | "overwhelmed_by_info"
  | "analysis_paralysis"
  | "need_external_validation"
  | "emotional_fog"
  | "avoidance_without_reason"
  | "guilt_and_shame_loop"
  | "feel_stuck_inside";

export type FrequencyId =
  | "almost_every_day"
  | "few_times_a_week"
  | "once_in_a_while";

export type InferredTag =
  | "activation_friction"
  | "attention_scatter"
  | "priority_confusion"
  | "perfectionism"
  | "overwhelm"
  | "emotional_resistance"
  | "low_energy"
  | "lack_of_system"
  | "goal_ambiguity"
  | "validation_dependency";

// ─── Primary Issue Options ───────────────────────────────────────────────────

export type PrimaryOption = {
  id: PrimaryStruggleId;
  label: string;
  icon: string;
};

export const PRIMARY_OPTIONS: PrimaryOption[] = [
  { id: "start", label: "Começar", icon: "play-circle" },
  { id: "continue", label: "Continuar", icon: "fast-forward" },
  { id: "focus", label: "Focar", icon: "crosshair" },
  { id: "organize", label: "Me organizar", icon: "layers" },
  { id: "understand", label: "Entender o que fazer", icon: "help-circle" },
  { id: "cant_explain", label: "Nem sei explicar", icon: "cloud" },
];

// ─── Deep Dive Mapping ──────────────────────────────────────────────────────

export type DeepDiveOption = {
  id: DeepDiveId;
  label: string;
  icon: string;
};

export type DeepDiveConfig = {
  question: string;
  options: DeepDiveOption[];
};

export const DEEP_DIVE_MAP: Record<PrimaryStruggleId, DeepDiveConfig> = {
  start: {
    question: "O que mais acontece quando você vai começar?",
    options: [
      { id: "waiting_motivation", label: "Fico esperando motivação", icon: "pause-circle" },
      { id: "too_big_procrastinate", label: "Parece grande demais e eu travo", icon: "maximize" },
      { id: "perfectionism_freeze", label: "Tenho medo de não fazer perfeito", icon: "shield" },
      { id: "dont_know_first_step", label: "Não sei por onde começar", icon: "map-pin" },
    ],
  },
  continue: {
    question: "O que acontece quando você tenta continuar?",
    options: [
      { id: "lose_steam_midway", label: "Perco o gás no meio do caminho", icon: "battery" },
      { id: "get_bored_easily", label: "Canso rápido e mudo de foco", icon: "zap-off" },
      { id: "no_clear_progress", label: "Não vejo progresso claro", icon: "trending-down" },
      { id: "low_energy", label: "Falta energia ou disposição", icon: "moon" },
    ],
  },
  focus: {
    question: "Como a falta de foco aparece pra você?",
    options: [
      { id: "distracted_by_everything", label: "Me distraio com qualquer coisa", icon: "bell" },
      { id: "jump_between_tasks", label: "Pulo de tarefa em tarefa", icon: "shuffle" },
      { id: "cant_filter_priorities", label: "Não consigo filtrar o que importa", icon: "filter" },
      { id: "hyperfocus_wrong_thing", label: "Foco demais no que não devia", icon: "target" },
    ],
  },
  organize: {
    question: "Qual é o maior problema na sua organização?",
    options: [
      { id: "too_many_options", label: "Muita coisa pra fazer, sem ordem", icon: "list" },
      { id: "conflicting_priorities", label: "Prioridades que se contradizem", icon: "git-merge" },
      { id: "no_system_or_routine", label: "Não tenho sistema ou rotina", icon: "grid" },
      { id: "forget_tasks", label: "Esqueço o que preciso fazer", icon: "alert-circle" },
    ],
  },
  understand: {
    question: "O que mais te confunde sobre o que fazer?",
    options: [
      { id: "no_clarity_on_goals", label: "Não tenho clareza dos meus objetivos", icon: "compass" },
      { id: "overwhelmed_by_info", label: "Informação demais, clareza de menos", icon: "inbox" },
      { id: "analysis_paralysis", label: "Analiso demais e não decido", icon: "loader" },
      { id: "need_external_validation", label: "Preciso que alguém me diga o que fazer", icon: "users" },
    ],
  },
  cant_explain: {
    question: "Qual dessas frases mais combina com você?",
    options: [
      { id: "emotional_fog", label: "Sinto uma névoa mental", icon: "cloud" },
      { id: "avoidance_without_reason", label: "Evito coisas sem saber por quê", icon: "x-circle" },
      { id: "guilt_and_shame_loop", label: "Fico num ciclo de culpa", icon: "repeat" },
      { id: "feel_stuck_inside", label: "Me sinto preso por dentro", icon: "lock" },
    ],
  },
};

// ─── Frequency Options ──────────────────────────────────────────────────────

export type FrequencyOption = {
  id: FrequencyId;
  label: string;
  icon: string;
};

export const FREQUENCY_OPTIONS: FrequencyOption[] = [
  { id: "almost_every_day", label: "Quase todo dia", icon: "sun" },
  { id: "few_times_a_week", label: "Algumas vezes na semana", icon: "calendar" },
  { id: "once_in_a_while", label: "De vez em quando", icon: "cloud" },
];

// ─── Tag Inference ──────────────────────────────────────────────────────────

const PRIMARY_TAG_MAP: Partial<Record<PrimaryStruggleId, InferredTag>> = {
  start: "activation_friction",
  focus: "attention_scatter",
  organize: "priority_confusion",
  cant_explain: "emotional_resistance",
};

const DEEP_DIVE_TAG_MAP: Partial<Record<DeepDiveId, InferredTag>> = {
  perfectionism_freeze: "perfectionism",
  too_big_procrastinate: "overwhelm",
  low_energy: "low_energy",
  no_system_or_routine: "lack_of_system",
  forget_tasks: "lack_of_system",
  no_clarity_on_goals: "goal_ambiguity",
  overwhelmed_by_info: "overwhelm",
  analysis_paralysis: "overwhelm",
  need_external_validation: "validation_dependency",
  emotional_fog: "emotional_resistance",
  avoidance_without_reason: "emotional_resistance",
  guilt_and_shame_loop: "emotional_resistance",
  feel_stuck_inside: "emotional_resistance",
  waiting_motivation: "activation_friction",
  dont_know_first_step: "activation_friction",
  lose_steam_midway: "low_energy",
  get_bored_easily: "attention_scatter",
  no_clear_progress: "goal_ambiguity",
  distracted_by_everything: "attention_scatter",
  jump_between_tasks: "attention_scatter",
  cant_filter_priorities: "priority_confusion",
  hyperfocus_wrong_thing: "attention_scatter",
  too_many_options: "priority_confusion",
  conflicting_priorities: "priority_confusion",
};

export function inferTags(
  primary: PrimaryStruggleId,
  deepDive: DeepDiveId,
  _frequency: FrequencyId
): InferredTag[] {
  const tags = new Set<InferredTag>();

  const primaryTag = PRIMARY_TAG_MAP[primary];
  if (primaryTag) tags.add(primaryTag);

  const deepDiveTag = DEEP_DIVE_TAG_MAP[deepDive];
  if (deepDiveTag) tags.add(deepDiveTag);

  return Array.from(tags);
}

// ─── Adaptive Profile Type ──────────────────────────────────────────────────

export type AdaptiveProfile = {
  primaryStruggle: PrimaryStruggleId;
  deepDiveAnswer: DeepDiveId;
  patternFrequency: FrequencyId;
  inferredTags: InferredTag[];
};
