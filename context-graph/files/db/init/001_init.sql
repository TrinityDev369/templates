-- Knowledge Graph - Database Initialization
-- PostgreSQL 16 + Apache AGE

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS age;

-- Load AGE into search path
LOAD 'age';
SET search_path = ag_catalog, "$user", public;

-- ============================================
-- RELATIONAL TABLES
-- ============================================

-- Projects (each has corresponding AGE graph)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    graph_name VARCHAR(255) UNIQUE,
    description TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for slug lookups
CREATE INDEX idx_projects_slug ON projects(slug);

-- Source documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    filename VARCHAR(500),
    content_type VARCHAR(100) NOT NULL,
    source_url TEXT,
    raw_content TEXT,
    metadata JSONB DEFAULT '{}',
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_documents_content_type ON documents(content_type);
CREATE INDEX idx_documents_processed ON documents(processed);

-- Text chunks with Qdrant references
CREATE TABLE IF NOT EXISTS chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    token_count INTEGER,
    qdrant_point_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chunks_document ON chunks(document_id);
CREATE INDEX idx_chunks_qdrant ON chunks(qdrant_point_id);

-- Extraction audit log
CREATE TABLE IF NOT EXISTS extraction_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    entity_count INTEGER DEFAULT 0,
    relationship_count INTEGER DEFAULT 0,
    model_used VARCHAR(100),
    tokens_used INTEGER,
    duration_ms INTEGER,
    raw_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_extraction_log_document ON extraction_log(document_id);

-- Entity type registry (for UI colors/icons)
CREATE TABLE IF NOT EXISTS entity_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL,
    icon VARCHAR(50),
    description TEXT
);

-- Insert default entity types
INSERT INTO entity_types (name, color, icon, description) VALUES
    ('Component', '#7C3AED', 'component', 'UI components and elements'),
    ('DesignToken', '#10B981', 'palette', 'Design system tokens (colors, spacing, etc.)'),
    ('Contract', '#F59E0B', 'document', 'Legal contracts and agreements'),
    ('Requirement', '#3B82F6', 'check-square', 'Project requirements and specs'),
    ('Person', '#EC4899', 'user', 'People and stakeholders'),
    ('Concept', '#8B5CF6', 'lightbulb', 'Abstract concepts and definitions'),
    ('Feature', '#06B6D4', 'star', 'Product features'),
    ('Document', '#64748B', 'file-text', 'Documentation and files'),
    ('API', '#EF4444', 'code', 'API endpoints and interfaces'),
    ('Chunk', '#9CA3AF', 'hash', 'Text chunks for RAG')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to create a project with its graph
CREATE OR REPLACE FUNCTION create_project_with_graph(
    p_name VARCHAR,
    p_slug VARCHAR,
    p_description TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_project_id UUID;
    v_graph_name VARCHAR;
BEGIN
    v_graph_name := 'project_' || p_slug;

    -- Create the project record
    INSERT INTO projects (name, slug, graph_name, description)
    VALUES (p_name, p_slug, v_graph_name, p_description)
    RETURNING id INTO v_project_id;

    -- Create the AGE graph
    PERFORM ag_catalog.create_graph(v_graph_name);

    RETURN v_project_id;
END;
$$ LANGUAGE plpgsql;

-- Function to delete a project and its graph
CREATE OR REPLACE FUNCTION delete_project_with_graph(p_slug VARCHAR) RETURNS BOOLEAN AS $$
DECLARE
    v_graph_name VARCHAR;
BEGIN
    SELECT graph_name INTO v_graph_name FROM projects WHERE slug = p_slug;

    IF v_graph_name IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Drop the AGE graph
    PERFORM ag_catalog.drop_graph(v_graph_name, true);

    -- Delete the project (cascades to documents, chunks, etc.)
    DELETE FROM projects WHERE slug = p_slug;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEED DATA (Demo Project)
-- ============================================

-- Create a demo project
SELECT create_project_with_graph(
    'My Project',
    'my-project',
    'Default knowledge graph'
);

-- Add demo entities to the graph
DO $$
BEGIN
    EXECUTE format($cypher$
        SELECT * FROM cypher('project_my-project', $$
            CREATE (readme:Document {
                name: 'README',
                description: 'Project documentation',
                created_at: timestamp()
            })
            CREATE (arch:Concept {
                name: 'Architecture',
                description: 'System architecture overview',
                created_at: timestamp()
            })
            CREATE (readme)-[:REFERENCES]->(arch)
            RETURN readme, arch
        $$) as (readme agtype, arch agtype)
    $cypher$);
END $$;

-- ============================================
-- GRANTS
-- ============================================

-- Grant permissions to the default user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO knowledge;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO knowledge;
GRANT USAGE ON SCHEMA ag_catalog TO knowledge;
GRANT SELECT ON ALL TABLES IN SCHEMA ag_catalog TO knowledge;

-- Log completion
DO $$ BEGIN RAISE NOTICE 'Knowledge Graph initialized successfully!'; END $$;
