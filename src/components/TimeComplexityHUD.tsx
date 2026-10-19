import React, { useState } from 'react';
import { Cpu, Zap, Maximize2, Minimize2, GitBranch, ShieldAlert, Award } from 'lucide-react';
import { AccessPoint, InterferenceEdge } from '../types';

interface TimeComplexityHUDProps {
  nodes: AccessPoint[];
  edges: InterferenceEdge[];
  availableChannelsCount: number;
  currentStepIndex: number;
  totalSteps: number;
  backtrackCount: number;
  currentDepth: number;
}

export const TimeComplexityHUD: React.FC<TimeComplexityHUDProps> = ({
  nodes,
  edges,
  availableChannelsCount,
  currentStepIndex,
  totalSteps,
  backtrackCount,
  currentDepth,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const n = nodes.length;
  const m = availableChannelsCount;
  
  // Theoretical maximum state space: m^n
  const totalStateSpace = Math.pow(m, n);
  const formattedStateSpace = totalStateSpace > 1000000 
    ? totalStateSpace.toExponential(2) 
    : totalStateSpace.toLocaleString();

  // Pruning efficiency: (1 - steps / m^n) * 100
  const stepsTaken = Math.max(1, currentStepIndex + 1);
  const pruningPercentage = totalStateSpace > 0 
    ? Math.max(0, Math.min(99.99, ((totalStateSpace - stepsTaken) / totalStateSpace) * 100)).toFixed(2)
    : '0.00';

  // Calculate graph maximum degree Δ(G) for Brooks' Theorem
  const degreeMap: Record<string, number> = {};
  edges.forEach((edge) => {
    degreeMap[edge.source] = (degreeMap[edge.source] || 0) + 1;
    degreeMap[edge.target] = (degreeMap[edge.target] || 0) + 1;
  });
  const maxDegree = Object.values(degreeMap).reduce((max, d) => Math.max(max, d), 0);
  const brooksBound = maxDegree + 1;

  return (
    <div className="complexity-hud-container">
      {/* Top Bar / Compact HUD */}
      <div className="complexity-hud-bar">
        <div className="hud-badge-group">
          <div className="hud-badge hud-badge-primary" title="Worst-case time complexity of graph coloring with backtracking">
            <Cpu size={13} className="hud-icon" />
            <span className="hud-label">Time Complexity:</span>
            <span className="hud-val-bold">O(mⁿ) = O({m}^{n})</span>
          </div>

          <div className="hud-badge hud-badge-accent" title="Total theoretical states in decision tree">
            <span className="hud-label">State Space:</span>
            <span className="hud-val-mono">{formattedStateSpace} states</span>
          </div>

          <div className="hud-badge hud-badge-success" title="Percentage of search space pruned via constraint satisfaction">
            <Zap size={13} className="hud-icon-green" />
            <span className="hud-label">Search Pruned:</span>
            <span className="hud-val-green">{pruningPercentage}%</span>
          </div>

          <div className="hud-badge hud-badge-secondary" title="Space complexity (Call stack depth + color state vector)">
            <span className="hud-label">Space:</span>
            <span className="hud-val-bold">O(n) = O({n})</span>
          </div>
        </div>

        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="hud-expand-btn"
          title={isExpanded ? 'Collapse DAA Analysis' : 'Expand Detailed DAA Theory'}
        >
          {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          <span>{isExpanded ? 'Hide Analysis' : 'DAA Complexity Details'}</span>
        </button>
      </div>

      {/* Expanded Detailed Mathematical Breakdown */}
      {isExpanded && (
        <div className="complexity-hud-details">
          <div className="hud-grid-2col">
            {/* Left Column: Mathematical Formulation */}
            <div className="hud-math-card">
              <div className="hud-card-header">
                <GitBranch size={14} color="#2563eb" />
                <h4>Asymptotic Complexity Breakdown</h4>
              </div>

              <div className="hud-math-row">
                <span className="math-term">Worst-Case Time:</span>
                <span className="math-expr">T(n) = m · T(n - 1) + O(E) ⇒ O(mⁿ)</span>
              </div>
              <p className="math-explain">
                For <strong>n = {n}</strong> Access Points and <strong>m = {m}</strong> channels, an unpruned brute-force search would examine <strong>{formattedStateSpace}</strong> channel combinations.
              </p>

              <div className="hud-math-row">
                <span className="math-term">Auxiliary Space:</span>
                <span className="math-expr">S(n) = O(n) Recursion Call Stack</span>
              </div>
              <p className="math-explain">
                Maximum recursion depth equals the number of vertices (<strong>{n}</strong> frames). The channel assignment vector requires linear <strong>O(n)</strong> memory.
              </p>

              <div className="hud-depth-meter">
                <div className="hud-depth-header">
                  <span>Current Decision Tree Depth:</span>
                  <span className="hud-depth-fraction">{currentDepth} / {n} APs assigned</span>
                </div>
                <div className="hud-progress-bg">
                  <div 
                    className="hud-progress-fill" 
                    style={{ width: `${Math.min(100, (currentDepth / Math.max(1, n)) * 100)}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Algorithmic Pruning & Faculty Explanations */}
            <div className="hud-math-card">
              <div className="hud-card-header">
                <ShieldAlert size={14} color="#d97706" />
                <h4>Constraint Satisfaction & Pruning</h4>
              </div>

              <div className="hud-stats-compact-grid">
                <div className="hud-stat-box">
                  <span className="stat-num">{currentStepIndex + 1} / {totalSteps}</span>
                  <span className="stat-desc">Steps Explored</span>
                </div>
                <div className="hud-stat-box">
                  <span className="stat-num">{backtrackCount}</span>
                  <span className="stat-desc">Backtracks Triggered</span>
                </div>
                <div className="hud-stat-box">
                  <span className="stat-num">Δ(G) = {maxDegree}</span>
                  <span className="stat-desc">Max Vertex Degree</span>
                </div>
                <div className="hud-stat-box">
                  <span className="stat-num">χ(G) ≤ {brooksBound}</span>
                  <span className="stat-desc">Brooks' Bound</span>
                </div>
              </div>

              <div className="hud-faculty-note">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Award size={13} color="#059669" />
                  <strong style={{ fontSize: '11px', color: '#065f46' }}>Faculty / Viva Defense Note:</strong>
                </div>
                <p style={{ margin: 0, fontSize: '11px', lineHeight: 1.45, color: '#047857' }}>
                  Vertex Coloring is NP-Complete for m ≥ 3 (Karp's 21 NP-complete problems). Backtracking implements <em>branch-and-bound pruning</em>: as soon as adjacent APs share a frequency, the entire subtree of depth (n - depth) is discarded, pruning <strong>{pruningPercentage}%</strong> of useless calculations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
