import { create } from 'zustand';

export type Era = '70s' | '90s' | 'modern';
export type RangeLevel = 1 | 2 | 3 | 4;
export type ISPNodeType = 'terminal' | 'hub_local' | 'hub_regional' | 'backbone';

export interface ISPNode {
  id: string;
  name: string;
  x: number;
  y: number;
  bandwidth: number;
  traffic: number;
  level: number;
  layer: number; // 1: Local, 2: Regional, 3: National, 4: Global
  type: ISPNodeType;
  health: number; // 0-100
  hazard?: 'noise' | 'heat' | 'congestion' | 'latency';
  region?: string;
  // Week 2 Physics
  latency?: number;
  signalStrength?: number;
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
  networkHealth: number;
  avgLatency: number;
  
  // Simulation Worker
  worker: Worker | null;
  initWorker: () => void;

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
  currentEra: '70s',
  totalData: 0,
  nodes: [
    { id: '0', name: 'CORE GATEWAY', x: 395, y: 260, bandwidth: 500, traffic: 0, level: 1, layer: 1, type: 'backbone', health: 100 },
    { id: 'l2-0', name: 'West Coast Hub', x: 110, y: 280, bandwidth: 200, traffic: 0, level: 1, layer: 2, type: 'hub_regional', health: 100 },
    { id: 'l2-1', name: 'East Coast Hub', x: 220, y: 280, bandwidth: 200, traffic: 0, level: 1, layer: 2, type: 'hub_regional', health: 100 },
    { id: 'l3-0', name: 'Sampa Hub', x: 265, y: 590, bandwidth: 1000, traffic: 0, level: 1, layer: 3, type: 'backbone', health: 100 },
    { id: 'l3-1', name: 'Tokyo Exchange', x: 715, y: 290, bandwidth: 1000, traffic: 0, level: 1, layer: 3, type: 'backbone', health: 100 },
    { id: 'l4-0', name: 'Transatlantic Cable', x: 300, y: 310, bandwidth: 5000, traffic: 0, level: 1, layer: 4, type: 'backbone', health: 100 },
    { id: 'l4-1', name: 'Pacific Link', x: 730, y: 610, bandwidth: 2000, traffic: 0, level: 1, layer: 4, type: 'backbone', health: 100 },
  ],
  links: [],
  selectedNodeId: null,
  isLinking: false,
  rangeLevel: 1,
  tickRate: 16,
  logs: ['[SYSTEM] Graph Topology Online. Connect nodes to Core to start revenue.'],
  isGodMode: false,
  networkHealth: 100,
  avgLatency: 0,

  worker: null,
  initWorker: () => {
    if (get().worker) return;
    const worker = new Worker(new URL('../systems/SimulationWorker.ts', import.meta.url));
    
    worker.onmessage = (e) => {
      const { nodes, revenue, totalMaintenanceCost, totalLoad, networkHealth, avgLatency } = e.data;
      const state = get();
      
      let recoveredMoney = state.money;
      if (state.money < -100 && !state.isGodMode) {
          recoveredMoney = 5000;
          set({ logs: [`[SYSTEM_RECOVERY] Resetting capital for Week 2 stability.`, ...state.logs].slice(0, 20) });
      }

      const newTotalData = state.totalData + Math.floor(totalLoad / 10);
      let nextEra = state.currentEra;
      const eraThresholds = { '90s': 50000, 'modern': 500000 };
      if (newTotalData > eraThresholds.modern) nextEra = 'modern';
      else if (newTotalData > eraThresholds['90s']) nextEra = '90s';

      if (revenue > 0 && Math.random() > 0.98) {
        set({ logs: [`[SYS_SYNC] REV: +$${revenue} | OPEX: -$${totalMaintenanceCost} | AVG_LATENCY: ${avgLatency}ms`, ...state.logs].slice(0, 20) });
      }

      set({ 
        nodes, 
        money: state.isGodMode ? state.money : (recoveredMoney + revenue - totalMaintenanceCost), 
        totalData: newTotalData,
        networkHealth,
        avgLatency,
        currentEra: nextEra
      });
    };
    
    set({ worker });
  },

  tick: () => {
    const { worker, nodes, links, rangeLevel, tickRate, initWorker } = get();
    if (!worker) {
        initWorker();
        return;
    }
    worker.postMessage({ nodes, links, rangeLevel, tickRate });
  },

  connectNodes: (srcId, tgtId) => set((state) => {
    const sId = String(srcId);
    const tId = String(tgtId);
    
    const src = state.nodes.find(n => String(n.id) === sId);
    const tgt = state.nodes.find(n => String(n.id) === tId);
    
    if (!src || !tgt || sId === tId) return state;

    if (state.links.some(l => (l.sourceId === sId && l.targetId === tId) || (l.sourceId === tId && l.targetId === sId))) {
      return { ...state, isLinking: false, logs: [`[ERROR] Redundant link bypassed.`, ...state.logs].slice(0, 15) };
    }

    const hierarchy = {
      'terminal': 0, 'hub_local': 1, 'hub_regional': 2, 'backbone': 3
    };
    const getHierarchy = (node: ISPNode) => hierarchy[node.type] ?? (node.id === '0' ? 3 : 2);
    
    const diff = Math.abs(getHierarchy(src) - getHierarchy(tgt));
    const isPeer = getHierarchy(src) === getHierarchy(tgt) && getHierarchy(src) !== 0;
    const isParentChild = diff === 1;

    if (!isPeer && !isParentChild && !state.isGodMode) {
        return { ...state, isLinking: false, logs: [`[ERROR] Incompatible hierarchy: ${src.type} to ${tgt.type}`, ...state.logs].slice(0, 15) };
    }

    const dist = Math.sqrt(Math.pow(src.x - tgt.x, 2) + Math.pow(src.y - tgt.y, 2));
    const cost = Math.floor(100 + (dist * 1.5));
    
    if (!state.isGodMode && state.money < cost) {
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
      money: state.isGodMode ? state.money : state.money - cost,
      links: [...state.links, newLink],
      isLinking: false,
      logs: [`SYS_INIT: NEW_FIBER_LINK [ID: ${newLink.id.slice(-4)}] [LATENCY_PENALTY: ${Math.round(dist/10)}ms]`, ...state.logs].slice(0, 15)
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
      logs: [`SYS_UPGRADE: ${node.name} [BANDWIDTH_BOOST: +40%] [COST: $${cost}]`, ...state.logs].slice(0, 15)
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
      { id: '0', name: 'CORE GATEWAY', x: 395, y: 260, bandwidth: 500, traffic: 0, level: 1, layer: 1, type: 'backbone', health: 100 },
      { id: 'l2-0', name: 'West Coast Hub', x: 110, y: 280, bandwidth: 200, traffic: 0, level: 1, layer: 2, type: 'hub_regional', health: 100 },
      { id: 'l2-1', name: 'East Coast Hub', x: 220, y: 280, bandwidth: 200, traffic: 0, level: 1, layer: 2, type: 'hub_regional', health: 100 },
    ]
  })),
}));
