import React from 'react';
import { NetworkPreset, WiFiChannel } from '../types';
import { NETWORK_PRESETS } from '../constants/presets';
import { ALL_WIFI_CHANNELS } from '../constants/channels';
import { Sliders, Dices, Layers, Network } from 'lucide-react';

interface ConfigPanelProps {
  apCount: number;
  availableChannelsCount: number;
  selectedPresetId: string | null;
  onSelectPreset: (preset: NetworkPreset) => void;
  onChangeApCount: (count: number) => void;
  onChangeChannelsCount: (count: number) => void;
  onGenerateRandom: () => void;
  disabled: boolean;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  apCount,
  availableChannelsCount,
  selectedPresetId,
  onSelectPreset,
  onChangeApCount,
  onChangeChannelsCount,
  onGenerateRandom,
  disabled,
}) => {
  const apOptions = [4, 5, 6, 7, 8, 10];
  const channelOptions = [2, 3, 4, 5];

  const activeChannels: WiFiChannel[] = ALL_WIFI_CHANNELS.slice(0, availableChannelsCount);

  return (
    <div className="bg-slate-900 border border-slate-750 rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-bold text-slate-200">Network Simulation Configuration</h2>
        </div>
        <span className="text-[11px] font-mono text-slate-500">Virtual Model • Simulated Topology</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Predefined Scenarios */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 text-indigo-400" />
            Predefined Benchmark Networks:
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {NETWORK_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  disabled={disabled}
                  onClick={() => onSelectPreset(preset)}
                  className={`text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-sky-950/80 border-sky-500 text-sky-200 shadow-sm'
                      : 'bg-slate-850 hover:bg-slate-800 border-slate-750 text-slate-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{preset.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {preset.apCount} APs • Rec: {preset.recommendedChannels} Ch
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">{preset.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Access Point Count & Channels Selector */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                Access Points (Vertices V):
              </label>
              <span className="text-xs font-mono font-bold text-sky-400">{apCount} APs</span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {apOptions.map((count) => (
                <button
                  key={count}
                  disabled={disabled}
                  onClick={() => onChangeApCount(count)}
                  className={`py-1.5 text-xs font-bold rounded border transition-colors ${
                    apCount === count
                      ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                      : 'bg-slate-850 hover:bg-slate-800 border-slate-750 text-slate-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Available Channels (Colors C):
              </label>
              <span className="text-xs font-mono font-bold text-emerald-400">{availableChannelsCount} Channels</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {channelOptions.map((count) => (
                <button
                  key={count}
                  disabled={disabled}
                  onClick={() => onChangeChannelsCount(count)}
                  className={`py-1.5 text-xs font-bold rounded border transition-colors ${
                    availableChannelsCount === count
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                      : 'bg-slate-850 hover:bg-slate-800 border-slate-750 text-slate-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {count} Ch
                </button>
              ))}
            </div>
            {availableChannelsCount === 2 && (
              <p className="text-[10px] text-amber-400/90 mt-1.5 font-medium">
                Tip: 2 channels is ideal to trigger chromatic conflicts & backtracking on non-bipartite topologies!
              </p>
            )}
          </div>
        </div>

        {/* 3. Active Channels Display & Random Generator */}
        <div className="space-y-3 flex flex-col justify-between">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Channels in Pool (Standard 802.11):
            </label>
            <div className="flex flex-col gap-1.5">
              {activeChannels.map((ch) => (
                <div
                  key={ch.id}
                  className="flex items-center justify-between px-2.5 py-1 rounded bg-slate-850 border border-slate-750 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ch.color }} />
                    <span className="font-semibold text-slate-200">{ch.label}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {ch.frequencyGhz} ({ch.band})
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            disabled={disabled}
            onClick={onGenerateRandom}
            className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Dices className="w-4 h-4 text-sky-400" />
            Generate Random Network ({apCount} APs)
          </button>
        </div>
      </div>
    </div>
  );
};
