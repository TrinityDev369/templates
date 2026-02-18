#!/usr/bin/env node
/**
 * Knowledge Graph MCP Server
 *
 * Provides MCP tools for:
 * - Hybrid search (vector + graph)
 * - Entity CRUD operations
 * - Relationship management
 * - Document ingestion (RAG)
 * - Cypher queries
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import * as api from './client.js';
import { stripEntityPrefix } from './client.js';

// Default project from environment
const DEFAULT_PROJECT = process.env.KG_PROJECT || 'my-project';

/** Shared schema fragment for the project parameter */
const PROJECT_PARAM = {
  type: 'string' as const,
  description: `Project slug (default: ${DEFAULT_PROJECT})`,
};

const server = new Server(
  {
    name: 'knowledge-mcp',
    version: '0.2.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ============================================================================
// Tool Definitions
// ============================================================================

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // ------------------------------------------------------------------------
    // Search Tools
    // ------------------------------------------------------------------------
    {
      name: 'kg_search',
      description: `Search the knowledge graph using hybrid (vector + graph) search. Returns entities, concepts, and document chunks matching your query. Use this as your PRIMARY tool for finding information. Omit the project parameter (or set to "all") to search across ALL projects at once.`,
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Natural language search query',
          },
          mode: {
            type: 'string',
            enum: ['hybrid', 'vector', 'graph'],
            description: 'Search mode: hybrid (default), vector (semantic), or graph (exact match)',
          },
          limit: {
            type: 'number',
            description: 'Max results to return (default: 10)',
          },
          entity_types: {
            type: 'array',
            items: { type: 'string' },
            description: 'Filter by entity types (Component, Concept, Feature, etc.)',
          },
          project: PROJECT_PARAM,
        },
        required: ['query'],
      },
    },

    // ------------------------------------------------------------------------
    // Entity Tools
    // ------------------------------------------------------------------------
    {
      name: 'kg_list_entities',
      description: 'List entities in the knowledge graph, optionally filtered by type.',
      inputSchema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            description: 'Filter by entity type (Component, Concept, Feature, File, Function, etc.)',
          },
          limit: {
            type: 'number',
            description: 'Max entities to return (default: 50)',
          },
          project: PROJECT_PARAM,
        },
      },
    },
    {
      name: 'kg_create_entity',
      description: 'Create a new entity in the knowledge graph. Use this to record new concepts, components, or learnings.',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Entity name',
          },
          type: {
            type: 'string',
            description: 'Entity type: Component, DesignToken, Contract, Requirement, Person, Concept, Feature, Document, API, Module, File, Function, Class, Client, Project',
          },
          description: {
            type: 'string',
            description: 'Description of the entity',
          },
          properties: {
            type: 'object',
            description: 'Additional properties as key-value pairs',
          },
          project: PROJECT_PARAM,
        },
        required: ['name', 'type'],
      },
    },
    {
      name: 'kg_delete_entity',
      description: 'Delete an entity from the knowledge graph.',
      inputSchema: {
        type: 'object',
        properties: {
          entity_id: {
            type: 'string',
            description: 'UUID of the entity to delete',
          },
          project: PROJECT_PARAM,
        },
        required: ['entity_id'],
      },
    },

    // ------------------------------------------------------------------------
    // Relationship Tools
    // ------------------------------------------------------------------------
    {
      name: 'kg_create_relationship',
      description: 'Create a relationship between two entities. Use to connect related concepts.',
      inputSchema: {
        type: 'object',
        properties: {
          from_entity_id: {
            type: 'string',
            description: 'UUID of the source entity',
          },
          to_entity_id: {
            type: 'string',
            description: 'UUID of the target entity',
          },
          type: {
            type: 'string',
            description: 'Relationship type: IMPORTS, EXPORTS, CALLS, CONTAINS, EXTENDS, USES, DEFINES, REQUIRES, REFERENCES, IMPLEMENTS, DEPENDS_ON, RELATED_TO, CREATED_BY, OWNS, WORKS_ON, MANAGES',
          },
          properties: {
            type: 'object',
            description: 'Additional relationship properties',
          },
          project: PROJECT_PARAM,
        },
        required: ['from_entity_id', 'to_entity_id', 'type'],
      },
    },

    // ------------------------------------------------------------------------
    // Cypher Query Tool
    // ------------------------------------------------------------------------
    {
      name: 'kg_cypher',
      description: 'Execute a read-only Cypher query against the knowledge graph. Use for complex graph traversals.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Cypher query (read-only - no CREATE/DELETE/DROP/MERGE)',
          },
          project: PROJECT_PARAM,
        },
        required: ['query'],
      },
    },

    // ------------------------------------------------------------------------
    // Document/RAG Tools
    // ------------------------------------------------------------------------
    {
      name: 'kg_ingest_document',
      description: 'Ingest a document into the knowledge graph for RAG. Automatically chunks, embeds, and extracts entities.',
      inputSchema: {
        type: 'object',
        properties: {
          filename: {
            type: 'string',
            description: 'Document filename',
          },
          content: {
            type: 'string',
            description: 'Document content (text or markdown)',
          },
          content_type: {
            type: 'string',
            enum: ['spec', 'component', 'contract', 'design_token', 'note', 'general'],
            description: 'Content type for specialized entity extraction (default: general)',
          },
          project: PROJECT_PARAM,
        },
        required: ['filename', 'content'],
      },
    },
    {
      name: 'kg_list_documents',
      description: 'List documents in the knowledge graph.',
      inputSchema: {
        type: 'object',
        properties: {
          content_type: {
            type: 'string',
            description: 'Filter by content type',
          },
          processed: {
            type: 'boolean',
            description: 'Filter by processing status',
          },
          project: PROJECT_PARAM,
        },
      },
    },



    // ------------------------------------------------------------------------
    // v2: Batch Create
    // ------------------------------------------------------------------------
    {
      name: 'kg_batch_create',
      description: 'Create multiple entities and relationships in a single atomic operation. Returns all created IDs. Use this instead of multiple kg_create_entity/kg_create_relationship calls.',
      inputSchema: {
        type: 'object',
        properties: {
          entities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                type: { type: 'string' },
                description: { type: 'string' },
                properties: { type: 'object' },
                ref: { type: 'string', description: 'Local reference ID for use in relationships array (e.g. "entity_0")' },
              },
              required: ['name', 'type'],
            },
            description: 'Array of entities to create (max 100)',
          },
          relationships: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: { type: 'string', description: 'Entity ID or ref (e.g. "entity_0" or existing graph ID)' },
                to: { type: 'string', description: 'Entity ID or ref' },
                type: { type: 'string' },
                properties: { type: 'object' },
              },
              required: ['from', 'to', 'type'],
            },
            description: 'Array of relationships to create (can reference entities by ref, max 500)',
          },
          project: PROJECT_PARAM,
        },
        required: ['entities'],
      },
    },


    // ------------------------------------------------------------------------
    // v2: Upsert Entity
    // ------------------------------------------------------------------------
    {
      name: 'kg_upsert_entity',
      description: 'Create an entity or update it if one with the same name+type already exists. Prevents duplicates. Properties are merged (new values override existing).',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string' },
          description: { type: 'string' },
          properties: { type: 'object' },
          project: PROJECT_PARAM,
        },
        required: ['name', 'type'],
      },
    },

    // ------------------------------------------------------------------------
    // v2: Find Entity
    // ------------------------------------------------------------------------
    {
      name: 'kg_find_entity',
      description: 'Find entities by exact name match (case-insensitive). Returns matching entities with their connections. Use this instead of kg_search when you know the exact entity name.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Exact entity name to find (case-insensitive)' },
          type: { type: 'string', description: 'Optional: filter by entity type' },
          project: PROJECT_PARAM,
        },
        required: ['name'],
      },
    },

    // ------------------------------------------------------------------------
    // v2: Entity Relationships
    // ------------------------------------------------------------------------
    {
      name: 'kg_entity_relationships',
      description: 'List all relationships for a specific entity (both inbound and outbound). More targeted than kg_list_relationships.',
      inputSchema: {
        type: 'object',
        properties: {
          entity_id: { type: 'string', description: 'Entity ID to get relationships for' },
          direction: { type: 'string', enum: ['all', 'outgoing', 'incoming'], description: 'Filter by direction (default: all)' },
          relationship_type: { type: 'string', description: 'Filter by relationship type (e.g. CONTAINS, DEPENDS_ON)' },
          project: PROJECT_PARAM,
        },
        required: ['entity_id'],
      },
    },

    // ------------------------------------------------------------------------
    // v2: Batch Delete
    // ------------------------------------------------------------------------
    {
      name: 'kg_batch_delete',
      description: 'Delete multiple entities and their relationships in a single call. Use for cleanup operations.',
      inputSchema: {
        type: 'object',
        properties: {
          entity_ids: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of entity IDs to delete',
          },
          project: PROJECT_PARAM,
        },
        required: ['entity_ids'],
      },
    },

    // ------------------------------------------------------------------------
    // v2: Deduplicate
    // ------------------------------------------------------------------------
    {
      name: 'kg_deduplicate',
      description: 'Find and merge duplicate entities (same name+type). Keeps the oldest entity, merges properties from duplicates, and re-points all relationships to the surviving entity.',
      inputSchema: {
        type: 'object',
        properties: {
          entity_type: { type: 'string', description: 'Limit dedup to a specific entity type' },
          dry_run: { type: 'boolean', description: 'If true, returns duplicates found without merging (default: true)' },
          project: PROJECT_PARAM,
        },
      },
    },

    // ------------------------------------------------------------------------
    // Health Check
    // ------------------------------------------------------------------------
    {
      name: 'kg_health',
      description: 'Check knowledge graph API health status.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ],
}));

