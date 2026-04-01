import { create } from 'zustand';
import eraConfigData from '../config/eraConfig.json';
import { NODE_TEMPLATES } from '../config/nodeRegistry';
import type { ISPNodeType } from '../config/nodeRegistry';
import { useTechStore } from './useTechStore';

export type { ISPNodeType };

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

export interface ISPNode {
  id: string;
  name: string;
  x: number;
  y: number;
  bandwidth: number;
  baseBandwidth: number;
  traffic: number;
  level: number;
  layer: number; // 1: Local, 2: Regional, 3: National, 4: Global
  type: ISPNodeType;
  health: number; // 0-100
  hazard?: 'noise' | 'heat' | 'congestion' | 'latency';
  region?: string;
  latency?: number;
  signalStrength?: number;
  isDevSpawned?: boolean;
  isCore?: boolean;
}

export interface ISPLink {
  id: string;
  sourceId: string;
  targetId: string;
  bandwidth: number;
  type: 'cable' | 'fiber' | 'satellite';
}

export const STARTING_POINTS = {
  us_east: { name: "New York (US East)", x: 248, y: 318 },
  us_west: { name: "San Francisco (US West)", x: 110, y: 280 },
  europe: { name: "London (Europe)", x: 410, y: 210 },
  sampa: { name: "São Paulo (LATAM)", x: 265, y: 590 },
  tokyo: { name: "Tokyo (APAC)", x: 715, y: 290 }
} as const;

export const DEFAULT_START = STARTING_POINTS.us_east;

export const RANGE_PRESETS = {
  1: { name: 'LOCAL', viewBox: `${DEFAULT_START.x - 60} ${DEFAULT_START.y - 60} 120 120`, tier: 1 },
  2: { name: 'REGIONAL', viewBox: '50 100 400 300', tier: 2 },
  3: { name: 'NATIONAL', viewBox: '0 0 800 600', tier: 3 },
  4: { name: 'GLOBAL', viewBox: '0 0 800 800', tier: 4 },
} as const;

interface ISPStore {
  money: number;
  techPoints: number;
  currentEra: string;
  canUpgradeEra: boolean;
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
  
  dragSourceId: string | null;
  dragPos: { x: number, y: number } | null;

  activeDevNodeType: string;
  setActiveDevNodeType: (type: string) => void;

  isHubCreationEnabled: boolean;
  toggleHubCreation: () => void;
  isHubDeletionEnabled: boolean;
  toggleHubDeletion: () => void;

  tick: () => Promise<void>;
  removeNode: (id: string) => void;
  syncNodeMarkers: () => void;
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
  
  startDragging: (id: string) => void;
  setDragPos: (x: number, y: number) => void;
  endDragging: (targetId?: string) => void;
  validateLink: (srcId: string, tgtId: string) => { valid: boolean, error?: string, cost?: number };

  worker: Worker | null;
  initWorker: () => void;

  addMoney: (amount: number) => void;
  addTechPoints: (amount: number) => void;
  resetTopology: () => void;
  toggleGodMode: () => void;
  setTickRate: (rate: number) => void;
}

