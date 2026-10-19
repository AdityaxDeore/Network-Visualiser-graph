import React from 'react';
import { AlgorithmStep } from '../types';
import { CheckCircle2, AlertTriangle, ArrowRight, Zap, RefreshCw } from 'lucide-react';

interface BacktrackingFlowchartProps {
  currentStep: AlgorithmStep | null;
  isRunning?: boolean;
  totalVertices?: number;
}

export type FlowchartNodeId =
  | 'start'
  | 'select_ap'
  | 'try_channel'
  | 'is_safe'
  | 'try_next_channel'
  | 'assign_channel'
  | 'move_next_ap'
  | 'all_assigned'
  | 'backtrack'
  | 'optimal_found';

export const BacktrackingFlowchart: React.FC<BacktrackingFlowchartProps> = ({
  currentStep,
  isRunning = false,
  totalVertices = 6,
}) => {
  // Determine active node and branch based on algorithm step
  let activeNodeId: FlowchartNodeId = 'start';
  let activeBranch: 'safe_yes' | 'safe_no' | 'all_yes' | 'all_no' | 'loop_try_next' | 'backtrack_to_next' | null = null;
  let statusBadgeText = 'Ready to Run';
  let statusBadgeColor = '#3b82f6';

  if (!currentStep || currentStep.type === 'INIT') {
    activeNodeId = 'start';
    statusBadgeText = 'Algorithm Initialized';
    statusBadgeColor = '#3b82f6';
  } else if (currentStep.type === 'SELECT_VERTEX') {
    activeNodeId = 'select_ap';
    statusBadgeText = `Selecting ${currentStep.currentVertex}`;
    statusBadgeColor = '#8b5cf6';
  } else if (currentStep.type === 'TRY_CHANNEL') {
    activeNodeId = 'try_channel';
    statusBadgeText = `Testing Ch ${currentStep.tryingChannel} on ${currentStep.currentVertex}`;
    statusBadgeColor = '#10b981';
  } else if (currentStep.type === 'CONFLICT_DETECTED') {
    activeNodeId = 'try_next_channel';
    activeBranch = 'safe_no';
    statusBadgeText = `Conflict with ${currentStep.conflictingVertex}! Trying next channel`;
    statusBadgeColor = '#ef4444';
  } else if (currentStep.type === 'SAFE_ASSIGNMENT') {
    activeNodeId = 'assign_channel';
    activeBranch = 'safe_yes';
    statusBadgeText = `Assigned Ch ${currentStep.tryingChannel} to ${currentStep.currentVertex}`;
    statusBadgeColor = '#10b981';
  } else if (currentStep.type === 'BACKTRACK') {
    activeNodeId = 'backtrack';
    activeBranch = 'all_no';
    statusBadgeText = `Backtracking from ${currentStep.currentVertex} (reverting assignment)`;
    statusBadgeColor = '#ef4444';
  } else if (currentStep.type === 'SUCCESS') {
    activeNodeId = 'optimal_found';
    activeBranch = 'all_yes';
    statusBadgeText = 'Optimal Channel Allocation Found!';
    statusBadgeColor = '#10b981';
  } else if (currentStep.type === 'FAILURE') {
    activeNodeId = 'backtrack';
    statusBadgeText = 'No valid allocation exists with current channels';
    statusBadgeColor = '#ef4444';
  }

  const isNodeActive = (id: FlowchartNodeId) => activeNodeId === id;

  return (
    <div className="flowchart-container" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Live Iteration Info Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          fontSize: '11px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: '#dbeafe',
              color: '#1d4ed8',
              fontWeight: 700,
              fontSize: '10px',
            }}
          >
            2
          </span>
          <strong style={{ color: '#1e293b' }}>Backtracking Algorithm</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {currentStep && (
            <span
              style={{
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 600,
                backgroundColor: '#e2e8f0',
                color: '#475569',
              }}
            >
              Step {currentStep.stepNumber}
            </span>
          )}
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '10.5px',
              fontWeight: 600,
              backgroundColor: `${statusBadgeColor}15`,
              color: statusBadgeColor,
              border: `1px solid ${statusBadgeColor}40`,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: statusBadgeColor,
                animation: isRunning ? 'pulse 1s infinite' : 'none',
              }}
            />
            {statusBadgeText}
          </span>
        </div>
      </div>

      {/* SVG Interactive Flowchart */}
      <div
        style={{
          flex: 1,
          width: '100%',
          minHeight: '360px',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '10px 6px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#ffffff',
        }}
      >
        <svg
          viewBox="0 0 380 540"
          style={{ width: '100%', maxHeight: '500px', overflow: 'visible' }}
        >
          <defs>
            {/* Arrow Marker Definitions */}
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#475569" />
            </marker>

            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#2563eb" />
            </marker>

            <marker
              id="arrow-danger"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#ef4444" />
            </marker>

            <marker
              id="arrow-success"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#10b981" />
            </marker>

            {/* Glowing filter for active node */}
            <filter id="node-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#3b82f6" floodOpacity="0.35" />
            </filter>
            <filter id="node-glow-danger" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#ef4444" floodOpacity="0.4" />
            </filter>
            <filter id="node-glow-success" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#10b981" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* ================= CONNECTING ARROWS & WIRES ================= */}

          {/* 1. Start -> Select next AP */}
          <line
            x1="170"
            y1="40"
            x2="170"
            y2="66"
            stroke={isNodeActive('start') || isNodeActive('select_ap') ? '#2563eb' : '#475569'}
            strokeWidth={isNodeActive('start') ? '2.5' : '1.8'}
            strokeDasharray={isNodeActive('start') ? '4 2' : 'none'}
            markerEnd={isNodeActive('start') ? 'url(#arrow-active)' : 'url(#arrow-default)'}
          />

          {/* 2. Select next AP -> Try a channel */}
          <line
            x1="170"
            y1="106"
            x2="170"
            y2="132"
            stroke={isNodeActive('select_ap') || isNodeActive('try_channel') ? '#2563eb' : '#475569'}
            strokeWidth={isNodeActive('select_ap') ? '2.5' : '1.8'}
            strokeDasharray={isNodeActive('select_ap') ? '4 2' : 'none'}
            markerEnd={isNodeActive('select_ap') ? 'url(#arrow-active)' : 'url(#arrow-default)'}
          />

          {/* 3. Try a channel -> Is it safe? */}
          <line
            x1="170"
            y1="168"
            x2="170"
            y2="194"
            stroke={isNodeActive('try_channel') || isNodeActive('is_safe') ? '#2563eb' : '#475569'}
            strokeWidth={isNodeActive('try_channel') ? '2.5' : '1.8'}
            markerEnd="url(#arrow-default)"
          />

          {/* 4. Is it safe? -> (No) -> Try next channel */}
          <path
            d="M 235 220 L 290 220"
            fill="none"
            stroke={activeBranch === 'safe_no' || isNodeActive('try_next_channel') ? '#ef4444' : '#475569'}
            strokeWidth={activeBranch === 'safe_no' ? '2.5' : '1.8'}
            strokeDasharray={activeBranch === 'safe_no' ? '4 2' : 'none'}
            markerEnd={activeBranch === 'safe_no' ? 'url(#arrow-danger)' : 'url(#arrow-default)'}
          />
          {/* Label "No" */}
          <text
            x="250"
            y="213"
            fontSize="10"
            fontWeight="bold"
            fill={activeBranch === 'safe_no' ? '#ef4444' : '#475569'}
          >
            No
          </text>

          {/* 5. Try next channel -> Loop back up to Select next AP */}
          <path
            d="M 330 196 L 330 86 L 254 86"
            fill="none"
            stroke={activeBranch === 'safe_no' || isNodeActive('try_next_channel') ? '#ef4444' : '#475569'}
            strokeWidth={isNodeActive('try_next_channel') ? '2.2' : '1.6'}
            strokeDasharray={isNodeActive('try_next_channel') ? '4 2' : 'none'}
            markerEnd={isNodeActive('try_next_channel') ? 'url(#arrow-danger)' : 'url(#arrow-default)'}
          />

          {/* 6. Is it safe? -> (Yes) -> Assign channel to AP */}
          <line
            x1="170"
            y1="246"
            x2="170"
            y2="274"
            stroke={activeBranch === 'safe_yes' || isNodeActive('assign_channel') ? '#10b981' : '#475569'}
            strokeWidth={activeBranch === 'safe_yes' ? '2.5' : '1.8'}
            strokeDasharray={activeBranch === 'safe_yes' ? '4 2' : 'none'}
            markerEnd={activeBranch === 'safe_yes' ? 'url(#arrow-success)' : 'url(#arrow-default)'}
          />
          {/* Label "Yes" */}
          <text
            x="176"
            y="262"
            fontSize="10"
            fontWeight="bold"
            fill={activeBranch === 'safe_yes' ? '#10b981' : '#475569'}
          >
            Yes
          </text>

          {/* 7. Assign channel to AP -> Move to next AP */}
          <line
            x1="170"
            y1="310"
            x2="170"
            y2="336"
            stroke={isNodeActive('assign_channel') || isNodeActive('move_next_ap') ? '#2563eb' : '#475569'}
            strokeWidth="1.8"
            markerEnd="url(#arrow-default)"
          />

          {/* 8. Move to next AP -> All APs assigned? */}
          <line
            x1="170"
            y1="372"
            x2="170"
            y2="398"
            stroke={isNodeActive('move_next_ap') || isNodeActive('all_assigned') ? '#2563eb' : '#475569'}
            strokeWidth="1.8"
            markerEnd="url(#arrow-default)"
          />

          {/* 9. All APs assigned? -> (No) -> Backtrack */}
          <path
            d="M 235 425 L 290 425"
            fill="none"
            stroke={activeBranch === 'all_no' || isNodeActive('backtrack') ? '#ef4444' : '#475569'}
            strokeWidth={activeBranch === 'all_no' ? '2.5' : '1.8'}
            strokeDasharray={activeBranch === 'all_no' ? '4 2' : 'none'}
            markerEnd={activeBranch === 'all_no' ? 'url(#arrow-danger)' : 'url(#arrow-default)'}
          />
          {/* Label "No" */}
          <text
            x="250"
            y="418"
            fontSize="10"
            fontWeight="bold"
            fill={activeBranch === 'all_no' ? '#ef4444' : '#475569'}
          >
            No
          </text>

          {/* 10. Backtrack -> Try next channel (arrow pointing up) */}
          <path
            d="M 330 398 L 330 250"
            fill="none"
            stroke={activeBranch === 'all_no' || isNodeActive('backtrack') ? '#ef4444' : '#475569'}
            strokeWidth={isNodeActive('backtrack') ? '2.2' : '1.6'}
            strokeDasharray={isNodeActive('backtrack') ? '4 2' : 'none'}
            markerEnd={isNodeActive('backtrack') ? 'url(#arrow-danger)' : 'url(#arrow-default)'}
          />

          {/* 11. All APs assigned? -> (Yes) -> Optimal Channel Allocation Found */}
          <line
            x1="170"
            y1="452"
            x2="170"
            y2="480"
            stroke={activeBranch === 'all_yes' || isNodeActive('optimal_found') ? '#10b981' : '#475569'}
            strokeWidth={activeBranch === 'all_yes' ? '2.5' : '1.8'}
            strokeDasharray={activeBranch === 'all_yes' ? '4 2' : 'none'}
            markerEnd={activeBranch === 'all_yes' ? 'url(#arrow-success)' : 'url(#arrow-default)'}
          />
          {/* Label "Yes" */}
          <text
            x="176"
            y="468"
            fontSize="10"
            fontWeight="bold"
            fill={activeBranch === 'all_yes' ? '#10b981' : '#475569'}
          >
            Yes
          </text>

          {/* ================= FLOWCHART NODES ================= */}

          {/* 1. START NODE (Light blue capsule) */}
          <g
            className={`flow-node ${isNodeActive('start') ? 'active' : ''}`}
            filter={isNodeActive('start') ? 'url(#node-glow)' : 'none'}
          >
            <rect
              x="100"
              y="12"
              width="140"
              height="28"
              rx="8"
              fill={isNodeActive('start') ? '#bfdbfe' : '#dbeafe'}
              stroke={isNodeActive('start') ? '#2563eb' : '#93c5fd'}
              strokeWidth={isNodeActive('start') ? '2.5' : '1.5'}
            />
            <text
              x="170"
              y="30"
              textAnchor="middle"
              fontSize="12"
              fontWeight="bold"
              fill="#1e3a8a"
            >
              Start
            </text>
          </g>

          {/* 2. SELECT NEXT AP (Purple rounded rectangle) */}
          <g
            className={`flow-node ${isNodeActive('select_ap') ? 'active' : ''}`}
            filter={isNodeActive('select_ap') ? 'url(#node-glow)' : 'none'}
          >
            <rect
              x="80"
              y="66"
              width="180"
              height="40"
              rx="9"
              fill={isNodeActive('select_ap') ? '#e9d5ff' : '#f3e8ff'}
              stroke={isNodeActive('select_ap') ? '#9333ea' : '#d8b4fe'}
              strokeWidth={isNodeActive('select_ap') ? '2.5' : '1.5'}
            />
            <text
              x="170"
              y="82"
              textAnchor="middle"
              fontSize="11"
              fontWeight="bold"
              fill="#581c87"
            >
              Select next AP
            </text>
            <text
              x="170"
              y="97"
              textAnchor="middle"
              fontSize="10"
              fill="#6b21a8"
            >
              {isNodeActive('select_ap') && currentStep
                ? `👉 ${currentStep.currentVertex}`
                : '(unassigned node)'}
            </text>
          </g>

          {/* 3. TRY A CHANNEL (Green rounded rectangle) */}
          <g
            className={`flow-node ${isNodeActive('try_channel') ? 'active' : ''}`}
            filter={isNodeActive('try_channel') ? 'url(#node-glow-success)' : 'none'}
          >
            <rect
              x="80"
              y="132"
              width="180"
              height="36"
              rx="9"
              fill={isNodeActive('try_channel') ? '#bbf7d0' : '#dcfce7'}
              stroke={isNodeActive('try_channel') ? '#16a34a' : '#86efac'}
              strokeWidth={isNodeActive('try_channel') ? '2.5' : '1.5'}
            />
            <text
              x="170"
              y="148"
              textAnchor="middle"
              fontSize="11"
              fontWeight="bold"
              fill="#14532d"
            >
              Try a channel (color)
            </text>
            {isNodeActive('try_channel') && currentStep?.tryingChannel && (
              <text
                x="170"
                y="161"
                textAnchor="middle"
                fontSize="9.5"
                fontWeight="600"
                fill="#166534"
              >
                Candidate: Ch {currentStep.tryingChannel}
              </text>
            )}
          </g>

          {/* 4. IS IT SAFE? (Purple Diamond) */}
          <g
            className={`flow-node ${isNodeActive('is_safe') ? 'active' : ''}`}
            filter={isNodeActive('is_safe') ? 'url(#node-glow)' : 'none'}
          >
            <polygon
              points="170,194 235,220 170,246 105,220"
              fill={isNodeActive('is_safe') ? '#f3e8ff' : '#faf5ff'}
              stroke={isNodeActive('is_safe') ? '#9333ea' : '#c084fc'}
              strokeWidth={isNodeActive('is_safe') ? '2.5' : '1.5'}
            />
            <text
              x="170"
              y="224"
              textAnchor="middle"
              fontSize="11"
              fontWeight="bold"
              fill="#581c87"
            >
              Is it safe?
            </text>
          </g>

          {/* 5. TRY NEXT CHANNEL (Red/coral rounded rectangle - right side) */}
          <g
            className={`flow-node ${isNodeActive('try_next_channel') ? 'active' : ''}`}
            filter={isNodeActive('try_next_channel') ? 'url(#node-glow-danger)' : 'none'}
          >
            <rect
              x="290"
              y="196"
              width="80"
              height="50"
              rx="9"
              fill={isNodeActive('try_next_channel') ? '#fecaca' : '#fee2e2'}
              stroke={isNodeActive('try_next_channel') ? '#dc2626' : '#fca5a5'}
              strokeWidth={isNodeActive('try_next_channel') ? '2.5' : '1.5'}
            />
            <text
              x="330"
              y="218"
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="bold"
              fill="#991b1b"
            >
              Try next
            </text>
            <text
              x="330"
              y="233"
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill="#991b1b"
            >
              channel
            </text>
          </g>

          {/* 6. ASSIGN CHANNEL TO AP (Green rounded rectangle) */}
          <g
            className={`flow-node ${isNodeActive('assign_channel') ? 'active' : ''}`}
            filter={isNodeActive('assign_channel') ? 'url(#node-glow-success)' : 'none'}
          >
            <rect
              x="80"
              y="274"
              width="180"
              height="36"
              rx="9"
              fill={isNodeActive('assign_channel') ? '#bbf7d0' : '#dcfce7'}
              stroke={isNodeActive('assign_channel') ? '#16a34a' : '#86efac'}
              strokeWidth={isNodeActive('assign_channel') ? '2.5' : '1.5'}
            />
            <text
              x="170"
              y="290"
              textAnchor="middle"
              fontSize="11"
              fontWeight="bold"
              fill="#14532d"
            >
              Assign channel to AP
            </text>
            {isNodeActive('assign_channel') && currentStep && (
              <text
                x="170"
                y="303"
                textAnchor="middle"
                fontSize="9.5"
                fontWeight="600"
                fill="#166534"
              >
                {currentStep.currentVertex} = Ch {currentStep.tryingChannel} ✓
              </text>
            )}
          </g>

          {/* 7. MOVE TO NEXT AP (Purple rounded rectangle) */}
          <g
            className={`flow-node ${isNodeActive('move_next_ap') ? 'active' : ''}`}
            filter={isNodeActive('move_next_ap') ? 'url(#node-glow)' : 'none'}
          >
            <rect
              x="80"
              y="336"
              width="180"
              height="36"
              rx="9"
              fill={isNodeActive('move_next_ap') ? '#e9d5ff' : '#f3e8ff'}
              stroke={isNodeActive('move_next_ap') ? '#9333ea' : '#d8b4fe'}
              strokeWidth={isNodeActive('move_next_ap') ? '2.5' : '1.5'}
            />
            <text
              x="170"
              y="358"
              textAnchor="middle"
              fontSize="11"
              fontWeight="bold"
              fill="#581c87"
            >
              Move to next AP
            </text>
          </g>

          {/* 8. ALL APS ASSIGNED? (Amber/Orange Diamond) */}
          <g
            className={`flow-node ${isNodeActive('all_assigned') ? 'active' : ''}`}
            filter={isNodeActive('all_assigned') ? 'url(#node-glow)' : 'none'}
          >
            <polygon
              points="170,398 235,425 170,452 105,425"
              fill={isNodeActive('all_assigned') ? '#fde68a' : '#fef3c7'}
              stroke={isNodeActive('all_assigned') ? '#d97706' : '#fcd34d'}
              strokeWidth={isNodeActive('all_assigned') ? '2.5' : '1.5'}
            />
            <text
              x="170"
              y="422"
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="bold"
              fill="#92400e"
            >
              All APs
            </text>
            <text
              x="170"
              y="435"
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill="#92400e"
            >
              assigned?
            </text>
          </g>

          {/* 9. BACKTRACK (Red rounded rectangle - right side) */}
          <g
            className={`flow-node ${isNodeActive('backtrack') ? 'active' : ''}`}
            filter={isNodeActive('backtrack') ? 'url(#node-glow-danger)' : 'none'}
          >
            <rect
              x="290"
              y="398"
              width="80"
              height="54"
              rx="9"
              fill={isNodeActive('backtrack') ? '#fecaca' : '#fee2e2'}
              stroke={isNodeActive('backtrack') ? '#dc2626' : '#fca5a5'}
              strokeWidth={isNodeActive('backtrack') ? '2.5' : '1.5'}
            />
            <text
              x="330"
              y="415"
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill="#991b1b"
            >
              Backtrack
            </text>
            <text
              x="330"
              y="428"
              textAnchor="middle"
              fontSize="8.5"
              fill="#b91c1c"
            >
              (remove last
            </text>
            <text
              x="330"
              y="440"
              textAnchor="middle"
              fontSize="8.5"
              fill="#b91c1c"
            >
              assignment)
            </text>
          </g>

          {/* 10. OPTIMAL CHANNEL ALLOCATION FOUND (Green Banner Pill) */}
          <g
            className={`flow-node ${isNodeActive('optimal_found') ? 'active' : ''}`}
            filter={isNodeActive('optimal_found') ? 'url(#node-glow-success)' : 'none'}
          >
            <rect
              x="50"
              y="480"
              width="240"
              height="40"
              rx="12"
              fill={isNodeActive('optimal_found') ? '#86efac' : '#bbf7d0'}
              stroke={isNodeActive('optimal_found') ? '#15803d' : '#4ade80'}
              strokeWidth={isNodeActive('optimal_found') ? '2.5' : '1.5'}
            />
            {/* Green Checkmark circle */}
            <circle cx="78" cy="500" r="10" fill="#15803d" />
            <path
              d="M 73 500 L 77 504 L 83 496"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text
              x="170"
              y="505"
              textAnchor="middle"
              fontSize="11.5"
              fontWeight="bold"
              fill="#064e3b"
            >
              Optimal Channel Allocation Found
            </text>
          </g>
        </svg>
      </div>

      {/* Live Iteration Detail Footer */}
      <div
        style={{
          padding: '8px 12px',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          fontSize: '11px',
          color: '#475569',
          lineHeight: 1.35,
        }}
      >
        {currentStep ? (
          <div>
            <strong style={{ color: '#1e293b' }}>Iteration Action: </strong>
            <span>{currentStep.description}</span>
          </div>
        ) : (
          <div>
            Click <strong>Start</strong> or <strong>Step</strong> to run the backtracking algorithm and watch each decision path execute!
          </div>
        )}
      </div>
    </div>
  );
};
