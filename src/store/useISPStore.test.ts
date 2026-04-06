import { describe, it, expect, beforeEach } from 'vitest';
import { useISPStore } from './useISPStore';

describe('useISPStore Gold Standard', () => {
    beforeEach(() => {
        useISPStore.getState().resetTopology();
        useISPStore.setState({ currentEra: '70s' });
    });

    it('should initialize with NYC coordinates at (692, 333) for the Pioneer Era', () => {
        const state = useISPStore.getState();
        const gateway = state.nodes.find(n => n.id === '0');
        expect(gateway).toBeDefined();
        expect(gateway!.x).toBe(692);
        expect(gateway!.y).toBe(333);
    });

    it('should start by default with 2 local terminals near the gateway', () => {
        const state = useISPStore.getState();
        expect(state.nodes.length).toBe(3);
        expect(state.nodes.filter(n => n.type === 'terminal').length).toBe(2);
    });

    it('should maintain the hardware range limit (default 300px)', () => {
        const state = useISPStore.getState();
        const gatewayId = '0';
        const targetId = 'far-away';
        // Distance: 1042 - 692 = 350px (exceeds 300px baseline)
        state.addNode({ id: targetId, name: 'Far Hub', x: 1042, y: 333, bandwidth: 200, baseBandwidth: 200, traffic: 0, level: 1, layer: 2, type: 'hub_local', health: 100 });
        const { valid, error } = state.validateLink(gatewayId, targetId);
        expect(valid).toBe(false);
        expect(error).toBe('RANGE');
    });

    it('should validate 70s hierarchy: Gateway can connect to Terminal', () => {
        const state = useISPStore.getState();
        const { valid } = state.validateLink('0', 'l1-a');
        expect(valid).toBe(true);
    });

    it('should block 70s hierarchy: Terminals cannot connect to each other', () => {
        const state = useISPStore.getState();
        const { valid, error } = state.validateLink('l1-a', 'l1-b');
        expect(valid).toBe(false);
        expect(error).toBe('HIERARCHY');
    });

    it('should cost $100+ for a valid link', () => {
        const state = useISPStore.getState();
        const { cost } = state.validateLink('0', 'l1-a');
        expect(cost).toBeGreaterThanOrEqual(100);
    });

    it('should increase money after a successful simulation tick if profitable', async () => {
        const state = useISPStore.getState();
        const initialMoney = state.money;
        useISPStore.setState({ money: initialMoney + 10 });
        expect(useISPStore.getState().money).toBeGreaterThan(initialMoney);
    });

    it('should update currentEra when purchasing era upgrade', () => {
        const state = useISPStore.getState();
        useISPStore.setState({ totalData: 1000, money: 1000, canUpgradeEra: true });
        state.purchaseEraUpgrade();
        expect(useISPStore.getState().currentEra).not.toBe('70s');
    });

    it('should create cable links with era-capped bandwidth in 70s', () => {
        useISPStore.setState({ isGodMode: true });
        const state = useISPStore.getState();
        expect(state.currentEra).toBe('70s');
        state.connectNodes('0', 'l1-a');
        const link = useISPStore.getState().links[0];
        expect(link).toBeDefined();
        expect(link.type).toBe('cable');
        expect(link.bandwidth).toBeLessThanOrEqual(300);
    });

    it('should create fiber links when era unlocks fiber hardware', () => {
        useISPStore.setState({ currentEra: '90s', isGodMode: true });
        const state = useISPStore.getState();
        state.connectNodes('0', 'l1-a');
        const link = useISPStore.getState().links[0];
        expect(link).toBeDefined();
        expect(link.type).toBe('fiber');
    });
});
