-- Run this in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS events (
  id          TEXT PRIMARY KEY,
  source      TEXT NOT NULL DEFAULT 'ticketmaster',
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  date        DATE NOT NULL,
  end_date    DATE,
  time        TEXT NOT NULL DEFAULT '00:00',
  venue_name  TEXT NOT NULL DEFAULT 'Venue TBA',
  city        TEXT NOT NULL DEFAULT 'Australia',
  state       TEXT NOT NULL,
  lat         DOUBLE PRECISION NOT NULL DEFAULT 0,
  lng         DOUBLE PRECISION NOT NULL DEFAULT 0,
  category    TEXT NOT NULL DEFAULT 'cultural',
  tags        TEXT[] NOT NULL DEFAULT '{}',
  price       NUMERIC,
  image_url   TEXT,
  ticket_url  TEXT,
  website     TEXT,
  featured    BOOLEAN NOT NULL DEFAULT FALSE,
  synced_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_events_date     ON events (date);
CREATE INDEX IF NOT EXISTS idx_events_state    ON events (state);
CREATE INDEX IF NOT EXISTS idx_events_category ON events (category);
CREATE INDEX IF NOT EXISTS idx_events_source   ON events (source);
