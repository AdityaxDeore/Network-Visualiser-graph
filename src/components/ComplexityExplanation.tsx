import React from 'react';
import { BookOpen, Cpu, Database, Network, X } from 'lucide-react';

interface ComplexityExplanationProps {
  onClose?: () => void;
}

export const ComplexityExplanation: React.FC<ComplexityExplanationProps> = ({ onClose }) => {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #cbd5e1',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      color: '#0f172a',
      fontFamily: 'var(--font-sans)',
      maxHeight: '85vh',
      overflowY: 'auto',
    }}>
      {/* Title */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '12px',
        marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#eff6ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <BookOpen size={18} color="#2563eb" />
          </div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Design & Analysis of Algorithms: Theory & Complexity
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '6px',
              border: 'none',
              background: '#f1f5f9',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Two Core Definitions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
        <div style={{
          padding: '12px',
          borderRadius: '10px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', marginBottom: '6px' }}>
            <Network size={14} />
            <span>What is Graph Coloring?</span>
          </div>
          <p style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5, margin: 0 }}>
            Graph coloring assigns a color to each vertex so that no two adjacent vertices share the same color. In this model, <strong>vertices</strong> represent Access Points and <strong>colors</strong> represent Wi-Fi channels.
          </p>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
            Constraint: ∀ (u, v) ∈ E, Channel(u) ≠ Channel(v)
          </div>
        </div>

        <div style={{
          padding: '12px',
          borderRadius: '10px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d97706', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', marginBottom: '6px' }}>
            <Cpu size={14} />
            <span>What is Backtracking?</span>
          </div>
          <p style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5, margin: 0 }}>
            Backtracking systematically explores potential channel assignments. If assigning a channel creates a conflict and all channels are exhausted, it steps back to the previous AP and tries alternative assignments.
          </p>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
            Prunes dead-end subtrees in state-space tree.
          </div>
        </div>
      </div>

      {/* Complexity Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
        {/* Time Complexity */}
        <div style={{
          padding: '12px',
          borderRadius: '10px',
          backgroundColor: '#fffbeb',
          border: '1px solid #fef3c7',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>Time Complexity</span>
            <span style={{
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              backgroundColor: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fde68a',
            }}>
              Worst-Case: O(mⁿ)
            </span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#78350f', marginBottom: '4px' }}>
            O(mⁿ) worst-case
          </div>
          <p style={{ fontSize: '11.5px', color: '#451a03', lineHeight: 1.45, margin: 0 }}>
            where <strong>m</strong> = available channels, and <strong>n</strong> = Access Points (vertices). Each AP can try up to m channels, creating a search tree with up to mⁿ paths.
          </p>
        </div>

        {/* Space Complexity */}
        <div style={{
          padding: '12px',
          borderRadius: '10px',
          backgroundColor: '#eff6ff',
          border: '1px solid #dbeafe',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>Space Complexity</span>
            <span style={{
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              border: '1px solid #bfdbfe',
            }}>
              O(n)
            </span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#1e3a8a', marginBottom: '4px' }}>
            O(n) recursion stack
          </div>
          <p style={{ fontSize: '11.5px', color: '#1e3a8a', lineHeight: 1.45, margin: 0 }}>
            The call stack depth equals <strong>n</strong> (one frame per Access Point). The channel state vector is size n, making total auxiliary space linear O(n).
          </p>
        </div>
      </div>

      {/* Backtracking Algorithm Pseudocode */}
      <div style={{
        padding: '12px',
        borderRadius: '10px',
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        color: '#f8fafc',
      }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
          DAA Backtracking Recursive Specification:
        </div>
        <pre style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11.5px',
          color: '#38bdf8',
          margin: 0,
          lineHeight: 1.45,
          overflowX: 'auto',
        }}>
{`function graphColoring(vertex):
    if all vertices are assigned:
        return true // valid allocation found

    for each channel c in availableChannels:
        if isValidChannel(vertex, c):
            assign channel c to vertex
            if graphColoring(nextVertex) == true:
                return true
            remove channel assignment (backtrack)

    return false // no valid channel found`}
        </pre>
      </div>
    </div>
  );
};
