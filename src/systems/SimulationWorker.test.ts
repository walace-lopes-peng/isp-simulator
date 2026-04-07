import { describe, beforeEach, it, expect, vi } from 'vitest';

const mockPostMessage = vi.fn();
(global as any).self = {
    onmessage: null as any,
    postMessage: mockPostMessage
};

describe('SimulationWorker Physics System', () => {
    beforeEach(() => {
        mockPostMessage.mockClear();
    });

    it('should calculate signal attenuation correctly under 1970s era conditions (/1000 scaling)', async () => {
        // @ts-ignore - Dynamic import needed to ensure global.self is mocked before worker code runs
        await import('./SimulationWorker');
        const MOCK_1970S_ERA = {
            id: '70s',
            modifiers: {
                signalAttenuation: 1.5,
                revenueMultiplier: 1.0,
                maintenanceCost: 0.5
            }
        };

        const TEST_NODES = [
            { id: '0', name: 'CORE GATEWAY', x: 0, y: 0, bandwidth: 500, traffic: 0, level: 1, layer: 1, type: 'backbone', health: 100 },
            { id: 'test-target', name: 'Far Node', x: 400, y: 0, bandwidth: 100, traffic: 0, level: 1, layer: 2, type: 'hub_regional', health: 100 }
        ];

        const TEST_LINKS = [
            { id: 'link-1', sourceId: '0', targetId: 'test-target', bandwidth: 1000, type: 'copper' }
        ];

        const statePayload = {
            nodes: TEST_NODES,
            links: TEST_LINKS,
            rangeLevel: 4,
            tickRate: 16,
            era: MOCK_1970S_ERA
        };

        const event = new MessageEvent('message', { data: statePayload });
        (global.self as any).onmessage(event);

        expect(mockPostMessage).toHaveBeenCalledTimes(1);
        const result = mockPostMessage.mock.calls[0][0];
        const processedTarget = result.nodes.find((n: any) => n.id === 'test-target');
        
        // Signal = Math.exp(-0.0015 * 400) = e^-0.6 ≈ 0.5488 -> Round(55)
        expect(processedTarget).toBeDefined();
        expect(processedTarget.signalStrength).toBe(55);
    });
});
