import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  GitBranch,
  Workflow,
  Maximize2,
  Minimize2,
  ChevronUp,
  RotateCcw,
  Check,
  X,
  CornerDownLeft,
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  Sliders,
} from 'lucide-react';
import { AlgorithmStep, TreeNodeData } from '../types';
import { getChannelByNumber } from '../constants/channels';
import { BacktrackingFlowchart } from './BacktrackingFlowchart';

interface BacktrackingSearchTreeProps {
  currentStep: AlgorithmStep | null;
  currentStepIndex?: number;
  steps?: AlgorithmStep[];
  treeNodes?: Record<string, TreeNodeData>;
  rootId?: string;
  totalBacktracks?: number;
  totalConflicts?: number;
  isSolution?: boolean;
  isRunning?: boolean;
}

interface LayoutNode {
  id: string;
  parentId: string | null;
  vertexId: string;
  channelNumber: number;
  channelLabel: string;
  depth: number;
  x: number;
  y: number;
  status: 'unexplored' | 'exploring' | 'safe' | 'conflict' | 'backtracked' | 'solution';
  conflictingWith?: string;
  isCurrentActive: boolean;
  isBacktrackingNow: boolean;
  isOnActivePath: boolean;
  isOnSolutionPath: boolean;
  children: string[];
}

