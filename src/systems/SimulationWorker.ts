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
  isCore?: boolean;
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

let sessionInvalidCount: Record<string, number> = {};
let lastValidSessions: Record<string, any> = {};

self.onmessage = (e: MessageEvent<WorkerState>) => {
  const { nodes, links, rangeLevel, tickRate, era, techModifiers } = e.data;
  const dT = tickRate / 1000;
  
  const LATENCY_MOD = techModifiers?.latencyMultiplier ?? 1.0;
  const RELIABILITY_MOD = techModifiers?.connectionReliability ?? 0.7;
  const QUALITY_MOD = techModifiers?.signalQuality ?? 0.5;
  
  // Physics Fix: Scale JSON attenuation (e.g., 1.5) to simulation constant k (e.g., 0.0015)
  // Base fallback 0.002 (copper) if config is missing.
  const K_ATTENUATION = (era?.modifiers?.signalAttenuation || 0.002) / 1000;

  // 1. Multi-Source Dijkstra (Pathing from all potential destinations)
  const destinations = nodes.filter(n => n.type !== 'terminal' && n.health > 0).map(n => n.id);
  if (!destinations.includes('0')) destinations.push('0');

  const allPrev: Record<string, Record<string, string | null>> = {};
  const allDists: Record<string, Record<string, number>> = {};
  const allPathDistances: Record<string, Record<string, number>> = {};

  destinations.forEach(root => {
    const dists: Record<string, number> = {};
    const pathDistances: Record<string, number> = {};
    const prev: Record<string, string | null> = {};
    const pq = new MinHeap();

    nodes.forEach(n => {
      dists[n.id] = Infinity;
      pathDistances[n.id] = 0;
      prev[n.id] = null;
    });

    dists[root] = 0;
    pq.push(root, 0);

    // Pre-calculate link distances and weights
    const adjacency: Record<string, { targetId: string; weight: number; physicalDist: number }[]> = {};
    links.forEach(link => {
      const s = nodes.find(n => n.id === link.sourceId);
      const t = nodes.find(n => n.id === link.targetId);
      if (s && t) {
        const d = Math.sqrt(Math.pow(s.x - t.x, 2) + Math.pow(s.y - t.y, 2));
        const weight = (d / (link.bandwidth / 100)) * LATENCY_MOD;
        
        if (!adjacency[link.sourceId]) adjacency[link.sourceId] = [];
        if (!adjacency[link.targetId]) adjacency[link.targetId] = [];
        adjacency[link.sourceId].push({ targetId: link.targetId, weight, physicalDist: d });
        adjacency[link.targetId].push({ targetId: link.sourceId, weight, physicalDist: d });
      }
    });

    // Stable Adjacency: Sort neighbors by ID to ensure deterministic Dijkstra path selection
    Object.keys(adjacency).forEach(id => {
      adjacency[id].sort((a, b) => a.targetId.localeCompare(b.targetId));
    });

    while (!pq.isEmpty()) {
      const minNode = pq.pop()!;
      const u = minNode.id;
      const uNode = nodes.find(n => n.id === u);
      if (uNode && uNode.health <= 0 && u !== root) continue; 

      if (adjacency[u]) {
        adjacency[u].forEach(edge => {
          const v = edge.targetId;
          const alt = dists[u] + edge.weight;
          // Ties go to the first neighbor in alphabetical order (id)
          if (alt < dists[v]) {
            dists[v] = alt;
            pathDistances[v] = pathDistances[u] + edge.physicalDist;
            prev[v] = u;
            pq.push(v, alt);
          }
        });
      }
    }
    allPrev[root] = prev;
    allDists[root] = dists;
    allPathDistances[root] = pathDistances;
  });

  // 2. Traffic Session Orchestration (many connections)
  const DESTINATION_SHIFT_MS = 30000; // Slower shift to prevent churn
  const now = Date.now();
  const activePaths: Record<string, { path: string[], destination: string, pathD: string, sessId: string }[]> = {};

  nodes.forEach(node => {
    // Only Terminals (Devices) generate traffic
    if (node.type !== 'terminal') return;

    const sessionCount = 2; // Fixed terminals sessions to 2
    if (!activePaths[node.id]) activePaths[node.id] = [];
    
    for (let s = 0; s < sessionCount; s++) {
        const sessionKey = `session_${s}`;
        const sessIdKey = `${node.id}_s${s}`; // Stable key for invalid tracking
        
        let destId = (node as any)[`${sessionKey}_destId`] || (s === 0 ? '0' : undefined);
        let lastShift = (node as any)[`${sessionKey}_lastShift`] || 0;

        // Initialize staggered shift
        if (lastShift === 0) {
            lastShift = now - Math.floor(Math.random() * DESTINATION_SHIFT_MS);
            (node as any)[`${sessionKey}_lastShift`] = lastShift;
        }

        const possibleDestinations = destinations.filter(d => d !== node.id && allDists[d][node.id] !== Infinity);

        if (now - lastShift > DESTINATION_SHIFT_MS || !destId) {
            if (possibleDestinations.length > 0) {
                const idx = ((node as any)[`${sessionKey}_idx`] || 0) + 1;
                destId = possibleDestinations[idx % possibleDestinations.length];
                (node as any)[`${sessionKey}_idx`] = idx;
            } else {
                destId = '0';
            }
            (node as any)[`${sessionKey}_destId`] = destId;
            (node as any)[`${sessionKey}_lastShift`] = now;
        }

        // --- Session Validity & Grace Period (Fix #126 / Bug 1) ---
        const isCurrentlyValid = node.health > 0 && destId && allPrev[destId] && allDists[destId][node.id] !== Infinity;

        if (isCurrentlyValid) {
            sessionInvalidCount[sessIdKey] = 0;
            const path = [];
            let curr: string | null = node.id;
            const prevMap = allPrev[destId!];
            while (curr !== null) {
                path.push(curr);
                if (curr === destId) break;
                curr = prevMap[curr];
            }

            let pathD = "";
            for (let i = 0; i < path.length - 1; i++) {
                const sId = path[i];
                const tId = path[i+1];
                const sNode = nodes.find(n => n.id === sId);
                const tNode = nodes.find(n => n.id === tId);
                if (!sNode || !tNode) continue;

                const link = links.find(l => 
                    (l.sourceId === sId && l.targetId === tId) || 
                    (l.sourceId === tId && l.targetId === sId)
                );
                if (!link) continue;

                const lSrc = nodes.find(n => n.id === link.sourceId)!;
                const lTgt = nodes.find(n => n.id === link.targetId)!;
                const dx = lTgt.x - lSrc.x;
                const dy = lTgt.y - lSrc.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const offset = dist * 0.15;
                const angle = Math.atan2(dy, dx);
                const cX = (lSrc.x + lTgt.x) / 2 + offset * Math.cos(angle - Math.PI / 2);
                const cY = (lSrc.y + lTgt.y) / 2 + offset * Math.sin(angle - Math.PI / 2);
                
                if (i === 0) pathD += `M ${sNode.x} ${sNode.y} `;
                pathD += `Q ${cX} ${cY} ${tNode.x} ${tNode.y} `;
            }

            const sessId = `${node.id}_s${s}_${destId}_${lastShift}`;
            const sessionData = { path, destination: destId!, pathD, sessId };
            activePaths[node.id].push(sessionData);
            lastValidSessions[sessIdKey] = sessionData;
        } else {
            // Invalid session - apply grace period
            sessionInvalidCount[sessIdKey] = (sessionInvalidCount[sessIdKey] || 0) + 1;
            
            if (sessionInvalidCount[sessIdKey] === 1 && lastValidSessions[sessIdKey]) {
                // Buffer one more tick
                activePaths[node.id].push(lastValidSessions[sessIdKey]);
            } else {
                // Fully expired
                delete lastValidSessions[sessIdKey];
                sessionInvalidCount[sessIdKey] = 0;
            }
        }
    }
  });

  // 3. Physics & Sim: Node Traffic, OPEX, Hazards, Attenuation
  let totalMaintenanceCost = 0;
  let healthSum = 0;
  let totalLatency = 0;
  let connectivityCount = 0;
  
  const updatedNodes = nodes.map(node => {
    const rootDists = allDists['0'] || {};
    const rootPathDistances = allPathDistances['0'] || {};
    const isReachable = rootDists[node.id] !== Infinity;
    
    // OPEX
    const baseCost = node.layer === 1 ? 0.008 : node.layer === 2 ? 0.020 : node.layer === 3 ? 0.050 : 0.100;
    totalMaintenanceCost += (baseCost * Math.pow(1.1, node.level - 1)) * dT;

    if (!isReachable) return { ...node, traffic: 0, health: 100, hazard: undefined, latency: 0, signalStrength: 0 };

    // Signal Physics (Attenuation based on gateway distance for business logic)
    const signalStrength = Math.exp(-K_ATTENUATION * (rootPathDistances[node.id] || 0));
    const latency = rootDists[node.id] || 0;
    totalLatency += latency;
    connectivityCount++;

    // Traffic Simulation (Drift Scaled by Signal)
    const targetScaling = node.layer === 1 ? 0.1 : 0.5;
    const targetTraffic = node.bandwidth * (targetScaling + Math.random() * 0.3) * signalStrength;
    const drift = (targetTraffic - node.traffic) * 0.15 * (dT * 60);
    const finalTraffic = Math.max(10, Math.min(node.traffic + drift, node.bandwidth * 1.5));

    // Survival Engine: Hardware Degradation (Refined #125)
    let nodeHealth = node.health;
    let activeHazard: string | undefined = undefined;
    const loadRatio = finalTraffic / node.bandwidth;

    if (nodeHealth > 0) {
        // 1. Thermal Stress (Heat from Congestion)
        if (loadRatio > 0.85) {
            const stressImpact = (loadRatio - 0.85) * 15;
            const mitigatedStress = stressImpact * (1 - (RELIABILITY_MOD - 0.7) * 2); 
            nodeHealth -= Math.max(2, mitigatedStress) * dT;
            activeHazard = 'heat';
        } 
        
        // 2. Base Wear & Tear (Slow decay over time)
        nodeHealth -= 0.05 * dT; 

        // 3. Auto-Recovery (Slowly heal if NOT failed and NOT stressed)
        if (loadRatio < 0.6 && nodeHealth < 100) {
            nodeHealth += 1.5 * dT;
        }
    } else {
        // Node is FAILED (health <= 0)
        // It stays at 0 until manual repair action reaches it
        nodeHealth = 0;
        activeHazard = 'congestion'; // Represents total failure
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
  
  const rootDists = allDists['0'] || {};
  const profitableNodes = updatedNodes.filter(n => n.id !== '0' && rootDists[n.id] !== Infinity && n.traffic > 0);
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
  const totalLoad = updatedNodes
    .filter(n => n.type === 'terminal')
    .reduce((sum, n) => sum + n.traffic, 0);

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
    reachableIds: Object.keys(rootDists).filter(id => rootDists[id] !== Infinity),
    activePaths
  });
};
