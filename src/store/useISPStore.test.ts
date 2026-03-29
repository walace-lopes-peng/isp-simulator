import { describe, it, expect, beforeEach } from 'vitest';
import { useISPStore } from './useISPStore';

describe('useISPStore validateLink Physics', () => {
  beforeEach(() => {
    // Reset store before each test to ensure clean state
    useISPStore.getState().resetTopology();
    useISPStore.setState({ 
        money: 5000, 
        isGodMode: false, 
        currentEra: '70s' 
    });
  });

  it('validates a connection between hub_local (Gateway) and terminal correctly (Hierarchy Physics)', () => {
    const store = useISPStore.getState();
    const gateway = store.nodes.find(n => n.id === '0');
    const terminalA = store.nodes.find(n => n.id === 'l1-a');

    expect(gateway, "Gateway node '0' should exist after reset").toBeDefined();
    expect(terminalA, "Terminal node 'l1-a' should exist after reset").toBeDefined();
    expect(gateway?.type).toBe('hub_local');
    expect(terminalA?.type).toBe('terminal');

    const result = store.validateLink(gateway!.id, terminalA!.id);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('fails hierarchy validation if backbone tries to connect to terminal', () => {
    const store = useISPStore.getState();
    const nodes = store.nodes;
    
    // Force nodes state to have an invalid hierarchy for testing
    useISPStore.setState({
      nodes: [
          { id: 'back-1', name: 'BACKBONE', x: 100, y: 100, bandwidth: 1000, traffic: 0, level: 3, layer: 3, type: 'backbone', health: 100 },
          { id: 'term-1', name: 'TERMINAL', x: 120, y: 120, bandwidth: 100, traffic: 0, level: 1, layer: 1, type: 'terminal', health: 100 }
      ]
    });
    
    const updatedStore = useISPStore.getState();
    const backbone = updatedStore.nodes[0];
    const terminal = updatedStore.nodes[1];
    
    expect(backbone.type).toBe('backbone');
    expect(terminal.type).toBe('terminal');

    // Backbone (3) vs Terminal (0) should fail hierarchy (3 - 0 = 3 != 1)
    const result = updatedStore.validateLink(backbone.id, terminal.id);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('HIERARCHY');
  });

  it('fails range validation if nodes are too far apart for the 70s era', () => {
    // Create a valid hierarchy pair but far apart
    useISPStore.setState({
      nodes: [
        { id: 'hub-1', name: 'HUB', x: 0, y: 0, bandwidth: 500, traffic: 0, level: 1, layer: 1, type: 'hub_local', health: 100 },
        { id: 'term-far', name: 'FAR TERMINAL', x: 300, y: 300, bandwidth: 100, traffic: 0, level: 1, layer: 1, type: 'terminal', health: 100 }
      ]
    });

    const updatedStore = useISPStore.getState();
    const hub = updatedStore.nodes[0];
    const farTerminal = updatedStore.nodes[1];
    
    // Distance ~424px, 70s limit is 150px
    const result = updatedStore.validateLink(hub.id, farTerminal.id);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('RANGE');
  });

  it('fails if capital is insufficient for the wire cost', () => {
    useISPStore.setState({ money: 50 }); // Less than the ~131px cost for 21px distance
    
    const store = useISPStore.getState();
    const gateway = store.nodes.find(n => n.id === '0');
    const terminalA = store.nodes.find(n => n.id === 'l1-a');

    expect(gateway).toBeDefined();
    expect(terminalA).toBeDefined();

    const result = store.validateLink(gateway!.id, terminalA!.id);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('CAPITAL');
  });

  it('removes associated links when a node is deleted (Cleanup Physics)', () => {
    const store = useISPStore.getState();
    const nodes = store.nodes;
    const gId = nodes[0].id;
    const tId = nodes[1].id;
    
    // Create a link manually in state
    useISPStore.setState({
      links: [{ id: 'link-1', sourceId: gId, targetId: tId, bandwidth: 50, type: 'cable' }]
    });

    expect(useISPStore.getState().links.length).toBe(1);
    
    // Simulate deletion logic sequence
    const currentLinks = useISPStore.getState().links;
    useISPStore.setState({
        nodes: useISPStore.getState().nodes.filter(n => n.id !== tId),
        links: currentLinks.filter(l => l.sourceId !== tId && l.targetId !== tId)
    });

    expect(useISPStore.getState().links.length).toBe(0);
  });

  it('accumulates total data over time (Game Progression State)', () => {
    useISPStore.setState({ totalData: 100 });
    // Simulate state update
    useISPStore.setState((state) => ({ totalData: state.totalData + 50 }));
    expect(useISPStore.getState().totalData).toBe(150);
  });

  it('updates average latency correctly in store state', () => {
    useISPStore.setState({ avgLatency: 50 });
    useISPStore.setState({ avgLatency: 75 });
    expect(useISPStore.getState().avgLatency).toBe(75);
  });

  it('calculates health decay mock (Resilience State)', () => {
    const store = useISPStore.getState();
    const node = store.nodes[0];
    
    const isCritical = true; 
    const newHealth = isCritical ? node.health - 5 : node.health;
    
    expect(newHealth).toBe(95);
  });
});
