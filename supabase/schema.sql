-- ============================================================
-- ARTOPIA — Supabase Schema
-- Run this file FIRST in the Supabase SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE event_status AS ENUM (
  'draft',
  'submission_open',
  'submission_closed',
  'voting_open',
  'voting_closed',
  'results_published',
  'archived'
);

CREATE TYPE submission_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

-- ============================================================
-- HELPER: updated_at trigger function
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE: profiles
-- Synced from Supabase Auth via trigger (Discord OAuth)
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username       TEXT,
  avatar_url     TEXT,
  discord_id     TEXT UNIQUE,
  discord_tag    TEXT,
  website_url    TEXT,
  bio            TEXT,
  is_banned      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_discord_id  ON profiles(discord_id);
CREATE INDEX idx_profiles_is_banned   ON profiles(is_banned);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-create profile on first Discord login
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, avatar_url, discord_id, discord_tag)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Artist'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'provider_id',
    NEW.raw_user_meta_data->>'custom_claims'->>'global_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- TABLE: admins
-- Users with full admin access
-- ============================================================

CREATE TABLE IF NOT EXISTS admins (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admins_user_id ON admins(user_id);

-- Helper function to check if caller is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins WHERE user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- TABLE: categories
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default categories
INSERT INTO categories (name, slug) VALUES
  ('Digital Art',      'digital-art'),
  ('Traditional',      'traditional'),
  ('Photography',      'photography'),
  ('Pixel Art',        'pixel-art'),
  ('3D / Sculpture',   '3d-sculpture'),
  ('Animation',        'animation'),
  ('Character Design', 'character-design'),
  ('Landscape',        'landscape'),
  ('Abstract',         'abstract'),
  ('Fan Art',          'fan-art')
ON CONFLICT DO NOTHING;

-- ============================================================
-- TABLE: events
-- ============================================================

CREATE TABLE IF NOT EXISTS events (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  description  TEXT,
  banner_url   TEXT,
  thumbnail_url TEXT,
  rules        JSONB NOT NULL DEFAULT '[]'::JSONB,
  prizes       JSONB NOT NULL DEFAULT '[]'::JSONB,
  categories   JSONB NOT NULL DEFAULT '[]'::JSONB,
  status       event_status NOT NULL DEFAULT 'draft',
  starts_at    TIMESTAMPTZ,
  ends_at      TIMESTAMPTZ,
  voting_ends_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_status     ON events(status);
CREATE INDEX idx_events_created_at ON events(created_at DESC);

CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TABLE: submissions
-- ============================================================

CREATE TABLE IF NOT EXISTS submissions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  image_url   TEXT NOT NULL,
  image_path  TEXT NOT NULL,
  category    TEXT NOT NULL,
  social_link TEXT,
  status      submission_status NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (event_id, user_id)
);

CREATE INDEX idx_submissions_event_id  ON submissions(event_id);
CREATE INDEX idx_submissions_user_id   ON submissions(user_id);
CREATE INDEX idx_submissions_status    ON submissions(status);
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);

CREATE TRIGGER trg_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TABLE: votes
-- rank: 1 = Top 1 (3 pts), 2 = Top 2 (2 pts), 3 = Top 3 (1 pt)
-- ============================================================

CREATE TABLE IF NOT EXISTS votes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id      UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  voter_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  rank          SMALLINT NOT NULL CHECK (rank IN (1, 2, 3)),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (event_id, voter_id, rank),
  UNIQUE (event_id, voter_id, submission_id)
);

CREATE INDEX idx_votes_event_id      ON votes(event_id);
CREATE INDEX idx_votes_voter_id      ON votes(voter_id);
CREATE INDEX idx_votes_submission_id ON votes(submission_id);

-- ============================================================
-- TABLE: event_results
-- ============================================================

CREATE TABLE IF NOT EXISTS event_results (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id      UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  rank          SMALLINT NOT NULL CHECK (rank IN (1, 2, 3)),
  total_points  INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (event_id, rank),
  UNIQUE (event_id, submission_id)
);

CREATE INDEX idx_event_results_event_id ON event_results(event_id);

-- ============================================================
-- TABLE: settings
-- Key-value store for platform configuration
-- ============================================================

CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Default settings
INSERT INTO settings (key, value) VALUES
  ('site_name',        'Artopia'),
  ('site_description', 'Where art meets community. Compete, vote, and celebrate creativity.'),
  ('discord_invite',   ''),
  ('twitter_url',      ''),
  ('instagram_url',    ''),
  ('max_upload_mb',    '5')
ON CONFLICT DO NOTHING;
