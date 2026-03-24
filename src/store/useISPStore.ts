import { create } from 'zustand';

export type Era = '70s' | '90s' | 'modern';

export interface ISPNode {
  id: string;
  name: string;
  bandwidth: number;
  traffic: number;
  level: number;
  layer: number; // 1: Local, 2: Regional, 3: National, 4: Global
  x: number;
  y: number;
}

export interface ISPLink {
  id: string;
  sourceId: string;
  targetId: string;
  bandwidth: number;
  type: 'cable' | 'fiber' | 'satellite';
}

const ERAS = {
  '70s': { threshold: 0, next: '90s' as Era },
  '90s': { threshold: 10000, next: 'modern' as Era },
  'modern': { threshold: 100000, next: null }
};

interface ISPStore {
  money: number;
  currentEra: Era;
  nodes: ISPNode[];
  links: ISPLink[];
  totalData: number;
  logs: string[];
  zoomLevel: number;
  selectedNodeId: string | null;
  
  // Actions
  tick: () => void;
  upgradeNode: (id: string) => void;
  addNode: (node: ISPNode) => void;
  setEra: (era: Era) => void;
  addLog: (msg: string, isCritical?: boolean) => void;
  setZoom: (level: number) => void;
  startTick: () => void;
  selectNode: (id: string | null) => void;
  connectNodes: (sourceId: string, targetId: string) => void;
}

