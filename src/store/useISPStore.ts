import { create } from 'zustand';

export type Era = '70s' | '90s' | 'modern';

export interface Packet {
  id: string;
  sourceId: string;
  targetId: string;
  isReturn: boolean;
  progress: number; // 0 to 1
}

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
  packets?: Packet[];
}

export interface ISPLink {
  id: string;
  sourceId: string;
  targetId: string;
  bandwidth: number;
  type: 'copper' | 'fiber' | 'satellite';
}

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
  money: 1000,
  currentEra: '70s',
  totalData: 0,
  zoomLevel: 10,
  selectedNodeId: null,
  isLinking: false,
  logs: ['[ERA: 70s] Welcome to the Garage. Build a local network to survive.'],
  links: [],
  nodes: [
    { id: '0', name: 'Alumni Core', bandwidth: 56, traffic: 0, level: 1, layer: 1, x: 400, y: 300, region: 'Campus', packets: [] },
    { id: 'n1', name: 'Computer Lab A', bandwidth: 10, traffic: 0, level: 1, layer: 1, x: 200, y: 150, region: 'Campus', packets: [] },
    { id: 'n2', name: 'Library Terminal', bandwidth: 10, traffic: 0, level: 1, layer: 1, x: 600, y: 150, region: 'Campus', packets: [] },
  ],

  tick: () => {
    set((state) => {
      // 1. BFS for Reachability from Core (ID '0')
      const reachableIds = new Set<string>();
      const core = state.nodes.find(n => n.id === '0');
      
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

      const timestamp = new Date().toLocaleTimeString();
      let newLogs = [...state.logs];
      let revenue = 0;
      let dataProcessed = 0;

      // 2. Packet Flow Simulation
      const updatedNodes = state.nodes.map(node => {
        let nodePackets = node.packets || [];
        
        // Generate new requests from non-core nodes
        if (node.id !== '0' && reachableIds.has(node.id) && Math.random() > 0.7) {
          nodePackets.push({
            id: `pkt-${Date.now()}-${Math.random()}`,
            sourceId: node.id,
            targetId: '0',
            isReturn: false,
            progress: 0
          });
        }

        // Process existing packets
        const nextPackets: Packet[] = [];
        nodePackets.forEach(pkt => {
          pkt.progress += 0.5; // Each tick moves packet halfway

          if (pkt.progress >= 1) {
            if (!pkt.isReturn) {
              // Reached Core -> Return to Source
              nextPackets.push({ ...pkt, isReturn: true, progress: 0, targetId: pkt.sourceId });
            } else {
              // Reached Source -> Complete Journey -> Revenue
              revenue += node.level * 10;
              dataProcessed += 1;
              if (Math.random() > 0.9) {
                newLogs = [`[${timestamp}] Packet Handshake Complete: +$${node.level * 10}`, ...newLogs].slice(0, 15);
              }
            }
          } else {
            nextPackets.push(pkt);
          }
        });

        // Traffic is a function of active packets
        const traffic = nextPackets.length * 2;
        
        return { ...node, packets: nextPackets, traffic };
      });

      // 3. Update Stats & Era
      const newTotalData = state.totalData + dataProcessed;
      let nextEra = state.currentEra;
      if (newTotalData > 1000) nextEra = '90s';

      if (nextEra !== state.currentEra) {
        newLogs = [`[SYSTEM] TECHNOLOGICAL LEAP: Welcome to the ${nextEra}`, ...newLogs].slice(0, 15);
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
    if (sId === tId) return state;

    const src = state.nodes.find(n => n.id === sId);
    const tgt = state.nodes.find(n => n.id === tId);
    if (!src || !tgt) return state;

    if (state.links.some(l => (l.sourceId === sId && l.targetId === tId) || (l.sourceId === tId && l.targetId === sId))) {
      return state;
    }

    const dist = Math.sqrt(Math.pow(src.x - tgt.x, 2) + Math.pow(src.y - tgt.y, 2));
    const cost = Math.floor(50 + dist * 0.5);

    if (state.money < cost) {
      return { ...state, logs: [`[ERROR] Insufficient funds for link (-$${cost})`, ...state.logs].slice(0, 15) };
    }

    const newLink: ISPLink = {
      id: `link-${Date.now()}`,
      sourceId: sId,
      targetId: tId,
      bandwidth: 10,
      type: 'copper'
    };

    return {
      money: state.money - cost,
      links: [...state.links, newLink],
      logs: [`[LINK] ${src.name} <-> ${tgt.name} established (-$${cost})`, ...state.logs].slice(0, 15)
    };
  }),

  toggleLinking: () => set(state => ({ isLinking: !state.isLinking })),
  upgradeNode: (id) => set((state) => {
    const node = state.nodes.find(n => n.id === id);
    if (!node) return state;
    const cost = node.level * 100;
    if (state.money < cost) return state;
    return {
      money: state.money - cost,
      nodes: state.nodes.map(n => n.id === id ? { ...n, level: n.level + 1, bandwidth: n.bandwidth * 2 } : n),
      logs: [`[UPGRADE] ${node.name} optimized to LVL ${node.level + 1}`, ...state.logs].slice(0, 15)
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
