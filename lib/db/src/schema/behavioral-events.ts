import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const behavioralEventsTable = pgTable("behavioral_events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(),
  userId: text("user_id"),
  planId: text("plan_id"),
  actionId: text("action_id"),
  eventTimestamp: timestamp("event_timestamp", { withTimezone: true }).notNull(),
  careMode: text("care_mode"),
  behavioralSegment: text("behavioral_segment"),
  adaptationLevel: text("adaptation_level"),
  experimentKey: text("experiment_key"),
  experimentVariant: text("experiment_variant"),
  markerKey: text("marker_key"),
  recommendedActionType: text("recommended_action_type"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type InsertBehavioralEvent = typeof behavioralEventsTable.$inferInsert;
export type BehavioralEvent = typeof behavioralEventsTable.$inferSelect;
