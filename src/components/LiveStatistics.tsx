import React from 'react';
import { AlgorithmStep, AlgorithmStateStatus } from '../types';
import { Radio, Share2, Palette, FastForward, AlertTriangle, RotateCcw, CheckCircle, BarChart3 } from 'lucide-react';

interface LiveStatisticsProps {
  apCount: number;
  edgeCount: number;
  channelsAvailable: number;
  currentStep: AlgorithmStep | null;
  status: AlgorithmStateStatus;
}

export const LiveStatistics: React.FC<LiveStatisticsProps> = ({
  apCount,
  edgeCount,
  channelsAvailable,
  currentStep,
  status,
}) => {
  const stepsCount = currentStep?.stats.steps || 0;
  const conflictsCount = currentStep?.stats.conflicts || 0;
  const backtracksCount = currentStep?.stats.backtracks || 0;
  const channelsUsed = currentStep?.stats.channelsUsed || 0;

  let statusText = 'Ready';
  let statusBadge = 'bg-slate-800 text-slate-300 border-slate-700';

  if (status === 'RUNNING') {
    statusText = 'Executing Backtracking';
    statusBadge = 'bg-sky-950 text-sky-300 border-sky-700 animate-pulse';
  } else if (status === 'PAUSED') {
    statusText = 'Paused';
    statusBadge = 'bg-amber-950 text-amber-300 border-amber-700';
  } else if (status === 'SOLUTION_FOUND') {
    statusText = 'Solution Found';
    statusBadge = 'bg-emerald-950 text-emerald-300 border-emerald-600';
  } else if (status === 'NO_SOLUTION') {
    statusText = 'No Solution Possible';
    statusBadge = 'bg-rose-950 text-rose-300 border-rose-600';
  }

  const statItems = [
    {
      label: 'Access Points (V)',
      value: apCount,
      icon: <Radio className="w-3.5 h-3.5 text-sky-400" />,
      color: 'text-slate-100',
    },
    {
      label: 'Interference Links (E)',
      value: edgeCount,
      icon: <Share2 className="w-3.5 h-3.5 text-indigo-400" />,
      color: 'text-slate-100',
    },
    {
      label: 'Channels Available (C)',
      value: channelsAvailable,
      icon: <Palette className="w-3.5 h-3.5 text-emerald-400" />,
      color: 'text-slate-100',
    },
    {
      label: 'Steps Executed',
      value: stepsCount,
      icon: <FastForward className="w-3.5 h-3.5 text-blue-400" />,
      color: 'text-sky-300',
    },
    {
      label: 'Conflicts Detected',
      value: conflictsCount,
      icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
      color: conflictsCount > 0 ? 'text-rose-400' : 'text-slate-400',
    },
    {
      label: 'Backtracks',
      value: backtracksCount,
      icon: <RotateCcw className="w-3.5 h-3.5 text-amber-400" />,
      color: backtracksCount > 0 ? 'text-amber-400' : 'text-slate-400',
    },
    {
      label: 'Channels Used',
      value: `${channelsUsed} / ${channelsAvailable}`,
      icon: <CheckCircle className="w-3.5 h-3.5 text-teal-400" />,
      color: 'text-teal-300',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-750 rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold text-slate-200">Live Computational Statistics</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">Status:</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusBadge}`}>
            {statusText}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
        {statItems.map((item, idx) => (
          <div key={idx} className="p-2.5 rounded-lg bg-slate-850 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-semibold">
              {item.icon}
              <span className="truncate">{item.label}</span>
            </div>
            <div className={`text-base font-bold font-mono mt-1 ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