export const useISPStore = create<ISPStore>((set, get) => ({
  money: 5000,
  techPoints: 50,
  currentEra: '70s',
  canUpgradeEra: false,
  totalData: 0,
  nodes: [
    { id: '0', name: 'CORE GATEWAY', x: DEFAULT_START.x, y: DEFAULT_START.y, bandwidth: 500, baseBandwidth: 500, traffic: 0, level: 1, layer: 1, type: 'hub_local', health: 100, isCore: true },
    { id: 'l1-a', name: 'LOCAL TERMINAL A', x: DEFAULT_START.x + 15, y: DEFAULT_START.y - 15, bandwidth: 100, baseBandwidth: 100, traffic: 0, level: 1, layer: 1, type: 'terminal', health: 100, isCore: true },
    { id: 'l1-b', name: 'LOCAL TERMINAL B', x: DEFAULT_START.x - 15, y: DEFAULT_START.y + 15, bandwidth: 100, baseBandwidth: 100, traffic: 0, level: 1, layer: 1, type: 'terminal', health: 100, isCore: true },
  ],
  links: [],
  selectedNodeId: null,
  isLinking: false,
  rangeLevel: 1,
  tickRate: 16,
  logs: ['[SYSTEM] Graph Topology Online.'],
  isGodMode: false,
  networkHealth: 100,
  avgLatency: 0,
  dragSourceId: null,
  dragPos: null,
  activeDevNodeType: NODE_TEMPLATES[0].type,
  isHubCreationEnabled: false,
  isHubDeletionEnabled: false,

  setActiveDevNodeType: (type: string) => {
    if (NODE_TEMPLATES.some(t => t.type === type)) {
      set({ activeDevNodeType: type });
    } else {
      console.warn(`[DEV] Attempted to set invalid node type: ${type}`);
    }
  },

  toggleHubCreation: () => set(state => ({ 
    isHubCreationEnabled: !state.isHubCreationEnabled, 
    isHubDeletionEnabled: false 
  })),

  toggleHubDeletion: () => set(state => ({ 
    isHubDeletionEnabled: !state.isHubDeletionEnabled, 
    isHubCreationEnabled: false 
  })),

  getCurrentEraConfig: () => ERAS_CONFIG.find(e => e.id === get().currentEra) || ERAS_CONFIG[0],

  getNextEraConfig: () => {
    const eraId = get().currentEra;
    const currentIndex = ERAS_CONFIG.findIndex(e => e.id === eraId);
    return (currentIndex >= 0 && currentIndex < ERAS_CONFIG.length - 1) ? ERAS_CONFIG[currentIndex + 1] : null;
  },

  worker: null,
  initWorker: () => {
    if (get().worker) return;
    const worker = new Worker(new URL('../systems/SimulationWorker.ts', import.meta.url));
    worker.onmessage = (e) => {
      const { nodes, revenue, totalMaintenanceCost, totalLoad, networkHealth, avgLatency } = e.data;
      const state = get();
      set({ 
        nodes, 
        money: state.isGodMode ? state.money : (state.money + revenue - totalMaintenanceCost), 
        totalData: state.totalData + Math.floor(totalLoad / 10),
        networkHealth,
        avgLatency
      });
    };
    set({ worker });
  },

  tick: async () => {
    const { worker, nodes, links, rangeLevel, tickRate, initWorker, totalData, money } = get();
    if (!worker) { initWorker(); return; }
    
    const nextEra = get().getNextEraConfig();
    const canUpgrade = nextEra ? (totalData >= nextEra.unlockCondition.totalData && money >= nextEra.unlockCondition.money) : false;
    
    if (canUpgrade !== get().canUpgradeEra) set({ canUpgradeEra: canUpgrade });

    // TP generation
    const allNodes = nodes.length;
    const activeNodes = nodes.filter(n => n.traffic > 0).length;
    const tpGain = Math.max(1, Math.floor((allNodes * 0.1) + (activeNodes * 0.4)));
    if (tpGain > 0) {
      get().addTechPoints(tpGain);
    }

    const era = get().getCurrentEraConfig();
    
    // Tech Tree: Calculate effective multipliers
    const multipliers = useTechStore.getState().getAggregateModifiers();
    
    // 1. Pass effective bandwidth to nodes
    const nodesWithTech = nodes.map(n => ({
      ...n,
      bandwidth: Math.floor(n.bandwidth * multipliers.bandwidthMultiplier)
    }));

    // 2. Pass effective bandwidth/latency to links for routing
    const linksWithTech = links.map(l => ({
      ...l,
      bandwidth: Math.floor(l.bandwidth * multipliers.bandwidthMultiplier)
    }));

    worker.postMessage({ 
      nodes: nodesWithTech, 
      links: linksWithTech, 
      rangeLevel, 
      tickRate, 
      era,
      techModifiers: multipliers 
    });
  },

  canAdvanceEra: () => {
    const nextEra = get().getNextEraConfig();
    if (!nextEra) return false;
    const { totalData, money } = get();
    return totalData >= nextEra.unlockCondition.totalData && money >= nextEra.unlockCondition.money;
  },

  validateLink: (srcId, tgtId) => {
    const state = get();
    const src = state.nodes.find(n => n.id === srcId);
    const tgt = state.nodes.find(n => n.id === tgtId);
    if (!src || !tgt || srcId === tgtId) return { valid: false, error: 'INCOMPATIBLE' };
    
    if (state.links.some(l => (l.sourceId === srcId && l.targetId === tgtId) || (l.sourceId === tgtId && l.targetId === srcId))) {
      return { valid: false, error: 'REDUNDANT' };
    }

    const hierarchy: Record<string, number> = { 'terminal': 0, 'hub_local': 1, 'hub_regional': 2, 'backbone': 3 };
    const getHierarchy = (node: ISPNode) => hierarchy[node.type] ?? 0;
    const diff = Math.abs(getHierarchy(src) - getHierarchy(tgt));
    const isPeer = getHierarchy(src) === getHierarchy(tgt) && getHierarchy(src) !== 0;
    if (!isPeer && diff !== 1 && !state.isGodMode) return { valid: false, error: 'HIERARCHY' };

    const dist = Math.sqrt(Math.pow(src.x - tgt.x, 2) + Math.pow(src.y - tgt.y, 2));
    const techModifiers = useTechStore.getState().getAggregateModifiers();
    const maxDist = techModifiers.maxDistance; 
    
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
      type: 'cable'
    };

    set((state) => ({
      money: state.isGodMode ? state.money : state.money - (cost || 0),
      links: [...state.links, newLink],
      logs: [`SYS_LINK: NEW_LINK [COST: $${cost}]`, ...state.logs].slice(0, 15)
    }));
  },

  removeNode: (id: string) => {
    const node = get().nodes.find(n => n.id === id);
    if (node?.isDevSpawned === true && node.isCore !== true) {
      set(state => ({
        nodes: state.nodes.filter(n => n.id !== id),
        links: state.links.filter(l => l.sourceId !== id && l.targetId !== id),
        selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
        dragSourceId: state.dragSourceId === id ? null : state.dragSourceId,
        logs: [`[SYSTEM] Hub ${id} removed by dev tool`, ...state.logs].slice(0, 15)
      }));
    }
  },

  syncNodeMarkers: () => set(state => {
    let rescuedCount = 0;
    const newNodes = state.nodes.map(n => {
      if (!n.isCore && !n.isDevSpawned) {
        rescuedCount++;
        return { ...n, isDevSpawned: true };
      }
      return n;
    });
    return {
      nodes: newNodes,
      logs: [`[DEV] ${rescuedCount} nodes rescued and marked as deletable`, ...state.logs].slice(0, 20)
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
      nodes: state.nodes.map(n => n.id === id ? { 
        ...n, 
        level: n.level + 1, 
        bandwidth: Math.floor(n.baseBandwidth * Math.pow(1.4, n.level)) 
      } : n),
      logs: [`SYS_UPGRADE: ${node.name} [LVL ${node.level + 1}]`, ...state.logs].slice(0, 15)
    };
  }),
  selectNode: (id) => set({ selectedNodeId: id }),
  setRange: (level) => set({ rangeLevel: level }),
  addLog: (msg, isCritical = false) => set((state) => ({
    logs: [`[${new Date().toLocaleTimeString()}] ${isCritical ? '!!! ' : ''}${msg}`, ...state.logs].slice(0, 20)
  })),
  addNode: (node) => set((state) => {
    const template = NODE_TEMPLATES.find(t => t.type === node.type);
    const baseBandwidth = template?.baseBandwidth ?? node.bandwidth;
    return { nodes: [...state.nodes, { ...node, baseBandwidth, isDevSpawned: true }] };
  }),
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
  addTechPoints: (amount) => set((state) => ({ 
    techPoints: Math.max(0, state.techPoints + amount) 
  })),
  toggleGodMode: () => set((state) => ({ isGodMode: !state.isGodMode })),
  setTickRate: (rate) => set({ tickRate: rate }),
  resetTopology: () => set((state) => ({
    links: [],
    canUpgradeEra: false,
    nodes: [
      { id: '0', name: 'CORE GATEWAY', x: DEFAULT_START.x, y: DEFAULT_START.y, bandwidth: 500, baseBandwidth: 500, traffic: 0, level: 1, layer: 1, type: 'hub_local', health: 100, isCore: true },
      { id: 'l1-a', name: 'LOCAL TERMINAL A', x: DEFAULT_START.x + 15, y: DEFAULT_START.y - 15, bandwidth: 100, baseBandwidth: 100, traffic: 0, level: 1, layer: 1, type: 'terminal', health: 100, isCore: true },
      { id: 'l1-b', name: 'LOCAL TERMINAL B', x: DEFAULT_START.x - 15, y: DEFAULT_START.y + 15, bandwidth: 100, baseBandwidth: 100, traffic: 0, level: 1, layer: 1, type: 'terminal', health: 100, isCore: true },
    ]
  })),
}));
