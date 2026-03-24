import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo } from 'react';
import { useISPStore } from './store/useISPStore';
// --- SUB-COMPONENTS ---
const StatusIndicator = ({ ratio }) => {
    const status = ratio < 0.7 ? 'STABLE' : ratio < 1.0 ? 'STRESSED' : 'CRITICAL';
    const colorClass = ratio < 0.7 ? 'text-emerald-500' : ratio < 1.0 ? 'text-amber-500' : 'text-rose-500 animate-pulse';
    return (_jsxs("div", { className: "flex flex-col items-end", children: [_jsx("span", { className: "text-[10px] text-slate-500 font-bold tracking-widest uppercase", children: "System Status" }), _jsx("span", { className: `text-xl font-black tracking-tighter ${colorClass}`, children: status })] }));
};
const NodeModule = ({ id }) => {
    const node = useISPStore(state => state.nodes.find(n => n.id === id));
    const upgradeNode = useISPStore(state => state.upgradeNode);
    const money = useISPStore(state => state.money);
    if (!node)
        return null;
    const loadRatio = node.traffic / node.bandwidth;
    const statusClass = loadRatio < 0.7 ? 'module-stable' : loadRatio < 1.0 ? 'module-stressed' : 'module-critical';
    const barColor = loadRatio < 0.7 ? 'bg-emerald-500' : loadRatio < 1.0 ? 'bg-amber-500' : 'bg-rose-500';
    const upgradeCost = node.level * 200;
    return (_jsxs("div", { className: `system-module ${statusClass}`, children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-slate-100 font-bold text-sm tracking-tight mb-1 uppercase", children: node.name }), _jsxs("p", { className: "text-[10px] text-slate-500 font-mono italic", children: ["ID: NODE_", node.id.padStart(3, '0')] })] }), _jsxs("div", { className: "text-right", children: [_jsx("span", { className: "stat-label", children: "Level" }), _jsx("div", { className: "stat-value text-emerald-500/80", children: node.level })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-[10px] font-mono", children: [_jsxs("span", { className: "text-slate-400", children: ["LOAD: ", Math.floor(node.traffic), "Mbps"] }), _jsxs("span", { className: "text-slate-500", children: ["CAP: ", node.bandwidth, "Mbps"] })] }), _jsx("div", { className: "load-track", children: _jsx("div", { className: `load-fill ${barColor}`, style: { width: `${Math.min(100, loadRatio * 100)}%` } }) })] }), _jsxs("div", { className: "mt-2 pt-4 border-t border-white/5 flex items-center justify-between", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "stat-label", children: "Utilization" }), _jsxs("span", { className: `stat-value text-xs ${loadRatio > 0.9 ? 'text-rose-400' : 'text-slate-300'}`, children: [Math.floor(loadRatio * 100), "%"] })] }), _jsxs("button", { onClick: () => upgradeNode(id), disabled: money < upgradeCost, className: `px-4 py-1.5 rounded text-[10px] font-bold tracking-widest transition-all ${money >= upgradeCost
                            ? 'bg-slate-100 text-slate-950 hover:bg-emerald-400 active:scale-95'
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`, children: ["UPGRADE ($", upgradeCost, ")"] })] })] }));
};
const App = () => {
    const { money, currentEra, nodes, logs, totalData, tick } = useISPStore();
    // --- GAME LOOP ---
    useEffect(() => {
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [tick]);
    // --- DERIVED STATS ---
    const { totalTraffic, totalBandwidth, stressRatio } = useMemo(() => {
        const traffic = nodes.reduce((sum, n) => sum + n.traffic, 0);
        const bandwidth = nodes.reduce((sum, n) => sum + n.bandwidth, 0);
        return {
            totalTraffic: traffic,
            totalBandwidth: bandwidth,
            stressRatio: bandwidth > 0 ? traffic / bandwidth : 0
        };
    }, [nodes]);
    return (_jsxs("div", { className: `theme-${currentEra} h-screen flex flex-col bg-system-bg`, children: [_jsxs("nav", { className: "control-bar", children: [_jsxs("div", { className: "flex items-center gap-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-sm font-black tracking-[0.2em] text-emerald-500/80", children: "NET\u2011SIM // CORE" }), _jsx("p", { className: "text-[9px] text-slate-600 font-mono leading-none", children: "VERSION 4.2.0-STABLE" })] }), _jsx("div", { className: "h-8 w-px bg-slate-800" }), _jsxs("div", { className: "flex gap-10", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "stat-label", children: "Available Capital" }), _jsxs("span", { className: "text-xl font-bold text-slate-100 tabular-nums font-mono", children: ["$", money.toLocaleString()] })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "stat-label", children: "Total Data Processed" }), _jsxs("span", { className: "text-xl font-bold text-slate-300 tabular-nums font-mono", children: [(totalData / 1000).toFixed(2), " TB"] })] })] })] }), _jsxs("div", { className: "flex items-center gap-8", children: [_jsxs("div", { className: "text-right", children: [_jsx("span", { className: "stat-label", children: "Current Era" }), _jsx("span", { className: "block text-xs font-black text-slate-400 tracking-widest uppercase italic", children: currentEra })] }), _jsx(StatusIndicator, { ratio: stressRatio })] })] }), _jsxs("div", { className: "flex flex-1 overflow-hidden", children: [_jsxs("main", { className: "flex-1 main-panel custom-scrollbar", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h2", { className: "text-xs font-bold tracking-widest text-slate-500 flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-500 animate-pulse" }), "ACTIVE NETWORK MODULES"] }), _jsxs("span", { className: "text-[10px] font-mono text-slate-600", children: ["Uptime: ", Math.floor(totalData / 500), " cycles"] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: nodes.map(node => (_jsx(NodeModule, { id: node.id }, node.id))) })] }), _jsxs("aside", { className: "side-panel", children: [_jsxs("section", { className: "p-6 border-b border-system-border bg-slate-900/40", children: [_jsx("span", { className: "stat-label mb-4 block", children: "Network Overview" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-end", children: [_jsx("span", { className: "text-[10px] text-slate-500 uppercase", children: "Nodes Active" }), _jsx("span", { className: "text-sm font-mono text-slate-200 font-bold", children: nodes.length })] }), _jsxs("div", { className: "flex justify-between items-end", children: [_jsx("span", { className: "text-[10px] text-slate-500 uppercase", children: "Input Traffic" }), _jsxs("span", { className: "text-sm font-mono text-emerald-400 font-bold", children: [Math.floor(totalTraffic), " Mbps"] })] }), _jsxs("div", { className: "flex justify-between items-end", children: [_jsx("span", { className: "text-[10px] text-slate-500 uppercase", children: "Total Capacity" }), _jsxs("span", { className: "text-sm font-mono text-slate-400 font-bold", children: [totalBandwidth, " Mbps"] })] })] })] }), _jsxs("section", { className: "flex-1 flex flex-col p-6 overflow-hidden", children: [_jsx("span", { className: "stat-label mb-4 block", children: "Operation Logs" }), _jsx("div", { className: "flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-2", children: logs.map((log, i) => (_jsx("div", { className: `log-entry ${log.includes('!!!') ? 'text-rose-400 font-bold bg-rose-500/5' :
                                                log.includes('SUCCESS') ? 'text-emerald-400' : 'text-slate-500 opacity-80'}`, style: { opacity: 1 - (i * 0.08) }, children: log }, i))) })] }), _jsxs("div", { className: "p-4 bg-slate-950/80 border-t border-system-border flex justify-between items-center bg-grid-slate-900/[0.04]", children: [_jsx("span", { className: "text-[8px] font-mono text-slate-700 tracking-tighter", children: "SEC_PROTOCOL_V4" }), _jsx("div", { className: "flex gap-1", children: [...Array(5)].map((_, i) => (_jsx("div", { className: "w-1 h-1 rounded-full bg-slate-800" }, i))) })] })] })] })] }));
};
export default App;
//# sourceMappingURL=App.js.map