import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiUrl } from "@/utils/api";

const SESSION_ID = Math.random().toString(36).substring(2) + Date.now().toString(36);
const ANON_KEY = "meueu_anonymous_id";

async function getAnonymousId(): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem(ANON_KEY);
    if (stored) return stored;
    const id = "anon_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
    await AsyncStorage.setItem(ANON_KEY, id);
    return id;
  } catch {
    return "anon_fallback";
  }
}

export async function track(
  eventName: string,
  properties?: Record<string, unknown>
): Promise<void> {
  try {
    const anonymousId = await getAnonymousId();
    const apiUrl = getApiUrl();
    await fetch(`${apiUrl}analytics/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        anonymousId,
        sessionId: SESSION_ID,
        properties: properties ?? {},
      }),
    });
  } catch {
    // fire-and-forget — tracking never crashes the app
  }
}
