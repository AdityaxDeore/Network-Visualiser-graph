import React from 'react';
import { AlgorithmStep, AlgorithmStateStatus } from '../types';
import { getChannelByNumber } from '../constants/channels';
import { Activity, AlertTriangle, CheckCircle, RotateCcw, XCircle, Search } from 'lucide-react';

interface StatusCardProps {
  currentStep: AlgorithmStep | null;
  status: AlgorithmStateStatus;
}

export const StatusCard: React.FC<StatusCardProps> = ({ currentStep, status }) => {
  if (!currentStep) {
    return (
      <div className="bg-slate-900 border border-slate-750 rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-800 text-slate-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Algorithm Status</div>
            <div className="text-sm font-bold text-slate-200">System Ready</div>
            <p className="text-xs text-slate-400 mt-0.5">Click [Start] or [Step] to initiate graph coloring</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
          IDLE
        </span>
      </div>
    );
  }

  const channelMeta = getChannelByNumber(currentStep.tryingChannel);

  // Derive visual badges and action
  let statusBadgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
  let statusLabel = 'EXPLORING';
  let icon = <Search className="w-5 h-5 text-sky-400" />;
  let actionLabel = 'Testing Candidates';

  switch (currentStep.type) {
    case 'CONFLICT_DETECTED':
      statusBadgeColor = 'bg-rose-950/80 text-rose-300 border-rose-700/60';
      statusLabel = 'CONFLICT DETECTED';
      actionLabel = `Backtracking from ${currentStep.currentVertex}`;
      icon = <AlertTriangle className="w-5 h-5 text-rose-400" />;
      break;

    case 'SAFE_ASSIGNMENT':
      statusBadgeColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
      statusLabel = 'SAFE ASSIGNMENT';
      actionLabel = `Proceeding to next AP`;
      icon = <CheckCircle className="w-5 h-5 text-emerald-400" />;
      break;

    case 'BACKTRACK':
      statusBadgeColor = 'bg-amber-950/80 text-amber-300 border-amber-700/60';
      statusLabel = 'BACKTRACKING';
      actionLabel = `Unassigning ${currentStep.currentVertex} & Trying Next Channel`;
      icon = <RotateCcw className="w-5 h-5 text-amber-400" />;
      break;

    case 'SUCCESS':
      statusBadgeColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-500';
      statusLabel = 'SOLUTION FOUND';
      actionLabel = 'Valid Channel Allocation Complete';
      icon = <CheckCircle className="w-5 h-5 text-emerald-400" />;
      break;

    case 'FAILURE':
      statusBadgeColor = 'bg-rose-950/80 text-rose-300 border-rose-500';
      statusLabel = 'NO SOLUTION POSSIBLE';
      actionLabel = 'Exhausted Search Space';
      icon = <XCircle className="w-5 h-5 text-rose-400" />;
      break;

    default:
      statusBadgeColor = 'bg-sky-950/80 text-sky-300 border-sky-700/60';
      statusLabel = currentStep.type;
      actionLabel = `Evaluating ${currentStep.currentVertex}`;
      icon = <Search className="w-5 h-5 text-sky-400" />;
  }

  return (
    <div className="bg-slate-900 border border-slate-750 rounded-xl p-4 shadow-sm space-y-3">
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Step {currentStep.stepNumber} Action
            </div>
            <div className="text-sm font-bold text-slate-100">{currentStep.description}</div>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadgeColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* Grid of Key Algorithm Variables */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-2 rounded-lg bg-slate-850 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase font-semibold">Current Vertex:</div>
          <div className="font-bold text-slate-200 mt-0.5 text-sm">{currentStep.currentVertex || 'None'}</div>
        </div>

        <div className="p-2 rounded-lg bg-slate-850 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase font-semibold">Trying Channel:</div>
          <div className="font-bold text-slate-200 mt-0.5 flex items-center gap-1.5 text-sm">
            {channelMeta ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: channelMeta.color }} />
                <span>{channelMeta.label}</span>
              </>
            ) : (
              <span className="text-slate-400">None</span>
            )}
          </div>
        </div>

        <div className="p-2 rounded-lg bg-slate-850 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase font-semibold">Status:</div>
          <div className="font-bold text-slate-200 mt-0.5 truncate">{statusLabel}</div>
        </div>

        <div className="p-2 rounded-lg bg-slate-850 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase font-semibold">Action:</div>
          <div className="font-bold text-slate-200 mt-0.5 truncate">{actionLabel}</div>
        </div>
      </div>

      {/* Detailed Mathematical / DAA Reason */}
      <div className="p-2.5 rounded-lg bg-slate-850/80 border border-slate-800 text-xs text-slate-300">
        <strong className="text-slate-200">DAA Decision Context: </strong>
        {currentStep.detailedReason}
      </div>
    </div>
  );
};
