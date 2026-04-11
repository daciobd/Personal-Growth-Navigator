// ─── Coach Response Normalizer ──────────────────────────────────────────────
// SINGLE source of truth for turning raw LLM output into a valid
// CoachStructuredResponse. All parsing, coercion, sanitization,
// validation, ordering and fallback lives here. Frontend should NOT
// duplicate this logic.
//
// Pipeline:
//   rawText → extractJSON → safeParse → validateShape → coerceLegacy
//          → sanitize → orderByType → ensureAllTypes → final
//
// Returns the normalized response + metadata for tracking.

import {
  COACH_PROMPT_VERSION,
  FALLBACK_OPTIONS,
  OPTION_TYPE_ORDER,
  getFallbackByType,
  type CoachOption,
  type CoachOptionType,
  type CoachStructuredResponse,
} from "./coachPrompt.js";
import type { AdaptiveReason } from "./coachAdaptiveSignals.js";

// ─── Result types ──────────────────────────────────────────────────────────

export type NormalizeMeta = {
  promptVersion: string;
  /** True if any part of the response had to be filled by fallback. */
  usedFallback: boolean;
  /** Types that were absent from the LLM output and had to be filled. */
  missingTypes: CoachOptionType[];
  /** Types that appeared more than once (later occurrences were dropped). */
  duplicateTypes: CoachOptionType[];
  /** Reason for any failure (for logs/analytics). */
  parseError?: string;
  /** Adaptive engine: which type was prioritized this turn. */
  priorityType?: CoachOptionType;
  /** Adaptive engine: rule that produced the priority decision. */
  adaptiveReason?: AdaptiveReason;
};

const DEFAULT_FALLBACK_MESSAGE = "Estou aqui com você. Pode continuar.";

export type NormalizedResult = {
  data: CoachStructuredResponse;
  meta: NormalizeMeta;
};

// ─── Hand-rolled safeParse (no external dep) ────────────────────────────────

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const VALID_TYPES = new Set<CoachOptionType>(["action", "reflection", "alternative"]);

const MAX_LABEL_LEN = 60;
const MAX_PROMPT_LEN = 400;
const MAX_MESSAGE_LEN = 800;

function isStringNonEmpty(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isOptionType(v: unknown): v is CoachOptionType {
  return typeof v === "string" && VALID_TYPES.has(v as CoachOptionType);
}

// Extract first balanced JSON object from text (tolerates LLM noise)
function extractJSON(rawText: string): ParseResult<unknown> {
  const match = rawText.match(/\{[\s\S]*\}/);
  if (!match) return { success: false, error: "no_json_found" };
  try {
    return { success: true, data: JSON.parse(match[0]) };
  } catch {
    return { success: false, error: "json_parse_failed" };
  }
}

// Validate the top-level shape ({ message, options })
function validateShape(parsed: unknown): ParseResult<{
  message: string;
  options: unknown[];
}> {
  if (!parsed || typeof parsed !== "object") {
    return { success: false, error: "not_an_object" };
  }
  const obj = parsed as Record<string, unknown>;

  if (!isStringNonEmpty(obj.message)) {
    return { success: false, error: "missing_message" };
  }

  if (!Array.isArray(obj.options)) {
    return { success: false, error: "missing_options_array" };
  }

  return {
    success: true,
    data: { message: obj.message, options: obj.options },
  };
}

// ─── Legacy coercion (positional types) ────────────────────────────────────
// When backend ever receives `options: ["str1", "str2", "str3"]` from an old
// model output, preserve the original intent by mapping by position.

function coerceLegacyStringOptions(strings: string[]): CoachOption[] {
  return strings
    .filter(isStringNonEmpty)
    .slice(0, 3)
    .map((str, i) => ({
      type: OPTION_TYPE_ORDER[i] ?? "alternative",
      label: sanitizeLabel(str),
      prompt: sanitizePrompt(str),
    }));
}

// ─── Per-option coercion ────────────────────────────────────────────────────

function coerceOption(raw: unknown): CoachOption | null {
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    // Default position-less legacy string → alternative; legacy array case
    // is handled separately in coerceLegacyStringOptions for positional types.
    return {
      type: "alternative",
      label: sanitizeLabel(trimmed),
      prompt: sanitizePrompt(trimmed),
    };
  }

  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const label = isStringNonEmpty(obj.label) ? obj.label.trim() : "";
  const prompt = isStringNonEmpty(obj.prompt) ? obj.prompt.trim() : "";

  if (!label) return null;

  return {
    type: isOptionType(obj.type) ? obj.type : "alternative",
    label: sanitizeLabel(label),
    prompt: sanitizePrompt(prompt || label),
  };
}

// ─── Sanitization ──────────────────────────────────────────────────────────

function sanitizeMessage(msg: string): string {
  return msg.trim().slice(0, MAX_MESSAGE_LEN);
}

