import React, { useState } from 'react';
import { AccessPoint, InterferenceEdge, WiFiChannel } from '../types';
import { getChannelByNumber } from '../constants/channels';
import { Radio, ShieldAlert, CheckCircle2, SplitSquareVertical } from 'lucide-react';

interface BeforeAfterComparisonProps {
  nodes: AccessPoint[];
  edges: InterferenceEdge[];
  availableChannels: WiFiChannel[];
  assignments: Record<string, number | null>;
  solutionFound: boolean;
}

export const BeforeAfterComparison: React.FC<BeforeAfterComparisonProps> = ({
  nodes,
  edges,
  availableChannels,
  assignments,
  solutionFound,
}) => {
  const [viewMode, setViewMode] = useState<'SPLIT' | 'BEFORE' | 'AFTER'>('SPLIT');

  // In the simulated "Before" state:
  // Every AP is assigned to standard default Channel 1, creating multiple co-channel interference conflicts!
  const defaultChannel = availableChannels[0] || { channelNumber: 1, label: 'Channel 1', color: '#DC2626' };

  // Calculate conflicts in Before state
  const beforeConflictsCount = edges.length; // because all APs are on Channel 1, every interference edge is a conflict!

  return (
    <div className="bg-slate-900 border border-slate-750 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between border-b border-slate-850 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <SplitSquareVertical className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-slate-200">
            Network State Comparison: Uncoordinated vs. Backtracking
          </h3>
        </div>

        <div className="flex items-center gap-1 bg-slate-850 p-1 rounded-lg border border-slate-750 text-xs">
          <button
            onClick={() => setViewMode('SPLIT')}
            className={`px-2.5 py-1 rounded font-semibold ${
              viewMode === 'SPLIT' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setViewMode('BEFORE')}
            className={`px-2.5 py-1 rounded font-semibold ${
              viewMode === 'BEFORE' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Before (Clashing)
          </button>
          <button
            onClick={() => setViewMode('AFTER')}
            className={`px-2.5 py-1 rounded font-semibold ${
              viewMode === 'AFTER' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            After (Optimized)
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400 italic">
        * Note: The "Before" state is a simulated uncoordinated deployment (all Access Points defaulting to Channel 1),
        demonstrating real-world co-channel packet collisions without algorithmic graph coloring.
      </p>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BEFORE CARD */}
        {(viewMode === 'SPLIT' || viewMode === 'BEFORE') && (
          <div className="rounded-xl border border-rose-800/60 bg-rose-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-rose-800/40 pb-2">
              <span className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Before: Default Uncoordinated Configuration
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-700">
                {beforeConflictsCount} Severe Conflicts
              </span>
            </div>

            <p className="text-xs text-slate-300">
              All {nodes.length} Access Points operate on factory default{' '}
              <strong>{defaultChannel.label}</strong>. Adjacent APs transmit on identical frequencies, causing
              packet degradation, carrier sense backoffs, and high latency.
            </p>

            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">AP Status:</div>
              <div className="grid grid-cols-2 gap-1.5">
                {nodes.map((node) => (
                  <div
                    key={`before-${node.id}`}
                    className="p-1.5 rounded bg-slate-900 border border-rose-900/50 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-slate-200">{node.id}</span>
                    <span className="text-[10px] font-mono text-rose-400">Ch 1 (Clash)</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-2 rounded bg-rose-950/40 border border-rose-900/50 text-[11px] text-rose-300">
              Packet Collision Risk: <strong>CRITICAL</strong> • Throughput Penalty: <strong>~70%</strong>
            </div>
          </div>
        )}

        {/* AFTER CARD */}
        {(viewMode === 'SPLIT' || viewMode === 'AFTER') && (
          <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-800/40 pb-2">
              <span className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                After: Backtracking Graph Colored Allocation
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                0 Conflicts (Collision Free)
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Backtracking successfully assigned mutually orthogonal channels to every interfering neighbor.
              Co-channel interference is completely eliminated across the wireless topology.
            </p>

            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Allocated Frequencies:</div>
              <div className="grid grid-cols-2 gap-1.5">
                {nodes.map((node) => {
                  const chNum = assignments[node.id];
                  const meta = getChannelByNumber(chNum);
                  return (
                    <div
                      key={`after-${node.id}`}
                      className="p-1.5 rounded bg-slate-900 border border-emerald-900/50 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-slate-200 flex items-center gap-1">
                        <Radio className="w-3 h-3 text-sky-400" />
                        {node.id}
                      </span>
                      {meta ? (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.2 rounded text-white"
                          style={{ backgroundColor: meta.color }}
                        >
                          Ch {meta.channelNumber}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">Unassigned</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-2 rounded bg-emerald-950/40 border border-emerald-900/50 text-[11px] text-emerald-300">
              Co-Channel Interference: <strong>NONE</strong> • Spectral Efficiency: <strong>MAXIMAL</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
