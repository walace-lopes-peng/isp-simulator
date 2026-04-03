import { create } from 'zustand';
import techTreeData from '../config/techTreeConfig.json';

export interface TechModifiers {
  bandwidthMultiplier: number;
  latencyMultiplier: number;
  capacityMultiplier: number;
  maxDistance: number;
  signalQuality: number;
  connectionReliability: number;
}

export interface Technology {
  id: string;
  displayName: string;
  description: string;
  unlocksAtEra: string;
  availableInScopes: number[];
  tpCost: number;
  requires: string[];
  modifiers: TechModifiers;
  position: { x: number; y: number };
}

interface TechStore {
  unlockedTechIds: string[];
  unlockTech: (id: string, currentEra: string, currentTP: number, addTechPoints: (amt: number) => void) => void;
  unlockAllTechs: () => void;
  resetTechs: () => void;
  getAggregateModifiers: () => TechModifiers;
  isTechUnlocked: (id: string) => boolean;
  canUnlockTech: (id: string, currentEra: string, currentTP: number) => boolean;
}

export const useTechStore = create<TechStore>((set, get) => ({
  unlockedTechIds: ['copper_standard'], // baseline

  isTechUnlocked: (id) => get().unlockedTechIds.includes(id),

  canUnlockTech: (id, currentEra, currentTP) => {
    const tech = techTreeData.technologies.find(t => t.id === id);
    if (!tech) return false;
    
    // Check if already unlocked
    if (get().isTechUnlocked(id)) return false;

    // Check prerequisites
    const hasPrereqs = tech.requires.every(reqId => get().unlockedTechIds.includes(reqId));
    if (!hasPrereqs) return false;

    // Check Era
    const eras = ['70s', '80s', '90s', '00s', '2010s', 'modern'];
    const currentEraIndex = eras.indexOf(currentEra);
    const techEraIndex = eras.indexOf(tech.unlocksAtEra);
    if (techEraIndex > currentEraIndex) return false;

    // Check TP cost
    if (currentTP < tech.tpCost) return false;

    return true;
  },

  unlockTech: (id, currentEra, currentTP, addTechPoints) => {
    if (!get().canUnlockTech(id, currentEra, currentTP)) return;

    const tech = techTreeData.technologies.find(t => t.id === id);
    if (!tech) return;

    // Deduct TP
    addTechPoints(-tech.tpCost);

    set((state) => ({
      unlockedTechIds: [...state.unlockedTechIds, id]
    }));
  },

  getAggregateModifiers: () => {
    const unlockedTechs = techTreeData.technologies.filter(t => 
      get().unlockedTechIds.includes(t.id)
    );

    const base: TechModifiers = {
      bandwidthMultiplier: 1.0,
      latencyMultiplier: 1.0,
      capacityMultiplier: 1.0,
      maxDistance: 300, // baseline
      signalQuality: 0.55, // baseline
      connectionReliability: 0.70 // baseline
    };

    return unlockedTechs.reduce((acc, tech) => {
      const mod = tech.modifiers;
      return {
        bandwidthMultiplier: acc.bandwidthMultiplier * (mod.bandwidthMultiplier || 1),
        capacityMultiplier: acc.capacityMultiplier * (mod.capacityMultiplier || 1),
        latencyMultiplier: Math.max(0.1, acc.latencyMultiplier * (mod.latencyMultiplier || 1)),
        maxDistance: Math.max(acc.maxDistance, mod.maxDistance || 0),
        signalQuality: Math.max(acc.signalQuality, mod.signalQuality || 0),
        connectionReliability: Math.max(acc.connectionReliability, mod.connectionReliability || 0)
      };
    }, base);
  },

  unlockAllTechs: () => {
    const allIds = techTreeData.technologies.map(t => t.id);
    set({ unlockedTechIds: allIds });
  },

  resetTechs: () => {
    set({ unlockedTechIds: ['copper_standard'] });
  }
}));

// Helper selector for nodes
export const getEffectiveBandwidth = (node: { bandwidth: number }) => {
  const multipliers = useTechStore.getState().getAggregateModifiers();
  return Math.floor(node.bandwidth * multipliers.bandwidthMultiplier);
};
