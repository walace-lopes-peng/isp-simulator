import React, { useState } from 'react';
import { useISPStore, ERAS_CONFIG } from '../store/useISPStore';
import { useTechStore, Technology } from '../store/useTechStore';
import techTreeData from '../config/techTreeConfig.json';

interface TechTreePanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const GLYPHS: Record<string, string> = {
  copper_standard: "CW",
  manual_switching: "MS",
  coaxial_early: "CE",
  tdm_basic: "TM",
  coaxial_mature: "CM",
  digital_switching: "DS",
  fiber_experimental: "FX",
  isdn_early: "IN",
};

const TechTreePanel: React.FC<TechTreePanelProps> = () => {
  const { techPoints, currentEra, addTechPoints, addLog } = useISPStore();
  const { 
    unlockedTechIds, 
    activeTechIds, 
    unlockTech, 
    activateTech, 
    deactivateTech,
    canUnlockTech,
    isTechUnlocked,
    isTechActive 
  } = useTechStore();

  const [hoveredTech, setHoveredTech] = useState<Technology | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const technologies = techTreeData.technologies as Technology[];

  const scaleX = (x: number) => (x / 600) * 500 + 50;
  const scaleY = (y: number) => (y / 200) * 120 + 60;

  const handleTechClick = (tech: Technology) => {
    const isUnlocked = isTechUnlocked(tech.id);
    const isActive = isTechActive(tech.id);
    const canUnlock = canUnlockTech(tech.id, currentEra, techPoints);

    if (isUnlocked) {
      if (isActive) {
        deactivateTech(tech.id);
        addLog(`Deactivated: ${tech.displayName}`);
      } else {
        activateTech(tech.id);
        addLog(`Activated: ${tech.displayName}`);
      }
    } else if (canUnlock) {
      unlockTech(tech.id, currentEra, techPoints, addTechPoints);
      addLog(`Researched: ${tech.displayName}`, false);
    }
  };

  const renderModifier = (key: string, value: any) => {
    let label = key.replace('Multiplier', '').replace(/([A-Z])/g, ' $1').trim();
    let displayValue = value;
    let colorClass = "text-slate-300";

    if (key.includes('Multiplier')) {
      displayValue = `${value}x`;
      if (key === 'latencyMultiplier') {
        colorClass = value > 1.0 ? "text-red-400" : value < 1.0 ? "text-emerald-400" : "text-amber-400";
      } else if (key === 'bandwidthMultiplier' || key === 'capacityMultiplier') {
        colorClass = value >= 5.0 ? "text-emerald-400" : value >= 2.0 ? "text-amber-400" : "text-red-400";
      } else {
        colorClass = value > 1.0 ? "text-emerald-400" : value < 1.0 ? "text-red-400" : "text-slate-400";
      }
    } else if (key === 'signalQuality' || key === 'connectionReliability') {
      displayValue = `${(value * 100).toFixed(0)}%`;
      colorClass = value >= 0.8 ? "text-emerald-400" : value >= 0.6 ? "text-amber-400" : "text-red-400";
    } else if (key === 'maxDistance') {
      displayValue = `${value}m`;
      colorClass = value >= 1000 ? "text-emerald-400" : "text-slate-400";
    }

    return (
      <div key={key} className="flex justify-between items-center text-[7px] font-mono leading-none py-0.5 border-b border-white/5 last:border-0">
        <span className="text-slate-500 uppercase">{label}</span>
        <span className={`font-black ${colorClass}`}>{displayValue}</span>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#0a0d14]/40 overflow-hidden">
      <svg 
        viewBox="0 0 600 250" 
        className="w-full max-w-[800px] h-auto pointer-events-auto"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
      >
        {/* Edges */}
        {technologies.map(tech => tech.requires.map(reqId => {
          const parent = technologies.find(t => t.id === reqId);
          if (!parent) return null;
          
          const isParentUnlocked = isTechUnlocked(parent.id);
          
          return (
            <line 
              key={`${parent.id}-${tech.id}`}
              x1={scaleX(parent.position.x)} y1={scaleY(parent.position.y)}
              x2={scaleX(tech.position.x)} y2={scaleY(tech.position.y)}
              stroke={isParentUnlocked ? "#10b981" : "#334155"}
              strokeWidth="1.5"
              strokeDasharray={isParentUnlocked ? "none" : "4,3"}
              className="transition-all duration-300"
            />
          );
        }))}

        {/* Nodes */}
        {technologies.map(tech => {
          const isUnlocked = isTechUnlocked(tech.id);
          const isActive = isTechActive(tech.id);
          const canUnlock = canUnlockTech(tech.id, currentEra, techPoints);
          
          const eraIndex = ERAS_CONFIG.findIndex(e => e.id === currentEra);
          const techEraIndex = ERAS_CONFIG.findIndex(e => e.id === tech.unlocksAtEra);
          const isWrongEra = techEraIndex > eraIndex;

          const x = scaleX(tech.position.x);
          const y = scaleY(tech.position.y);

          // State colors
          let stroke = "#374151"; // LOCKED
          let fill = "#0d1117";
          let opacity = 1;
          let strokeWidth = 1.5;

          if (isWrongEra) {
            stroke = "#6d28d9";
            opacity = 0.4;
            strokeWidth = 1;
          } else if (isActive) {
            stroke = "#22d3ee";
            fill = "rgba(34, 211, 238, 0.2)";
            strokeWidth = 2;
          } else if (isUnlocked) {
            stroke = "#22d3ee";
          } else if (canUnlock) {
            stroke = "#f59e0b";
            strokeWidth = 2;
          } else {
            opacity = 0.4;
          }

          return (
            <g 
              key={tech.id} 
              className="cursor-pointer group"
              onMouseEnter={() => setHoveredTech(tech)}
              onMouseLeave={() => setHoveredTech(null)}
              onClick={() => handleTechClick(tech)}
            >
              {isActive && (
                <circle 
                  cx={x} cy={y} r="26" 
                  fill="none" stroke="#22d3ee" strokeWidth="1" 
                  opacity="0.2" className="animate-pulse" 
                />
              )}
              
              <circle 
                cx={x} cy={y} r="18" 
                fill={fill} stroke={stroke} strokeWidth={strokeWidth}
                opacity={opacity}
                className="transition-all duration-300 group-hover:scale-110 origin-center"
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
              
              <text 
                x={x} y={y} 
                fontSize="9" fontFamily="monospace" textAnchor="middle" dy="3"
                fill={isActive || isUnlocked ? "#fff" : stroke}
                opacity={opacity}
                className="pointer-events-none select-none font-black"
              >
                {GLYPHS[tech.id] || "??"}
              </text>

              <text
                x={x} y={y + 30}
                fontSize="7" fontFamily="monospace" textAnchor="middle"
                fill="#94a3b8" opacity="0.6"
                className="pointer-events-none select-none uppercase tracking-tighter"
              >
                {tech.id.split('_')[0]}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip Overlay */}
      {hoveredTech && (() => {
        const scaledX = scaleX(hoveredTech.position.x);
        const scaledY = scaleY(hoveredTech.position.y);
        const tooltipY = scaledY < 130
          ? scaledY + 28   // below node for top row
          : scaledY - 110; // above node for bottom row
        const tooltipX = Math.min(
          Math.max(scaledX - 80, 8),
          600 - 168        // 160px tooltip width + 8px margin
        );
        return (
        <div
          className="absolute z-50 p-3 bg-[#0a0f1a]/95 border border-white/10 rounded shadow-xl pointer-events-none w-40 animate-in fade-in zoom-in-95 duration-100"
          style={{ left: tooltipX, top: tooltipY }}
        >
          <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 border-b border-emerald-500/20 pb-1">
            {hoveredTech.displayName}
          </h4>
          <p className="text-[8px] text-slate-400 font-mono leading-tight mb-3 italic">
            {hoveredTech.description}
          </p>
          
          <div className="space-y-1 mb-3">
             <div className="text-[7px] font-black text-slate-600 uppercase mb-1">Functional Specs</div>
             {Object.entries(hoveredTech.modifiers).map(([k, v]) => renderModifier(k, v))}
          </div>

          <div className="space-y-1 mb-3 pt-2 border-t border-white/5">
            <div className="flex justify-between text-[8px] font-mono">
              <span className="text-slate-500 uppercase">Resarch Cost</span>
              <span className="text-cyan-400 font-black">{hoveredTech.tpCost > 0 ? `${hoveredTech.tpCost.toLocaleString()} TP` : 'FREE'}</span>
            </div>
            <div className="flex justify-between text-[8px] font-mono">
              <span className="text-slate-500 uppercase">Prerequisites</span>
              <span className="text-slate-300">
                {hoveredTech.requires.length > 0 
                  ? hoveredTech.requires.map(r => r.split('_')[0].toUpperCase()).join(', ') 
                  : 'N/A'
                }
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              {(() => {
                const unlocked = isTechUnlocked(hoveredTech.id);
                const active = isTechActive(hoveredTech.id);
                const canUnlock = canUnlockTech(hoveredTech.id, currentEra, techPoints);
                const eraIndex = ERAS_CONFIG.findIndex(e => e.id === currentEra);
                const techEraIndex = ERAS_CONFIG.findIndex(e => e.id === hoveredTech.unlocksAtEra);
                
                if (techEraIndex > eraIndex) return `Available in the ${hoveredTech.unlocksAtEra} era`;
                if (!unlocked && !canUnlock) return "Prerequisites not met";
                if (!unlocked) return "Click to research";
                if (!active) return "Click to activate";
                return "Active — click to deactivate";
              })()}
            </span>
          </div>
        </div>
        );
      })()}
    </div>
  );
};

export default TechTreePanel;
