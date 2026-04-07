import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  maxLinkBandwidth: number;
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
  uiColor?: string;
}

export interface ISPLink {
  id: string;
  sourceId: string;
  targetId: string;
  bandwidth: number;
  type: 'cable' | 'fiber' | 'satellite';
  uiColor?: string;
}

export const STARTING_POINTS = {
  us_east: { name: "New York (US East)", x: 692, y: 333 },
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

export type DebtTier = 0 | 1 | 2 | 3;

export function getDebtTier(money: number): DebtTier {
  if (money < -5000) return 3;
  if (money < -2000) return 2;
  if (money < 0) return 1;
  return 0;
}

interface ISPStore {
  money: number;
  techPoints: number;
  tpAccumulator: number;
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
  activePaths: Record<string, { path: string[], destination: string, pathD: string, sessId: string }[]>;

  dragSourceId: string | null;
  dragPos: { x: number, y: number } | null;

  activeDevNodeType: string;
  repairNode: (id: string) => void;
  setActiveDevNodeType: (type: string) => void;

  isHubCreationEnabled: boolean;
  toggleHubCreation: () => void;
  isHubDeletionEnabled: boolean;
  toggleHubDeletion: () => void;

  // Debt escalation
  debtTier: DebtTier;
  emergencyLoanUsed: boolean;
  emergencyLoanActive: boolean;
  emergencyLoanTicksRemaining: number;

  tick: () => Promise<void>;
  removeNode: (id: string) => void;
  syncNodeMarkers: () => void;
  upgradeNode: (id: string) => void;
  addNode: (node: ISPNode) => void;
  setEra: (era: string) => void;
  forceEraUpgrade: () => void;
  canAdvanceEra: () => boolean;
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

  // Debt recovery actions
  sellLink: (linkId: string) => void;
  sellNode: (nodeId: string) => void;
  takeEmergencyLoan: () => void;
  isNonCore: (id: string) => boolean;
}

export const useISPStore = create<ISPStore>()(
  persist(
    (set, get) => ({
  money: 5000,
  techPoints: 50,
  tpAccumulator: 0,
  currentEra: '70s',
  canUpgradeEra: false,
  totalData: 0,
    nodes: [
      { id: '0', name: 'CORE GATEWAY', x: DEFAULT_START.x, y: DEFAULT_START.y, bandwidth: 300, baseBandwidth: 300, traffic: 0, level: 1, layer: 1, type: 'hub_local', health: 100, isCore: true },
      { id: 'l1-a', name: 'LOCAL TERMINAL A', x: DEFAULT_START.x + 15, y: DEFAULT_START.y - 15, bandwidth: 56, baseBandwidth: 56, traffic: 0, level: 1, layer: 1, type: 'terminal', health: 100, isCore: true },
      { id: 'l1-b', name: 'LOCAL TERMINAL B', x: DEFAULT_START.x - 15, y: DEFAULT_START.y + 15, bandwidth: 56, baseBandwidth: 56, traffic: 0, level: 1, layer: 1, type: 'terminal', health: 100, isCore: true },
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
  activePaths: {},
  dragSourceId: null,
  dragPos: null,
  activeDevNodeType: NODE_TEMPLATES[0].type,
  isHubCreationEnabled: false,
  isHubDeletionEnabled: false,
  debtTier: 0 as DebtTier,
  emergencyLoanUsed: false,
  emergencyLoanActive: false,
  emergencyLoanTicksRemaining: 0,

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
      const { nodes: workerNodes, revenue, totalMaintenanceCost, totalLoad, networkHealth, avgLatency } = e.data;
      const state = get();
      const { links } = state;
      
      // Restore bandwidth/baseBandwidth from store originals — the worker receives
      // tech-scaled bandwidth for physics but must not write it back (would compound).
      const nodes = workerNodes.map((n: ISPNode) => {
        const original = state.nodes.find(o => o.id === n.id);
        return {
          ...n,
          bandwidth: original?.bandwidth ?? n.bandwidth,
          baseBandwidth: original?.baseBandwidth ?? n.baseBandwidth
        };
      });
      const activeLinks = links.filter((link: ISPLink) => {
        const src = workerNodes.find((n: ISPNode) => n.id === link.sourceId);
        const tgt = workerNodes.find((n: ISPNode) => n.id === link.targetId);
        return src && src.traffic > 0 && tgt && tgt.traffic > 0;
      }).length;

      const activeTerminals = workerNodes.filter(
        (n: ISPNode) => n.type === 'terminal' && n.traffic > 0
      ).length;

      const tpGainPerSecond = (activeLinks * 0.05) + (activeTerminals * 0.02);
      const dT = state.tickRate / 1000;
      const currentAccumulator = typeof state.tpAccumulator === 'number' ? state.tpAccumulator : 0;
      const newTpAccumulator = currentAccumulator + (tpGainPerSecond * dT);
      const tpToAdd = Math.floor(newTpAccumulator);

      // Hardware Failure Detection
      const deadNodes = nodes.filter((n: ISPNode) => {
        const prev = state.nodes.find(p => p.id === n.id);
        return n.health <= 0 && (prev?.health ?? 100) > 0;
      });

      const newLogs = deadNodes.length > 0 
        ? deadNodes.map((n: ISPNode) => `!!! [CRITICAL] HARDWARE_FAILURE: ${n.name} OFFLINE !!!`)
        : [];

      // Debt escalation: apply penalties to revenue/OPEX
      const prevTier = state.debtTier;
      let effectiveRevenue = revenue;
      let effectiveOPEX = totalMaintenanceCost;
      if (!state.isGodMode && prevTier >= 1) {
        effectiveOPEX *= 1.2;   // +20% OPEX
        effectiveRevenue *= 0.9; // -10% revenue
      }

      let newMoney = state.isGodMode ? state.money : (state.money + effectiveRevenue - effectiveOPEX);

      // Emergency loan repayment: 500/min = ~8.33/sec
      let loanTicks = state.emergencyLoanTicksRemaining;
      let loanActive = state.emergencyLoanActive;
      if (loanActive && !state.isGodMode) {
        const loanCostPerSec = 500 / 60;
        newMoney -= loanCostPerSec * dT;
        loanTicks = Math.max(0, loanTicks - 1);
        if (loanTicks <= 0) loanActive = false;
      }

      const newTier = state.isGodMode ? 0 : getDebtTier(newMoney);
      const debtLogs: string[] = [];

      // Log threshold crossings
      if (newTier >= 1 && prevTier < 1) debtLogs.push('[DEBT] Operating costs rising. Cash flow negative.');
      if (newTier >= 2 && prevTier < 2) debtLogs.push('[DEBT] Hardware stress increasing. Node degrading.');
      if (newTier >= 3 && prevTier < 3) debtLogs.push('!!! [DEBT] Link severed due to missed payments. !!!');

      // Tier 2: random non-core node bandwidth -20%
      let debtNodes: ISPNode[] = nodes;
      if (!state.isGodMode && newTier >= 2) {
        const nonCoreNodes = debtNodes.filter((n: ISPNode) => !n.isCore);
        if (nonCoreNodes.length > 0) {
          const victim = nonCoreNodes[Math.floor(Math.random() * nonCoreNodes.length)];
          debtNodes = debtNodes.map((n: ISPNode) => n.id === victim.id
            ? { ...n, bandwidth: Math.floor(n.bandwidth * 0.998), baseBandwidth: Math.floor(n.baseBandwidth * 0.998) }
            : n
          );
        }
      }

      // Tier 3: sever a random non-core link (once per threshold crossing)
      let debtLinks = state.links;
      if (!state.isGodMode && newTier >= 3 && prevTier < 3) {
        const nonCoreLinks = debtLinks.filter((l: ISPLink) => {
          const src = debtNodes.find((n: ISPNode) => n.id === l.sourceId);
          const tgt = debtNodes.find((n: ISPNode) => n.id === l.targetId);
          return !(src?.isCore && tgt?.isCore);
        });
        if (nonCoreLinks.length > 0) {
          const victim = nonCoreLinks[Math.floor(Math.random() * nonCoreLinks.length)];
          debtLinks = debtLinks.filter(l => l.id !== victim.id);
          debtLogs.push(`[DEBT] Link ${victim.id} severed — missed payments.`);
        }
      }

      const allLogs = [...debtLogs, ...newLogs];

      set({
        nodes: debtNodes,
        links: debtLinks,
        money: newMoney,
        debtTier: newTier,
        emergencyLoanActive: loanActive,
        emergencyLoanTicksRemaining: loanTicks,
        totalData: state.totalData + Math.floor(totalLoad * (state.tickRate / 1000) * 125),
        techPoints: state.techPoints + tpToAdd,
        tpAccumulator: newTpAccumulator - tpToAdd,
        networkHealth,
        avgLatency,
        activePaths: e.data.activePaths || {},
        logs: allLogs.length > 0 ? [...allLogs, ...state.logs].slice(0, 20) : state.logs
      });
    };
    set({ worker });
  },

  tick: async () => {
    const { worker, nodes, links, rangeLevel, tickRate, initWorker, totalData, money } = get();
    if (!worker) { initWorker(); return; }
    
    const nextEra = get().getNextEraConfig();
    const canUpgrade = nextEra ? get().canAdvanceEra() : false;
    
    if (canUpgrade !== get().canUpgradeEra) set({ canUpgradeEra: canUpgrade });

    const era = get().getCurrentEraConfig();
    
    // Tech Tree: Calculate effective multipliers
    const multipliers = useTechStore.getState().getAggregateModifiers();
    
    // 1. Pass effective bandwidth to nodes — always derived from baseBandwidth (immutable)
    //    so the multiplier is applied once per tick and never compounds in the store.
    const nodesWithTech = nodes.map(n => ({
      ...n,
      bandwidth: Math.floor(n.baseBandwidth * multipliers.bandwidthMultiplier)
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
    const state = get();
    const nextEra = state.getNextEraConfig();
    if (!nextEra) return false;

    const { totalData, money, nodes, currentEra } = state;
    const basicConditions = totalData >= nextEra.unlockCondition.totalData && money >= nextEra.unlockCondition.money;

    // Era-specific milestone requirements (70s -> 80s)
    if (currentEra === '70s') {
      const hubCount = nodes.filter(n => n.type === 'hub_local').length;
      const unlockedTechs = useTechStore.getState().unlockedTechIds;
      const isdnUnlocked = unlockedTechs.includes('isdn_early');
      return basicConditions && hubCount >= 3 && isdnUnlocked;
    }

    // Default for other eras (Data + Money only for now)
    return basicConditions;
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

  repairNode: (id: string) => set((state) => {
    const node = state.nodes.find(n => n.id === id);
    if (!node || node.health >= 100) return state;
    
    const repairCost = 250; 
    if (!state.isGodMode && state.money < repairCost) return state;

    return {
      money: state.isGodMode ? state.money : state.money - repairCost,
      nodes: state.nodes.map(n => n.id === id ? { ...n, health: 100 } : n),
      logs: [`[SYSTEM] REPAIRED: ${node.name} [Cost: $${repairCost}]`, ...state.logs].slice(0, 15)
    };
  }),

  connectNodes: (srcId, tgtId) => {
    const state = get();
    const { valid, cost } = state.validateLink(srcId, tgtId);
    if (!valid && !state.isGodMode) return;

    const src = state.nodes.find(n => n.id === srcId);
    const tgt = state.nodes.find(n => n.id === tgtId);
    const era = state.getCurrentEraConfig();
    const type: ISPLink['type'] = 'cable';
    const bandwidth = Math.min(
      src?.bandwidth ?? era.maxLinkBandwidth,
      tgt?.bandwidth ?? era.maxLinkBandwidth,
      era.maxLinkBandwidth
    );

    const newLink: ISPLink = {
      id: `link-${Date.now()}`,
      sourceId: srcId,
      targetId: tgtId,
      bandwidth,
      type
    };

    set((s) => ({
      money: s.isGodMode ? s.money : s.money - (cost || 0),
      links: [...s.links, newLink],
      logs: [`SYS_LINK: NEW_LINK ${type.toUpperCase()} [BW: ${bandwidth}] [COST: $${cost}]`, ...s.logs].slice(0, 15)
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
  forceEraUpgrade: () => set((state) => {
    const nextEra = state.getNextEraConfig();
    if (!nextEra) return state;
    
    return {
      currentEra: nextEra.id,
      canUpgradeEra: false,
      logs: [`[DEV] Era forced to ${nextEra.displayName}`, ...state.logs].slice(0, 20)
    };
  }),
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
  isNonCore: (id: string) => {
    const state = get();
    const node = state.nodes.find(n => n.id === id);
    if (node) return !node.isCore;
    const link = state.links.find(l => l.id === id);
    if (link) {
      const src = state.nodes.find(n => n.id === link.sourceId);
      const tgt = state.nodes.find(n => n.id === link.targetId);
      return !(src?.isCore && tgt?.isCore);
    }
    return false;
  },

  sellLink: (linkId: string) => set((state) => {
    const link = state.links.find(l => l.id === linkId);
    if (!link) return state;
    const src = state.nodes.find(n => n.id === link.sourceId);
    const tgt = state.nodes.find(n => n.id === link.targetId);
    if (src?.isCore && tgt?.isCore) return state; // can't sell core links
    const refund = Math.floor(50 + 25); // ~50% of avg build cost
    return {
      links: state.links.filter(l => l.id !== linkId),
      money: state.money + refund,
      logs: [`[SELL] Link sold for $${refund}`, ...state.logs].slice(0, 20)
    };
  }),

  sellNode: (nodeId: string) => set((state) => {
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node || node.isCore) return state;
    const refund = Math.floor(150); // ~30% of avg build cost
    return {
      nodes: state.nodes.filter(n => n.id !== nodeId),
      links: state.links.filter(l => l.sourceId !== nodeId && l.targetId !== nodeId),
      money: state.money + refund,
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      logs: [`[SELL] ${node.name} sold for $${refund}. Connected links removed.`, ...state.logs].slice(0, 20)
    };
  }),

  takeEmergencyLoan: () => set((state) => {
    if (state.emergencyLoanUsed) return state;
    // 5000 cash, costs 500/min for 5 minutes. At 16ms tick rate: 5 * 60 * 1000 / 16 = 18750 ticks
    const loanTicks = Math.floor(5 * 60 * 1000 / state.tickRate);
    return {
      money: state.money + 5000,
      emergencyLoanUsed: true,
      emergencyLoanActive: true,
      emergencyLoanTicksRemaining: loanTicks,
      logs: ['[LOAN] Emergency loan: +$5,000. Repayment: $500/min for 5 minutes.', ...state.logs].slice(0, 20)
    };
  }),

  toggleGodMode: () => set((state) => ({ isGodMode: !state.isGodMode })),
  setTickRate: (rate) => set({ tickRate: rate }),
  resetTopology: () => set((state) => ({
    links: [],
    canUpgradeEra: false,
    tpAccumulator: 0,
    debtTier: 0 as DebtTier,
    emergencyLoanUsed: false,
    emergencyLoanActive: false,
    emergencyLoanTicksRemaining: 0,
    nodes: [
      { id: '0', name: 'CORE GATEWAY', x: DEFAULT_START.x, y: DEFAULT_START.y, bandwidth: 300, baseBandwidth: 300, traffic: 0, level: 1, layer: 1, type: 'hub_local', health: 100, isCore: true },
      { id: 'l1-a', name: 'LOCAL TERMINAL A', x: DEFAULT_START.x + 15, y: DEFAULT_START.y - 15, bandwidth: 56, baseBandwidth: 56, traffic: 0, level: 1, layer: 1, type: 'terminal', health: 100, isCore: true },
      { id: 'l1-b', name: 'LOCAL TERMINAL B', x: DEFAULT_START.x - 15, y: DEFAULT_START.y + 15, bandwidth: 56, baseBandwidth: 56, traffic: 0, level: 1, layer: 1, type: 'terminal', health: 100, isCore: true },
    ]
  })),
  }),
    {
      name: 'isp-game-v1',
      partialize: (state) => ({
        nodes: state.nodes,
        links: state.links,
        money: state.money,
        techPoints: state.techPoints,
        tpAccumulator: state.tpAccumulator,
        totalData: state.totalData,
        currentEra: state.currentEra,
        debtTier: state.debtTier,
        emergencyLoanUsed: state.emergencyLoanUsed,
        emergencyLoanActive: state.emergencyLoanActive,
        emergencyLoanTicksRemaining: state.emergencyLoanTicksRemaining,
      }),
    }
  )
);
