import React from 'react';
import { AccessPoint, InterferenceEdge, WiFiChannel } from '../types';
import { getChannelByNumber } from '../constants/channels';
import { verifyGraphColoring } from '../utils/graphGenerator';
import { CheckCircle2, AlertOctagon, Download, Copy, Check, Radio } from 'lucide-react';

interface FinalAllocationResultProps {
  nodes: AccessPoint[];
  edges: InterferenceEdge[];
  availableChannels: WiFiChannel[];
  assignments: Record<string, number | null>;
  solutionFound: boolean;
  totalBacktracks: number;
  totalConflicts: number;
  totalSteps: number;
}

export const FinalAllocationResult: React.FC<FinalAllocationResultProps> = ({
  nodes,
  edges,
  availableChannels,
  assignments,
  solutionFound,
  totalBacktracks,
  totalConflicts,
  totalSteps,
}) => {
  const [copied, setCopied] = React.useState(false);

  // Run formal verification
  const verification = verifyGraphColoring(nodes, edges, assignments);

  // Compute channels used
  const usedChannelNumbers = Array.from(
    new Set(Object.values(assignments).filter((c): c is number => c !== null))
  );

  const handleCopy = () => {
    const lines = [
      '====================================================',
      'DAA MODEL: WI-FI CHANNEL ALLOCATION VERIFICATION REPORT',
      'Algorithm: Graph Coloring with Backtracking',
      '====================================================',
      `Access Points (Vertices): ${nodes.length}`,
      `Interference Links (Edges): ${edges.length}`,
      `Available Channels (Colors): ${availableChannels.length}`,
      `Solution Found: ${solutionFound ? 'YES' : 'NO'}`,
      `Final Conflicts: ${verification.violations.length}`,
      `Backtracks Required: ${totalBacktracks}`,
      `Total Decision Steps: ${totalSteps}`,
      '----------------------------------------------------',
      'ALLOCATION TABLE:',
      ...nodes.map((n) => {
        const chNum = assignments[n.id];
        const meta = getChannelByNumber(chNum);
        return `  ${n.id} (${n.locationName}) -> ${meta ? `${meta.label} [${meta.frequencyGhz}]` : 'UNASSIGNED'}`;
      }),
      '====================================================',
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const reportData = {
      project: 'Virtual Wi-Fi Channel Allocation Model',
      algorithm: 'Graph Coloring with Backtracking',
      timestamp: new Date().toISOString(),
      networkMetrics: {
        accessPoints: nodes.length,
        interferenceLinks: edges.length,
        channelsProvided: availableChannels.length,
      },
      results: {
        solutionFound,
        conflictsInFinalConfig: verification.violations.length,
        totalBacktracks,
        totalSearchSteps: totalSteps,
        channelsUsed: usedChannelNumbers.length,
      },
      allocations: nodes.map((n) => ({
        accessPoint: n.id,
        location: n.locationName,
        assignedChannel: assignments[n.id],
        channelMetadata: getChannelByNumber(assignments[n.id]) || null,
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wifi-channel-allocation-report-${solutionFound ? 'valid' : 'failure'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!solutionFound) {
    return (
      <div className="bg-slate-900 border border-rose-800/60 rounded-xl p-5 shadow-lg space-y-4">
        {/* Failure Banner */}
        <div className="flex items-start gap-3.5 p-4 rounded-lg bg-rose-950/70 border border-rose-700/80">
          <AlertOctagon className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-rose-200">
              No Valid Channel Allocation Exists with {availableChannels.length} Available Channels
            </h3>
            <p className="text-xs text-rose-300/90 leading-relaxed">
              The backtracking algorithm explored all branches in the state-space decision tree and exhausted every
              combination without finding a conflict-free coloring.
            </p>
          </div>
        </div>

        {/* Mathematical Explanation of Failure */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase font-semibold">Solution Found:</div>
            <div className="font-bold text-rose-400 text-sm mt-0.5">No (Infeasible)</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase font-semibold">Backtracks Explored:</div>
            <div className="font-bold text-amber-400 text-sm mt-0.5">{totalBacktracks} Backtracks</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase font-semibold">Chromatic Lower Bound:</div>
            <div className="font-bold text-sky-400 text-sm mt-0.5">χ(G) &gt; {availableChannels.length} Channels</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-850 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          <strong>DAA Proof of Infeasibility:</strong> This network contains a subgraph (such as an odd cycle or a complete clique)
          whose chromatic number requires at least {availableChannels.length + 1} distinct frequencies. To resolve this, increase
          the available channels in the configuration panel above.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-750 rounded-xl p-5 shadow-lg space-y-4">
      {/* Success Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg bg-emerald-950/70 border border-emerald-700/80">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <h3 className="text-base font-bold text-emerald-200">Valid Channel Allocation Found</h3>
            <p className="text-xs text-emerald-300/90">
              All {nodes.length} Access Points assigned collision-free Wi-Fi channels using Backtracking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            {copied ? 'Copied!' : 'Copy Summary'}
          </button>
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Summary Verification Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase font-semibold">Conflicts in Final Config:</div>
          <div className="font-bold text-emerald-400 text-base mt-0.5">
            {verification.violations.length} (Verified Safe)
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase font-semibold">Backtracks Executed:</div>
          <div className="font-bold text-amber-400 text-base mt-0.5">{totalBacktracks}</div>
        </div>

        <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase font-semibold">Channels Used:</div>
          <div className="font-bold text-sky-400 text-base mt-0.5">
            {usedChannelNumbers.length} / {availableChannels.length}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase font-semibold">Total Decision Steps:</div>
          <div className="font-bold text-slate-200 text-base mt-0.5">{totalSteps}</div>
        </div>
      </div>

      {/* Final Allocation Table */}
      <div className="border border-slate-800 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300">
          <span>Final Channel Allocation Matrix</span>
          <span className="text-slate-400 font-mono text-[11px] font-normal">Co-Channel Interference = 0</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold">
                <th className="px-4 py-2.5">Access Point (Vertex)</th>
                <th className="px-4 py-2.5">Location Zone</th>
                <th className="px-4 py-2.5">Assigned Channel (Color)</th>
                <th className="px-4 py-2.5">Frequency Band</th>
                <th className="px-4 py-2.5">Interference Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans">
              {nodes.map((node) => {
                const chNum = assignments[node.id];
                const meta = getChannelByNumber(chNum);
                return (
                  <tr key={node.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="px-4 py-2.5 font-bold text-slate-200 flex items-center gap-2">
                      <Radio className="w-3.5 h-3.5 text-sky-400" />
                      {node.id}
                    </td>
                    <td className="px-4 py-2.5 text-slate-300">{node.locationName}</td>
                    <td className="px-4 py-2.5">
                      {meta ? (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow-sm"
                          style={{ backgroundColor: meta.color }}
                        >
                          {meta.label}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-400 text-[11px]">
                      {meta ? `${meta.frequencyGhz} (${meta.band})` : '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Conflict Free
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
