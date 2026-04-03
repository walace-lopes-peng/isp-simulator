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
}

interface ISPLink {
  id: string;
  sourceId: string;
  targetId: string;
  bandwidth: number;
  type: string;
}

interface EraModifiers {
  signalAttenuation: number;
  revenueMultiplier: number;
  maintenanceCost: number;
}

interface EraConfig {
  id: string;
  modifiers: EraModifiers;
}

interface WorkerState {
  nodes: ISPNode[];
  links: ISPLink[];
  rangeLevel: number;
  tickRate: number;
  era: EraConfig;
  techModifiers?: {
    bandwidthMultiplier: number;
    latencyMultiplier: number;
    capacityMultiplier: number;
    maxDistance: number;
    signalQuality: number;
    connectionReliability: number;
  };
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
  const { nodes, links, rangeLevel, tickRate, era, techModifiers } = e.data;
  const dT = tickRate / 1000;
  
  const LATENCY_MOD = techModifiers?.latencyMultiplier ?? 1.0;
  const RELIABILITY_MOD = techModifiers?.connectionReliability ?? 0.7;
  const QUALITY_MOD = techModifiers?.signalQuality ?? 0.5;
  
  // Physics Fix: Scale JSON attenuation (e.g., 1.5) to simulation constant k (e.g., 0.0015)
  // Base fallback 0.002 (copper) if config is missing.
  const K_ATTENUATION = (era?.modifiers?.signalAttenuation || 0.002) / 1000;

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
      const weight = (d / (link.bandwidth / 100)) * LATENCY_MOD; // Tech-aware Latency weight
      
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

  // 2. Physics & Sim: Node Traffic, OPEX, Hazards, Attenuation
  let totalMaintenanceCost = 0;
  let healthSum = 0;
  let totalLatency = 0;
  let connectivityCount = 0;
  
  const updatedNodes = nodes.map(node => {
    const isReachable = dists[node.id] !== Infinity;
    
    // OPEX
    const baseCost = node.layer === 1 ? 0.008 : node.layer === 2 ? 0.020 : node.layer === 3 ? 0.050 : 0.100;
    totalMaintenanceCost += (baseCost * Math.pow(1.1, node.level - 1)) * dT;

    if (!isReachable) return { ...node, traffic: 0, health: 100, hazard: undefined, latency: 0, signalStrength: 0 };

    // Signal Physics (Attenuation)
    const signalStrength = Math.exp(-K_ATTENUATION * pathDistances[node.id]);
    const latency = dists[node.id];
    totalLatency += latency;
    connectivityCount++;

    // Traffic Simulation (Drift Scaled by Signal)
    const targetScaling = node.layer === 1 ? 0.1 : 0.5;
    const targetTraffic = node.bandwidth * (targetScaling + Math.random() * 0.3) * signalStrength;
    const drift = (targetTraffic - node.traffic) * 0.15 * (dT * 60);
    const finalTraffic = Math.max(10, Math.min(node.traffic + drift, node.bandwidth * 1.5));

    // Survival Engine: Hazards
    let nodeHealth = node.health;
    let activeHazard: string | undefined = undefined;
    const loadRatio = finalTraffic / node.bandwidth;

    if (loadRatio > 0.8) {
        // High connectionReliability reduces health decay from congestion
        const decayRate = (loadRatio - 0.8) * 100;
        const mitigatedDecay = decayRate * (1 - (RELIABILITY_MOD - 0.7) * 2); // 0.7 is baseline
        nodeHealth -= Math.max(10, mitigatedDecay) * dT; 
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

  // 3. Link OPEX
  totalMaintenanceCost += (links.length * 0.001) * dT;

  // 4. Revenue Calculation (Scaled by Signal & Health)
  const avgHealth = updatedNodes.length > 0 ? healthSum / updatedNodes.length : 100;
  const healthMultiplier = avgHealth < 50 ? 0.5 : 1.0;
  
  const profitableNodes = updatedNodes.filter(n => n.id !== '0' && dists[n.id] !== Infinity && n.traffic > 0);
  const rawRevenue = profitableNodes.reduce((sum, n) => {
    const isFocused = n.layer === rangeLevel;
    const efficiency = isFocused ? 0.8 : 0.2;
    // signalStrength already affected traffic, but we multiply here for direct business impact
    // tech-driven signalQuality further boosts revenue efficiency
    const nodeRevenue = (n.traffic * efficiency * healthMultiplier * (n.signalStrength! / 100) * QUALITY_MOD * dT) * era.modifiers.revenueMultiplier;
    const isCongested = n.traffic > n.bandwidth;
    return sum + (isCongested ? nodeRevenue * 0.5 : nodeRevenue);
  }, 0);

  const revenue = rawRevenue;
  const totalLoad = updatedNodes.reduce((sum, n) => sum + n.traffic, 0);

  // Apply OPEX grace period: 90% reduction if revenue is 0
  const finalMaintenanceCost = (revenue > 0 ? totalMaintenanceCost : totalMaintenanceCost * 0.1);

  // Send result back to main thread
  self.postMessage({
    nodes: updatedNodes,
    revenue,
    totalMaintenanceCost: finalMaintenanceCost,
    totalLoad,
    networkHealth: Math.round(avgHealth),
    avgLatency: connectivityCount > 0 ? Math.round(totalLatency / connectivityCount) : 0,
    reachableIds: Object.keys(dists).filter(id => dists[id] !== Infinity)
  });
};
