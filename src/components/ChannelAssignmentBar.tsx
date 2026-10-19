import React from 'react';
import { Radio } from 'lucide-react';
import { AccessPoint } from '../types';
import { getChannelByNumber } from '../constants/channels';

interface ChannelAssignmentBarProps {
  nodes: AccessPoint[];
  currentAssignments: Record<string, number | null>;
  activeVertexId: string | null;
  tryingChannel: number | null;
}

export const ChannelAssignmentBar: React.FC<ChannelAssignmentBarProps> = ({
  nodes,
  currentAssignments,
  activeVertexId,
  tryingChannel,
}) => {
  const sortedNodes = React.useMemo(() => {
    return [...nodes].sort((a, b) => {
      const numA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });
  }, [nodes]);

  return (
    <div className="channel-assignment-card">
      <div className="channel-assignment-header">
        <Radio size={16} className="channel-assignment-icon" />
        <h3 className="channel-assignment-title">Channel Assignment</h3>
      </div>

      <div className="channel-cards-row">
        {sortedNodes.map((node) => {
          const isTrying = activeVertexId === node.id && tryingChannel !== null;
          const assignedNum = isTrying ? tryingChannel : currentAssignments[node.id];
          const channelMeta = getChannelByNumber(assignedNum);

          const dotColor = channelMeta ? channelMeta.color : '#94a3b8';
          const channelText = channelMeta ? channelMeta.label : 'Unassigned';
          const freqText = channelMeta ? `(${channelMeta.frequencyGhz})` : '(— GHz)';

          return (
            <div
              key={node.id}
              className={`ap-assignment-card ${isTrying ? 'trying-active' : ''} ${
                assignedNum ? 'assigned' : ''
              }`}
            >
              <div className="ap-card-top-row">
                <span className="ap-card-id">{node.label || node.id}</span>
                <span className="ap-card-location">{node.locationName}</span>
              </div>
              <div className="ap-card-bottom-row">
                <span className="ap-card-dot" style={{ backgroundColor: dotColor }} />
                <span className="ap-card-channel-label">{channelText}</span>
                <span className="ap-card-freq-label">{freqText}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
