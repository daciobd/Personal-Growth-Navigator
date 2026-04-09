// ─── Simple A/B Testing ─────────────────────────────────────────────────────
// Assigns a persistent random variant per experiment per device.
// Inactive experiments always return "A" (control) without touching persistence.

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@meueu_experiments";

type ExperimentMap = Record<string, string>;

// ─── Experiment definitions ─────────────────────────────────────────────────

export type ExperimentName =
  | "guided_step3_copy"
  | "home_cta"
  | "completion_copy";

export type Variant = "A" | "B" | "C";

const CONTROL: Variant = "A";

const EXPERIMENTS: Record<ExperimentName, Variant[]> = {
  guided_step3_copy: ["A", "B", "C"],
  home_cta: ["A", "B", "C"],
  completion_copy: ["A", "B", "C"],
};

// ─── Active experiments (edit this to control rollout) ──────────────────────
// Only active experiments randomize. Inactive ones always return "A".
// Persisted values are never deleted — they're just ignored while inactive.
//
// Rollout phases:
//   Phase 1: guided_step3_copy active
//   Phase 2: home_cta active
//   Phase 3: completion_copy active

const ACTIVE_EXPERIMENTS: Record<ExperimentName, boolean> = {
  guided_step3_copy: true,
  home_cta: false,
  completion_copy: false,
};

// ─── In-memory cache ────────────────────────────────────────────────────────

let cache: ExperimentMap | null = null;

async function loadAll(): Promise<ExperimentMap> {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    cache = raw ? JSON.parse(raw) : {};
  } catch {
    cache = {};
  }
  return cache!;
}

async function saveAll(map: ExperimentMap): Promise<void> {
  cache = map;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Whether an experiment is currently active.
 */
export function isExperimentActive(name: ExperimentName): boolean {
  return ACTIVE_EXPERIMENTS[name] === true;
}

/**
 * Returns the effective variant for an experiment.
 * - Active: returns persisted variant (assigns randomly on first call)
 * - Inactive: always returns "A" without modifying persistence
 */
export async function getExperimentVariant(name: ExperimentName): Promise<Variant> {
  if (!isExperimentActive(name)) return CONTROL;

  const map = await loadAll();

  if (map[name]) {
    return map[name] as Variant;
  }

  const variants = EXPERIMENTS[name];
  const variant = variants[Math.floor(Math.random() * variants.length)];
  map[name] = variant;
  await saveAll(map);
  return variant;
}

/**
 * Returns all effective variants (what the user actually sees this session).
 * Inactive experiments report "A" regardless of persisted value.
 */
export async function getAllExperimentVariants(): Promise<Record<string, string>> {
  const map = await loadAll();
  const effective: Record<string, string> = {};

  for (const name of Object.keys(EXPERIMENTS) as ExperimentName[]) {
    effective[name] = isExperimentActive(name) ? (map[name] ?? CONTROL) : CONTROL;
  }

  return effective;
}

/**
 * Ensures all active experiments have assigned variants.
 * Inactive experiments are skipped (not assigned, not randomized).
 */
export async function initExperiments(): Promise<Record<ExperimentName, Variant>> {
  const map = await loadAll();
  let changed = false;

  for (const [name, variants] of Object.entries(EXPERIMENTS) as [ExperimentName, Variant[]][]) {
    if (isExperimentActive(name) && !map[name]) {
      map[name] = variants[Math.floor(Math.random() * variants.length)];
      changed = true;
    }
  }

  if (changed) await saveAll(map);

  // Return effective variants
  const effective: Record<string, Variant> = {} as any;
  for (const name of Object.keys(EXPERIMENTS) as ExperimentName[]) {
    effective[name] = isExperimentActive(name) ? (map[name] as Variant ?? CONTROL) : CONTROL;
  }
  return effective as Record<ExperimentName, Variant>;
}
