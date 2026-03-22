import { pgTable, serial, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const analyticsEventsTable = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  eventName: text("event_name").notNull(),
  userId: integer("user_id"),
  anonymousId: text("anonymous_id"),
  sessionId: text("session_id"),
  properties: jsonb("properties").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type InsertAnalyticsEvent = typeof analyticsEventsTable.$inferInsert;
export type AnalyticsEvent = typeof analyticsEventsTable.$inferSelect;
