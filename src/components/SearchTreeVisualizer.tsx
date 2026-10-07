import React, { useMemo, useEffect, useRef } from 'react';
import { TreeNodeData, AlgorithmStep } from '../types';
import { getChannelByNumber } from '../constants/channels';
import { GitBranch, Check, X, CornerDownLeft, Sparkles, Compass } from 'lucide-react';

interface SearchTreeVisualizerProps {
  treeNodes: Record<string, TreeNodeData>;
  rootId: string | null;
  currentStep: AlgorithmStep | null;
  isSolution: boolean;
}

export const SearchTreeVisualizer: React.FC<SearchTreeVisualizerProps> = ({
  treeNodes,
  rootId,
  currentStep,
  isSolution,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeNodeRef = useRef<HTMLDivElement>(null);

  // Compute active branch path from root to current node
  const activePath = useMemo(() => {
    const path = new Set<string>();
    if (!currentStep) return path;

    let curr: string | null = currentStep.treeNodeId;
    while (curr && treeNodes[curr]) {
      path.add(curr);
      curr = treeNodes[curr].parentId;
    }
    return path;
  }, [currentStep, treeNodes]);

  // Compute final solution branch path
  const solutionPath = useMemo(() => {
    const path = new Set<string>();
    if (!isSolution || !currentStep) return path;

    let curr: string | null = currentStep.treeNodeId;
    while (curr && treeNodes[curr]) {
      path.add(curr);
      curr = treeNodes[curr].parentId;
    }
    return path;
  }, [isSolution, currentStep, treeNodes]);

  // Auto-scroll to active node
  useEffect(() => {
    if (activeNodeRef.current && containerRef.current) {
      activeNodeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [currentStep?.treeNodeId]);

  // Recursive tree node renderer
  const renderSubtree = (nodeId: string, level: number = 0): React.ReactNode => {
    const node = treeNodes[nodeId];
    if (!node) return null;

    if (currentStep && node.stepIndex > currentStep.stepNumber && nodeId !== 'root') {
      return null;
    }

    const isCurrent = currentStep?.treeNodeId === nodeId;
    const isSolutionNode = isSolution && solutionPath.has(nodeId);
    const channelMeta = getChannelByNumber(node.channelNumber);

    if (nodeId === 'root') {
      return (
        <div key={nodeId} className="flex flex-col items-center">
          {/* Root Node */}
          <div className="px-3.5 py-1.5 rounded-lg bg-slate-800 border-2 border-slate-700 text-xs font-bold text-slate-200 shadow-md flex items-center gap-2 mb-4">
            <Compass className="w-4 h-4 text-sky-400" />
            <span>Root: State Space Start</span>
          </div>

          {/* Children container */}
          {node.children.length > 0 && (
            <div className="flex flex-wrap justify-center gap-6 pt-2 border-t-2 border-slate-800 relative w-full">
              {node.children.map((childId) => renderSubtree(childId, level + 1))}
            </div>
          )}
        </div>
      );
    }

    let borderClass = 'border-slate-700 bg-slate-900 text-slate-200';
    let statusBadge = null;

    if (node.status === 'conflict') {
      borderClass = 'border-rose-600 bg-rose-950/80 text-rose-200 shadow-sm';
      statusBadge = (
        <span className="flex items-center text-[10px] font-bold text-rose-300 gap-0.5">
          <X className="w-3 h-3 text-rose-400 shrink-0" />
          Conflict
        </span>
      );
    } else if (node.status === 'backtracked') {
      borderClass = 'border-amber-600 bg-amber-950/80 text-amber-200 shadow-sm';
      statusBadge = (
        <span className="flex items-center text-[10px] font-bold text-amber-300 gap-0.5">
          <CornerDownLeft className="w-3 h-3 text-amber-400 shrink-0" />
          Backtrack
        </span>
      );
    } else if (node.status === 'solution' || isSolutionNode) {
      borderClass = 'border-emerald-500 bg-emerald-950/90 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.4)] border-2';
      statusBadge = (
        <span className="flex items-center text-[10px] font-bold text-emerald-300 gap-0.5">
          <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
          Valid Sol
        </span>
      );
    } else if (node.status === 'safe') {
      borderClass = 'border-sky-500 bg-sky-950/80 text-sky-200 shadow-sm';
      statusBadge = (
        <span className="flex items-center text-[10px] font-bold text-sky-300 gap-0.5">
          <Check className="w-3 h-3 text-sky-400 shrink-0" />
          Safe
        </span>
      );
    }

    return (
      <div key={nodeId} className="flex flex-col items-center relative my-1">
        {/* Node Box */}
        <div
          ref={isCurrent ? activeNodeRef : null}
          className={`flex flex-col items-center px-3 py-1.5 rounded-lg border text-xs shadow-md transition-all duration-200 ${borderClass} ${
            isCurrent ? 'ring-2 ring-amber-400 scale-105 z-20 shadow-lg' : ''
          }`}
          style={{ minWidth: '100px' }}
        >
          <div className="flex items-center gap-1.5 font-bold">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
              style={{ backgroundColor: channelMeta?.color || '#38BDF8' }}
            />
            <span>
              {node.vertexId} = Ch {node.channelNumber}
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between w-full text-[10px] gap-1">
            {statusBadge}
            {node.conflictingWith && (
              <span className="text-[9px] text-rose-300 font-mono">w/ {node.conflictingWith}</span>
            )}
          </div>
        </div>

        {/* Children Subtrees */}
        {node.children.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 pt-3 border-t-2 border-slate-800 relative mt-2">
            {node.children.map((childId) => renderSubtree(childId, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const totalExplored = Object.keys(treeNodes).length - 1;

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-750 rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-850 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-100">State-Space Search Tree Visualization</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span>Decisions: <strong className="text-slate-100">{totalExplored}</strong></span>
          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
            <Check className="w-3 h-3" /> Safe
          </span>
          <span className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold">
            <X className="w-3 h-3" /> Clash
          </span>
          <span className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
            <CornerDownLeft className="w-3 h-3" /> Backtrack
          </span>
        </div>
      </div>

      {/* Graphical Tree Display */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-3 bg-slate-950 flex justify-center items-start min-h-0"
      >
        {rootId && treeNodes[rootId] ? (
          <div className="min-w-max flex flex-col items-center py-2">
            {renderSubtree(rootId)}
          </div>
        ) : (
          <div className="text-center text-slate-500 py-12 text-xs">
            Press [Start] or [Step] to begin exploring the decision tree.
          </div>
        )}
      </div>
    </div>
  );
};
