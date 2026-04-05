import React, { useEffect, useRef, useState } from 'react';
import { useISPStore, RANGE_PRESETS, RangeLevel, ERAS_CONFIG, EraConfig, ISPNode, ISPNodeType } from './store/useISPStore';
import { useTechStore } from './store/useTechStore';
import { NODE_TEMPLATES } from './config/nodeRegistry';
import DebugConsole from './components/DebugConsole';
import TechTreePanel from './components/TechTreePanel';
import EraWrapper from './components/EraWrapper';

const formatData = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(2)} MB`;
  const gb = mb / 1024;
  if (gb < 1024) return `${gb.toFixed(2)} GB`;
  const tb = gb / 1024;
  return `${tb.toFixed(2)} TB`;
};

const formatCurrency = (val: number): string => {
  return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const abbreviateNodeName = (node: ISPNode): string => {
  const { name, id, isDevSpawned } = node;
  if (isDevSpawned) return `H-${id.slice(-4).toUpperCase()}`;
  
  const upper = (name || "").toUpperCase();
  if (upper === "CORE GATEWAY") return "GW";
  if (upper.includes("BACKBONE")) return `BB-${upper.replace(/BACKBONE/g, "").trim()}`;
  if (upper.includes("TERMINAL")) return `T-${upper.replace(/LOCAL TERMINAL/g, "").replace(/TERMINAL/g, "").trim()}`;
  if (upper.includes("HUB")) return `H-${upper.replace(/LOCAL HUB/g, "").replace(/REGIONAL HUB/g, "").replace(/HUB/g, "").trim()}`;
  if (upper.includes("GATEWAY")) return "GW";
  
  return upper.slice(0, 4);
};


// --- UI COMPONENTS ---

const MilestoneMonitor: React.FC = () => {
  const currentEraId = useISPStore(state => state.currentEra);
  const totalData = useISPStore(state => state.totalData);
  const money = useISPStore(state => state.money);
  const nodes = useISPStore(state => state.nodes);
  const isGodMode = useISPStore(state => state.isGodMode);
  
  const unlockedTechIds = useTechStore(state => state.unlockedTechIds);

  const eraConfig = ERAS_CONFIG.find(e => e.id === currentEraId) ?? ERAS_CONFIG[0];
  const currentIndex = ERAS_CONFIG.findIndex(e => e.id === currentEraId);
  const nextEra = currentIndex >= 0 && currentIndex < ERAS_CONFIG.length - 1
    ? ERAS_CONFIG[currentIndex + 1]
    : null;

  if (!nextEra) return null;

  const hubs = nodes.filter(n => n.type === 'hub_local').length;
  const isdn = unlockedTechIds.includes('isdn_early');
  
  const dataTarget = nextEra.unlockCondition.totalData;
  const moneyTarget = nextEra.unlockCondition.money;
  
  const dataMet = totalData >= dataTarget;
  const moneyMet = money >= moneyTarget;
  const hubsMet = eraConfig.id === '70s' ? hubs >= 3 : true;
  const isdnMet = eraConfig.id === '70s' ? isdn : true;

  const isClose = (totalData / dataTarget > 0.5) || (money / moneyTarget > 0.5);
  if (!isClose && eraConfig.id !== '70s' && !isGodMode) return null;

  return (
    <div className="flex items-center gap-3 bg-black/40 px-3 py-1 rounded border border-white/5 mr-2 min-w-[280px]">
      <div className="flex flex-col">
          <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Next Epoch</span>
          <span className="text-[8px] font-mono text-slate-400 italic">Requirements</span>
      </div>
      <div className="h-6 w-px bg-white/10" />
      <div className="grid grid-cols-[140px_120px] gap-x-4 gap-y-0.5 text-[8px] font-mono tabular-nums leading-none tracking-tight">
        <span className={dataMet ? 'text-emerald-500' : 'text-amber-500'}>
          {dataMet ? '✓' : '✗'} Data: {formatData(totalData)}/{formatData(dataTarget)}
        </span>
        {eraConfig.id === '70s' && (
          <span className={hubsMet ? 'text-emerald-500' : 'text-red-500'}>
            {hubsMet ? '✓' : '✗'} Hubs: {hubs}/3
          </span>
        )}
        <span className={moneyMet ? 'text-emerald-500' : 'text-amber-500'}>
          {moneyMet ? '✓' : '✗'} Capital: ${formatCurrency(money)}/${formatCurrency(moneyTarget)}
        </span>
        {eraConfig.id === '70s' && (
          <span className={isdnMet ? 'text-emerald-500' : 'text-red-500'}>
            {isdnMet ? '✓' : '✗'} ISDN: {isdn ? 'Unlocked' : 'Not researched'}
          </span>
        )}
      </div>
    </div>
  );
};


const TopBar = ({ onOpenResearch }: { onOpenResearch: () => void }) => {
  const money = useISPStore(state => state.money);
  const techPoints = useISPStore(state => state.techPoints);
  const tpAccumulator = useISPStore(state => state.tpAccumulator);
  const totalData = useISPStore(state => state.totalData);
  const nodes = useISPStore(state => state.nodes);
  const networkHealth = useISPStore(state => state.networkHealth);
  const canUpgradeEra = useISPStore(state => state.canUpgradeEra);
  const isGodMode = useISPStore(state => state.isGodMode);
  const currentEraId = useISPStore(state => state.currentEra);
  
  const purchaseEraUpgrade = useISPStore(state => state.purchaseEraUpgrade);
  const { getAggregateModifiers } = useTechStore();

  const [netRate, setNetRate] = useState(0);
  const prevMoneyRef = useRef(money);

  useEffect(() => {
    const delta = money - prevMoneyRef.current;
    setNetRate(prev => prev * 0.9 + delta * 0.1);
    prevMoneyRef.current = money;
  }, [money]);

  const eraConfig = ERAS_CONFIG.find(e => e.id === currentEraId) ?? ERAS_CONFIG[0];
  const multipliers = getAggregateModifiers();
  
  const traffic = nodes.reduce((sum, n) => sum + n.traffic, 0);
  const bandwidth = nodes.reduce((sum, n) => sum + (n.bandwidth * multipliers.bandwidthMultiplier), 0);
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
          <div className="w-40 flex-shrink-0">
            <span className="text-[9px] text-slate-500 uppercase font-bold block">Available Capital</span>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-mono tabular-nums text-emerald-400 font-bold block truncate">
                ${formatCurrency(money)}
              </span>
              <span className={`text-[9px] font-mono ${netRate >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {netRate >= 0 ? '+' : ''}${netRate.toFixed(2)}/t
              </span>
            </div>
          </div>
          <div className="group relative flex flex-col w-32 flex-shrink-0">
            <span className="text-[9px] text-slate-500 uppercase font-bold block">Research Insight</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-mono tabular-nums text-cyan-400 font-bold tracking-tight block truncate">
                TP: {techPoints.toLocaleString()}
              </span>
              <span className="text-[8px] font-mono text-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                .{((tpAccumulator || 0) * 1000).toFixed(0).padStart(3, '0')}
              </span>
            </div>
            <div className="absolute -bottom-2 left-0 w-max h-px bg-cyan-500/50 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
          </div>
          <div className="w-24 flex-shrink-0">
            <span className="text-[9px] text-slate-500 uppercase font-bold block">Total Data</span>
            <span className="text-sm font-mono tabular-nums text-slate-200 block truncate">{formatData(totalData)}</span>
          </div>
          <div className="h-8 w-px bg-white/5 mx-2" />
          <div className="flex flex-col w-28 flex-shrink-0">
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
          <MilestoneMonitor />

          {isGodMode && (
            <div className="px-2 py-1 bg-amber-500 text-black rounded font-black text-[9px] uppercase tracking-wider animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]">
              GOD MODE ACTIVE
            </div>
          )}
          {canUpgradeEra && (
            <button 
              onClick={purchaseEraUpgrade}
              className="px-3 py-1 bg-amber-500/20 text-amber-500 border border-amber-500/50 rounded font-black text-[9px] uppercase tracking-wider hover:bg-amber-500/40 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.2)]"
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

  const template = NODE_TEMPLATES.find(t => t.type === node.type);

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
            <span className={`text-[8px] font-mono uppercase ${node.health <= 0 ? 'text-red-500 animate-pulse' : isReachable ? 'text-emerald-500' : 'text-amber-500'}`}>
              {node.health <= 0 ? 'STATUS_FAILED // CRITICAL' : isReachable ? 'CONNECTED // ONLINE' : 'ISOLATED // NO_SIGNAL'}
            </span>
            <span className="text-[7px] bg-white/10 px-1 py-0.5 rounded text-slate-400 font-mono tracking-tighter">
              {template?.displayName ?? node.type}
            </span>
          </div>
          {template?.description && (
            <p className="text-[8px] text-slate-500 italic mt-1 leading-tight">
              {template.description}
            </p>
          )}
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

        {node.health < 100 && (
          <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Integrity</span>
              <span className={`text-[9px] font-mono ${node.health < 30 ? 'text-red-500' : 'text-amber-500'}`}>{node.health}%</span>
            </div>
            <button 
              onClick={() => useISPStore.getState().repairNode(node.id)}
              disabled={!isGodMode && money < 250}
              className={`w-full py-2 rounded border font-black text-[9px] uppercase tracking-wider transition-all
                ${isGodMode || money >= 250 ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/30' : 'bg-white/5 border-white/5 text-slate-700 cursor-not-allowed opacity-50'}
              `}
            >
              {node.health <= 0 ? (
                isGodMode ? 'RECONSTRUCT // FREE' : money >= 250 ? 'RECONSTRUCT // $250' : 'INSUFFICIENT FUNDS'
              ) : (
                isGodMode ? 'RESTORE_INTEGRITY // FREE' : money >= 250 ? 'MAINTENANCE // $250' : 'INSUFFICIENT FUNDS'
              )}
            </button>
          </div>
        )}

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

const NetworkStatsPanel = () => {
  const { nodes, links, money, networkHealth, techPoints } = useISPStore();
  const { getAggregateModifiers } = useTechStore();
  const multipliers = getAggregateModifiers();

  const totalBandwidth = nodes.reduce((sum, n) => sum + (n.bandwidth * multipliers.bandwidthMultiplier), 0);
  const totalTraffic = nodes.reduce((sum, n) => sum + n.traffic, 0);
  const avgLatency = multipliers.latencyMultiplier * 100; // Simulated base

  return (
    <div className="grid grid-cols-2 gap-8 p-8 h-full max-w-4xl mx-auto items-center">
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Network Integrity</span>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-mono font-bold text-emerald-400">{Math.floor(networkHealth)}%</span>
            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${networkHealth}%` }} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Active Nodes</span>
            <span className="text-xl font-mono text-white">{nodes.length}</span>
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Active Links</span>
            <span className="text-xl font-mono text-white">{links.length}</span>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Avg Network Latency</span>
          <span className="text-3xl font-mono font-bold text-cyan-400">{avgLatency.toFixed(1)}ms</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Total Capacity</span>
            <span className="text-xl font-mono text-white">{(totalBandwidth / 1000).toFixed(1)} GB</span>
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Research Progress</span>
            <span className="text-xl font-mono text-amber-500">{techPoints.toLocaleString()} TP</span>
          </div>
        </div>
      </div>
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
    money, addNode, addLog, isHubCreationEnabled, isHubDeletionEnabled, removeNode,
    activeDevNodeType
  } = useISPStore();
  
  const currentRange = RANGE_PRESETS[rangeLevel];
  const maxTier = rangeLevel;
  const svgRef = useRef<SVGSVGElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1.5)
  const [isPanning, setIsPanning] = useState(false);
  const isPanningRef = useRef(false)
  const panStartRef = useRef({ x: 0, y: 0 })
  const panOffsetRef = useRef({ x: 0, y: 0 })
  const pointerDownTimeRef = useRef(0)
  const pointerDownPosRef = useRef({ x: 0, y: 0 })
  const eraConfig = useISPStore(state => state.getCurrentEraConfig());

  const renderNodeShape = (node: ISPNode, r: number, strokeColor: string, stateClass: string) => {
    const isGateway = node.isCore && node.type === 'hub_local';
    
    // Node Status Logic
    const isFailed = node.health <= 0;
    const isWarning = node.health < 30 && !isFailed;
    
    const finalStateClass = isFailed ? 'node-failed' : isWarning ? 'node-warning' : stateClass;
    const finalStrokeColor = isFailed ? '#ef4444' : isWarning ? '#f97316' : strokeColor;

    const commonProps = {
      className: `transition-all duration-300 ${finalStateClass} ${isGateway ? 'stroke-[2.5px] opacity-100' : 'stroke-1 opacity-80'}`,
      stroke: finalStrokeColor,
      fill: "none",
    };

    const icons = [
      // HIT AREA: Invisible larger circle to capture pointers accurately 
      <circle key="hit-area" cx={node.x} cy={node.y} r={r * 1.5} fill="transparent" pointerEvents="all" className="cursor-pointer" />
    ];
    
    switch (node.type) {
      case 'terminal': {
        // Concept: Triangular roof + Rectangular body
        const w = r;
        const bh = r * 0.6;
        const rh = r * 0.6;
        icons.push(
          <g key="terminal-icon" {...commonProps}>
            <rect x={node.x - w/2} y={node.y} width={w} height={bh} />
            <path d={`M ${node.x - w*0.6} ${node.y} L ${node.x} ${node.y - rh} L ${node.x + w*0.6} ${node.y} Z`} />
          </g>
        );
        break;
      }
      case 'hub_local': {
        // Concept: Minimal switch/router (horizontal capsule)
        const w = r * 1.6;
        const h = r * 0.5;
        icons.push(
          <g key="hub-local-icon" {...commonProps}>
            <rect x={node.x - w/2} y={node.y - h/2} width={w} height={h} rx={1} />
            {/* Port indicators (small vertical lines) */}
            <line x1={node.x - w*0.2} y1={node.y + h/2} x2={node.x - w*0.2} y2={node.y + h/2 + r*0.2} />
            <line x1={node.x + w*0.2} y1={node.y + h/2} x2={node.x + w*0.2} y2={node.y + h/2 + r*0.2} />
            {isGateway && <circle cx={node.x} cy={node.y} r={r*0.8} className="stroke-white/20 animate-pulse" />}
          </g>
        );
        break;
      }
      case 'hub_regional': {
        // Concept: Antenna tower (pole + arcs)
        const ph = r * 1.4;
        icons.push(
          <g key="hub-regional-icon" {...commonProps}>
            <line x1={node.x} y1={node.y - ph/2} x2={node.x} y2={node.y + ph/2} />
            <path d={`M ${node.x - r*0.4} ${node.y - r*0.2} Q ${node.x} ${node.y - r*0.7} ${node.x + r*0.4} ${node.y - r*0.2}`} />
            <path d={`M ${node.x - r*0.25} ${node.y} Q ${node.x} ${node.y - r*0.3} ${node.x + r*0.25} ${node.y}`} />
          </g>
        );
        break;
      }
      case 'backbone': {
        // Concept: Server unit (two horizontal lines + indicator LEDs)
        const w = r * 1.4;
        icons.push(
          <g key="backbone-icon" {...commonProps}>
            <line x1={node.x - w/2} y1={node.y - r*0.2} x2={node.x + w/2} y2={node.y - r*0.2} />
            <line x1={node.x - w/2} y1={node.y + r*0.2} x2={node.x + w/2} y2={node.y + r*0.2} />
            <circle cx={node.x + w*0.4} cy={node.y - r*0.2} r={0.5} fill={strokeColor} stroke="none" />
            <circle cx={node.x + w*0.4} cy={node.y + r*0.2} r={0.5} fill={strokeColor} stroke="none" />
          </g>
        );
        break;
      }
    }

    return <g className="node-icon-group">{icons}</g>;
  };


  const getSVGPoint = (e: React.PointerEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
  };

  const getEraMaxDist = () => {
    const eraId = useISPStore.getState().currentEra;
    const eraIndex = ERAS_CONFIG.findIndex((e: EraConfig) => e.id === eraId);
    return 150 + (eraIndex * 100);
  };

  const handlePointerDown = (e: React.PointerEvent, nodeId?: string) => {
    if (nodeId) {
      e.stopPropagation();
      startDragging(nodeId);
      selectNode(nodeId); // Select on down for immediate feedback
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanningRef.current) {
      const movedX = Math.abs(e.clientX - panStartRef.current.x)
      const movedY = Math.abs(e.clientY - panStartRef.current.y)
      if (movedX < 3 && movedY < 3) return

      const dx = e.clientX - panStartRef.current.x
      const dy = e.clientY - panStartRef.current.y
      panOffsetRef.current = {
        x: panOffsetRef.current.x + dx,
        y: panOffsetRef.current.y + dy
      }
      panStartRef.current = { x: e.clientX, y: e.clientY }
      if (mapContainerRef.current) {
        mapContainerRef.current.style.transform =
          `translate(${panOffsetRef.current.x}px, ${panOffsetRef.current.y}px) scale(${zoomLevel})`
      }
      return
    }
    if (dragSourceId) {
      const p = getSVGPoint(e);
      if (p) setDragPos(p.x, p.y);
    }
  };
  const handlePointerUp = (e: React.PointerEvent, nodeId?: string) => {
    if (isPanningRef.current) {
      isPanningRef.current = false
      if (isPanning) setIsPanning(false)
      return
    }
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
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.87 : 1.15
    setZoomLevel(prev => {
      const next = Math.min(Math.max(prev * delta, 0.5), 8)
      if (mapContainerRef.current) {
        mapContainerRef.current.style.transform =
          `translate(${panOffsetRef.current.x}px, ${panOffsetRef.current.y}px) scale(${next})`
      }
      return next
    })
  }

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const elapsed = Date.now() - pointerDownTimeRef.current
    const dx = Math.abs(e.clientX - pointerDownPosRef.current.x)
    const dy = Math.abs(e.clientY - pointerDownPosRef.current.y)
    if (elapsed > 200 || dx > 5 || dy > 5) return // was a pan

    if (dragSourceId) return;

    // --- Interaction Guard ---
    if (selectedNodeId) {
      selectNode(null); // Click map to deselect
      return;
    }
    
    if (isHubDeletionEnabled) return; // Don't create when deleting
    
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    
    const coverageRange = 250;
    const isWithinRange = nodes.some(n => {
        const d = Math.sqrt(Math.pow(n.x - svgP.x, 2) + Math.pow(n.y - svgP.y, 2));
        return d < coverageRange && (n.traffic > 0 || n.id === '0');
    });

    if (!isHubCreationEnabled && !isWithinRange && nodes.length > 0) {
        addLog("Area outside network coverage range", true);
        return;
    }

    if (isHubCreationEnabled) {
        const template = NODE_TEMPLATES.find(t => t.type === activeDevNodeType);
        
        if (!template) {
            addLog(`[WARNING] Invalid activeDevNodeType: ${activeDevNodeType}`, true);
            return;
        }

        const newNode: ISPNode = {
            id: `node-${Date.now()}`,
            name: `New Hub ${nodes.length}`,
            bandwidth: template.baseBandwidth,
            baseBandwidth: template.baseBandwidth,
            traffic: 0,
            level: 1,
            layer: template.hierarchyLevel,
            type: template.type,
            health: 100,
            x: Math.round(svgP.x),
            y: Math.round(svgP.y),
            isDevSpawned: true
        };
        addNode(newNode);
        addLog(`[DEV] Built ${template.displayName} at [${newNode.x}, ${newNode.y}]`, false);
    }
  };



  return (
    <div className="flex-1 relative flex flex-col min-h-0 min-w-0" onWheel={handleWheel}>
      <style>{`
        @keyframes pulse-steady { 0%, 100% { opacity: 1; r: 5; } 50% { opacity: 0.7; r: 6; } }
        @keyframes pulse-soft { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.1); opacity: 0.4; } }
        @keyframes glitch-flicker { 
          0%, 100% { opacity: 1; transform: translate(0); } 
          10%, 30% { opacity: 0; transform: translate(-2px, 1px); } 
          20% { opacity: 1; transform: translate(2px, -1px); }
          80% { opacity: 0.2; transform: translate(1px, 1px); }
        }
        .node-healthy { animation: pulse-steady 2s infinite ease-in-out; stroke: #22d3ee; }
        .node-saturated { animation: pulse-steady 1s infinite ease-in-out; stroke: #fbbf24; }
        .node-warning { animation: pulse-steady 0.5s infinite ease-in-out; stroke: #f97316; }
        .node-failed { animation: glitch-flicker 0.2s infinite linear; stroke: #ef4444; }
        .node-circle, .node-rect { 
          transform-box: fill-box; 
          transform-origin: center; 
        }
        .selection-glow {
          animation: pulse-soft 2s infinite ease-in-out;
          transform-box: fill-box;
          transform-origin: center;
          }
        @keyframes dash { to { stroke-dashoffset: -20; } }
        .link-flow { animation: dash 1s linear infinite; }
        .map-svg { transition: none; }
        .ghost-line { pointer-events: none; stroke-dasharray: 4,4; transition: stroke 0.2s; }
        .range-overlay { pointer-events: none; fill: rgba(16, 185, 129, 0.03); stroke: rgba(16, 185, 129, 0.1); stroke-dasharray: 2,2; }
      `}</style>
      
      {/* HUD Layer */}
      <div className="absolute top-2 left-2 z-10">
        <div className="bg-black/60 border border-white/10 px-2 py-1 rounded text-[8px] font-mono text-slate-500">
          {Math.round(zoomLevel * 100)}%
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden" style={{ display: 'flex' }}>
        <div
          ref={mapContainerRef}
          style={{
            transform: `translate(${panOffsetRef.current.x}px, ${panOffsetRef.current.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
            willChange: 'transform',
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
        >
        <svg
          ref={svgRef}
          viewBox="0 0 800 800"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full max-h-[85vh] aspect-square drop-shadow-2xl overflow-visible rounded-lg border border-white/10 shadow-inner bg-[#040d1a] map-svg"
          onPointerDown={(e) => {
            pointerDownTimeRef.current = Date.now()
            pointerDownPosRef.current = { x: e.clientX, y: e.clientY }
            if (e.button === 1 || (e.button === 0 && !dragSourceId)) {
              isPanningRef.current = true;
              setIsPanning(true);
              panStartRef.current = { x: e.clientX, y: e.clientY }
              e.currentTarget.setPointerCapture(e.pointerId)
            }
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={(e) => handlePointerUp(e)}
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
          
          <image
            href="/assets/usa-all-counties.svg"
            x="0"
            y="146"
            width="800"
            height="507"
            opacity="0.18"
            preserveAspectRatio="xMidYMid meet"
            style={{ filter: 'brightness(0.35) saturate(0.2) hue-rotate(180deg)', pointerEvents: 'none' }}
          />
          <rect width="800" height="800" fill="url(#grid)" pointerEvents="none" />

          {/* PRE-CALCULATE ACTIVE LINKS (O(N) Optimization) */}
          {(() => {
            const activePaths = useISPStore.getState().activePaths;
            const activeLinkKeys = new Set<string>();
            Object.values(activePaths).forEach(sessions => {
              sessions.forEach(session => {
                const path = session.path;
                for (let i = 0; i < path.length - 1; i++) {
                  const key = [path[i], path[i+1]].sort().join('-');
                  activeLinkKeys.add(key);
                }
              });
            });

            return links.map(link => {
              const src = nodes.find(n => n.id === link.sourceId);
              const tgt = nodes.find(n => n.id === link.targetId);
              if (!src || !tgt || src.layer > maxTier || tgt.layer > maxTier) return null;

              const linkKey = [link.sourceId, link.targetId].sort().join('-');
              const isActive = activeLinkKeys.has(linkKey);

              const load = (tgt.traffic / tgt.bandwidth);
              const strokeColor = getLoadColor(load);
              
              // Skip curves during pan for performance
              const isHighPerf = isPanning || zoomLevel < 0.8;
              
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
                  d={isHighPerf ? `M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}` : `M ${src.x} ${src.y} Q ${controlX} ${controlY} ${tgt.x} ${tgt.y}`}
                  fill="none"
                  className={`transition-all duration-1000 link-flow thematic-link ${isActive ? 'opacity-100' : 'opacity-20'}`}
                  stroke={strokeColor}
                  strokeWidth={0.5 + (link.bandwidth / 1000) * 0.8}
                  filter={(isActive && !isHighPerf && eraConfig.id === 'modern') ? "url(#glow)" : "none"}
                  strokeDasharray={eraConfig.id === '70s' ? "2,2" : "none"}
                />
              );
            });
          })()}

          {/* PACKET VISUALIZATION (Cull at low zoom) */}
          {zoomLevel >= 1.2 && Object.entries(useISPStore.getState().activePaths).map(([nodeId, sessions]) => {
            const sourceNode = nodes.find(n => n.id === nodeId);
            if (!sourceNode || sourceNode.layer > maxTier) return null;

            return sessions.map((session, sIndex) => {
              const { pathD } = session;

              if (!pathD) return null;

              // Fix: Guard against short/invalid paths (M x y with no Q)
              const isValidPath = pathD && pathD.trim().split(' ').length > 3;
              if (!isValidPath) return null;

              // Dot speed proportional to path latency & era technology
              const signal = sourceNode.signalStrength || 100;
              const currentEraId = useISPStore.getState().currentEra;
              
              const baseDuration = currentEraId === '70s' ? 9 : 
                                   currentEraId === '80s' ? 6 : 4;
              
              const signalFactor = signal > 70 ? 1.0 : signal > 40 ? 1.4 : 2.0;
              const duration = Math.round(baseDuration * signalFactor * 100) / 100;
              const packetColor = signal > 70 ? "#22d3ee" : signal > 40 ? "#fbbf24" : "#ef4444";

              return (
                <g key={`${session.sessId}-${pathD.slice(0, 20)}`}>
                  <circle r="1.2" fill={packetColor} className="drop-shadow-[0_0_2px_rgba(255,255,255,0.4)] pointer-events-none">
                    <animateMotion 
                      path={pathD} 
                      dur={`${duration}s`} 
                      repeatCount="indefinite"
                      rotate="auto"
                      begin="0s"
                      restart="always"
                    />
                  </circle>
                </g>
              );
            });
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
                <line 
                  x1={src.x} y1={src.y} 
                  x2={dragPos.x} y2={dragPos.y} 
                  stroke={!targetNode ? '#475569' : (isValid ? '#10b981' : '#f43f5e')}
                  className="ghost-line" strokeWidth="1.5"
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
                   
                    const baseR = node.type === 'terminal' ? 4 : 
                                 node.type === 'hub_local' || node.isCore ? 6 :
                                 node.type === 'hub_regional' ? 8 :
                                 node.type === 'backbone' ? 10 : 6;

                    const rangeScale = 1.0 - (rangeLevel - 1) * 0.15;
                    const r = baseR * rangeScale;
                    const strokeColor = node.uiColor || '#22d3ee';

                    return (
                      <g key={node.id} className={`cursor-${isHubDeletionEnabled ? 'crosshair' : 'pointer'}`} 
                         onPointerDown={(e) => handlePointerDown(e, node.id)}
                         onPointerUp={(e) => handlePointerUp(e, node.id)}
                         onClick={(e) => {
                           e.stopPropagation();
                           if (isHubDeletionEnabled) {
                             removeNode(node.id);
                           } else {
                             selectNode(node.id);
                           }
                         }}
                      >
                        {isSelected && (
                          <g transform={`translate(${node.x}, ${node.y})`}>
                            <circle r={r * 1.2} className="fill-none stroke-emerald-500/40 stroke-1 selection-glow" />
                          </g>
                        )}
                        
                        {renderNodeShape(node, r, strokeColor, stateClass)}
                        
                        {/* Fix 2: Reduced label size/opacity on unconnected nodes */}
                        {(node.traffic > 0 || node.isCore || isSelected) && (
                          <text 
                            x={node.x} y={node.y + r + 8} 
                            textAnchor="middle"
                            className={`text-[7px] font-black font-mono select-none pointer-events-none uppercase transition-all 
                              ${isSelected ? 'opacity-100 fill-white' : (node.traffic > 0 || node.isCore) ? 'opacity-50 fill-slate-400' : 'opacity-20 fill-slate-500'}`}
                          >
                            {rangeLevel < 4 ? abbreviateNodeName(node) : ''} 
                          </text>
                        )}
                      </g>
                    );
                 })}
               </g>
             );
           })}
         </svg>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const { tick, tickRate, links } = useISPStore();
  const [activeTab, setActiveTab] = useState<'map' | 'research' | 'network' | 'log'>('map');

  const [showDragHint, setShowDragHint] = useState(() => {
    return !localStorage.getItem('hasBuiltFirstLink');
  });

  // Dismiss when first link is created
  useEffect(() => {
    if (links.length > 0 && showDragHint) {
      setShowDragHint(false);
      localStorage.setItem('hasBuiltFirstLink', 'true');
    }
  }, [links.length, showDragHint]);

  useEffect(() => {
    const timer = setInterval(() => tick(), tickRate);
    return () => clearInterval(timer);
  }, [tick, tickRate]);

  return (
    <EraWrapper>
      <TopBar onOpenResearch={() => setActiveTab('research')} />
      
      <div className="flex-1 flex pt-14 relative min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <div
            className="flex-1 relative flex flex-col min-h-0"
          >
            <LogisticMap />
            
            {showDragHint && links.length === 0 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
                <div className="bg-black/70 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] uppercase tracking-widest px-4 py-2 rounded">
                  ← drag from any node to connect infrastructure →
                </div>
              </div>
            )}
          </div>

          {/* Bottom Taskbar Area */}
          {activeTab !== 'map' && (
            <div
              className="h-[280px] border-t border-white/10 bg-black/60 overflow-hidden animate-in slide-in-from-bottom duration-300 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-3 py-1 border-b border-white/5">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                  {activeTab === 'research' && 'Research & Development'}
                  {activeTab === 'network' && 'Network Statistics'}
                  {activeTab === 'log' && 'System Log'}
                </span>
                <button
                  onClick={() => setActiveTab('map')}
                  className="text-slate-600 hover:text-white text-xs leading-none"
                >
                  ×
                </button>
              </div>
              {activeTab === 'research' && <TechTreePanel />}
              {activeTab === 'network' && <NetworkStatsPanel />}
              {activeTab === 'log' && <LogPanel />}
            </div>
          )}

          {/* Taskbar Tabs */}
          <div 
            className="h-9 bg-black/80 border-t border-white/10 flex items-center px-4 gap-1 z-50 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {(['map', 'research', 'network', 'log'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-[9px] font-mono uppercase tracking-widest transition-all
                  ${activeTab === tab
                    ? 'text-emerald-400 border-b border-emerald-500 bg-emerald-500/5'
                    : 'text-slate-600 hover:text-slate-400 hover:bg-white/5'
                  }`}
              >
                {tab}
              </button>
            ))}
            <div className="flex-1" />
            <span className="text-[8px] font-mono text-slate-700 tracking-wider">PROTOCOL_VX // TOPOLOGY_SYNCED</span>
          </div>
        </div>
        <div 
          className="pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Sidebar />
        </div>
      </div>

      {import.meta.env.DEV && <DebugConsole />}
    </EraWrapper>
  );
};

export default App;
