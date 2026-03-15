// lib/db/src/schema/journeys.ts

import {
  pgTable, serial, text, integer, boolean,
  timestamp, jsonb, date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ── Definição das jornadas (catálogo) ─────────────────────
// Armazenado em código (journeyCatalog.ts), não no banco.
// O banco só guarda progresso do usuário.

// ── Progresso do usuário numa jornada ────────────────────
export const userJourneysTable = pgTable("user_journeys", {
  id:           serial("id").primaryKey(),
  deviceId:     text("device_id").notNull(),
  journeyId:    text("journey_id").notNull(),    // ex: "anxiety-30"
  phase:        integer("phase").notNull().default(1),    // 1, 2 ou 3
  currentDay:   integer("current_day").notNull().default(1), // 1-30
  status:       text("status").notNull().default("active"), // active | paused | completed
  startedAt:    timestamp("started_at").defaultNow().notNull(),
  completedAt:  timestamp("completed_at"),
  lastPracticeDate: date("last_practice_date"),
  completedDays: integer("completed_days").notNull().default(0),
});

// ── Check-ins específicos de jornada ─────────────────────
export const journeyCheckinsTable = pgTable("journey_checkins", {
  id:           serial("id").primaryKey(),
  deviceId:     text("device_id").notNull(),
  journeyId:    text("journey_id").notNull(),
  day:          integer("day").notNull(),
  phase:        integer("phase").notNull(),
  practiceKey:  text("practice_key").notNull(),
  completed:    boolean("completed").notNull(),
  note:         integer("note"),               // 1-5
  comment:      text("comment"),
  checkinDate:  date("checkin_date").notNull(),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
});

export const insertUserJourneySchema = createInsertSchema(userJourneysTable)
  .omit({ id: true, startedAt: true });
export const insertJourneyCheckinSchema = createInsertSchema(journeyCheckinsTable)
  .omit({ id: true, createdAt: true });

export type UserJourney        = typeof userJourneysTable.$inferSelect;
export type JourneyCheckin     = typeof journeyCheckinsTable.$inferSelect;
export type InsertUserJourney  = z.infer<typeof insertUserJourneySchema>;
