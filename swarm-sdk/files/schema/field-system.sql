-- Swarm Field System Schema
-- PostgreSQL tables for thermodynamic task coordination
--
-- Usage: psql -f schema/field-system.sql

-- Enums
DO $$ BEGIN
  CREATE TYPE field_node_type AS ENUM ('goal', 'spec', 'task', 'review');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE field_node_state AS ENUM ('open', 'claimed', 'resolved', 'approved', 'blocked');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Field Nodes: The core task/goal/spec tracking table
CREATE TABLE IF NOT EXISTS field_nodes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_type         field_node_type NOT NULL,
  title             VARCHAR(255) NOT NULL,
  content           JSONB NOT NULL DEFAULT '{}',
  potential         DOUBLE PRECISION NOT NULL DEFAULT 0.8
                    CHECK (potential >= 0.0 AND potential <= 1.0),
  temperature       DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  blocked_by        UUID[] DEFAULT '{}',
  affinity          TEXT[] NOT NULL DEFAULT '{}',
  parent_id         UUID REFERENCES field_nodes(id) ON DELETE SET NULL,
  claimed_by        VARCHAR(100),
  state             field_node_state NOT NULL DEFAULT 'open',
  sequence_order    INTEGER,
  created_by        VARCHAR(100),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at       TIMESTAMPTZ,
  resolved_by       VARCHAR(100),
  metadata          JSONB DEFAULT '{}'
);

-- Indexes for field queries
CREATE INDEX IF NOT EXISTS idx_field_nodes_potential
  ON field_nodes (potential DESC) WHERE state = 'open';
CREATE INDEX IF NOT EXISTS idx_field_nodes_state
  ON field_nodes (state) WHERE state NOT IN ('resolved', 'approved');
CREATE INDEX IF NOT EXISTS idx_field_nodes_affinity
  ON field_nodes USING GIN (affinity);
CREATE INDEX IF NOT EXISTS idx_field_nodes_parent
  ON field_nodes (parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_field_nodes_blocked_by
  ON field_nodes USING GIN (blocked_by);

-- Agent Presence: Live agent tracking for dashboard/monitoring
CREATE TABLE IF NOT EXISTS agent_presence (
  agent_id           VARCHAR(100) PRIMARY KEY,
  agent_type         VARCHAR(50) NOT NULL,
  affinities         TEXT[] NOT NULL DEFAULT '{}',
  energy_level       DOUBLE PRECISION NOT NULL DEFAULT 1.0
                     CHECK (energy_level >= 0.0 AND energy_level <= 1.0),
  current_zone_id    UUID REFERENCES field_nodes(id) ON DELETE SET NULL,
  last_heartbeat     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_started    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  zones_completed    INTEGER DEFAULT 0,
  zones_failed       INTEGER DEFAULT 0,
  metadata           JSONB DEFAULT '{}',
  turn_count         INTEGER DEFAULT 0,
  max_turns          INTEGER DEFAULT 50,
  context_tokens_est INTEGER DEFAULT 0,
  max_context_tokens INTEGER DEFAULT 180000,
  lifecycle_state    VARCHAR(20) DEFAULT 'active'
                     CHECK (lifecycle_state IN (
                       'active', 'working', 'winding_down', 'resolved',
                       'checkpointing', 'terminated', 'handed_off'
                     )),
  checkpoint_at      INTEGER DEFAULT 40,
  parent_agent_id    VARCHAR(100),
  current_activity   TEXT DEFAULT 'Initializing...'
);

CREATE INDEX IF NOT EXISTS idx_agent_presence_heartbeat
  ON agent_presence (last_heartbeat);

-- Agent Heartbeats: Progress tracking (one row per agent, upserted)
CREATE TABLE IF NOT EXISTS agent_heartbeats (
  agent_id  VARCHAR(100) PRIMARY KEY,
  task_id   UUID REFERENCES field_nodes(id) ON DELETE CASCADE,
  progress  DOUBLE PRECISION DEFAULT 0.0,
  message   TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Context Bundles: Curated knowledge packages matched to tasks
CREATE TABLE IF NOT EXISTS context_bundles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        VARCHAR(100) UNIQUE NOT NULL,
  domain      VARCHAR(100) NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  keywords    TEXT[] NOT NULL DEFAULT '{}',
  affinities  TEXT[] NOT NULL DEFAULT '{}',
  content     TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  priority    INTEGER NOT NULL DEFAULT 0,
  file_refs   JSONB DEFAULT '[]',
  conventions TEXT DEFAULT '',
  kg_queries  JSONB DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Junction table: which bundles are attached to which field nodes
CREATE TABLE IF NOT EXISTS field_node_bundles (
  node_id     UUID NOT NULL REFERENCES field_nodes(id) ON DELETE CASCADE,
  bundle_id   UUID NOT NULL REFERENCES context_bundles(id) ON DELETE CASCADE,
  match_score DOUBLE PRECISION DEFAULT 0.0,
  attached_by VARCHAR(100) DEFAULT 'system',
  attached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (node_id, bundle_id)
);

-- Helper: Calculate effective potential (potential + temperature boost)
-- Nodes with high temperature (failures) get boosted to attract attention
CREATE OR REPLACE FUNCTION effective_potential(fn field_nodes)
RETURNS DOUBLE PRECISION AS $$
BEGIN
  RETURN LEAST(fn.potential + (fn.temperature * 0.2), 1.0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER field_nodes_updated
    BEFORE UPDATE ON field_nodes
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Summary view for quick field status
CREATE OR REPLACE VIEW field_summary AS
SELECT
  node_type,
  state,
  COUNT(*) as count,
  ROUND(AVG(potential)::numeric, 2) as avg_potential,
  ROUND(AVG(temperature)::numeric, 2) as avg_temperature
FROM field_nodes
GROUP BY node_type, state
ORDER BY node_type, state;

-- =============================================================================
-- Field Node Events: Persistence subscriber audit log
-- =============================================================================

CREATE TABLE IF NOT EXISTS field_node_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id     UUID NOT NULL REFERENCES field_nodes(id) ON DELETE CASCADE,
  event_type  VARCHAR(50) NOT NULL,
  agent_id    VARCHAR(100),
  payload     JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_field_node_events_node ON field_node_events (node_id);
CREATE INDEX IF NOT EXISTS idx_field_node_events_type ON field_node_events (event_type);
