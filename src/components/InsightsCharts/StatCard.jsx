import React from 'react';

/**
 * Stat card component for displaying key metrics
 */
export const StatCard = ({ label, value, sub, icon, color, textColor = "text-[#4338ca]", accent }) => (
  <div className={`${color} p-6 rounded-3xl border-4 ${accent} shadow-[6px_6px_0px_rgba(0,0,0,0.1)] hover:scale-105 transition-transform duration-300 flex flex-col justify-between h-40 relative overflow-hidden`}>
    <div className="absolute top-0 right-0 p-4 opacity-10 scale-150">{icon}</div>
    <div className="flex justify-between items-start relative z-10">
      <span className={`text-[10px] font-black uppercase tracking-widest ${textColor} opacity-70`}>{label}</span>
      <div className="bg-black/5 p-2 rounded-full backdrop-blur-sm">{icon}</div>
    </div>
    <div className="relative z-10">
      <h3 className={`text-4xl md:text-5xl font-black ${textColor} tracking-tighter leading-none`}>{value}</h3>
      {sub && <p className={`text-xs font-bold ${textColor} mt-1 opacity-80`}>{sub}</p>}
    </div>
  </div>
);
