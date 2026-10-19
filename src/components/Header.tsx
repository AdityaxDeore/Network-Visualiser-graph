import React from 'react';
import {
  Wifi,
  Play,
  Pause,
  StepForward,
  RotateCcw,
  Sun,
  Moon,
  ChevronDown,
  Layers,
  Network,
  Binary,
  BarChart3,
} from 'lucide-react';
import { NETWORK_PRESETS } from '../constants/presets';

interface HeaderProps {
  activeTab: 'simulation' | 'graph' | 'algorithm' | 'analysis';
  onTabChange: (tab: 'simulation' | 'graph' | 'algorithm' | 'analysis') => void;
  selectedPresetId: string | null;
  onSelectPresetId: (presetId: string) => void;
  isRunning: boolean;
  onRun: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  selectedPresetId,
  onSelectPresetId,
  isRunning,
  onRun,
  onPause,
  onStep,
  onReset,
  theme = 'light',
  onToggleTheme,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const selectedPreset = NETWORK_PRESETS.find((p) => p.id === selectedPresetId) || NETWORK_PRESETS[0];

  const presetLabels: Record<string, string> = {
    'small-office': 'Small Office',
    'college-floor': 'College Campus',
    'dense-network': 'Dense Network',
  };

  const currentLabel = selectedPresetId && presetLabels[selectedPresetId] 
    ? presetLabels[selectedPresetId] 
    : 'College Campus';

  return (
    <header className="lab-header">
      <div className="lab-header-inner">
        {/* Left: Branding */}
        <div className="lab-brand">
          <div className="lab-brand-icon">
            <Wifi size={20} strokeWidth={2.4} />
          </div>
          <div className="lab-brand-text">
            <h1 className="lab-title">Wi-Fi Channel Allocation Lab</h1>
            <p className="lab-subtitle">Graph Coloring with Backtracking</p>
          </div>
        </div>

        {/* Center: Pill Navigation Tabs */}
        <nav className="lab-nav-pill-container">
          <button
            onClick={() => onTabChange('simulation')}
            className={`lab-nav-pill ${activeTab === 'simulation' ? 'lab-nav-pill-active' : ''}`}
          >
            <Layers size={14} />
            <span>Simulation</span>
          </button>
          <button
            onClick={() => onTabChange('graph')}
            className={`lab-nav-pill ${activeTab === 'graph' ? 'lab-nav-pill-active' : ''}`}
          >
            <Network size={14} />
            <span>Graph View</span>
          </button>
          <button
            onClick={() => onTabChange('algorithm')}
            className={`lab-nav-pill ${activeTab === 'algorithm' ? 'lab-nav-pill-active' : ''}`}
          >
            <Binary size={14} />
            <span>Algorithm</span>
          </button>
          <button
            onClick={() => onTabChange('analysis')}
            className={`lab-nav-pill ${activeTab === 'analysis' ? 'lab-nav-pill-active' : ''}`}
          >
            <BarChart3 size={14} />
            <span>Analysis</span>
          </button>
        </nav>

        {/* Right: Actions */}
        <div className="lab-actions">
          {/* Theme Toggle Button */}
          <button
            className="lab-icon-btn"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {/* Scenario Dropdown */}
          <div className="lab-dropdown-wrapper">
            <button
              className="lab-dropdown-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span>{currentLabel}</span>
              <ChevronDown size={14} className="lab-dropdown-chevron" />
            </button>

            {dropdownOpen && (
              <div className="lab-dropdown-menu">
                {NETWORK_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    className={`lab-dropdown-item ${selectedPresetId === preset.id ? 'active' : ''}`}
                    onClick={() => {
                      onSelectPresetId(preset.id);
                      setDropdownOpen(false);
                    }}
                  >
                    {presetLabels[preset.id] || preset.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Run / Pause Button (Solid Blue) */}
          <button
            className="lab-btn lab-btn-primary"
            onClick={isRunning ? onPause : onRun}
          >
            {isRunning ? (
              <>
                <Pause size={14} fill="currentColor" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" />
                <span>Run</span>
              </>
            )}
          </button>

          {/* Step Button (Outline) */}
          <button
            className="lab-btn lab-btn-secondary"
            onClick={onStep}
            disabled={isRunning}
          >
            <StepForward size={14} />
            <span>Step</span>
          </button>

          {/* Reset Button (Outline) */}
          <button
            className="lab-btn lab-btn-secondary"
            onClick={onReset}
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
