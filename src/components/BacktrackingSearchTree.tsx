import React from 'react';
import { GitBranch } from 'lucide-react';
import { AlgorithmStep } from '../types';

interface BacktrackingSearchTreeProps {
  currentStep: AlgorithmStep | null;
}

export const BacktrackingSearchTree: React.FC<BacktrackingSearchTreeProps> = () => {
  return (
    <div className="app-card" style={{ height: '100%' }}>
      {/* Header */}
      <div className="card-title-row">
        <GitBranch size={16} color="#2563eb" />
        <h2 className="card-header-title">Backtracking Search Tree</h2>
      </div>

      {/* Visual Tree */}
      <div className="tree-container-box">
        <svg viewBox="0 0 420 190" style={{ width: '100%', height: '100%', maxHeight: '185px' }}>
          {/* Connector Lines */}
          <line x1="210" y1="36" x2="135" y2="85" stroke="#475569" strokeWidth="1.8" />
          <line x1="210" y1="36" x2="285" y2="85" stroke="#475569" strokeWidth="1.8" />

          <line x1="135" y1="95" x2="105" y2="145" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3 3" />
          <line x1="135" y1="95" x2="165" y2="145" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3 3" />

          <line x1="285" y1="95" x2="255" y2="145" stroke="#475569" strokeWidth="1.5" />
          <line x1="285" y1="95" x2="315" y2="145" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* 1. Root Node: AP1 Ch 1 */}
          <circle cx="210" cy="28" r="23" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2.2" />
          <text x="210" y="25" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#1e1b4b">
            AP1
          </text>
          <text x="210" y="37" textAnchor="middle" fontSize="9" fontWeight="500" fill="#4338ca">
            Ch 1
          </text>

          {/* 2. Left Branch: AP2 Ch 1 (Conflict) */}
          <circle cx="135" cy="88" r="21" fill="#fee2e2" stroke="#ef4444" strokeWidth="2.2" />
          <text x="135" y="85" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#7f1d1d">
            AP2
          </text>
          <text x="135" y="96" textAnchor="middle" fontSize="8.5" fontWeight="500" fill="#b91c1c">
            Ch 1
          </text>
          {/* Red X marker */}
          <text x="166" y="92" fontSize="13" fontWeight="bold" fill="#ef4444">
            ✗
          </text>

          {/* 3. Right Branch: AP2 Ch 6 (Safe) */}
          <circle cx="285" cy="88" r="21" fill="#d1fae5" stroke="#10b981" strokeWidth="2.2" />
          <text x="285" y="85" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#064e3b">
            AP2
          </text>
          <text x="285" y="96" textAnchor="middle" fontSize="8.5" fontWeight="500" fill="#047857">
            Ch 6
          </text>
          {/* Green Check marker */}
          <text x="316" y="92" fontSize="13" fontWeight="bold" fill="#10b981">
            ✓
          </text>

          {/* 4. Dashed Grandchildren under left branch */}
          <circle cx="105" cy="150" r="16" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3 3" />
          <text x="105" y="148" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#475569">
            AP3
          </text>
          <text x="105" y="157" textAnchor="middle" fontSize="7.5" fill="#94a3b8">
            ...
          </text>

          <circle cx="165" cy="150" r="16" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3 3" />
          <text x="165" y="148" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#475569">
            AP3
          </text>
          <text x="165" y="157" textAnchor="middle" fontSize="7.5" fill="#94a3b8">
            ...
          </text>

          {/* 5. Grandchildren under right branch */}
          <circle cx="255" cy="150" r="18" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" />
          <text x="255" y="147" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1e3a8a">
            AP3
          </text>
          <text x="255" y="157" textAnchor="middle" fontSize="8" fontWeight="500" fill="#1d4ed8">
            Ch 1
          </text>

          <circle cx="315" cy="150" r="18" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3 3" />
          <text x="315" y="147" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#475569">
            AP3
          </text>
          <text x="315" y="157" textAnchor="middle" fontSize="8" fill="#64748b">
            Ch 11
          </text>
        </svg>
      </div>
    </div>
  );
};
