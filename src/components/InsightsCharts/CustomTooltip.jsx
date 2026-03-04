import React from 'react';

/**
 * Custom tooltip for Recharts visualization
 */
export const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#4338ca] p-3 border-2 border-white shadow-[4px_4px_0px_#a3e635] rounded-xl z-50">
        <p className="text-white font-black uppercase text-xs mb-1 tracking-widest">{label}</p>
        <p className="text-[#a3e635] font-mono font-bold text-xl leading-none">
          {payload[0].value} <span className="text-[10px] text-white/60">USERS</span>
        </p>
      </div>
    );
  }
  return null;
};
