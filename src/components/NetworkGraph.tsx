import React, { useEffect, useRef } from 'react';
import cytoscape, { Core } from 'cytoscape';
import { AccessPoint, InterferenceEdge, AlgorithmStep } from '../types';
import { getChannelByNumber } from '../constants/channels';
import { Wifi, Plus, Minus, Maximize2 } from 'lucide-react';

interface NetworkGraphProps {
  nodes: AccessPoint[];
  edges: InterferenceEdge[];
  currentStep: AlgorithmStep | null;
  currentAssignments: Record<string, number | null>;
  activeVertexId: string | null;
  conflictingEdgeId: string | null;
  conflictingVertexId: string | null;
  isSolution: boolean;
  onNodeMove?: (id: string, x: number, y: number) => void;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  nodes,
  edges,
  currentStep,
  currentAssignments,
  activeVertexId,
  conflictingEdgeId,
  conflictingVertexId,
  isSolution,
  onNodeMove,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    const elements: cytoscape.ElementDefinition[] = [];

    nodes.forEach((node) => {
      elements.push({
        group: 'nodes',
        data: {
          id: node.id,
          label: node.id,
          channelNumber: null,
          channelBg: '#f1f5f9',
          channelBorder: '#94a3b8',
        },
        position: { x: node.x, y: node.y },
      });
    });

    edges.forEach((edge) => {
      elements.push({
        group: 'edges',
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
        },
      });
    });

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '13px',
            'font-weight': 'bold',
            'font-family': 'Inter, system-ui, sans-serif',
            color: '#0f172a',
            'background-color': 'data(channelBg)',
            'border-width': '2.5px',
            'border-color': 'data(channelBorder)',
            width: '64px',
            height: '64px',
            'transition-property': 'background-color, border-color, border-width, width, height',
            'transition-duration': 0.2,
          },
        },
        {
          selector: 'node.active-node',
          style: {
            'border-width': '4.5px',
            'border-color': '#f59e0b',
            width: '70px',
            height: '70px',
          },
        },
        {
          selector: 'node.conflict-node',
          style: {
            'border-width': '4.5px',
            'border-color': '#ef4444',
            'background-color': '#fee2e2',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': '#334155',
            'curve-style': 'straight',
            opacity: 0.95,
            'transition-property': 'line-color, width, opacity',
            'transition-duration': 0.2,
          },
        },
        {
          selector: 'edge.conflict-edge',
          style: {
            'line-color': '#ef4444',
            width: 4.5,
            opacity: 1,
            'z-index': 99,
          },
        },
        {
          selector: 'edge.safe-edge',
          style: {
            'line-color': '#10b981',
            width: 2.5,
            opacity: 0.85,
          },
        },
      ],
      layout: {
        name: 'preset',
      },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
    });

    cy.fit(undefined, 35);

    cy.on('dragfree', 'node', (evt) => {
      const node = evt.target;
      const pos = node.position();
      if (onNodeMove) {
        onNodeMove(node.id(), Math.round(pos.x), Math.round(pos.y));
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [nodes.length, edges.length]);

  // Update Cytoscape visuals
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.batch(() => {
      nodes.forEach((node) => {
        const cyNode = cy.getElementById(node.id);
        if (!cyNode || cyNode.length === 0) return;

        const assignedChannelNum = currentAssignments[node.id];
        const channelMeta = getChannelByNumber(assignedChannelNum);

        const isCurrent = activeVertexId === node.id;
        const isConflict =
          conflictingVertexId === node.id ||
          (isCurrent && currentStep?.type === 'CONFLICT_DETECTED');

        let bg = '#f8fafc';
        let border = '#cbd5e1';

        // Predefined pastel palette matching reference screenshot
        const defaultPalette: Record<string, { bg: string; border: string }> = {
          AP1: { bg: '#fca5a5', border: '#ef4444' }, // Red
          AP2: { bg: '#93c5fd', border: '#2563eb' }, // Blue
          AP3: { bg: '#86efac', border: '#10b981' }, // Green
          AP4: { bg: '#d8b4fe', border: '#a855f7' }, // Purple
          AP5: { bg: '#f472b6', border: '#ec4899' }, // Magenta
          AP6: { bg: '#fde047', border: '#eab308' }, // Yellow
        };

        if (assignedChannelNum !== null && assignedChannelNum !== undefined && channelMeta) {
          bg = channelMeta.lightColor;
          border = channelMeta.color;
        } else if (isCurrent && currentStep?.tryingChannel) {
          const testMeta = getChannelByNumber(currentStep.tryingChannel);
          if (testMeta) {
            bg = testMeta.lightColor;
            border = testMeta.color;
          }
        } else if (defaultPalette[node.id]) {
          bg = defaultPalette[node.id].bg;
          border = defaultPalette[node.id].border;
        }

        cyNode.data('channelBg', bg);
        cyNode.data('channelBorder', border);

        cyNode.removeClass('active-node conflict-node');
        if (isConflict) {
          cyNode.addClass('conflict-node');
        } else if (isCurrent) {
          cyNode.addClass('active-node');
        }
      });

      edges.forEach((edge) => {
        const cyEdge = cy.getElementById(edge.id);
        if (!cyEdge || cyEdge.length === 0) return;

        cyEdge.removeClass('conflict-edge safe-edge');

        const isConflictEdge =
          conflictingEdgeId === edge.id ||
          (currentStep?.conflictingEdgeId &&
            (currentStep.conflictingEdgeId === edge.id ||
              currentStep.conflictingEdgeId === `${edge.target}-${edge.source}`));

        if (isConflictEdge) {
          cyEdge.addClass('conflict-edge');
        } else if (isSolution) {
          cyEdge.addClass('safe-edge');
        }
      });
    });
  }, [
    nodes,
    edges,
    currentStep,
    currentAssignments,
    activeVertexId,
    conflictingEdgeId,
    conflictingVertexId,
    isSolution,
  ]);

  const handleZoomIn = () => {
    if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 1.2);
  };

  const handleZoomOut = () => {
    if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 0.8);
  };

  const handleFit = () => {
    if (cyRef.current) cyRef.current.fit(undefined, 35);
  };

  return (
    <div className="app-card" style={{ height: '100%' }}>
      {/* Top Header */}
      <div className="graph-header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wifi size={16} color="#2563eb" />
          <h2 className="card-header-title">Wi-Fi Network Graph</h2>
        </div>

        {/* Legend */}
        <div className="graph-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#ef4444' }} />
            <span>Channel 1</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#2563eb' }} />
            <span>Channel 6</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#10b981' }} />
            <span>Channel 11</span>
          </div>
        </div>
      </div>

      <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
        Each node represents an Access Point. Edges show interference.
      </p>

      {/* Interactive Cytoscape Canvas */}
      <div className="graph-canvas-box">
        {/* Floating Zoom Controls */}
        <div className="graph-zoom-controls">
          <button onClick={handleZoomIn} className="zoom-btn" title="Zoom In">
            <Plus size={14} />
          </button>
          <button onClick={handleZoomOut} className="zoom-btn" title="Zoom Out">
            <Minus size={14} />
          </button>
          <button onClick={handleFit} className="zoom-btn" title="Fit to Center">
            <Maximize2 size={14} />
          </button>
        </div>

        {/* Canvas DOM Element */}
        <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '380px' }} />
      </div>
    </div>
  );
};
