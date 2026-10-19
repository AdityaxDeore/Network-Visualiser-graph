import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AccessPoint, InterferenceEdge, AlgorithmStep } from '../types';
import { getChannelByNumber } from '../constants/channels';
import {
  Compass,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Eye,
  Layers,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Play,
  Pause,
  StepForward,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface IsometricFloorPlan3DProps {
  nodes: AccessPoint[];
  edges: InterferenceEdge[];
  currentStep: AlgorithmStep | null;
  currentAssignments: Record<string, number | null>;
  activeVertexId: string | null;
  conflictingEdgeId: string | null;
  conflictingVertexId: string | null;
  isSolution: boolean;
  selectedNodeId: string | null;
  showSignalWaves: boolean;
  showCoverageCircles: boolean;
  connectingSourceId: string | null;
  isRunning?: boolean;
  speed?: number;
  availableChannelsCount?: number;
  totalSteps?: number;
  backtrackCount?: number;
  currentStepIndex?: number;
  onSelectNode: (id: string | null) => void;
  onNodeMove: (id: string, x: number, y: number) => void;
  onNodeClickConnect?: (id: string) => void;
  onStart?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  onStep?: () => void;
  onChangeSpeed?: (speed: number) => void;
}

const ROOM_SLABS_LIGHT = [
  { id: 'slab-lobby', name: 'Main Lobby & Reception', type: 'lobby', x: 200, y: 12, w: 240, h: 115, color: 'rgba(224, 231, 255, 0.75)', borderColor: '#93c5fd' },
  { id: 'slab-west', name: 'West Wing (Exec)', type: 'exec', x: 20, y: 65, w: 170, h: 130, color: 'rgba(241, 245, 249, 0.9)', borderColor: '#cbd5e1' },
  { id: 'slab-east', name: 'East Wing (Meeting)', type: 'meeting', x: 450, y: 65, w: 170, h: 130, color: 'rgba(209, 250, 229, 0.75)', borderColor: '#6ee7b7' },
  { id: 'slab-sw', name: 'South West Lab', type: 'lab', x: 20, y: 210, w: 170, h: 150, color: 'rgba(254, 243, 199, 0.75)', borderColor: '#fcd34d' },
  { id: 'slab-hub', name: 'Center Open Hub', type: 'hub', x: 205, y: 175, w: 230, h: 185, color: 'rgba(224, 242, 254, 0.85)', borderColor: '#7dd3fc' },
  { id: 'slab-se', name: 'Data & Server Core', type: 'server', x: 450, y: 210, w: 170, h: 150, color: 'rgba(243, 232, 255, 0.75)', borderColor: '#d8b4fe' },
];

const ROOM_SLABS_DARK = [
  { id: 'slab-lobby', name: 'Main Lobby & Reception', type: 'lobby', x: 200, y: 12, w: 240, h: 115, color: 'rgba(30, 58, 138, 0.35)', borderColor: 'rgba(56, 189, 248, 0.35)' },
  { id: 'slab-west', name: 'West Wing (Exec)', type: 'exec', x: 20, y: 65, w: 170, h: 130, color: 'rgba(30, 58, 138, 0.28)', borderColor: 'rgba(56, 189, 248, 0.35)' },
  { id: 'slab-east', name: 'East Wing (Meeting)', type: 'meeting', x: 450, y: 65, w: 170, h: 130, color: 'rgba(30, 58, 138, 0.28)', borderColor: 'rgba(56, 189, 248, 0.35)' },
  { id: 'slab-sw', name: 'South West Lab', type: 'lab', x: 20, y: 210, w: 170, h: 150, color: 'rgba(30, 58, 138, 0.28)', borderColor: 'rgba(56, 189, 248, 0.35)' },
  { id: 'slab-hub', name: 'Center Open Hub', type: 'hub', x: 205, y: 175, w: 230, h: 185, color: 'rgba(30, 58, 138, 0.42)', borderColor: 'rgba(56, 189, 248, 0.35)' },
  { id: 'slab-se', name: 'Data & Server Core', type: 'server', x: 450, y: 210, w: 170, h: 150, color: 'rgba(30, 58, 138, 0.32)', borderColor: 'rgba(56, 189, 248, 0.35)' },
];

export const IsometricFloorPlan3D: React.FC<IsometricFloorPlan3DProps> = ({
  nodes,
  edges,
  currentStep,
  currentAssignments,
  activeVertexId,
  conflictingEdgeId,
  conflictingVertexId,
  isSolution,
  selectedNodeId,
  showSignalWaves: initialShowSignalWaves,
  showCoverageCircles: initialShowCoverageCircles,
  connectingSourceId,
  isRunning = false,
  speed = 400,
  availableChannelsCount = 3,
  totalSteps = 14,
  backtrackCount = 2,
  currentStepIndex = 0,
  onSelectNode,
  onNodeMove,
  onNodeClickConnect,
  onStart,
  onPause,
  onReset,
  onStep,
  onChangeSpeed,
}) => {
  // Theme state: defaults to light mode as requested by user
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const isLight = themeMode === 'light';

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Local layer toggles
  const [localShowWaves, setLocalShowWaves] = useState<boolean>(initialShowSignalWaves);
  const [localShowCoverage, setLocalShowCoverage] = useState<boolean>(initialShowCoverageCircles);
  const [showRoomSlabs, setShowRoomSlabs] = useState<boolean>(true);

  // 3D Camera Angles
  const [pitch, setPitch] = useState<number>(54); // rotateX
  const [yaw, setYaw] = useState<number>(-26); // rotateZ
  const [zoom, setZoom] = useState<number>(0.95);

  const [isOrbiting, setIsOrbiting] = useState<boolean>(false);
  const [orbitStart, setOrbitStart] = useState<{ x: number; y: number; startPitch: number; startYaw: number }>({
    x: 0,
    y: 0,
    startPitch: 54,
    startYaw: -26,
  });

  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Sync with prop updates
  useEffect(() => {
    setLocalShowWaves(initialShowSignalWaves);
  }, [initialShowSignalWaves]);

  useEffect(() => {
    setLocalShowCoverage(initialShowCoverageCircles);
  }, [initialShowCoverageCircles]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  // Dragging router in 3D
  const handleRouterPointerDown = (e: React.PointerEvent, node: AccessPoint) => {
    e.stopPropagation();
    if (connectingSourceId) {
      if (onNodeClickConnect) onNodeClickConnect(node.id);
      return;
    }

    onSelectNode(node.id);
    setDraggingNodeId(node.id);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isOrbiting) {
        const dx = e.clientX - orbitStart.x;
        const dy = e.clientY - orbitStart.y;
        setYaw(Math.max(-75, Math.min(75, orbitStart.startYaw + dx * 0.4)));
        setPitch(Math.max(20, Math.min(80, orbitStart.startPitch - dy * 0.4)));
        return;
      }

      if (draggingNodeId && stageRef.current) {
        const rect = stageRef.current.getBoundingClientRect();
        const normX = (e.clientX - rect.left) / rect.width;
        const normY = (e.clientY - rect.top) / rect.height;

        const newX = Math.max(40, Math.min(600, Math.round(normX * 640)));
        const newY = Math.max(35, Math.min(385, Math.round(normY * 400)));

        onNodeMove(draggingNodeId, newX, newY);
      }
    },
    [isOrbiting, orbitStart, draggingNodeId, onNodeMove]
  );

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isOrbiting) {
      setIsOrbiting(false);
    }
    if (draggingNodeId) {
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
      setDraggingNodeId(null);
    }
  };

  const startOrbit = (e: React.PointerEvent) => {
    // Only orbit if clicking on empty viewport background, not UI buttons
    if ((e.target as HTMLElement).closest('.iso-floating-overlay') || (e.target as HTMLElement).closest('.iso-router-3d')) {
      return;
    }
    setIsOrbiting(true);
    setOrbitStart({
      x: e.clientX,
      y: e.clientY,
      startPitch: pitch,
      startYaw: yaw,
    });
  };

  // Helper to determine the effective channel at the current moment
  const getEffectiveChannel = (nodeId: string): number | null => {
    if (nodeId === activeVertexId && currentStep?.tryingChannel) {
      return currentStep.tryingChannel;
    }
    return currentAssignments[nodeId] ?? null;
  };

  // Find co-channel conflicts in 3D
  const coChannelConflicts = edges
    .map((edge) => {
      const u = nodes.find((n) => n.id === edge.source);
      const v = nodes.find((n) => n.id === edge.target);
      if (!u || !v) return null;

      const chU = getEffectiveChannel(u.id);
      const chV = getEffectiveChannel(v.id);

      const isSpecificConflict =
        currentStep?.type === 'CONFLICT_DETECTED' &&
        ((currentStep.conflictingEdgeId &&
          (currentStep.conflictingEdgeId === edge.id ||
            currentStep.conflictingEdgeId === `${edge.target}-${edge.source}`)) ||
          (currentStep.conflictingVertex &&
            ((edge.source === currentStep.currentVertex && edge.target === currentStep.conflictingVertex) ||
              (edge.target === currentStep.currentVertex && edge.source === currentStep.conflictingVertex))));

      const isSameChannel = chU !== null && chV !== null && chU === chV;

      if (isSpecificConflict || isSameChannel) {
        const channel =
          isSpecificConflict && currentStep?.tryingChannel
            ? currentStep.tryingChannel
            : chU || chV || 1;
        return { edgeId: edge.id, u, v, channel };
      }
      return null;
    })
    .filter((c): c is { edgeId: string; u: AccessPoint; v: AccessPoint; channel: number } => c !== null);

  const roomSlabs = isLight ? ROOM_SLABS_LIGHT : ROOM_SLABS_DARK;

  // Active step description pill
  let stepBadgeText = 'Ready to Run';
  let stepBadgeColor = '#2563eb';
  let stepBadgeBg = isLight ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.25)';

  if (currentStep) {
    if (currentStep.type === 'CONFLICT_DETECTED') {
      stepBadgeText = `Conflict with ${currentStep.conflictingVertex || 'Neighbor'}`;
      stepBadgeColor = '#ef4444';
      stepBadgeBg = isLight ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.25)';
    } else if (currentStep.type === 'SAFE_ASSIGNMENT') {
      stepBadgeText = `Assigned Ch ${currentStep.tryingChannel} to ${currentStep.currentVertex}`;
      stepBadgeColor = '#10b981';
      stepBadgeBg = isLight ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.25)';
    } else if (currentStep.type === 'BACKTRACK') {
      stepBadgeText = `Backtracking from ${currentStep.currentVertex}`;
      stepBadgeColor = '#f59e0b';
      stepBadgeBg = isLight ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.25)';
    } else if (currentStep.type === 'SUCCESS') {
      stepBadgeText = 'Optimal Allocation Found!';
      stepBadgeColor = '#10b981';
      stepBadgeBg = isLight ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.3)';
    } else if (currentStep.type === 'TRY_CHANNEL') {
      stepBadgeText = `Testing Ch ${currentStep.tryingChannel} on ${currentStep.currentVertex}`;
      stepBadgeColor = '#2563eb';
      stepBadgeBg = isLight ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.25)';
    }
  }

  return (
    <div
      ref={viewportRef}
      className={`isometric-3d-viewport ${isLight ? 'light-theme' : ''}`}
      onPointerDown={startOrbit}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        width: '100%',
        height: '100%',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : undefined,
        left: isFullscreen ? 0 : undefined,
        right: isFullscreen ? 0 : undefined,
        bottom: isFullscreen ? 0 : undefined,
        zIndex: isFullscreen ? 99999 : undefined,
        cursor: isOrbiting ? 'grabbing' : 'grab',
        background: isLight
          ? 'radial-gradient(circle at 50% 30%, #f8fafc 0%, #e2e8f0 100%)'
          : 'radial-gradient(circle at 50% 30%, #0f1c3f 0%, #080c1a 100%)',
        overflow: 'hidden',
        transition: 'background 0.3s ease',
      }}
    >
      {/* =========================================================================
          BACKGROUND 3D SCENE (Visualisation happens at the back)
          ========================================================================= */}
      <div className="iso-stage-wrapper" style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <div
          ref={stageRef}
          className="iso-stage"
          style={{
            transform: `rotateX(${pitch}deg) rotateZ(${yaw}deg) scale(${zoom})`,
          }}
        >
          {/* Ground Floor Plane */}
          <div
            className={`iso-floor-slab ${isLight ? 'light-theme' : ''}`}
            style={{
              backgroundColor: isLight ? '#ffffff' : '#090e1f',
              borderColor: isLight ? '#cbd5e1' : '#1e3a8a',
              boxShadow: isLight
                ? '0 30px 60px rgba(0, 0, 0, 0.12), 0 0 35px rgba(59, 130, 246, 0.08)'
                : '0 30px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(37, 99, 235, 0.25)',
            }}
          >
            {/* Grid Overlay */}
            <div
              className="iso-grid-overlay"
              style={{
                backgroundImage: isLight
                  ? 'linear-gradient(to right, rgba(148, 163, 184, 0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.22) 1px, transparent 1px)'
                  : 'linear-gradient(to right, rgba(56, 189, 248, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.12) 1px, transparent 1px)',
              }}
            />

            {/* Extruded Room Slabs & 3D Glass Partition Perimeter */}
            {showRoomSlabs &&
              roomSlabs.map((room) => (
                <div
                  key={room.id}
                  className="iso-room-slab"
                  style={{
                    left: `${room.x}px`,
                    top: `${room.y}px`,
                    width: `${room.w}px`,
                    height: `${room.h}px`,
                    backgroundColor: room.color,
                    borderColor: room.borderColor,
                  }}
                >
                  <span
                    className="iso-room-label"
                    style={{
                      color: isLight ? '#334155' : 'rgba(148, 163, 184, 0.85)',
                      fontWeight: 700,
                    }}
                  >
                    {room.name}
                  </span>
                  {/* 3D Glass Partition Perimeter */}
                  <div className={`iso-glass-wall wall-top ${isLight ? 'light-theme' : ''}`} />
                  <div className={`iso-glass-wall wall-left ${isLight ? 'light-theme' : ''}`} />
                  <div className={`iso-glass-wall wall-bottom ${isLight ? 'light-theme' : ''}`} />
                  <div className={`iso-glass-wall wall-right ${isLight ? 'light-theme' : ''}`} />
                </div>
              ))}

            {/* SVG Layer for 3D Floor Elements: Edges, Signal Discs, and Conflict Lasers */}
            <svg
              className="iso-floor-svg"
              viewBox="0 0 640 400"
              style={{ width: '640px', height: '400px', position: 'absolute', top: 0, left: 0 }}
            >
              <defs>
                <filter id="isoLaserGlow3D" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 1. Network Interference Edges on Floor */}
              {edges.map((edge) => {
                const u = nodes.find((n) => n.id === edge.source);
                const v = nodes.find((n) => n.id === edge.target);
                if (!u || !v) return null;

                const isConflicting =
                  conflictingEdgeId === edge.id ||
                  conflictingEdgeId === `${edge.target}-${edge.source}` ||
                  (currentStep?.conflictingEdgeId &&
                    (currentStep.conflictingEdgeId === edge.id ||
                      currentStep.conflictingEdgeId === `${edge.target}-${edge.source}`));

                const chU = currentAssignments[u.id];
                const chV = currentAssignments[v.id];
                const hasSameChannel = chU !== null && chU !== undefined && chU === chV;

                let strokeColor = isLight ? '#94a3b8' : '#334155';
                let strokeWidth = 2;
                let strokeDash = '4 4';

                if (isConflicting || hasSameChannel) {
                  strokeColor = '#ef4444';
                  strokeWidth = 3.5;
                  strokeDash = '8 4';
                } else if (isSolution) {
                  strokeColor = '#10b981';
                  strokeWidth = 2.5;
                  strokeDash = 'none';
                } else if (chU !== null && chV !== null) {
                  strokeColor = '#3b82f6';
                  strokeWidth = 2;
                  strokeDash = 'none';
                }

                return (
                  <line
                    key={edge.id}
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDash}
                    className={isConflicting || hasSameChannel ? 'iso-conflict-laser' : ''}
                  />
                );
              })}

              {/* 2. Co-Channel 3D Collision Lasers */}
              {coChannelConflicts.map((c) => (
                <g key={`conflict-laser-${c.edgeId}`}>
                  <line
                    x1={c.u.x}
                    y1={c.u.y}
                    x2={c.v.x}
                    y2={c.v.y}
                    stroke="#ef4444"
                    strokeWidth="4.5"
                    filter="url(#isoLaserGlow3D)"
                    className="iso-conflict-pulse-laser"
                  />
                  {/* Midpoint Hazard Disc on Floor */}
                  <circle
                    cx={(c.u.x + c.v.x) / 2}
                    cy={(c.u.y + c.v.y) / 2}
                    r="26"
                    fill="rgba(239, 68, 68, 0.45)"
                    stroke="#ef4444"
                    strokeWidth="2.2"
                    strokeDasharray="4 2"
                    className="iso-hazard-disc"
                  />
                </g>
              ))}

              {/* 3. 3D Signal Waves on Floor Plane */}
              {nodes.map((node) => {
                const assignedCh = currentAssignments[node.id];
                const isTrying = activeVertexId === node.id && currentStep?.tryingChannel;
                const channelNum = assignedCh || (isTrying ? currentStep.tryingChannel : null);
                const channelMeta = getChannelByNumber(channelNum);

                const isConflict =
                  conflictingVertexId === node.id ||
                  (activeVertexId === node.id && currentStep?.type === 'CONFLICT_DETECTED');

                const waveColor = isConflict ? '#ef4444' : channelMeta ? channelMeta.color : isLight ? '#94a3b8' : '#64748b';
                const radius = node.coverageRadius || 90;

                return (
                  <g key={`iso-sig-${node.id}`} transform={`translate(${node.x}, ${node.y})`}>
                    {/* Coverage Radius Circle */}
                    {localShowCoverage && (
                      <circle
                        r={radius}
                        fill="none"
                        stroke={waveColor}
                        strokeWidth="1.2"
                        strokeDasharray="4 4"
                        opacity={isLight ? 0.35 : 0.4}
                      />
                    )}

                    {/* Concentric Signal Rings */}
                    {localShowWaves && channelMeta && (
                      <g className="iso-wave-rings">
                        <circle
                          r="32"
                          fill="none"
                          stroke={waveColor}
                          strokeWidth="2.5"
                          className="wifi-wave-ring wifi-wave-ring-1"
                        />
                        <circle
                          r="60"
                          fill="none"
                          stroke={waveColor}
                          strokeWidth="2"
                          className="wifi-wave-ring wifi-wave-ring-2"
                        />
                        <circle
                          r={radius * 0.9}
                          fill="none"
                          stroke={waveColor}
                          strokeWidth="1.4"
                          className="wifi-wave-ring wifi-wave-ring-3"
                        />
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* 4. Elevated 3D Router Devices (Hovering in 3D Space) */}
            {nodes.map((node) => {
              const assignedCh = currentAssignments[node.id];
              const isTrying = activeVertexId === node.id && currentStep?.tryingChannel;
              const channelNum = assignedCh || (isTrying ? currentStep.tryingChannel : null);
              const channelMeta = getChannelByNumber(channelNum);

              const isCurrent = activeVertexId === node.id;
              const isConflict =
                conflictingVertexId === node.id ||
                (isCurrent && currentStep?.type === 'CONFLICT_DETECTED');
              const isSelected = selectedNodeId === node.id;

              const glowColor = isConflict
                ? '#ef4444'
                : channelMeta
                ? channelMeta.color
                : isCurrent
                ? '#f59e0b'
                : isLight
                ? '#94a3b8'
                : '#64748b';

              return (
                <div
                  key={node.id}
                  className={`iso-router-3d ${isCurrent ? 'router-active' : ''} ${
                    isConflict ? 'router-conflict' : ''
                  } ${isSelected ? 'router-selected' : ''}`}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                  }}
                  onPointerDown={(e) => handleRouterPointerDown(e, node)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectNode(node.id);
                  }}
                >
                  {/* Cast Shadow on Floor (translateZ 0) */}
                  <div
                    className="iso-cast-shadow"
                    style={{
                      background: isLight ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.65)',
                    }}
                  />

                  {/* Vertical Light Pillar / Holographic Column */}
                  <div
                    className="iso-light-pillar"
                    style={{
                      background: `linear-gradient(to top, ${glowColor}00, ${glowColor}${isLight ? '55' : '77'})`,
                    }}
                  />

                  {/* 3D Elevated Device Body (translateZ 28px) */}
                  <div
                    className="iso-device-chassis"
                    style={{
                      borderColor: glowColor,
                      background: isLight
                        ? 'linear-gradient(135deg, #ffffff, #f1f5f9)'
                        : 'linear-gradient(135deg, #1e293b, #0f172a)',
                      boxShadow: isLight
                        ? `0 8px 20px ${glowColor}50, inset 0 1px 2px rgba(255,255,255,0.9)`
                        : `0 0 18px ${glowColor}99, inset 0 1px 2px rgba(255,255,255,0.25)`,
                    }}
                  >
                    {/* Antennas Tilting Up in 3D */}
                    <div className="iso-antenna antenna-left" style={{ backgroundColor: glowColor }} />
                    <div className="iso-antenna antenna-right" style={{ backgroundColor: glowColor }} />

                    {/* Router Device Front LED Face */}
                    <div className="iso-face-content">
                      <div
                        className="iso-node-label"
                        style={{ color: isLight ? '#0f172a' : '#ffffff' }}
                      >
                        {node.id}
                      </div>
                      <div className="iso-led-row">
                        <span className="iso-led" style={{ backgroundColor: '#10b981' }} />
                        <span className="iso-led" style={{ backgroundColor: '#38bdf8' }} />
                        <span className="iso-led" style={{ backgroundColor: glowColor }} />
                      </div>
                    </div>
                  </div>

                  {/* Floating Holographic Channel Tag (translateZ 52px) */}
                  <div
                    className="iso-floating-badge"
                    style={{
                      backgroundColor: channelMeta ? channelMeta.color : isLight ? '#475569' : '#1e293b',
                      color: '#ffffff',
                      borderColor: glowColor,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    }}
                  >
                    {channelMeta ? channelMeta.label : 'Unassigned'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
          OPTIONS ON TOP OF IT NICELY (Floating Glassmorphic Overlays)
          ========================================================================= */}
      <div
        className="iso-floating-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none', // Allows clicking background for orbit
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '12px',
          zIndex: 10,
        }}
      >
        {/* 1. TOP FLOATING BAR */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          {/* Top Left: Title Badge & Mode */}
          <div
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: isLight ? 'rgba(255, 255, 255, 0.88)' : 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(16px)',
              padding: '6px 12px',
              borderRadius: '10px',
              border: isLight ? '1px solid rgba(226, 232, 240, 0.9)' : '1px solid rgba(51, 65, 85, 0.7)',
              boxShadow: isLight ? '0 4px 15px rgba(0, 0, 0, 0.06)' : '0 4px 20px rgba(0, 0, 0, 0.35)',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isRunning ? '#10b981' : '#3b82f6',
                boxShadow: isRunning ? '0 0 8px #10b981' : 'none',
              }}
            />
            <strong style={{ fontSize: '12px', color: isLight ? '#0f172a' : '#f8fafc' }}>
              3D Isometric Floor Plan
            </strong>
            <span
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: isLight ? '#e0f2fe' : '#1e3a8a',
                color: isLight ? '#0284c7' : '#93c5fd',
                fontWeight: 600,
              }}
            >
              {isLight ? 'Light Mode' : 'Dark Mode'}
            </span>
          </div>

          {/* Top Center: Live Iteration Status Pill */}
          <div
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(16px)',
              padding: '6px 14px',
              borderRadius: '9999px',
              border: `1px solid ${stepBadgeColor}50`,
              boxShadow: isLight ? '0 4px 15px rgba(0, 0, 0, 0.06)' : '0 4px 20px rgba(0, 0, 0, 0.35)',
              color: stepBadgeColor,
              fontSize: '11.5px',
              fontWeight: 600,
            }}
          >
            <Activity size={13} color={stepBadgeColor} />
            <span>{stepBadgeText}</span>
            {currentStep && (
              <span
                style={{
                  fontSize: '10px',
                  backgroundColor: stepBadgeBg,
                  padding: '1px 6px',
                  borderRadius: '4px',
                  marginLeft: '4px',
                }}
              >
                Step {currentStep.stepNumber}
              </span>
            )}
          </div>

          {/* Top Right: Theme Switcher, Layers, and Fullscreen Button */}
          <div
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setThemeMode(isLight ? 'dark' : 'light')}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              style={{
                border: isLight ? '1px solid #cbd5e1' : '1px solid #475569',
                backgroundColor: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.9)',
                color: isLight ? '#0f172a' : '#f8fafc',
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.15s ease',
              }}
            >
              {isLight ? <Moon size={13} color="#6366f1" /> : <Sun size={13} color="#f59e0b" />}
              <span>{isLight ? 'Dark' : 'Light'}</span>
            </button>

            {/* Quick Layers Menu */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.9)',
                borderRadius: '8px',
                padding: '2px',
                border: isLight ? '1px solid #cbd5e1' : '1px solid #475569',
                backdropFilter: 'blur(12px)',
              }}
            >
              <button
                type="button"
                onClick={() => setLocalShowWaves(!localShowWaves)}
                title="Toggle Radiating Signal Waves"
                style={{
                  border: 'none',
                  background: localShowWaves ? (isLight ? '#dbeafe' : '#1e3a8a') : 'transparent',
                  color: localShowWaves ? (isLight ? '#1d4ed8' : '#93c5fd') : (isLight ? '#64748b' : '#94a3b8'),
                  padding: '5px 8px',
                  borderRadius: '6px',
                  fontSize: '10.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Waves
              </button>
              <button
                type="button"
                onClick={() => setLocalShowCoverage(!localShowCoverage)}
                title="Toggle Coverage Radii"
                style={{
                  border: 'none',
                  background: localShowCoverage ? (isLight ? '#dbeafe' : '#1e3a8a') : 'transparent',
                  color: localShowCoverage ? (isLight ? '#1d4ed8' : '#93c5fd') : (isLight ? '#64748b' : '#94a3b8'),
                  padding: '5px 8px',
                  borderRadius: '6px',
                  fontSize: '10.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Radii
              </button>
            </div>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen Mode (Esc)' : 'Enter 3D Fullscreen Mode'}
              style={{
                border: 'none',
                backgroundColor: isFullscreen ? '#ef4444' : '#2563eb',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: isFullscreen
                  ? '0 4px 15px rgba(239, 68, 68, 0.4)'
                  : '0 4px 15px rgba(37, 99, 235, 0.4)',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.15s ease',
              }}
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
            </button>
          </div>
        </div>

        {/* 2. MIDDLE ROW (Channel Legend Pills & Hints - Top Left / Top Right) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginTop: '8px',
          }}
        >
          {/* Channel Legend Floating Pill */}
          <div
            style={{
              pointerEvents: 'auto',
              backgroundColor: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(14px)',
              padding: '6px 10px',
              borderRadius: '8px',
              border: isLight ? '1px solid rgba(226, 232, 240, 0.85)' : '1px solid rgba(51, 65, 85, 0.7)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '10.5px',
            }}
          >
            <span style={{ fontWeight: 700, color: isLight ? '#475569' : '#94a3b8' }}>Channels:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <span style={{ color: isLight ? '#0f172a' : '#f8fafc', fontWeight: 600 }}>Ch 1</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
                <span style={{ color: isLight ? '#0f172a' : '#f8fafc', fontWeight: 600 }}>Ch 6</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <span style={{ color: isLight ? '#0f172a' : '#f8fafc', fontWeight: 600 }}>Ch 11</span>
              </span>
              {availableChannelsCount >= 4 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a855f7' }} />
                  <span style={{ color: isLight ? '#0f172a' : '#f8fafc', fontWeight: 600 }}>Ch 36</span>
                </span>
              )}
            </div>
          </div>

          {/* Camera Hint floating badge */}
          <div
            style={{
              pointerEvents: 'none',
              backgroundColor: isLight ? 'rgba(255, 255, 255, 0.75)' : 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(10px)',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '10px',
              color: isLight ? '#64748b' : '#94a3b8',
              border: isLight ? '1px solid rgba(226, 232, 240, 0.7)' : '1px solid rgba(51, 65, 85, 0.5)',
            }}
          >
            Drag background to orbit • Drag routers in 3D
          </div>
        </div>

        {/* 3. BOTTOM FLOATING CONTROLS TOOLBAR (Playback + Camera Presets + Zoom) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <div
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(18px)',
              padding: '6px 12px',
              borderRadius: '14px',
              border: isLight ? '1px solid rgba(203, 213, 225, 0.8)' : '1px solid rgba(51, 65, 85, 0.8)',
              boxShadow: isLight
                ? '0 12px 30px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)'
                : '0 12px 35px rgba(0, 0, 0, 0.5)',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {/* Playback Controls (if provided) */}
            {onStart && onPause && onStep && onReset && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isRunning ? (
                    <button
                      type="button"
                      onClick={onPause}
                      title="Pause simulation"
                      style={{
                        backgroundColor: '#f59e0b',
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Pause size={12} fill="#ffffff" />
                      <span>Pause</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onStart}
                      title="Run Backtracking Algorithm"
                      style={{
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Play size={12} fill="#ffffff" />
                      <span>Run</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onStep}
                    disabled={isRunning}
                    title="Execute single iteration step"
                    style={{
                      backgroundColor: isLight ? '#f1f5f9' : '#1e293b',
                      color: isLight ? '#1e293b' : '#f8fafc',
                      border: isLight ? '1px solid #cbd5e1' : '1px solid #475569',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: isRunning ? 'not-allowed' : 'pointer',
                      opacity: isRunning ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <StepForward size={12} />
                    <span>Step</span>
                  </button>

                  <button
                    type="button"
                    onClick={onReset}
                    title="Reset simulation"
                    style={{
                      backgroundColor: isLight ? '#f1f5f9' : '#1e293b',
                      color: isLight ? '#1e293b' : '#f8fafc',
                      border: isLight ? '1px solid #cbd5e1' : '1px solid #475569',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Vertical Divider */}
                <div
                  style={{
                    width: '1px',
                    height: '22px',
                    backgroundColor: isLight ? '#cbd5e1' : '#475569',
                    margin: '0 4px',
                  }}
                />
              </>
            )}

            {/* Camera Angle Presets */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                onClick={() => {
                  setPitch(54);
                  setYaw(-26);
                }}
                style={{
                  border: pitch === 54 && yaw === -26 ? '1px solid #2563eb' : isLight ? '1px solid #cbd5e1' : '1px solid #475569',
                  backgroundColor: pitch === 54 && yaw === -26 ? '#2563eb' : isLight ? '#ffffff' : '#1e293b',
                  color: pitch === 54 && yaw === -26 ? '#ffffff' : isLight ? '#334155' : '#cbd5e1',
                  padding: '5px 9px',
                  borderRadius: '7px',
                  fontSize: '10.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Compass size={12} />
                <span>30° Isometric</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPitch(70);
                  setYaw(0);
                }}
                style={{
                  border: pitch === 70 && yaw === 0 ? '1px solid #2563eb' : isLight ? '1px solid #cbd5e1' : '1px solid #475569',
                  backgroundColor: pitch === 70 && yaw === 0 ? '#2563eb' : isLight ? '#ffffff' : '#1e293b',
                  color: pitch === 70 && yaw === 0 ? '#ffffff' : isLight ? '#334155' : '#cbd5e1',
                  padding: '5px 9px',
                  borderRadius: '7px',
                  fontSize: '10.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Layers size={12} />
                <span>70° Drone</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPitch(28);
                  setYaw(-15);
                }}
                style={{
                  border: pitch === 28 && yaw === -15 ? '1px solid #2563eb' : isLight ? '1px solid #cbd5e1' : '1px solid #475569',
                  backgroundColor: pitch === 28 && yaw === -15 ? '#2563eb' : isLight ? '#ffffff' : '#1e293b',
                  color: pitch === 28 && yaw === -15 ? '#ffffff' : isLight ? '#334155' : '#cbd5e1',
                  padding: '5px 9px',
                  borderRadius: '7px',
                  fontSize: '10.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Eye size={12} />
                <span>Low Elevation</span>
              </button>
            </div>

            {/* Vertical Divider */}
            <div
              style={{
                width: '1px',
                height: '22px',
                backgroundColor: isLight ? '#cbd5e1' : '#475569',
                margin: '0 4px',
              }}
            />

            {/* Zoom & Reset Camera Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
                title="Zoom In"
                style={{
                  border: isLight ? '1px solid #cbd5e1' : '1px solid #475569',
                  backgroundColor: isLight ? '#ffffff' : '#1e293b',
                  color: isLight ? '#0f172a' : '#f8fafc',
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ZoomIn size={13} />
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
                title="Zoom Out"
                style={{
                  border: isLight ? '1px solid #cbd5e1' : '1px solid #475569',
                  backgroundColor: isLight ? '#ffffff' : '#1e293b',
                  color: isLight ? '#0f172a' : '#f8fafc',
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ZoomOut size={13} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setPitch(54);
                  setYaw(-26);
                  setZoom(0.95);
                }}
                title="Reset Camera Orientation"
                style={{
                  border: isLight ? '1px solid #cbd5e1' : '1px solid #475569',
                  backgroundColor: isLight ? '#ffffff' : '#1e293b',
                  color: isLight ? '#0f172a' : '#f8fafc',
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RotateCw size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
