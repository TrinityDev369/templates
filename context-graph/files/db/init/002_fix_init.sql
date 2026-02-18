-- Knowledge Graph - Fixed Initialization
-- Run this after AGE is loaded

-- Create tables in public schema explicitly
SET search_path = public;

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    graph_name VARCHAR(255) UNIQUE,
    description TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);

-- Documents
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_documents_project ON public.documents(project_id);

-- Chunks
CREATE TABLE IF NOT EXISTS public.chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    token_count INTEGER,
    qdrant_point_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chunks_document ON public.chunks(document_id);

-- Extraction log
CREATE TABLE IF NOT EXISTS public.extraction_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    entity_count INTEGER DEFAULT 0,
    relationship_count INTEGER DEFAULT 0,
    model_used VARCHAR(100),
    tokens_used INTEGER,
    duration_ms INTEGER,
    raw_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entity types (for UI)
CREATE TABLE IF NOT EXISTS public.entity_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL,
    icon VARCHAR(50),
    description TEXT
);

-- Insert default entity types
INSERT INTO public.entity_types (name, color, icon, description) VALUES
    ('Component', '#7C3AED', 'component', 'UI components'),
    ('DesignToken', '#10B981', 'palette', 'Design tokens'),
    ('Contract', '#F59E0B', 'document', 'Legal contracts'),
    ('Requirement', '#3B82F6', 'check-square', 'Requirements'),
    ('Person', '#EC4899', 'user', 'People'),
    ('Concept', '#8B5CF6', 'lightbulb', 'Concepts'),
    ('Feature', '#06B6D4', 'star', 'Features'),
    ('Document', '#64748B', 'file-text', 'Documents'),
    ('API', '#EF4444', 'code', 'API endpoints'),
    ('Chunk', '#9CA3AF', 'hash', 'Text chunks')
ON CONFLICT (name) DO NOTHING;

-- Create demo project
INSERT INTO public.projects (name, slug, graph_name, description)
VALUES ('My Project', 'my-project', 'project_my-project', 'Default knowledge graph')
ON CONFLICT (slug) DO NOTHING;

-- Done
SELECT 'Tables created successfully' as status;
SELECT COUNT(*) as project_count FROM public.projects;
SELECT COUNT(*) as entity_type_count FROM public.entity_types;
