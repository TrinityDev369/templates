'use client';

import { useState, useCallback } from 'react';
import type { GraphData, SearchResponse, EntityType } from './types';

// Use the Next.js proxy endpoint which forwards to the knowledge API
// This avoids CORS issues and works regardless of where the browser is running
const API_BASE = process.env.NEXT_PUBLIC_KNOWLEDGE_API_URL || '/api/knowledge';

interface UseKnowledgeGraphOptions {
  projectSlug: string;
}

export function useKnowledgeGraph({ projectSlug }: UseKnowledgeGraphOptions) {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGraph = useCallback(
    async (options?: { focus?: string; depth?: number; types?: EntityType[]; limit?: number }) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (options?.focus) params.set('focus', options.focus);
        if (options?.depth) params.set('depth', String(options.depth));
        if (options?.types) params.set('types', options.types.join(','));
        if (options?.limit) params.set('limit', String(options.limit));

        const url = `${API_BASE}/projects/${projectSlug}/visualization/graph?${params}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch graph: ${response.statusText}`);
        }

        const data: GraphData = await response.json();
        setGraphData(data);
        return data;
      } catch (err) {
        let message = 'Unknown error';
        if (err instanceof Error) {
          // Improve error messages for common network errors
          if (err.message === 'Failed to fetch') {
            message = `Cannot connect to Knowledge API at ${API_BASE}. Is the service running?`;
          } else {
            message = err.message;
          }
        }
        setError(message);
        console.error('[KnowledgeGraph] Fetch error:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [projectSlug]
  );

  const search = useCallback(
    async (query: string, mode: 'hybrid' | 'vector' | 'graph' = 'hybrid', limit = 10) => {
      try {
        const response = await fetch(`${API_BASE}/projects/${projectSlug}/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, mode, limit }),
        });

        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }

        const data: SearchResponse = await response.json();
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      }
    },
    [projectSlug]
  );

  const focusOnNode = useCallback(
    async (nodeId: string, depth = 2) => {
      return fetchGraph({ focus: nodeId, depth });
    },
    [fetchGraph]
  );

  return {
    graphData,
    loading,
    error,
    fetchGraph,
    search,
    focusOnNode,
  };
}
