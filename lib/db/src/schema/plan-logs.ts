import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const planLogsTable = pgTable("plan_logs", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id"),
  currentAdjectives: jsonb("current_adjectives").$type<string[]>().notNull(),
  futureAdjectives: jsonb("future_adjectives").$type<string[]>().notNull(),
  sintese: text("sintese"),
  fraseIntencao: text("frase_intencao"),
  praticas: jsonb("praticas").$type<any[]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertPlanLogSchema = createInsertSchema(planLogsTable).omit({ id: true, createdAt: true });
export type InsertPlanLog = z.infer<typeof insertPlanLogSchema>;
export type PlanLog = typeof planLogsTable.$inferSelect;
