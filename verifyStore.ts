import { useISPStore } from './src/store/useISPStore';

const store = useISPStore.getState();

console.log('--- Initial State ---');
console.log('Era:', store.currentEra);
console.log('Money:', store.money);
console.log('Nodes:', store.nodes.map(n => n.name));

// 1. Setup a link to core to enable packets
console.log('\n--- Connecting Node n1 to Core ---');
useISPStore.getState().connectNodes('n1', '0');
console.log('Money after connection:', useISPStore.getState().money);
console.log('Links:', useISPStore.getState().links.length);

// 2. Simulate ticks and watch packets
console.log('\n--- Simulating 20 ticks (Packet Flow) ---');
for (let i = 0; i < 20; i++) {
  useISPStore.getState().tick();
  const state = useISPStore.getState();
  const totalPackets = state.nodes.reduce((sum, n) => sum + (n.packets?.length || 0), 0);
  console.log(`Tick ${i + 1}: Money = ${state.money}, Data = ${state.totalData}, Active Packets = ${totalPackets}`);
  
  if (state.logs[0].includes('Packet Handshake')) {
    console.log('  >> Log:', state.logs[0]);
  }
}

// 3. Test Upgrade
console.log('\n--- Upgrading Computer Lab A ---');
const prevMoney = useISPStore.getState().money;
useISPStore.getState().upgradeNode('n1');
console.log('Money after upgrade:', useISPStore.getState().money, `(Cost: ${prevMoney - useISPStore.getState().money})`);
console.log('Node n1 Level:', useISPStore.getState().nodes.find(n => n.id === 'n1')?.level);

// 4. Check Era Transition prediction
console.log('\n--- Current Total Data:', useISPStore.getState().totalData);
if (useISPStore.getState().totalData > 1000) {
    console.log('Era should be 90s');
} else {
    console.log('Era is still 70s');
}
