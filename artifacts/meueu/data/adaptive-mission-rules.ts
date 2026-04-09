// ─── Adaptive Mission Rules ─────────────────────────────────────────────────
// Explicit rules that translate adaptiveProfile into prompt instructions
// for the plan generation AI. Each rule shapes the first mission's tone,
// scope, and structure.

import type { InferredTag, PrimaryStruggleId } from "./adaptive-onboarding";

// ─── Per-Struggle: shapes the TYPE of first mission ─────────────────────────

export type StruggleRule = {
  missionType: string;
  promptInstruction: string;
};

export const STRUGGLE_RULES: Record<PrimaryStruggleId, StruggleRule> = {
  start: {
    missionType: "missão curta de entrada",
    promptInstruction:
      "A primeira prática deve ser extremamente curta (máximo 5 minutos) e ter um único passo de ação concreto. O objetivo é FAZER alguma coisa, por menor que seja. Nada de planejamento — só ação.",
  },
  continue: {
    missionType: "missão de retomada",
    promptInstruction:
      "A primeira prática deve ajudar a pessoa a retomar algo que já começou. Foque em um passo pequeno que reconecta com o progresso existente. Valide o que já foi feito antes de propor o próximo passo.",
  },
  focus: {
    missionType: "missão de tarefa única por poucos minutos",
    promptInstruction:
      "A primeira prática deve ter UMA ÚNICA tarefa clara, com tempo definido (5-10 min). Sem múltiplos passos simultâneos. O objetivo é completar uma coisa com atenção total.",
  },
  organize: {
    missionType: "missão de listar 3 e escolher 1",
    promptInstruction:
      "A primeira prática deve pedir para listar 3 coisas pendentes e escolher apenas 1 para fazer agora. O objetivo é reduzir a carga mental. Inclua um passo para descartar ou adiar as outras 2 conscientemente.",
  },
  understand: {
    missionType: "missão de definir próximo passo visível",
    promptInstruction:
      "A primeira prática deve ajudar a pessoa a transformar confusão em um único próximo passo concreto. Use perguntas guiadas simples (máximo 3). O resultado deve ser uma frase que começa com um verbo de ação.",
  },
  cant_explain: {
    missionType: "missão exploratória gentil",
    promptInstruction:
      "A primeira prática deve ser acolhedora e sem pressão. Algo como escrever livremente por 3 minutos ou nomear o que está sentindo. Não force clareza — valide a confusão como ponto de partida legítimo.",
  },
};

// ─── Per-Tag: MODIFIES the mission tone and scope ───────────────────────────

export type TagModifier = {
  promptModifier: string;
};

export const TAG_MODIFIERS: Record<InferredTag, TagModifier> = {
  activation_friction: {
    promptModifier:
      "Reduza a barreira de início ao mínimo. O primeiro passo deve ser tão simples que não exija motivação — só decisão.",
  },
  attention_scatter: {
    promptModifier:
      "Práticas devem ter tempo fixo e curto. Inclua uma instrução explícita para silenciar notificações. Uma tarefa por vez.",
  },
  priority_confusion: {
    promptModifier:
      "Inclua um critério simples de priorização (ex: 'o que dá pra fazer em 15min?'). Elimine escolhas — dê uma recomendação clara.",
  },
  perfectionism: {
    promptModifier:
      "Use linguagem de permissão: 'feito é melhor que perfeito', 'não precisa ser bom, só precisa existir'. Reduza o escopo da prática para algo impossível de falhar. Defina 'sucesso' como apenas ter tentado.",
  },
  overwhelm: {
    promptModifier:
      "Simplifique radicalmente. Máximo 3 passos por prática. Se a prática parece grande, quebre em metade. Use a frase: 'só isso, nada mais por agora'.",
  },
  emotional_resistance: {
    promptModifier:
      "Não force produtividade. Valide o estado emocional antes de propor ação. A primeira prática pode ser observar sem agir. Use tom gentil e sem julgamento.",
  },
  low_energy: {
    promptModifier:
      "Práticas devem ser possíveis mesmo deitado ou sentado. Nada que exija esforço físico ou mental intenso. 'Mínimo viável' é a regra.",
  },
  lack_of_system: {
    promptModifier:
      "Inclua uma micro-rotina ou checklist simples (máximo 3 itens). O objetivo não é organizar tudo — é ter UM ponto de ancoragem.",
  },
  goal_ambiguity: {
    promptModifier:
      "Não presuma que a pessoa sabe o que quer. Inclua uma pergunta de clarificação como primeiro passo. O objetivo é sair com UMA direção, não um plano completo.",
  },
  validation_dependency: {
    promptModifier:
      "Inclua critérios internos de sucesso ('você vai saber que fez certo quando...'). Reduza dependência de feedback externo. Encoraje auto-avaliação.",
  },
};

// ─── Build prompt block from adaptiveProfile ────────────────────────────────

export function buildAdaptivePromptBlock(profile: {
  primaryStruggle: PrimaryStruggleId;
  inferredTags: InferredTag[];
}): string {
  const rule = STRUGGLE_RULES[profile.primaryStruggle];

  const tagLines = profile.inferredTags
    .map((tag) => TAG_MODIFIERS[tag]?.promptModifier)
    .filter(Boolean);

  const lines = [
    "PERFIL ADAPTATIVO DO USUÁRIO (use para personalizar a PRIMEIRA prática):",
    `  Dificuldade principal: ${profile.primaryStruggle} → ${rule.missionType}`,
    `  Instrução: ${rule.promptInstruction}`,
  ];

  if (tagLines.length > 0) {
    lines.push("  Modificadores de tom e escopo:");
    tagLines.forEach((mod) => lines.push(`    - ${mod}`));
  }

  lines.push(
    "  → A PRIMEIRA prática do array deve refletir todas essas regras.",
    "  → As demais práticas podem ser mais amplas, mas mantenha coerência com o perfil."
  );

  return lines.join("\n") + "\n\n";
}
