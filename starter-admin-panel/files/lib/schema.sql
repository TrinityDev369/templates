-- Admin Panel Schema
-- Run: psql $DATABASE_URL < lib/schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Updated-at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed data (password: "admin123" hashed with pgcrypto)
INSERT INTO users (email, name, password_hash, role, status) VALUES
  ('admin@example.com', 'Admin User', crypt('admin123', gen_salt('bf')), 'admin', 'active'),
  ('editor@example.com', 'Editor User', crypt('editor123', gen_salt('bf')), 'editor', 'active'),
  ('viewer@example.com', 'Viewer User', crypt('viewer123', gen_salt('bf')), 'viewer', 'active'),
  ('jane@example.com', 'Jane Cooper', crypt('password', gen_salt('bf')), 'editor', 'active'),
  ('bob@example.com', 'Bob Wilson', crypt('password', gen_salt('bf')), 'viewer', 'inactive')
ON CONFLICT (email) DO NOTHING;
