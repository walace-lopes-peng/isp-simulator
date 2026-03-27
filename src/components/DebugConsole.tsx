import React, { useState, useEffect } from 'react';
import { useISPStore, Era } from '../store/useISPStore';

const DebugConsole: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { 
    money, 
    addMoney, 
    resetTopology, 
    isGodMode, 
    toggleGodMode, 
    tickRate, 
    setTickRate, 
    currentEra, 
    setEra,
    addLog
  } = useISPStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === 'd') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-6 z-[100] w-72 bg-black/80 backdrop-blur-xl border border-emerald-500/30 p-4 rounded-lg shadow-[0_0_30px_rgba(16,185,129,0.1)] font-mono animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
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
          </div>
        </div>

        {/* Era Manipulation */}
        <div>
          <label className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mb-2 block">Era Simulation</label>
          <div className="flex gap-2">
            {(['70s', '90s', 'modern'] as Era[]).map(era => (
              <button 
                key={era}
                onClick={() => { setEra(era); addLog(`DEBUG: Era jumped to ${era}`, false); }}
                className={`flex-1 py-1 border text-[8px] uppercase transition-all ${currentEra === era ? 'bg-white/20 border-white/40 text-white font-bold' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
              >
                {era}
              </button>
            ))}
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

        {/* Destructive Tools */}
        <div className="pt-2 border-t border-white/5">
          <button 
            onClick={() => { if(confirm("Reset entire topology?")) { resetTopology(); addLog("DEBUG: Topology wiped", true); } }}
            className="w-full py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] uppercase hover:bg-red-500/20 transition-all font-bold"
          >
            Reset Topology
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
