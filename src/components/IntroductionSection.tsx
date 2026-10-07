import React from 'react';
import { ArrowRight, Radio, Share2, Palette, ShieldAlert, RotateCcw, CheckCircle2 } from 'lucide-react';

export const IntroductionSection: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* Short Academic Overview */}
      <div className="text-sm text-slate-300 leading-relaxed">
        <p>
          Multiple Wi-Fi Access Points operating near each other may interfere when they use conflicting channels.
          This model represents the wireless network as a graph and uses <strong>graph coloring with backtracking</strong> to
          assign channels while avoiding conflicts between interfering Access Points.
        </p>
      </div>

      {/* DAA Problem Mapping Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-850 border border-slate-750">
          <div className="p-2 rounded-md bg-sky-950 text-sky-400 border border-sky-800/40">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vertex (V)</div>
            <div className="text-sm font-bold text-slate-150">Wi-Fi Access Point (AP)</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-850 border border-slate-750">
          <div className="p-2 rounded-md bg-amber-950 text-amber-400 border border-amber-850/40">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Edge (E)</div>
            <div className="text-sm font-bold text-slate-150">Interference Relationship</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-850 border border-slate-750">
          <div className="p-2 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-850/40">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Color (C)</div>
            <div className="text-sm font-bold text-slate-150">Wi-Fi Channel Frequency</div>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Workflow */}
      <div className="pt-2 border-t border-slate-800">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Algorithm Pipeline:
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200 font-medium">
            Wireless Network
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200 font-medium">
            Graph Modeling
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="px-2.5 py-1 rounded-md bg-indigo-950/70 border border-indigo-700/50 text-indigo-200 font-medium">
            Channel Assignment
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="px-2.5 py-1 rounded-md bg-rose-950/70 border border-rose-700/50 text-rose-200 font-medium flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            Conflict Detection
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="px-2.5 py-1 rounded-md bg-amber-950/70 border border-amber-700/50 text-amber-200 font-medium flex items-center gap-1">
            <RotateCcw className="w-3 h-3 text-amber-400" />
            Backtracking
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="px-2.5 py-1 rounded-md bg-emerald-950/70 border border-emerald-700/50 text-emerald-200 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Valid Allocation
          </span>
        </div>
      </div>
    </div>
  );
};
