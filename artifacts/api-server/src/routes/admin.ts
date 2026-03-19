import { Router, type IRouter } from "express";
import { db, planLogsTable } from "@workspace/db";
import { desc, count, sql } from "drizzle-orm";
import { INTERVENTIONS } from "@workspace/content/interventions";
import { CURRENT_ADJECTIVES, FUTURE_ADJECTIVES, CATEGORIES } from "@workspace/content/adjectives";

const router: IRouter = Router();

// GET /api/admin/stats — dashboard overview
router.get("/stats", async (_req, res) => {
  try {
    const [totalPlans] = await db.select({ count: count() }).from(planLogsTable);
    const [recentActivity] = await db
      .select({ count: count() })
      .from(planLogsTable)
      .where(sql`created_at > now() - interval '7 days'`);

    const allLogs = await db
      .select({
        currentAdjectives: planLogsTable.currentAdjectives,
        futureAdjectives: planLogsTable.futureAdjectives,
      })
      .from(planLogsTable);

    const currentFreq: Record<string, number> = {};
    const futureFreq: Record<string, number> = {};
    for (const log of allLogs) {
      for (const adj of log.currentAdjectives ?? []) {
        currentFreq[adj] = (currentFreq[adj] ?? 0) + 1;
      }
      for (const adj of log.futureAdjectives ?? []) {
        futureFreq[adj] = (futureFreq[adj] ?? 0) + 1;
      }
    }

    const topCurrentAdjectives = Object.entries(currentFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([adj, count]) => ({ adj, count }));

    const topFutureAdjectives = Object.entries(futureFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([adj, count]) => ({ adj, count }));

    res.json({
      totalPlans: totalPlans.count,
      plansLast7Days: recentActivity.count,
      totalInterventions: INTERVENTIONS.length,
      totalCurrentAdjectives: CURRENT_ADJECTIVES.length,
      totalFutureAdjectives: FUTURE_ADJECTIVES.length,
      topCurrentAdjectives,
      topFutureAdjectives,
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
});

// GET /api/admin/logs — recent plan logs
router.get("/logs", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const logs = await db
      .select()
      .from(planLogsTable)
      .orderBy(desc(planLogsTable.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({ logs, total: logs.length });
  } catch (error) {
    console.error("Logs error:", error);
    res.status(500).json({ error: "Erro ao buscar logs" });
  }
});

// GET /api/admin/interventions — list all static interventions
router.get("/interventions", (_req, res) => {
  res.json({ interventions: INTERVENTIONS });
});

// GET /api/admin/adjectives — list all adjectives organized by category
router.get("/adjectives", (_req, res) => {
  const currentByCategory: Record<string, string[]> = {};
  const futureByCategory: Record<string, string[]> = {};

  for (const cat of CATEGORIES) {
    currentByCategory[cat] = CURRENT_ADJECTIVES
      .filter((a) => a.category === cat)
      .map((a) => a.label);
    futureByCategory[cat] = FUTURE_ADJECTIVES
      .filter((a) => a.category === cat)
      .map((a) => a.label);
  }

  res.json({
    categories: CATEGORIES,
    current: CURRENT_ADJECTIVES,
    future: FUTURE_ADJECTIVES,
    currentByCategory,
    futureByCategory,
  });
});

// POST /api/admin/simulate — simulate plan generation
router.post("/simulate", (req, res) => {
  const { currentAdjectives, futureAdjectives } = req.body as {
    currentAdjectives: string[];
    futureAdjectives: string[];
  };

  if (!Array.isArray(currentAdjectives) || !Array.isArray(futureAdjectives)) {
    res.status(400).json({ error: "currentAdjectives and futureAdjectives são obrigatórios" });
    return;
  }

  const scored = INTERVENTIONS.map((intervention) => {
    let score = 0;
    for (const adj of currentAdjectives) {
      if (intervention.fromAdjectives.includes(adj)) score += 2;
    }
    for (const adj of futureAdjectives) {
      if (intervention.toAdjectives.includes(adj)) score += 2;
    }
    return { intervention, score };
  }).sort((a, b) => b.score - a.score);

  const relevantInterventions = scored.filter((s) => s.score > 0);
  const approachCoverage: Record<string, number> = {};
  for (const { intervention } of relevantInterventions) {
    approachCoverage[intervention.therapy] = (approachCoverage[intervention.therapy] ?? 0) + 1;
  }

  res.json({
    profileSummary: {
      currentCount: currentAdjectives.length,
      futureCount: futureAdjectives.length,
    },
    relevantInterventions: relevantInterventions.slice(0, 10).map((s) => ({
      id: s.intervention.id,
      title: s.intervention.title,
      therapy: s.intervention.therapy,
      score: s.score,
    })),
    approachCoverage,
    prompt: `EU HOJE: ${currentAdjectives.join(", ")}\nEU FUTURO: ${futureAdjectives.join(", ")}`,
  });
});

export default router;
