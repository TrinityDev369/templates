/**
 * HTTP Client for Knowledge Graph API
 * Wraps the FastAPI endpoints for use by MCP tools
 */

const API_BASE = process.env.KNOWLEDGE_API_URL || 'http://localhost:8100';

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  graph_name: string;
  entity_count?: number;
  relationship_count?: number;
}

export interface Entity {
  id: string;
  name: string;
  type: string;
  description?: string;
  properties?: Record<string, unknown>;
  connections?: Array<{
    relationship: string;
    direction: 'in' | 'out';
    entity: { id: string; name: string; type: string };
  }>;
}

export interface Relationship {
  id: string;
  type: string;
  from_entity_id: string;
  to_entity_id: string;
  properties?: Record<string, unknown>;
}

export interface SearchResult {
  id: string;
  name: string;
  type: string;
  description?: string;
  score: number;
  source: 'vector' | 'graph';
  chunk_content?: string;
}

export interface Document {
  id: string;
  filename: string;
  content_type: string;
  processed: boolean;
  chunk_count?: number;
}

/**
 * Strip `entity_` or `chunk_` prefixes that search results add to raw API IDs.
 * Agents often pass these prefixed IDs back to CRUD tools, causing API 404s.
 */
export function stripEntityPrefix(id: string): string {
  return id.replace(/^(entity_|chunk_)/, '');
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error (${response.status}): ${error}`);
  }

  // Handle empty responses (e.g., DELETE returns 204 No Content)
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text);
}

// ============================================================================
// Projects
// ============================================================================

export async function listProjects(): Promise<Project[]> {
  return apiRequest<Project[]>('/api/v1/projects');
}

export async function getProject(slug: string): Promise<Project> {
  return apiRequest<Project>(`/api/v1/projects/${slug}`);
}

export async function createProject(data: {
  name: string;
  slug: string;
  description?: string;
}): Promise<Project> {
  return apiRequest<Project>('/api/v1/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============================================================================
// Entities
// ============================================================================

export async function listEntities(
  projectSlug: string,
  options?: {
    type?: string;
    limit?: number;
    offset?: number;
  }
): Promise<Entity[]> {
  const params = new URLSearchParams();
  if (options?.type) params.set('type', options.type);
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.offset) params.set('offset', String(options.offset));

  const query = params.toString();
  return apiRequest<Entity[]>(
    `/api/v1/projects/${projectSlug}/entities${query ? `?${query}` : ''}`
  );
}

export async function getEntity(
  projectSlug: string,
  entityId: string
): Promise<Entity> {
  return apiRequest<Entity>(
    `/api/v1/projects/${projectSlug}/entities/${stripEntityPrefix(entityId)}`
  );
}

export async function createEntity(
  projectSlug: string,
  data: {
    name: string;
    type: string;
    description?: string;
    properties?: Record<string, unknown>;
  }
): Promise<Entity> {
  return apiRequest<Entity>(`/api/v1/projects/${projectSlug}/entities`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteEntity(
  projectSlug: string,
  entityId: string
): Promise<void> {
  await apiRequest<void>(
    `/api/v1/projects/${projectSlug}/entities/${stripEntityPrefix(entityId)}`,
    { method: 'DELETE' }
  );
}

// ============================================================================
// Relationships
// ============================================================================

export async function listRelationships(
  projectSlug: string
): Promise<Relationship[]> {
  return apiRequest<Relationship[]>(
    `/api/v1/projects/${projectSlug}/relationships`
  );
}

export async function createRelationship(
  projectSlug: string,
  data: {
    from_entity_id: string;
    to_entity_id: string;
    type: string;
    properties?: Record<string, unknown>;
  }
): Promise<Relationship> {
  return apiRequest<Relationship>(
    `/api/v1/projects/${projectSlug}/relationships`,
    {
      method: 'POST',
      body: JSON.stringify({
        source_id: stripEntityPrefix(data.from_entity_id),
        target_id: stripEntityPrefix(data.to_entity_id),
        type: data.type,
        properties: data.properties,
      }),
    }
  );
}

// ============================================================================
// Search (RAG + Graph)
// ============================================================================

export async function search(
  projectSlug: string,
  data: {
    query: string;
    mode?: 'hybrid' | 'vector' | 'graph';
    limit?: number;
    entity_types?: string[];
  }
): Promise<SearchResult[]> {
  return apiRequest<SearchResult[]>(
    `/api/v1/projects/${projectSlug}/search`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

export interface FanoutSearchResult {
  results: Array<SearchResult & { project?: string }>;
  total: number;
  projects_searched: number;
  project_stats: Array<{ project: string; result_count: number }>;
}

export async function searchAll(data: {
  query: string;
  mode?: 'hybrid' | 'vector' | 'graph';
  limit?: number;
  entity_types?: string[];
}): Promise<FanoutSearchResult> {
  return apiRequest<FanoutSearchResult>('/api/v1/search', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============================================================================
// Cypher Queries
// ============================================================================

export async function executeCypher(
  projectSlug: string,
  query: string
): Promise<unknown[]> {
  return apiRequest<unknown[]>(
    `/api/v1/projects/${projectSlug}/query/cypher`,
    {
      method: 'POST',
      body: JSON.stringify({ query }),
    }
  );
}

// ============================================================================
// Documents (RAG ingestion)
// ============================================================================

export async function listDocuments(
  projectSlug: string,
  options?: {
    content_type?: string;
    processed?: boolean;
  }
): Promise<Document[]> {
  const params = new URLSearchParams();
  if (options?.content_type) params.set('content_type', options.content_type);
  if (options?.processed !== undefined)
    params.set('processed', String(options.processed));

  const query = params.toString();
  return apiRequest<Document[]>(
    `/api/v1/projects/${projectSlug}/documents${query ? `?${query}` : ''}`
  );
}

export async function createDocument(
  projectSlug: string,
  data: {
    filename: string;
    content: string;
    content_type?: string;
  }
): Promise<Document> {
  return apiRequest<Document>(`/api/v1/projects/${projectSlug}/documents`, {
    method: 'POST',
    body: JSON.stringify({
      filename: data.filename,
      raw_content: data.content,
      content_type: data.content_type || 'general',
    }),
  });
}

export async function processDocument(
  projectSlug: string,
  documentId: string
): Promise<{ status: string; chunks_created?: number; entities_extracted?: number }> {
  return apiRequest<{ status: string; chunks_created?: number; entities_extracted?: number }>(
    `/api/v1/projects/${projectSlug}/documents/${stripEntityPrefix(documentId)}/process`,
    { method: 'POST' }
  );
}

// ============================================================================
// Visualization
// ============================================================================

export async function getGraphVisualization(
  projectSlug: string,
  options?: {
    focus_entity_id?: string;
    depth?: number;
    entity_types?: string[];
  }
): Promise<{
  nodes: Array<{ id: string; name: string; type: string }>;
  edges: Array<{ source: string; target: string; type: string }>;
}> {
  const params = new URLSearchParams();
  if (options?.focus_entity_id)
    params.set('focus_entity_id', stripEntityPrefix(options.focus_entity_id));
  if (options?.depth) params.set('depth', String(options.depth));
  if (options?.entity_types)
    params.set('entity_types', options.entity_types.join(','));

  const query = params.toString();
  return apiRequest(
    `/api/v1/projects/${projectSlug}/visualization/graph${query ? `?${query}` : ''}`
  );
}

// ============================================================================
// v2: Batch Create
// ============================================================================

export interface BatchCreateInput {
  entities: Array<{
    name: string;
    type: string;
    description?: string;
    properties?: Record<string, unknown>;
    ref?: string;
  }>;
  relationships: Array<{
    from: string;
    to: string;
    type: string;
    properties?: Record<string, unknown>;
  }>;
}

export interface BatchCreateResult {
  entities_created: Array<{ ref: string; id: string; name: string }>;
  relationships_created: Array<{ id: string; from: string; to: string; type: string }>;
  errors: string[];
}

export async function batchCreate(
  projectSlug: string,
  data: BatchCreateInput
): Promise<BatchCreateResult> {
  return apiRequest<BatchCreateResult>(
    `/api/v1/projects/${projectSlug}/batch`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

// ============================================================================
// v2: Update Entity
// ============================================================================

export interface EntityUpdateInput {
  name?: string;
  description?: string;
  properties?: Record<string, unknown>;
}

export async function updateEntity(
  projectSlug: string,
  entityId: string,
  data: EntityUpdateInput
): Promise<Entity> {
  return apiRequest<Entity>(
    `/api/v1/projects/${projectSlug}/entities/${stripEntityPrefix(entityId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    }
  );
}

