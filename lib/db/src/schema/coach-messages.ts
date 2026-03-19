import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const coachMessagesTable = pgTable("coach_messages", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  xpEarned: integer("xp_earned").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type InsertCoachMessage = typeof coachMessagesTable.$inferInsert;
export type CoachMessage = typeof coachMessagesTable.$inferSelect;
