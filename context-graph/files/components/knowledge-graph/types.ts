/**
 * Knowledge Graph Types
 * Types for the Reagraph graph visualization
 */

export type EntityType =
  | 'Component'
  | 'DesignToken'
  | 'Contract'
  | 'Requirement'
  | 'Person'
  | 'Concept'
  | 'Feature'
  | 'Document'
  | 'API'
  | 'Chunk'
  | 'Client'
  | 'Project';

export type RelationshipType =
  | 'USES'
  | 'DEFINES'
  | 'REQUIRES'
  | 'REFERENCES'
  | 'CREATED_BY'
  | 'EXTENDS'
  | 'CONTAINS'
  | 'RELATED_TO'
  | 'IMPLEMENTS'
  | 'DEPENDS_ON'
  | 'OWNS'
  | 'WORKS_ON'
  | 'MANAGES';

export interface GraphNode {
  id: string;
  label: string;
  type: EntityType;
  properties: Record<string, unknown>;
  color?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  properties?: Record<string, unknown>;
}

export interface GraphStats {
  node_count: number;
  edge_count: number;
  types: Record<string, number>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: GraphStats;
}

export interface SearchResult {
  id: string;
  type: 'entity' | 'chunk';
  label: string;
  name: string;
  content: string;
  score: number;
  source: 'vector' | 'graph';
  connections: Array<{
    id: string;
    name: string;
    relationship: string;
  }>;
}

export interface SearchResponse {
  results: SearchResult[];
  stats: {
    vector_hits: number;
    graph_hits: number;
    total_time_ms: number;
  };
}

// Entity type color mapping
export const ENTITY_COLORS: Record<EntityType, string> = {
  Component: '#7C3AED',
  DesignToken: '#10B981',
  Contract: '#F59E0B',
  Requirement: '#3B82F6',
  Person: '#EC4899',
  Concept: '#8B5CF6',
  Feature: '#06B6D4',
  Document: '#64748B',
  API: '#EF4444',
  Chunk: '#9CA3AF',
  Client: '#0EA5E9',
  Project: '#22C55E',
};

// Relationship colors
export const RELATIONSHIP_COLORS: Record<RelationshipType, string> = {
  USES: '#6B7280',
  DEFINES: '#10B981',
  REQUIRES: '#EF4444',
  REFERENCES: '#3B82F6',
  CREATED_BY: '#EC4899',
  EXTENDS: '#8B5CF6',
  CONTAINS: '#F59E0B',
  RELATED_TO: '#9CA3AF',
  IMPLEMENTS: '#06B6D4',
  DEPENDS_ON: '#7C3AED',
  OWNS: '#14B8A6',
  WORKS_ON: '#F97316',
  MANAGES: '#A855F7',
};
