import { create } from 'zustand';
const ERAS = {
    '70s': { threshold: 0, next: '90s' },
    '90s': { threshold: 10000, next: 'modern' },
    'modern': { threshold: 100000, next: null }
};
export const useISPStore = create((set, get) => ({
    money: 500,
    currentEra: '70s',
    totalData: 0,
    logs: ['[SYSTEM] Interface initialized. Welcome, operator.', '[SYSTEM] Network scanning... All nodes online.'],
    nodes: [
        { id: '1', name: 'Core Gateway', bandwidth: 100, traffic: 20, level: 1 },
        { id: '2', name: 'Local Hub', bandwidth: 50, traffic: 10, level: 1 },
    ],
    addLog: (msg, isCritical = false) => set((state) => ({
        logs: [`[${new Date().toLocaleTimeString()}] ${isCritical ? '!!! ' : ''}${msg}`, ...state.logs].slice(0, 15)
    })),
    tick: () => set((state) => {
        // 1. Calculate Traffic Fluctuations
        const updatedNodes = state.nodes.map(node => {
            const drift = Math.floor(Math.random() * (node.level * 10)) - (node.level * 2);
            const newTraffic = Math.max(0, Math.min(node.traffic + drift, node.bandwidth * 1.5));
            return { ...node, traffic: newTraffic };
        });
        // 2. Revenue & Penalties (Congestion)
        const totalTraffic = updatedNodes.reduce((sum, n) => sum + n.traffic, 0);
        const totalBandwidth = updatedNodes.reduce((sum, n) => sum + n.bandwidth, 0);
        const hasCongestion = totalTraffic > totalBandwidth;
        const revenue = totalTraffic;
        const profit = hasCongestion ? revenue * 0.5 : revenue;
        // 3. Accumulate Data
        const newTotalData = state.totalData + totalTraffic;
        // 4. Era Evolution
        let nextEra = state.currentEra;
        const eraConfig = ERAS[state.currentEra];
        if (eraConfig.next && newTotalData >= ERAS[eraConfig.next].threshold) {
            nextEra = eraConfig.next;
            // We'll call addLog in the next frame or just handle it here
        }
        // Prepare logs if something big happened
        const newLogs = [...state.logs];
        if (hasCongestion && Math.random() > 0.8) {
            newLogs.unshift(`[${new Date().toLocaleTimeString()}] !!! CRITICAL: Network congestion detected.`);
        }
        if (nextEra !== state.currentEra) {
            newLogs.unshift(`[${new Date().toLocaleTimeString()}] EVOLUTION: System upgraded to ${nextEra} era.`);
        }
        return {
            nodes: updatedNodes,
            money: state.money + Math.floor(profit),
            totalData: newTotalData,
            currentEra: nextEra,
            logs: newLogs.slice(0, 15)
        };
    }),
    upgradeNode: (id) => set((state) => {
        const node = state.nodes.find(n => n.id === id);
        if (!node)
            return state;
        const cost = node.level * 200;
        if (state.money < cost) {
            return {
                logs: [`[${new Date().toLocaleTimeString()}] ERROR: Insufficient funds for upgrade.`, ...state.logs].slice(0, 15)
            };
        }
        return {
            money: state.money - cost,
            nodes: state.nodes.map(n => n.id === id ? {
                ...n,
                level: n.level + 1,
                bandwidth: n.bandwidth + 100
            } : n),
            logs: [`[${new Date().toLocaleTimeString()}] SUCCESS: ${node.name} upgraded to Level ${node.level + 1}.`, ...state.logs].slice(0, 15)
        };
    }),
    addNode: (node) => set((state) => ({
        nodes: [...state.nodes, node]
    })),
    setEra: (era) => set({ currentEra: era }),
}));
//# sourceMappingURL=useISPStore.js.map