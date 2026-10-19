import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core } from 'cytoscape';
import { AccessPoint, InterferenceEdge, AlgorithmStep } from '../types';
import { getChannelByNumber } from '../constants/channels';
import {
  Wifi,
  Building,
  Box,
  Share2,
  Plus,
  Minus,
  Maximize2,
  Link as LinkIcon,
  Layers,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Maximize,
  Minimize,
  Play,
  Pause,
  RotateCcw,
  StepForward,
} from 'lucide-react';
import { FloorPlanView } from './FloorPlanView';
import { IsometricFloorPlan3D } from './IsometricFloorPlan3D';
import { TimeComplexityHUD } from './TimeComplexityHUD';
import { NodeInspectorModal } from './NodeInspectorModal';

export type ViewMode = 'floorplan' | 'isometric' | 'topology';

interface NetworkGraphProps {
  nodes: AccessPoint[];
  edges: InterferenceEdge[];
  currentStep: AlgorithmStep | null;
  currentAssignments: Record<string, number | null>;
  activeVertexId: string | null;
  conflictingEdgeId: string | null;
  conflictingVertexId: string | null;
  isSolution: boolean;
  availableChannelsCount: number;
  totalSteps?: number;
  backtrackCount?: number;
  currentStepIndex?: number;
  isFocusMode?: boolean;
  isLeftCollapsed?: boolean;
  isRightCollapsed?: boolean;
  isRunning?: boolean;
  speed?: number;
  onToggleFocusMode?: () => void;
  onToggleLeft?: () => void;
  onToggleRight?: () => void;
  onStart?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  onStep?: () => void;
  onChangeSpeed?: (speed: number) => void;
  onNodeMove: (id: string, x: number, y: number) => void;
  onAddNode: (x?: number, y?: number) => void;
  onDeleteNode: (id: string) => void;
  onUpdateNode: (node: AccessPoint) => void;
  onToggleEdge: (source: string, target: string) => void;
  onAutoConnectEdges?: () => void;
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
  availableChannelsCount,
  totalSteps = 14,
  backtrackCount = 2,
  currentStepIndex = 0,
  isFocusMode = false,
  isLeftCollapsed = false,
  isRightCollapsed = false,
  isRunning = false,
  speed = 400,
  onToggleFocusMode,
  onToggleLeft,
  onToggleRight,
  onStart,
  onPause,
  onReset,
  onStep,
  onChangeSpeed,
  onNodeMove,
  onAddNode,
  onDeleteNode,
  onUpdateNode,
  onToggleEdge,
  onAutoConnectEdges,
}) => {
  // Active View Mode (Default: Floor Plan 2D for high impact)
  const [viewMode, setViewMode] = useState<ViewMode>('floorplan');

  // Visualization Layer Toggles
  const [showSignalWaves, setShowSignalWaves] = useState<boolean>(true);
  const [showCoverageCircles, setShowCoverageCircles] = useState<boolean>(true);
  const [showRoomLabels, setShowRoomLabels] = useState<boolean>(true);
  const [showLayersMenu, setShowLayersMenu] = useState<boolean>(false);

  // Selected Node for Inspector
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Connecting Edge Mode
  const [isConnectMode, setIsConnectMode] = useState<boolean>(false);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);

  // Cytoscape References
  const cytoscapeContainerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  // Initialize Cytoscape (only active when in 'topology' mode)
  useEffect(() => {
    if (viewMode !== 'topology' || !cytoscapeContainerRef.current) return;

    const elements: cytoscape.ElementDefinition[] = [];

    nodes.forEach((node) => {
      elements.push({
        group: 'nodes',
        data: {
          id: node.id,
          label: `${node.id}\n${node.locationName || ''}`,
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
      container: cytoscapeContainerRef.current,
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
            width: 2.2,
            'line-color': '#334155',
            'curve-style': 'straight',
            opacity: 0.9,
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
      onNodeMove(node.id(), Math.round(pos.x), Math.round(pos.y));
    });

    cy.on('tap', 'node', (evt) => {
      setSelectedNodeId(evt.target.id());
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [viewMode, nodes.length, edges.length]);

  // Update Cytoscape visuals dynamically
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || viewMode !== 'topology') return;

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

        if (assignedChannelNum !== null && assignedChannelNum !== undefined && channelMeta) {
          bg = channelMeta.lightColor;
          border = channelMeta.color;
        } else if (isCurrent && currentStep?.tryingChannel) {
          const testMeta = getChannelByNumber(currentStep.tryingChannel);
          if (testMeta) {
            bg = testMeta.lightColor;
            border = testMeta.color;
          }
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
    viewMode,
    nodes,
    edges,
    currentStep,
    currentAssignments,
    activeVertexId,
    conflictingEdgeId,
    conflictingVertexId,
    isSolution,
  ]);

  // Handle Edge Connect sequence
  const handleNodeClickConnect = (id: string) => {
    if (!connectingSourceId) {
      setConnectingSourceId(id);
    } else {
      if (connectingSourceId !== id) {
        onToggleEdge(connectingSourceId, id);
      }
      setConnectingSourceId(null);
      setIsConnectMode(false);
    }
  };

  const handleZoomIn = () => {
    if (cyRef.current && viewMode === 'topology') cyRef.current.zoom(cyRef.current.zoom() * 1.2);
  };

  const handleZoomOut = () => {
    if (cyRef.current && viewMode === 'topology') cyRef.current.zoom(cyRef.current.zoom() * 0.8);
  };

  const handleFit = () => {
    if (cyRef.current && viewMode === 'topology') cyRef.current.fit(undefined, 35);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div className={`app-card network-visualizer-main-card ${isFocusMode ? 'visualizer-focus-active' : ''}`}>
      {/* 1. Top Navigation Toolbar with Panel Collapsers & Mode Switcher */}
      <div className="graph-header-row">
        {/* Left: Left Sidebar Toggle & Title & View Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {onToggleLeft && !isFocusMode && (
            <button
              type="button"
              onClick={onToggleLeft}
              className={`panel-toggle-btn ${isLeftCollapsed ? 'panel-btn-collapsed' : ''}`}
              title={isLeftCollapsed ? 'Expand Network Configuration' : 'Minimize Configuration Panel'}
            >
              {isLeftCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
              <span>{isLeftCollapsed ? 'Config' : 'Hide Config'}</span>
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wifi size={16} color="#2563eb" />
            <h2 className="card-header-title">Wi-Fi Channel Visualizer</h2>
          </div>

          {/* 3-Way Mode Switcher Tabs */}
          <div className="view-mode-tabs">
            <button
              type="button"
              onClick={() => setViewMode('floorplan')}
              className={`mode-tab-btn ${viewMode === 'floorplan' ? 'mode-tab-active' : ''}`}
              title="Architectural office floor plan with router devices and radiating wave animations"
            >
              <Building size={13} />
              <span>Floor Plan</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('isometric')}
              className={`mode-tab-btn ${viewMode === 'isometric' ? 'mode-tab-active' : ''}`}
              title="High-impact 3D isometric building model with depth and 3D signal fields"
            >
              <Box size={13} />
              <span>3D Isometric</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('topology')}
              className={`mode-tab-btn ${viewMode === 'topology' ? 'mode-tab-active' : ''}`}
              title="Mathematical graph coloring node-edge view"
            >
              <Share2 size={13} />
              <span>Graph</span>
            </button>
          </div>
        </div>

        {/* Right: Legend & Focus Mode & Right Panel Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Channel Legend */}
          <div className="graph-legend">
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: '#DC2626' }} />
              <span>Ch 1</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: '#059669' }} />
              <span>Ch 6</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: '#2563EB' }} />
              <span>Ch 11</span>
            </div>
            {availableChannelsCount >= 4 && (
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#D97706' }} />
                <span>Ch 36</span>
              </div>
            )}
          </div>

          {/* Full Screen / Focus Mode Toggle (Main Big Canvas Mode) */}
          {onToggleFocusMode && (
            <button
              type="button"
              onClick={onToggleFocusMode}
              className={`focus-screen-btn ${isFocusMode ? 'focus-screen-active' : ''}`}
              title={isFocusMode ? 'Exit Big Screen Mode' : 'Maximize Canvas (Hide Panels for Huge Screen)'}
            >
              {isFocusMode ? <Minimize size={13} /> : <Maximize size={13} />}
              <span>{isFocusMode ? 'Exit Focus' : 'Focus Screen'}</span>
            </button>
          )}

          {/* Right Panel Toggle Button */}
          {onToggleRight && !isFocusMode && (
            <button
              type="button"
              onClick={onToggleRight}
              className={`panel-toggle-btn ${isRightCollapsed ? 'panel-btn-collapsed' : ''}`}
              title={isRightCollapsed ? 'Expand Search Tree & Execution Log' : 'Minimize Search Tree Panel'}
            >
              <span>{isRightCollapsed ? 'Tree/Logs' : 'Hide Tree'}</span>
              {isRightCollapsed ? <PanelRightOpen size={14} /> : <PanelRightClose size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* 2. Real-Time DAA Time & Space Complexity HUD Bar */}
      <TimeComplexityHUD
        nodes={nodes}
        edges={edges}
        availableChannelsCount={availableChannelsCount}
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        backtrackCount={backtrackCount}
        currentDepth={currentStep?.depth || 0}
      />

      {/* 3. Action Toolbar (Deploy AP, Link APs, Auto-Interference, Layers, and Focus Controls) */}
      <div className="graph-action-subbar">
        <div className="subbar-left">
          {/* Add AP Button */}
          <button
            type="button"
            onClick={() => onAddNode()}
            className="action-pill-btn btn-add-ap"
            title="Deploy a new Wi-Fi Access Point to the network"
          >
            <Plus size={13} />
            <span>Deploy AP</span>
          </button>

          {/* Toggle Edge / Connect Mode */}
          <button
            type="button"
            onClick={() => {
              setIsConnectMode(!isConnectMode);
              setConnectingSourceId(null);
            }}
            className={`action-pill-btn ${isConnectMode ? 'action-pill-active' : ''}`}
            title="Click an AP, then another to add or remove an interference constraint"
          >
            <LinkIcon size={13} />
            <span>{isConnectMode ? 'Cancel Linking' : 'Link / Cut Interference'}</span>
          </button>

          {/* Auto-Calculate Interference from Coverage Overlap */}
          {onAutoConnectEdges && (
            <button
              type="button"
              onClick={onAutoConnectEdges}
              className="action-pill-btn"
              title="Automatically connect interference edges between overlapping routers"
            >
              <Sparkles size={13} />
              <span>Auto-Interference</span>
            </button>
          )}
        </div>

        {/* Center: In Focus Mode or Left-Collapsed, display live Play/Pause/Step toolbar right here! */}
        {(isFocusMode || isLeftCollapsed) && onStart && onPause && onReset && onStep && (
          <div className="focus-playback-bar">
            {isRunning ? (
              <button onClick={onPause} className="focus-play-btn btn-pause" title="Pause simulation">
                <Pause size={13} fill="#ffffff" />
                <span>Pause</span>
              </button>
            ) : (
              <button onClick={onStart} className="focus-play-btn btn-play" title="Run Backtracking algorithm">
                <Play size={13} fill="#ffffff" />
                <span>Run Algorithm</span>
              </button>
            )}
            <button onClick={onStep} disabled={isRunning} className="focus-step-btn" title="Execute single step">
              <StepForward size={12} />
              <span>Step</span>
            </button>
            <button onClick={onReset} className="focus-reset-btn" title="Reset state">
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>

            {/* Quick Pace Buttons in Focus Mode */}
            {onChangeSpeed && (
              <div className="focus-speed-pills">
                {[
                  { label: '1x', ms: 400 },
                  { label: '2x', ms: 160 },
                  { label: 'Turbo', ms: 50 },
                ].map((s) => (
                  <button
                    key={s.ms}
                    type="button"
                    onClick={() => onChangeSpeed(s.ms)}
                    className={`focus-speed-btn ${speed === s.ms ? 'speed-btn-active' : ''}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="subbar-right">
          {/* Visual Layers Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowLayersMenu(!showLayersMenu)}
              className="action-pill-btn"
              title="Toggle visualization layers"
            >
              <Layers size={13} />
              <span>Layers</span>
            </button>

            {showLayersMenu && (
              <div className="layers-popover-menu">
                <label className="layer-checkbox-item">
                  <input
                    type="checkbox"
                    checked={showSignalWaves}
                    onChange={(e) => setShowSignalWaves(e.target.checked)}
                  />
                  <span>Radiating Signal Waves</span>
                </label>
                <label className="layer-checkbox-item">
                  <input
                    type="checkbox"
                    checked={showCoverageCircles}
                    onChange={(e) => setShowCoverageCircles(e.target.checked)}
                  />
                  <span>Coverage Radii</span>
                </label>
                <label className="layer-checkbox-item">
                  <input
                    type="checkbox"
                    checked={showRoomLabels}
                    onChange={(e) => setShowRoomLabels(e.target.checked)}
                  />
                  <span>Room Labels</span>
                </label>
              </div>
            )}
          </div>

          {/* Topology Zoom Controls */}
          {viewMode === 'topology' && (
            <div className="zoom-controls-compact">
              <button onClick={handleZoomIn} className="zoom-btn" title="Zoom In">
                <Plus size={13} />
              </button>
              <button onClick={handleZoomOut} className="zoom-btn" title="Zoom Out">
                <Minus size={13} />
              </button>
              <button onClick={handleFit} className="zoom-btn" title="Fit to Screen">
                <Maximize2 size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Canvas Viewport Box */}
      <div className="graph-canvas-box visualizer-canvas-viewport">
        {/* Mode 1: 2D Floor Plan (Architectural Blueprint) */}
        {viewMode === 'floorplan' && (
          <FloorPlanView
            nodes={nodes}
            edges={edges}
            currentStep={currentStep}
            currentAssignments={currentAssignments}
            activeVertexId={activeVertexId}
            conflictingEdgeId={conflictingEdgeId}
            conflictingVertexId={conflictingVertexId}
            isSolution={isSolution}
            selectedNodeId={selectedNodeId}
            showSignalWaves={showSignalWaves}
            showCoverageCircles={showCoverageCircles}
            showRoomLabels={showRoomLabels}
            connectingSourceId={connectingSourceId}
            onSelectNode={setSelectedNodeId}
            onNodeMove={onNodeMove}
            onCanvasDoubleClick={(x, y) => onAddNode(x, y)}
            onNodeClickConnect={isConnectMode ? handleNodeClickConnect : undefined}
          />
        )}

        {/* Mode 2: 3D Isometric View (Perspective Cyber Office) */}
        {viewMode === 'isometric' && (
          <IsometricFloorPlan3D
            nodes={nodes}
            edges={edges}
            currentStep={currentStep}
            currentAssignments={currentAssignments}
            activeVertexId={activeVertexId}
            conflictingEdgeId={conflictingEdgeId}
            conflictingVertexId={conflictingVertexId}
            isSolution={isSolution}
            selectedNodeId={selectedNodeId}
            showSignalWaves={showSignalWaves}
            showCoverageCircles={showCoverageCircles}
            connectingSourceId={connectingSourceId}
            isRunning={isRunning}
            speed={speed}
            availableChannelsCount={availableChannelsCount}
            totalSteps={totalSteps}
            backtrackCount={backtrackCount}
            currentStepIndex={currentStepIndex}
            onSelectNode={setSelectedNodeId}
            onNodeMove={onNodeMove}
            onNodeClickConnect={isConnectMode ? handleNodeClickConnect : undefined}
            onStart={onStart}
            onPause={onPause}
            onReset={onReset}
            onStep={onStep}
            onChangeSpeed={onChangeSpeed}
          />
        )}

        {/* Mode 3: Classic Cytoscape Graph View */}
        {viewMode === 'topology' && (
          <div
            ref={cytoscapeContainerRef}
            style={{ width: '100%', height: '100%', minHeight: '460px' }}
          />
        )}
      </div>

      {/* 5. Selected Node Inspector Popover Modal */}
      {selectedNode && (
        <NodeInspectorModal
          node={selectedNode}
          edges={edges}
          allNodes={nodes}
          currentAssignment={currentAssignments[selectedNode.id] ?? null}
          onUpdate={onUpdateNode}
          onDelete={onDeleteNode}
          onToggleEdge={onToggleEdge}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  );
};
