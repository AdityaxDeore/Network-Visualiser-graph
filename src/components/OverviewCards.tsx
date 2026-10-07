import React from 'react';
import { BookOpen, Wifi, Share2, Palette, AlertTriangle, RotateCcw, CheckCircle2 } from 'lucide-react';

export const OverviewCards: React.FC = () => {
  return (
    <div className="overview-grid">
      {/* 1. Project Overview */}
      <div className="app-card">
        <div className="card-title-row">
          <BookOpen size={16} color="#2563eb" />
          <h2 className="card-header-title">Project Overview</h2>
        </div>
        <p className="overview-desc">
          Multiple Wi-Fi Access Points operating near each other may interfere when they use conflicting channels. This model represents the wireless network as a graph and uses graph coloring with backtracking to assign channels while avoiding conflicts between interfering Access Points.
        </p>
      </div>

      {/* 2. Concept Mapping */}
      <div className="app-card">
        <div className="card-title-row">
          <h2 className="card-header-title">Concept Mapping</h2>
        </div>
        <div className="concept-grid">
          {/* Vertex */}
          <div className="concept-pill concept-pill-blue">
            <span className="cp-top">Vertex</span>
            <span className="cp-sub">Access Point</span>
          </div>
          {/* Edge */}
          <div className="concept-pill concept-pill-red">
            <span className="cp-top">Edge</span>
            <span className="cp-sub">Interference</span>
          </div>
          {/* Color */}
          <div className="concept-pill concept-pill-green">
            <span className="cp-top">Color</span>
            <span className="cp-sub">Wi-Fi Channel</span>
          </div>
        </div>
      </div>

      {/* 3. How it Works */}
      <div className="app-card">
        <div className="card-title-row">
          <h2 className="card-header-title">How it Works</h2>
        </div>
        <div className="workflow-pipeline">
          {/* Network */}
          <div className="workflow-step">
            <div className="workflow-icon-box">
              <Wifi size={14} color="#0284c7" />
            </div>
            <span className="workflow-label">Network</span>
          </div>

          <span className="workflow-arrow">→</span>

          {/* Graph */}
          <div className="workflow-step">
            <div className="workflow-icon-box">
              <Share2 size={14} color="#0284c7" />
            </div>
            <span className="workflow-label">Graph</span>
          </div>

          <span className="workflow-arrow">→</span>

          {/* Channel Assignment */}
          <div className="workflow-step">
            <div className="workflow-icon-box">
              <Palette size={14} color="#d97706" />
            </div>
            <span className="workflow-label">Channel<br/>Assignment</span>
          </div>

          <span className="workflow-arrow">→</span>

          {/* Conflict Detection */}
          <div className="workflow-step">
            <div className="workflow-icon-box">
              <AlertTriangle size={14} color="#e11d48" />
            </div>
            <span className="workflow-label">Conflict<br/>Detection</span>
          </div>

          <span className="workflow-arrow">→</span>

          {/* Backtracking */}
          <div className="workflow-step">
            <div className="workflow-icon-box">
              <RotateCcw size={14} color="#9333ea" />
            </div>
            <span className="workflow-label">Backtracking</span>
          </div>

          <span className="workflow-arrow">→</span>

          {/* Valid Allocation */}
          <div className="workflow-step">
            <div className="workflow-icon-box">
              <CheckCircle2 size={14} color="#16a34a" />
            </div>
            <span className="workflow-label">Valid<br/>Allocation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
