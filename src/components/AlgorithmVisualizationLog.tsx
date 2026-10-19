import React, { useEffect, useRef } from 'react';
import { Network, SlidersHorizontal, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
import { AlgorithmStep } from '../types';

interface AlgorithmVisualizationLogProps {
  steps: AlgorithmStep[];
  currentStepIndex: number;
  isRunning: boolean;
  isSolution: boolean;
  isFailure: boolean;
}

export const AlgorithmVisualizationLog: React.FC<AlgorithmVisualizationLogProps> = ({
  steps,
  currentStepIndex,
  isRunning,
  isSolution,
  isFailure,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [currentStepIndex]);

  // Generate simulated events if initial steps are small
  const defaultEvents = [
    { time: '00:00', type: 'init', text: 'Initialized with 6 APs and 3 channels' },
    { time: '00:01', type: 'init', text: 'Building interference graph...' },
    { time: '00:01', type: 'init', text: 'Graph created with 6 nodes and 9 edges' },
    { time: '00:02', type: 'trying', text: 'Trying channel 1 for AP1' },
    { time: '00:02', type: 'assigned', text: 'Assigned AP1 -> Channel 1' },
    { time: '00:03', type: 'trying', text: 'Trying channel 1 for AP2' },
    { time: '00:03', type: 'conflict', text: 'Conflict detected! AP2 and AP1 are adjacent' },
    { time: '00:03', type: 'trying', text: 'Trying channel 6 for AP2' },
    { time: '00:03', type: 'assigned', text: 'Assigned AP2 -> Channel 6' },
    { time: '00:04', type: 'trying', text: 'Trying channel 1 for AP3' },
    { time: '00:04', type: 'conflict', text: 'Conflict detected! AP3 and AP1 are adjacent' },
    { time: '00:04', type: 'trying', text: 'Trying channel 6 for AP3' },
    { time: '00:04', type: 'conflict', text: 'Conflict detected! AP3 and AP2 are adjacent' },
    { time: '00:05', type: 'trying', text: 'Trying channel 11 for AP3' },
    { time: '00:05', type: 'assigned', text: 'Assigned AP3 -> Channel 11' },
  ];

  // Convert real trace steps to event format
  const activeEvents = React.useMemo(() => {
    if (!steps || steps.length === 0) return defaultEvents;

    const list: Array<{ time: string; type: string; text: string }> = [];
    
    // Always start with init logs
    list.push({ time: '00:00', type: 'init', text: 'Initialized with 6 APs and 3 channels' });
    list.push({ time: '00:01', type: 'init', text: 'Building interference graph...' });
    list.push({ time: '00:01', type: 'init', text: 'Graph created with 6 nodes and 9 edges' });

    const maxIdx = Math.max(currentStepIndex, 0);

    for (let i = 0; i <= maxIdx && i < steps.length; i++) {
      const s = steps[i];
      const sec = Math.floor((i + 2) / 2);
      const timeStr = `00:${sec < 10 ? '0' : ''}${sec}`;

      if (s.type === 'TRY_CHANNEL') {
        list.push({
          time: timeStr,
          type: 'trying',
          text: `Trying channel ${s.tryingChannel} for ${s.currentVertex}`,
        });
      } else if (s.type === 'SAFE_ASSIGNMENT') {
        list.push({
          time: timeStr,
          type: 'assigned',
          text: `Assigned ${s.currentVertex} -> Channel ${s.tryingChannel}`,
        });
      } else if (s.type === 'CONFLICT_DETECTED') {
        list.push({
          time: timeStr,
          type: 'conflict',
          text: `Conflict detected! ${s.currentVertex} and ${s.conflictingVertex || 'neighbor'} are adjacent`,
        });
      } else if (s.type === 'BACKTRACK') {
        list.push({
          time: timeStr,
          type: 'backtrack',
          text: `Backtracking from ${s.currentVertex}: Removed Ch ${s.tryingChannel}. Retrying parent node...`,
        });
      } else if (s.type === 'SUCCESS') {
        list.push({
          time: timeStr,
          type: 'assigned',
          text: 'Solution verified: Zero interference conflicts!',
        });
      }
    }

    return list;
  }, [steps, currentStepIndex]);

  return (
    <div className="event-log-card">
      {/* Header */}
      <div className="event-log-header">
        <div className="event-log-title-row">
          <Network size={16} className="event-log-icon" />
          <h3 className="event-log-title">Algorithm Event Log</h3>
        </div>
        <button className="event-log-filter-btn" title="Filter log settings">
          <SlidersHorizontal size={14} />
        </button>
      </div>

      {/* Timeline List */}
      <div ref={containerRef} className="event-log-scroll">
        {activeEvents.map((ev, index) => {
          let dotClass = 'dot-purple';
          let icon = null;

          if (ev.type === 'trying') {
            dotClass = 'dot-blue';
          } else if (ev.type === 'assigned') {
            dotClass = 'dot-green';
            icon = <CheckCircle2 size={13} className="event-inline-icon green-icon" />;
          } else if (ev.type === 'conflict') {
            dotClass = 'dot-red';
            icon = <AlertTriangle size={13} className="event-inline-icon red-icon" />;
          } else if (ev.type === 'backtrack') {
            dotClass = 'dot-orange';
            icon = <RotateCcw size={13} className="event-inline-icon orange-icon" />;
          }

          return (
            <div key={index} className="event-log-item">
              <span className="event-timestamp">{ev.time}</span>
              <div className="event-dot-wrapper">
                {icon ? (
                  icon
                ) : (
                  <span className={`event-status-dot ${dotClass}`} />
                )}
              </div>
              <span className={`event-text ${ev.type === 'conflict' ? 'event-text-conflict' : ''} ${ev.type === 'assigned' ? 'event-text-assigned' : ''} ${ev.type === 'backtrack' ? 'event-text-backtrack' : ''}`}>
                {ev.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
