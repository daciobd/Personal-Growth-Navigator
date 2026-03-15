/**
 * Adaptive Engine — analisa os últimos check-ins e retorna um sinal
 * com modificador de prompt para o Claude ajustar o desafio diário.
 *
 * 7 sinais:
 *   neutral          — sem ajuste necessário
 *   subtle_adjust    — nota muito baixa ontem → ajuste sutil
 *   simplify         — 2 dias com notas baixas → versão de 2 minutos
 *   approach_change  — 3 dias com notas baixas → mudar abordagem terapêutica
 *   add_challenge    — 3 dias com notas altas → nível extra de dificuldade
 *   integration_ready — 5 dias consecutivos altos → integração no mundo real
 *   checkin_missing  — sem registros recentes → reengajamento suave
 */

export type AdaptiveSignal =
  | "neutral"
  | "subtle_adjust"
  | "simplify"
  | "approach_change"
  | "add_challenge"
  | "integration_ready"
  | "checkin_missing";

export interface AdaptiveAnalysis {
  signal: AdaptiveSignal;
  promptModifier: string;
  displayMessage: string | null;
}

export interface CheckinRecord {
  date: string;
  completed: boolean;
  rating: number | null;
}

export function analyzeProgress(history: CheckinRecord[]): AdaptiveAnalysis {
  if (history.length === 0) {
    return { signal: "neutral", promptModifier: "", displayMessage: null };
  }

  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));

  // Verificar reengajamento: sem check-in nos últimos 3 dias
  const lastDate = new Date(sorted[0].date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysSinceLast = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceLast >= 3) {
    return {
      signal: "checkin_missing",
      promptModifier:
        "O usuário ficou ausente por alguns dias. Crie uma prática de boas-vindas de volta: muito curta (1-2 minutos), acolhedora, sem julgamento. Celebre o retorno.",
      displayMessage: "Bem-vindo(a) de volta! Começando com calma.",
    };
  }

  const last5 = sorted.slice(0, 5);
  const last3 = sorted.slice(0, 3);
  const last2 = sorted.slice(0, 2);
  const last1 = sorted.slice(0, 1);

  const consecutiveDays = countConsecutiveDays(sorted);

  // 5 dias consecutivos com notas altas → pronto para integração
  if (consecutiveDays >= 5) {
    const last5Ratings = ratingsOf(last5);
    if (last5Ratings.length >= 3 && last5Ratings.every((r) => r >= 4)) {
      return {
        signal: "integration_ready",
        promptModifier:
          "O usuário está em excelente progressão por 5 dias seguidos com notas altas. " +
          "Proponha uma integração real: use essa habilidade em uma situação difícil do mundo real esta semana. " +
          "Aumente significativamente o desafio e inclua uma reflexão sobre o impacto na vida cotidiana.",
        displayMessage: "Você está pronto(a) para o próximo nível!",
      };
    }
  }

  // 3 dias com notas altas → adicionar desafio
  if (last3.length >= 3) {
    const r3 = ratingsOf(last3);
    if (r3.length >= 2 && r3.every((r) => r >= 4)) {
      return {
        signal: "add_challenge",
        promptModifier:
          "O usuário está indo muito bem (notas altas por 3+ dias). " +
          "Proponha uma versão mais profunda e desafiadora: adicione uma camada de consciência, " +
          "aumente a duração ou introduza uma variação mais complexa da prática.",
        displayMessage: "Desafio ampliado para você!",
      };
    }
  }

  // 3 dias com notas baixas → trocar abordagem terapêutica
  if (last3.length >= 3) {
    const r3 = ratingsOf(last3);
    if (r3.length >= 2 && r3.filter((r) => r <= 3).length >= r3.length - 1) {
      return {
        signal: "approach_change",
        promptModifier:
          "O usuário teve notas baixas por 3 dias seguidos — a abordagem atual não está funcionando. " +
          "Proponha uma abordagem COMPLETAMENTE diferente: " +
          "se a prática era cognitiva (pensamentos, crenças), mude para corpo (respiração, sensações físicas, movimento). " +
          "Se era verbal/analítica, mude para visual, imaginativa ou cinestésica. " +
          "Não mencione a troca — apenas ofereça a nova prática naturalmente.",
        displayMessage: "Nova abordagem para hoje.",
      };
    }
  }

  // 2 dias com notas baixas → simplificar
  if (last2.length >= 2) {
    const r2 = ratingsOf(last2);
    if (r2.length >= 1 && r2.filter((r) => r <= 3).length >= 1) {
      return {
        signal: "simplify",
        promptModifier:
          "O usuário está com dificuldade (notas baixas por 2 dias). " +
          "Crie uma versão SIMPLIFICADA: reduza para 2 minutos, elimine passos complexos, " +
          "foque em UMA única ação mínima e realizável. Priorize o que é fácil de completar.",
        displayMessage: "Prática simplificada para hoje.",
      };
    }
  }

  // 1 dia com nota muito baixa → ajuste sutil
  if (last1.length >= 1) {
    const r = last1[0].rating;
    if (r !== null && r <= 2) {
      return {
        signal: "subtle_adjust",
        promptModifier:
          "O usuário teve nota baixa ontem. Ajuste sutilmente: " +
          "ofereça uma variação levemente mais acessível, reduza 20% do tempo ou simplifique um passo.",
        displayMessage: null,
      };
    }
  }

  return { signal: "neutral", promptModifier: "", displayMessage: null };
}

function ratingsOf(records: CheckinRecord[]): number[] {
  return records.map((r) => r.rating ?? 0).filter((r) => r > 0);
}

function countConsecutiveDays(sortedDesc: CheckinRecord[]): number {
  if (sortedDesc.length === 0) return 0;
  let count = 1;
  for (let i = 1; i < sortedDesc.length; i++) {
    const curr = new Date(sortedDesc[i].date);
    const prev = new Date(sortedDesc[i - 1].date);
    const diff = Math.round(
      (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diff === 1) {
      count++;
    } else {
      break;
    }
  }
  return count;
}
