import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as Linking from "expo-linking";

const STORAGE_KEY = "@meueu_longevi_context";

export type LongeviContextData = {
  source: string;
  context: string;
  focus: string;
  utm_campaign?: string;
};

export type UseLongeviContextResult = {
  isFromLongevi: boolean;
  context: string | null;
  focus: string | null;
  longeviData: LongeviContextData | null;
  clearContext: () => Promise<void>;
  isLoaded: boolean;
};

export const FOCUS_ADJECTIVES: Record<string, string[]> = {
  sleep_stress:      ["calmo", "sereno", "equilibrado"],
  habit_consistency: ["disciplinado", "consistente", "focado"],
  stress_reduction:  ["calmo", "presente", "resiliente"],
  stress_cortisol:   ["sereno", "equilibrado", "resiliente"],
  nutrition_habit:   ["disciplinado", "consistente", "consciente"],
};

export const FOCUS_LABELS: Record<string, string> = {
  sleep_stress:      "Sono e Estresse",
  habit_consistency: "Consistência de Hábitos",
  stress_reduction:  "Redução de Estresse",
  stress_cortisol:   "Equilíbrio de Cortisol",
  nutrition_habit:   "Hábitos Alimentares",
};

export const CONTEXT_LABELS: Record<string, string> = {
  insulin_resistance: "Resistência à Insulina",
  metabolic_syndrome: "Síndrome Metabólica",
  chronic_stress:     "Estresse Crônico",
  sleep_disorder:     "Distúrbio de Sono",
  gut_health:         "Saúde Intestinal",
};

function parseWebUrlParams(): Record<string, string> {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const params: Record<string, string> = {};
    new URLSearchParams(window.location.search).forEach((v, k) => {
      params[k] = v;
    });
    return params;
  }
  return {};
}

export function useLongeviContext(): UseLongeviContextResult {
  const [longeviData, setLongeviData] = useState<LongeviContextData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const webParams = parseWebUrlParams();

      if (webParams.source === "longevi" && webParams.context) {
        const data: LongeviContextData = {
          source:       "longevi",
          context:      webParams.context,
          focus:        webParams.focus ?? "",
          utm_campaign: webParams.utm_campaign,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setLongeviData(data);
        setIsLoaded(true);
        return;
      }

      if (Platform.OS !== "web") {
        try {
          const url = await Linking.getInitialURL();
          if (url) {
            const parsed = Linking.parse(url);
            const qp = parsed.queryParams ?? {};
            if (qp.source === "longevi" && qp.context) {
              const data: LongeviContextData = {
                source:  "longevi",
                context: qp.context as string,
                focus:   (qp.focus as string) ?? "",
              };
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
              setLongeviData(data);
              setIsLoaded(true);
              return;
            }
          }
        } catch {}
      }

      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        try { setLongeviData(JSON.parse(raw)); } catch {}
      }
      setIsLoaded(true);
    })();
  }, []);

  const clearContext = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setLongeviData(null);
  }, []);

  return {
    isFromLongevi: longeviData?.source === "longevi",
    context:       longeviData?.context ?? null,
    focus:         longeviData?.focus ?? null,
    longeviData,
    clearContext,
    isLoaded,
  };
}
