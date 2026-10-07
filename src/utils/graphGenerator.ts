import { AccessPoint, InterferenceEdge } from '../types';

export function buildAdjacencyList(nodes: AccessPoint[], edges: InterferenceEdge[]): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  nodes.forEach((node) => adj.set(node.id, []));

  edges.forEach((edge) => {
    if (adj.has(edge.source) && adj.has(edge.target)) {
      if (!adj.get(edge.source)!.includes(edge.target)) {
        adj.get(edge.source)!.push(edge.target);
      }
      if (!adj.get(edge.target)!.includes(edge.source)) {
        adj.get(edge.target)!.push(edge.source);
      }
    }
  });

  return adj;
}

export function generateRandomNetwork(apCount: number, width: number = 600, height: number = 420): {
  nodes: AccessPoint[];
  edges: InterferenceEdge[];
} {
  const nodes: AccessPoint[] = [];
  const edges: InterferenceEdge[] = [];
  const padding = 70;

  // Generate node positions with minimum separation to look clean & readable
  const minDistance = apCount <= 6 ? 120 : 90;
  const roomNames = [
    'Main Lobby',
    'Auditorium',
    'Faculty Hall',
    'Software Lab',
    'Data Center',
    'Library Hall',
    'Seminar Wing',
    'Research Pod',
    'IoT Workstation',
    'Cafeteria Hub',
  ];

  for (let i = 1; i <= apCount; i++) {
    const id = `AP${i}`;
    let x = 0;
    let y = 0;
    let attempts = 0;
    let valid = false;

    // Use structured grid with slight jitter or rejection sampling
    if (apCount <= 6) {
      // 2 rows layout
      const cols = Math.ceil(apCount / 2);
      const row = Math.floor((i - 1) / cols);
      const col = (i - 1) % cols;
      const xSpacing = (width - padding * 2) / Math.max(cols - 1, 1);
      const ySpacing = (height - padding * 2);
      x = padding + col * xSpacing + (Math.random() * 20 - 10);
      y = padding + row * ySpacing + (Math.random() * 20 - 10);
    } else {
      while (attempts < 100 && !valid) {
        attempts++;
        x = padding + Math.floor(Math.random() * (width - padding * 2));
        y = padding + Math.floor(Math.random() * (height - padding * 2));
        valid = nodes.every((n) => {
          const dx = n.x - x;
          const dy = n.y - y;
          return Math.sqrt(dx * dx + dy * dy) >= minDistance;
        });
      }
      if (!valid) {
        // Fallback to elliptical layout
        const angle = ((i - 1) / apCount) * 2 * Math.PI;
        x = width / 2 + (width / 2.5 - padding) * Math.cos(angle);
        y = height / 2 + (height / 2.5 - padding) * Math.sin(angle);
      }
    }

    nodes.push({
      id,
      label: id,
      locationName: roomNames[i - 1] || `Zone ${i}`,
      x: Math.round(x),
      y: Math.round(y),
      channelId: null,
      coverageRadius: apCount <= 6 ? 100 : 85,
      frequencyBand: i % 2 === 0 ? '5GHz' : '2.4GHz',
    });
  }

  // Generate interference edges based on proximity (simulating wireless interference distance)
  // Target average degree around 2.5 to 3.5 for good backtracking demonstration
  const interferenceThreshold = apCount <= 5 ? 200 : apCount <= 8 ? 175 : 155;
  const edgeSet = new Set<string>();

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const u = nodes[i];
      const v = nodes[j];
      const dist = Math.hypot(u.x - v.x, u.y - v.y);

      if (dist <= interferenceThreshold) {
        const edgeId = `${u.id}-${v.id}`;
        edges.push({
          id: edgeId,
          source: u.id,
          target: v.id,
          distance: Math.round(dist),
        });
        edgeSet.add(`${u.id}:${v.id}`);
        edgeSet.add(`${v.id}:${u.id}`);
      }
    }
  }

  // Ensure graph is connected: if any node has degree 0, connect to its nearest neighbor
  const adj = buildAdjacencyList(nodes, edges);
  nodes.forEach((u) => {
    if (adj.get(u.id)!.length === 0) {
      let nearest: AccessPoint | null = null;
      let minDist = Infinity;
      nodes.forEach((v) => {
        if (u.id !== v.id) {
          const d = Math.hypot(u.x - v.x, u.y - v.y);
          if (d < minDist) {
            minDist = d;
            nearest = v;
          }
        }
      });
      if (nearest) {
        const edgeKey = u.id < (nearest as AccessPoint).id ? `${u.id}-${(nearest as AccessPoint).id}` : `${(nearest as AccessPoint).id}-${u.id}`;
        if (!edges.some((e) => e.id === edgeKey)) {
          edges.push({
            id: edgeKey,
            source: u.id < (nearest as AccessPoint).id ? u.id : (nearest as AccessPoint).id,
            target: u.id < (nearest as AccessPoint).id ? (nearest as AccessPoint).id : u.id,
            distance: Math.round(minDist),
          });
        }
      }
    }
  });

  return { nodes, edges };
}

export interface VerificationResult {
  isValid: boolean;
  violations: Array<{ ap1: string; ap2: string; channel: number }>;
  assignedCount: number;
  totalCount: number;
}

export function verifyGraphColoring(
  nodes: AccessPoint[],
  edges: InterferenceEdge[],
  assignment: Record<string, number | null>
): VerificationResult {
  const violations: Array<{ ap1: string; ap2: string; channel: number }> = [];
  let assignedCount = 0;

  nodes.forEach((n) => {
    if (assignment[n.id] !== null && assignment[n.id] !== undefined) {
      assignedCount++;
    }
  });

  edges.forEach((edge) => {
    const ch1 = assignment[edge.source];
    const ch2 = assignment[edge.target];
    if (ch1 !== null && ch1 !== undefined && ch2 !== null && ch2 !== undefined) {
      if (ch1 === ch2) {
        violations.push({ ap1: edge.source, ap2: edge.target, channel: ch1 });
      }
    }
  });

  const isValid = assignedCount === nodes.length && violations.length === 0;

  return {
    isValid,
    violations,
    assignedCount,
    totalCount: nodes.length,
  };
}
