import { useISPStore } from './src/store/useISPStore';

const store = useISPStore.getState();

console.log('--- Initial State ---');
console.log('Era:', store.currentEra);
console.log('Money:', store.money);
console.log('Nodes:', store.nodes.length);

// 1. Setup a link to enable connectivity
console.log('\n--- Connecting West Coast Hub to Core ---');
useISPStore.getState().connectNodes('l2-0', '0');
console.log('Money after connection cost:', useISPStore.getState().money);

// 2. Simulate ticks and watch Economy
console.log('\n--- Simulating 10 ticks (Economy Loop) ---');
for (let i = 0; i < 10; i++) {
  const prevMoney = useISPStore.getState().money;
  useISPStore.getState().tick();
  const state = useISPStore.getState();
  const diff = state.money - prevMoney;
  console.log(`Tick ${i + 1}: Money = ${state.money} (Change: ${diff > 0 ? '+' : ''}${diff}), Data = ${state.totalData}`);
  
  if (state.logs[0].includes('Revenue')) {
    console.log('  >> Log:', state.logs[0]);
  }
}

// 3. Check for Overload Penalty
console.log('\n--- Simulating Overload ---');
useISPStore.setState({
    nodes: useISPStore.getState().nodes.map(n => n.id === 'l2-0' ? { ...n, bandwidth: 5, traffic: 20 } : n)
});
useISPStore.getState().tick();
console.log('Latest Log:', useISPStore.getState().logs[0]);
console.log('Money after overload tick:', useISPStore.getState().money);