export const BacktrackingSearchTree: React.FC<BacktrackingSearchTreeProps> = ({
  currentStep,
  currentStepIndex = 0,
  steps = [],
  treeNodes = {},
  rootId = 'root',
  totalBacktracks = 0,
  totalConflicts = 0,
  isSolution = false,
  isRunning = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tree' | 'flowchart'>('tree');
  const [viewScope, setViewScope] = useState<'explored' | 'full'>('explored');

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeSvgNodeRef = useRef<SVGGElement | null>(null);

  // 1. Compute node states dynamically up to currentStepIndex
  const { nodeDynamicState, activeRecursionPath, solutionNodeSet } = useMemo(() => {
    const states: Record<
      string,
      {
        status: 'unexplored' | 'exploring' | 'safe' | 'conflict' | 'backtracked' | 'solution';
        conflictingWith?: string;
        isCurrentActive: boolean;
        isBacktrackingNow: boolean;
      }
    > = {};

    const maxStep = Math.min(currentStepIndex, steps.length - 1);

    // Replay steps up to currentStepIndex
    for (let i = 0; i <= maxStep && i < steps.length; i++) {
      const s = steps[i];
      if (!s.treeNodeId || s.treeNodeId === 'root') continue;

      if (s.type === 'TRY_CHANNEL') {
        states[s.treeNodeId] = {
          status: 'exploring',
          isCurrentActive: false,
          isBacktrackingNow: false,
        };
      } else if (s.type === 'CONFLICT_DETECTED') {
        states[s.treeNodeId] = {
          status: 'conflict',
          conflictingWith: s.conflictingVertex || undefined,
          isCurrentActive: false,
          isBacktrackingNow: false,
        };
      } else if (s.type === 'SAFE_ASSIGNMENT') {
        states[s.treeNodeId] = {
          status: 'safe',
          isCurrentActive: false,
          isBacktrackingNow: false,
        };
      } else if (s.type === 'BACKTRACK') {
        states[s.treeNodeId] = {
          status: 'backtracked',
          isCurrentActive: false,
          isBacktrackingNow: false,
        };
      }
    }

    // Current step highlights
    const activePath = new Set<string>();
    if (currentStep && currentStep.treeNodeId) {
      if (states[currentStep.treeNodeId]) {
        states[currentStep.treeNodeId].isCurrentActive = true;
        if (currentStep.type === 'BACKTRACK') {
          states[currentStep.treeNodeId].isBacktrackingNow = true;
          states[currentStep.treeNodeId].status = 'backtracked';
        } else if (currentStep.type === 'CONFLICT_DETECTED') {
          states[currentStep.treeNodeId].status = 'conflict';
        } else if (currentStep.type === 'SAFE_ASSIGNMENT') {
          states[currentStep.treeNodeId].status = 'safe';
        } else if (currentStep.type === 'TRY_CHANNEL') {
          states[currentStep.treeNodeId].status = 'exploring';
        }
      }

      // Build active recursion path from root to current node
      let curr: string | null = currentStep.treeNodeId;
      while (curr && treeNodes[curr]) {
        activePath.add(curr);
        curr = treeNodes[curr].parentId;
      }
    }

    // Solution path
    const solSet = new Set<string>();
    if (isSolution && steps.length > 0) {
      const lastStep = steps[steps.length - 1];
      let curr: string | null = lastStep?.treeNodeId || null;
      while (curr && treeNodes[curr]) {
        solSet.add(curr);
        if (states[curr]) {
          states[curr].status = 'solution';
        }
        curr = treeNodes[curr].parentId;
      }
    }

    return {
      nodeDynamicState: states,
      activeRecursionPath: activePath,
      solutionNodeSet: solSet,
    };
  }, [steps, currentStepIndex, currentStep, treeNodes, isSolution]);

  // 2. Filter nodes and compute layout positions
  const { layoutNodes, svgWidth, svgHeight } = useMemo(() => {
    const rawNodes = treeNodes;
    if (!rawNodes || !rawNodes[rootId]) {
      return { layoutNodes: [], svgWidth: 320, svgHeight: 200 };
    }

    // Determine which nodes to display
    const visibleIds = new Set<string>();
    visibleIds.add(rootId);

    Object.keys(rawNodes).forEach((id) => {
      if (id === rootId) return;
      const node = rawNodes[id];

      if (viewScope === 'full') {
        visibleIds.add(id);
      } else {
        // Show if step index has been reached or is active
        if (node.stepIndex <= (currentStep?.stepNumber || currentStepIndex + 2)) {
          visibleIds.add(id);
        }
      }
    });

    // Tidy Tree Layout Algorithm
    const NODE_WIDTH = 68;
    const GAP_X = 18;
    const GAP_Y = 68;
    let leafCursor = 24;

    const coords: Record<string, { x: number; y: number }> = {};
    let maxDepth = 0;

    function computePositions(nodeId: string, depth: number) {
      if (depth > maxDepth) maxDepth = depth;
      const node = rawNodes[nodeId];
      if (!node) return;

      const children = (node.children || []).filter((cid) => visibleIds.has(cid) && rawNodes[cid]);

      if (children.length === 0) {
        coords[nodeId] = { x: leafCursor + NODE_WIDTH / 2, y: 32 + depth * GAP_Y };
        leafCursor += NODE_WIDTH + GAP_X;
      } else {
        children.forEach((cid) => computePositions(cid, depth + 1));
        const first = coords[children[0]];
        const last = coords[children[children.length - 1]];
        const midX = (first.x + last.x) / 2;
        coords[nodeId] = { x: midX, y: 32 + depth * GAP_Y };
      }
    }

    computePositions(rootId, 0);

    const totalW = Math.max(340, leafCursor + 20);
    const totalH = Math.max(220, 60 + maxDepth * GAP_Y);

    // Build LayoutNode objects
    const result: LayoutNode[] = [];

    visibleIds.forEach((id) => {
      const raw = rawNodes[id];
      const pos = coords[id];
      if (!raw || !pos) return;

      const stateInfo = nodeDynamicState[id];
      let status: LayoutNode['status'] = 'unexplored';
      let conflictingWith: string | undefined = undefined;
      let isCurrentActive = false;
      let isBacktrackingNow = false;

      if (id === rootId) {
        status = 'safe';
      } else if (stateInfo) {
        status = stateInfo.status;
        conflictingWith = stateInfo.conflictingWith;
        isCurrentActive = stateInfo.isCurrentActive;
        isBacktrackingNow = stateInfo.isBacktrackingNow;
      }

      result.push({
        id: raw.id,
        parentId: raw.parentId,
        vertexId: raw.vertexId,
        channelNumber: raw.channelNumber,
        channelLabel: raw.channelLabel,
        depth: raw.depth,
        x: pos.x,
        y: pos.y,
        status,
        conflictingWith,
        isCurrentActive,
        isBacktrackingNow,
        isOnActivePath: activeRecursionPath.has(id),
        isOnSolutionPath: solutionNodeSet.has(id),
        children: (raw.children || []).filter((cid) => visibleIds.has(cid)),
      });
    });

    return { layoutNodes: result, svgWidth: totalW, svgHeight: totalH };
  }, [treeNodes, rootId, viewScope, currentStep, currentStepIndex, nodeDynamicState, activeRecursionPath, solutionNodeSet]);

  // 3. Auto-scroll to active node on step change
  useEffect(() => {
    if (activeSvgNodeRef.current && scrollContainerRef.current) {
      const activeEl = activeSvgNodeRef.current;
      const container = scrollContainerRef.current;

      const bbox = activeEl.getBBox();
      const targetX = bbox.x + bbox.width / 2 - container.clientWidth / 2;
      const targetY = bbox.y + bbox.height / 2 - container.clientHeight / 2;

      container.scrollTo({
        left: Math.max(0, targetX),
        top: Math.max(0, targetY),
        behavior: 'smooth',
      });
    }
  }, [currentStep?.treeNodeId]);

  // 4. Decision Stack Breadcrumb Path
  const decisionStack = useMemo<Array<{ ap: string; ch: number | null }>>(() => {
    if (!currentStep) return [];
    const stack: Array<{ ap: string; ch: number | null }> = [];
    Object.entries(currentStep.assignmentSnapshot).forEach(([ap, ch]) => {
      if (ch !== null) {
        stack.push({ ap, ch });
      }
    });
    return stack;
  }, [currentStep]);

  // Current action banner text
  const isBacktrackStep = currentStep?.type === 'BACKTRACK';
  const isConflictStep = currentStep?.type === 'CONFLICT_DETECTED';
  const isSafeStep = currentStep?.type === 'SAFE_ASSIGNMENT';

  return (
    <div
      className={`search-tree-card ${isExpanded ? 'search-tree-expanded-overlay' : ''}`}
    >
      {/* 1. Header Toolbar */}
      <div className="search-tree-header">
        <div className="search-tree-title-row">
          <GitBranch size={16} className="search-tree-icon" />
          <h3 className="search-tree-title">Backtracking Search Tree</h3>

          {/* Tab Switcher: Tree vs Flowchart */}
          <div className="tree-tab-switcher">
            <button
              className={`tree-tab-btn ${activeTab === 'tree' ? 'active' : ''}`}
              onClick={() => setActiveTab('tree')}
              title="State Space Decision Tree"
            >
              <GitBranch size={11} />
              <span>Tree</span>
            </button>
            <button
              className={`tree-tab-btn ${activeTab === 'flowchart' ? 'active' : ''}`}
              onClick={() => setActiveTab('flowchart')}
              title="DAA Logic Flowchart"
            >
              <Workflow size={11} />
              <span>Flowchart</span>
            </button>
          </div>
        </div>

        <div className="tree-header-actions">
          {/* View Scope Toggle */}
          {activeTab === 'tree' && (
            <button
              className="tree-scope-btn"
              onClick={() => setViewScope(viewScope === 'explored' ? 'full' : 'explored')}
              title={viewScope === 'explored' ? 'Switch to Full State Space' : 'Switch to Live Explored'}
            >
              <Eye size={12} />
              <span>{viewScope === 'explored' ? 'Live' : 'Full'}</span>
            </button>
          )}

          {/* Fullscreen / Expand Toggle */}
          <button
            className="tree-expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand full-screen'}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {/* Collapse Card */}
          <button
            className="search-tree-collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title="Toggle card body"
          >
            <ChevronUp size={15} className={`search-tree-chevron ${isCollapsed ? 'rotated' : ''}`} />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="search-tree-body">
          {/* 2. Live Backtracking Trajectory Banner */}
          <div
            className={`live-backtrack-hud ${
              isBacktrackStep
                ? 'hud-backtrack'
                : isConflictStep
                ? 'hud-conflict'
                : isSafeStep
                ? 'hud-safe'
                : 'hud-idle'
            }`}
          >
            <div className="hud-status-line">
              {isBacktrackStep ? (
                <>
                  <CornerDownLeft size={14} className="hud-icon amber" />
                  <span className="hud-text">
                    <strong>BACKTRACKING:</strong> Reverting <strong>{currentStep.currentVertex}</strong>. Returning to parent node!
                  </span>
                </>
              ) : isConflictStep ? (
                <>
                  <X size={14} className="hud-icon red" />
                  <span className="hud-text">
                    <strong>CONFLICT DETECTED:</strong> {currentStep.currentVertex} clashes with{' '}
                    <strong>{currentStep.conflictingVertex}</strong>. Pruning branch!
                  </span>
                </>
              ) : isSafeStep ? (
                <>
                  <Check size={14} className="hud-icon green" />
                  <span className="hud-text">
                    <strong>SAFE ASSIGNMENT:</strong> {currentStep.currentVertex} assigned Channel{' '}
                    {currentStep.tryingChannel}. Advancing down branch.
                  </span>
                </>
              ) : isSolution ? (
                <>
                  <Sparkles size={14} className="hud-icon green" />
                  <span className="hud-text">
                    <strong>SOLUTION VERIFIED:</strong> Collision-free channel allocation complete!
                  </span>
                </>
              ) : (
                <>
                  <Layers size={14} className="hud-icon blue" />
                  <span className="hud-text">
                    {currentStep ? currentStep.description : 'Click [Run] or [Step] to observe backtracking in the search tree.'}
                  </span>
                </>
              )}
            </div>

            {/* Recursion Stack Breadcrumbs */}
            <div className="hud-stack-row">
              <span className="stack-label">Active Stack:</span>
              <div className="stack-crumbs">
                <span className="crumb crumb-root">Root</span>
                {decisionStack.map((item, idx) => (
                  <React.Fragment key={item.ap}>
                    <ArrowRight size={10} className="crumb-arrow" />
                    <span className="crumb crumb-active">
                      {item.ap}(Ch {item.ch})
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Main View Area */}
          {activeTab === 'flowchart' ? (
            <div className="flowchart-embed-wrapper">
              <BacktrackingFlowchart currentStep={currentStep} isRunning={isRunning} />
            </div>
          ) : (
            <>
              {/* Dynamic SVG Tree Viewport */}
              <div ref={scrollContainerRef} className="search-tree-svg-container">
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  style={{ width: `${Math.max(svgWidth, 320)}px`, height: `${svgHeight}px`, minHeight: '190px' }}
                  className="search-tree-svg"
                >
                  <defs>
                    <filter id="treeShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.08" />
                    </filter>
                    <filter id="pulseGlow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Connecting Lines between Parent and Children */}
                  <g className="tree-edges-layer">
                    {layoutNodes.map((node) => {
                      if (!node.parentId) return null;
                      const parent = layoutNodes.find((n) => n.id === node.parentId);
                      if (!parent) return null;

                      const isEdgeOnPath = node.isOnActivePath && parent.isOnActivePath;
                      const isBacktrackingEdge = node.isBacktrackingNow;
                      const isConflictEdge = node.status === 'conflict';
                      const isSolutionEdge = node.isOnSolutionPath && parent.isOnSolutionPath;

                      let strokeColor = '#cbd5e1';
                      let strokeWidth = '1.4';
                      let strokeDasharray = undefined;

                      if (isBacktrackingEdge) {
                        strokeColor = '#f59e0b';
                        strokeWidth = '2.8';
                        strokeDasharray = '4 3';
                      } else if (isSolutionEdge) {
                        strokeColor = '#10b981';
                        strokeWidth = '2.5';
                      } else if (isConflictEdge) {
                        strokeColor = '#ef4444';
                        strokeWidth = '1.8';
                        strokeDasharray = '3 3';
                      } else if (isEdgeOnPath) {
                        strokeColor = '#2563eb';
                        strokeWidth = '2.2';
                      } else if (node.status === 'backtracked') {
                        strokeColor = '#e2e8f0';
                        strokeWidth = '1.2';
                        strokeDasharray = '3 3';
                      }

                      // Draw smooth curved connector line
                      const midY = (parent.y + 14 + (node.y - 14)) / 2;
                      const pathD = `M ${parent.x} ${parent.y + 14} C ${parent.x} ${midY}, ${node.x} ${midY}, ${node.x} ${node.y - 14}`;

                      return (
                        <g key={`edge-${node.id}`}>
                          <path
                            d={pathD}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                            strokeDasharray={strokeDasharray}
                          />

                          {/* Upward Backtrack Traversal Arrow */}
                          {isBacktrackingEdge && (
                            <g transform={`translate(${(parent.x + node.x) / 2}, ${midY})`}>
                              <circle cx="0" cy="0" r="8" fill="#f59e0b" />
                              <text x="0" y="3.5" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                                ↑
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </g>

                  {/* Tree Nodes Layer */}
                  <g className="tree-nodes-layer">
                    {layoutNodes.map((node) => {
                      const isRoot = node.id === rootId;
                      const channelMeta = getChannelByNumber(node.channelNumber);
                      const isCurrent = node.isCurrentActive;

                      // Theme colors based on status
                      let boxFill = '#ffffff';
                      let boxStroke = '#cbd5e1';
                      let titleColor = '#0f172a';
                      let subColor = '#64748b';
                      let badgeIcon = null;

                      if (isRoot) {
                        boxFill = '#f1f5f9';
                        boxStroke = '#94a3b8';
                        titleColor = '#1e293b';
                        subColor = '#475569';
                      } else if (node.status === 'conflict') {
                        boxFill = '#fee2e2';
                        boxStroke = '#ef4444';
                        titleColor = '#991b1b';
                        subColor = '#dc2626';
                        badgeIcon = (
                          <text x="0" y="24" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="bold">
                            ✕
                          </text>
                        );
                      } else if (node.status === 'backtracked') {
                        boxFill = '#fef3c7';
                        boxStroke = '#f59e0b';
                        titleColor = '#92400e';
                        subColor = '#b45309';
                        badgeIcon = (
                          <text x="0" y="24" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">
                            ⮌
                          </text>
                        );
                      } else if (node.status === 'solution') {
                        boxFill = '#d1fae5';
                        boxStroke = '#10b981';
                        titleColor = '#065f46';
                        subColor = '#059669';
                        badgeIcon = (
                          <text x="18" y="22" textAnchor="middle" fill="#10b981" fontSize="12" fontWeight="bold">
                            ✓
                          </text>
                        );
                      } else if (node.status === 'safe') {
                        boxFill = '#eff6ff';
                        boxStroke = '#3b82f6';
                        titleColor = '#1e3a8a';
                        subColor = '#2563eb';
                        badgeIcon = (
                          <text x="18" y="22" textAnchor="middle" fill="#10b981" fontSize="12" fontWeight="bold">
                            ✓
                          </text>
                        );
                      } else if (node.status === 'exploring') {
                        boxFill = '#fffbeb';
                        boxStroke = '#f59e0b';
                        titleColor = '#78350f';
                        subColor = '#d97706';
                      }

                      return (
                        <g
                          key={node.id}
                          ref={isCurrent ? activeSvgNodeRef : null}
                          transform={`translate(${node.x}, ${node.y})`}
                          className={`tree-svg-node ${isCurrent ? 'node-active-pulse' : ''} ${
                            node.isBacktrackingNow ? 'node-backtrack-pulse' : ''
                          }`}
                        >
                          {/* Pulsing Aura for Active Node */}
                          {isCurrent && (
                            <rect
                              x="-34"
                              y="-16"
                              width="68"
                              height="32"
                              rx="8"
                              fill="none"
                              stroke={node.isBacktrackingNow ? '#f59e0b' : '#2563eb'}
                              strokeWidth="3.5"
                              opacity="0.8"
                              className="node-halo"
                            />
                          )}

                          {/* Node Box */}
                          <rect
                            x="-30"
                            y="-14"
                            width="60"
                            height="28"
                            rx="6"
                            fill={boxFill}
                            stroke={boxStroke}
                            strokeWidth={isCurrent ? '2.5' : '1.5'}
                            filter="url(#treeShadow)"
                          />

                          {/* Channel Color Dot */}
                          {!isRoot && channelMeta && (
                            <circle
                              cx="-20"
                              cy="-3"
                              r="3.5"
                              fill={channelMeta.color}
                            />
                          )}

                          {/* Label 1: AP ID */}
                          <text
                            x={isRoot ? '0' : '-3'}
                            y="-2"
                            textAnchor={isRoot ? 'middle' : 'middle'}
                            fill={titleColor}
                            fontSize="9"
                            fontWeight="800"
                            fontFamily="Inter, sans-serif"
                          >
                            {isRoot ? 'Root' : node.vertexId}
                          </text>

                          {/* Label 2: Channel Number */}
                          <text
                            x="0"
                            y="8.5"
                            textAnchor="middle"
                            fill={subColor}
                            fontSize="7.5"
                            fontWeight="700"
                            fontFamily="Inter, sans-serif"
                          >
                            {isRoot ? 'Start' : node.channelLabel}
                          </text>

                          {/* Status Badge (✕, ✓, ⮌) */}
                          {badgeIcon}

                          {/* Conflict Tag Label (e.g. "w/ AP1") */}
                          {node.conflictingWith && (
                            <text
                              x="0"
                              y="34"
                              textAnchor="middle"
                              fill="#ef4444"
                              fontSize="7"
                              fontWeight="bold"
                            >
                              ⚡{node.conflictingWith}
                            </text>
                          )}

                          {/* Backtrack Tag Label */}
                          {node.status === 'backtracked' && !node.conflictingWith && (
                            <text
                              x="0"
                              y="34"
                              textAnchor="middle"
                              fill="#b45309"
                              fontSize="6.5"
                              fontWeight="bold"
                            >
                              Pruned
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </g>
                </svg>
              </div>

              {/* 4. Tree Legend */}
              <div className="search-tree-legend">
                <div className="tree-legend-item">
                  <span className="tree-legend-dot valid-dot" />
                  <span>Valid</span>
                </div>
                <div className="tree-legend-item">
                  <span className="tree-legend-dot conflict-dot" />
                  <span>Conflict</span>
                </div>
                <div className="tree-legend-item">
                  <span className="tree-legend-dot backtrack-dot" />
                  <span>Backtracked</span>
                </div>
                <div className="tree-legend-item">
                  <span className="tree-legend-dot active-dot" />
                  <span>Exploring</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
