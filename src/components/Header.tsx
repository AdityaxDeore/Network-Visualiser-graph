import React from 'react';
import { Wifi, Home, Code, Grid, Eye, Info } from 'lucide-react';

interface HeaderProps {
  onNavClick?: (target: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavClick }) => {
  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Left Branding */}
        <div className="brand-wrapper">
          <div className="brand-icon-circle">
            <Wifi size={20} />
          </div>
          <div>
            <div className="brand-title">Virtual Wi-Fi Channel Allocation Model</div>
            <div className="brand-subrow">
              <span className="brand-subtitle">Graph Coloring with Backtracking</span>
              <span className="brand-badge">DAA Algorithm Visualization</span>
            </div>
          </div>
        </div>

        {/* Right Navigation */}
        <nav className="header-nav">
          <button
            onClick={() => onNavClick?.('home')}
            className="nav-btn nav-btn-active"
          >
            <Home size={14} />
            <span>Home</span>
          </button>
          <button
            onClick={() => onNavClick?.('algorithm')}
            className="nav-btn"
          >
            <Code size={14} />
            <span>Algorithm</span>
          </button>
          <button
            onClick={() => onNavClick?.('examples')}
            className="nav-btn"
          >
            <Grid size={14} />
            <span>Examples</span>
          </button>
          <button
            onClick={() => onNavClick?.('visualization')}
            className="nav-btn"
          >
            <Eye size={14} />
            <span>Visualization</span>
          </button>
          <button
            onClick={() => onNavClick?.('about')}
            className="nav-btn"
          >
            <Info size={14} />
            <span>About</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
