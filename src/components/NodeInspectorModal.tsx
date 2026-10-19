import React from 'react';
import { X, Trash2, Radio, Sliders, MapPin, Link as LinkIcon, Unlink } from 'lucide-react';
import { AccessPoint, InterferenceEdge } from '../types';
import { getChannelByNumber } from '../constants/channels';

interface NodeInspectorModalProps {
  node: AccessPoint;
  edges: InterferenceEdge[];
  allNodes: AccessPoint[];
  currentAssignment: number | null;
  onUpdate: (updated: AccessPoint) => void;
  onDelete: (id: string) => void;
  onToggleEdge: (source: string, target: string) => void;
  onClose: () => void;
}

export const NodeInspectorModal: React.FC<NodeInspectorModalProps> = ({
  node,
  edges,
  allNodes,
  currentAssignment,
  onUpdate,
  onDelete,
  onToggleEdge,
  onClose,
}) => {
  const channelMeta = getChannelByNumber(currentAssignment);

  // Neighbors of this node
  const neighborIds = edges
    .filter((e) => e.source === node.id || e.target === node.id)
    .map((e) => (e.source === node.id ? e.target : e.source));

  return (
    <div className="node-inspector-overlay" onClick={onClose}>
      <div className="node-inspector-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="inspector-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="inspector-icon-bubble">
              <Radio size={16} color="#2563eb" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 className="inspector-title">{node.id} Configuration</h3>
                {channelMeta ? (
                  <span
                    className="inspector-ch-badge"
                    style={{ backgroundColor: channelMeta.lightColor, color: channelMeta.color }}
                  >
                    {channelMeta.label}
                  </span>
                ) : (
                  <span className="inspector-ch-badge-unassigned">Unassigned</span>
                )}
              </div>
              <span className="inspector-subtitle">Position: ({Math.round(node.x)}, {Math.round(node.y)})</span>
            </div>
          </div>
          <button onClick={onClose} className="inspector-close-btn">
            <X size={15} />
          </button>
        </div>

        {/* Form Body */}
        <div className="inspector-body">
          {/* 1. Location / Room Name */}
          <div className="inspector-field">
            <label className="inspector-label">
              <MapPin size={12} />
              <span>Room / Location Name</span>
            </label>
            <input
              type="text"
              value={node.locationName}
              onChange={(e) => onUpdate({ ...node, locationName: e.target.value })}
              className="inspector-input"
              placeholder="e.g. Conference Room A"
            />
          </div>

          {/* 2. Coverage Radius */}
          <div className="inspector-field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="inspector-label">
                <Sliders size={12} />
                <span>Wi-Fi Coverage Radius</span>
              </label>
              <span className="radius-val-tag">{node.coverageRadius || 90} px</span>
            </div>
            <input
              type="range"
              min={50}
              max={160}
              step={5}
              value={node.coverageRadius || 90}
              onChange={(e) => onUpdate({ ...node, coverageRadius: Number(e.target.value) })}
              className="inspector-slider"
            />
            <span className="field-hint">Defines physical wireless signal reach and interference zone boundary.</span>
          </div>

          {/* 3. Frequency Band */}
          <div className="inspector-field">
            <label className="inspector-label">Frequency Band</label>
            <div className="band-toggle-group">
              <button
                type="button"
                className={`band-btn ${node.frequencyBand === '2.4GHz' || !node.frequencyBand ? 'band-btn-active' : ''}`}
                onClick={() => onUpdate({ ...node, frequencyBand: '2.4GHz' })}
              >
                2.4 GHz (Standard)
              </button>
              <button
                type="button"
                className={`band-btn ${node.frequencyBand === '5GHz' ? 'band-btn-active' : ''}`}
                onClick={() => onUpdate({ ...node, frequencyBand: '5GHz' })}
              >
                5 GHz (High Speed)
              </button>
            </div>
          </div>

          {/* 4. Interference Links (Toggle edges with other APs) */}
          <div className="inspector-field">
            <label className="inspector-label">
              <LinkIcon size={12} />
              <span>Interfering Neighbors ({neighborIds.length})</span>
            </label>
            <div className="neighbor-toggle-list">
              {allNodes
                .filter((other) => other.id !== node.id)
                .map((other) => {
                  const isConnected = neighborIds.includes(other.id);
                  return (
                    <button
                      key={other.id}
                      type="button"
                      onClick={() => onToggleEdge(node.id, other.id)}
                      className={`neighbor-chip ${isConnected ? 'chip-connected' : 'chip-disconnected'}`}
                      title={isConnected ? `Disconnect interference from ${other.id}` : `Add interference constraint with ${other.id}`}
                    >
                      {isConnected ? <Unlink size={11} /> : <LinkIcon size={11} />}
                      <span>{other.id} ({other.locationName})</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="inspector-footer">
          <button
            type="button"
            onClick={() => {
              onDelete(node.id);
              onClose();
            }}
            className="inspector-delete-btn"
          >
            <Trash2 size={13} />
            <span>Delete Access Point</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inspector-save-btn"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
