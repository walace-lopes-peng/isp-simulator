import React, { useState, useEffect, useRef } from 'react';
import { useISPStore, ERAS_CONFIG } from '../store/useISPStore';
import { useTechStore } from '../store/useTechStore';
import { NODE_TEMPLATES } from '../config/nodeRegistry';
import techTreeData from '../config/techTreeConfig.json';

const DebugConsole: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: 80 });
  const consoleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const {
    money,
    addMoney,
    techPoints,
    addTechPoints,
    resetTopology,
    isGodMode,
    toggleGodMode,
    tickRate,
    setTickRate,
    currentEra,
    setEra,
    addLog,
    isHubCreationEnabled,
    toggleHubCreation,
    isHubDeletionEnabled,
    toggleHubDeletion,
    activeDevNodeType,
    setActiveDevNodeType,
    rangeLevel,
    syncNodeMarkers,
    forceEraUpgrade,
    getNextEraConfig
  } = useISPStore();

  const { unlockedTechIds, unlockAllTechs, resetTechs, getAggregateModifiers } = useTechStore();
  const mods = getAggregateModifiers();
  const totalTechs = techTreeData.technologies.length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === 'd') {
        setIsVisible(prev => !prev);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const el = consoleRef.current;
        const w = el ? el.offsetWidth : 288;
        const h = el ? el.offsetHeight : 450;
        const rawX = e.clientX - dragOffset.x;
        const rawY = e.clientY - dragOffset.y;
        setPosition({
          x: Math.max(0, Math.min(rawX, window.innerWidth - w)),
          y: Math.max(0, Math.min(rawY, window.innerHeight - h))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).parentElement?.getBoundingClientRect();
    if (rect) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div
      ref={consoleRef}
      className={`fixed z-100 w-72 bg-black/80 backdrop-blur-xl border border-emerald-500/30 p-4 rounded-lg shadow-[0_0_30px_rgba(16,185,129,0.1)] font-mono ${!isDragging ? 'animate-in fade-in slide-in-from-bottom-4 duration-300' : ''}`}
      style={{ 
        left: 0, 
        top: 0, 
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        willChange: 'transform'
      }}
    >
      <div 
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between mb-4 border-b border-white/10 pb-2 cursor-move select-none"
      >
        <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Developer Debug Suite
        </h3>
        <button onClick={() => setIsVisible(false)} className="text-slate-500 hover:text-white text-xs">×</button>
      </div>

      <div className="space-y-4">
        {/* Economic Cheats */}
        <div>
          <label className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mb-2 block">Economic Hooks</label>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => { addMoney(10000); addLog("DEBUG: Injected $10,000", false); }}
              className="py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] uppercase hover:bg-emerald-500/20 transition-all"
            >
              Add $10k
            </button>
            <button 
              onClick={() => { toggleGodMode(); addLog(`DEBUG: God Mode ${!isGodMode ? 'ON' : 'OFF'}`, false); }}
              className={`py-1.5 border text-[9px] uppercase transition-all ${isGodMode ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-white/5 border-white-10 text-slate-400 hover:bg-white/10'}`}
            >
              God Mode: {isGodMode ? 'ON' : 'OFF'}
            </button>
            <button 
              onClick={() => { addTechPoints(50); addLog('[DEV] Added 50 TP (total: ' + (techPoints + 50) + ')', false); }}
              className="py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] uppercase hover:bg-cyan-500/20 transition-all font-bold"
            >
              Add 50 TP
            </button>
            <button 
              onClick={() => { addTechPoints(999999); addLog('[DEV] Tech Points set to maximum', false); }}
              className="py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] uppercase hover:bg-cyan-500/20 transition-all font-bold"
            >
              Set Max TP
            </button>
            <div className="flex gap-1 w-full col-span-2">
              <button 
                onClick={() => { toggleHubCreation(); addLog(`DEBUG: Create Hub Mode ${!isHubCreationEnabled ? 'ON' : 'OFF'}`, false); }}
                className={`flex-1 py-1.5 border text-[9px] uppercase transition-all ${isHubCreationEnabled ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' : 'bg-white/5 border-white-10 text-slate-400 hover:bg-white/10'}`}
              >
                Create Hub: {isHubCreationEnabled ? 'ON' : 'OFF'}
              </button>
              <select 
                value={activeDevNodeType}
                onChange={(e) => setActiveDevNodeType(e.target.value)}
                className="flex-1 bg-black/60 border border-white/10 text-slate-300 text-[9px] uppercase px-1 outline-none relative z-100"
              >
                {NODE_TEMPLATES.map(t => {
                  const isValidScope = t.availableInScopes.includes(rangeLevel);
                  const eraIndex = ERAS_CONFIG.findIndex(e => e.id === currentEra);
                  const unlockIndex = ERAS_CONFIG.findIndex(e => e.id === t.unlocksAtEra);
                  const isUnlocked = unlockIndex <= eraIndex;
                  return (
                    <option key={t.type} value={t.type}>
                      {!isValidScope ? '🔒 ' : !isUnlocked ? '⏳ ' : ''}
                      {t.displayName}
                    </option>
                  );
                })}
              </select>
            </div>
            <button 
              onClick={() => { toggleHubDeletion(); addLog(`DEBUG: Delete Hub Mode ${!isHubDeletionEnabled ? 'ON' : 'OFF'}`, false); }}
              className={`col-span-2 py-1.5 border text-[9px] uppercase transition-all ${isHubDeletionEnabled ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-white/5 border-white-10 text-slate-400 hover:bg-white/10'}`}
            >
              Delete Hub: {isHubDeletionEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Era Manipulation */}
        <div>
          <label className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mb-2 block">Era Simulation</label>
          <div className="flex flex-wrap gap-2">
            {ERAS_CONFIG.map(era => (
              <button 
                key={era.id}
                onClick={() => { setEra(era.id); addLog(`DEBUG: Era jumped to ${era.id}`, false); }}
                className={`flex-1 min-w-[30%] py-1 border text-[8px] uppercase transition-all ${currentEra === era.id ? 'bg-white/20 border-white/40 text-white font-bold' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
              >
                {era.id}
              </button>
            ))}
          </div>
          <button 
            onClick={() => {
              const next = getNextEraConfig();
              if (next) {
                forceEraUpgrade();
              } else {
                addLog("[DEV] Already at final era", true);
              }
            }}
            disabled={!getNextEraConfig()}
            className={`w-full py-2 mt-2 border rounded font-black text-[9px] uppercase tracking-widest transition-all
              ${getNextEraConfig() ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]' : 'bg-white/5 border-white/5 text-slate-700 cursor-not-allowed'}
            `}
          >
            {getNextEraConfig() ? 'FORCE ERA ADVANCE' : '[DEV] Already at final era'}
          </button>
        </div>

        {/* Tech Tree Controls */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Tech Tree</label>
            <div className="text-right">
              <span className="text-[8px] text-cyan-400 font-bold block">UNLOCKED: {unlockedTechIds.length}/{totalTechs}</span>
              <span className="text-[8px] text-emerald-400 font-bold block">ACTIVE: {useTechStore.getState().activeTechIds.length}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[7px] text-slate-500 mb-2">
            <span>BW ×{mods.bandwidthMultiplier.toFixed(2)}</span>
            <span>LAT ×{mods.latencyMultiplier.toFixed(2)}</span>
            <span>CAP ×{mods.capacityMultiplier.toFixed(2)}</span>
            <span>DIST {mods.maxDistance}km</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { unlockAllTechs(); addLog('[DEV] All techs force-unlocked', false); }}
              className="py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] uppercase hover:bg-cyan-500/20 transition-all font-bold"
            >
              Unlock All
            </button>
            <button
              onClick={() => { resetTechs(); addLog('[DEV] Tech tree reset to baseline', false); }}
              className="py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] uppercase hover:bg-red-500/20 transition-all font-bold"
            >
              Reset Techs
            </button>
          </div>
        </div>

        {/* Time Control */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[8px] font-black text-slate-500 uppercase tracking-tighter block">Tick Delta</label>
            <span className="text-[9px] text-emerald-500">{tickRate}ms</span>
          </div>
          <input 
            type="range" min="100" max="2000" step="100"
            value={tickRate}
            onChange={(e) => setTickRate(parseInt(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[7px] text-slate-700 mt-1">
            <span>FAST (0.1s)</span>
            <span>SLOW (2s)</span>
          </div>
        </div>

        {/* Utilities */}
        <div className="pt-2 border-t border-white/5 space-y-2">
          <button 
            onClick={() => syncNodeMarkers()}
            className="w-full py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] uppercase hover:bg-cyan-500/20 transition-all font-bold"
          >
            Rescue Broken Nodes
          </button>
          <button 
            onClick={() => { if(confirm("Reset entire topology?")) { resetTopology(); addLog("DEBUG: Topology wiped", true); } }}
            className="w-full py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] uppercase hover:bg-red-500/20 transition-all font-bold"
          >
            Reset Topology
          </button>
          <button 
            onClick={() => {
              if(confirm("Clear all saved data and reload?")) {
                localStorage.removeItem('isp-game-v1')
                localStorage.removeItem('isp-tech-v1')
                window.location.reload()
              }
            }}
            className="w-full py-1.5 bg-red-900/20 border border-red-900/40 text-red-600 text-[9px] uppercase hover:bg-red-900/30 transition-all font-bold"
          >
            Clear Save Data
          </button>
        </div>
      </div>

      <div className="mt-4 text-[7px] text-slate-600 border-t border-white/5 pt-2">
        <p>MODE: {import.meta.env.MODE}</p>
        <p>ACTIVE_CAPITAL: ${money.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default DebugConsole;
