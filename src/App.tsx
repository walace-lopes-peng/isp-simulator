import React, { useEffect, useRef } from 'react';
import { useISPStore } from './store/useISPStore';

// --- NEW UI PANELS ---

const TopBar = () => {
  const { money, currentEra, totalData, nodes } = useISPStore();
  const traffic = nodes.reduce((sum, n) => sum + n.traffic, 0);
  const bandwidth = nodes.reduce((sum, n) => sum + n.bandwidth, 0);
  const loadRatio = traffic / bandwidth;
  
  const status = loadRatio >= 1.0 ? 'CRITICAL' : loadRatio > 0.8 ? 'STRESSED' : 'STABLE';
  const statusColor = loadRatio >= 1.0 ? 'text-red-500' : loadRatio > 0.8 ? 'text-amber-500' : 'text-emerald-500';

  return (
    <div className="h-14 w-full flex items-center justify-between px-6 border-b border-white/10 bg-black/40 backdrop-blur-md fixed top-0 z-50 glass-panel">
      <div className="flex items-center gap-8">
        <div>
          <h1 className="text-xs font-black tracking-widest text-emerald-500 uppercase">Logistic Map // Core</h1>
          <p className="text-[8px] font-mono text-slate-500">SYSTEM_REVENUE_ACTIVE</p>
        </div>
        <div className="h-8 w-px bg-white/5" />
        <div className="flex gap-6 items-center">
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-bold block">Available Capital</span>
            <span className="text-sm font-mono text-emerald-400 font-bold">${money.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-bold block">Total Data</span>
            <span className="text-sm font-mono text-slate-200">{Math.floor(totalData / 100).toLocaleString()} GB</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="text-right">
          <span className="text-[9px] text-slate-500 uppercase font-bold block">Network Status</span>
          <span className={`text-[10px] font-black tracking-tighter ${statusColor}`}>{status} // {(loadRatio * 100).toFixed(0)}% LOAD</span>
        </div>
        <div className="px-3 py-1 bg-white/5 border border-white/10 rounded">
          <span className="text-[10px] font-black text-slate-400 uppercase italic">{currentEra} ERA</span>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const { selectedNodeId, nodes, links, upgradeNode, money, selectNode, connectNodes } = useISPStore();
  const [linkMode, setLinkMode] = React.useState(false);
  const node = nodes.find(n => n.id === selectedNodeId);

  useEffect(() => {
    if (linkMode) {
      document.body.classList.add('establish-link-active');
    } else {
      document.body.classList.remove('establish-link-active');
    }
    return () => {
      document.body.classList.remove('establish-link-active');
    };
  }, [linkMode]);

  if (!node) return (
    <div className="w-[220px] h-full border-l border-white/10 p-6 bg-black/20 backdrop-blur-sm flex flex-col justify-center items-center text-center glass-panel">
      <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center mb-4">
        <div className="w-2 h-2 rounded-full bg-slate-700 animate-pulse" />
      </div>
      <p className="text-[10px] font-mono text-slate-600 uppercase">Select a node to inspect infrastructure</p>
    </div>
  );

  const cost = Math.floor(50 * Math.pow(1.15, node.level));
  const load = node.traffic / node.bandwidth;
  const loadColor = load >= 1.0 ? 'bg-red-500' : load > 0.8 ? 'bg-amber-500' : 'bg-emerald-500';
  const isReachable = node.traffic > 0 || node.layer === 1;

  return (
    <div className="w-[220px] h-full border-l border-white/10 p-6 bg-black/20 backdrop-blur-sm flex flex-col glass-panel">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter mb-1">{node.name}</h2>
          <span className={`text-[8px] font-mono uppercase ${isReachable ? 'text-emerald-500' : 'text-red-500 animate-pulse'}`}>
            {isReachable ? 'CONNECTED // ONLINE' : 'ISOLATED // NO_SIGNAL'}
          </span>
        </div>
        <button onClick={() => { selectNode(null); setLinkMode(false); }} className="text-slate-600 hover:text-white text-xs">×</button>
      </div>

      <div className="space-y-6 flex-1">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-[9px] text-slate-400 uppercase font-bold">Throughput</span>
            <span className="text-[9px] font-mono text-slate-300">{Math.floor(node.traffic)} / {node.bandwidth}</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full ${loadColor} transition-all duration-300`} style={{ width: `${Math.min(100, load * 100)}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-bold block">Current Level</span>
            <span className="text-xs font-mono text-slate-200">LVL {node.level}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-bold block">Connections</span>
            <span className="text-xs font-mono text-slate-200">
              {links.filter(l => l.sourceId === node.id || l.targetId === node.id).length}
            </span>
          </div>
        </div>

        <button 
          onClick={() => setLinkMode(!linkMode)}
          className={`w-full py-2 rounded border font-black text-[9px] uppercase tracking-widest transition-all
            ${linkMode ? 'bg-amber-500/20 border-amber-500 text-amber-500 animate-pulse' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}
          `}
        >
          {linkMode ? 'CANCEL LINKING' : 'ESTABLISH LINK'}
        </button>
      </div>

      <button 
        onClick={() => upgradeNode(node.id)}
        disabled={money < cost}
        className={`w-full py-3 rounded border font-black text-[10px] uppercase tracking-widest transition-all
          ${money >= cost ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20' : 'bg-white/5 border-white/5 text-slate-700 cursor-not-allowed'}
        `}
      >
        Upgrade // ${cost.toLocaleString()}
      </button>
    </div>
  );
};

const LogPanel = () => {
  const { logs } = useISPStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="h-[120px] w-full border-t border-white/10 bg-black/60 p-4 font-mono overflow-y-auto glass-panel" ref={scrollRef}>
      <div className="space-y-1">
        {logs.map((log, i) => (
          <div key={i} className={`text-[10px] ${log.includes('!!!') || log.includes('ERROR') ? 'text-red-400' : i === 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className="mr-2 text-slate-700">{'>'}</span>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- LOGISTIC MAP CORE ---

const LogisticMap = () => {
  const { nodes, links, zoomLevel, selectNode, selectedNodeId, connectNodes } = useISPStore();
  const center = { x: 400, y: 400 };
  const ringRadii = [80, 180, 280, 380];

  const zoom = zoomLevel; // 0-100
  const maxTier = zoom <= 25 ? 1 : zoom <= 50 ? 2 : zoom <= 75 ? 3 : 4;

  const getLoadColor = (load: number) => {
    return load >= 1.0 ? '#ef4444' : load > 0.8 ? '#fbbf24' : '#22d3ee';
  };

  const handleNodeClick = (nodeId: string) => {
    const isLinkMode = document.querySelector('.sidebar-link-mode-active'); // Trick or passed via props
    // Better: check if we have a selected node and UI state. 
    // Since Sidebar and LogisticMap share the store, we can just use selectedNodeId.
    // I'll check for a custom attribute on the sidebar which I'll add.
  };

  return (
    <div className="flex-1 relative overflow-hidden bg-slate-950">
      <style>{`
        @keyframes pulse-steady { 0%, 100% { opacity: 1; r: 4; } 50% { opacity: 0.7; r: 5; } }
        @keyframes pulse-fast { 0%, 100% { opacity: 1; r: 4; } 50% { opacity: 0.5; r: 6; } }
        @keyframes glitch-flicker { 
          0%, 100% { opacity: 1; transform: translate(0); } 
          10%, 30% { opacity: 0; transform: translate(-2px, 1px); } 
          20% { opacity: 1; transform: translate(2px, -1px); }
          80% { opacity: 0.2; transform: translate(1px, 1px); }
        }
        .node-healthy { animation: pulse-steady 2s infinite ease-in-out; stroke: #22d3ee; }
        .node-saturated { animation: pulse-fast 1s infinite ease-in-out; stroke: #fbbf24; }
        .node-critical { animation: glitch-flicker 0.4s infinite linear; stroke: #ef4444; }
      `}</style>
      
      <div className="absolute top-4 left-4 z-50">
        <input 
          type="range" min="0" max="100" step="1"
          value={zoomLevel}
          onChange={(e) => useISPStore.getState().setZoom(parseInt(e.target.value))}
          className="w-48 accent-emerald-500 bg-slate-800 h-1 rounded-full cursor-pointer shadow-2xl"
        />
        <div className="flex justify-between text-[8px] font-mono text-slate-600 mt-1 uppercase">
          <span>Local</span>
          <span>Regional</span>
          <span>National</span>
          <span>Global</span>
        </div>
      </div>

      <svg viewBox="0 0 800 800" className="w-full h-full max-w-[800px] mx-auto">
        {ringRadii.map((radius, i) => (
          <g key={i}>
            <circle cx={center.x} cy={center.y} r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={maxTier === i + 1 ? 2 : 1} />
          </g>
        ))}

        {/* Physical Cables */}
        {links.map(link => {
          const src = nodes.find(n => n.id === link.sourceId);
          const tgt = nodes.find(n => n.id === link.targetId);
          if (!src || !tgt) return null;

          const load = tgt.traffic / tgt.bandwidth;
          const strokeColor = getLoadColor(load);

          return (
            <line 
              key={link.id}
              x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
              className="transition-all duration-1000"
              stroke={strokeColor}
              strokeWidth="2"
              strokeDasharray="4,4"
            />
          );
        })}

        {[1, 2, 3, 4].map(layerNum => {
          const layerNodes = nodes.filter(n => n.layer === layerNum);
          const isVisible = layerNum <= maxTier;

          if (isVisible) {
            return (
              <g key={`active-layer-${layerNum}`}>
                {layerNodes.map((node, i) => {
                  const load = node.traffic / node.bandwidth;
                  const stateClass = load >= 1.0 ? 'node-critical' : load > 0.8 ? 'node-saturated' : 'node-healthy';
                  const isSelected = selectedNodeId === node.id;
                  const radiusSize = layerNum === 1 ? (zoom <= 25 ? 18 : 10) : 6;
                  const isOffline = node.traffic === 0 && node.layer !== 1;

                  return (
                    <g key={node.id} className="cursor-pointer group" onClick={() => {
                        const isLinkMode = document.body.classList.contains('establish-link-active');
                        if (isLinkMode && selectedNodeId && selectedNodeId !== node.id) {
                            connectNodes(selectedNodeId, node.id);
                        } else {
                            selectNode(node.id);
                        }
                    }}>
                      {isSelected && (
                        <circle cx={node.x} cy={node.y} r={radiusSize + 8} className="fill-emerald-500/10 animate-ping" />
                      )}
                      <circle 
                        cx={node.x} cy={node.y} r={radiusSize}
                        className={`node-circle transition-all duration-300 stroke-2 fill-slate-900 ${isOffline ? 'stroke-slate-700 opacity-40' : stateClass} ${isSelected ? 'stroke-white' : ''}`}
                      />
                      <text 
                        x={node.x + (radiusSize + 4)} y={node.y + 3} 
                        className={`text-[8px] font-mono select-none pointer-events-none uppercase transition-opacity ${isOffline ? 'opacity-20' : 'fill-slate-500'}`}
                      >
                        {layerNum === 3 ? "HUB" : node.name.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          } else {
            const avgLoad = layerNodes.reduce((acc, n) => acc + (n.traffic / n.bandwidth), 0) / (layerNodes.length || 1);
            const radius = ringRadii[layerNum - 1];
            const nx = center.x + radius! * Math.cos((-90 * Math.PI) / 180);
            const ny = center.y + radius! * Math.sin((-90 * Math.PI) / 180);

            return (
              <g key={`aggregate-${layerNum}`} className="opacity-20 h-pointer pointer-events-none">
                <circle cx={nx} cy={ny} r="24" className="stroke-2 fill-slate-900" stroke={getLoadColor(avgLoad)} strokeDasharray="4,2" />
                <text x={nx} y={ny + 4} textAnchor="middle" className="text-[10px] font-mono fill-slate-200 font-bold uppercase">
                  {layerNodes.length}
                </text>
              </g>
            );
          }
        })}

        <rect x={center.x - 10} y={center.y - 10} width="20" height="20" rx="4" className="fill-emerald-500 shadow-xl animate-pulse" />
      </svg>
    </div>
  );
};

const App = () => {
  const { startTick, currentEra } = useISPStore();

  useEffect(() => {
    startTick();
  }, [startTick]);

  return (
    <div className={`theme-${currentEra} h-screen flex flex-col bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30`}>
      <TopBar />
      
      <div className="flex-1 flex pt-14 relative">
        <div className="flex-1 flex flex-col">
          <LogisticMap />
          <LogPanel />
        </div>
        <Sidebar />
      </div>

      <footer className="h-6 bg-black border-t border-white/5 px-4 flex items-center justify-between z-50">
        <span className="text-[8px] font-mono text-slate-700 tracking-wider">SEC_OP_PROTOCOL // NODE_SCAN_LOADED</span>
        <div className="flex gap-2">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-slate-800" />
            ))}
        </div>
      </footer>
    </div>
  );
};

export default App;
