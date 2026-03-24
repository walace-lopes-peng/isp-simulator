import { useISPStore } from './src/store/useISPStore';
// Manual simulation since Zustand hooks are usually used in React components
// However, the core logic is testable through the store object itself
const store = useISPStore.getState();
console.log('Initial State:', store.money, store.nodes);
// simulate a few ticks
console.log('--- Simulating 5 ticks ---');
for (let i = 0; i < 5; i++) {
    useISPStore.getState().tick();
    console.log(`Tick ${i + 1}: Money = ${useISPStore.getState().money}`);
}
// Upgrade node
console.log('--- Upgrading Node ---');
useISPStore.getState().upgradeNode('1');
console.log('Post-upgrade Money:', useISPStore.getState().money);
console.log('Post-upgrade Nodes:', useISPStore.getState().nodes);
// Overload node
console.log('--- Overloading Node ---');
useISPStore.setState({
    nodes: [
        { id: '1', name: 'Central Server', bandwidth: 10, traffic: 30, level: 1 }
    ]
});
console.log('Setting traffic to 30 and bandwidth to 10...');
useISPStore.getState().tick();
console.log('Money after overload tick:', useISPStore.getState().money);
//# sourceMappingURL=verifyStore.js.map