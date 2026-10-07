import React from 'react';
import { Play, Pause, StepForward, RotateCcw, Dices, Gauge } from 'lucide-react';
import { AlgorithmStateStatus } from '../types';

interface AlgorithmControlsProps {
  status: AlgorithmStateStatus;
  currentStepIndex: number;
  totalSteps: number;
  speed: number; // ms per step
  onStart: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onGenerateNew: () => void;
  onChangeSpeed: (speedMs: number) => void;
  onSeekStep: (stepNumber: number) => void;
}

export const AlgorithmControls: React.FC<AlgorithmControlsProps> = ({
  status,
  currentStepIndex,
  totalSteps,
  speed,
  onStart,
  onPause,
  onStep,
  onReset,
  onGenerateNew,
  onChangeSpeed,
  onSeekStep,
}) => {
  const isRunning = status === 'RUNNING';
  const isFinished = status === 'SOLUTION_FOUND' || status === 'NO_SOLUTION';

  return (
    <div className="bg-slate-900 border border-slate-750 rounded-xl p-4 shadow-sm flex flex-col gap-3">
      {/* Primary Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Execution Buttons */}
        <div className="flex items-center gap-2">
          {/* Start / Pause */}
          {isRunning ? (
            <button
              onClick={onPause}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-lg shadow-sm transition active:scale-95"
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
          ) : (
            <button
              onClick={onStart}
              disabled={isFinished && currentStepIndex >= totalSteps}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-xs rounded-lg shadow-sm transition active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              {currentStepIndex > 0 && !isFinished ? 'Resume' : 'Start'}
            </button>
          )}

          {/* Step Button */}
          <button
            onClick={onStep}
            disabled={isRunning || (isFinished && currentStepIndex >= totalSteps)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-xs rounded-lg shadow-sm transition active:scale-95"
            title="Execute exactly one recursive backtracking step"
          >
            <StepForward className="w-4 h-4" />
            Step
          </button>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-medium text-xs rounded-lg border border-slate-700 transition active:scale-95"
            title="Reset to uncolored graph and clear trace"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>

          {/* Generate New Network */}
          <button
            onClick={onGenerateNew}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 disabled:opacity-50 text-slate-300 font-medium text-xs rounded-lg border border-slate-700 transition"
          >
            <Dices className="w-4 h-4 text-sky-400" />
            Generate New Network
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-2 bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-750 text-xs">
          <Gauge className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 font-medium">Speed:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onChangeSpeed(1000)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                speed === 1000
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
              }`}
            >
              Slow
            </button>
            <button
              onClick={() => onChangeSpeed(450)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                speed === 450
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => onChangeSpeed(120)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                speed === 120
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
              }`}
            >
              Fast
            </button>
            <button
              onClick={() => onChangeSpeed(10)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                speed === 10
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
              }`}
            >
              Instant
            </button>
          </div>
        </div>
      </div>

      {/* Step Scrubber / Progress Bar */}
      <div className="flex items-center gap-3 pt-1 border-t border-slate-800">
        <span className="text-xs font-mono font-medium text-slate-400 whitespace-nowrap">
          Step {currentStepIndex} / {totalSteps}
        </span>
        <input
          type="range"
          min="0"
          max={totalSteps}
          value={currentStepIndex}
          disabled={isRunning}
          onChange={(e) => onSeekStep(Number(e.target.value))}
          className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
        />
        <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
          {totalSteps > 0 ? Math.round((currentStepIndex / totalSteps) * 100) : 0}%
        </span>
      </div>
    </div>
  );
};
