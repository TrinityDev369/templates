-- ── Chatbot Conversations & Messages ────────────────────────
-- Run this migration to add chatbot persistence to your
-- PostgreSQL database. Compatible with PostgreSQL 13+.
--
-- Usage:
--   psql -d your_database -f migration.sql
--
-- This migration is idempotent — safe to run multiple times.
-- ────────────────────────────────────────────────────────────

BEGIN;

-- ── Conversations table ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    title VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'archived', 'closed')),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_session
    ON chatbot_conversations(session_id);

CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_user
    ON chatbot_conversations(user_id);

CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_status
    ON chatbot_conversations(status);

CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_created
    ON chatbot_conversations(created_at DESC);

-- ── Messages table ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS chatbot_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL
        REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL
        CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens_used INT,
    model VARCHAR(100),
    sequence INT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_messages_conversation
    ON chatbot_messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_chatbot_messages_sequence
    ON chatbot_messages(conversation_id, sequence);

CREATE INDEX IF NOT EXISTS idx_chatbot_messages_role
    ON chatbot_messages(role);

-- ── Auto-update trigger for updated_at ──────────────────────

CREATE OR REPLACE FUNCTION update_chatbot_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate to ensure idempotency
DROP TRIGGER IF EXISTS chatbot_conversations_updated_at
    ON chatbot_conversations;

CREATE TRIGGER chatbot_conversations_updated_at
    BEFORE UPDATE ON chatbot_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_chatbot_updated_at();

COMMIT;
