import { Router, type IRouter } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { db } from "@workspace/db";
import { dailyCheckinsTable } from "@workspace/db/schema";
import { gte, eq, and, count } from "drizzle-orm";

const router: IRouter = Router();

type Segment = "low" | "medium" | "high";
type AdaptLevel = "minimal" | "simplified" | "normal";

function segmentFromCount(n: number): Segment {
  if (n >= 5) return "high";
  if (n >= 2) return "medium";
  return "low";
}

function adaptationFromSegment(s: Segment): AdaptLevel {
  if (s === "high") return "normal";
  if (s === "medium") return "simplified";
  return "minimal";
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

function getDayOfWeek(): string {
  return ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][new Date().getDay()];
}

const planCache = new Map<string, { data: object; generatedAt: number }>();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

function buildPrompt(
  adaptLevel: AdaptLevel,
  currentAdjectives: string[],
  futureAdjectives: string[],
  timeOfDay: string,
  dayOfWeek: string,
  careMode: string
): string {
  const detail =
    adaptLevel === "minimal"
      ? "SIMPLES ao extremo: apenas título curto (máx 8 palavras) e instrução objetiva (máx 15 palavras). NÃO inclua steps nem why."
      : adaptLevel === "simplified"
      ? "SIMPLIFICADO: título claro, instrução direta, e exatamente 2 steps práticos. NÃO inclua why."
      : "COMPLETO: título motivador, instrução detalhada, 3-4 steps práticos, e why explicando o benefício.";

  const profile =
    currentAdjectives.length > 0
      ? `Perfil atual: ${currentAdjectives.slice(0, 5).join(", ")}. Meta: ${futureAdjectives.slice(0, 5).join(", ")}.`
      : "";

  return `Você é um coach de saúde comportamental. Gere UMA ação específica para hoje.
${profile}
Nível de adaptação: ${adaptLevel}. Regra: ${detail}
Momento: ${timeOfDay}, ${dayOfWeek}. Modo: ${careMode}.

Retorne APENAS JSON válido neste formato exato (sem markdown, sem texto extra):
{
  "title": "...",
  "instruction": "...",
  "type": "nutrition|movement|mindfulness|sleep|hydration|social",
  "effort": "low|medium|high",
  "trigger": "after_wakeup|breakfast|morning|afternoon|evening|before_sleep",
  "markerKey": "energy|mood|stress|sleep|glucose|hydration",
  "recommendedActionType": "meal_timing|hydration|exercise|reflection|breath|social",
  "steps": [],
  "why": ""
}
steps deve ser array vazio se adaptLevel for minimal.
why deve ser string vazia se adaptLevel não for normal.`;
}

router.post("/daily-plan", async (req, res) => {
  const {
    deviceId,
    careMode = "adult",
    currentAdjectives = [],
    futureAdjectives = [],
  } = req.body as {
    deviceId?: string;
    careMode?: string;
    currentAdjectives?: string[];
    futureAdjectives?: string[];
  };

  if (!deviceId) {
    res.status(400).json({ error: "deviceId é obrigatório" });
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const planId = `jornada-${deviceId}-${today}`;
  const cached = planCache.get(planId);
  if (cached && Date.now() - cached.generatedAt < CACHE_TTL_MS) {
    res.json(cached.data);
    return;
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [checkinRow] = await db
    .select({ cnt: count() })
    .from(dailyCheckinsTable)
    .where(
      and(
        eq(dailyCheckinsTable.deviceId, deviceId),
        gte(dailyCheckinsTable.createdAt, sevenDaysAgo)
      )
    );
  const checkinCount = Number(checkinRow?.cnt ?? 0);
  const segmentSource: "personal" | "none" = checkinCount > 0 ? "personal" : "none";
  const segment = segmentFromCount(checkinCount);
  const adaptLevel = adaptationFromSegment(segment);
  const experimentKey = `segment_adaptation_v1`;
  const experimentVariant = adaptLevel;

  const timeOfDay = getTimeOfDay();
  const dayOfWeek = getDayOfWeek();
  const prompt = buildPrompt(adaptLevel, currentAdjectives, futureAdjectives, timeOfDay, dayOfWeek, careMode);

  let actionData: Record<string, unknown> = {
    title: "Beba um copo de água agora",
    instruction: "Hidrate-se ao começar o dia.",
    type: "hydration",
    effort: "low",
    trigger: "after_wakeup",
    markerKey: "hydration",
    recommendedActionType: "hydration",
    steps: [],
    why: "",
  };

  try {
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = (msg.content[0] as { type: string; text: string }).text.trim();
    const jsonStr = raw.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();
    actionData = JSON.parse(jsonStr);
  } catch (err) {
    console.error("jornada daily-plan generation error:", err);
  }

  const uiHints = {
    maxVisibleActions: adaptLevel === "minimal" ? 1 : adaptLevel === "simplified" ? 2 : 3,
    tone: segment === "low" ? "calm" : "motivating",
    showWhy: adaptLevel === "normal",
    showProgress: true,
  };

  const response = {
    planId,
    generatedAt: new Date().toISOString(),
    careMode,
    behavioralSegment: segment,
    segmentSource,
    adaptation: {
      level: adaptLevel,
      experimentKey,
      experimentVariant,
    },
    action: {
      id: `${planId}-act1`,
      ...actionData,
      priority: 1,
    },
    uiHints,
  };

  planCache.set(planId, { data: response, generatedAt: Date.now() });
  res.json(response);
});

export default router;