// ============================================================================
// v2: Upsert Entity
// ============================================================================

export interface UpsertResult {
  id: string;
  name: string;
  type: string;
  properties: Record<string, unknown>;
  created: boolean;
  merged_properties: string[];
}

export async function upsertEntity(
  projectSlug: string,
  data: {
    name: string;
    type: string;
    description?: string;
    properties?: Record<string, unknown>;
  }
): Promise<UpsertResult> {
  return apiRequest<UpsertResult>(
    `/api/v1/projects/${projectSlug}/entities`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
}

// ============================================================================
// v2: Find Entity by Name
// ============================================================================

export interface FindEntityResult {
  entities: Array<{
    id: string;
    name: string;
    type: string;
    properties: Record<string, unknown>;
    connections: Array<{
      id: string;
      name: string;
      type: string;
      relationship: string;
      direction: string;
    }>;
  }>;
  total: number;
}

export async function findEntity(
  projectSlug: string,
  name: string,
  type?: string
): Promise<FindEntityResult> {
  const params = new URLSearchParams();
  params.set('name', name);
  if (type) params.set('type', type);

  return apiRequest<FindEntityResult>(
    `/api/v1/projects/${projectSlug}/entities/find?${params.toString()}`
  );
}

// ============================================================================
// v2: Entity Relationships
// ============================================================================

export interface EntityRelationshipsResult {
  relationships: Array<{
    id: string;
    type: string;
    direction: string;
    other_id: string;
    other_name: string;
    other_type: string;
    properties: Record<string, unknown>;
  }>;
  total: number;
}

export async function getEntityRelationships(
  projectSlug: string,
  entityId: string,
  options?: {
    direction?: 'all' | 'outgoing' | 'incoming';
    relationship_type?: string;
  }
): Promise<EntityRelationshipsResult> {
  const params = new URLSearchParams();
  if (options?.direction) params.set('direction', options.direction);
  if (options?.relationship_type) params.set('type', options.relationship_type);

  const query = params.toString();
  return apiRequest<EntityRelationshipsResult>(
    `/api/v1/projects/${projectSlug}/entities/${stripEntityPrefix(entityId)}/relationships${query ? `?${query}` : ''}`
  );
}

// ============================================================================
// v2: Batch Delete
// ============================================================================

export async function batchDelete(
  projectSlug: string,
  entityIds: string[]
): Promise<{ deleted: number }> {
  return apiRequest<{ deleted: number }>(
    `/api/v1/projects/${projectSlug}/entities/batch`,
    {
      method: 'DELETE',
      body: JSON.stringify({ entity_ids: entityIds.map(stripEntityPrefix) }),
    }
  );
}

// ============================================================================
// v2: Deduplicate
// ============================================================================

export interface DeduplicateResult {
  duplicate_groups: Array<{
    name: string;
    type: string;
    entities: Array<{ id: string; name: string; properties: Record<string, unknown> }>;
    recommended_keep: string;
  }>;
  total_duplicates: number;
  merged: number;
}

export async function deduplicate(
  projectSlug: string,
  options?: {
    entity_type?: string;
    dry_run?: boolean;
  }
): Promise<DeduplicateResult> {
  return apiRequest<DeduplicateResult>(
    `/api/v1/projects/${projectSlug}/entities/deduplicate`,
    {
      method: 'POST',
      body: JSON.stringify({
        entity_type: options?.entity_type,
        dry_run: options?.dry_run ?? true,
      }),
    }
  );
}

// ============================================================================
// Health Check
// ============================================================================

export async function healthCheck(): Promise<{
  status: string;
  service: string;
  version: string;
}> {
  return apiRequest('/health');
}
