import React, { useEffect, useRef } from 'react';
import cytoscape, { Core } from 'cytoscape';
import { AccessPoint, InterferenceEdge } from '../types';
import { getChannelByNumber } from '../constants/channels';

interface TopologyGraphViewProps {
  nodes: AccessPoint[];
  edges: InterferenceEdge[];
  currentAssignments: Record<string, number | null>;
  activeVertexId: string | null;
  conflictingVertexId: string | null;
  onNodeMove: (id: string, x: number, y: number) => void;
}

export const TopologyGraphView: React.FC<TopologyGraphViewProps> = ({
  nodes,
  edges,
  currentAssignments,
  activeVertexId,
  conflictingVertexId,
  onNodeMove,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements: cytoscape.ElementDefinition[] = [];

    nodes.forEach((n) => {
      elements.push({
        group: 'nodes',
        data: {
          id: n.id,
          label: `${n.label || n.id}\n${n.locationName}`,
        },
        position: { x: n.x, y: n.y },
      });
    });

    edges.forEach((e) => {
      elements.push({
        group: 'edges',
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
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
            'text-wrap': 'wrap',
            'font-size': '11px',
            'font-weight': 'bold',
            'font-family': 'Inter, sans-serif',
            color: '#0f172a',
            'background-color': '#f8fafc',
            'border-width': '2.5px',
            'border-color': '#cbd5e1',
            width: '60px',
            height: '60px',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': '#ef4444',
            'line-style': 'dashed',
            'curve-style': 'bezier',
            opacity: 0.85,
          },
        },
      ],
      layout: { name: 'preset' },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
    });

    cy.fit(undefined, 40);

    cy.on('dragfree', 'node', (evt) => {
      const node = evt.target;
      const pos = node.position();
      onNodeMove(node.id(), Math.round(pos.x), Math.round(pos.y));
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [nodes.length, edges.length]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.batch(() => {
      nodes.forEach((n) => {
        const cyNode = cy.getElementById(n.id);
        if (!cyNode || cyNode.length === 0) return;

        const ch = currentAssignments[n.id];
        const meta = getChannelByNumber(ch);

        const isCurrent = activeVertexId === n.id;
        const isConflict = conflictingVertexId === n.id;

        if (isConflict) {
          cyNode.style({
            'background-color': '#fee2e2',
            'border-color': '#ef4444',
            'border-width': '4px',
          });
        } else if (meta) {
          cyNode.style({
            'background-color': meta.lightColor,
            'border-color': meta.color,
            'border-width': isCurrent ? '4px' : '3px',
          });
        } else if (isCurrent) {
          cyNode.style({
            'background-color': '#fef3c7',
            'border-color': '#f59e0b',
            'border-width': '4px',
          });
        } else {
          cyNode.style({
            'background-color': '#f8fafc',
            'border-color': '#cbd5e1',
            'border-width': '2.5px',
          });
        }
      });
    });
  }, [nodes, currentAssignments, activeVertexId, conflictingVertexId]);

  return (
    <div className="topology-view-card">
      <div ref={containerRef} className="topology-canvas-container" style={{ width: '100%', height: '380px' }} />
    </div>
  );
};
