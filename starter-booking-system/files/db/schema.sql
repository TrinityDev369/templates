-- Booking System Database Schema
-- Run: psql $DATABASE_URL < db/schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Available time slots
CREATE TABLE IF NOT EXISTS slots (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date       DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time   TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT unique_slot UNIQUE (date, start_time, end_time)
);

-- Booking status enum
DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled', 'completed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id        UUID NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  customer_name  TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL DEFAULT '',
  notes          TEXT,
  status         booking_status NOT NULL DEFAULT 'confirmed',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_booking_per_slot UNIQUE (slot_id)
);

-- Index for querying slots by date range
CREATE INDEX IF NOT EXISTS idx_slots_date ON slots(date);
CREATE INDEX IF NOT EXISTS idx_slots_available ON slots(date, is_available) WHERE is_available = true;

-- Index for querying bookings
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at DESC);

-- Seed: Generate sample slots for the next 30 days (9 AM to 5 PM, hourly)
INSERT INTO slots (date, start_time, end_time)
SELECT
  d::date,
  make_time(h, 0, 0),
  make_time(h + 1, 0, 0)
FROM
  generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', INTERVAL '1 day') AS d,
  generate_series(9, 16) AS h
WHERE
  EXTRACT(DOW FROM d::date) NOT IN (0, 6)  -- Exclude weekends
ON CONFLICT DO NOTHING;