function sanitizeLabel(label: string): string {
  return label.trim().replace(/\s+/g, " ").slice(0, MAX_LABEL_LEN);
}

function sanitizePrompt(prompt: string): string {
  return prompt.trim().replace(/\s+/g, " ").slice(0, MAX_PROMPT_LEN);
}

// ─── Order + ensure all types ──────────────────────────────────────────────

/**
 * Returns options sorted into canonical order [action, reflection, alternative].
 * If multiple options share a type, the first is kept; later ones are dropped
 * and recorded as duplicates.
 * Missing types are returned as null at their canonical position.
 */
function orderByType(options: CoachOption[]): {
  ordered: Array<CoachOption | null>;
  duplicateTypes: CoachOptionType[];
} {
  const seen = new Map<CoachOptionType, CoachOption>();
  const duplicateTypes: CoachOptionType[] = [];
  for (const opt of options) {
    if (seen.has(opt.type)) {
      if (!duplicateTypes.includes(opt.type)) duplicateTypes.push(opt.type);
    } else {
      seen.set(opt.type, opt);
    }
  }
  return {
    ordered: OPTION_TYPE_ORDER.map((type) => seen.get(type) ?? null),
    duplicateTypes,
  };
}

/**
 * Replace null slots with the canonical fallback for that type.
 * Returns the final tuple + the list of types that were filled by fallback.
 */
function ensureAllTypes(slots: Array<CoachOption | null>): {
  options: [CoachOption, CoachOption, CoachOption];
  missingTypes: CoachOptionType[];
} {
  const missingTypes: CoachOptionType[] = [];
  const filled: CoachOption[] = slots.map((slot, i) => {
    if (slot) return slot;
    const type = OPTION_TYPE_ORDER[i];
    missingTypes.push(type);
    return getFallbackByType(type);
  });
  return {
    options: [filled[0], filled[1], filled[2]],
    missingTypes,
  };
}

// ─── Fallback builder ───────────────────────────────────────────────────────

function buildFullFallback(
  rawText: string,
  parseError: string
): NormalizedResult {
  return {
    data: {
      message: sanitizeMessage(rawText) || DEFAULT_FALLBACK_MESSAGE,
      options: [...FALLBACK_OPTIONS] as [CoachOption, CoachOption, CoachOption],
    },
    meta: {
      promptVersion: COACH_PROMPT_VERSION,
      usedFallback: true,
      missingTypes: [...OPTION_TYPE_ORDER],
      duplicateTypes: [],
      parseError,
    },
  };
}

// ─── Main entry point ───────────────────────────────────────────────────────

/**
 * Attach adaptive engine metadata to a normalized result.
 * Pure helper — keeps normalizeCoachResponse decoupled from the adaptive layer.
 */
export function withAdaptiveMeta(
  result: NormalizedResult,
  priorityType: CoachOptionType,
  adaptiveReason: AdaptiveReason
): NormalizedResult {
  return {
    data: result.data,
    meta: { ...result.meta, priorityType, adaptiveReason },
  };
}

/**
 * Normalize raw LLM text into a validated CoachStructuredResponse.
 * Always returns a usable result — falls back gracefully on every failure.
 */
export function normalizeCoachResponse(rawText: string): NormalizedResult {
  // 1. Extract JSON
  const extracted = extractJSON(rawText);
  if (!extracted.success) {
    return buildFullFallback(rawText, extracted.error);
  }

  // 2. Validate shape
  const shape = validateShape(extracted.data);
  if (!shape.success) {
    return buildFullFallback(rawText, shape.error);
  }

  // 3. Coerce options — detect legacy string-array format
  const allStrings = shape.data.options.every((o) => typeof o === "string");
  let coerced: CoachOption[];

  if (allStrings && shape.data.options.length > 0) {
    // Legacy positional format: index → type
    coerced = coerceLegacyStringOptions(shape.data.options as string[]);
  } else {
    // New typed format (or mixed)
    coerced = shape.data.options
      .map(coerceOption)
      .filter((o): o is CoachOption => o !== null);
  }

  // 4. Order by canonical type sequence (drops duplicates of same type)
  const { ordered, duplicateTypes } = orderByType(coerced);

  // 5. Ensure all 3 types present (fills missing slots from fallback)
  const { options, missingTypes } = ensureAllTypes(ordered);

  // 6. Final guarantee: message is never empty (defensive against
  //    edge cases where sanitization could collapse to empty string)
  const finalMessage = sanitizeMessage(shape.data.message) || DEFAULT_FALLBACK_MESSAGE;

  return {
    data: {
      message: finalMessage,
      options,
    },
    meta: {
      promptVersion: COACH_PROMPT_VERSION,
      usedFallback: missingTypes.length > 0,
      missingTypes,
      duplicateTypes,
    },
  };
}
