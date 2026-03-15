import AsyncStorage from "@react-native-async-storage/async-storage";
import { BIG5_STORAGE_KEY, type StoredBig5 } from "@/data/big5";

const PLAN_COUNT_KEY = "@meueu_plan_count_v1";

export type PlanApproach = {
  key: string;
  name: string;
  question: string;
};

export async function generatePlan(
  currentAdjectives: string[],
  futureAdjectives: string[],
  domain: string,
  sessionId?: string
): Promise<{ success: boolean; plan?: any; approach?: PlanApproach; error?: string }> {
  let big5Scores: StoredBig5["scores"] | null = null;
  let sessionCount = 1;

  try {
    const raw = await AsyncStorage.getItem(BIG5_STORAGE_KEY);
    if (raw) {
      const stored: StoredBig5 = JSON.parse(raw);
      big5Scores = stored.scores;
    }
  } catch {
    // No Big5 data — proceed without it
  }

  try {
    const rawCount = await AsyncStorage.getItem(PLAN_COUNT_KEY);
    if (rawCount) sessionCount = parseInt(rawCount, 10) + 1;
    await AsyncStorage.setItem(PLAN_COUNT_KEY, String(sessionCount));
  } catch {
    // Ignore count errors
  }

  const response = await fetch(`${domain}/api/plan/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      currentAdjectives,
      futureAdjectives,
      sessionId,
      big5Scores,
      sessionCount,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    return { success: false, error: err.error ?? "Erro ao gerar plano." };
  }

  return response.json();
}
