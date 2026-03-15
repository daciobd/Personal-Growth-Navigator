import AsyncStorage from "@react-native-async-storage/async-storage";
import { BIG5_STORAGE_KEY, type StoredBig5 } from "@/data/big5";

export async function generatePlan(
  currentAdjectives: string[],
  futureAdjectives: string[],
  domain: string,
  sessionId?: string
): Promise<{ success: boolean; plan?: any; error?: string }> {
  let big5Scores: StoredBig5["scores"] | null = null;

  try {
    const raw = await AsyncStorage.getItem(BIG5_STORAGE_KEY);
    if (raw) {
      const stored: StoredBig5 = JSON.parse(raw);
      big5Scores = stored.scores;
    }
  } catch {
    // No Big5 data available — proceed without it
  }

  const response = await fetch(`${domain}/api/plan/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      currentAdjectives,
      futureAdjectives,
      sessionId,
      big5Scores,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    return { success: false, error: err.error ?? "Erro ao gerar plano." };
  }

  return response.json();
}
