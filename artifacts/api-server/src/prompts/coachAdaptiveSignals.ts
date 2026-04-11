// ─── Coach Adaptive Signals ─────────────────────────────────────────────────
// V1 of the adaptive engine. Heuristic-based, no ML, no infra changes.
//
// Decides which option type (action / reflection / alternative) should
// receive priority in the LLM prompt and the deterministic fallback.
//
// IMPORTANT: this does NOT change the visual order of options in the UI.
// The UI always renders [action, reflection, alternative]. What changes
// is which one the model is asked to make most appealing.

import type { CoachOptionType } from "./coachPrompt.js";

// ─── Input signals ──────────────────────────────────────────────────────────

export type EmotionalState = "stuck" | "confused" | "emotional" | "calm";
export type CommitmentLevel = "yes" | "maybe" | "not_yet";

export type AdaptiveSignals = {
  /** Onboarding commitment answer (read from @meueu_onboarding_commitment). */
  onboardingCommitment?: CommitmentLevel;
  /** Inferred or explicit emotional state. */
  emotionalState?: EmotionalState;
  /** Recent click counts per option type (last N coach interactions). */
  recentClicksByType?: Partial<Record<CoachOptionType, number>>;
};

// ─── Decision output ────────────────────────────────────────────────────────

export type AdaptiveReason =
  | "ready_but_stuck"
  | "uncertain_and_confused"
  | "low_readiness_or_emotional"
  | "behavior_prefers_action"
  | "behavior_prefers_reflection"
  | "behavior_prefers_alternative"
  | "default_action";

export type AdaptiveDecision = {
  priorityType: CoachOptionType;
  reason: AdaptiveReason;
};

// ─── Decision rules (V1, intentionally simple and explicit) ────────────────

/**
 * Decide which option type should receive priority for the next Coach response.
 *
 * Rule precedence:
 *   1. Hard rules from explicit signals (commitment + mood combos)
 *   2. Behavior-based: pick the type with most recent clicks
 *   3. Default: action (the safest "do something" baseline)
 */
export function decidePriority(signals: AdaptiveSignals): AdaptiveDecision {
  const commitment = signals.onboardingCommitment;
  const mood = signals.emotionalState;
  const clicks = signals.recentClicksByType ?? {};

  // ─── Hard rules from explicit state ────────────────────────────
  if (commitment === "yes" && mood === "stuck") {
    return { priorityType: "action", reason: "ready_but_stuck" };
  }

  if (commitment === "maybe" && mood === "confused") {
    return { priorityType: "reflection", reason: "uncertain_and_confused" };
  }

  if (commitment === "not_yet" || mood === "emotional") {
    return { priorityType: "alternative", reason: "low_readiness_or_emotional" };
  }

  // ─── Behavior-based fallback ───────────────────────────────────
  const action = clicks.action ?? 0;
  const reflection = clicks.reflection ?? 0;
  const alternative = clicks.alternative ?? 0;

  if (action > 0 && action >= reflection && action >= alternative) {
    return { priorityType: "action", reason: "behavior_prefers_action" };
  }

  if (reflection > 0 && reflection >= action && reflection >= alternative) {
    return { priorityType: "reflection", reason: "behavior_prefers_reflection" };
  }

  if (alternative > 0 && alternative >= action && alternative >= reflection) {
    return { priorityType: "alternative", reason: "behavior_prefers_alternative" };
  }

  // ─── Default ───────────────────────────────────────────────────
  return { priorityType: "action", reason: "default_action" };
}

// ─── Prompt block builder ───────────────────────────────────────────────────

/**
 * Build the adaptive prompt block to inject into the system prompt.
 * Tells the LLM which type to make most appealing — but the LLM still
 * must return all 3 types. Only the framing/quality/concreteness shifts.
 */
export function buildAdaptivePromptBlock(decision: AdaptiveDecision): string {
  switch (decision.priorityType) {
    case "action":
      return `\n\nPRIORIDADE ADAPTATIVA — sinal: ${decision.reason}
Hoje priorize uma opção do tipo "action" especialmente concreta, fácil e com sensação de progresso imediato.
Ainda inclua uma "reflection" e uma "alternative", mas faça a "action" ser a mais atraente, executável e específica.
O label da action deve sugerir um passo de 1 minuto. O prompt da action deve indicar o primeiro movimento concreto.`;

    case "reflection":
      return `\n\nPRIORIDADE ADAPTATIVA — sinal: ${decision.reason}
Hoje priorize uma opção do tipo "reflection" que ajude a pessoa a entender melhor o que sente ou pensa.
Ainda inclua uma "action" e uma "alternative", mas faça a "reflection" ser a mais clara, acolhedora e útil.
O label da reflection deve soar como uma curiosidade gentil. O prompt deve abrir uma investigação interna simples.`;

    case "alternative":
      return `\n\nPRIORIDADE ADAPTATIVA — sinal: ${decision.reason}
Hoje priorize uma opção do tipo "alternative" que reduza pressão e ofereça suavidade.
Ainda inclua uma "action" e uma "reflection", mas faça a "alternative" parecer a mais segura para continuar.
O label da alternative não deve cobrar nada. O prompt deve abrir um caminho mais leve, sem exigência de resultado.`;
  }
}

// ─── Adaptive fallback ─────────────────────────────────────────────────────
// When the LLM fails completely, the deterministic fallback also respects
// the priority — the prioritized type gets a slightly stronger label and
// the message reflects the priority's tone.

import {
  FALLBACK_BY_TYPE,
  type CoachOption,
  type CoachStructuredResponse,
} from "./coachPrompt.js";

const PRIORITY_MESSAGE: Record<CoachOptionType, string> = {
  action:
    "Você não precisa resolver tudo agora. Vamos só dar um passo pequeno e concreto.",
  reflection:
    "Antes de agir, pode ajudar entender melhor o que está pegando aqui.",
  alternative:
    "Não precisa forçar um caminho. Vamos achar um jeito mais leve de continuar.",
};

const PRIORITY_LABEL: Record<CoachOptionType, string> = {
  action: "Fazer algo agora",
  reflection: "Organizar o que sinto",
  alternative: "Tentar sem pressão",
};

/**
 * Build a fallback CoachStructuredResponse where the prioritized type
 * receives a stronger label, but all 3 types are still present in
 * canonical order [action, reflection, alternative].
 */
export function buildAdaptiveFallback(
  decision: AdaptiveDecision
): CoachStructuredResponse {
  const promote = (type: CoachOptionType): CoachOption => {
    if (type === decision.priorityType) {
      return {
        ...FALLBACK_BY_TYPE[type],
        label: PRIORITY_LABEL[type],
      };
    }
    return FALLBACK_BY_TYPE[type];
  };

  return {
    message: PRIORITY_MESSAGE[decision.priorityType],
    options: [promote("action"), promote("reflection"), promote("alternative")],
  };
}
