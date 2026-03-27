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
  totalData: 0,
  nodes: [
    { id: '0', name: 'CORE GATEWAY', x: 350, y: 350, bandwidth: 500, traffic: 0, level: 1, layer: 1, type: 'backbone', health: 100 },
    { id: '1', name: 'EAST COAST HUB', x: 280, y: 520, bandwidth: 100, traffic: 0, level: 1, layer: 2, type: 'hub_regional', health: 100 },
    { id: '2', name: 'WEST COAST HUB', x: 15, y: 520, bandwidth: 100, traffic: 0, level: 1, layer: 2, type: 'hub_regional', health: 100 },
  ],
  links: [],
  selectedNodeId: null,
  isLinking: false,
  rangeLevel: 1,
  currentEra: 'modern',
  tickRate: 1000,
  logs: ["Graph Topology Online. Connect nodes to Core to start revenue."],
  isGodMode: false,
  networkHealth: 100,

  tick: () => {
    set((state) => {
      const { nodes, links, rangeLevel, money, totalData, isGodMode, addLog } = get();

      const core = nodes.find(n => n.id === '0');
      const reachableIds = new Set<string>();
      
      if (core) {
        const queue = [core.id];
        reachableIds.add(core.id);
        while (queue.length > 0) {
          const currentId = queue.shift()!;
          const neighbors = links
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

      const trafficUpdatedNodes = nodes.map(node => {
        if (!reachableIds.has(node.id)) return { ...node, traffic: 0 };
        const targetScaling = node.layer === 1 ? 0.1 : 0.5;
        const targetTraffic = node.bandwidth * (targetScaling + Math.random() * 0.3);
        const drift = (targetTraffic - node.traffic) * 0.15;
        return { ...node, traffic: Math.max(10, Math.min(node.traffic + drift, node.bandwidth * 1.5)) };
      });

      // --- SURVIVAL ENGINE: HAZARDS & HEALTH ---
      let healthSum = 0;
      const updatedNodes = trafficUpdatedNodes.map(node => {
        let nodeHealth = 100;
        let activeHazard: ISPNode['hazard'] = undefined;

        // 1. Noise Hazard (Distance/Layer)
        if (node.layer >= 3) { // Regional/National
            const load = node.traffic / node.bandwidth;
            if (load > 0.8) {
                nodeHealth -= (load - 0.8) * 100;
                activeHazard = 'congestion';
            }
        }

        // 2. Thermal Hazard (Regional Focus)
        if (rangeLevel === 2 && node.layer === 2) {
            nodeHealth -= 5; // Passive heat
            activeHazard = 'heat';
        }

        const finalHealth = Math.max(0, nodeHealth);
        healthSum += finalHealth;
        return { ...node, health: finalHealth, hazard: activeHazard };
      });

      const avgHealth = updatedNodes.length > 0 ? healthSum / updatedNodes.length : 100;
      const healthMultiplier = avgHealth < 50 ? 0.5 : 1.0;

      // --- REVENUE CALCULATION ---
      const totalRevenue = updatedNodes.reduce((acc, node) => {
        if (node.id === '0' || node.traffic === 0) return acc;
        
        const isFocused = node.layer === rangeLevel;
        const efficiency = isFocused ? 0.8 : 0.2;
        const nodeRevenue = (node.traffic * 0.1) * efficiency * healthMultiplier;
        
        return acc + nodeRevenue;
      }, 0);

      const newTotalData = totalData + updatedNodes.reduce((s, n) => s + n.traffic, 0);
      let nextEra = state.currentEra;
      if (newTotalData > 500000) nextEra = 'modern';
      else if (newTotalData > 50000) nextEra = '90s';

      const timestamp = new Date().toLocaleTimeString();
      let newLogs = [...state.logs];
      
      if (totalRevenue > 0 && Math.random() > 0.8) {
        newLogs = [`[${timestamp}] Revenue: +$${Math.floor(totalRevenue)} (Combined Focus)`, ...newLogs].slice(0, 20);
      }

      return { 
        nodes: updatedNodes,
        money: money + (isGodMode ? 0 : totalRevenue),
        totalData: newTotalData,
        networkHealth: avgHealth,
        currentEra: nextEra,
        logs: newLogs
      };
    });
  },

  connectNodes: (srcId, tgtId) => set((state) => {
    const { nodes, links, isGodMode, addLog } = get();
    const sId = String(srcId);
    const tId = String(tgtId);
    if (links.some(l => (l.sourceId === sId && l.targetId === tId) || (l.sourceId === tId && l.targetId === sId))) return state;

    const source = nodes.find(n => String(n.id) === sId);
    const target = nodes.find(n => String(n.id) === tId);
    if (!source || !target || sId === tId) return state;

    // Hierarchy Validation
    const hierarchy = {
        'terminal': 0,
        'hub_local': 1,
        'hub_regional': 2,
        'backbone': 3
    };

    const diff = Math.abs(hierarchy[source.type] - hierarchy[target.type]);
    const isPeer = source.type === target.type && source.type !== 'terminal';
    const isParentChild = diff === 1;

    if (!isPeer && !isParentChild && !isGodMode) {
        addLog(`INCOMPATIBLE HIERARCHY: ${source.type} cannot link to ${target.type}`, true);
        return { ...state, isLinking: false };
    }

    const dist = Math.sqrt(Math.pow(source.x - target.x, 2) + Math.pow(source.y - target.y, 2));
    const cost = Math.floor(100 + (dist * 1.5));
    
    if (!isGodMode && state.money < cost) {
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
      { id: '0', name: 'CORE GATEWAY', x: 350, y: 350, bandwidth: 500, traffic: 0, level: 1, layer: 1, type: 'backbone', health: 100 },
      { id: '1', name: 'EAST COAST HUB', x: 280, y: 520, bandwidth: 100, traffic: 0, level: 1, layer: 2, type: 'hub_regional', health: 100 },
      { id: '2', name: 'WEST COAST HUB', x: 15, y: 520, bandwidth: 100, traffic: 0, level: 1, layer: 2, type: 'hub_regional', health: 100 },
    ]
  })),
}));
