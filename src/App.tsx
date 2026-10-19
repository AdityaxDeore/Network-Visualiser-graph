import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  AccessPoint,
  InterferenceEdge,
  AlgorithmStateStatus,
  NetworkPreset,
} from './types';
import { getChannelsSubset } from './constants/channels';
import { NETWORK_PRESETS } from './constants/presets';
import { generateRandomNetwork } from './utils/graphGenerator';
import { generateBacktrackingTrace, AlgorithmTraceResult } from './algorithm/backtrackingEngine';

// Components
import { Header } from './components/Header';
import { SidebarConfig } from './components/SidebarConfig';
import { FloorPlanView } from './components/FloorPlanView';
import { ChannelAssignmentBar } from './components/ChannelAssignmentBar';
import { MetricsBar } from './components/MetricsBar';
import { AlgorithmVisualizationLog } from './components/AlgorithmVisualizationLog';
import { BacktrackingSearchTree } from './components/BacktrackingSearchTree';
import { TopologyGraphView } from './components/TopologyGraphView';
import { BacktrackingFlowchart } from './components/BacktrackingFlowchart';
import { FinalAllocationResult } from './components/FinalAllocationResult';

export function App() {
  // Preset 0: Small Office with 6 APs (exact match to screenshot)
  const defaultPreset = NETWORK_PRESETS[0];
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(defaultPreset.id);
  const [apCount, setApCount] = useState<number>(defaultPreset.apCount);
  const [availableChannelsCount, setAvailableChannelsCount] = useState<number>(defaultPreset.recommendedChannels);
  const [nodes, setNodes] = useState<AccessPoint[]>(defaultPreset.nodes);
  const [edges, setEdges] = useState<InterferenceEdge[]>(defaultPreset.edges);

  // Tabs & Theme
  const [activeTab, setActiveTab] = useState<'simulation' | 'graph' | 'algorithm' | 'analysis'>('simulation');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Visualization Switches
  const [showCoverageArea, setShowCoverageArea] = useState<boolean>(true);
  const [showInterferenceLinks, setShowInterferenceLinks] = useState<boolean>(true);
  const [showRoomLabels, setShowRoomLabels] = useState<boolean>(true);
  const [is3DView, setIs3DView] = useState<boolean>(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Execution State
  const [status, setStatus] = useState<AlgorithmStateStatus>('IDLE');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(400);

  // Timer Ref
  const timerRef = useRef<number | null>(null);

  // Active channels pool
  const availableChannels = useMemo(
    () => getChannelsSubset(availableChannelsCount),
    [availableChannelsCount]
  );

  // Nodes strictly ordered in natural numerical sequence: AP1 -> AP2 -> AP3...
  const sortedNodes = useMemo(() => {
    return [...nodes].sort((a, b) => {
      const numA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });
  }, [nodes]);

  // Precomputed algorithm trace
  const trace: AlgorithmTraceResult = useMemo(() => {
    return generateBacktrackingTrace(sortedNodes, edges, availableChannels);
  }, [sortedNodes, edges, availableChannels]);

  // Current algorithm step
  const currentStep = useMemo(() => {
    if (!trace || trace.steps.length === 0) return null;
    const clampedIndex = Math.min(currentStepIndex, trace.steps.length - 1);
    return trace.steps[clampedIndex] || null;
  }, [trace, currentStepIndex]);

  // Current AP channel assignments
  const currentAssignments = useMemo(() => {
    if (!currentStep) {
      // Default to solved state if at end or idle showing screenshot state
      const initial: Record<string, number | null> = {};
      nodes.forEach((n, idx) => {
        // Preset default colors if unstarted to display lush dashboard view
        const channels = [1, 6, 11, 1, 6, 11];
        initial[n.id] = channels[idx % channels.length];
      });
      return initial;
    }
    return currentStep.assignmentSnapshot;
  }, [currentStep, nodes]);

  // Confetti celebration
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#2563eb', '#10b981', '#6366f1'],
      });
    } catch {
      // Ignore
    }
  }, []);

  // Animation Loop
  useEffect(() => {
    if (status === 'RUNNING') {
      if (currentStepIndex >= trace.steps.length - 1) {
        if (trace.solutionFound) {
          setStatus('SOLUTION_FOUND');
          triggerConfetti();
        } else {
          setStatus('NO_SOLUTION');
        }
        return;
      }

      timerRef.current = window.setTimeout(() => {
        setCurrentStepIndex((prev) => {
          const nextIndex = prev + 1;
          if (nextIndex >= trace.steps.length - 1) {
            if (trace.solutionFound) {
              setStatus('SOLUTION_FOUND');
              triggerConfetti();
            } else {
              setStatus('NO_SOLUTION');
            }
          }
          return nextIndex;
        });
      }, speed);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status, currentStepIndex, trace, speed, triggerConfetti]);

  // Control Handlers
  const handleStart = () => {
    if (currentStepIndex >= trace.steps.length - 1) {
      setCurrentStepIndex(0);
    }
    setStatus('RUNNING');
  };

  const handlePause = () => {
    setStatus('PAUSED');
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStep = () => {
    if (status === 'RUNNING') {
      handlePause();
      return;
    }

    if (currentStepIndex >= trace.steps.length - 1) {
      return;
    }

    const nextIndex = currentStepIndex + 1;
    setCurrentStepIndex(nextIndex);

    if (nextIndex >= trace.steps.length - 1) {
      if (trace.solutionFound) {
        setStatus('SOLUTION_FOUND');
        triggerConfetti();
      } else {
        setStatus('NO_SOLUTION');
      }
    } else {
      setStatus('STEPPING');
    }
  };

  const handleReset = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setStatus('IDLE');
    setCurrentStepIndex(0);
  };

  // Preset Selection
  const handleSelectPreset = (preset: NetworkPreset) => {
    handleReset();
    setSelectedPresetId(preset.id);
    setApCount(preset.apCount);
    setAvailableChannelsCount(preset.recommendedChannels);
    setNodes(preset.nodes);
    setEdges(preset.edges);
  };

  const handleSelectPresetId = (presetId: string) => {
    const matched = NETWORK_PRESETS.find((p) => p.id === presetId);
    if (matched) {
      handleSelectPreset(matched);
    }
  };

  // Change AP Count
  const handleChangeApCount = (count: number) => {
    handleReset();
    setSelectedPresetId(null);
    setApCount(count);
    const matchedPreset = NETWORK_PRESETS.find((p) => p.apCount === count);
    if (matchedPreset) {
      setNodes(matchedPreset.nodes);
      setEdges(matchedPreset.edges);
      setSelectedPresetId(matchedPreset.id);
    } else {
      const generated = generateRandomNetwork(count);
      setNodes(generated.nodes);
      setEdges(generated.edges);
    }
  };

  // Change Available Channels Count
  const handleChangeChannelsCount = (count: number) => {
    handleReset();
    setAvailableChannelsCount(count);
  };

  // Generate Random Network / Custom Layout
  const handleGenerateRandom = () => {
    handleReset();
    setSelectedPresetId(null);
    const generated = generateRandomNetwork(apCount);
    setNodes(generated.nodes);
    setEdges(generated.edges);
  };

  // Node Move
  const handleNodeMove = (id: string, x: number, y: number) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  };

  const activeVertexId = currentStep ? currentStep.currentVertex : null;
  const conflictingVertexId = currentStep?.conflictingVertex || null;
  const conflictingEdgeId = currentStep?.conflictingEdgeId || null;
  const isSolution = status === 'SOLUTION_FOUND';
  const isRunning = status === 'RUNNING';

  return (
    <div className={`lab-app ${theme === 'dark' ? 'lab-dark' : 'lab-light'}`}>
      {/* 1. Header Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedPresetId={selectedPresetId}
        onSelectPresetId={handleSelectPresetId}
        isRunning={isRunning}
        onRun={handleStart}
        onPause={handlePause}
        onStep={handleStep}
        onReset={handleReset}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      />

      {/* 2. Main 3-Column Dashboard Container */}
      <main className="lab-container">
        <div className="lab-three-column-grid">
          {/* Column 1: Network Configuration Sidebar */}
          <div className="col-sidebar">
            <SidebarConfig
              apCount={apCount}
              availableChannelsCount={availableChannelsCount}
              selectedPresetId={selectedPresetId}
              isRunning={isRunning}
              onSelectPreset={handleSelectPreset}
              onChangeApCount={handleChangeApCount}
              onChangeChannelsCount={handleChangeChannelsCount}
              onGenerateRandom={handleGenerateRandom}
              speed={speed}
              onChangeSpeed={setSpeed}
              showCoverageArea={showCoverageArea}
              onToggleCoverageArea={setShowCoverageArea}
              showInterferenceLinks={showInterferenceLinks}
              onToggleInterferenceLinks={setShowInterferenceLinks}
              showRoomLabels={showRoomLabels}
              onToggleRoomLabels={setShowRoomLabels}
              is3DView={is3DView}
              onToggle3DView={setIs3DView}
              onCustomLayout={handleGenerateRandom}
            />
          </div>

          {/* Column 2: Center Viewport, Channel Assignments, and Metrics */}
          <div className="col-center">
            {activeTab === 'simulation' && (
              <>
                <div className="floorplan-card-wrapper">
                  <FloorPlanView
                    nodes={nodes}
                    edges={edges}
                    currentStep={currentStep}
                    currentAssignments={currentAssignments}
                    activeVertexId={activeVertexId}
                    conflictingEdgeId={conflictingEdgeId}
                    conflictingVertexId={conflictingVertexId}
                    isSolution={isSolution}
                    selectedNodeId={selectedNodeId}
                    showCoverageArea={showCoverageArea}
                    showInterferenceLinks={showInterferenceLinks}
                    showRoomLabels={showRoomLabels}
                    is3DView={is3DView}
                    onToggle3DView={setIs3DView}
                    onSelectNode={setSelectedNodeId}
                    onNodeMove={handleNodeMove}
                  />
                </div>

                {/* Channel Assignment Row */}
                <ChannelAssignmentBar
                  nodes={sortedNodes}
                  currentAssignments={currentAssignments}
                  activeVertexId={activeVertexId}
                  tryingChannel={currentStep?.tryingChannel || null}
                />

                {/* Metrics Row */}
                <MetricsBar
                  nodes={nodes}
                  availableChannelsCount={availableChannelsCount}
                  currentAssignments={currentAssignments}
                  stepCount={currentStep?.stats.steps || 14}
                  totalSearchSteps={trace.steps.length || 15}
                  isSolution={isSolution}
                  isRunning={isRunning}
                />
              </>
            )}

            {activeTab === 'graph' && (
              <>
                <div className="floorplan-card-wrapper">
                  <TopologyGraphView
                    nodes={nodes}
                    edges={edges}
                    currentAssignments={currentAssignments}
                    activeVertexId={activeVertexId}
                    conflictingVertexId={conflictingVertexId}
                    onNodeMove={handleNodeMove}
                  />
                </div>
                <ChannelAssignmentBar
                  nodes={sortedNodes}
                  currentAssignments={currentAssignments}
                  activeVertexId={activeVertexId}
                  tryingChannel={currentStep?.tryingChannel || null}
                />
                <MetricsBar
                  nodes={nodes}
                  availableChannelsCount={availableChannelsCount}
                  currentAssignments={currentAssignments}
                  stepCount={currentStep?.stats.steps || 14}
                  totalSearchSteps={trace.steps.length || 15}
                  isSolution={isSolution}
                  isRunning={isRunning}
                />
              </>
            )}

            {activeTab === 'algorithm' && (
              <div className="floorplan-card-wrapper tab-content-padding">
                <BacktrackingFlowchart currentStep={currentStep} isRunning={isRunning} />
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="floorplan-card-wrapper tab-content-padding">
                <FinalAllocationResult
                  nodes={nodes}
                  edges={edges}
                  availableChannels={availableChannels}
                  assignments={currentAssignments}
                  solutionFound={trace.solutionFound}
                  totalBacktracks={trace.totalBacktracks}
                  totalConflicts={trace.totalConflicts}
                  totalSteps={trace.steps.length}
                />
              </div>
            )}
          </div>

          {/* Column 3: Algorithm Event Log & Backtracking Search Tree */}
          <div className="col-right">
            <AlgorithmVisualizationLog
              steps={trace.steps}
              currentStepIndex={currentStepIndex}
              isRunning={isRunning}
              isSolution={isSolution}
              isFailure={status === 'NO_SOLUTION'}
            />
            <BacktrackingSearchTree
              currentStep={currentStep}
              currentStepIndex={currentStepIndex}
              steps={trace.steps}
              treeNodes={trace.treeNodes}
              rootId={trace.rootTreeNodeId || 'root'}
              totalBacktracks={trace.totalBacktracks}
              totalConflicts={trace.totalConflicts}
              isSolution={isSolution}
              isRunning={isRunning}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
