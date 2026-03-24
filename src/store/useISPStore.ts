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
  region?: string;
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
  isLinking: boolean;
  
  // Actions
  tick: () => void;
  upgradeNode: (id: string) => void;
  addNode: (node: ISPNode) => void;
  setEra: (era: Era) => void;
  addLog: (msg: string, isCritical?: boolean) => void;
  setZoom: (level: number) => void;
  selectNode: (id: string | null) => void;
  connectNodes: (sourceId: string, targetId: string) => void;
  toggleLinking: () => void;
}

export const useISPStore = create<ISPStore>((set, get) => ({
  money: 5000,
  currentEra: '70s',
  totalData: 0,
  zoomLevel: 10,
  selectedNodeId: null,
  isLinking: false,
  logs: ['[SYSTEM] Graph Topology Online. Connect nodes to Core to start revenue.'],
  links: [],
  nodes: [
    // Layer 1: Local (Core)
    { id: '0', name: 'Core Gateway', bandwidth: 100, traffic: 0, level: 1, layer: 1, x: 395, y: 260, region: 'EMEA' },
    // Layer 2: Regional
    { id: 'l2-0', name: 'West Coast Hub', bandwidth: 200, traffic: 0, level: 1, layer: 2, x: 110, y: 280, region: 'AMER' },
    { id: 'l2-1', name: 'East Coast Hub', bandwidth: 200, traffic: 0, level: 1, layer: 2, x: 220, y: 280, region: 'AMER' },
    // Layer 3: National
    { id: 'l3-0', name: 'Sampa Hub', bandwidth: 1000, traffic: 0, level: 1, layer: 3, x: 265, y: 590, region: 'AMER' },
    { id: 'l3-1', name: 'Tokyo Exchange', bandwidth: 1000, traffic: 0, level: 1, layer: 3, x: 715, y: 290, region: 'APAC' },
    // Layer 4: Global
    { id: 'l4-0', name: 'Transatlantic Cable', bandwidth: 5000, traffic: 0, level: 1, layer: 4, x: 300, y: 310, region: 'EMEA' },
    { id: 'l4-1', name: 'Pacific Link', bandwidth: 2000, traffic: 0, level: 1, layer: 4, x: 730, y: 610, region: 'APAC' },
  ],

  tick: () => {
    set((state) => {
      // 1. BFS for Reachability from Core (ID '0')
      const core = state.nodes.find(n => n.id === '0');
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

      // Check for new disconnections for logging
      const newlyDisconnected = state.nodes.filter(n => !reachableIds.has(n.id) && n.id !== '0');
      // Note: We could track previous state to only log when it *becomes* disconnected, 
      // but for now let's just ensure nodes not reachable are greyed/inactive in UI and yield no revenue.

      // 2. Sim Loop: Node Traffic Drift
      const updatedNodes = state.nodes.map(node => {
        if (!reachableIds.has(node.id)) return { ...node, traffic: 0 };
        const targetScaling = node.layer === 1 ? 0.1 : 0.5;
        const targetTraffic = node.bandwidth * (targetScaling + Math.random() * 0.3);
        const drift = (targetTraffic - node.traffic) * 0.15;
        return { ...node, traffic: Math.max(10, Math.min(node.traffic + drift, node.bandwidth * 1.5)) };
      });

      // 3. Revenue (FIXED #2): Cumulative from all connected hubs (layer > 1)
      const activeNodes = updatedNodes.filter(n => n.layer > 1 && reachableIds.has(n.id));
      const rawRevenue = activeNodes.reduce((sum, n) => sum + n.traffic, 0);
      const hasOverload = activeNodes.some(n => n.traffic > n.bandwidth);
      const revenue = Math.floor(hasOverload ? rawRevenue * 0.4 : rawRevenue * 0.8);

      // 4. Stats & Era Transition (FIXED #4)
      const totalLoad = updatedNodes.reduce((sum, n) => sum + n.traffic, 0);
      const newTotalData = state.totalData + totalLoad;
      
      let nextEra = state.currentEra;
      if (newTotalData > ERAS['modern'].threshold) nextEra = 'modern';
      else if (newTotalData > ERAS['90s'].threshold) nextEra = '90s';

      const timestamp = new Date().toLocaleTimeString();
      let newLogs = [...state.logs];
      
      // Log newly disconnected nodes (simplified check)
      updatedNodes.forEach(node => {
        const wasReachable = state.nodes.find(n => n.id === node.id)?.traffic !== 0 || node.layer === 1; // approximation
        if (!reachableIds.has(node.id) && wasReachable && node.id !== '0' && Math.random() > 0.9) {
           newLogs = [`[${timestamp}] ! Node [${node.name}] disconnected from Core`, ...newLogs].slice(0, 20);
        }
      });

      if (revenue > 0 && Math.random() > 0.8) {
        newLogs = [`[${timestamp}] Revenue: +$${revenue} (${activeNodes.length} Hubs Active)`, ...newLogs].slice(0, 20);
      } else if (reachableIds.size === 1 && Math.random() > 0.95) {
        newLogs = [`[${timestamp}] ! ISOLATED: Fiber connectivity required.`, ...newLogs].slice(0, 20);
      }

      return {
        nodes: updatedNodes,
        money: state.money + revenue,
        totalData: newTotalData,
        currentEra: nextEra,
        logs: newLogs
      };
    });
  },

  connectNodes: (srcId, tgtId) => set((state) => {
    // Explicit string conversion to prevent number/string mismatch
    const sId = String(srcId);
    const tId = String(tgtId);
    
    const src = state.nodes.find(n => String(n.id) === sId);
    const tgt = state.nodes.find(n => String(n.id) === tId);
    
    if (!src || !tgt || sId === tId) return state;

    if (state.links.some(l => (l.sourceId === sId && l.targetId === tId) || (l.sourceId === tId && l.targetId === sId))) {
      return { ...state, isLinking: false, logs: [`[ERROR] Redundant link bypassed.`, ...state.logs].slice(0, 15) };
    }

    const dist = Math.sqrt(Math.pow(src.x - tgt.x, 2) + Math.pow(src.y - tgt.y, 2));
    const baseCost = 100;
    const distanceMultiplier = 1.5;
    const cost = Math.floor(baseCost + (dist * distanceMultiplier));
    
    if (state.money < cost) {
      return { ...state, isLinking: false, logs: [`[ERROR] Low credit: $${cost} required.`, ...state.logs].slice(0, 15) };
    }

    const newLink: ISPLink = {
      id: `link-${Date.now()}`,
      sourceId: sId,
      targetId: tId,
      bandwidth: 1000,
      type: 'fiber'
    };

    return {
      money: state.money - cost,
      links: [...state.links, newLink],
      isLinking: false,
      logs: [`[LINK] Established fiber (-$${cost})`, ...state.logs].slice(0, 15)
    };
  }),

  toggleLinking: () => set(state => ({ isLinking: !state.isLinking })),
  upgradeNode: (id) => set((state) => {
    const node = state.nodes.find(n => n.id === id);
    if (!node) return state;
    const cost = Math.floor(50 * Math.pow(1.15, node.level));
    if (state.money < cost) return state;
    return {
      money: state.money - cost,
      nodes: state.nodes.map(n => n.id === id ? { ...n, level: n.level + 1, bandwidth: Math.floor(n.bandwidth * 1.4) } : n),
      logs: [`[SUCCESS] ${node.name} optimized to LVL ${node.level + 1}.`, ...state.logs].slice(0, 15)
    };
  }),
  selectNode: (id) => set({ selectedNodeId: id }),
  setZoom: (level) => set({ zoomLevel: level }),
  addLog: (msg, isCritical = false) => set((state) => ({
    logs: [`[${new Date().toLocaleTimeString()}] ${isCritical ? '!!! ' : ''}${msg}`, ...state.logs].slice(0, 20)
  })),
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  setEra: (era) => set({ currentEra: era }),
}));
