-- Thumbnail Generator - Database Schema
-- Run this migration to set up the required tables.

CREATE TABLE IF NOT EXISTS generated_thumbnails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    readable_id VARCHAR(20),
    prompt TEXT NOT NULL,
    enhanced_prompt TEXT,
    preset VARCHAR(50),
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    model VARCHAR(50) NOT NULL,
    seed BIGINT,
    s3_key VARCHAR(500) NOT NULL,
    s3_bucket VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT,
    generation_time_ms INTEGER,
    cost_cents INTEGER,
    version INTEGER DEFAULT 1,
    parent_id UUID REFERENCES generated_thumbnails(id),
    feedback TEXT,
    metadata JSONB DEFAULT '{}',
    generation_params JSONB,
    generated_by VARCHAR(100) DEFAULT 'user',
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS thumbnail_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thumbnail_id UUID REFERENCES generated_thumbnails(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    s3_key VARCHAR(500),
    s3_bucket VARCHAR(100),
    file_size_bytes BIGINT,
    prompt TEXT,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(thumbnail_id, version)
);

CREATE INDEX IF NOT EXISTS idx_generated_thumbnails_preset ON generated_thumbnails(preset);
CREATE INDEX IF NOT EXISTS idx_generated_thumbnails_model ON generated_thumbnails(model);
CREATE INDEX IF NOT EXISTS idx_generated_thumbnails_created ON generated_thumbnails(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_thumbnails_deleted ON generated_thumbnails(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_generated_thumbnails_parent ON generated_thumbnails(parent_id);
CREATE INDEX IF NOT EXISTS idx_thumbnail_versions_thumbnail ON thumbnail_versions(thumbnail_id);
CREATE INDEX IF NOT EXISTS idx_thumbnail_versions_created ON thumbnail_versions(created_at DESC);

CREATE OR REPLACE FUNCTION update_generated_thumbnails_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_generated_thumbnails_updated_at ON generated_thumbnails;
CREATE TRIGGER trigger_update_generated_thumbnails_updated_at
    BEFORE UPDATE ON generated_thumbnails
    FOR EACH ROW
    EXECUTE FUNCTION update_generated_thumbnails_updated_at();
