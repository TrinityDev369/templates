'use client';

import { useCallback, useMemo, useRef } from 'react';
import {
  GraphCanvas,
  GraphCanvasRef,
  GraphNode as ReagraphNode,
  GraphEdge as ReagraphEdge,
  useSelection,
  lightTheme,
  darkTheme,
} from 'reagraph';
import { useTheme } from 'next-themes';
import type { GraphData, GraphNode, EntityType } from './types';
import { ENTITY_COLORS } from './types';

interface KnowledgeGraphProps {
  data: GraphData | null;
  onNodeClick?: (node: GraphNode) => void;
  onNodeDoubleClick?: (node: GraphNode) => void;
  selectedNodeId?: string | null;
  filterTypes?: EntityType[];
  className?: string;
}

// Custom dark theme matching project design system
const darkTheme = {
  ...darkTheme,
  canvas: {
    ...darkTheme.canvas,
    background: '#0f172a', // slate-900
  },
  node: {
    ...darkTheme.node,
    label: {
      ...darkTheme.node.label,
      color: '#e2e8f0', // slate-200
    },
  },
  edge: {
    ...darkTheme.edge,
    fill: '#475569', // slate-600
    label: {
      ...darkTheme.edge.label,
      color: '#94a3b8', // slate-400
    },
  },
};

// Custom light theme
const lightTheme = {
  ...lightTheme,
  canvas: {
    ...lightTheme.canvas,
    background: '#f8fafc', // slate-50
  },
  node: {
    ...lightTheme.node,
    label: {
      ...lightTheme.node.label,
      color: '#1e293b', // slate-800
    },
  },
  edge: {
    ...lightTheme.edge,
    fill: '#94a3b8', // slate-400
    label: {
      ...lightTheme.edge.label,
      color: '#64748b', // slate-500
    },
  },
};

export function KnowledgeGraphReagraph({
  data,
  onNodeClick,
  onNodeDoubleClick,
  selectedNodeId,
  filterTypes,
  className = '',
}: KnowledgeGraphProps) {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const { resolvedTheme } = useTheme();

  // Transform data to Reagraph format
  const { nodes, edges } = useMemo(() => {
    if (!data) return { nodes: [], edges: [] };

    // Filter nodes if filterTypes is set
    const filteredNodes = filterTypes
      ? data.nodes.filter((n) => filterTypes.includes(n.type))
      : data.nodes;

    const nodeIds = new Set(filteredNodes.map((n) => n.id));

    // Filter edges to only include those connecting visible nodes
    const filteredEdges = data.edges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
    );

    // Convert to Reagraph format
    const reagraphNodes: ReagraphNode[] = filteredNodes.map((node) => ({
      id: node.id,
      label: node.label,
      fill: node.color || ENTITY_COLORS[node.type] || '#6B7280',
      data: {
        type: node.type,
        properties: node.properties,
      },
    }));

    const reagraphEdges: ReagraphEdge[] = filteredEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.type,
      size: 2,
    }));

    return { nodes: reagraphNodes, edges: reagraphEdges };
  }, [data, filterTypes]);

  // Selection handling
  const {
    selections,
    actives,
    onNodeClick: handleSelectionClick,
    onCanvasClick,
  } = useSelection({
    ref: graphRef,
    nodes,
    edges,
    pathSelectionType: 'out',
  });

  // Handle node click - bridge to parent callback
  const handleNodeClick = useCallback(
    (node: ReagraphNode) => {
      handleSelectionClick?.(node);

      if (onNodeClick) {
        const graphNode: GraphNode = {
          id: node.id,
          label: node.label || '',
          type: node.data?.type || 'Concept',
          properties: node.data?.properties || {},
          color: node.fill as string,
        };
        onNodeClick(graphNode);
      }
    },
    [handleSelectionClick, onNodeClick]
  );

  // Handle double click
  const handleNodeDoubleClick = useCallback(
    (node: ReagraphNode) => {
      if (onNodeDoubleClick) {
        const graphNode: GraphNode = {
          id: node.id,
          label: node.label || '',
          type: node.data?.type || 'Concept',
          properties: node.data?.properties || {},
          color: node.fill as string,
        };
        onNodeDoubleClick(graphNode);
      }

      // Center on the node
      graphRef.current?.centerGraph([node.id]);
    },
    [onNodeDoubleClick]
  );

  // Select appropriate theme
  const theme = resolvedTheme === 'dark' ? darkTheme : lightTheme;

  if (!data || nodes.length === 0) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-slate-50 dark:bg-slate-900 ${className}`}
        style={{ minHeight: '400px' }}
      >
        <p className="text-muted-foreground">No data to display</p>
      </div>
    );
  }

  return (
    <div
      className={`h-full w-full ${className}`}
      style={{ minHeight: '400px' }}
    >
      <GraphCanvas
        ref={graphRef}
        nodes={nodes}
        edges={edges}
        selections={selections}
        actives={actives}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onCanvasClick={onCanvasClick}
        theme={theme}
        layoutType="forceDirected2d"
        sizingType="centrality"
        labelType="all"
        edgeArrowPosition="end"
        edgeInterpolation="curved"
        animated
        draggable
      />
    </div>
  );
}
