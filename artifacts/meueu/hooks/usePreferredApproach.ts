import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type PreferredApproach = {
  key: string;
  selectedAt: string;
  daysSince: number;
};

const APPROACH_INSTRUCTIONS: Record<string, string> = {
  tcc: `ABORDAGEM PREFERIDA DO USUÁRIO: TCC (Terapia Cognitivo-Comportamental).
O usuário escolheu essa perspectiva porque faz sentido pra ele identificar e mudar pensamentos que o travam.
Use linguagem de TCC: pensamentos automáticos, evidências, registros, experimentos comportamentais.
Pergunte "o que você estava pensando quando isso aconteceu?" em vez de "como você se sentiu?".`,

  act: `ABORDAGEM PREFERIDA DO USUÁRIO: ACT (Aceitação e Compromisso).
O usuário escolheu essa perspectiva porque quer agir pelos valores mesmo quando tem medo ou dúvida.
Use linguagem de ACT: valores, ação comprometida, desfusão, aceitação.
Não tente mudar pensamentos — ajude a agir apesar deles.`,

  "psicologia-positiva": `ABORDAGEM PREFERIDA DO USUÁRIO: Psicologia Positiva.
O usuário escolheu essa perspectiva porque prefere construir a partir do que já funciona nele.
Use linguagem de forças: o que está indo bem, pequenas vitórias, gratidão, amplificação do positivo.
Não foque nos problemas — foque nas exceções e nos recursos que já existem.`,

  cft: `ABORDAGEM PREFERIDA DO USUÁRIO: CFT (Terapia Focada na Compaixão).
O usuário escolheu essa perspectiva porque percebe que é muito duro consigo mesmo.
Use linguagem de autocompaixão: gentileza, humanidade compartilhada, voz do amigo compassivo.
Nunca use linguagem de exigência ou metas — use linguagem de cuidado.`,

  narrativa: `ABORDAGEM PREFERIDA DO USUÁRIO: Terapia Narrativa.
O usuário escolheu essa perspectiva porque vê a vida como uma história que pode ser reescrita.
Use linguagem narrativa: capítulos, personagens, re-autoria, exceções à história-problema.
Pergunte "em quais momentos você age diferente da história que conta sobre si mesmo?".`,

  tfs: `ABORDAGEM PREFERIDA DO USUÁRIO: TFS (Terapia Focada na Solução).
O usuário escolheu essa perspectiva porque prefere focar no que quer, não no que não quer.
Use linguagem de solução: o que já está funcionando, o menor passo possível, escalas de 0 a 10.
Nunca analise o problema — pergunte como seria quando o problema estivesse resolvido.`,

  humanista: `ABORDAGEM PREFERIDA DO USUÁRIO: Abordagem Humanista.
O usuário escolheu essa perspectiva porque acredita na própria capacidade de crescer.
Use linguagem de autenticidade: ser você mesmo, tendência atualizante, congruência.
Confie na sabedoria do usuário — sua função é criar espaço, não dar direção.`,
};

export function usePreferredApproach() {
  const [preferred, setPreferred] = useState<PreferredApproach | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const key = await AsyncStorage.getItem("@meueu_preferred_approach");
      const selectedAt = await AsyncStorage.getItem("@meueu_approach_selected_at");
      if (key && selectedAt) {
        const days = Math.floor(
          (Date.now() - new Date(selectedAt).getTime()) / 86400000
        );
        setPreferred({ key, selectedAt, daysSince: days });
      }
    } catch {}
    setLoading(false);
  }

  const clearPreference = useCallback(async () => {
    await AsyncStorage.removeItem("@meueu_preferred_approach");
    await AsyncStorage.removeItem("@meueu_approach_selected_at");
    setPreferred(null);
  }, []);

  const approachContext = preferred
    ? (APPROACH_INSTRUCTIONS[preferred.key] ?? "")
    : "";

  const shouldSuggestReview = preferred ? preferred.daysSince >= 30 : false;

  return {
    preferred,
    approachContext,
    loading,
    clearPreference,
    shouldSuggestReview,
  };
}
