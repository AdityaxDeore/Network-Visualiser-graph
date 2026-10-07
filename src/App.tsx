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
import { OverviewCards } from './components/OverviewCards';
import { SidebarConfig } from './components/SidebarConfig';
import { NetworkGraph } from './components/NetworkGraph';
import { AlgorithmVisualizationLog } from './components/AlgorithmVisualizationLog';
import { BacktrackingSearchTree } from './components/BacktrackingSearchTree';
import { BottomMetrics } from './components/BottomMetrics';
import { ComplexityExplanation } from './components/ComplexityExplanation';

export function App() {
  // Preset 0: Small Office with 6 APs (exact match to screenshot)
  const defaultPreset = NETWORK_PRESETS[0];
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(defaultPreset.id);
  const [apCount, setApCount] = useState<number>(defaultPreset.apCount);
  const [availableChannelsCount, setAvailableChannelsCount] = useState<number>(defaultPreset.recommendedChannels);
  const [nodes, setNodes] = useState<AccessPoint[]>(defaultPreset.nodes);
  const [edges, setEdges] = useState<InterferenceEdge[]>(defaultPreset.edges);

  // Execution State
  const [status, setStatus] = useState<AlgorithmStateStatus>('IDLE');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [speed] = useState<number>(450);
  const [showTheoryModal, setShowTheoryModal] = useState<boolean>(false);

  // Timer Ref
  const timerRef = useRef<number | null>(null);

  // Active channels pool
  const availableChannels = useMemo(
    () => getChannelsSubset(availableChannelsCount),
    [availableChannelsCount]
  );

  // Precomputed algorithm trace
  const trace: AlgorithmTraceResult = useMemo(() => {
    return generateBacktrackingTrace(nodes, edges, availableChannels);
  }, [nodes, edges, availableChannels]);

  // Current algorithm step
  const currentStep = useMemo(() => {
    if (!trace || trace.steps.length === 0) return null;
    const clampedIndex = Math.min(currentStepIndex, trace.steps.length - 1);
    return trace.steps[clampedIndex] || null;
  }, [trace, currentStepIndex]);

  // Current AP channel assignments
  const currentAssignments = useMemo(() => {
    if (!currentStep) {
      // Default initial assignments matching screenshot if idle
      const initial: Record<string, number | null> = {
        AP1: 1,
        AP2: 6,
        AP3: 11,
        AP4: 11,
        AP5: 6,
        AP6: 11,
      };
      return initial;
    }
    return currentStep.assignmentSnapshot;
  }, [currentStep]);

  // Confetti celebration
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#2563eb', '#10b981', '#a855f7'],
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

  // Controls Handlers
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

  // Generate Random Network
  const handleGenerateRandom = () => {
    handleReset();
    setSelectedPresetId(null);
    const generated = generateRandomNetwork(apCount);
    setNodes(generated.nodes);
    setEdges(generated.edges);
  };

  // Reposition node from drag
  const handleNodeMove = (id: string, x: number, y: number) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  };

  const activeVertexId = currentStep ? currentStep.currentVertex : null;
  const conflictingVertexId = currentStep?.conflictingVertex || null;
  const conflictingEdgeId = currentStep?.conflictingEdgeId || null;
  const isSolution = status === 'SOLUTION_FOUND';
  const isRunning = status === 'RUNNING';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#edf2f9' }}>
      {/* 1. Header Bar */}
      <Header
        onNavClick={(target) => {
          if (target === 'algorithm' || target === 'about') {
            setShowTheoryModal(true);
          }
        }}
      />

      {/* 2. Main Container with Grid Structure */}
      <main className="app-container">
        {/* Top Row: 3 Overview Cards */}
        <OverviewCards />

        {/* Middle Row: 3 Column Workstation */}
        <div className="middle-grid">
          {/* Column 1: Network Configuration Sidebar */}
          <SidebarConfig
            apCount={apCount}
            availableChannelsCount={availableChannelsCount}
            selectedPresetId={selectedPresetId}
            isRunning={isRunning}
            onSelectPreset={handleSelectPreset}
            onChangeApCount={handleChangeApCount}
            onChangeChannelsCount={handleChangeChannelsCount}
            onGenerateRandom={handleGenerateRandom}
            onStart={handleStart}
            onPause={handlePause}
            onReset={handleReset}
            onStep={handleStep}
          />

          {/* Column 2: Wi-Fi Network Graph */}
          <NetworkGraph
            nodes={nodes}
            edges={edges}
            currentStep={currentStep}
            currentAssignments={currentAssignments}
            activeVertexId={activeVertexId}
            conflictingEdgeId={conflictingEdgeId}
            conflictingVertexId={conflictingVertexId}
            isSolution={isSolution}
            onNodeMove={handleNodeMove}
          />

          {/* Column 3: Log (Top) & Backtracking Search Tree (Bottom) */}
          <div className="right-column">
            <AlgorithmVisualizationLog
              steps={trace.steps}
              currentStepIndex={currentStepIndex}
              isRunning={isRunning}
              isSolution={isSolution}
              isFailure={status === 'NO_SOLUTION'}
            />
            <BacktrackingSearchTree currentStep={currentStep} />
          </div>
        </div>

        {/* Bottom Row: 3 Metric Cards */}
        <BottomMetrics
          nodes={nodes}
          availableChannelsCount={availableChannelsCount}
          currentAssignments={currentAssignments}
          stepCount={currentStep?.stats.steps || 14}
          backtrackCount={currentStep?.stats.backtracks || 2}
        />
      </main>

      {/* DAA Theory Modal Dialog */}
      {showTheoryModal && (
        <div className="modal-overlay" onClick={() => setShowTheoryModal(false)}>
          <div className="modal-content-box" onClick={(e) => e.stopPropagation()}>
            <ComplexityExplanation onClose={() => setShowTheoryModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
