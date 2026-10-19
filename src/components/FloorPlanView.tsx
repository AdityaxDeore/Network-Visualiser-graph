import React, { useState, useRef, useCallback } from 'react';
import { AccessPoint, InterferenceEdge, AlgorithmStep } from '../types';
import { getChannelByNumber } from '../constants/channels';
import { Wifi, Compass, AlertTriangle, ShieldCheck } from 'lucide-react';

interface FloorPlanViewProps {
  nodes: AccessPoint[];
  edges: InterferenceEdge[];
  currentStep: AlgorithmStep | null;
  currentAssignments: Record<string, number | null>;
  activeVertexId: string | null;
  conflictingEdgeId: string | null;
  conflictingVertexId: string | null;
  isSolution: boolean;
  selectedNodeId: string | null;
  showCoverageArea?: boolean;
  showCoverageCircles?: boolean;
  showInterferenceLinks?: boolean;
  showRoomLabels?: boolean;
  showSignalWaves?: boolean;
  connectingSourceId?: string | null;
  is3DView?: boolean;
  onToggle3DView?: (is3D: boolean) => void;
  onSelectNode: (id: string | null) => void;
  onNodeMove: (id: string, x: number, y: number) => void;
  onCanvasDoubleClick?: (x: number, y: number) => void;
  onNodeClickConnect?: (id: string) => void;
}

