import React from 'react';
import { useISPStore, ISPNode } from '../store/useISPStore';
import './NetworkNode.css';

interface NetworkNodeProps {
  node: ISPNode;
  eraOverride?: string; // Optional override for demonstration purposes
}

export const NetworkNode: React.FC<NetworkNodeProps> = ({ node, eraOverride }) => {
  const currentEra = useISPStore((state) => state.currentEra);
  const upgradeNode = useISPStore((state) => state.upgradeNode);
  const money = useISPStore((state) => state.money);

  const era = eraOverride || currentEra;
  const loadPercentage = Math.min(100, (node.traffic / node.bandwidth) * 100);
  const isOverloaded = node.traffic > node.bandwidth;
  const upgradeCost = node.level * 200;

  const renderTitle = () => {
    if (era === '90s') {
      return (
        <div className="node-title">
          <span>{node.name}</span>
          <div style={{ display: 'flex', gap: '2px' }}>
            <span style={{ cursor: 'pointer' }}>?</span>
            <span style={{ cursor: 'pointer' }}>X</span>
          </div>
        </div>
      );
    }
    return <h3>{node.name}</h3>;
  };

  return (
    <div className={`network-node era-${era}`}>
      {renderTitle()}
      
      <div className="node-info">
        <span>Level: {node.level}</span>
        <span>Bandwidth: {node.bandwidth} Mbps</span>
      </div>

      <div className="load-bar-container">
        <div 
          className="load-bar-fill" 
          style={{ width: `${loadPercentage}%` }}
        />
      </div>

      <div className="node-info">
        <span>Traffic: {node.traffic} Mbps</span>
        <span className={isOverloaded ? 'status-warning' : ''}>
          {isOverloaded ? 'PACKET LOSS' : 'STABLE'}
        </span>
      </div>

      <button 
        onClick={() => upgradeNode(node.id)}
        disabled={money < upgradeCost}
      >
        Upgrade ({upgradeCost} $)
      </button>

      {era === '70s' && (
        <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.7 }}>
          TERMINAL_READY_{node.id.padStart(4, '0')}
        </div>
      )}
    </div>
  );
};
