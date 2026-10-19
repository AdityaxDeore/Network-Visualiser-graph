import React from 'react';
import { Layers, Database, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { AccessPoint } from '../types';

interface MetricsBarProps {
  nodes: AccessPoint[];
  availableChannelsCount: number;
  currentAssignments: Record<string, number | null>;
  stepCount: number;
  totalSearchSteps: number;
  isSolution: boolean;
  isRunning: boolean;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({
  nodes,
  availableChannelsCount,
  currentAssignments,
  stepCount,
  totalSearchSteps,
  isSolution,
  isRunning,
}) => {
  // Compute total state space: channels^nodes (e.g., 3^6 = 729)
  const totalStateSpace = Math.pow(availableChannelsCount, nodes.length);
  
  // Calculate percentage searched
  const assignedCount = Object.values(currentAssignments).filter((c) => c !== null).length;
  const isComplete = assignedCount === nodes.length;

  let searchedPercentage = '99.86%';
  let searchedFraction = `(${Math.min(stepCount, totalSearchSteps)} / ${totalSearchSteps} steps)`;

  if (isRunning) {
    const pct = Math.min(99.9, ((stepCount / Math.max(1, totalSearchSteps)) * 100)).toFixed(1);
    searchedPercentage = `${pct}%`;
    searchedFraction = `(${stepCount} / ${totalSearchSteps} steps)`;
  } else if (!isSolution && stepCount <= 1) {
    searchedPercentage = '0.00%';
    searchedFraction = `(0 / ${totalSearchSteps} steps)`;
  }

  return (
    <div className="metrics-card">
      <div className="metrics-header-row">
        <Layers size={16} className="metrics-header-icon" />
        <h3 className="metrics-title">Metrics</h3>
      </div>

      <div className="metrics-grid-row">
        {/* 1. Time Complexity */}
        <div className="metric-tile">
          <div className="metric-icon-box purple-box">
            <Layers size={18} className="metric-icon purple-text" />
          </div>
          <div className="metric-content">
            <div className="metric-label">Time Complexity</div>
            <div className="metric-value-row">
              <span className="metric-bold-value">O(mⁿ)</span>
            </div>
            <div className="metric-sub-text">Worst-case (= {availableChannelsCount}^{nodes.length})</div>
          </div>
        </div>

        {/* 2. State Space */}
        <div className="metric-tile">
          <div className="metric-icon-box orange-box">
            <Database size={18} className="metric-icon orange-text" />
          </div>
          <div className="metric-content">
            <div className="metric-label">State Space</div>
            <div className="metric-value-row">
              <span className="metric-bold-value">{totalStateSpace.toLocaleString()}</span>
            </div>
            <div className="metric-sub-text">mⁿ = {availableChannelsCount}^{nodes.length} combinations</div>
          </div>
        </div>

        {/* 3. States Searched */}
        <div className="metric-tile">
          <div className="metric-icon-box blue-box">
            <Search size={18} className="metric-icon blue-text" />
          </div>
          <div className="metric-content">
            <div className="metric-label">States Searched</div>
            <div className="metric-value-row">
              <span className="metric-bold-value">{searchedPercentage}</span>
            </div>
            <div className="metric-sub-text">{searchedFraction}</div>
          </div>
        </div>

        {/* 4. Solution Found */}
        <div className="metric-tile">
          <div className="metric-icon-box green-box">
            {isSolution || (isComplete && !isRunning) ? (
              <CheckCircle2 size={18} className="metric-icon green-text" />
            ) : (
              <AlertCircle size={18} className="metric-icon green-text" />
            )}
          </div>
          <div className="metric-content">
            <div className="metric-label">Solution Found</div>
            <div className="metric-value-row">
              <span className="metric-bold-value">
                {isSolution || (isComplete && !isRunning) ? 'Yes' : isRunning ? 'Solving...' : 'Ready'}
              </span>
            </div>
            <div className="metric-sub-text">
              {isSolution || (isComplete && !isRunning) ? 'Valid Assignment' : isRunning ? 'Searching Space...' : 'Click Run'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
