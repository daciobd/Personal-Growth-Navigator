// artifacts/meueu/hooks/usePlanGeneration.ts
// Passa Big Five + assessmentNumber ao servidor.
// Retorna plan + approach para exibição no frontend.

import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { type B5Scores } from "../data/big5";
import { getApiUrl } from "../utils/api";

export type GeneratedApproach = {
  key: string;
  name: string;
  anchorQuestion: string;
};

export type GeneratedPlan = {
  sintese: string;
  fraseIntencao: string;
  perguntaReflexao?: string;
  praticas: Array<{
    abordagem: string;
    nome: string;
    justificativa: string;
    passos: string[];
    frequencia: string;
  }>;
};

export type PlanResult = {
  plan: GeneratedPlan;
  approach: GeneratedApproach;
  hasBig5: boolean;
};

export function usePlanGeneration() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const generate = useCallback(async (
    currentAdjectives: string[],
    futureAdjectives: string[]
  ): Promise<PlanResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const domain = getApiUrl();
      if (!domain) throw new Error("EXPO_PUBLIC_DOMAIN não configurado");

      // Carrega Big Five e contagem de avaliações
      let big5Scores: B5Scores | undefined;
      let assessmentNumber = 1;
      try {
        const raw = await AsyncStorage.getItem("@meueu_assessments");
        if (raw) {
          const all = JSON.parse(raw) as Array<{ scores: B5Scores }>;
          if (all.length > 0) {
            big5Scores = all[all.length - 1].scores;
            assessmentNumber = all.length;
          }
        }
      } catch { /* Big Five opcional */ }

      const res = await fetch(`${domain}/api/plan/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentAdjectives,
          futureAdjectives,
          assessmentNumber,
          ...(big5Scores ? { big5Scores } : {}),
        }),
      });

      const data = await res.json() as {
        success: boolean;
        plan: GeneratedPlan;
        approach: GeneratedApproach;
        hasBig5: boolean;
        error?: string;
      };

      if (!data.success) throw new Error(data.error ?? "Erro desconhecido");

      // Persiste approach para uso no check-in e coach
      await AsyncStorage.setItem(
        "@meueu_current_approach",
        JSON.stringify(data.approach)
      );

      return {
        plan:    data.plan,
        approach: data.approach,
        hasBig5: data.hasBig5,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao gerar plano";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generate, loading, error };
}
