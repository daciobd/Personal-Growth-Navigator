// artifacts/api-server/src/data/adaptiveEngine.ts
//
// Motor de progressão adaptativa das jornadas.
//
// Lógica central:
//   • nota 1-2 por 1 dia   → dica de ajuste imediata (variante mais fácil)
//   • nota 1-2 por 2 dias  → prática alternativa da mesma fase
//   • nota 1-2 por 3+ dias → mudar abordagem terapêutica (estratégia alternativa)
//   • não completou 2 dias → "micro-passo" (versão mínima da prática)
//   • nota 4-5 por 3 dias  → desafio extra (versão aprofundada)
//   • nota 4-5 por 5 dias  → sinaliza pronto para avançar de fase antes do dia 10/20

import type { JourneyDay } from "./journeyCatalog.js";

export type AdaptiveSignal =
  | "on_track"          // 0-1 dia difícil → continua normal
  | "adjust_today"      // nota baixa hoje → ajusta descrição
  | "easier_variant"    // 2 dias difíceis → prática mais simples
  | "alternative_approach" // 3+ dias difíceis → muda abordagem
  | "micro_step"        // não completou 2+ dias → versão mínima
  | "deepen"            // 3+ dias ótimos → aprofundar
  | "ready_to_advance"; // 5+ dias ótimos → pode avançar fase

export type AdaptiveContext = {
  signal: AdaptiveSignal;
  reason: string;
  promptModifier: string;   // Instrução adicional ao Claude para adaptar
  uiHint?: string;          // Mensagem breve para exibir ao usuário
};

type CheckinSummary = {
  completed: boolean;
  note: number | null;
};

export function analyzeProgress(recentCheckins: CheckinSummary[]): AdaptiveContext {
  if (!recentCheckins.length) {
    return {
      signal: "on_track",
      reason: "Primeiro dia da jornada",
      promptModifier: "É o primeiro dia — seja especialmente encorajador e explique bem a prática.",
    };
  }

  const last3 = recentCheckins.slice(-3);
  const last5 = recentCheckins.slice(-5);

  // Contagens
  const notCompleted = last3.filter(c => !c.completed).length;
  const lowNotes     = last3.filter(c => c.completed && (c.note ?? 5) <= 2).length;
  const highNotes    = last5.filter(c => c.completed && (c.note ?? 0) >= 4).length;

  const avgNote = last3
    .filter(c => c.note !== null)
    .reduce((s, c, _, a) => s + (c.note ?? 0) / a.length, 0);

  // Regras em ordem de prioridade
  if (notCompleted >= 2) {
    return {
      signal: "micro_step",
      reason: `Não completou ${notCompleted} dos últimos 3 dias`,
      promptModifier: `O usuário não completou a prática nos últimos ${notCompleted} dias. 
Crie uma versão MICRO da prática: apenas 2-3 minutos, sem preparação, que pode ser feita agora mesmo onde está. 
Mencione explicitamente: "Vamos começar com algo menor — 2 minutos é suficiente para hoje."
O objetivo é quebrar o ciclo de não-fazer, não a qualidade da prática.`,
      uiHint: "Versão simplificada para hoje",
    };
  }

  if (lowNotes >= 3) {
    return {
      signal: "alternative_approach",
      reason: "3+ dias com notas 1-2",
      promptModifier: `O usuário está com dificuldade séria há ${lowNotes} dias consecutivos (notas muito baixas).
Esta prática não está funcionando. Proponha uma ABORDAGEM COMPLETAMENTE DIFERENTE para o mesmo tema:
- Se era TCC (pensamentos), mude para corpo/sensações (Mindfulness/Gestalt)
- Se era escrita/reflexão, mude para ação física
- Se era solitário, mude para envolver outra pessoa
- Se era longo, corte para 5 minutos máximo
Comece com: "Essa prática parece estar difícil para você no momento — vamos tentar algo diferente."`,
      uiHint: "Estratégia alternativa",
    };
  }

  if (lowNotes >= 2) {
    return {
      signal: "easier_variant",
      reason: "2 dias com notas 1-2",
      promptModifier: `O usuário teve dificuldade nos últimos 2 dias (notas baixas).
Crie uma versão SIMPLIFICADA da prática original: reduza o tempo pela metade, simplifique os passos, 
remova qualquer elemento que exija preparação ou condições especiais.
Valide a dificuldade: "É normal que algumas práticas precisem de ajuste."`,
      uiHint: "Versão adaptada",
    };
  }

  if (lowNotes === 1 || (avgNote > 0 && avgNote < 3)) {
    return {
      signal: "adjust_today",
      reason: "Nota baixa recente",
      promptModifier: `O usuário teve alguma dificuldade recentemente. 
Inclua uma dica de "como tornar mais fácil" específica para a prática de hoje.
Ofereça uma alternativa mais simples caso o passo principal pareça demais.`,
      uiHint: undefined,
    };
  }

  if (highNotes >= 5) {
    return {
      signal: "ready_to_advance",
      reason: "5+ dias com notas 4-5",
      promptModifier: `O usuário está indo excepcionalmente bem (notas altas consistentes).
Adicione um elemento de INTEGRAÇÃO: como essa habilidade se conecta com outras áreas da vida?
Sugira como levar a prática para além da sessão diária.
Mencione: "Você está pronto para integrar isso ao seu dia a dia de forma mais natural."`,
      uiHint: "Pronto para ir além",
    };
  }

  if (highNotes >= 3) {
    return {
      signal: "deepen",
      reason: "3+ dias com notas 4-5",
      promptModifier: `O usuário está indo bem (notas altas).
Adicione um DESAFIO EXTRA opcional ao final da prática: uma extensão de 5 minutos que aprofunda
a experiência para quem quiser ir além. Deixe claro que é opcional.`,
      uiHint: "Desafio extra disponível",
    };
  }

  return {
    signal: "on_track",
    reason: "Progresso estável",
    promptModifier: "O usuário está progredindo bem. Seja encorajador e específico sobre o dia.",
  };
}

// ── Formata resumo para o prompt ──────────────────────────
export function formatHistoryForPrompt(checkins: CheckinSummary[]): string {
  if (!checkins.length) return "";
  const last5 = checkins.slice(-5);
  const lines = last5.map((c, i) => {
    const dayLabel = `${last5.length - i} dia(s) atrás`;
    if (!c.completed) return `  • ${dayLabel}: não completou`;
    return `  • ${dayLabel}: completou, nota ${c.note ?? "?"}/5`;
  });
  return `HISTÓRICO RECENTE:\n${lines.join("\n")}`;
}
