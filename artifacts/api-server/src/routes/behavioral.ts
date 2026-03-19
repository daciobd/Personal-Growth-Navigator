import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { behavioralEventsTable, type InsertBehavioralEvent } from "@workspace/db/schema";

const router: IRouter = Router();

router.post("/events", async (req, res) => {
  const { events } = req.body as {
    events?: Array<{
      eventType: string;
      userId?: string;
      planId?: string;
      actionId?: string;
      timestamp?: string;
      careMode?: string;
      behavioralSegment?: string;
      adaptationLevel?: string;
      experimentKey?: string;
      experimentVariant?: string;
      markerKey?: string;
      recommendedActionType?: string;
      metadata?: Record<string, unknown>;
    }>;
  };

  if (!Array.isArray(events) || events.length === 0) {
    res.status(400).json({ error: "events deve ser um array não vazio" });
    return;
  }

  const VALID_TYPES = new Set(["plan_loaded", "done", "missed"]);
  const invalid = events.find((e) => !VALID_TYPES.has(e.eventType));
  if (invalid) {
    res.status(400).json({ error: `eventType inválido: ${invalid.eventType}` });
    return;
  }

  const rows: InsertBehavioralEvent[] = events.map((e) => ({
    eventType: e.eventType,
    userId: e.userId ?? null,
    planId: e.planId ?? null,
    actionId: e.actionId ?? null,
    eventTimestamp: e.timestamp ? new Date(e.timestamp) : new Date(),
    careMode: e.careMode ?? null,
    behavioralSegment: e.behavioralSegment ?? null,
    adaptationLevel: e.adaptationLevel ?? null,
    experimentKey: e.experimentKey ?? null,
    experimentVariant: e.experimentVariant ?? null,
    markerKey: e.markerKey ?? null,
    recommendedActionType: e.recommendedActionType ?? null,
    metadata: (e.metadata ?? {}) as Record<string, unknown>,
  }));

  await db.insert(behavioralEventsTable).values(rows);

  res.json({ ok: true, logged: rows.length });
});

export default router;
