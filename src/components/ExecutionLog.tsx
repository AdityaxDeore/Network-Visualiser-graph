import React, { useEffect, useRef, useState } from 'react';
import { AlgorithmStep } from '../types';
import { Terminal, Filter, ArrowDownCircle } from 'lucide-react';

interface ExecutionLogProps {
  steps: AlgorithmStep[];
  currentStepIndex: number;
}

export const ExecutionLog: React.FC<ExecutionLogProps> = ({ steps, currentStepIndex }) => {
  const [filter, setFilter] = useState<'ALL' | 'CONFLICTS' | 'BACKTRACKS' | 'ASSIGNMENTS'>('ALL');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active step
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [currentStepIndex, autoScroll, filter]);

  // Steps executed up to the current scrubber position
  const visibleSteps = steps.slice(0, currentStepIndex);

  const filteredSteps = visibleSteps.filter((step) => {
    if (filter === 'CONFLICTS') return step.type === 'CONFLICT_DETECTED';
    if (filter === 'BACKTRACKS') return step.type === 'BACKTRACK';
    if (filter === 'ASSIGNMENTS') return step.type === 'SAFE_ASSIGNMENT' || step.type === 'SUCCESS';
    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-750 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-850 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-slate-200">Algorithm Execution Log</h3>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
            {visibleSteps.length} / {steps.length} steps
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
              filter === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('CONFLICTS')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
              filter === 'CONFLICTS'
                ? 'bg-rose-950 text-rose-300 border border-rose-700'
                : 'text-slate-400 hover:text-rose-300'
            }`}
          >
            Conflicts
          </button>
          <button
            onClick={() => setFilter('BACKTRACKS')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
              filter === 'BACKTRACKS'
                ? 'bg-amber-950 text-amber-300 border border-amber-700'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            Backtracks
          </button>
          <button
            onClick={() => setFilter('ASSIGNMENTS')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
              filter === 'ASSIGNMENTS'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            Safe
          </button>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1 rounded text-[11px] ml-1 ${
              autoScroll ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'
            }`}
            title={autoScroll ? 'Auto-scroll enabled' : 'Auto-scroll disabled'}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log Entries Area */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto p-2.5 space-y-1 font-mono text-xs bg-slate-950 min-h-0"
      >
        {filteredSteps.length === 0 ? (
          <div className="text-center text-slate-500 py-8 text-xs font-sans">
            No steps executed yet. Press [Start] or [Step] to begin logging.
          </div>
        ) : (
          filteredSteps.map((step) => {
            const isLatest = step.stepNumber === currentStepIndex;

            let badgeClass = 'bg-slate-800 text-slate-300 border-slate-700';
            let prefix = 'LOG';

            if (step.type === 'CONFLICT_DETECTED') {
              badgeClass = 'bg-rose-950/90 text-rose-300 border-rose-800/80';
              prefix = 'CONFLICT';
            } else if (step.type === 'BACKTRACK') {
              badgeClass = 'bg-amber-950/90 text-amber-300 border-amber-800/80';
              prefix = 'BACKTRACK';
            } else if (step.type === 'SAFE_ASSIGNMENT' || step.type === 'SUCCESS') {
              badgeClass = 'bg-emerald-950/90 text-emerald-300 border-emerald-800/80';
              prefix = step.type === 'SUCCESS' ? 'SOLVED' : 'ASSIGN';
            } else if (step.type === 'TRY_CHANNEL') {
              badgeClass = 'bg-sky-950/90 text-sky-300 border-sky-800/80';
              prefix = 'TRY';
            } else if (step.type === 'FAILURE') {
              badgeClass = 'bg-rose-950 text-rose-200 border-rose-600';
              prefix = 'FAIL';
            }

            return (
              <div
                key={`step-${step.stepNumber}`}
                className={`flex items-start gap-2.5 p-1.5 rounded transition-colors ${
                  isLatest
                    ? 'bg-slate-850/90 border-l-4 border-l-amber-400 text-slate-100 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-900/60'
                }`}
              >
                <span className="text-[10px] text-slate-500 shrink-0 select-none">
                  #{step.stepNumber.toString().padStart(3, '0')}
                </span>

                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase shrink-0 ${badgeClass}`}
                >
                  {prefix}
                </span>

                <span className="text-[11px] leading-relaxed break-words font-sans">{step.description}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
