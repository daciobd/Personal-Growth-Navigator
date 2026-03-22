import { Router, type IRouter } from "express";
import { db, analyticsEventsTable } from "@workspace/db";
import { desc, count, sql } from "drizzle-orm";

const router: IRouter = Router();

// POST /analytics/events — ingest a tracking event (no auth required)
router.post("/events", async (req, res) => {
  try {
    const { eventName, anonymousId, sessionId, properties } = req.body;
    if (!eventName || typeof eventName !== "string") {
      res.status(400).json({ error: "eventName required" });
      return;
    }
    await db.insert(analyticsEventsTable).values({
      eventName,
      anonymousId: anonymousId ?? null,
      sessionId: sessionId ?? null,
      properties: properties ?? {},
    });
    res.json({ ok: true });
  } catch (err) {
    console.error("[analytics] ingest error", err);
    res.status(500).json({ error: "internal" });
  }
});

export default router;
