// ─── Daily Loop — State Hook ───────────────────────────────────────────────
// Local state with AsyncStorage persistence. Day-rolls automatically.
// Streak/XP/level are read from GamificationContext (single source of truth).

import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { track } from "@/utils/analytics";
import { useGamification } from "@/context/GamificationContext";
import { normalizeMood } from "@/data/dailyMissions";
import type { DailyCheckin, DailyCheckinMood } from "../data/checkin";
import { getMissionById, type DailyMission } from "../data/missions";
import { chooseMission } from "../lib/chooseMission";
import { saveLastMood } from "../lib/lastMood";

const STORAGE_KEY = "@meueu_daily_loop";

// ─── Persistence ───────────────────────────────────────────────────────────

export type DailyMissionStatus =
  | "not_started"
  | "in_progress"
  | "done"
  | "skipped";

type StoredLoop = {
  date: string; // YYYY-MM-DD
  checkin?: DailyCheckin;
  missionId?: string;
  status: DailyMissionStatus;
  startedAt?: string;
  completedAt?: string;
};

const EMPTY_LOOP = (date: string): StoredLoop => ({
  date,
  status: "not_started",
});

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── Analytics base payload ────────────────────────────────────────────────
// Single source of truth for the fields every daily_mission_* event must
// carry. Keeps the 4 events consistent and ensures we never forget a field.
//
// Required (per analytics spec):
//   - mission_id
//   - category
//   - mood
//   - normalized_mood
//   - date
//   - selection_version

const SELECTION_VERSION = "v2_personalized" as const;

type MissionLike = { id: string; category: string } | undefined;

function buildBasePayload(mission: MissionLike, mood: DailyCheckinMood | undefined) {
  return {
    mission_id: mission?.id,
    category: mission?.category,
    mood,
    normalized_mood: mood ? normalizeMood(mood) : undefined,
    date: getToday(),
    selection_version: SELECTION_VERSION,
  };
}

/**
 * Load + migrate stored loop. Handles legacy `completed: boolean` shape.
 */
async function loadStoredLoop(): Promise<StoredLoop> {
  const today = getToday();
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_LOOP(today);
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    // Day rolled over → reset
    if (parsed.date !== today) return EMPTY_LOOP(today);

    // Backward compat: legacy { completed: boolean } → { status }
    let status: DailyMissionStatus;
    if (typeof parsed.status === "string") {
      status = parsed.status as DailyMissionStatus;
    } else if (parsed.completed === true) {
      status = "done";
    } else if (parsed.missionId) {
      status = "not_started";
    } else {
      status = "not_started";
    }

    return {
      date: parsed.date as string,
      checkin: parsed.checkin as DailyCheckin | undefined,
      missionId: parsed.missionId as string | undefined,
      status,
      startedAt: parsed.startedAt as string | undefined,
      completedAt: parsed.completedAt as string | undefined,
    };
  } catch {
    return EMPTY_LOOP(today);
  }
}

async function saveStoredLoop(loop: StoredLoop): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loop));
  } catch {
    // fire-and-forget
  }
}

// ─── Public state ──────────────────────────────────────────────────────────

