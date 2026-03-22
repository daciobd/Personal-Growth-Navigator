import { Router, type IRouter } from "express";
import { db, analyticsEventsTable } from "@workspace/db";
import { count, sql } from "drizzle-orm";

const router: IRouter = Router();

const FUNNEL_STEPS = [
  "onboarding_started",
  "onboarding_problem_selected",
  "plan_generated",
  "practice_started",
  "practice_completed",
];

// GET /admin/analytics/funnel
router.get("/funnel", async (_req, res) => {
  try {
    const results = await Promise.all(
      FUNNEL_STEPS.map(async (step) => {
        const [row] = await db
          .select({ n: count() })
          .from(analyticsEventsTable)
          .where(sql`event_name = ${step}`);
        return { step, count: Number(row?.n ?? 0) };
      })
    );
    res.json(results);
  } catch (err) {
    console.error("[analytics-admin] funnel error", err);
    res.status(500).json({ error: "internal" });
  }
});

// GET /admin/analytics/daily?days=14
router.get("/daily", async (req, res) => {
  try {
    const days = Number(req.query.days ?? 14);
    const rows = await db
      .select({
        day: sql<string>`DATE(created_at)`,
        event: analyticsEventsTable.eventName,
        n: count(),
      })
      .from(analyticsEventsTable)
      .where(sql`created_at > now() - interval '${sql.raw(String(days))} days'`)
      .groupBy(sql`DATE(created_at)`, analyticsEventsTable.eventName)
      .orderBy(sql`DATE(created_at)`);
    res.json(rows);
  } catch (err) {
    console.error("[analytics-admin] daily error", err);
    res.status(500).json({ error: "internal" });
  }
});

// GET /admin/analytics/top-events?limit=10
router.get("/top-events", async (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 10);
    const rows = await db
      .select({ event: analyticsEventsTable.eventName, n: count() })
      .from(analyticsEventsTable)
      .groupBy(analyticsEventsTable.eventName)
      .orderBy(sql`count(*) desc`)
      .limit(limit);
    res.json(rows);
  } catch (err) {
    console.error("[analytics-admin] top-events error", err);
    res.status(500).json({ error: "internal" });
  }
});

// GET /admin/analytics/problem-breakdown
router.get("/problem-breakdown", async (_req, res) => {
  try {
    const rows = await db
      .select({
        problem: sql<string>`properties->>'problem'`,
        n: count(),
      })
      .from(analyticsEventsTable)
      .where(sql`event_name = 'onboarding_problem_selected' AND properties->>'problem' IS NOT NULL`)
      .groupBy(sql`properties->>'problem'`)
      .orderBy(sql`count(*) desc`);
    res.json(rows);
  } catch (err) {
    console.error("[analytics-admin] problem-breakdown error", err);
    res.status(500).json({ error: "internal" });
  }
});

// GET /admin/analytics/overview
router.get("/overview", async (_req, res) => {
  try {
    const [total] = await db.select({ n: count() }).from(analyticsEventsTable);
    const [today] = await db
      .select({ n: count() })
      .from(analyticsEventsTable)
      .where(sql`DATE(created_at) = CURRENT_DATE`);
    const [sessions] = await db
      .select({ n: sql<number>`COUNT(DISTINCT anonymous_id)` })
      .from(analyticsEventsTable);
    const [completed] = await db
      .select({ n: count() })
      .from(analyticsEventsTable)
      .where(sql`event_name = 'practice_completed'`);
    const [started] = await db
      .select({ n: count() })
      .from(analyticsEventsTable)
      .where(sql`event_name = 'onboarding_started'`);
    res.json({
      totalEvents: Number(total?.n ?? 0),
      todayEvents: Number(today?.n ?? 0),
      uniqueUsers: Number(sessions?.n ?? 0),
      practicesCompleted: Number(completed?.n ?? 0),
      onboardingsStarted: Number(started?.n ?? 0),
    });
  } catch (err) {
    console.error("[analytics-admin] overview error", err);
    res.status(500).json({ error: "internal" });
  }
});

export default router;
