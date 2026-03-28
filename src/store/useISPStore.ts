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
  tickRate: 1000,
  logs: ['[SYSTEM] Graph Topology Online. Connect nodes to Core to start revenue.'],
  isGodMode: false,
  networkHealth: 100,

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

      // 2. Sim Loop: Node Traffic and OPEX calculations
      let totalMaintenanceCost = 0;
      let healthSum = 0;
      
      const updatedNodes = state.nodes.map(node => {
        // --- OPEX Logic (dev) ---
        const baseCost = node.layer === 1 ? 50 : node.layer === 2 ? 20 : node.layer === 3 ? 10 : 5;
        totalMaintenanceCost += Math.floor(baseCost * Math.pow(1.1, node.level - 1));

        if (!reachableIds.has(node.id)) return { ...node, traffic: 0, health: 100, hazard: undefined };

        // --- Traffic Drift (dev) ---
        const targetScaling = node.layer === 1 ? 0.1 : 0.5;
        const targetTraffic = node.bandwidth * (targetScaling + Math.random() * 0.3);
        const drift = (targetTraffic - node.traffic) * 0.15;
        const finalTraffic = Math.max(10, Math.min(node.traffic + drift, node.bandwidth * 1.5));

        // --- Survival Engine: Hazards & Health (HEAD) ---
        let nodeHealth = 100;
        let activeHazard: ISPNode['hazard'] = undefined;
        const loadRatio = finalTraffic / node.bandwidth;

        if (loadRatio > 0.8) {
            nodeHealth -= (loadRatio - 0.8) * 100;
            activeHazard = 'congestion';
        }

        if (state.rangeLevel === 2 && node.layer === 2) {
            nodeHealth -= 5; // Passive heat in Regional view
            activeHazard = 'heat';
        }

        const finalHealth = Math.round(Math.max(0, nodeHealth));
        healthSum += finalHealth;

        return { 
          ...node, 
          traffic: finalTraffic, 
          health: finalHealth, 
          hazard: activeHazard 
        };
      });

      // 3. Link OPEX (dev)
      totalMaintenanceCost += state.links.length * 5;

      // 4. Revenue (Restored Tier Focus logic using discrete rangeLevel)
      const avgHealth = updatedNodes.length > 0 ? healthSum / updatedNodes.length : 100;
      const healthMultiplier = avgHealth < 50 ? 0.5 : 1.0;
      
      const activeTier = state.rangeLevel;
      const profitableNodes = updatedNodes.filter(n => n.layer > 1 && reachableIds.has(n.id));

      const rawRevenue = profitableNodes.reduce((sum, n) => {
        const isFocused = n.layer === activeTier;
        const efficiency = isFocused ? 0.8 : 0.2; // 80% focus, 20% background
        const nodeRevenue = n.traffic * efficiency * healthMultiplier;
        
        const isCongested = n.traffic > n.bandwidth;
        return sum + (isCongested ? nodeRevenue * 0.5 : nodeRevenue);
      }, 0);

      const revenue = Math.floor(rawRevenue);

      // 5. Stats & Era Transition
      const totalLoad = updatedNodes.reduce((sum, n) => sum + n.traffic, 0);
      const newTotalData = state.totalData + Math.floor(totalLoad / 10);
      
      let nextEra = state.currentEra;
      const eraThresholds = { '90s': 50000, 'modern': 500000 };
      if (newTotalData > eraThresholds.modern) nextEra = 'modern';
      else if (newTotalData > eraThresholds['90s']) nextEra = '90s';

      const timestamp = new Date().toLocaleTimeString();
      let newLogs = [...state.logs];
      
      // 6. Node Disconnection Alerts (dev)
      updatedNodes.forEach(node => {
        const wasReachable = state.nodes.find(n => n.id === node.id)?.traffic !== 0 || node.layer === 1;
        if (!reachableIds.has(node.id) && wasReachable && node.id !== '0' && Math.random() > 0.9) {
           newLogs = [`[${timestamp}] ! Node [${node.name}] disconnected from Core`, ...newLogs].slice(0, 20);
        }
      });

      // 7. Logs for revenue/OPEX (dev)
      if (revenue > 0 && Math.random() > 0.8) {
        newLogs = [`[${timestamp}] Revenue: +$${revenue} (Focus: ${RANGE_PRESETS[state.rangeLevel].name}) | OPEX: -$${totalMaintenanceCost}`, ...newLogs].slice(0, 20);
      }

      return {
        nodes: updatedNodes,
        money: state.isGodMode ? state.money : state.money + revenue - totalMaintenanceCost,
        totalData: newTotalData,
        networkHealth: Math.round(avgHealth),
        currentEra: nextEra,
        logs: newLogs
      };
    });
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

    // Hierarchy Validation (HEAD)
    const hierarchy = {
      'terminal': 0, 'hub_local': 1, 'hub_regional': 2, 'backbone': 3
    };
    // Note: If type is missing (dev migration), we assume backbone for core or hub_regional for others
    const getHierarchy = (node: ISPNode) => hierarchy[node.type] ?? (node.id === '0' ? 3 : 2);
    
    const diff = Math.abs(getHierarchy(src) - getHierarchy(tgt));
    const isPeer = getHierarchy(src) === getHierarchy(tgt) && getHierarchy(src) !== 0;
    const isParentChild = diff === 1;

    if (!isPeer && !isParentChild && !state.isGodMode) {
        return { ...state, isLinking: false, logs: [`[ERROR] Incompatible hierarchy: ${src.type} to ${tgt.type}`, ...state.logs].slice(0, 15) };
    }

    const dist = Math.sqrt(Math.pow(src.x - tgt.x, 2) + Math.pow(src.y - tgt.y, 2));
    const baseCost = 100;
    const distanceMultiplier = 1.5;
    const cost = Math.floor(baseCost + (dist * distanceMultiplier));
    
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
      { id: '0', name: 'CORE GATEWAY', x: 395, y: 260, bandwidth: 500, traffic: 0, level: 1, layer: 1, type: 'backbone', health: 100 },
      { id: 'l2-0', name: 'West Coast Hub', x: 110, y: 280, bandwidth: 200, traffic: 0, level: 1, layer: 2, type: 'hub_regional', health: 100 },
      { id: 'l2-1', name: 'East Coast Hub', x: 220, y: 280, bandwidth: 200, traffic: 0, level: 1, layer: 2, type: 'hub_regional', health: 100 },
    ]
  })),
}));