export const useISPStore = create<ISPStore>((set, get) => ({
  money: 5000,
  currentEra: '70s',
  totalData: 0,
  zoomLevel: 1,
  selectedNodeId: null,
  logs: ['[SYSTEM] Graph Topology Online. Connect nodes to Core to start revenue.'],
  links: [],
  nodes: [
    // Layer 1: Local (Core)
    { id: 'l1-0', name: 'Core Gateway', bandwidth: 100, traffic: 0, level: 1, layer: 1, x: 400, y: 400 },
    // Layer 2: Regional
    { id: 'l2-0', name: 'Neighborhood Hub A', bandwidth: 200, traffic: 0, level: 1, layer: 2, x: 300, y: 300 },
    { id: 'l2-1', name: 'Neighborhood Hub B', bandwidth: 200, traffic: 0, level: 1, layer: 2, x: 500, y: 300 },
    // Layer 3: National
    { id: 'l3-0', name: 'Metropolitan Backbone', bandwidth: 1000, traffic: 0, level: 1, layer: 3, x: 200, y: 400 },
    { id: 'l3-1', name: 'Regional Exchange', bandwidth: 1000, traffic: 0, level: 1, layer: 3, x: 600, y: 400 },
    // Layer 4: Global
    { id: 'l4-0', name: 'Transatlantic Cable', bandwidth: 5000, traffic: 0, level: 1, layer: 4, x: 100, y: 600 },
    { id: 'l4-1', name: 'Satellite Uplink', bandwidth: 2000, traffic: 0, level: 1, layer: 4, x: 700, y: 600 },
  ],

  startTick: () => {
    setInterval(() => {
      set((state) => {
        // 1. BFS for Reachability from Core (Layer 1)
        const core = state.nodes.find(n => n.layer === 1);
        const reachableIds = new Set<string>();
        if (core) {
          const queue = [core.id];
          reachableIds.add(core.id);
          while (queue.length > 0) {
            const currentId = queue.shift()!;
            const neighbors = state.links
              .filter(l => l.sourceId === currentId || l.targetId === currentId)
              .map(l => l.sourceId === currentId ? l.targetId : l.sourceId);
            
            for (const neighborId of neighbors) {
              if (!reachableIds.has(neighborId)) {
                reachableIds.add(neighborId);
                queue.push(neighborId);
              }
            }
          }
        }

        // 2. Sim Loop: Node Traffic Drift (Only for reachable nodes)
        const updatedNodes = state.nodes.map(node => {
          if (!reachableIds.has(node.id)) return { ...node, traffic: 0 };
          
          const targetTraffic = node.bandwidth * (0.3 + Math.random() * 0.4); // Random demand based on BW
          const drift = (targetTraffic - node.traffic) * 0.1;
          return { ...node, traffic: Math.max(10, Math.min(node.traffic + drift, node.bandwidth * 2)) };
        });

        // 3. Revenue for Active Layer (Semantic Zoom affects revenue focus)
        const activeNodes = updatedNodes.filter(n => n.layer === (state.zoomLevel <= 25 ? 1 : state.zoomLevel <= 50 ? 2 : state.zoomLevel <= 75 ? 3 : 4));
        const rawRevenue = activeNodes.reduce((sum, n) => sum + n.traffic, 0);
        const hasOverload = activeNodes.some(n => n.traffic > n.bandwidth);
        const revenue = Math.floor(hasOverload ? rawRevenue * 0.5 : rawRevenue);

        // 4. Global Stats
        const totalLoad = updatedNodes.reduce((sum, n) => sum + n.traffic, 0);
        const newTotalData = state.totalData + totalLoad;

        // 5. Era Shifting
        let nextEra = state.currentEra;
        if (newTotalData > 500000) nextEra = 'modern';
        else if (newTotalData > 50000) nextEra = '90s';

        // 6. Revenue Logs
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] Revenue: +$${revenue} (Reachable: ${reachableIds.size}/${state.nodes.length})`;
        const newLogs = revenue > 0 ? [logEntry, ...state.logs].slice(0, 20) : state.logs;

        return {
          nodes: updatedNodes,
          money: state.money + revenue,
          totalData: newTotalData,
          currentEra: nextEra,
          logs: newLogs
        };
      });
    }, 1000);
  },

  connectNodes: (srcId, tgtId) => set((state) => {
    const src = state.nodes.find(n => n.id === srcId);
    const tgt = state.nodes.find(n => n.id === tgtId);
    if (!src || !tgt || srcId === tgtId) return state;

    // Prevent duplicate links
    if (state.links.some(l => (l.sourceId === srcId && l.targetId === tgtId) || (l.sourceId === tgtId && l.targetId === srcId))) {
      return { ...state, logs: [`[ERROR] Link already exists between ${src.name} & ${tgt.name}`, ...state.logs].slice(0, 20) };
    }

    const dist = Math.sqrt(Math.pow(src.x - tgt.x, 2) + Math.pow(src.y - tgt.y, 2));
    const cost = Math.floor(dist * 10);
    
    if (state.money < cost) {
      return { ...state, logs: [`[ERROR] Insufficient capital for link ($${cost})`, ...state.logs].slice(0, 20) };
    }

    const newLink: ISPLink = {
      id: `link-${Date.now()}`,
      sourceId: srcId,
      targetId: tgtId,
      bandwidth: 1000,
      type: 'fiber'
    };

    return {
      money: state.money - cost,
      links: [...state.links, newLink],
      logs: [`[LINK] Established fiber between ${src.name} & ${tgt.name} (-$${cost})`, ...state.logs].slice(0, 20)
    };
  }),

  setZoom: (level) => set({ zoomLevel: level }),

  addLog: (msg, isCritical = false) => set((state) => ({
    logs: [`[${new Date().toLocaleTimeString()}] ${isCritical ? '!!! ' : ''}${msg}`, ...state.logs].slice(0, 15)
  })),

  tick: () => set((state) => {
    // 1. Calculate Traffic Fluctuations
    const updatedNodes = state.nodes.map(node => {
      const drift = Math.floor(Math.random() * (node.level * 15)) - (node.level * 5);
      const newTraffic = Math.max(0, Math.min(node.traffic + drift, node.bandwidth * 1.5));
      return { ...node, traffic: newTraffic };
    });

    // 2. Revenue & Penalties
    const totalTraffic = updatedNodes.reduce((sum, n) => sum + n.traffic, 0);
    const totalBandwidth = updatedNodes.reduce((sum, n) => sum + n.bandwidth, 0);
    const hasCongestion = totalTraffic > totalBandwidth;
    const profit = hasCongestion ? totalTraffic * 0.5 : totalTraffic;
    
    // 3. Accumulate Data & Evolution
    const newTotalData = state.totalData + totalTraffic;
    let nextEra = state.currentEra;
    const eraConfig = ERAS[state.currentEra];
    if (eraConfig.next && newTotalData >= ERAS[eraConfig.next].threshold) {
      nextEra = eraConfig.next;
    }

    const newLogs = [...state.logs];
    if (hasCongestion && Math.random() > 0.9) {
      newLogs.unshift(`[${new Date().toLocaleTimeString()}] !!! CRITICAL: Global network congestion.`);
    }

    return {
      nodes: updatedNodes,
      money: state.money + Math.floor(profit * 0.1), // Adjusted multiplier
      totalData: newTotalData,
      currentEra: nextEra,
      logs: newLogs.slice(0, 15)
    };
  }),

  upgradeNode: (id) => set((state) => {
    const node = state.nodes.find(n => n.id === id);
    if (!node) return state;
    
    const cost = Math.floor(50 * Math.pow(1.15, node.level));
    if (state.money < cost) return state;

    return {
      money: state.money - cost,
      nodes: state.nodes.map(n => n.id === id ? { 
        ...n, 
        level: n.level + 1, 
        bandwidth: Math.floor(n.bandwidth * 1.4) 
      } : n),
      logs: [`[SUCCESS] ${node.name} optimized to Level ${node.level + 1}.`, ...state.logs].slice(0, 20)
    };
  }),

  selectNode: (id) => set({ selectedNodeId: id }),
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  setEra: (era) => set({ currentEra: era }),
}));
