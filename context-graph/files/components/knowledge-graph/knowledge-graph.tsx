'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import cytoscape, { Core, NodeSingular } from 'cytoscape';
import type { GraphData, GraphNode, EntityType } from './types';
import { ENTITY_COLORS } from './types';

// Track if fcose is registered (singleton across component instances)
let fcoseRegistered = false;

interface KnowledgeGraphProps {
  data: GraphData | null;
  onNodeClick?: (node: GraphNode) => void;
  onNodeDoubleClick?: (node: GraphNode) => void;
  selectedNodeId?: string | null;
  filterTypes?: EntityType[];
  className?: string;
}

// Cytoscape stylesheet
const stylesheet: cytoscape.StylesheetStyle[] = [
  {
    selector: 'node',
    style: {
      'background-color': 'data(color)',
      label: 'data(label)',
      width: 44,
      height: 44,
      'font-size': '11px',
      'text-valign': 'bottom',
      'text-halign': 'center',
      'text-margin-y': 6,
      'text-wrap': 'ellipsis',
      'text-max-width': '80px',
      color: '#374151',
      'border-width': 2,
      'border-color': '#ffffff',
      'border-opacity': 0.8,
    },
  },
  {
    selector: 'node:selected',
    style: {
      'border-width': 4,
      'border-color': '#F59E0B',
      width: 52,
      height: 52,
    },
  },
  {
    selector: 'node.highlighted',
    style: {
      'border-width': 3,
      'border-color': '#3B82F6',
    },
  },
  {
    selector: 'node.dimmed',
    style: {
      opacity: 0.3,
    },
  },
  {
    selector: 'edge',
    style: {
      width: 2,
      'line-color': '#9CA3AF',
      'target-arrow-color': '#9CA3AF',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      label: 'data(type)',
      'font-size': '9px',
      'text-rotation': 'autorotate',
      'text-margin-y': -8,
      color: '#6B7280',
      'text-opacity': 0.7,
    },
  },
  {
    selector: 'edge:selected',
    style: {
      width: 3,
      'line-color': '#F59E0B',
      'target-arrow-color': '#F59E0B',
    },
  },
  {
    selector: 'edge.dimmed',
    style: {
      opacity: 0.2,
    },
  },
];

export function KnowledgeGraph({
  data,
  onNodeClick,
  onNodeDoubleClick,
  selectedNodeId,
  filterTypes,
  className = '',
}: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [fcoseLoaded, setFcoseLoaded] = useState(fcoseRegistered);

  // Load fcose layout extension (client-side only)
  useEffect(() => {
    if (fcoseRegistered) {
      setFcoseLoaded(true);
      return;
    }

    import('cytoscape-fcose')
      .then((module) => {
        if (!fcoseRegistered) {
          cytoscape.use(module.default);
          fcoseRegistered = true;
        }
        setFcoseLoaded(true);
      })
      .catch((err) => {
        console.warn('Failed to load fcose layout, using cose fallback:', err);
        setFcoseLoaded(false);
      });
  }, []);

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current || cyRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      style: stylesheet,
      layout: { name: 'preset' },
      minZoom: 0.2,
      maxZoom: 3,
      wheelSensitivity: 0.3,
    });

    cyRef.current = cy;
    setIsReady(true);

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, []);

  // Update graph data
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !data) return;

    // Clear existing elements
    cy.elements().remove();

    // Filter nodes if filterTypes is set
    const filteredNodes = filterTypes
      ? data.nodes.filter((n) => filterTypes.includes(n.type))
      : data.nodes;

    const nodeIds = new Set(filteredNodes.map((n) => n.id));

    // Filter edges to only include those connecting visible nodes
    const filteredEdges = data.edges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
    );

    // Add nodes
    const nodes = filteredNodes.map((node) => ({
      data: {
        id: node.id,
        label: node.label,
        type: node.type,
        color: node.color || ENTITY_COLORS[node.type] || '#6B7280',
        properties: node.properties,
      },
    }));

    // Add edges
    const edges = filteredEdges.map((edge) => ({
      data: {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
      },
    }));

    cy.add([...nodes, ...edges]);

    // Run layout - use fcose if loaded, otherwise fall back to cose
    const layoutOptions = fcoseLoaded
      ? {
          name: 'fcose' as const,
          quality: 'proof' as const,
          animate: true,
          animationDuration: 500,
          nodeRepulsion: 4500,
          idealEdgeLength: 100,
          edgeElasticity: 0.45,
          gravity: 0.25,
          gravityRange: 3.8,
          nodeSeparation: 75,
          randomize: true,
          fit: true,
          padding: 50,
        }
      : {
          name: 'cose' as const,
          animate: true,
          animationDuration: 500,
          nodeRepulsion: 4500,
          idealEdgeLength: 100,
          fit: true,
          padding: 50,
        };

    cy.layout(layoutOptions as cytoscape.LayoutOptions).run();
  }, [data, filterTypes, isReady, fcoseLoaded]);

  // Handle node click events
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const handleClick = (event: cytoscape.EventObject) => {
      const node = event.target as NodeSingular;
      if (node.isNode && node.isNode()) {
        const nodeData: GraphNode = {
          id: node.id(),
          label: node.data('label'),
          type: node.data('type'),
          properties: node.data('properties'),
          color: node.data('color'),
        };
        onNodeClick?.(nodeData);
      }
    };

    const handleDblClick = (event: cytoscape.EventObject) => {
      const node = event.target as NodeSingular;
      if (node.isNode && node.isNode()) {
        const nodeData: GraphNode = {
          id: node.id(),
          label: node.data('label'),
          type: node.data('type'),
          properties: node.data('properties'),
          color: node.data('color'),
        };
        onNodeDoubleClick?.(nodeData);
      }
    };

    cy.on('tap', 'node', handleClick);
    cy.on('dbltap', 'node', handleDblClick);

    return () => {
      cy.off('tap', 'node', handleClick);
      cy.off('dbltap', 'node', handleDblClick);
    };
  }, [onNodeClick, onNodeDoubleClick, isReady]);

  // Handle selected node highlighting
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    // Reset all elements
    cy.elements().removeClass('highlighted dimmed');

    if (selectedNodeId) {
      const selectedNode = cy.getElementById(selectedNodeId);
      if (selectedNode.length) {
        selectedNode.select();

        // Highlight connected nodes and edges
        const neighborhood = selectedNode.neighborhood();
        neighborhood.addClass('highlighted');

        // Dim unrelated elements
        cy.elements()
          .difference(neighborhood.union(selectedNode))
          .addClass('dimmed');
      }
    }
  }, [selectedNodeId, isReady]);

  // Fit graph to viewport
  const fitToViewport = useCallback(() => {
    cyRef.current?.fit(undefined, 50);
  }, []);

  // Center on node
  const centerOnNode = useCallback((nodeId: string) => {
    const cy = cyRef.current;
    if (!cy) return;

    const node = cy.getElementById(nodeId);
    if (node.length) {
      cy.animate({
        center: { eles: node },
        zoom: 1.5,
        duration: 300,
      });
    }
  }, []);

  // Expose methods via ref (if needed)
  useEffect(() => {
    if (containerRef.current) {
      (containerRef.current as unknown as { fit: () => void; centerOnNode: (id: string) => void }).fit = fitToViewport;
      (containerRef.current as unknown as { centerOnNode: (id: string) => void }).centerOnNode = centerOnNode;
    }
  }, [fitToViewport, centerOnNode]);

  return (
    <div
      ref={containerRef}
      className={`h-full w-full bg-gray-50 dark:bg-gray-900 ${className}`}
      style={{ minHeight: '400px' }}
    />
  );
}
