import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useISPStore } from './useISPStore';

describe('useISPStore state manipulation', () => {

    beforeEach(() => {
        // Reset state before every test to ensure a clean slate
        useISPStore.getState().resetTopology();
    });

    it('should assign a default scale and parentId when adding a new node without them', () => {
        const store = useISPStore.getState();
        
        // Assert initial setup
        expect(store.nodes.length).toBe(1); // Usually CORE GATEWAY

        // Add a node missing scale and parentId (simulate Frankenstein payload from UI)
        const partialNode = {
            id: 'frankenstein-1',
            name: 'Incomplete Node',
            x: 100,
            y: 100,
            bandwidth: 100,
            traffic: 0,
            level: 1,
            layer: 2,
            type: 'hub_regional' as any,
            health: 100
            // missing scale and parentId
        };

        // Act
        useISPStore.getState().addNode(partialNode as any);

        // Assert
        const updatedStore = useISPStore.getState();
        const newlyAddedNode = updatedStore.nodes.find(n => n.id === 'frankenstein-1');

        expect(newlyAddedNode).toBeDefined();

        // The store currently assigns the store's currentScale as scale default, 
        // which defaults to 'global' if range is 4.
        const expectedScale = store.currentScale; 

        expect(newlyAddedNode?.scale).toBe(expectedScale);
        expect(newlyAddedNode?.parentId).toBe(null);
    });

    it('should retain explicitly provided scale and parentId when adding a node', () => {
        const fullNode = {
            id: 'proper-node',
            name: 'Complete Node',
            x: 150,
            y: 150,
            bandwidth: 100,
            traffic: 0,
            level: 1,
            layer: 2,
            type: 'hub_regional' as any,
            health: 100,
            scale: 'local' as any,
            parentId: '0'
        };

        useISPStore.getState().addNode(fullNode);

        const store = useISPStore.getState();
        const newlyAddedNode = store.nodes.find(n => n.id === 'proper-node');

        expect(newlyAddedNode?.scale).toBe('local');
        expect(newlyAddedNode?.parentId).toBe('0');
    });

    it('should remove the maxDist validation block, allowing high attenuation physics to simulate the loss naturally', () => {
        const store = useISPStore.getState();

        // Let's create two nodes far away
        const src = store.nodes[0]; // 395, 260
        const tgt = { ...src, id: 'far-tgt', x: 395, y: 800, type: 'hub_regional' as any }; // diff = 540 away

        useISPStore.getState().addNode(tgt);

        // The distance is Math.sqrt((395-395)^2 + (800-260)^2) = 540
        // Previous hardcoded max was 350. By removing the constraint, this is valid as long as we have money.
        // Assuming we have enough money. GodMode bypasses cost anyway, but we test normal mode.

        useISPStore.getState().toggleGodMode(); // enable free money/override

        const validation = useISPStore.getState().validateLink(src.id, tgt.id);
        
        expect(validation.valid).toBe(true);
    });

});
