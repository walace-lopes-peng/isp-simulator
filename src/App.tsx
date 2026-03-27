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
    <div className={`h-14 w-full flex items-center justify-between px-6 border-b border-white/10 ${currentEra === '90s' ? 'win95-outset' : 'bg-black/40 backdrop-blur-md'} fixed top-0 z-50 glass-panel`}>
      <div className="flex items-center gap-8">
        <div className={currentEra === '90s' ? 'win95-header' : ''}>
          <h1 className={`text-xs font-black tracking-widest uppercase ${currentEra === '90s' ? 'text-white' : 'text-emerald-500'}`}>Logistic Map // Core</h1>
          <p className={`text-[8px] font-mono ${currentEra === '90s' ? 'text-white/70' : 'text-slate-500'}`}>SYSTEM_REVENUE_ACTIVE</p>
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
  const { selectedNodeId, nodes, links, upgradeNode, money, selectNode, connectNodes, isLinking, toggleLinking, currentEra } = useISPStore();
  const node = nodes.find(n => n.id === selectedNodeId);

  if (!node) return (
    <div className="w-[220px] h-full border-l border-white/10 p-6 bg-black/20 backdrop-blur-sm flex flex-col justify-center items-center text-center glass-panel">
      <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center mb-4">
        <div className="w-2 h-2 rounded-full bg-slate-700 animate-pulse" />
      </div>
      <p className="text-[10px] font-mono text-slate-600 uppercase tracking-tighter">Select a node to inspect architecture</p>
    </div>
  );

  const cost = Math.floor(50 * Math.pow(1.15, node.level));
  const load = node.traffic / node.bandwidth;
  const loadColor = load >= 1.0 ? 'bg-red-500' : load > 0.8 ? 'bg-amber-500' : 'bg-emerald-500';
  const isReachable = node.traffic > 0 || node.layer === 1;

  return (
    <div className="w-[220px] h-full border-l border-white/10 p-6 bg-black/20 backdrop-blur-sm flex flex-col glass-panel animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter mb-1">{node.name}</h2>
          <span className={`text-[8px] font-mono uppercase ${isReachable ? 'text-emerald-500' : 'text-red-500 animate-pulse'}`}>
            {isReachable ? 'CONNECTED // ONLINE' : 'ISOLATED // NO_SIGNAL'}
          </span>
        </div>
        <button onClick={() => { selectNode(null); if (isLinking) toggleLinking(); }} className="text-slate-600 hover:text-white text-xs">×</button>
      </div>

      <div className="space-y-6 flex-1">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Throughput</span>
            <span className="text-[9px] font-mono text-slate-300">{Math.floor(node.traffic)} / {node.bandwidth}</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full ${loadColor} transition-all duration-300`} style={{ width: `${Math.min(100, load * 100)}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-bold block tracking-tighter">Level</span>
            <span className="text-xs font-mono text-slate-200">LVL {node.level}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-bold block tracking-tighter">Taps</span>
            <span className="text-xs font-mono text-slate-200">{links.filter(l => l.sourceId === node.id || l.targetId === node.id).length}</span>
          </div>
        </div>

        <button 
          onClick={toggleLinking}
          className={`w-full py-2 border font-black text-[9px] uppercase tracking-widest transition-all
            ${currentEra === '90s' ? (isLinking ? 'win95-linking-flash' : 'win95-outset text-black') : (isLinking ? 'bg-amber-500 text-black border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10')}
          `}
        >
          {isLinking ? 'linking active...' : 'establish link'}
        </button>
      </div>

      <button 
        onClick={() => upgradeNode(node.id)}
        disabled={money < cost}
        className={`w-full py-3 rounded border font-black text-[10px] uppercase tracking-widest transition-all
          ${money >= cost ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 shadow-[0_0:10px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-white/5 text-slate-700 cursor-not-allowed opacity-50'}
        `}
      >
        {money >= cost ? `Upgrade // $${cost.toLocaleString()}` : `Insufficient Funds // $${cost.toLocaleString()}`}
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
          <div key={i} className={`text-[10px] ${log.includes('!!!') || log.includes('ERROR') || log.includes('ISOLATED') ? 'text-red-400' : i === 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
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
  const { nodes, links, zoomLevel, selectNode, selectedNodeId, connectNodes, setZoom, isLinking, currentEra } = useISPStore();
  const center = { x: 400, y: 400 };
  const ringRadii = [80, 180, 280, 380];

  const maxTier = zoomLevel <= 25 ? 1 : zoomLevel <= 50 ? 2 : zoomLevel <= 75 ? 3 : 4;
  const { money, addNode, addLog } = useISPStore();

  const getLoadColor = (load: number) => {
    if (load >= 0.9) return '#ef4444'; // Red
    if (load >= 0.5) return '#fbbf24'; // Amber
    return '#10b981'; // Green (Emerald-500 equivalent)
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY;
    const newZoom = Math.max(0, Math.min(100, zoomLevel - delta / 5));
    setZoom(newZoom);
  };

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    // If we're clicking a node, stopPropagation should prevent this
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    
    // Simple build logic: if clicking empty space, suggest building
    if (!selectedNodeId) {
        const cost = 500;
        const coverageRange = 250;
        const isWithinRange = nodes.some(n => {
            const d = Math.sqrt(Math.pow(n.x - svgP.x, 2) + Math.pow(n.y - svgP.y, 2));
            return d < coverageRange && (n.traffic > 0 || n.id === '0');
        });

        if (!isWithinRange && nodes.length > 0) {
            addLog("Area outside network coverage range", true);
            return;
        }

        if (money >= cost) {
            const newNode = {
                id: `node-${Date.now()}`,
                name: `New Hub ${nodes.length}`,
                bandwidth: 50,
                traffic: 0,
                level: 1,
                layer: maxTier,
                x: Math.round(svgP.x),
                y: Math.round(svgP.y)
            };
            addNode(newNode);
            addLog(`Built new node at [${newNode.x}, ${newNode.y}]`, false);
        } else {
            addLog(`Insufficient funds to build new node ($${cost} required)`, true);
        }
    }
  };

  return (
    <div className="flex-1 relative flex flex-col min-h-0 min-w-0" onWheel={handleWheel}>
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
        
        .node-circle {
          transform-box: fill-box;
          transform-origin: center;
        }
        
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .link-flow {
          animation: dash 1s linear infinite;
        }
      `}</style>
      
      <div className="absolute top-4 left-6 z-50 p-3 bg-black/40 backdrop-blur rounded-lg border border-white/5">
        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Network Focus // {Math.round(zoomLevel)}%</label>
        <input 
          type="range" min="0" max="100" step="1"
          value={zoomLevel}
          onChange={(e) => setZoom(parseInt(e.target.value))}
          className="w-48 accent-emerald-500 bg-slate-800 h-1 rounded-full cursor-pointer"
        />
        <div className="flex justify-between text-[7px] font-mono text-slate-600 mt-2 uppercase tracking-tighter">
          <span>Local</span>
          <span>Regional</span>
          <span>National</span>
          <span>Global</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <svg 
          viewBox="0 0 800 800" 
          preserveAspectRatio="xMidYMid slice" 
          className="w-full h-full max-h-[80vh] aspect-square drop-shadow-2xl overflow-visible rounded-lg border border-white/5 shadow-inner bg-[#040d1a]"
          onClick={handleMapClick}
        >
          {/* Geographical Map Layer */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
            </pattern>
            <filter id="glow">
               <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
               <feMerge>
                   <feMergeNode in="coloredBlur"/>
                   <feMergeNode in="SourceGraphic"/>
               </feMerge>
            </filter>
          </defs>
          
          <image href="/assets/world-map.png" width="800" height="800" opacity="0.5" preserveAspectRatio="xMidYMid slice" />
          <rect width="800" height="800" fill="url(#grid)" pointerEvents="none" />

          {/* Physical Cables */}
          {links.map(link => {
            const src = nodes.find(n => n.id === link.sourceId);
            const tgt = nodes.find(n => n.id === link.targetId);
            
            // Sync Visibility: A link is only visible if both its nodes are within the current maxTier
            if (!src || !tgt || src.layer > maxTier || tgt.layer > maxTier) return null;

            const load = (tgt.traffic / tgt.bandwidth);
            const strokeColor = getLoadColor(load);
            
            // Fix Coordinate Integrity: Remove Math.floor to ensure links anchor exactly at node centers
            const x1 = src.x;
            const y1 = src.y;
            const x2 = tgt.x;
            const y2 = tgt.y;

            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            const dx = x2 - x1;
            const dy = y2 - y1;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            const offset = dist * 0.15;
            const angle = Math.atan2(dy, dx);
            const controlX = midX + offset * Math.cos(angle - Math.PI / 2);
            const controlY = midY + offset * Math.sin(angle - Math.PI / 2);

            const strokeWidth = 1 + (link.bandwidth / 1000) * 1.5;

            return (
              <path 
                key={link.id}
                d={`M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`}
                fill="none"
                className="transition-all duration-1000 opacity-60 link-flow"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                filter={currentEra === 'modern' ? "url(#glow)" : "none"}
                strokeDasharray={currentEra === '70s' ? "2,2" : "5,5"}
              />
            );
          })}

          {/* Sectors */}
          {[1, 2, 3, 4].map(layerNum => {
            const layerNodes = nodes.filter(n => n.layer === layerNum);
            const isVisible = layerNum <= maxTier;

            if (!isVisible) return null; // CLEANUP: Removed aggregate node logic

            return (
              <g key={`layer-${layerNum}`} className="animate-in fade-in duration-700">
                {layerNodes.map((node) => {
                  const load = node.traffic / node.bandwidth;
                   const stateClass = load >= 1.0 ? 'node-critical' : load > 0.8 ? 'node-saturated' : 'node-healthy';
                   const isSelected = selectedNodeId === node.id;
                   
                   // Dynamic Radius based on zoomLevel and layer
                   const baseR = layerNum === 1 ? 12 : 8;
                   const zoomScale = 0.4 + (zoomLevel / 100) * 0.6; // Smaller at Global (0), Larger at Local (100)
                   const r = baseR * zoomScale;
                   
                   const isOffline = node.traffic === 0 && node.id !== '0';

                   return (
                     <g key={node.id} className="cursor-pointer" onClick={(e) => {
                       e.stopPropagation();
                       if (isLinking && selectedNodeId && selectedNodeId !== node.id) {
                         connectNodes(selectedNodeId, node.id);
                       } else {
                         selectNode(node.id);
                       }
                     }}>
                      {isSelected && <circle cx={node.x} cy={node.y} r={r + 6} className="fill-none stroke-emerald-500/40 stroke-1 animate-[ping_3s_infinite]" />}
                      <circle 
                        cx={node.x} cy={node.y} r={r}
                        className={`node-circle transition-all duration-300 stroke-2 fill-slate-900 ${isOffline ? 'stroke-slate-700 opacity-40' : stateClass} ${isSelected ? 'stroke-white scale-110' : ''}`}
                      />
                      <text 
                        x={node.x} y={node.y + r + 12} 
                        textAnchor="middle"
                        className={`text-[8px] font-black font-mono select-none pointer-events-none uppercase transition-all backdrop-blur-sm ${isOffline ? 'opacity-20' : 'fill-slate-300'}`}
                      >
                        {node.name}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Central Processor Hub (Visual Only) */}
          <rect x={383} y={248} width="24" height="24" rx="4" className="fill-emerald-500/20 stroke-emerald-500/40 stroke-1 animate-pulse pointer-events-none" />
        </svg>
      </div>
    </div>
  );
};

import DebugConsole from './components/DebugConsole';

const App = () => {
  const { tick, currentEra, tickRate } = useISPStore();

  useEffect(() => {
    const timer = setInterval(() => tick(), tickRate);
    return () => clearInterval(timer);
  }, [tick, tickRate]);

  return (
    <div className={`theme-${currentEra} h-screen flex flex-col bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30 overflow-hidden`}>
      <TopBar />
      
      <div className="flex-1 flex pt-14 relative min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <LogisticMap />
          <LogPanel />
        </div>
        <Sidebar />
      </div>

      <footer className="h-6 bg-black border-t border-white/5 px-4 flex items-center justify-between z-50">
        <span className="text-[8px] font-mono text-slate-700 tracking-wider">PROTOCOL_VX // TOPOLOGY_SYNCED</span>
        <div className="flex gap-2">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-slate-800" />
            ))}
        </div>
      </footer>

      {import.meta.env.DEV && <DebugConsole />}
    </div>
  );
};

export default App;
