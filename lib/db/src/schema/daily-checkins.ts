import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const dailyCheckinsTable = pgTable("daily_checkins", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").notNull(),
  date: text("date").notNull(),
  practiceIndex: integer("practice_index").notNull(),
  practiceName: text("practice_name").notNull(),
  aiAction: text("ai_action"),
  completed: boolean("completed").notNull().default(false),
  rating: integer("rating"),
  note: text("note"),
  aiTip: text("ai_tip"),
  xpEarned: integer("xp_earned").notNull().default(0),
  streakDays: integer("streak_days").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type InsertDailyCheckin = typeof dailyCheckinsTable.$inferInsert;
export type DailyCheckin = typeof dailyCheckinsTable.$inferSelect;
