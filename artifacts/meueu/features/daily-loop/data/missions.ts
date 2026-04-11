// ─── Daily Loop — Mission Library (compat layer) ───────────────────────────
// This file is now a thin adapter over the new catalog at data/dailyMissions.
// The internal DailyMission type is preserved so downstream consumers
// (useDailyLoop, MissionCard, analytics, convertMissionToPractice) keep
// working without any changes.
//
// What changed:
//   - MISSION_LIBRARY is now derived from `missions` in data/dailyMissions.ts
//   - difficulty defaults to "normal" (new catalog has no difficulty axis)
//   - rewardXp defaults to 15 (flat reward — matches previous balance)
//
// The "light filter" in chooseMission becomes a no-op (no light missions
// exist anymore), but the logic remains intact and harmless.

import { missions as catalog } from "@/data/dailyMissions";

export type DailyMissionCategory = "action" | "reflection" | "alternative";
export type DailyMissionDifficulty = "light" | "normal";

export type DailyMission = {
  id: string;
  title: string;
  subtitle: string;
  durationMin: number;
  category: DailyMissionCategory;
  difficulty: DailyMissionDifficulty;
  steps: string[];
  rewardXp: number;
};

const DEFAULT_REWARD_XP = 15;

export const MISSION_LIBRARY: DailyMission[] = catalog.map((m) => ({
  id: m.id,
  title: m.title,
  subtitle: m.subtitle,
  durationMin: m.durationMin,
  category: m.category,
  difficulty: "normal",
  steps: m.steps,
  rewardXp: DEFAULT_REWARD_XP,
}));

export function getMissionById(id: string): DailyMission | undefined {
  return MISSION_LIBRARY.find((m) => m.id === id);
}

// New catalog has no light variants. Kept as a no-op for API stability.
export function getLightAlternative(_mission: DailyMission): DailyMission | undefined {
  return undefined;
}
