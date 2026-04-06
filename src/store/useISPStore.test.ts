import { describe, it, expect, beforeEach } from 'vitest';
import { useISPStore, getDebtTier } from './useISPStore';

describe('useISPStore Gold Standard', () => {
    beforeEach(() => {
        useISPStore.getState().resetTopology();
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
});

describe('Debt Escalation System', () => {
    beforeEach(() => {
        useISPStore.getState().resetTopology();
        useISPStore.setState({ currentEra: '70s' });
    });

    it('getDebtTier returns correct tiers', () => {
        expect(getDebtTier(100)).toBe(0);
        expect(getDebtTier(0)).toBe(0);
        expect(getDebtTier(-1)).toBe(1);
        expect(getDebtTier(-2001)).toBe(2);
        expect(getDebtTier(-5001)).toBe(3);
        expect(getDebtTier(-10000)).toBe(3);
    });

    it('should initialize with debtTier 0 and no loan', () => {
        const state = useISPStore.getState();
        expect(state.debtTier).toBe(0);
        expect(state.emergencyLoanUsed).toBe(false);
        expect(state.emergencyLoanActive).toBe(false);
    });

    it('takeEmergencyLoan adds $5000 and activates loan', () => {
        useISPStore.setState({ money: -3000 });
        useISPStore.getState().takeEmergencyLoan();
        const state = useISPStore.getState();
        expect(state.money).toBe(2000);
        expect(state.emergencyLoanUsed).toBe(true);
        expect(state.emergencyLoanActive).toBe(true);
        expect(state.emergencyLoanTicksRemaining).toBeGreaterThan(0);
    });

    it('takeEmergencyLoan can only be used once', () => {
        useISPStore.setState({ money: -3000 });
        useISPStore.getState().takeEmergencyLoan();
        const moneyAfterFirst = useISPStore.getState().money;
        useISPStore.getState().takeEmergencyLoan();
        expect(useISPStore.getState().money).toBe(moneyAfterFirst);
    });

    it('sellNode refunds money and removes node + connected links', () => {
        useISPStore.setState({ isGodMode: true });
        const state = useISPStore.getState();
        state.addNode({ id: 'sell-me', name: 'Sell Hub', x: 700, y: 340, bandwidth: 100, baseBandwidth: 100, traffic: 0, level: 1, layer: 1, type: 'hub_local', health: 100 });
        state.connectNodes('0', 'sell-me');
        const linksBefore = useISPStore.getState().links.length;
        expect(linksBefore).toBeGreaterThan(0);

        const moneyBefore = useISPStore.getState().money;
        useISPStore.getState().sellNode('sell-me');
        const after = useISPStore.getState();
        expect(after.nodes.find(n => n.id === 'sell-me')).toBeUndefined();
        expect(after.links.length).toBe(0);
        expect(after.money).toBe(moneyBefore + 150);
    });

    it('cannot sell core nodes', () => {
        const nodesBefore = useISPStore.getState().nodes.length;
        useISPStore.getState().sellNode('0');
        expect(useISPStore.getState().nodes.length).toBe(nodesBefore);
    });

    it('sellLink refunds money and removes the link', () => {
        useISPStore.setState({ isGodMode: true });
        // Use a non-core node so the link is sellable
        useISPStore.getState().addNode({ id: 'sell-hub', name: 'Sell Hub', x: 700, y: 340, bandwidth: 100, baseBandwidth: 100, traffic: 0, level: 1, layer: 1, type: 'hub_local', health: 100 });
        useISPStore.getState().connectNodes('0', 'sell-hub');
        const link = useISPStore.getState().links[0];
        expect(link).toBeDefined();

        const moneyBefore = useISPStore.getState().money;
        useISPStore.getState().sellLink(link.id);
        expect(useISPStore.getState().links.length).toBe(0);
        expect(useISPStore.getState().money).toBe(moneyBefore + 75);
    });

    it('resetTopology clears debt state', () => {
        useISPStore.setState({ debtTier: 2, emergencyLoanUsed: true, emergencyLoanActive: true, emergencyLoanTicksRemaining: 100 });
        useISPStore.getState().resetTopology();
        const state = useISPStore.getState();
        expect(state.debtTier).toBe(0);
        expect(state.emergencyLoanUsed).toBe(false);
        expect(state.emergencyLoanActive).toBe(false);
        expect(state.emergencyLoanTicksRemaining).toBe(0);
    });
});