// ============================================================================
// Tool Handlers
// ============================================================================

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const params = args as Record<string, unknown>;
  const project = (params.project as string) || DEFAULT_PROJECT;

  try {
    let result: unknown;

    switch (name) {
      // Search
      case 'kg_search': {
        const searchParams = {
          query: params.query as string,
          mode: params.mode as 'hybrid' | 'vector' | 'graph',
          limit: params.limit as number,
          entity_types: params.entity_types as string[],
        };
        if (!params.project || params.project === 'all') {
          result = await api.searchAll(searchParams);
        } else {
          result = await api.search(project, searchParams);
        }
        break;
      }

      // Entities

      case 'kg_list_entities':
        result = await api.listEntities(project, {
          type: params.type as string,
          limit: params.limit as number,
        });
        break;

      case 'kg_create_entity':
        result = await api.createEntity(project, {
          name: params.name as string,
          type: params.type as string,
          description: params.description as string,
          properties: params.properties as Record<string, unknown>,
        });
        break;

      case 'kg_delete_entity':
        await api.deleteEntity(project, stripEntityPrefix(params.entity_id as string));
        result = { deleted: true, entity_id: params.entity_id };
        break;

      // Relationships
      case 'kg_create_relationship':
        result = await api.createRelationship(project, {
          from_entity_id: stripEntityPrefix(params.from_entity_id as string),
          to_entity_id: stripEntityPrefix(params.to_entity_id as string),
          type: params.type as string,
          properties: params.properties as Record<string, unknown>,
        });
        break;


      // Cypher
      case 'kg_cypher':
        result = await api.executeCypher(project, params.query as string);
        break;

      // Documents
      case 'kg_ingest_document': {
        // Create document
        const doc = await api.createDocument(project, {
          filename: params.filename as string,
          content: params.content as string,
          content_type: params.content_type as string,
        });
        // Process it (chunk, embed, extract entities)
        const processed = await api.processDocument(project, doc.id);
        result = { document: doc, processing: processed };
        break;
      }

      case 'kg_list_documents':
        result = await api.listDocuments(project, {
          content_type: params.content_type as string,
          processed: params.processed as boolean,
        });
        break;


      // v2: Batch Create
      case 'kg_batch_create':
        result = await api.batchCreate(project, {
          entities: (params.entities as Array<{
            name: string;
            type: string;
            description?: string;
            properties?: Record<string, unknown>;
            ref?: string;
          }>) || [],
          relationships: (params.relationships as Array<{
            from: string;
            to: string;
            type: string;
            properties?: Record<string, unknown>;
          }>) || [],
        });
        break;


      // v2: Upsert Entity
      case 'kg_upsert_entity':
        result = await api.upsertEntity(project, {
          name: params.name as string,
          type: params.type as string,
          description: params.description as string,
          properties: params.properties as Record<string, unknown>,
        });
        break;

      // v2: Find Entity
      case 'kg_find_entity':
        result = await api.findEntity(
          project,
          params.name as string,
          params.type as string | undefined,
        );
        break;

      // v2: Entity Relationships
      case 'kg_entity_relationships':
        result = await api.getEntityRelationships(project, stripEntityPrefix(params.entity_id as string), {
          direction: params.direction as 'all' | 'outgoing' | 'incoming' | undefined,
          relationship_type: params.relationship_type as string | undefined,
        });
        break;

      // v2: Batch Delete
      case 'kg_batch_delete':
        result = await api.batchDelete(project, (params.entity_ids as string[]).map(stripEntityPrefix));
        break;

      // v2: Deduplicate
      case 'kg_deduplicate':
        result = await api.deduplicate(project, {
          entity_type: params.entity_type as string | undefined,
          dry_run: (params.dry_run as boolean) ?? true,
        });
        break;


      // Health
      case 'kg_health':
        result = await api.healthCheck();
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: message }) }],
      isError: true,
    };
  }
});

// ============================================================================
// Start Server
// ============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Knowledge Graph MCP server running on stdio');
  console.error(`Default project: ${DEFAULT_PROJECT}`);
  console.error(`API URL: ${process.env.KNOWLEDGE_API_URL || 'http://localhost:8100'}`);
}

main().catch(console.error);
