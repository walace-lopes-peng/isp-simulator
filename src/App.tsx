import React, { useEffect, useRef } from 'react';
import { useISPStore, RANGE_PRESETS, RangeLevel } from './store/useISPStore';
import DebugConsole from './components/DebugConsole';
import EraWrapper from './components/EraWrapper';

// --- UI COMPONENTS ---

const TopBar = () => {
  const { money, totalData, nodes, networkHealth, canUpgradeEra, purchaseEraUpgrade } = useISPStore();
  const eraConfig = useISPStore(state => state.getCurrentEraConfig());
  const traffic = nodes.reduce((sum, n) => sum + n.traffic, 0);
  const bandwidth = nodes.reduce((sum, n) => sum + n.bandwidth, 0);
  const loadRatio = bandwidth > 0 ? traffic / bandwidth : 0;
  
  const status = loadRatio >= 1.0 ? 'CRITICAL' : loadRatio > 0.8 ? 'STRESSED' : 'STABLE';
  const statusColor = loadRatio >= 1.0 ? 'text-red-500' : loadRatio > 0.8 ? 'text-amber-500' : 'text-emerald-500';
  const healthColor = networkHealth < 50 ? 'text-red-500' : networkHealth < 80 ? 'text-amber-400' : 'text-emerald-400';

  return (
    <div className="era-topbar h-14 w-full flex items-center justify-between px-6 border-b border-white/10 fixed top-0 z-50 glass-panel">
      <div className="flex items-center gap-8">
        <div>
          <h1 className="era-title text-xs font-black tracking-widest uppercase text-emerald-500">Logistic Map // Core</h1>
          <p className="era-subtitle text-[8px] font-mono text-slate-500">SYSTEM_REVENUE_ACTIVE</p>
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
          <div className="h-8 w-px bg-white/5 mx-2" />
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-500 uppercase font-bold block">Network Health</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-mono font-bold ${healthColor}`}>{Math.floor(networkHealth)}%</span>
              <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full ${networkHealth < 50 ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-emerald-500'} transition-all duration-1000`} style={{ width: `${networkHealth}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="text-right">
          <span className="text-[9px] text-slate-500 uppercase font-bold block">Network Status</span>
          <span className={`text-[10px] font-black tracking-tighter ${statusColor}`}>{status} // {(loadRatio * 100).toFixed(0)}% LOAD</span>
        </div>
        <div className="flex gap-2 items-center">
          {canUpgradeEra && (
            <button 
              onClick={purchaseEraUpgrade}
              className="px-3 py-1 bg-amber-500/20 text-amber-500 border border-amber-500/50 rounded font-black text-[9px] uppercase tracking-wider hover:bg-amber-500/40 animate-pulse"
            >
              UPGRADE ERA
            </button>
          )}
          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded">
            <span className="text-[10px] font-black text-slate-400 uppercase italic">{eraConfig.displayName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const { selectedNodeId, nodes, links, upgradeNode, money, selectNode, isLinking, toggleLinking, isGodMode } = useISPStore();
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
  const load = node.bandwidth > 0 ? node.traffic / node.bandwidth : 0;
  const loadColor = load >= 1.0 ? 'bg-red-500' : load > 0.8 ? 'bg-amber-500' : 'bg-emerald-500';
  const isReachable = node.traffic > 0 || node.layer === 1;

  return (
    <div className="w-[220px] h-full border-l border-white/10 p-6 bg-black/20 backdrop-blur-sm flex flex-col glass-panel animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter mb-1">{node.name}</h2>
          <div className="flex gap-2 items-center">
            <span className={`text-[8px] font-mono uppercase ${isReachable ? 'text-emerald-500' : 'text-red-500 animate-pulse'}`}>
              {isReachable ? 'CONNECTED // ONLINE' : 'ISOLATED // NO_SIGNAL'}
            </span>
            <span className="text-[7px] bg-white/10 px-1 py-0.5 rounded text-slate-400 font-mono tracking-tighter">{node.type}</span>
          </div>
        </div>
        <button onClick={() => { selectNode(null); if (isLinking) toggleLinking(); }} className="text-slate-600 hover:text-white text-xs">×</button>
      </div>

      <div className="space-y-6 flex-1">
        {node.hazard && (
          <div className="bg-red-500/10 border border-red-500/30 p-2 rounded animate-pulse">
            <span className="text-[8px] font-black text-red-500 uppercase tracking-widest block">⚠ CRITICAL_HAZARD</span>
            <p className="text-[9px] text-red-400 font-mono italic">{node.hazard.toUpperCase()}_DETECTED</p>
          </div>
        )}
        
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

        <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
            <label className="text-[8px] font-black text-slate-600 uppercase">Interaction Protocol</label>
            <div className="bg-white/5 p-2 rounded text-[8px] font-mono text-slate-400">
                DRAG FROM NODE TO CONNECT_LINK.
            </div>
        </div>
      </div>

      <button 
        onClick={() => upgradeNode(node.id)}
        disabled={!isGodMode && money < cost}
        className={`w-full py-3 rounded border font-black text-[10px] uppercase tracking-widest transition-all
          ${isGodMode || money >= cost ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-white/5 text-slate-700 cursor-not-allowed opacity-50'}
        `}
      >
        {isGodMode ? `God Upgrade // FREE` : money >= cost ? `Upgrade // $${cost.toLocaleString()}` : `Insufficient Funds // $${cost.toLocaleString()}`}
      </button>
    </div>
  );
};

const LogPanel = () => {
  const { logs } = useISPStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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

// --- LOGISTIC MAP ---

const LogisticMap = () => {
  const { 
    nodes, links, rangeLevel, selectNode, selectedNodeId, 
    setRange, dragSourceId, dragPos, 
    startDragging, setDragPos, endDragging, validateLink,
    money, addNode, addLog
  } = useISPStore();
  
  const currentRange = RANGE_PRESETS[rangeLevel];
  const maxTier = rangeLevel;
  const svgRef = useRef<SVGSVGElement>(null);

  const getSVGPoint = (e: React.PointerEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
  };

  const handlePointerDown = (e: React.PointerEvent, nodeId?: string) => {
    if (nodeId) {
      e.stopPropagation();
      startDragging(nodeId);
      selectNode(nodeId); // Select on down for immediate feedback
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragSourceId) {
      const p = getSVGPoint(e);
      if (p) setDragPos(p.x, p.y);
    }
  };

  const handlePointerUp = (e: React.PointerEvent, nodeId?: string) => {
    if (dragSourceId) {
      if (nodeId) (e as any).stopPropagation();
      endDragging(nodeId);
    }
  };

  const getLoadColor = (load: number) => {
    if (load >= 0.9) return '#ef4444';
    if (load >= 0.5) return '#fbbf24';
    return '#10b981';
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0 && rangeLevel < 4) setRange((rangeLevel + 1) as RangeLevel);
    else if (e.deltaY < 0 && rangeLevel > 1) setRange((rangeLevel - 1) as RangeLevel);
  };

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (dragSourceId) return; // Ignore click if dragging
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    
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
            const nodeTypeLookup: Record<RangeLevel, any> = {
                1: 'hub_local',
                2: 'hub_regional',
                3: 'backbone',
                4: 'backbone'
            };

            const newNode = {
                id: `node-${Date.now()}`,
                name: `New Hub ${nodes.length}`,
                bandwidth: 50,
                traffic: 0,
                level: 1,
                layer: maxTier,
                type: nodeTypeLookup[rangeLevel as RangeLevel],
                health: 100,
                x: Math.round(svgP.x),
                y: Math.round(svgP.y)
            };
            addNode(newNode);
            addLog(`Built ${newNode.type} at [${newNode.x}, ${newNode.y}]`, false);
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
        .node-circle { transform-box: fill-box; transform-origin: center; }
        @keyframes dash { to { stroke-dashoffset: -20; } }
        .link-flow { animation: dash 1s linear infinite; }
        .map-svg { transition: view-box 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .ghost-line { pointer-events: none; stroke-dasharray: 4,4; transition: stroke 0.2s; }
        .range-overlay { pointer-events: none; fill: rgba(16, 185, 129, 0.03); stroke: rgba(16, 185, 129, 0.1); stroke-dasharray: 2,2; }
      `}</style>
      
      {/* HUD Layer */}
      <div className="absolute top-4 left-6 z-50 p-3 bg-black/60 backdrop-blur-xl rounded-lg border border-white/10 shadow-2xl">
        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-2">Network Focus // {currentRange.name}</label>
        <div className="flex gap-1">
          {([1, 2, 3, 4] as const).map(level => (
            <button 
              key={level}
              onClick={() => setRange(level)}
              className={`px-3 py-1.5 text-[9px] font-black border transition-all duration-300 ${rangeLevel === level ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'}`}
            >
              LEVEL {level}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <svg 
          ref={svgRef}
          viewBox={currentRange.viewBox} 
          preserveAspectRatio="xMidYMid slice" 
          className="w-full h-full max-h-[85vh] aspect-square drop-shadow-2xl overflow-visible rounded-lg border border-white/10 shadow-inner bg-[#040d1a] map-svg"
          onPointerMove={handlePointerMove}
          onPointerUp={() => handlePointerUp({} as any)}
          onClick={handleMapClick}
        >
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
          
          <image href="/assets/world-map.png" width="800" height="800" opacity="0.4" preserveAspectRatio="xMidYMid slice" />
          <rect width="800" height="800" fill="url(#grid)" pointerEvents="none" />

          {links.map(link => {
            const src = nodes.find(n => n.id === link.sourceId);
            const tgt = nodes.find(n => n.id === link.targetId);
            if (!src || !tgt || src.layer > maxTier || tgt.layer > maxTier) return null;
            const load = (tgt.traffic / tgt.bandwidth);
            const strokeColor = getLoadColor(load);
            const dx = tgt.x - src.x;
            const dy = tgt.y - src.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const offset = dist * 0.15;
            const angle = Math.atan2(dy, dx);
            const controlX = (src.x + tgt.x) / 2 + offset * Math.cos(angle - Math.PI / 2);
            const controlY = (src.y + tgt.y) / 2 + offset * Math.sin(angle - Math.PI / 2);
            return (
              <path 
                key={link.id}
                d={`M ${src.x} ${src.y} Q ${controlX} ${controlY} ${tgt.x} ${tgt.y}`}
                fill="none"
                className="transition-all duration-1000 opacity-60 link-flow thematic-link"
                stroke={strokeColor}
                strokeWidth={1 + (link.bandwidth / 1000) * 1.5}
              />
            );
          })}

          {/* DRAG FEEDBACK */}
          {dragSourceId && dragPos && (() => {
            const src = nodes.find(n => n.id === dragSourceId);
            if (!src) return null;
            const targetNode = nodes.find(n => {
                const d = Math.sqrt(Math.pow(n.x - dragPos.x, 2) + Math.pow(n.y - dragPos.y, 2));
                return d < 25 && n.id !== dragSourceId;
            });
            const isValid = targetNode ? validateLink(dragSourceId, targetNode.id).valid : false;

            return (
              <g className="animate-in fade-in duration-300">
                <circle cx={src.x} cy={src.y} r={350} className="range-overlay" />
                <line 
                  x1={src.x} y1={src.y} 
                  x2={dragPos.x} y2={dragPos.y} 
                  stroke={!targetNode ? '#475569' : (isValid ? '#10b981' : '#f43f5e')}
                  className="ghost-line" strokeWidth="2"
                  strokeDasharray={isValid ? "none" : "4,4"}
                />
              </g>
            );
          })()}

          {[1, 2, 3, 4].map(layerNum => {
            const layerNodes = nodes.filter(n => n.layer === layerNum);
            if (layerNum === 1 && rangeLevel === 4) return null;
            if (layerNum > maxTier) return null;

            return (
              <g key={`layer-${layerNum}`} className="animate-in fade-in duration-700">
                {layerNodes.map((node) => {
                   const load = node.bandwidth > 0 ? node.traffic / node.bandwidth : 0;
                   const stateClass = load >= 1.0 ? 'node-critical' : load > 0.8 ? 'node-saturated' : 'node-healthy';
                   const isSelected = selectedNodeId === node.id || dragSourceId === node.id;
                   const isFilterActive = dragSourceId !== null && dragSourceId !== node.id;
                   const isValidTarget = dragSourceId ? validateLink(dragSourceId, node.id).valid : true;
                   
                   const baseR = layerNum === 1 ? 14 : 9;
                   const rangeScale = 1.0 - (rangeLevel - 1) * 0.15;
                   const r = baseR * rangeScale;
                   return (
                     <g key={node.id} className="cursor-pointer" 
                        onPointerDown={(e) => handlePointerDown(e, node.id)}
                        onPointerUp={(e) => handlePointerUp(e, node.id)}
                        onClick={(e) => e.stopPropagation()}
                     >
                       {isSelected && <circle cx={node.x} cy={node.y} r={r + 6} className="fill-none stroke-emerald-500/40 stroke-1 animate-[ping_3s_infinite]" />}
                       <circle 
                         cx={node.x} cy={node.y} r={r}
                         className={`node-circle transition-all duration-300 stroke-2 fill-slate-900 
                          ${isSelected ? 'stroke-white scale-110 shadow-lg' : stateClass}
                          ${isFilterActive && !isValidTarget ? 'opacity-20' : 'opacity-100'}`}
                       />
                       <text 
                         x={node.x} y={node.y + r + 14} 
                         textAnchor="middle"
                         className={`text-[8px] font-black font-mono select-none pointer-events-none uppercase transition-all ${isFilterActive && !isValidTarget ? 'opacity-10' : 'fill-slate-300'}`}
                       >
                         {rangeLevel < 4 ? node.name : ''} 
                       </text>
                     </g>
                   );
                })}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

const App = () => {
  const { tick, tickRate } = useISPStore();

  useEffect(() => {
    const timer = setInterval(() => tick(), tickRate);
    return () => clearInterval(timer);
  }, [tick, tickRate]);

  return (
    <EraWrapper>
      <TopBar />
      
      <div className="flex-1 flex pt-14 relative min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <LogisticMap />
          <LogPanel />
        </div>
        <Sidebar />
      </div>

      {import.meta.env.DEV && <DebugConsole />}

      <footer className="h-6 bg-black border-t border-white/5 px-4 flex items-center justify-between z-50">
        <span className="text-[8px] font-mono text-slate-700 tracking-wider">PROTOCOL_VX // TOPOLOGY_SYNCED</span>
        <div className="flex gap-2">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-slate-800" />
            ))}
        </div>
      </footer>
    </EraWrapper>
  );
};

export default App;
