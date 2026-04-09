import { useCallback, useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { track } from "@/utils/analytics";
import { useApp } from "@/context/AppContext";
import { useGamification } from "@/context/GamificationContext";
import { getAllExperimentVariants } from "@/utils/experiments";
import { getGuidedPracticeRecord } from "@/features/guided-practice/hooks/useGuidedPractice";
import { COMPLETION_STEP } from "../data/dailyPractices";
import type { GuidedStep } from "@/features/guided-practice/data/guidedSteps";

const STORAGE_KEY = "@meueu_daily_practice";

// ─── Persistence ────────────────────────────────────────────────────────────

export type DailyPracticeRecord = {
  lastCompletedDate: string | null;
  currentStreak: number;
  lastStartedStepIndex: number | null;
};

const DEFAULT_RECORD: DailyPracticeRecord = {
  lastCompletedDate: null,
  currentStreak: 0,
  lastStartedStepIndex: null,
};

export async function getDailyPracticeRecord(): Promise<DailyPracticeRecord> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_RECORD, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_RECORD;
}

async function saveRecord(record: DailyPracticeRecord): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getYesterday(): string {
  return new Date(Date.now() - 86_400_000).toISOString().split("T")[0];
}

// ─── Day number calculation ─────────────────────────────────────────────────

export async function getDayNumber(): Promise<number> {
  const record = await getGuidedPracticeRecord();
  if (!record.completedAt) return 0;

  const completedDay = record.completedAt.split("T")[0];
  const today = getToday();
  const msPerDay = 86_400_000;
  return Math.max(
    0,
    Math.floor(
      (new Date(today).getTime() - new Date(completedDay).getTime()) / msPerDay
    )
  );
}

// ─── Status for Home card ───────────────────────────────────────────────────

export type DailyPracticeStatus = "not_started" | "in_progress" | "completed";

export async function getDailyStatus(): Promise<{
  status: DailyPracticeStatus;
  streak: number;
  resumeStepIndex: number | null;
}> {
  const record = await getDailyPracticeRecord();
  const today = getToday();

  if (record.lastCompletedDate === today) {
    return { status: "completed", streak: record.currentStreak, resumeStepIndex: null };
  }

  if (record.lastStartedStepIndex !== null && record.lastStartedStepIndex > 0) {
    return { status: "in_progress", streak: record.currentStreak, resumeStepIndex: record.lastStartedStepIndex };
  }

  return { status: "not_started", streak: record.currentStreak, resumeStepIndex: null };
}

// ─── Analytics base ─────────────────────────────────────────────────────────

function useAnalyticsBase(totalSteps: number) {
  const { profile } = useApp();
  const [experimentVariants, setExperimentVariants] = useState<Record<string, string>>({});

  useEffect(() => {
    getAllExperimentVariants().then(setExperimentVariants);
  }, []);

  return {
    adaptive_profile_tags: profile.adaptiveProfile?.inferredTags ?? [],
    plan_type: profile.generatedPlan ? "ai_generated" : "none",
    total_steps: totalSteps,
    experiment_variants: experimentVariants,
  };
}

// ─── Streak copy ────────────────────────────────────────────────────────────

export function getStreakCopy(streak: number, missedDay: boolean): { title: string; sub: string } {
  if (missedDay) {
    return { title: "Recomeçar também conta.", sub: "Você está aqui. Isso importa." };
  }
  if (streak <= 1) {
    return { title: "Primeiro passo feito.", sub: "Amanhã você continua." };
  }
  if (streak <= 3) {
    return { title: "Você está começando.", sub: `${streak} dias seguidos.` };
  }
  if (streak < 5) {
    return { title: "Está ficando natural.", sub: `${streak} dias seguidos.` };
  }
  return { title: "Você está consistente.", sub: `${streak} dias seguidos.` };
}

// ─── XP for daily practice ──────────────────────────────────────────────────

const DAILY_PRACTICE_XP = 15;

// ─── Hook ───────────────────────────────────────────────────────────────────

export type CompletionResult = {
  xpEarned: number;
  newStreak: number;
  streakCopy: { title: string; sub: string };
};

/**
 * @param steps - Pre-resolved steps array (from getDailySteps, async)
 * @param resumeStep - Step index to resume from (if in progress)
 */
export function useDailyPractice(steps: GuidedStep[], resumeStep?: number | null) {
  const totalSteps = steps.length;
  const practiceSteps = totalSteps - 1; // exclude completion step

  const [stepIndex, setStepIndex] = useState(resumeStep ?? 0);
  const [completionResult, setCompletionResult] = useState<CompletionResult | null>(null);
  const startTime = useRef(Date.now());
  const completedRef = useRef(false);
  const stepRef = useRef(stepIndex);
  const base = useAnalyticsBase(totalSteps);
  const { recordCheckin } = useGamification();

  const step = steps[stepIndex];
  const isCompletion = step.id === COMPLETION_STEP.id;
  const isLast = stepIndex === totalSteps - 1;

  // Keep ref in sync
  useEffect(() => { stepRef.current = stepIndex; }, [stepIndex]);

  // ─── Lifecycle ────────────────────────────────────────────────────
  useEffect(() => {
    track("daily_practice_started", base);
    return () => {
      if (!completedRef.current) {
        track("daily_practice_dropped", {
          total_steps: totalSteps,
          step_index: stepRef.current,
          total_time_ms: Date.now() - startTime.current,
          experiment_variants: base.experiment_variants,
        });
      }
    };
  }, []);

  // ─── Step view ────────────────────────────────────────────────────
  useEffect(() => {
    track("daily_practice_step_viewed", {
      ...base,
      step_index: stepIndex,
    });

    // Persist progress (not on completion step)
    if (!isCompletion) {
      getDailyPracticeRecord().then((record) => {
        saveRecord({ ...record, lastStartedStepIndex: stepIndex });
      });
    }
  }, [stepIndex]);

  // ─── Actions ──────────────────────────────────────────────────────
  const advance = useCallback(async () => {
    track("daily_practice_step_completed", {
      ...base,
      step_index: stepIndex,
    });

    if (isLast) {
      completedRef.current = true;

      const record = await getDailyPracticeRecord();
      const today = getToday();
      const yesterday = getYesterday();
      const wasYesterday = record.lastCompletedDate === yesterday;
      const newStreak = wasYesterday ? record.currentStreak + 1 : 1;

      await saveRecord({
        lastCompletedDate: today,
        currentStreak: newStreak,
        lastStartedStepIndex: null,
      });

      const xpEarned = DAILY_PRACTICE_XP;
      recordCheckin({
        date: today,
        completed: true,
        hasNote: false,
        xpEarned,
        streak: newStreak,
      });

      track("daily_practice_completed", {
        ...base,
        total_time_ms: Date.now() - startTime.current,
        streak: newStreak,
        xp_earned: xpEarned,
      });

      track("streak_updated", { streak: newStreak, source: "daily_practice" });
      track("xp_gained_from_daily", { xp: xpEarned, streak: newStreak });

      router.back();
      return;
    }

    setStepIndex((i) => i + 1);
  }, [stepIndex, isLast, base, recordCheckin]);

  return {
    step,
    stepIndex,
    isCompletion,
    practiceSteps,
    completionResult,
    advance,
  };
}
