import { AccessPoint, InterferenceEdge, WiFiChannel, AlgorithmStep, TreeNodeData } from '../types';
import { buildAdjacencyList } from '../utils/graphGenerator';

export interface AlgorithmTraceResult {
  steps: AlgorithmStep[];
  treeNodes: Record<string, TreeNodeData>;
  rootTreeNodeId: string | null;
  solutionFound: boolean;
  finalAssignment: Record<string, number | null>;
  totalConflicts: number;
  totalBacktracks: number;
  totalSearchSteps: number;
}

export function generateBacktrackingTrace(
  nodes: AccessPoint[],
  edges: InterferenceEdge[],
  availableChannels: WiFiChannel[]
): AlgorithmTraceResult {
  const steps: AlgorithmStep[] = [];
  const treeNodes: Record<string, TreeNodeData> = {};
  const adj = buildAdjacencyList(nodes, edges);

  const assignment: Record<string, number | null> = {};
  nodes.forEach((n) => {
    assignment[n.id] = null;
  });

  let conflictCount = 0;
  let backtrackCount = 0;
  let stepIndex = 0;
  let nodeCounter = 0;

  // Root tree node (represents start before any assignment)
  const rootId = 'root';
  treeNodes[rootId] = {
    id: rootId,
    parentId: null,
    vertexId: 'Start',
    channelNumber: 0,
    channelLabel: 'Root',
    status: 'exploring',
    depth: 0,
    stepIndex: 0,
    children: [],
  };

  // Helper to record a step
  const recordStep = (
    type: AlgorithmStep['type'],
    currentVertex: string,
    tryingChannel: number | null,
    treeNodeId: string,
    parentTreeNodeId: string | null,
    depth: number,
    description: string,
    detailedReason: string,
    conflictingVertex: string | null = null,
    conflictingEdgeId: string | null = null
  ) => {
    stepIndex++;
    const usedChannels = new Set(
      Object.values(assignment).filter((c): c is number => c !== null)
    ).size;

    steps.push({
      stepNumber: stepIndex,
      type,
      currentVertex,
      tryingChannel,
      conflictingVertex,
      conflictingEdgeId,
      assignmentSnapshot: { ...assignment },
      description,
      detailedReason,
      treeNodeId,
      parentTreeNodeId,
      depth,
      stats: {
        steps: stepIndex,
        conflicts: conflictCount,
        backtracks: backtrackCount,
        channelsUsed: usedChannels,
      },
    });
  };

  // Initial step
  recordStep(
    'INIT',
    nodes.length > 0 ? nodes[0].id : '',
    null,
    rootId,
    null,
    0,
    `Initializing Backtracking algorithm for ${nodes.length} Access Points with ${availableChannels.length} available channels.`,
    `Each AP is an uncolored vertex. Edges represent wireless interference constraints where adjacent APs cannot share the same channel frequency.`
  );

  // Checks if assigning channelNumber to vertexId conflicts with any already colored neighbor
  function checkSafety(vertexId: string, channelNumber: number): { safe: boolean; conflictingWith: string | null; edgeId: string | null } {
    const neighbors = adj.get(vertexId) || [];
    for (const neighborId of neighbors) {
      if (assignment[neighborId] === channelNumber) {
        const edgeId = `${vertexId}-${neighborId}`;
        const altEdgeId = `${neighborId}-${vertexId}`;
        const matchedEdge = edges.find((e) => e.id === edgeId || e.id === altEdgeId);
        return {
          safe: false,
          conflictingWith: neighborId,
          edgeId: matchedEdge ? matchedEdge.id : edgeId,
        };
      }
    }
    return { safe: true, conflictingWith: null, edgeId: null };
  }

  // Recursive backtracking function
  function solve(vertexIdx: number, parentNodeId: string): boolean {
    // Base case: all vertices colored
    if (vertexIdx >= nodes.length) {
      return true;
    }

    const currentAP = nodes[vertexIdx];
    const depth = vertexIdx + 1;

    recordStep(
      'SELECT_VERTEX',
      currentAP.id,
      null,
      parentNodeId,
      parentNodeId,
      depth,
      `Selected ${currentAP.id} (${currentAP.locationName}) for channel allocation.`,
      `Examining available channels [${availableChannels.map((c) => `Ch ${c.channelNumber}`).join(', ')}] in order.`
    );

    for (let c = 0; c < availableChannels.length; c++) {
      const channel = availableChannels[c];
      nodeCounter++;
      const currentTreeNodeId = `node_${currentAP.id}_ch${channel.channelNumber}_${nodeCounter}`;

      // Create tree node
      treeNodes[currentTreeNodeId] = {
        id: currentTreeNodeId,
        parentId: parentNodeId,
        vertexId: currentAP.id,
        channelNumber: channel.channelNumber,
        channelLabel: `Ch ${channel.channelNumber}`,
        status: 'exploring',
        depth,
        stepIndex: stepIndex + 1,
        children: [],
      };
      if (treeNodes[parentNodeId]) {
        treeNodes[parentNodeId].children.push(currentTreeNodeId);
      }

      recordStep(
        'TRY_CHANNEL',
        currentAP.id,
        channel.channelNumber,
        currentTreeNodeId,
        parentNodeId,
        depth,
        `Testing Channel ${channel.channelNumber} (${channel.frequencyGhz}) for ${currentAP.id}.`,
        `Verifying co-channel interference constraints with interfering neighbors of ${currentAP.id}.`
      );

      const safety = checkSafety(currentAP.id, channel.channelNumber);

      if (safety.safe) {
        // Channel is safe
        assignment[currentAP.id] = channel.channelNumber;
        treeNodes[currentTreeNodeId].status = 'safe';

        recordStep(
          'SAFE_ASSIGNMENT',
          currentAP.id,
          channel.channelNumber,
          currentTreeNodeId,
          parentNodeId,
          depth,
          `Channel ${channel.channelNumber} is safe for ${currentAP.id}. No adjacent AP shares this channel.`,
          `Proceeding recursively to next Access Point in sequence.`
        );

        // Recurse to next vertex
        const success = solve(vertexIdx + 1, currentTreeNodeId);

        if (success) {
          treeNodes[currentTreeNodeId].status = 'solution';
          return true;
        }

        // Child could not find solution, backtrack
        backtrackCount++;
        assignment[currentAP.id] = null;
        treeNodes[currentTreeNodeId].status = 'backtracked';

        recordStep(
          'BACKTRACK',
          currentAP.id,
          channel.channelNumber,
          currentTreeNodeId,
          parentNodeId,
          depth,
          `Backtracking from ${currentAP.id}. Removing Channel ${channel.channelNumber} assignment.`,
          `Subsequent APs could not reach a valid configuration with ${currentAP.id}=Ch${channel.channelNumber}. Reverting decision and trying next channel.`
        );
      } else {
        // Conflict detected
        conflictCount++;
        treeNodes[currentTreeNodeId].status = 'conflict';
        treeNodes[currentTreeNodeId].conflictingWith = safety.conflictingWith!;

        recordStep(
          'CONFLICT_DETECTED',
          currentAP.id,
          channel.channelNumber,
          currentTreeNodeId,
          parentNodeId,
          depth,
          `Conflict detected! Channel ${channel.channelNumber} interferes with adjacent ${safety.conflictingWith}.`,
          `Both ${currentAP.id} and ${safety.conflictingWith} are within interference range (${safety.edgeId}). Channel ${channel.channelNumber} cannot be assigned here.`,
          safety.conflictingWith,
          safety.edgeId
        );
      }
    }

    // All channels for current vertex exhausted without finding continuation
    return false;
  }

  const solutionFound = solve(0, rootId);

  if (solutionFound) {
    // Mark final solution nodes in the tree
    let curr = steps[steps.length - 1]?.treeNodeId;
    while (curr && treeNodes[curr]) {
      treeNodes[curr].status = 'solution';
      curr = treeNodes[curr].parentId || '';
    }

    recordStep(
      'SUCCESS',
      nodes[nodes.length - 1]?.id || '',
      assignment[nodes[nodes.length - 1]?.id || ''] || null,
      steps[steps.length - 1]?.treeNodeId || rootId,
      null,
      nodes.length,
      `Valid channel allocation found! All ${nodes.length} Access Points assigned collision-free channels.`,
      `Verified: Every adjacent pair of APs in the interference graph operates on distinct wireless frequencies. Zero co-channel interference.`
    );
  } else {
    recordStep(
      'FAILURE',
      nodes[0]?.id || '',
      null,
      rootId,
      null,
      0,
      `No valid channel allocation exists with ${availableChannels.length} available channels for this network.`,
      `The backtracking algorithm explored all branches in the state-space decision tree. Chromatic number χ(G) of this network exceeds ${availableChannels.length}. Increase available channels to find a solution.`
    );
  }

  return {
    steps,
    treeNodes,
    rootTreeNodeId: rootId,
    solutionFound,
    finalAssignment: { ...assignment },
    totalConflicts: conflictCount,
    totalBacktracks: backtrackCount,
    totalSearchSteps: stepIndex,
  };
}
