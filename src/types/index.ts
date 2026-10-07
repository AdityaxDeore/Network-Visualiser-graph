export interface AccessPoint {
  id: string; // e.g., 'AP1', 'AP2'
  label: string; // e.g., 'AP1 (Reception)'
  locationName: string;
  x: number;
  y: number;
  channelId: number | null; // null if unassigned
  coverageRadius: number; // in px for visualization
  frequencyBand?: '2.4GHz' | '5GHz';
}

export interface InterferenceEdge {
  id: string; // e.g., 'AP1-AP2'
  source: string;
  target: string;
  distance?: number;
}

export interface WiFiChannel {
  id: number;
  channelNumber: number; // 1, 6, 11, 36, 44
  label: string; // "Channel 1"
  frequencyGhz: string; // "2.412 GHz"
  band: '2.4 GHz' | '5 GHz';
  color: string; // Hex color for nodes
  lightColor: string; // For badges/backgrounds
  borderColor: string;
  textColor: string;
}

export type StepActionType =
  | 'INIT'
  | 'SELECT_VERTEX'
  | 'TRY_CHANNEL'
  | 'CHECK_CONFLICT'
  | 'CONFLICT_DETECTED'
  | 'SAFE_ASSIGNMENT'
  | 'RECURSE'
  | 'BACKTRACK'
  | 'SUCCESS'
  | 'FAILURE';

export interface AlgorithmStep {
  stepNumber: number;
  type: StepActionType;
  currentVertex: string; // AP ID e.g., 'AP3'
  tryingChannel: number | null; // channel number e.g., 6 or null
  conflictingVertex?: string | null; // AP ID with conflict e.g. 'AP2'
  conflictingEdgeId?: string | null; // e.g., 'AP2-AP3'
  assignmentSnapshot: Record<string, number | null>; // AP ID -> channelNumber
  description: string;
  detailedReason: string;
  treeNodeId: string;
  parentTreeNodeId: string | null;
  depth: number;
  stats: {
    steps: number;
    conflicts: number;
    backtracks: number;
    channelsUsed: number;
  };
}

export interface TreeNodeData {
  id: string;
  parentId: string | null;
  vertexId: string;
  channelNumber: number;
  channelLabel: string;
  status: 'exploring' | 'safe' | 'conflict' | 'backtracked' | 'solution';
  depth: number;
  stepIndex: number;
  conflictingWith?: string;
  children: string[];
}

export type AlgorithmStateStatus =
  | 'IDLE'
  | 'RUNNING'
  | 'PAUSED'
  | 'STEPPING'
  | 'SOLUTION_FOUND'
  | 'NO_SOLUTION';

export interface NetworkPreset {
  id: string;
  name: string;
  description: string;
  apCount: number;
  recommendedChannels: number;
  nodes: AccessPoint[];
  edges: InterferenceEdge[];
}
