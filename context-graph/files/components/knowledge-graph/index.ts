// New modern WebGL-based graph (Reagraph)
export { KnowledgeGraphReagraph } from './knowledge-graph-reagraph';

// Legacy Cytoscape.js graph (kept for reference)
export { KnowledgeGraph } from './knowledge-graph';

// Shared components
export { GraphControls } from './graph-controls';
export { NodeDetails } from './node-details';
export { useKnowledgeGraph } from './use-knowledge-graph';
export type {
  EntityType,
  RelationshipType,
  GraphNode,
  GraphEdge,
  GraphStats,
  GraphData,
  SearchResult,
  SearchResponse,
} from './types';
export { ENTITY_COLORS, RELATIONSHIP_COLORS } from './types';
