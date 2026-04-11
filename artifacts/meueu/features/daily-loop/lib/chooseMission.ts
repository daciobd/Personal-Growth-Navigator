// ─── Daily Loop — Mission Selector ─────────────────────────────────────────
// Local heuristic. No backend, no AI. V1 of the loop.

import type { DailyCheckin, DailyCheckinMood } from "../data/checkin";
import {
  MISSION_LIBRARY,
  type DailyMission,
  type DailyMissionCategory,
} from "../data/missions";

const MOOD_TO_CATEGORY: Record<DailyCheckinMood, DailyMissionCategory> = {
  stuck: "action",
  motivated: "action",
  confused: "reflection",
  anxious: "alternative",
  tired: "alternative",
  calm: "reflection",
};

/**
 * Pick a mission for the user based on their check-in.
 * - Mood maps to a preferred category.
 * - Tired/lightness users prefer the "light" difficulty when available.
 * - Need-based tiebreakers are best-effort: they look up legacy IDs that
 *   may not exist in the current catalog. If absent, the tiebreaker is a
 *   silent no-op and selection falls through to random pick.
 * - When multiple candidates exist, pick a random one to maximize variety.
 */
export function chooseMission(checkin: DailyCheckin): DailyMission {
  const preferredCategory = MOOD_TO_CATEGORY[checkin.mood] ?? "reflection";
  const needsLight = checkin.mood === "tired" || checkin.need === "lightness";

  // 1. Try preferred category + light if needed
  let candidates = MISSION_LIBRARY.filter((m) => m.category === preferredCategory);
  if (needsLight) {
    const lightCandidates = candidates.filter((m) => m.difficulty === "light");
    if (lightCandidates.length > 0) candidates = lightCandidates;
  }

  // 2. Need-based tiebreak — best-effort, no-op if IDs absent in catalog
  if (candidates.length > 1) {
    if (checkin.need === "restart") {
      const restart = candidates.find((m) => m.id === "restart-without-guilt");
      if (restart) return restart;
    }
    if (checkin.need === "clarity") {
      const clarity = candidates.find((m) => m.id === "gain-clarity");
      if (clarity) return clarity;
    }
  }

  // 3. Pick a RANDOM candidate (variety) or fall back to a random reflection
  if (candidates.length > 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  const reflections = MISSION_LIBRARY.filter((m) => m.category === "reflection");
  if (reflections.length > 0) {
    return reflections[Math.floor(Math.random() * reflections.length)];
  }
  return MISSION_LIBRARY[Math.floor(Math.random() * MISSION_LIBRARY.length)];
}
