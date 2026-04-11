import { Router, type IRouter } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { db, coachMessagesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import {
  APPROACH_INSTRUCTIONS,
  COACH_BASE_PROMPT,
  COACH_PROMPT_VERSION,
  OPTION_TYPE_ORDER,
} from "../prompts/coachPrompt.js";
import {
  normalizeCoachResponse,
  withAdaptiveMeta,
  type NormalizedResult,
} from "../prompts/normalizeCoachResponse.js";
import {
  buildAdaptiveFallback,
  buildAdaptivePromptBlock,
  decidePriority,
  type AdaptiveSignals,
} from "../prompts/coachAdaptiveSignals.js";

const router: IRouter = Router();

// ─── Types ──────────────────────────────────────────────────────────────────

type Message = { role: "user" | "assistant"; content: string };

type HealthContext = {
  careMode?: string;
  biomarkerFocus?: { key: string; label: string; status: string; value?: number; unit?: string };
  clinicalSummary?: string;
  targetOutcome?: string;
  barriers?: string[];
};

type UserContext = {
  problemLabel?: string;
  currentAdjectives?: string[];
  futureAdjectives?: string[];
};

// ─── Build system prompt ───────────────────────────────────────────────────

function buildSystemPrompt(
  preferredApproach?: string,
  practiceName?: string,
  planContext?: string,
  healthContext?: HealthContext,
  userContext?: UserContext,
  adaptivePromptBlock?: string
): string {
  let system = COACH_BASE_PROMPT;

  // Adaptive priority block — injected first so it shapes the LLM's framing
  if (adaptivePromptBlock) {
    system += adaptivePromptBlock;
  }

  // Onboarding context — ajuda o coach a entender o ponto de partida do usuário
  if (userContext) {
    const lines: string[] = [];
    if (userContext.problemLabel) {
      lines.push(`Problema declarado no onboarding: "${userContext.problemLabel}"`);
    }
    if (userContext.currentAdjectives?.length) {
      lines.push(`Como o usuário se descreve hoje: ${userContext.currentAdjectives.join(", ")}`);
    }
    if (userContext.futureAdjectives?.length) {
      lines.push(`Quem o usuário quer se tornar: ${userContext.futureAdjectives.join(", ")}`);
    }
    if (lines.length > 0) {
      system += `\n\nCONTEXTO DO USUÁRIO (do onboarding — use para personalizar a direção, sem citar literalmente):\n${lines.join("\n")}`;
    }
  }

  // Abordagem preferida
  if (preferredApproach && APPROACH_INSTRUCTIONS[preferredApproach]) {
    system += `\n\nABORDAGEM PREFERIDA PELO USUÁRIO:\n${APPROACH_INSTRUCTIONS[preferredApproach]}`;
    system += `\nSe o usuário pedir uma perspectiva diferente, mude sem resistência.`;
  }

  // Contexto da prática
  if (practiceName) {
    system += `\n\nCONTEXTO: O usuário acabou de fazer (ou está pensando em fazer) a prática "${practiceName}". Relate sua resposta a isso quando relevante.`;
  }

  // Contexto do plano
  if (planContext) {
    system += `\n\nPLANO DO USUÁRIO:\n${planContext}`;
  }

  // Contexto de saúde (Longevi)
  if (healthContext) {
    const lines: string[] = [];
    if (healthContext.clinicalSummary) lines.push(`Contexto clínico: ${healthContext.clinicalSummary}`);
    if (healthContext.biomarkerFocus) {
      const b = healthContext.biomarkerFocus;
      const v = b.value !== undefined ? ` (${b.value} ${b.unit ?? ""})` : "";
      lines.push(`Biomarcador em atenção: ${b.label}${v} — ${b.status}`);
    }
    if (healthContext.targetOutcome) lines.push(`Objetivo do usuário: ${healthContext.targetOutcome}`);
    if (healthContext.barriers?.length) lines.push(`Barreiras relatadas: ${healthContext.barriers.join(", ")}`);
    if (lines.length > 0) {
      system += `\n\nCONTEXTO DE SAÚDE (via Longevi — use para personalizar, sem alarmismo):\n${lines.join("\n")}\nAdapte suas sugestões para endereçar as barreiras do usuário. Nunca faça diagnósticos.`;
    }
  }

  return system;
}

// ─── POST /message ────────────────────────────────────────────────────────────

router.post("/message", async (req, res) => {
  const {
    deviceId,
    message,
    history,
    preferredApproach,
    practiceName,
    planContext,
    healthContext,
    userContext,
    adaptiveSignals,
  } = req.body as {
    deviceId: string;
    message: string;
    history?: Message[];
    preferredApproach?: string;
    practiceName?: string;
    planContext?: string;
    healthContext?: HealthContext;
    userContext?: UserContext;
    adaptiveSignals?: AdaptiveSignals;
  };

  if (!deviceId || !message) {
    res.status(400).json({ error: "deviceId e message são obrigatórios" });
    return;
  }

  // ─── Adaptive engine: decide priority before building the prompt ────
  const decision = decidePriority(adaptiveSignals ?? {});
  const adaptiveBlock = buildAdaptivePromptBlock(decision);

  // Carrega histórico do DB se não veio no body
  let dbHistory: Message[] = [];
  if (!history || history.length === 0) {
    const stored = await db
      .select()
      .from(coachMessagesTable)
      .where(eq(coachMessagesTable.deviceId, deviceId))
      .orderBy(asc(coachMessagesTable.createdAt))
      .limit(20);

    dbHistory = stored.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
  } else {
    dbHistory = history.slice(-20);
  }

  const messages: Message[] = [...dbHistory, { role: "user", content: message }];

  // Default: adaptive fallback (respects priority) if LLM call fails entirely.
  const adaptiveFallback = buildAdaptiveFallback(decision);
  let normalized: NormalizedResult = {
    data: adaptiveFallback,
    meta: {
      promptVersion: COACH_PROMPT_VERSION,
      usedFallback: true,
      missingTypes: [...OPTION_TYPE_ORDER],
      duplicateTypes: [],
      parseError: "llm_unavailable",
    },
  };

  try {
    const aiResponse = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 800,
      system: buildSystemPrompt(
        preferredApproach,
        practiceName,
        planContext,
        healthContext,
        userContext,
        adaptiveBlock
      ),
      messages,
    });

    const content = aiResponse.content[0];
    if (content.type === "text") {
      normalized = normalizeCoachResponse(content.text);
    }
  } catch (err) {
    console.error("Coach error:", err);
  }

  // Attach adaptive metadata to whatever result we ended up with
  normalized = withAdaptiveMeta(normalized, decision.priorityType, decision.reason);

  // Persist: store the message text only (options are ephemeral session state)
  await db.insert(coachMessagesTable).values([
    { deviceId, role: "user", content: message, xpEarned: 0 },
    { deviceId, role: "assistant", content: normalized.data.message, xpEarned: 2 },
  ]);

  res.json({
    response: normalized.data.message,
    options: normalized.data.options,
    meta: normalized.meta,
    xpEarned: 2,
  });
});

// ─── GET /history ─────────────────────────────────────────────────────────────

router.get("/history", async (req, res) => {
  const { deviceId } = req.query as { deviceId: string };

  if (!deviceId) {
    res.status(400).json({ error: "deviceId é obrigatório" });
    return;
  }

  const history = await db
    .select()
    .from(coachMessagesTable)
    .where(eq(coachMessagesTable.deviceId, deviceId))
    .orderBy(asc(coachMessagesTable.createdAt))
    .limit(50);

  res.json({
    history: history.map((m) => ({
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    })),
  });
});

export default router;
