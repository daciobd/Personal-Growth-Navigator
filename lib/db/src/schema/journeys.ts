import {
  pgTable, serial, text, integer, boolean,
  timestamp, jsonb, date,
} from "drizzle-orm/pg-core";

export const userJourneysTable = pgTable("user_journeys", {
  id:           serial("id").primaryKey(),
  deviceId:     text("device_id").notNull(),
  journeyId:    text("journey_id").notNull(),
  phase:        integer("phase").notNull().default(1),
  currentDay:   integer("current_day").notNull().default(1),
  status:       text("status").notNull().default("active"),
  startedAt:    timestamp("started_at").defaultNow().notNull(),
  completedAt:  timestamp("completed_at"),
  lastPracticeDate: date("last_practice_date"),
  completedDays: integer("completed_days").notNull().default(0),
});

export const journeyCheckinsTable = pgTable("journey_checkins", {
  id:           serial("id").primaryKey(),
  deviceId:     text("device_id").notNull(),
  journeyId:    text("journey_id").notNull(),
  day:          integer("day").notNull(),
  phase:        integer("phase").notNull(),
  practiceKey:  text("practice_key").notNull(),
  completed:    boolean("completed").notNull(),
  note:         integer("note"),
  comment:      text("comment"),
  checkinDate:  date("checkin_date").notNull(),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
});

export type UserJourney        = typeof userJourneysTable.$inferSelect;
export type JourneyCheckin     = typeof journeyCheckinsTable.$inferSelect;
export type InsertUserJourney  = typeof userJourneysTable.$inferInsert;
export type InsertJourneyCheckin = typeof journeyCheckinsTable.$inferInsert;
