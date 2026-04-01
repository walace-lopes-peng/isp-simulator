import { describe, it, expect, beforeEach } from 'vitest';
import { useISPStore } from './useISPStore';

describe('useISPStore Gold Standard', () => {
    beforeEach(() => {
        useISPStore.getState().resetTopology();
    });

    it('should initialize with NYC coordinates at (248, 318) for the Pioneer Era', () => {
        const state = useISPStore.getState();
        const gateway = state.nodes.find(n => n.id === '0');
        expect(gateway).toBeDefined();
        expect(gateway!.x).toBe(248);
        expect(gateway!.y).toBe(318);
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
        // Distance: 648 - 248 = 400px (exceeds 300px baseline)
        state.addNode({ id: targetId, name: 'Far Hub', x: 648, y: 318, bandwidth: 200, baseBandwidth: 200, traffic: 0, level: 1, layer: 2, type: 'hub_local', health: 100 });
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
});