interface RoomZone {
  id: string;
  name: string;
  subtitle: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const ARCHITECTURAL_ROOMS: RoomZone[] = [
  { id: 'room-lobby', name: 'Main Lobby', subtitle: '(Reception)', x: 210, y: 14, w: 220, h: 120 },
  { id: 'room-west', name: 'West Wing', subtitle: '(Executive)', x: 25, y: 35, w: 170, h: 135 },
  { id: 'room-east', name: 'East Wing', subtitle: '(Conference)', x: 445, y: 35, w: 170, h: 135 },
  { id: 'room-sw', name: 'South West', subtitle: '(Engineering Lab)', x: 25, y: 195, w: 170, h: 155 },
  { id: 'room-hub', name: 'Center Hub', subtitle: '(Open Workspace)', x: 210, y: 155, w: 220, h: 195 },
  { id: 'room-se', name: 'South East', subtitle: '(Data & Server Core)', x: 445, y: 195, w: 170, h: 155 },
];

export const FloorPlanView: React.FC<FloorPlanViewProps> = ({
  nodes,
  edges,
  currentStep,
  currentAssignments,
  activeVertexId,
  conflictingEdgeId,
  conflictingVertexId,
  isSolution,
  selectedNodeId,
  showCoverageArea = true,
  showCoverageCircles,
  showInterferenceLinks = true,
  showRoomLabels = true,
  is3DView = true,
  onToggle3DView,
  onSelectNode,
  onNodeMove,
  onCanvasDoubleClick,
  onNodeClickConnect,
  connectingSourceId,
}) => {
  const displayCoverage = showCoverageArea ?? showCoverageCircles ?? true;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle pointer down for dragging
  const handlePointerDown = (e: React.PointerEvent, node: AccessPoint) => {
    e.stopPropagation();
    onSelectNode(node.id);
    setDraggingNodeId(node.id);

    if (svgRef.current) {
      const ctm = svgRef.current.getScreenCTM();
      if (ctm) {
        const svgX = (e.clientX - ctm.e) / ctm.a;
        const svgY = (e.clientY - ctm.f) / ctm.d;
        setDragOffset({ x: svgX - node.x, y: svgY - node.y });
      }
    }
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingNodeId || !svgRef.current) return;
      const ctm = svgRef.current.getScreenCTM();
      if (!ctm) return;

      const svgX = (e.clientX - ctm.e) / ctm.a;
      const svgY = (e.clientY - ctm.f) / ctm.d;

      const newX = Math.max(40, Math.min(600, Math.round(svgX - dragOffset.x)));
      const newY = Math.max(35, Math.min(365, Math.round(svgY - dragOffset.y)));

      onNodeMove(draggingNodeId, newX, newY);
    },
    [draggingNodeId, dragOffset, onNodeMove]
  );

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingNodeId) {
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
      setDraggingNodeId(null);
    }
  };

  const handleSvgDoubleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onCanvasDoubleClick || !svgRef.current) return;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return;
    const svgX = Math.round((e.clientX - ctm.e) / ctm.a);
    const svgY = Math.round((e.clientY - ctm.f) / ctm.d);
    onCanvasDoubleClick(svgX, svgY);
  };

  // Helper to determine the effective channel at the current moment
  const getEffectiveChannel = (nodeId: string): number | null => {
    if (nodeId === activeVertexId && currentStep?.tryingChannel) {
      return currentStep.tryingChannel;
    }
    return currentAssignments[nodeId] ?? null;
  };

  return (
    <div className="floorplan-main-container">
      {/* 1. Floating Top-Left: 2D / 3D Toggle */}
      <div className="floorplan-top-left-controls">
        <div className="mode-pill-toggle">
          <button
            className={`mode-pill-btn ${!is3DView ? 'active' : ''}`}
            onClick={() => onToggle3DView?.(false)}
          >
            2D
          </button>
          <button
            className={`mode-pill-btn ${is3DView ? 'active' : ''}`}
            onClick={() => onToggle3DView?.(true)}
          >
            3D
          </button>
        </div>
      </div>

      {/* 2. Floating Top-Right: Legend & Compass */}
      <div className="floorplan-top-right-controls">
        <div className="floorplan-legend-pill">
          <div className="legend-item">
            <span className="legend-dashed-line" />
            <span className="legend-text">Interference Link</span>
          </div>
          <div className="legend-divider" />
          <div className="legend-item">
            <span className="legend-coverage-circle" />
            <span className="legend-text">Coverage Area</span>
          </div>
        </div>

        {/* Compass Widget */}
        <div className="compass-widget" title="North orientation">
          <div className="compass-dial">
            <span className="compass-arrow-up">▲</span>
            <span className="compass-n">N</span>
          </div>
        </div>
      </div>

      {/* 3. Main SVG Viewport */}
      <svg
        ref={svgRef}
        viewBox="0 0 640 380"
        className="floorplan-svg-element"
        preserveAspectRatio="xMidYMid meet"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleSvgDoubleClick}
        onClick={(e) => {
          if (e.target === svgRef.current || (e.target as Element).tagName === 'rect') {
            onSelectNode(null);
          }
        }}
      >
        <defs>
          {/* Radial Gradient for Coverage Halos */}
          <radialGradient id="halo-red" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#ef4444" stopOpacity="0.25" />
            <stop offset="85%" stopColor="#ef4444" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="halo-blue" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#2563eb" stopOpacity="0.25" />
            <stop offset="85%" stopColor="#2563eb" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="halo-green" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="85%" stopColor="#10b981" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="halo-purple" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="halo-neutral" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#94a3b8" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
          </radialGradient>

          {/* Grid pattern for 2D mode */}
          <pattern id="planGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(226, 232, 240, 0.8)" strokeWidth="0.8" />
          </pattern>

          {/* Drop shadow filter */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Background layer */}
        {is3DView ? (
          /* High-resolution 3D Architectural office rendering */
          <image
            href={`${import.meta.env.BASE_URL}floorplan-3d.jpg`}
            x="0"
            y="0"
            width="640"
            height="380"
            preserveAspectRatio="xMidYMid slice"
          />
        ) : (
          /* Clean 2D Blueprint Architectural Plan */
          <g className="cad-2d-plan">
            <rect width="640" height="380" fill="#f8fafc" />
            <rect width="640" height="380" fill="url(#planGrid)" />

            {/* Perimeter Wall */}
            <rect
              x="16"
              y="10"
              width="608"
              height="360"
              fill="none"
              stroke="#64748b"
              strokeWidth="3.5"
              rx="6"
            />

            {/* 2D Room Outlines */}
            {ARCHITECTURAL_ROOMS.map((room) => (
              <g key={room.id} className="room-cad-box">
                <rect
                  x={room.x}
                  y={room.y}
                  width={room.w}
                  height={room.h}
                  fill="#ffffff"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  rx="4"
                />
                {showRoomLabels && (
                  <text
                    x={room.x + room.w / 2}
                    y={room.y + 18}
                    textAnchor="middle"
                    fill="#475569"
                    fontSize="11"
                    fontWeight="600"
                  >
                    {room.name} {room.subtitle}
                  </text>
                )}
              </g>
            ))}
          </g>
        )}

        {/* 4. Coverage Circles Layer */}
        {displayCoverage && (
          <g className="coverage-halos-layer">
            {nodes.map((node) => {
              const ch = getEffectiveChannel(node.id);
              if (ch === null) return null; // Don't project halo if AP is unassigned

              let haloId = 'halo-neutral';
              let strokeCol = 'rgba(148, 163, 184, 0.4)';

              if (ch === 1) {
                haloId = 'halo-red';
                strokeCol = 'rgba(239, 68, 68, 0.4)';
              } else if (ch === 6) {
                haloId = 'halo-blue';
                strokeCol = 'rgba(37, 99, 235, 0.4)';
              } else if (ch === 11) {
                haloId = 'halo-green';
                strokeCol = 'rgba(16, 185, 129, 0.4)';
              } else if (ch === 36 || ch === 44) {
                haloId = 'halo-purple';
                strokeCol = 'rgba(139, 92, 246, 0.4)';
              }

              const radius = node.coverageRadius || 85;

              return (
                <g key={`cov-${node.id}`} className="coverage-halo-group">
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius}
                    fill={`url(#${haloId})`}
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius}
                    fill="none"
                    stroke={strokeCol}
                    strokeWidth="1.2"
                    strokeDasharray="4 3"
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* 5. Interference Edges (Red Dashed Lines) */}
        {showInterferenceLinks && (
          <g className="interference-links-layer">
            {edges.map((edge) => {
              const u = nodes.find((n) => n.id === edge.source);
              const v = nodes.find((n) => n.id === edge.target);
              if (!u || !v) return null;

              const isConflictEdge =
                conflictingEdgeId === edge.id ||
                conflictingEdgeId === `${edge.target}-${edge.source}` ||
                (currentStep?.type === 'CONFLICT_DETECTED' &&
                  ((currentStep.currentVertex === edge.source && currentStep.conflictingVertex === edge.target) ||
                    (currentStep.currentVertex === edge.target && currentStep.conflictingVertex === edge.source)));

              return (
                <g key={edge.id}>
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke={isConflictEdge ? '#ef4444' : '#ef4444'}
                    strokeWidth={isConflictEdge ? '3.5' : '1.8'}
                    strokeDasharray={isConflictEdge ? '4 2' : '6 4'}
                    strokeOpacity={isConflictEdge ? 1 : 0.85}
                  />

                  {/* Warning badge on conflict link */}
                  {isConflictEdge && (
                    <g transform={`translate(${(u.x + v.x) / 2}, ${(u.y + v.y) / 2})`}>
                      <circle cx="0" cy="0" r="11" fill="#ef4444" />
                      <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                        !
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* 6. AP Router Pins / Badges */}
        <g className="ap-nodes-layer">
          {nodes.map((node) => {
            const effectiveCh = getEffectiveChannel(node.id);
            const channelMeta = getChannelByNumber(effectiveCh);

            const isCurrent = activeVertexId === node.id;
            const isConflict =
              conflictingVertexId === node.id ||
              (isCurrent && currentStep?.type === 'CONFLICT_DETECTED');
            const isBacktrack = isCurrent && currentStep?.type === 'BACKTRACK';

            // Color selection based on channel and backtrack state
            let badgeBg = '#94a3b8'; // default unassigned neutral slate
            let chLabel = 'Unassigned';
            let strokeRingColor = badgeBg;

            if (isConflict) {
              badgeBg = '#ef4444';
              chLabel = 'Conflict!';
              strokeRingColor = '#ef4444';
            } else if (isBacktrack) {
              badgeBg = '#f59e0b';
              chLabel = 'Backtracking';
              strokeRingColor = '#f59e0b';
            } else if (channelMeta) {
              badgeBg = channelMeta.color;
              chLabel = `Ch ${channelMeta.channelNumber}`;
              strokeRingColor = channelMeta.color;
            } else if (effectiveCh) {
              badgeBg = '#2563eb';
              chLabel = `Ch ${effectiveCh}`;
              strokeRingColor = '#2563eb';
            } else if (isCurrent) {
              badgeBg = '#f59e0b';
              chLabel = 'Exploring';
              strokeRingColor = '#f59e0b';
            }

            // Room subtitle formatting (e.g., "Main Lobby (Reception)")
            let roomTitle = node.locationName;
            const matchedRoom = ARCHITECTURAL_ROOMS.find((r) => node.locationName.includes(r.name));
            if (matchedRoom && !roomTitle.includes('(')) {
              roomTitle = `${matchedRoom.name} ${matchedRoom.subtitle}`;
            }

            const pillWidth = chLabel.length > 8 ? 62 : 46;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className={`ap-node-pin ${isCurrent ? 'active-pin' : ''} ${isConflict ? 'conflict-pin' : ''}`}
                onPointerDown={(e) => handlePointerDown(e, node)}
                style={{ cursor: 'grab' }}
              >
                {/* Outer pulsing ring for active/testing/backtracking node */}
                {isCurrent && (
                  <circle
                    cx="0"
                    cy="0"
                    r="28"
                    fill="none"
                    stroke={strokeRingColor}
                    strokeWidth="3"
                    className="pulse-ring"
                    opacity="0.85"
                  />
                )}

                {/* Central AP circular badge with Wifi Icon */}
                <circle
                  cx="0"
                  cy="0"
                  r="20"
                  fill={badgeBg}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  filter="url(#softShadow)"
                />

                {/* White Wifi Icon */}
                <g transform="translate(-10, -10)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h.01" />
                    <path d="M2 8.82a15 15 0 0 1 20 0" />
                    <path d="M5 12.859a10 10 0 0 1 14 0" />
                    <path d="M8.5 16.429a5 5 0 0 1 7 0" />
                  </svg>
                </g>

                {/* Top/Side Labels: "AP 1" & Channel */}
                <g transform="translate(26, -6)">
                  <rect
                    x="-4"
                    y="-12"
                    width={pillWidth}
                    height="26"
                    rx="5"
                    fill="#ffffff"
                    stroke={isConflict ? '#fecaca' : isBacktrack ? '#fde68a' : '#e2e8f0'}
                    strokeWidth="1.2"
                    filter="url(#softShadow)"
                  />
                  <text
                    x={pillWidth / 2 - 4}
                    y="1"
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize="9.5"
                    fontWeight="800"
                    fontFamily="Inter, sans-serif"
                  >
                    {node.label || node.id}
                  </text>
                  <text
                    x={pillWidth / 2 - 4}
                    y="11"
                    textAnchor="middle"
                    fill={badgeBg}
                    fontSize="8.5"
                    fontWeight="700"
                    fontFamily="Inter, sans-serif"
                  >
                    {chLabel}
                  </text>
                </g>

                {/* Bottom Pill Capsule: Room Name (e.g., "Main Lobby (Reception)") */}
                {showRoomLabels && (
                  <g transform="translate(0, 32)">
                    <rect
                      x="-65"
                      y="-9"
                      width="130"
                      height="18"
                      rx="9"
                      fill="#ffffff"
                      stroke="#e2e8f0"
                      strokeWidth="1.2"
                      filter="url(#softShadow)"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fill="#334155"
                      fontSize="9"
                      fontWeight="600"
                      fontFamily="Inter, sans-serif"
                    >
                      {roomTitle}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* 7. Bottom-Right Scale Bar */}
        <g transform="translate(520, 360)" className="scale-bar-group">
          <line x1="0" y1="0" x2="90" y2="0" stroke="#475569" strokeWidth="1.8" />
          <line x1="0" y1="-5" x2="0" y2="5" stroke="#475569" strokeWidth="1.8" />
          <line x1="45" y1="-3" x2="45" y2="3" stroke="#475569" strokeWidth="1.4" />
          <line x1="90" y1="-5" x2="90" y2="5" stroke="#475569" strokeWidth="1.8" />
          <text x="0" y="-8" fill="#475569" fontSize="8" fontWeight="600" textAnchor="middle">0</text>
          <text x="45" y="-8" fill="#475569" fontSize="8" fontWeight="600" textAnchor="middle">5</text>
          <text x="90" y="-8" fill="#475569" fontSize="8" fontWeight="600" textAnchor="middle">10 m</text>
        </g>
      </svg>
    </div>
  );
};
