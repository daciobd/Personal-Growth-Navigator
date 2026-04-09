// artifacts/meueu/hooks/usePlanGeneration.ts (v2)
// Carrega traços + estado + Big Five separadamente.
// Passa ao servidor para geração do plano diferenciado.

import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiUrl } from "@/utils/api";
import type { AdaptiveProfile } from "@/data/adaptive-onboarding";

export type GeneratedApproach = {
  key: string;
  name: string;
  anchorQuestion: string;
};

export type GeneratedPlan = {
  sintese: string;
  estadoAtual?: string;
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
  plan:     GeneratedPlan;
  approach: GeneratedApproach;
  hasBig5:  boolean;
  hasState: boolean;
};

export function usePlanGeneration() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const generate = useCallback(async (
    futureAdjectives: string[],
    adaptiveProfile?: AdaptiveProfile | null
  ): Promise<PlanResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const domain = getApiUrl();
      if (!domain) throw new Error("EXPO_PUBLIC_DOMAIN não configurado");

      // 1. Traços de personalidade (novos) ou adjetivos atuais (legados)
      const traitsRaw   = await AsyncStorage.getItem("@meueu_trait_adjectives");
      const currentRaw  = await AsyncStorage.getItem("@meueu_current_adjectives");
      const traitAdj    = traitsRaw ? JSON.parse(traitsRaw) as string[] : [];
      const currentAdj  = currentRaw ? JSON.parse(currentRaw) as string[] : [];
      const traits      = traitAdj.length > 0 ? traitAdj : currentAdj;

      // 2. Estado emocional atual
      const stateRaw    = await AsyncStorage.getItem("@meueu_state_adjectives");
      const stateAdj    = stateRaw ? JSON.parse(stateRaw) as string[] : [];

      // 3. Big Five (avaliação completa ou estimativa por adjetivos)
      let big5Scores: { dims: Record<string, number>; facets: Record<string, number> } | undefined;
      let assessmentNumber = 1;
      try {
        const assessRaw = await AsyncStorage.getItem("@meueu_assessments");
        if (assessRaw) {
          const all = JSON.parse(assessRaw) as Array<{ scores: typeof big5Scores }>;
          if (all.length > 0) {
            big5Scores      = all[all.length - 1].scores;
            assessmentNumber = all.length;
          }
        }
      } catch { /* Big Five opcional */ }

      // 4. Se não há Big Five completo, tenta estimar pelos traços
      if (!big5Scores && traits.length >= 5) {
        try {
          const { estimateB5FromAdjectives } = await import("../data/big5Estimator");
          const estimate = estimateB5FromAdjectives(traits, futureAdjectives);
          if (estimate && estimate.confidence >= 25) {
            big5Scores = { dims: estimate.dims, facets: estimate.facets };
          }
        } catch { /* estimativa opcional */ }
      }

      // 5. Longevi context (se o usuário veio do Longevi)
      let longeviContext: { context: string; focus: string } | undefined;
      try {
        const longeviRaw = await AsyncStorage.getItem("@meueu_longevi_context");
        if (longeviRaw) {
          const parsed = JSON.parse(longeviRaw);
          if (parsed?.source === "longevi" && parsed?.context) {
            longeviContext = { context: parsed.context, focus: parsed.focus ?? "" };
          }
        }
      } catch { /* opcional */ }

      const res = await fetch(`${domain}/api/plan/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          traitAdjectives:  traits,
          stateAdjectives:  stateAdj,
          futureAdjectives: futureAdjectives,
          assessmentNumber,
          ...(big5Scores       ? { big5Scores }       : {}),
          ...(longeviContext   ? { longeviContext }   : {}),
          ...(adaptiveProfile  ? { adaptiveProfile }  : {}),
        }),
      });

      const data = await res.json() as {
        success:  boolean;
        plan:     GeneratedPlan;
        approach: GeneratedApproach;
        hasBig5:  boolean;
        hasState: boolean;
        error?:   string;
      };

      if (!data.success) throw new Error(data.error ?? "Erro desconhecido");

      // Persiste approach para uso no coach
      await AsyncStorage.setItem(
        "@meueu_current_approach",
        JSON.stringify(data.approach)
      );

      return {
        plan:     data.plan,
        approach: data.approach,
        hasBig5:  data.hasBig5,
        hasState: data.hasState,
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
