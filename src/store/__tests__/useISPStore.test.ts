import { describe, it, expect, beforeEach } from 'vitest';
import { useISPStore, ERAS_CONFIG } from '../useISPStore';

describe('useISPStore validateLink Physics', () => {
  beforeEach(() => {
    // Reset store before each test
    useISPStore.getState().resetTopology();
    useISPStore.setState({ money: 5000, isGodMode: false, currentEra: '70s' });
  });

  it('validates a connection between hub_local (Gateway) and terminal correctly (Hierarchy Physics)', () => {
    const store = useISPStore.getState();
    const gateway = store.nodes.find(n => n.id === '0');
    const terminalA = store.nodes.find(n => n.id === 'l1-a');

    expect(gateway).toBeDefined();
    expect(terminalA).toBeDefined();
    expect(gateway?.type).toBe('hub_local');
    expect(terminalA?.type).toBe('terminal');

    const result = store.validateLink(gateway!.id, terminalA!.id);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('fails hierarchy validation if backbone tries to connect to terminal', () => {
    const store = useISPStore.getState();
    
    // Force gateway to backbone for testing the physics engine
    useISPStore.setState({
      nodes: store.nodes.map(n => n.id === '0' ? { ...n, type: 'backbone' } : n)
    });
    
    const updatedStore = useISPStore.getState();
    const gateway = updatedStore.nodes.find(n => n.id === '0');
    const terminalA = updatedStore.nodes.find(n => n.id === 'l1-a');
    
    expect(gateway?.type).toBe('backbone');

    const result = updatedStore.validateLink(gateway!.id, terminalA!.id);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('HIERARCHY');
  });

  it('fails range validation if nodes are too far apart for the 70s era', () => {
    const store = useISPStore.getState();
    
    // Create a new terminal far away
    useISPStore.setState({
      nodes: [
        ...store.nodes,
        { 
          id: 'test-far', name: 'FAR TERMINAL', 
          x: store.nodes[0].x + 300, y: store.nodes[0].y + 300, 
          bandwidth: 100, traffic: 0, level: 1, layer: 1, type: 'terminal', health: 100 
        }
      ]
    });

    const updatedStore = useISPStore.getState();
    
    const gateway = updatedStore.nodes.find(n => n.id === '0');
    const farTerminal = updatedStore.nodes.find(n => n.id === 'test-far');
    
    const result = updatedStore.validateLink(gateway!.id, farTerminal!.id);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('RANGE');
  });

  it('fails if capital is insufficient', () => {
    // Set money to 0
    useISPStore.setState({ money: 0 });
    
    const store = useISPStore.getState();
    const gateway = store.nodes.find(n => n.id === '0');
    const terminalA = store.nodes.find(n => n.id === 'l1-a');

    const result = store.validateLink(gateway!.id, terminalA!.id);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('CAPITAL');
  });
});
