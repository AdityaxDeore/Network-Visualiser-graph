import React from 'react';
import { AlgorithmStep } from '../types';
import { getChannelByNumber } from '../constants/channels';
import { Radio, ArrowRight, ShieldAlert, CheckCircle2, RotateCcw, Search, Sparkles } from 'lucide-react';

interface AlgorithmPipelineBarProps {
  currentStep: AlgorithmStep | null;
  totalVertices: number;
}

export const AlgorithmPipelineBar: React.FC<AlgorithmPipelineBarProps> = ({ currentStep, totalVertices }) => {
  if (!currentStep) {
    return (
      <div className="bg-slate-900 border border-slate-750 rounded-xl p-3.5 shadow-sm flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Search className="w-4 h-4 text-sky-400" />
          <span>Interactive Backtracking Pipeline: Ready to start</span>
        </div>
        <span className="font-mono text-slate-500 text-[11px]">Depth 0 / {totalVertices}</span>
      </div>
    );
  }

  const channelMeta = getChannelByNumber(currentStep.tryingChannel);

  let statusBadge = (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-950 text-sky-300 border border-sky-700 flex items-center gap-1">
      <Search className="w-3.5 h-3.5" /> Testing Candidate
    </span>
  );

  if (currentStep.type === 'CONFLICT_DETECTED') {
    statusBadge = (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-600 flex items-center gap-1 animate-pulse">
        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Conflict: Clash Detected!
      </span>
    );
  } else if (currentStep.type === 'SAFE_ASSIGNMENT') {
    statusBadge = (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-600 flex items-center gap-1">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Constraint Check: Safe
      </span>
    );
  } else if (currentStep.type === 'BACKTRACK') {
    statusBadge = (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-600 flex items-center gap-1">
        <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Backtracking: Reverting Decision
      </span>
    );
  } else if (currentStep.type === 'SUCCESS') {
    statusBadge = (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500 flex items-center gap-1">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Solved: Optimal Allocation
      </span>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-750 rounded-xl p-3.5 shadow-sm space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
          <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 font-mono text-[11px] border border-sky-800">
            Step {currentStep.stepNumber}
          </span>
          <span>Live Backtracking Decision Pipeline</span>
        </div>
        {statusBadge}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Stage 1: Selected Vertex */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-850 border border-slate-750 font-medium">
          <Radio className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-400">Vertex:</span>
          <strong className="text-slate-100">{currentStep.currentVertex || '—'}</strong>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />

        {/* Stage 2: Testing Channel */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-850 border border-slate-750 font-medium">
          <span className="text-slate-400">Testing:</span>
          {channelMeta ? (
            <span className="flex items-center gap-1 font-bold text-slate-100">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: channelMeta.color }} />
              {channelMeta.label}
              <span className="text-[10px] font-mono text-slate-400">({channelMeta.frequencyGhz})</span>
            </span>
          ) : (
            <span className="text-slate-500">None</span>
          )}
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />

        {/* Stage 3: Neighborhood Verification */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-850 border border-slate-750 font-medium flex-1 min-w-[200px]">
          <span className="text-slate-400">Constraint:</span>
          {currentStep.conflictingVertex ? (
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-rose-400 shrink-0" />
              Clashes with {currentStep.conflictingVertex} (same frequency)
            </span>
          ) : currentStep.type === 'SAFE_ASSIGNMENT' ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              No interfering neighbor uses this channel
            </span>
          ) : currentStep.type === 'BACKTRACK' ? (
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <RotateCcw className="w-3 h-3 text-amber-400 shrink-0" />
              All available channels exhausted at depth {currentStep.depth}
            </span>
          ) : (
            <span className="text-slate-300">Checking adjacent APs in graph...</span>
          )}
        </div>
      </div>
    </div>
  );
};
