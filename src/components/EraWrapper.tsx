import React from 'react';
import { useISPStore } from '../store/useISPStore';

const EraWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const eraConfig = useISPStore(state => state.getCurrentEraConfig());
  
  return (
    <div className={`${eraConfig.uiTheme} h-screen flex flex-col bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30 overflow-hidden`}>
      {children}
    </div>
  );
};

export default EraWrapper;
