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

export const RANGE_PRESETS = {
  1: { name: 'LOCAL', viewBox: '250 150 300 300', tier: 1 },
  2: { name: 'REGIONAL', viewBox: '50 100 400 300', tier: 2 },
  3: { name: 'NATIONAL', viewBox: '0 0 800 600', tier: 3 },
  4: { name: 'GLOBAL', viewBox: '0 0 800 800', tier: 4 },
} as const;

export type RangeLevel = keyof typeof RANGE_PRESETS;

interface ISPStore {
  money: number;
  currentEra: Era;
  nodes: ISPNode[];
  links: ISPLink[];
  totalData: number;
  logs: string[];
  rangeLevel: RangeLevel;
  selectedNodeId: string | null;
  isLinking: boolean;
  isGodMode: boolean;
  tickRate: number;
  
  // Actions
  tick: () => void;
  upgradeNode: (id: string) => void;
  addNode: (node: ISPNode) => void;
  setEra: (era: Era) => void;
  addLog: (msg: string, isCritical?: boolean) => void;
  setRange: (level: RangeLevel) => void;
  selectNode: (id: string | null) => void;
  connectNodes: (sourceId: string, targetId: string) => void;
  toggleLinking: () => void;
  
  // Debug Actions
  addMoney: (amount: number) => void;
  resetTopology: () => void;
  toggleGodMode: () => void;
  setTickRate: (rate: number) => void;
}

