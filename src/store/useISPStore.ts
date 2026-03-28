import { create } from 'zustand';
import eraConfigData from '../config/eraConfig.json';

export interface EraConfig {
  id: string;
  displayName: string;
  startYear: number;
  endYear: number;
  uiTheme: string;
  unlockedHardware: string[];
  modifiers: {
    signalAttenuation: number;
    revenueMultiplier: number;
    maintenanceCost: number;
  };
  unlockCondition: { totalData: number; money: number };
}

export const ERAS_CONFIG = eraConfigData.eras as EraConfig[];

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
  latency?: number;
  signalStrength?: number;
}
export interface DemandCell {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'residential' | 'commercial' | 'industrial' | 'empty';
  trafficBase: number;
  revenueBase: number;
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
  currentEra: string;
  canUpgradeEra: boolean;
  nodes: ISPNode[];
  links: ISPLink[];
  totalData: number;
  demandGrid: DemandCell[];
  logs: string[];
  rangeLevel: RangeLevel;
  currentScale: 'local' | 'regional' | 'national' | 'global';
  selectedNodeId: string | null;
  isLinking: boolean;
  isGodMode: boolean;
  tickRate: number;
  networkHealth: number;
  avgLatency: number;
  
  // Drag-to-Connect state
  dragSourceId: string | null;
  dragPos: { x: number, y: number } | null;

  // Actions
  tick: () => void;
  upgradeNode: (id: string) => void;
  addNode: (node: ISPNode) => void;
  setEra: (era: string) => void;
  purchaseEraUpgrade: () => void;
  getCurrentEraConfig: () => EraConfig;
  getNextEraConfig: () => EraConfig | null;
  addLog: (msg: string, isCritical?: boolean) => void;
  setRange: (level: RangeLevel) => void;
  selectNode: (id: string | null) => void;
  connectNodes: (sourceId: string, targetId: string) => void;
  toggleLinking: () => void;
  
  // Drag Actions
  startDragging: (id: string) => void;
  setDragPos: (x: number, y: number) => void;
  endDragging: (targetId?: string) => void;
  validateLink: (srcId: string, tgtId: string) => { valid: boolean, error?: string, cost?: number };

  // Simulation Worker
  worker: Worker | null;
  initWorker: () => void;

  // Debug Actions
  addMoney: (amount: number) => void;
  resetTopology: () => void;
  toggleGodMode: () => void;
  setTickRate: (rate: number) => void;
  generateDemand: () => void;
}