export type DailyLoopState = {
  hasCheckedInToday: boolean;
  hasCompletedMissionToday: boolean;
  hasSkippedToday: boolean;
  missionStatus: DailyMissionStatus;
  currentMission?: DailyMission;
  currentCheckin?: DailyCheckin;
  streak: number;
  level: number;
  xp: number;
  /** True if user broke streak (last completion was not yesterday). */
  isReturning: boolean;
};

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useDailyLoop() {
  const { streak, totalXP, currentLevel, recordCheckin } = useGamification();
  const [stored, setStored] = useState<StoredLoop | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const loop = await loadStoredLoop();
    setStored(loop);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Re-check on focus (covers cross-screen state changes)
  useEffect(() => {
    const interval = setInterval(reload, 1500);
    return () => clearInterval(interval);
  }, [reload]);

  const persist = useCallback(async (next: StoredLoop) => {
    setStored(next);
    await saveStoredLoop(next);
  }, []);

  // ─── Actions ───────────────────────────────────────────────────────

  const submitCheckin = useCallback(
    async (checkin: DailyCheckin): Promise<DailyMission> => {
      const mission = chooseMission(checkin);
      const next: StoredLoop = {
        date: getToday(),
        checkin,
        missionId: mission.id,
        status: "not_started",
      };
      await persist(next);

      // Persist mood under a separate, day-rollover-resistant key so the
      // Home can keep showing a personalized mission across days.
      saveLastMood(checkin.mood);

      track("daily_checkin_completed", {
        mood: checkin.mood,
        need: checkin.need,
        mission_id: mission.id,
        category: mission.category,
        difficulty: mission.difficulty,
      });

      // Mission was selected based on the checkin → assigned
      track("daily_mission_assigned", {
        ...buildBasePayload(mission, checkin.mood),
        difficulty: mission.difficulty,
        duration_min: mission.durationMin,
        need: checkin.need,
      });

      return mission;
    },
    [persist]
  );

  const swapMission = useCallback(
    async (newMission: DailyMission): Promise<void> => {
      if (!stored) return;
      await persist({ ...stored, missionId: newMission.id, status: "not_started" });

      // Treat swap as a re-assignment for tracking purposes
      track("daily_mission_assigned", {
        ...buildBasePayload(newMission, stored.checkin?.mood),
        difficulty: newMission.difficulty,
        duration_min: newMission.durationMin,
        swap: true,
      });
    },
    [stored, persist]
  );

  const startMission = useCallback(async (): Promise<void> => {
    if (!stored?.missionId) return;
    const mission = getMissionById(stored.missionId);
    if (!mission) return;

    await persist({
      ...stored,
      status: "in_progress",
      startedAt: new Date().toISOString(),
    });

    track("daily_mission_started", {
      ...buildBasePayload(mission, stored.checkin?.mood),
      difficulty: mission.difficulty,
    });
  }, [stored, persist]);

  const completeMission = useCallback(async (): Promise<void> => {
    if (!stored?.missionId) return;
    const mission = getMissionById(stored.missionId);
    if (!mission) return;

    const today = getToday();

    // GamificationContext.recordCheckin handles the actual streak math
    // based on its lastCheckinDate; we just pass our intended new value.
    const newStreak = streak > 0 ? streak + 1 : 1;

    recordCheckin({
      date: today,
      completed: true,
      hasNote: false,
      xpEarned: mission.rewardXp,
      streak: newStreak,
    });

    await persist({
      ...stored,
      status: "done",
      completedAt: new Date().toISOString(),
    });

    track("daily_mission_completed", {
      ...buildBasePayload(mission, stored.checkin?.mood),
      difficulty: mission.difficulty,
      need: stored.checkin?.need,
      xp: mission.rewardXp,
      streak: newStreak,
      level: currentLevel.level,
    });

    track("daily_loop_completed", {
      mission_id: mission.id,
      streak: newStreak,
      level: currentLevel.level,
      xp: totalXP + mission.rewardXp,
    });
  }, [stored, streak, recordCheckin, currentLevel.level, totalXP, persist]);

  const skipMission = useCallback(async (): Promise<void> => {
    if (!stored?.missionId) return;
    const mission = getMissionById(stored.missionId);

    await persist({ ...stored, status: "skipped" });

    track("daily_mission_skipped", {
      ...buildBasePayload(mission, stored.checkin?.mood),
      difficulty: mission?.difficulty,
      had_started: stored.status === "in_progress",
    });
  }, [stored, persist]);

  // ─── Derived state ─────────────────────────────────────────────────

  const currentMission = stored?.missionId
    ? getMissionById(stored.missionId)
    : undefined;

  // Returning user: had previous activity but is starting a new day
  const isReturning = !stored?.checkin && streak === 0 && totalXP > 0;

  const state: DailyLoopState = {
    hasCheckedInToday: !!stored?.checkin,
    hasCompletedMissionToday: stored?.status === "done",
    hasSkippedToday: stored?.status === "skipped",
    missionStatus: stored?.status ?? "not_started",
    currentMission,
    currentCheckin: stored?.checkin,
    streak,
    level: currentLevel.level,
    xp: totalXP,
    isReturning,
  };

  return {
    state,
    loading,
    submitCheckin,
    swapMission,
    startMission,
    completeMission,
    skipMission,
    reload,
  };
}
