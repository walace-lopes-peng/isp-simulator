import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

// Category mapping for exclusion logic
const TECH_CATEGORIES: Record<string, 'media' | 'logic' | 'service'> = {
  copper_standard: 'media',
  coaxial_early: 'media',
  coaxial_mature: 'media',
  fiber_experimental: 'media',
  manual_switching: 'logic',
  digital_switching: 'logic',
  tdm_basic: 'service',
  isdn_early: 'service'
};

interface TechStore {
  unlockedTechIds: string[];
  activeTechIds: string[];
  
  // Actions
  unlockTech: (id: string, currentEra: string, currentTP: number, addTechPoints: (amt: number) => void) => void;
  activateTech: (id: string) => void;
  deactivateTech: (id: string) => void;
  
  // Debug/Utility
  getAggregateModifiers: () => TechModifiers;
  isTechUnlocked: (id: string) => boolean;
  isTechActive: (id: string) => boolean;
  canUnlockTech: (id: string, currentEra: string, currentTP: number) => boolean;
  unlockAllTechs: () => void;
  resetTechs: () => void;
}

export const useTechStore = create<TechStore>()(
  persist(
    (set, get) => ({
  unlockedTechIds: ['copper_standard', 'manual_switching'], 
  activeTechIds: ['copper_standard'], 

  isTechUnlocked: (id) => get().unlockedTechIds.includes(id),
  isTechActive: (id) => get().activeTechIds.includes(id),

  canUnlockTech: (id, currentEra, currentTP) => {
    const tech = techTreeData.technologies.find(t => t.id === id);
    if (!tech) return false;
    if (get().isTechUnlocked(id)) return false;

    const hasPrereqs = tech.requires.every(reqId => get().unlockedTechIds.includes(reqId));
    if (!hasPrereqs) return false;

    const eras = ['70s', '80s', '90s', '00s', '2010s', 'modern'];
    const currentEraIndex = eras.indexOf(currentEra);
    const techEraIndex = eras.indexOf(tech.unlocksAtEra);
    if (techEraIndex > currentEraIndex) return false;

    if (currentTP < tech.tpCost) return false;
    return true;
  },

  unlockTech: (id, currentEra, currentTP, addTechPoints) => {
    if (!get().canUnlockTech(id, currentEra, currentTP)) return;
    const tech = techTreeData.technologies.find(t => t.id === id);
    if (!tech) return;

    addTechPoints(-tech.tpCost);
    set((state) => ({
      unlockedTechIds: [...state.unlockedTechIds, id]
    }));
  },

  activateTech: (id) => {
    if (!get().isTechUnlocked(id)) return;
    if (get().isTechActive(id)) return;

    const category = TECH_CATEGORIES[id];
    set((state) => {
      let nextActive = [...state.activeTechIds];
      
      // If exclusive category, remove others in same category
      if (category === 'media' || category === 'logic') {
        nextActive = nextActive.filter(activeId => TECH_CATEGORIES[activeId] !== category);
      }
      
      return { activeTechIds: [...nextActive, id] };
    });
  },

  deactivateTech: (id) => {
    set((state) => ({
      activeTechIds: state.activeTechIds.filter(activeId => activeId !== id)
    }));
  },

  getAggregateModifiers: () => {
    const activeTechs = techTreeData.technologies.filter(t => 
      get().activeTechIds.includes(t.id)
    );

    const base: TechModifiers = {
      bandwidthMultiplier: 1.0,
      latencyMultiplier: 1.0,
      capacityMultiplier: 1.0,
      maxDistance: 300, 
      signalQuality: 0.55, 
      connectionReliability: 0.70 
    };

    return activeTechs.reduce((acc, tech) => {
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
    set({ 
      unlockedTechIds: allIds,
      activeTechIds: allIds // Activate all for debug ease
    });
  },

  resetTechs: () => {
    set({ 
      unlockedTechIds: ['copper_standard', 'manual_switching'],
      activeTechIds: ['copper_standard']
    });
  }
}),
    {
      name: 'isp-tech-v1',
      partialize: (state) => ({
        unlockedTechIds: state.unlockedTechIds,
        activeTechIds: state.activeTechIds,
      }),
    }
  )
);

// Helper selector for nodes
export const getEffectiveBandwidth = (node: { bandwidth: number }) => {
  const multipliers = useTechStore.getState().getAggregateModifiers();
  return Math.floor(node.bandwidth * multipliers.bandwidthMultiplier);
};
