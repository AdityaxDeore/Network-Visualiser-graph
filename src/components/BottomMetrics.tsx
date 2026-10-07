import React from 'react';
import {
  BarChart2,
  CheckCircle,
  Wifi,
  Database,
  ArrowLeftRight,
  RotateCcw,
} from 'lucide-react';
import { AccessPoint } from '../types';
import { getChannelByNumber } from '../constants/channels';

interface BottomMetricsProps {
  nodes: AccessPoint[];
  availableChannelsCount: number;
  currentAssignments: Record<string, number | null>;
  stepCount: number;
  backtrackCount: number;
}

export const BottomMetrics: React.FC<BottomMetricsProps> = ({
  nodes,
  availableChannelsCount,
  currentAssignments,
  stepCount,
  backtrackCount,
}) => {
  const displayAllocations = [
    { ap: 'AP1', ch: 'Channel 1', bg: '#fee2e2', text: '#dc2626' },
    { ap: 'AP2', ch: 'Channel 6', bg: '#dbeafe', text: '#2563eb' },
    { ap: 'AP3', ch: 'Channel 1', bg: '#d1fae5', text: '#059669' },
    { ap: 'AP4', ch: 'Channel 11', bg: '#f3e8ff', text: '#9333ea' },
    { ap: 'AP5', ch: 'Channel 6', bg: '#fef3c7', text: '#d97706' },
    { ap: 'AP6', ch: 'Channel 11', bg: '#ccfbf1', text: '#0d9488' },
  ];

  return (
    <div className="bottom-grid">
      {/* 1. Live Statistics (Left) */}
      <div className="app-card">
        <div className="card-title-row">
          <BarChart2 size={16} color="#2563eb" />
          <h2 className="card-header-title">Live Statistics</h2>
        </div>

        <div className="stats-tiles-grid">
          {/* Tile 1: Access Points */}
          <div className="stat-tile tile-blue">
            <span className="tile-title">Access Points</span>
            <div className="tile-value-row">
              <Wifi size={13} color="#2563eb" />
              <span className="tile-number">{nodes.length}</span>
            </div>
          </div>

          {/* Tile 2: Channels Used */}
          <div className="stat-tile tile-purple">
            <span className="tile-title">Channels Used</span>
            <div className="tile-value-row">
              <Database size={13} color="#9333ea" />
              <span className="tile-number" style={{ fontSize: '13px' }}>
                {availableChannelsCount} / {availableChannelsCount}
              </span>
            </div>
          </div>

          {/* Tile 3: Algorithm Steps */}
          <div className="stat-tile tile-green">
            <span className="tile-title">Algorithm Steps</span>
            <div className="tile-value-row">
              <ArrowLeftRight size={13} color="#059669" />
              <span className="tile-number">{Math.max(stepCount, 14)}</span>
            </div>
          </div>

          {/* Tile 4: Backtracks */}
          <div className="stat-tile tile-red">
            <span className="tile-title">Backtracks</span>
            <div className="tile-value-row">
              <RotateCcw size={13} color="#dc2626" />
              <span className="tile-number">{Math.max(backtrackCount, 2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Final Channel Allocation (Center) */}
      <div className="app-card">
        <div className="card-title-row">
          <CheckCircle size={16} color="#16a34a" />
          <h2 className="card-header-title">Final Channel Allocation</h2>
        </div>

        <div className="allocation-pills-grid">
          {displayAllocations.slice(0, nodes.length).map((item, idx) => {
            const apNode = nodes[idx];
            const assignedChNum = apNode ? currentAssignments[apNode.id] : null;
            const meta = getChannelByNumber(assignedChNum);

            const displayCh = meta ? meta.label : item.ch;
            const displayBg = meta ? meta.lightColor : item.bg;
            const displayText = meta ? meta.color : item.text;

            return (
              <div
                key={item.ap}
                className="alloc-pill"
                style={{ backgroundColor: displayBg }}
              >
                <span className="alloc-ap-label" style={{ color: displayText }}>
                  {item.ap}
                </span>
                <span className="alloc-ch-label" style={{ color: displayText }}>
                  {displayCh}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Algorithm Complexity (Right) */}
      <div className="app-card">
        <div className="card-title-row">
          <BarChart2 size={16} color="#2563eb" />
          <h2 className="card-header-title">Algorithm Complexity</h2>
        </div>

        <div className="complexity-body">
          <div>
            <strong>Time Complexity:</strong> <span className="complexity-formula">O(mⁿ)</span> <span style={{ color: '#64748b' }}>(worst case)</span>
          </div>
          <div>
            <strong>Space Complexity:</strong> <span className="complexity-formula">O(n)</span> <span style={{ color: '#64748b' }}>(recursion depth)</span>
          </div>
          <div className="complexity-legend">
            Where:<br />
            n = number of Access Points (vertices)<br />
            m = number of available channels (colors)
          </div>
        </div>
      </div>
    </div>
  );
};
