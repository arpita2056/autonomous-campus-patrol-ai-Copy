import { ZoneNode, GraphEdge } from '../types';

export interface AdjacencyMap {
  [nodeId: string]: Array<{ to: string; distance: number }>;
}

export function buildAdjacencyMap(edges: GraphEdge[]): AdjacencyMap {
  const map: AdjacencyMap = {};
  
  for (const edge of edges) {
    if (!map[edge.from]) map[edge.from] = [];
    if (!map[edge.to]) map[edge.to] = [];
    
    // Bidirectional road connections on campus
    map[edge.from].push({ to: edge.to, distance: edge.distance });
    map[edge.to].push({ to: edge.from, distance: edge.distance });
  }
  
  return map;
}

export interface ShortestPathResult {
  path: string[]; // sequence of node IDs including start and end
  totalDistance: number;
}

/**
 * Dijkstra shortest path between two zones
 */
export function findShortestPath(
  startId: string,
  targetId: string,
  adjacencyMap: AdjacencyMap
): ShortestPathResult {
  if (startId === targetId) {
    return { path: [startId], totalDistance: 0 };
  }

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  for (const node of Object.keys(adjacencyMap)) {
    distances[node] = Infinity;
    previous[node] = null;
    unvisited.add(node);
  }

  distances[startId] = 0;

  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let current: string | null = null;
    let minDistance = Infinity;

    for (const node of unvisited) {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        current = node;
      }
    }

    if (current === null || minDistance === Infinity) {
      break; // No reachable remaining nodes
    }

    if (current === targetId) {
      break; // Target reached
    }

    unvisited.delete(current);

    const neighbors = adjacencyMap[current] || [];
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.to)) continue;

      const alt = distances[current] + neighbor.distance;
      if (alt < distances[neighbor.to]) {
        distances[neighbor.to] = alt;
        previous[neighbor.to] = current;
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let curr: string | null = targetId;

  if (distances[targetId] === Infinity) {
    // Path not found, return direct jump fallback
    return { path: [startId, targetId], totalDistance: 999 };
  }

  while (curr !== null) {
    path.unshift(curr);
    curr = previous[curr];
  }

  return {
    path,
    totalDistance: distances[targetId]
  };
}

/**
 * Calculate Euclidean coordinate distance between two zones
 */
export function getEuclideanDistance(z1: ZoneNode, z2: ZoneNode): number {
  const dx = z1.x - z2.x;
  const dy = z1.y - z2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Find maximum graph path distance across all zone pairs (D_max)
 */
export function calculateMaxGraphDistance(zones: ZoneNode[], adjacencyMap: AdjacencyMap): number {
  let maxDist = 1;
  for (let i = 0; i < zones.length; i++) {
    for (let j = i + 1; j < zones.length; j++) {
      const res = findShortestPath(zones[i].id, zones[j].id, adjacencyMap);
      if (res.totalDistance < 9000 && res.totalDistance > maxDist) {
        maxDist = res.totalDistance;
      }
    }
  }
  return maxDist || 800;
}

