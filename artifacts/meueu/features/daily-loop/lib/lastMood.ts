// ─── Last mood persistence ─────────────────────────────────────────────────
// Stores the user's most recent check-in mood under a dedicated key that
// SURVIVES day-rollover. The daily loop's main storage (@meueu_daily_loop)
// resets at midnight; this key does not.
//
// Used by the Home to keep showing a personalized daily mission even on
// days where the user hasn't done a fresh check-in yet.

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { DailyCheckinMood } from "../data/checkin";

const KEY = "@meueu_last_mood";

const VALID_MOODS: DailyCheckinMood[] = [
  "stuck",
  "anxious",
  "confused",
  "tired",
  "calm",
  "motivated",
];

function isValidMood(v: unknown): v is DailyCheckinMood {
  return typeof v === "string" && (VALID_MOODS as string[]).includes(v);
}

export async function saveLastMood(mood: DailyCheckinMood): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, mood);
  } catch {
    // fire-and-forget
  }
}

export async function loadLastMood(): Promise<DailyCheckinMood | undefined> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (isValidMood(raw)) return raw;
  } catch {}
  return undefined;
}
