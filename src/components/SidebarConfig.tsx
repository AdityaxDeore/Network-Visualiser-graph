import React from 'react';
import {
  Settings,
  Home,
  Building2,
  Network,
  Shuffle,
  Play,
  Pause,
  RotateCcw,
  StepForward,
  ChevronRight,
  Check,
} from 'lucide-react';
import { NetworkPreset } from '../types';
import { ALL_WIFI_CHANNELS } from '../constants/channels';

interface SidebarConfigProps {
  apCount: number;
  availableChannelsCount: number;
  selectedPresetId: string | null;
  isRunning: boolean;
  onSelectPreset: (preset: NetworkPreset) => void;
  onChangeApCount: (count: number) => void;
  onChangeChannelsCount: (count: number) => void;
  onGenerateRandom: () => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onStep: () => void;
}

export const SidebarConfig: React.FC<SidebarConfigProps> = ({
  apCount,
  availableChannelsCount,
  selectedPresetId,
  isRunning,
  onSelectPreset,
  onChangeApCount,
  onChangeChannelsCount,
  onGenerateRandom,
  onStart,
  onPause,
  onReset,
  onStep,
}) => {
  const apOptions = [4, 5, 6, 7, 8, 10];
  const channelOptions = [2, 3, 4, 5];

  const presets = [
    {
      id: 'small-office',
      name: 'Small Office',
      sub: '6 Access Points',
      icon: <Home size={15} color="#2563eb" />,
      count: 6,
      channels: 3,
    },
    {
      id: 'college-floor',
      name: 'College Floor',
      sub: '8 Access Points',
      icon: <Building2 size={15} color="#2563eb" />,
      count: 8,
      channels: 3,
    },
    {
      id: 'dense-network',
      name: 'Dense Network',
      sub: '10 Access Points',
      icon: <Network size={15} color="#2563eb" />,
      count: 10,
      channels: 4,
    },
  ];

  return (
    <div className="app-card" style={{ height: '100%', justifyContent: 'space-between' }}>
      <div>
        {/* Header */}
        <div className="card-title-row">
          <Settings size={16} color="#2563eb" />
          <h2 className="card-header-title">Network Configuration</h2>
        </div>
        <p className="sidebar-subtitle">Set up your Wi-Fi network parameters</p>

        {/* 1. Number of Access Points */}
        <div>
          <label className="sidebar-label">Number of Access Points</label>
          <div className="btn-group-ap">
            {apOptions.map((num) => (
              <button
                key={num}
                disabled={isRunning}
                onClick={() => onChangeApCount(num)}
                className={`btn-option ${apCount === num ? 'btn-option-active' : ''}`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Number of Available Channels */}
        <div>
          <label className="sidebar-label">Number of Available Channels</label>
          <div className="btn-group-ch">
            {channelOptions.map((num) => (
              <button
                key={num}
                disabled={isRunning}
                onClick={() => onChangeChannelsCount(num)}
                className={`btn-option ${availableChannelsCount === num ? 'btn-option-active' : ''}`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Channel Set */}
        <div>
          <label className="sidebar-label">Channel Set</label>
          <div className="channel-set-list">
            {ALL_WIFI_CHANNELS.map((ch, idx) => {
              const isChecked = idx < availableChannelsCount;
              return (
                <div
                  key={ch.id}
                  onClick={() => {
                    if (!isRunning) {
                      onChangeChannelsCount(Math.max(2, idx + 1));
                    }
                  }}
                  className="channel-check-item"
                >
                  <div
                    className={`check-box-square ${!isChecked ? 'check-box-inactive' : ''}`}
                    style={{ backgroundColor: isChecked ? ch.color : '#ffffff' }}
                  >
                    {isChecked && <Check size={11} strokeWidth={3} />}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#334155' }}>
                    {ch.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Predefined Examples */}
        <div>
          <label className="sidebar-label">Predefined Examples</label>
          <div className="preset-list">
            {presets.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => {
                    if (!isRunning) {
                      onChangeApCount(preset.count);
                      onChangeChannelsCount(preset.channels);
                    }
                  }}
                  className={`preset-card-item ${isSelected ? 'preset-card-selected' : ''}`}
                >
                  <div className="preset-left">
                    <div className="preset-icon-circle">{preset.icon}</div>
                    <div>
                      <div className="preset-text-main">{preset.name}</div>
                      <div className="preset-text-sub">{preset.sub}</div>
                    </div>
                  </div>
                  <ChevronRight size={14} color="#94a3b8" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Primary Action Buttons */}
      <div className="sidebar-actions">
        {/* Generate Random Network */}
        <button
          onClick={onGenerateRandom}
          disabled={isRunning}
          className="btn-generate-random"
        >
          <Shuffle size={14} />
          <span>Generate Random Network</span>
        </button>

        {/* Start / Pause Algorithm */}
        {isRunning ? (
          <button
            onClick={onPause}
            className="btn-start-algorithm"
            style={{ backgroundColor: '#f59e0b' }}
          >
            <Pause size={15} fill="#ffffff" />
            <span>Pause Algorithm</span>
          </button>
        ) : (
          <button
            onClick={onStart}
            className="btn-start-algorithm"
          >
            <Play size={15} fill="#ffffff" />
            <span>Start Algorithm</span>
          </button>
        )}

        {/* Reset & Step by Step row */}
        <div className="btn-row-dual">
          <button
            onClick={onReset}
            className="btn-secondary"
          >
            <RotateCcw size={13} color="#64748b" />
            <span>Reset</span>
          </button>
          <button
            onClick={onStep}
            disabled={isRunning}
            className="btn-secondary"
          >
            <StepForward size={13} color="#2563eb" />
            <span>Step by Step</span>
          </button>
        </div>
      </div>
    </div>
  );
};