export const useISPStore = create<ISPStore>((set, get) => ({
  money: 5000,
  currentEra: '70s',
  canUpgradeEra: false,
  totalData: 0,
  demandGrid: [],
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
  rangeLevel: 4,
  currentScale: 'global',
  tickRate: 16,
  logs: ['[SYSTEM] Graph Topology Online. Drag a node to Connect or Build.'],
  isGodMode: false,
  networkHealth: 100,
  avgLatency: 0,
  dragSourceId: null,
  dragPos: null,

  getCurrentEraConfig: () => {
    const eraId = get().currentEra;
    return ERAS_CONFIG.find(e => e.id === eraId) || ERAS_CONFIG[0];
  },

  getNextEraConfig: () => {
    const eraId = get().currentEra;
    const currentIndex = ERAS_CONFIG.findIndex(e => e.id === eraId);
    if (currentIndex >= 0 && currentIndex < ERAS_CONFIG.length - 1) {
      return ERAS_CONFIG[currentIndex + 1];
    }
    return null;
  },

  worker: null,
  initWorker: () => {
    if (get().worker) return;
    get().generateDemand();
    const worker = new Worker(new URL('../systems/SimulationWorker.ts', import.meta.url));
    worker.onmessage = (e) => {
      const { nodes, revenue, totalMaintenanceCost, totalLoad, networkHealth, avgLatency } = e.data;
      const state = get();
      const eraConfig = state.getCurrentEraConfig();
      const adjustedRevenue = revenue * eraConfig.modifiers.revenueMultiplier;
      const adjustedCost = totalMaintenanceCost * eraConfig.modifiers.maintenanceCost;

      set({ 
        nodes, 
        money: state.isGodMode ? state.money : (state.money + adjustedRevenue - adjustedCost), 
        totalData: state.totalData + Math.floor(totalLoad / 10),
        networkHealth,
        avgLatency
      });
    };
    set({ worker });
  },

  tick: () => {
    const { worker, nodes, links, rangeLevel, tickRate, initWorker, totalData, money } = get();
    if (!worker) { initWorker(); return; }
    
    // Check for Era Upgrade availability
    const nextEra = get().getNextEraConfig();
    const canUpgrade = nextEra ? (totalData >= nextEra.unlockCondition.totalData && money >= nextEra.unlockCondition.money) : false;
    
    if (canUpgrade !== get().canUpgradeEra) {
      set({ canUpgradeEra: canUpgrade });
    }

    // Sync worker with latest global state
    const eraConfig = get().getCurrentEraConfig();
    const demandGrid = get().demandGrid;
    worker.postMessage({ nodes, links, rangeLevel, tickRate, demandGrid, era: eraConfig });
  },

  validateLink: (srcId, tgtId) => {
    const state = get();
    const src = state.nodes.find(n => n.id === srcId);
    const tgt = state.nodes.find(n => n.id === tgtId);
    if (!src || !tgt || srcId === tgtId) return { valid: false, error: 'INCOMPATIBLE' };
    
    if (state.links.some(l => (l.sourceId === srcId && l.targetId === tgtId) || (l.sourceId === tgtId && l.targetId === srcId))) {
      return { valid: false, error: 'REDUNDANT' };
    }

    const hierarchy = { 'terminal': 0, 'hub_local': 1, 'hub_regional': 2, 'backbone': 3 };
    const getHierarchy = (node: ISPNode) => hierarchy[node.type] ?? (node.id === '0' ? 3 : 2);
    const diff = Math.abs(getHierarchy(src) - getHierarchy(tgt));
    const isPeer = getHierarchy(src) === getHierarchy(tgt) && getHierarchy(src) !== 0;
    if (!isPeer && diff !== 1 && !state.isGodMode) return { valid: false, error: 'HIERARCHY' };

    const dist = Math.sqrt(Math.pow(src.x - tgt.x, 2) + Math.pow(src.y - tgt.y, 2));
    const maxDist = 350; // Week 2 Attenuation limit prototype
    if (dist > maxDist && !state.isGodMode) return { valid: false, error: 'RANGE' };

    const cost = Math.floor(100 + (dist * 1.5));
    if (!state.isGodMode && state.money < cost) return { valid: false, error: 'CAPITAL' };

    return { valid: true, cost };
  },

  startDragging: (id) => set({ dragSourceId: id, selectedNodeId: id }),
  setDragPos: (x, y) => set({ dragPos: { x, y } }),
  endDragging: (targetId) => {
    const { dragSourceId, validateLink, connectNodes } = get();
    if (dragSourceId && targetId) {
       const { valid } = validateLink(dragSourceId, targetId);
       if (valid) connectNodes(dragSourceId, targetId);
    }
    set({ dragSourceId: null, dragPos: null });
  },

  connectNodes: (srcId, tgtId) => {
    const { valid, cost } = get().validateLink(srcId, tgtId);
    if (!valid && !get().isGodMode) return;
    
    const newLink: ISPLink = {
      id: `link-${Date.now()}`,
      sourceId: srcId,
      targetId: tgtId,
      bandwidth: 1000,
      type: 'fiber'
    };

    set((state) => ({
      money: state.isGodMode ? state.money : state.money - (cost || 0),
      links: [...state.links, newLink],
      logs: [`SYS_INIT: NEW_LINK [ID: ${newLink.id.slice(-4)}] [COST: $${cost}]`, ...state.logs].slice(0, 15)
    }));
  },

  toggleLinking: () => set(state => ({ isLinking: !state.isLinking })),
  upgradeNode: (id) => set((state) => {
    const node = state.nodes.find(n => n.id === id);
    if (!node) return state;
    const cost = Math.floor(50 * Math.pow(1.15, node.level));
    if (!state.isGodMode && state.money < cost) return state;
    return {
      money: state.isGodMode ? state.money : state.money - cost,
      nodes: state.nodes.map(n => n.id === id ? { ...n, level: n.level + 1, bandwidth: Math.floor(n.bandwidth * 1.4) } : n),
      logs: [`SYS_UPGRADE: ${node.name} [LVL ${node.level + 1}]`, ...state.logs].slice(0, 15)
    };
  }),
  selectNode: (id) => set({ selectedNodeId: id }),
  setRange: (level) => {
    const scaleMap: Record<number, 'local' | 'regional' | 'national' | 'global'> = {
      1: 'local', 2: 'regional', 3: 'national', 4: 'global'
    };
    set({ rangeLevel: level, currentScale: scaleMap[level] || 'global' });
  },
  addLog: (msg, isCritical = false) => set((state) => ({
    logs: [`[${new Date().toLocaleTimeString()}] ${isCritical ? '!!! ' : ''}${msg}`, ...state.logs].slice(0, 20)
  })),
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  setEra: (era) => set({ currentEra: era }),
  purchaseEraUpgrade: () => set((state) => {
    const nextEra = state.getNextEraConfig();
    if (!nextEra || !state.canUpgradeEra) return state;
    
    return {
      money: state.isGodMode ? state.money : state.money - nextEra.unlockCondition.money,
      currentEra: nextEra.id,
      canUpgradeEra: false,
      logs: [`[SYS_UPGRADE] Epoch Shifted: ${nextEra.displayName}`, ...state.logs].slice(0, 20)
    };
  }),
  addMoney: (amount) => set((state) => ({ money: state.money + amount })),
  toggleGodMode: () => set((state) => ({ isGodMode: !state.isGodMode })),
  setTickRate: (rate) => set({ tickRate: rate }),
  resetTopology: () => set((state) => ({
    links: [],
    nodes: [
      { id: '0', name: 'CORE GATEWAY', x: 395, y: 260, bandwidth: 500, traffic: 0, level: 1, layer: 1, type: 'backbone', health: 100 },
    ]
  })),
  generateDemand: () => {
    const cells: DemandCell[] = [];
    const size = 40;
    const cols = 800 / size;
    const rows = 800 / size;
    
    // Procedural Seed: 3 industrial epicenters
    const hotspots = Array.from({length: 3}).map(() => ({
       x: Math.floor(Math.random() * cols) * size,
       y: Math.floor(Math.random() * rows) * size
    }));

    for(let i=0; i<cols; i++) {
       for(let j=0; j<rows; j++) {
          const cx = i * size;
          const cy = j * size;
          
          let minDist = Math.min(...hotspots.map(h => Math.hypot(h.x - cx, h.y - cy)));

          let type: 'residential' | 'commercial' | 'industrial' | 'empty' = 'empty';
          let trafficBase = 0;
          let revenueBase = 0;

          if (minDist < size * 2.5) {
             type = 'industrial';
             trafficBase = 150;
             revenueBase = 50;
          } else if (minDist < size * 5) {
             type = 'commercial';
             trafficBase = 50;
             revenueBase = 25;
          } else if (minDist < size * 9) {
             type = 'residential';
             trafficBase = 15;
             revenueBase = 8;
          }

          if (type !== 'empty') {
            cells.push({ x: cx, y: cy, width: size, height: size, type, trafficBase, revenueBase });
          }
       }
    }
    set({ demandGrid: cells });
  },
}));