export const useISPStore = create<ISPStore>((set, get) => ({
  money: 5000,
  currentEra: 'modern',
  totalData: 0,
  rangeLevel: 1,
  selectedNodeId: null,
  isLinking: false,
  isGodMode: false,
  tickRate: 1000,
  logs: ['[SYSTEM] Graph Topology Online. Connect nodes to Core to start revenue.'],
  links: [],
  nodes: [
    { id: '0', name: 'Core Gateway', bandwidth: 100, traffic: 0, level: 1, layer: 1, x: 395, y: 260 },
    { id: 'l2-0', name: 'West Coast Hub', bandwidth: 200, traffic: 0, level: 1, layer: 2, x: 110, y: 280 },
    { id: 'l2-1', name: 'East Coast Hub', bandwidth: 200, traffic: 0, level: 1, layer: 2, x: 220, y: 280 },
    { id: 'l3-0', name: 'Sampa Hub', bandwidth: 1000, traffic: 0, level: 1, layer: 3, x: 265, y: 590 },
    { id: 'l3-1', name: 'Tokyo Exchange', bandwidth: 1000, traffic: 0, level: 1, layer: 3, x: 715, y: 290 },
    { id: 'l4-0', name: 'Transatlantic Cable', bandwidth: 5000, traffic: 0, level: 1, layer: 4, x: 300, y: 310 },
    { id: 'l4-1', name: 'Pacific Link', bandwidth: 2000, traffic: 0, level: 1, layer: 4, x: 730, y: 610 },
  ],

  tick: () => {
    set((state) => {
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

      const updatedNodes = state.nodes.map(node => {
        if (!reachableIds.has(node.id)) return { ...node, traffic: 0 };
        const targetScaling = node.layer === 1 ? 0.1 : 0.5;
        const targetTraffic = node.bandwidth * (targetScaling + Math.random() * 0.3);
        const drift = (targetTraffic - node.traffic) * 0.15;
        return { ...node, traffic: Math.max(10, Math.min(node.traffic + drift, node.bandwidth * 1.5)) };
      });

      // 3. Revenue (Hybrid Formula from Issue #2)
      const activeTier = state.rangeLevel;
      const allProfitableNodes = updatedNodes.filter(n => n.layer > 1 && reachableIds.has(n.id));

      const rawRevenue = allProfitableNodes.reduce((sum, n) => {
        const isFocused = n.layer === activeTier;
        const multiplier = isFocused ? 0.8 : 0.2; // 80% if focused, 20% passive background
        const nodeRevenue = n.traffic * multiplier;
        const isCongested = n.traffic > n.bandwidth;
        return sum + (isCongested ? nodeRevenue * 0.5 : nodeRevenue);
      }, 0);

      const revenue = Math.floor(rawRevenue);

      const totalLoad = updatedNodes.reduce((sum, n) => sum + n.traffic, 0);
      const newTotalData = state.totalData + totalLoad;
      let nextEra = state.currentEra;
      if (newTotalData > 500000) nextEra = 'modern';
      else if (newTotalData > 50000) nextEra = '90s';

      const timestamp = new Date().toLocaleTimeString();
      let newLogs = [...state.logs];
      
      if (revenue > 0 && Math.random() > 0.8) {
        newLogs = [`[${timestamp}] Revenue: +$${revenue} (Combined Focus)`, ...newLogs].slice(0, 20);
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
    const sId = String(srcId);
    const tId = String(tgtId);
    if (state.links.some(l => (l.sourceId === sId && l.targetId === tId) || (l.sourceId === tId && l.targetId === sId))) return state;

    const src = state.nodes.find(n => String(n.id) === sId);
    const tgt = state.nodes.find(n => String(n.id) === tId);
    if (!src || !tgt || sId === tId) return state;

    const dist = Math.sqrt(Math.pow(src.x - tgt.x, 2) + Math.pow(src.y - tgt.y, 2));
    const cost = Math.floor(100 + (dist * 1.5));
    
    if (!state.isGodMode && state.money < cost) {
      return { ...state, isLinking: false, logs: [`[ERROR] Low credit: $${cost} required.`, ...state.logs].slice(0, 15) };
    }

    const newLink: ISPLink = { id: `link-${Date.now()}`, sourceId: sId, targetId: tId, bandwidth: 1000, type: 'fiber' };

    return {
      money: state.isGodMode ? state.money : state.money - cost,
      links: [...state.links, newLink],
      isLinking: false,
      logs: [`[LINK] Established fiber (${state.isGodMode ? 'FREE' : `-$${cost}`})`, ...state.logs].slice(0, 15)
    };
  }),

  toggleLinking: () => set(state => ({ isLinking: !state.isLinking })),
  upgradeNode: (id) => set((state) => {
    const node = state.nodes.find(n => n.id === id);
    if (!node) return state;
    const cost = Math.floor(50 * Math.pow(1.15, node.level));
    if (!state.isGodMode && state.money < cost) return state;
    return {
      money: state.isGodMode ? state.money : state.money - cost,
      nodes: state.nodes.map(n => n.id === id ? { ...n, level: n.level + 1, bandwidth: Math.floor(n.bandwidth * 1.4) } : n),
      logs: [`[SUCCESS] ${node.name} optimized (LVL ${node.level + 1}).`, ...state.logs].slice(0, 15)
    };
  }),
  selectNode: (id) => set({ selectedNodeId: id }),
  setRange: (level) => set({ rangeLevel: level }),
  addLog: (msg, isCritical = false) => set((state) => ({
    logs: [`[${new Date().toLocaleTimeString()}] ${isCritical ? '!!! ' : ''}${msg}`, ...state.logs].slice(0, 20)
  })),
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  setEra: (era) => set({ currentEra: era }),
  addMoney: (amount) => set((state) => ({ money: state.money + amount })),
  toggleGodMode: () => set((state) => ({ isGodMode: !state.isGodMode })),
  setTickRate: (rate) => set({ tickRate: rate }),
  resetTopology: () => set((state) => ({
    links: [],
    nodes: [
      { id: '0', name: 'Core Gateway', bandwidth: 100, traffic: 0, level: 1, layer: 1, x: 395, y: 260 },
      { id: 'l2-0', name: 'West Coast Hub', bandwidth: 200, traffic: 0, level: 1, layer: 2, x: 110, y: 280 },
      { id: 'l2-1', name: 'East Coast Hub', bandwidth: 200, traffic: 0, level: 1, layer: 2, x: 220, y: 280 },
      { id: 'l3-0', name: 'Sampa Hub', bandwidth: 1000, traffic: 0, level: 1, layer: 3, x: 265, y: 590 },
      { id: 'l3-1', name: 'Tokyo Exchange', bandwidth: 1000, traffic: 0, level: 1, layer: 3, x: 715, y: 290 },
      { id: 'l4-0', name: 'Transatlantic Cable', bandwidth: 5000, traffic: 0, level: 1, layer: 4, x: 300, y: 310 },
      { id: 'l4-1', name: 'Pacific Link', bandwidth: 2000, traffic: 0, level: 1, layer: 4, x: 730, y: 610 },
    ]
  })),
}));
