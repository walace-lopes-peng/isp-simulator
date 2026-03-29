/**
 * Logistic Map Simulation Worker (The Brain)
 * v1.6.2 - Week 2: Routing & Packet Physics (Dijkstra + Attenuation)
 */

interface ISPNode {
  id: string;
  name: string;
  x: number;
  y: number;
  bandwidth: number;
  traffic: number;
  level: number;
  layer: number;
  type: string;
  health: number;
  hazard?: string;
  latency?: number;
  signalStrength?: number;
  scale: string;
  parentId: string | null;
}

interface ISPLink {
  id: string;
  sourceId: string;
  targetId: string;
  bandwidth: number;
  type: string;
}

interface WorkerState {
  nodes: ISPNode[];
  links: ISPLink[];
  rangeLevel: number;
  tickRate: number;
  demandGrid: any[];
  era: any;
}

// Simple Min-Priority Queue for Dijkstra
class MinHeap {
    private heap: { id: string; priority: number }[] = [];
    push(id: string, priority: number) {
        this.heap.push({ id, priority });
        this.heap.sort((a, b) => a.priority - b.priority);
    }
    pop() { return this.heap.shift(); }
    isEmpty() { return this.heap.length === 0; }
}

self.onmessage = (e: MessageEvent<WorkerState>) => {
  const { nodes, links, rangeLevel, tickRate, demandGrid, era } = e.data;
  const dT = tickRate / 1000;
  const K_ATTENUATION = era?.modifiers?.signalAttenuation || 0.002;

  // 1. Dijkstra Pathfinding (Path of Least Resistance)
  const dists: Record<string, number> = {};
  const pathDistances: Record<string, number> = {}; // Physical distance along the path
  const prev: Record<string, string | null> = {};
  const pq = new MinHeap();

  nodes.forEach(n => {
    dists[n.id] = Infinity;
    pathDistances[n.id] = 0;
    prev[n.id] = null;
  });

  if (dists['0'] !== undefined) {
    dists['0'] = 0;
    pq.push('0', 0);
  }

  // Pre-calculate link distances and weights
  const adjacency: Record<string, { targetId: string; weight: number; physicalDist: number }[]> = {};
  links.forEach(link => {
    const s = nodes.find(n => n.id === link.sourceId);
    const t = nodes.find(n => n.id === link.targetId);
    if (s && t) {
      const d = Math.sqrt(Math.pow(s.x - t.x, 2) + Math.pow(s.y - t.y, 2));
      const weight = d / (link.bandwidth / 100); // Latency weight: Distance adjusted by bandwidth
      
      if (!adjacency[link.sourceId]) adjacency[link.sourceId] = [];
      if (!adjacency[link.targetId]) adjacency[link.targetId] = [];
      adjacency[link.sourceId].push({ targetId: link.targetId, weight, physicalDist: d });
      adjacency[link.targetId].push({ targetId: link.sourceId, weight, physicalDist: d });
    }
  });

  while (!pq.isEmpty()) {
    const minNode = pq.pop()!;
    const u = minNode.id;

    if (adjacency[u]) {
      adjacency[u].forEach(edge => {
        const v = edge.targetId;
        const alt = dists[u] + edge.weight;
        if (alt < dists[v]) {
          dists[v] = alt;
          pathDistances[v] = pathDistances[u] + edge.physicalDist;
          prev[v] = u;
          pq.push(v, alt);
        }
      });
    }
  }

  // 1.5 Spatial Demand Matrix Processing (Only for Local/Regional)
  const nodeTrafficMap: Record<string, number> = {};
  const nodeRevenueMap: Record<string, number> = {};
  const COVERAGE_RADIUS = 150;
  const radiusSq = COVERAGE_RADIUS * COVERAGE_RADIUS;

  if (rangeLevel <= 2 && demandGrid && demandGrid.length > 0) {
     demandGrid.forEach(cell => {
        let nearestNode: any = null;
        let minDistSq = Infinity;
        
        nodes.forEach(n => {
           if (dists[n.id] === Infinity) return;
           const dx = n.x - cell.x;
           const dy = n.y - cell.y;
           const dSq = dx * dx + dy * dy;
           
           if (dSq < minDistSq && dSq < radiusSq) {
              minDistSq = dSq;
              nearestNode = n;
           }
        });
        
        if (nearestNode) {
           const efficiency = Math.max(0.1, 1 - (Math.sqrt(minDistSq) / COVERAGE_RADIUS));
           nodeTrafficMap[nearestNode.id] = (nodeTrafficMap[nearestNode.id] || 0) + (cell.trafficBase * efficiency);
           nodeRevenueMap[nearestNode.id] = (nodeRevenueMap[nearestNode.id] || 0) + (cell.revenueBase * efficiency);
        }
     });
  }

  // 2. Physics & Sim: Node Traffic, OPEX, Hazards, Attenuation
  let totalMaintenanceCost = 0;
  let healthSum = 0;
  let totalLatency = 0;
  let connectivityCount = 0;
  
  const updatedNodes = nodes.map(node => {
    const isReachable = dists[node.id] !== Infinity;
    
    // OPEX
    const baseCost = node.layer === 1 ? 50 : node.layer === 2 ? 20 : node.layer === 3 ? 10 : 5;
    totalMaintenanceCost += (baseCost * Math.pow(1.1, node.level - 1)) * dT;

    if (!isReachable) return { ...node, traffic: 0, health: 100, hazard: undefined, latency: 0, signalStrength: 0 };

    // Signal Physics (Attenuation)
    const signalStrength = Math.exp(-K_ATTENUATION * pathDistances[node.id]);
    const latency = dists[node.id];
    totalLatency += latency;
    connectivityCount++;

    // Heatmap Traffic Assignment
    let targetTraffic = nodeTrafficMap[node.id] || 0;
    
    // Fallback for Backbones extending outside local grid (Layer 3/4)
    if (targetTraffic === 0 && node.layer > 2) {
      targetTraffic = node.bandwidth * 0.4 * signalStrength;
    }

    const drift = (targetTraffic - node.traffic) * 0.15 * (dT * 60);
    const finalTraffic = Math.max(0, Math.min(node.traffic + drift, node.bandwidth * 1.5));

    // Survival Engine: Hazards
    let nodeHealth = node.health;
    let activeHazard: string | undefined = undefined;
    const loadRatio = finalTraffic / node.bandwidth;

    if (loadRatio > 0.8) {
        nodeHealth -= (loadRatio - 0.8) * 100 * dT; 
        activeHazard = 'congestion';
    } else if (nodeHealth < 100) {
        nodeHealth += 2 * dT;
    }

    if (rangeLevel === 2 && node.layer === 2) {
        nodeHealth -= 5 * dT;
        activeHazard = 'heat';
    }

    const finalHealth = Math.round(Math.max(0, Math.min(100, nodeHealth)));
    healthSum += finalHealth;

    return { 
      ...node, 
      traffic: finalTraffic, 
      health: finalHealth, 
      hazard: activeHazard,
      latency: Math.round(latency),
      signalStrength: Math.round(signalStrength * 100)
    };
  });

  const finalNodes = updatedNodes.map(node => {
    if (node.parentId) {
      const parent = updatedNodes.find(n => n.id === node.parentId);
      if (parent && parent.id !== '0') {
        const isParentOffline = parent.traffic === 0 || (parent.signalStrength ?? 0) < 10;
        if (isParentOffline) {
          return { 
            ...node, 
            traffic: 0, 
            hazard: 'ISOLATED_UPSTREAM', 
            latency: 0, 
            signalStrength: 0,
            health: Math.max(0, node.health - 5 * dT) 
          };
        }
      }
    }
    return node;
  });

  // 3. Link OPEX
  totalMaintenanceCost += (links.length * 5) * dT;

  // 4. Revenue Calculation (Scaled by Demand & Health)
  const avgHealth = finalNodes.length > 0 ? healthSum / finalNodes.length : 100;
  const healthMultiplier = avgHealth < 50 ? 0.5 : 1.0;
  
  const rawRevenue = finalNodes.reduce((sum, n) => {
    let nodeRevenue = (nodeRevenueMap[n.id] || 0) * (n.signalStrength! / 100) * healthMultiplier * dT;
    
    // Legacy fallback
    if (!nodeRevenue && n.layer > 2 && dists[n.id] !== Infinity) {
       nodeRevenue = n.traffic * 0.2 * healthMultiplier * (n.signalStrength! / 100) * dT;
    }

    const isCongested = n.traffic > n.bandwidth;
    return sum + (isCongested ? nodeRevenue * 0.5 : nodeRevenue);
  }, 0);

  const revenue = Math.floor(rawRevenue);
  const totalLoad = finalNodes.reduce((sum, n) => sum + n.traffic, 0);

  // Send result back to main thread
  self.postMessage({
    nodes: finalNodes,
    revenue,
    totalMaintenanceCost: Math.floor(totalMaintenanceCost),
    totalLoad,
    networkHealth: Math.round(avgHealth),
    avgLatency: connectivityCount > 0 ? Math.round(totalLatency / connectivityCount) : 0,
    reachableIds: Object.keys(dists).filter(id => dists[id] !== Infinity)
  });
};
