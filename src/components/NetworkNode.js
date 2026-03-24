import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useISPStore } from '../store/useISPStore';
import './NetworkNode.css';
export const NetworkNode = ({ node, eraOverride }) => {
    const currentEra = useISPStore((state) => state.currentEra);
    const upgradeNode = useISPStore((state) => state.upgradeNode);
    const money = useISPStore((state) => state.money);
    const era = eraOverride || currentEra;
    const loadPercentage = Math.min(100, (node.traffic / node.bandwidth) * 100);
    const isOverloaded = node.traffic > node.bandwidth;
    const upgradeCost = node.level * 200;
    const renderTitle = () => {
        if (era === '90s') {
            return (_jsxs("div", { className: "node-title", children: [_jsx("span", { children: node.name }), _jsxs("div", { style: { display: 'flex', gap: '2px' }, children: [_jsx("span", { style: { cursor: 'pointer' }, children: "?" }), _jsx("span", { style: { cursor: 'pointer' }, children: "X" })] })] }));
        }
        return _jsx("h3", { children: node.name });
    };
    return (_jsxs("div", { className: `network-node era-${era}`, children: [renderTitle(), _jsxs("div", { className: "node-info", children: [_jsxs("span", { children: ["Level: ", node.level] }), _jsxs("span", { children: ["Bandwidth: ", node.bandwidth, " Mbps"] })] }), _jsx("div", { className: "load-bar-container", children: _jsx("div", { className: "load-bar-fill", style: { width: `${loadPercentage}%` } }) }), _jsxs("div", { className: "node-info", children: [_jsxs("span", { children: ["Traffic: ", node.traffic, " Mbps"] }), _jsx("span", { className: isOverloaded ? 'status-warning' : '', children: isOverloaded ? 'PACKET LOSS' : 'STABLE' })] }), _jsxs("button", { onClick: () => upgradeNode(node.id), disabled: money < upgradeCost, children: ["Upgrade (", upgradeCost, " $)"] }), era === '70s' && (_jsxs("div", { style: { fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.7 }, children: ["TERMINAL_READY_", node.id.padStart(4, '0')] }))] }));
};
//# sourceMappingURL=NetworkNode.js.map