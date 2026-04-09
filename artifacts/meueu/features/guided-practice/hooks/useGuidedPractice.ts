import { useCallback, useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { track } from "@/utils/analytics";
import { useApp } from "@/context/AppContext";
import { GUIDED_STEPS, PRACTICE_STEPS, TOTAL_STEPS } from "../data/guidedSteps";

const STORAGE_KEY = "@meueu_first_guided_practice";

export type GuidedPracticeRecord = {
  completed: boolean;
  completedAt: string | null;
};

const DEFAULT_RECORD: GuidedPracticeRecord = {
  completed: false,
  completedAt: null,
};

// ─── Persistence helpers ────────────────────────────────────────────────────

export async function getGuidedPracticeRecord(): Promise<GuidedPracticeRecord> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_RECORD, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_RECORD;
}

async function markCompleted(): Promise<void> {
  const record: GuidedPracticeRecord = {
    completed: true,
    completedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

// ─── Analytics base ─────────────────────────────────────────────────────────

function useAnalyticsBase() {
  const { profile } = useApp();
  return {
    adaptive_profile_tags: profile.adaptiveProfile?.inferredTags ?? [],
    plan_type: profile.generatedPlan ? "ai_generated" : "none",
    total_steps: TOTAL_STEPS,
  };
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useGuidedPractice() {
  const [stepIndex, setStepIndex] = useState(0);
  const [replayCount, setReplayCount] = useState(0);
  const startTime = useRef(Date.now());
  const completedRef = useRef(false);
  const stepRef = useRef(0);
  const replayRef = useRef(0);
  const base = useAnalyticsBase();

  const step = GUIDED_STEPS[stepIndex];
  const isIntro = stepIndex === 0;
  const isLast = stepIndex === TOTAL_STEPS - 1;

  // Progress for the UI: intro doesn't count
  const practiceIndex = isIntro ? -1 : stepIndex - 1;

  // Keep refs in sync for unmount cleanup
  useEffect(() => { stepRef.current = stepIndex; }, [stepIndex]);
  useEffect(() => { replayRef.current = replayCount; }, [replayCount]);

  // ─── Lifecycle tracking ───────────────────────────────────────────
  useEffect(() => {
    track("first_guided_started", base);
    return () => {
      if (!completedRef.current) {
        track("first_guided_dropped", {
          total_steps: TOTAL_STEPS,
          step_index: stepRef.current,
          total_time_ms: Date.now() - startTime.current,
          replayed: replayRef.current > 0,
        });
      }
    };
  }, []);

  // ─── Step view tracking ───────────────────────────────────────────
  useEffect(() => {
    track("first_guided_step_viewed", {
      ...base,
      step_index: stepIndex,
      replayed: replayCount > 0,
    });
  }, [stepIndex]);

  // ─── Actions ──────────────────────────────────────────────────────
  const advance = useCallback(() => {
    track("first_guided_step_completed", {
      ...base,
      step_index: stepIndex,
      replayed: replayCount > 0,
    });

    if (isLast) {
      completedRef.current = true;
      markCompleted();
      track("first_guided_completed", {
        ...base,
        total_time_ms: Date.now() - startTime.current,
        replayed: replayCount > 0,
      });
      try { router.dismissAll(); } catch {}
      router.replace("/(tabs)");
      return;
    }

    setStepIndex((i) => i + 1);
  }, [stepIndex, isLast, replayCount, base]);

  const replay = useCallback(() => {
    const newCount = replayCount + 1;
    setReplayCount(newCount);
    track("first_guided_replayed", {
      ...base,
      replay_number: newCount,
      total_time_ms: Date.now() - startTime.current,
    });
    startTime.current = Date.now();
    setStepIndex(0);
  }, [replayCount, base]);

  return {
    step,
    stepIndex,
    isIntro,
    isLast,
    practiceIndex,
    practiceSteps: PRACTICE_STEPS,
    advance,
    replay,
  };
}
