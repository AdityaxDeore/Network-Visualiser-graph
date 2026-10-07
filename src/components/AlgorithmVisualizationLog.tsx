import React, { useEffect, useRef } from 'react';
import { Code2 } from 'lucide-react';
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

  // Show steps matching screenshot trace
  const visibleSteps = steps.slice(0, Math.max(currentStepIndex, 10));

  let statusLabel = 'Running';
  if (!isRunning && isSolution) statusLabel = 'Completed';
  else if (!isRunning && isFailure) statusLabel = 'No Solution';
  else if (!isRunning && currentStepIndex === 0) statusLabel = 'Running';

  return (
    <div className="app-card" style={{ height: '100%' }}>
      {/* Header */}
      <div className="log-header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Code2 size={16} color="#2563eb" />
          <h2 className="card-header-title">&lt;/&gt; Algorithm Visualization</h2>
        </div>

        <span className="status-badge-running">
          <span className="status-badge-dot" />
          <span>{statusLabel}</span>
        </span>
      </div>

      {/* Log list */}
      <div ref={containerRef} className="log-scroll-area">
        {visibleSteps.map((step, idx) => {
          const stepNum = idx + 1;
          const timestamp = `${(idx * 0.1).toFixed(1)}s`;
          const isConflict = step.type === 'CONFLICT_DETECTED';
          const isAssigned = step.type === 'SAFE_ASSIGNMENT' || step.type === 'SUCCESS';

          let circleClass = 'step-circle-blue';
          let rowClass = 'log-item-row';

          if (isConflict) {
            circleClass = 'step-circle-red';
            rowClass = 'log-item-row log-item-conflict';
          } else if (isAssigned) {
            circleClass = 'step-circle-green';
          }

          return (
            <div key={`log-${stepNum}`} className={rowClass}>
              <div className="log-item-left">
                <span className={`log-step-circle ${circleClass}`}>
                  {stepNum}
                </span>
                <span style={{ fontSize: '11.5px', lineHeight: 1.25 }}>
                  {step.description || `Step ${stepNum}: Processing candidate`}
                </span>
              </div>
              <span className="log-time-text">{timestamp}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
