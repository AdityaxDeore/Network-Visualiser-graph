import React from 'react';
import {
  Settings,
  Building,
  GraduationCap,
  Radio,
  PenTool,
  ChevronRight,
  ChevronUp,
  Eye,
  Share2,
  Tag,
  Box,
  Check,
  GitBranch,
} from 'lucide-react';
import { NetworkPreset } from '../types';
import { ALL_WIFI_CHANNELS } from '../constants/channels';
import { NETWORK_PRESETS } from '../constants/presets';

interface SidebarConfigProps {
  apCount: number;
  availableChannelsCount: number;
  selectedPresetId: string | null;
  isRunning: boolean;
  onSelectPreset: (preset: NetworkPreset) => void;
  onChangeApCount: (count: number) => void;
  onChangeChannelsCount: (count: number) => void;
  onGenerateRandom: () => void;
  speed?: number;
  onChangeSpeed?: (speed: number) => void;
  showCoverageArea: boolean;
  onToggleCoverageArea: (val: boolean) => void;
  showInterferenceLinks: boolean;
  onToggleInterferenceLinks: (val: boolean) => void;
  showRoomLabels: boolean;
  onToggleRoomLabels: (val: boolean) => void;
  is3DView: boolean;
  onToggle3DView: (val: boolean) => void;
  onCustomLayout?: () => void;
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
  speed = 400,
  onChangeSpeed,
  showCoverageArea,
  onToggleCoverageArea,
  showInterferenceLinks,
  onToggleInterferenceLinks,
  showRoomLabels,
  onToggleRoomLabels,
  is3DView,
  onToggle3DView,
  onCustomLayout,
}) => {
  const [isConfigCollapsed, setIsConfigCollapsed] = React.useState(false);

  const apOptions = [4, 5, 6, 7, 8, 10];
  const channelOptions = [2, 3, 4, 5, 6];

  const presets = [
    {
      id: 'small-office',
      name: 'Small Office',
      sub: '6 Access Points',
      icon: <Building size={16} className="preset-icon" />,
      count: 6,
      channels: 3,
    },
    {
      id: 'college-floor',
      name: 'College Floor',
      sub: '8 Access Points',
      icon: <GraduationCap size={16} className="preset-icon" />,
      count: 8,
      channels: 3,
    },
    {
      id: 'dense-network',
      name: 'Dense Network',
      sub: '10 Access Points',
      icon: <Radio size={16} className="preset-icon" />,
      count: 10,
      channels: 4,
    },
  ];

  return (
    <aside className="sidebar-config-card">
      {/* 1. Header with Gear & Collapse Chevron */}
      <div className="sidebar-header-row">
        <div className="sidebar-title-group">
          <Settings size={17} className="sidebar-gear-icon" />
          <h2 className="sidebar-main-title">Network Configuration</h2>
        </div>
        <button
          className="sidebar-collapse-btn"
          onClick={() => setIsConfigCollapsed(!isConfigCollapsed)}
        >
          <ChevronUp size={16} className={`sidebar-chevron ${isConfigCollapsed ? 'rotated' : ''}`} />
        </button>
      </div>

      {!isConfigCollapsed && (
        <div className="sidebar-body">
          {/* 2. Number of Access Points */}
          <div className="sidebar-control-group">
            <label className="sidebar-field-label">Number of Access Points</label>
            <div className="segmented-btn-group ap-btn-group">
              {apOptions.map((num) => (
                <button
                  key={num}
                  disabled={isRunning}
                  onClick={() => onChangeApCount(num)}
                  className={`segmented-btn ${apCount === num ? 'segmented-btn-active' : ''}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Number of Available Channels */}
          <div className="sidebar-control-group">
            <label className="sidebar-field-label">Number of Available Channels</label>
            <div className="segmented-btn-group ch-btn-group">
              {channelOptions.map((num) => (
                <button
                  key={num}
                  disabled={isRunning}
                  onClick={() => onChangeChannelsCount(num)}
                  className={`segmented-btn ${availableChannelsCount === num ? 'segmented-btn-active' : ''}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Channel Set Checklist */}
          <div className="sidebar-control-group">
            <label className="sidebar-field-label">Channel Set</label>
            <div className="channel-set-container">
              {ALL_WIFI_CHANNELS.map((ch, idx) => {
                const isSelected = idx < availableChannelsCount;
                return (
                  <div
                    key={ch.id}
                    className={`channel-checkbox-row ${isSelected ? 'channel-active' : 'channel-inactive'}`}
                    onClick={() => {
                      if (!isRunning && onChangeChannelsCount) {
                        onChangeChannelsCount(idx + 1);
                      }
                    }}
                  >
                    <div className={`custom-checkbox ${isSelected ? 'checked' : ''}`}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                    <span
                      className="channel-dot"
                      style={{
                        backgroundColor: isSelected ? ch.color : '#cbd5e1',
                      }}
                    />
                    <span className="channel-label-text">
                      {ch.label} <span className="channel-freq-text">({ch.frequencyGhz})</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Predefined Layouts */}
          <div className="sidebar-control-group">
            <div className="sidebar-section-title-row">
              <Building size={14} className="section-title-icon" />
              <span className="sidebar-section-title">Predefined Layouts</span>
            </div>

            <div className="preset-cards-list">
              {presets.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    disabled={isRunning}
                    onClick={() => {
                      const matched = NETWORK_PRESETS.find((p) => p.id === preset.id);
                      if (matched) onSelectPreset(matched);
                    }}
                    className={`preset-card-btn ${isSelected ? 'preset-card-selected' : ''}`}
                  >
                    <div className="preset-card-left">
                      <div className="preset-icon-container">{preset.icon}</div>
                      <div className="preset-text-container">
                        <div className="preset-name">{preset.name}</div>
                        <div className="preset-sub">{preset.sub}</div>
                      </div>
                    </div>
                    <ChevronRight size={15} className="preset-card-arrow" />
                  </button>
                );
              })}

              {/* Custom Layout Button */}
              <button
                disabled={isRunning}
                onClick={onCustomLayout || onGenerateRandom}
                className={`preset-card-btn ${selectedPresetId === null ? 'preset-card-selected' : ''}`}
              >
                <div className="preset-card-left">
                  <div className="preset-icon-container">
                    <PenTool size={16} className="preset-icon" />
                  </div>
                  <div className="preset-text-container">
                    <div className="preset-name">Custom Layout</div>
                    <div className="preset-sub">Draw your own</div>
                  </div>
                </div>
                <ChevronRight size={15} className="preset-card-arrow" />
              </button>
            </div>
          </div>

          {/* 6. Visualization Toggles */}
          <div className="sidebar-control-group">
            <label className="sidebar-field-label">Visualization</label>
            <div className="visualization-toggles-list">
              {/* Coverage Area */}
              <div className="viz-toggle-row">
                <div className="viz-toggle-left">
                  <Eye size={15} className="viz-toggle-icon" />
                  <span className="viz-toggle-label">Show Coverage Area</span>
                </div>
                <label className="switch-toggle">
                  <input
                    type="checkbox"
                    checked={showCoverageArea}
                    onChange={(e) => onToggleCoverageArea(e.target.checked)}
                  />
                  <span className="switch-slider round" />
                </label>
              </div>

              {/* Interference Links */}
              <div className="viz-toggle-row">
                <div className="viz-toggle-left">
                  <Share2 size={15} className="viz-toggle-icon" />
                  <span className="viz-toggle-label">Show Interference Links</span>
                </div>
                <label className="switch-toggle">
                  <input
                    type="checkbox"
                    checked={showInterferenceLinks}
                    onChange={(e) => onToggleInterferenceLinks(e.target.checked)}
                  />
                  <span className="switch-slider round" />
                </label>
              </div>

              {/* Room Labels */}
              <div className="viz-toggle-row">
                <div className="viz-toggle-left">
                  <Tag size={15} className="viz-toggle-icon" />
                  <span className="viz-toggle-label">Show Room Labels</span>
                </div>
                <label className="switch-toggle">
                  <input
                    type="checkbox"
                    checked={showRoomLabels}
                    onChange={(e) => onToggleRoomLabels(e.target.checked)}
                  />
                  <span className="switch-slider round" />
                </label>
              </div>

              {/* 3D View */}
              <div className="viz-toggle-row">
                <div className="viz-toggle-left">
                  <Box size={15} className="viz-toggle-icon" />
                  <span className="viz-toggle-label">3D View</span>
                </div>
                <label className="switch-toggle">
                  <input
                    type="checkbox"
                    checked={is3DView}
                    onChange={(e) => onToggle3DView(e.target.checked)}
                  />
                  <span className="switch-slider round" />
                </label>
              </div>
            </div>
          </div>

          {/* 7. Animation Speed */}
          <div className="sidebar-control-group">
            <label className="sidebar-field-label">Animation Speed</label>
            <div className="speed-slider-container">
              <span className="speed-label-text">Slow</span>
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={1050 - speed}
                onChange={(e) => onChangeSpeed && onChangeSpeed(1050 - parseInt(e.target.value, 10))}
                className="speed-slider-input"
              />
              <span className="speed-label-text">Fast</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
