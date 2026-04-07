import type { RangeLevel } from '../store/useISPStore';

export const NODE_TEMPLATES = [
  {
    type: 'hub_local' as const,
    displayName: 'Local Hub',
    description: 'Neighborhood access node',
    unlocksAtEra: '70s',
    availableInScopes: [1, 2] as RangeLevel[],
    isGateway: true,
    baseCost: 500,
    maintenanceMultiplier: 1.2,
    hierarchyLevel: 1,
    baseBandwidth: 300,
    maxConnections: 8,
    uiColor: '#22d3ee'
  },
  {
    type: 'terminal' as const,
    displayName: 'Local Terminal',
    description: 'Endpoint for local residential connections',
    unlocksAtEra: '70s',
    availableInScopes: [1] as RangeLevel[],
    baseCost: 100,
    maintenanceMultiplier: 1.0,
    hierarchyLevel: 0,
    baseBandwidth: 56,
    maxConnections: 3,
    uiColor: '#10b981'
  },
  {
    type: 'hub_regional' as const,
    displayName: 'Regional Relay',
    description: 'High-capacity regional link',
    unlocksAtEra: '80s',
    availableInScopes: [2, 3] as RangeLevel[],
    isGateway: true,
    baseCost: 2000,
    maintenanceMultiplier: 1.5,
    hierarchyLevel: 2,
    baseBandwidth: 1500,
    maxConnections: 12,
    uiColor: '#818cf8'
  },
  {
    type: 'backbone' as const,
    displayName: 'Backbone Node',
    description: 'National and global infrastructure',
    unlocksAtEra: '90s',
    availableInScopes: [3, 4] as RangeLevel[],
    isGateway: true,
    baseCost: 10000,
    maintenanceMultiplier: 2.0,
    hierarchyLevel: 3,
    baseBandwidth: 45000,
    maxConnections: 20,
    uiColor: '#c084fc'
  }
];

export type ISPNodeType = typeof NODE_TEMPLATES[number]['type'];

export type NodeRegistryEntry = typeof NODE_TEMPLATES[number];
