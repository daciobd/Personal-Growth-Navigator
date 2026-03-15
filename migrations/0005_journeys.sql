-- migrations/0005_journeys.sql

CREATE TABLE IF NOT EXISTS user_journeys (
  id                  SERIAL PRIMARY KEY,
  device_id           TEXT      NOT NULL,
  journey_id          TEXT      NOT NULL,
  phase               INTEGER   NOT NULL DEFAULT 1,
  current_day         INTEGER   NOT NULL DEFAULT 1,
  status              TEXT      NOT NULL DEFAULT 'active',
  started_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at        TIMESTAMP,
  last_practice_date  DATE,
  completed_days      INTEGER   NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS user_journeys_device ON user_journeys (device_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS user_journeys_device_journey ON user_journeys (device_id, journey_id);

CREATE TABLE IF NOT EXISTS journey_checkins (
  id            SERIAL PRIMARY KEY,
  device_id     TEXT      NOT NULL,
  journey_id    TEXT      NOT NULL,
  day           INTEGER   NOT NULL,
  phase         INTEGER   NOT NULL,
  practice_key  TEXT      NOT NULL,
  completed     BOOLEAN   NOT NULL,
  note          INTEGER   CHECK (note >= 1 AND note <= 5),
  comment       TEXT,
  checkin_date  DATE      NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS journey_checkins_device ON journey_checkins (device_id, journey_id, checkin_date DESC);
