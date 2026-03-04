import React from 'react';
import { CHART_COLORS } from '../../constants/assets';

/**
 * Poll card component for displaying question analysis
 */
export const PollCard = ({ qId, data, index }) => {
  const totalVotes = Object.values(data).reduce((a, b) => a + b, 0) || 1;
  const labels = ["A", "B", "C", "D", "E"];
  
  return (
    <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm hover:border-[#4338ca] transition-colors">
      <h4 className="font-black text-[#4338ca] text-sm uppercase mb-4 flex items-center gap-2">
        <span className="bg-[#a3e635] w-6 h-6 rounded-full flex items-center justify-center text-[10px] border border-black text-[#1d248a]">
          {index + 1}
        </span>
        Question Analysis
      </h4>
      
      <div className="space-y-3">
        {labels.map((option, i) => {
          const count = data[option] || 0;
          const percent = Math.round((count / totalVotes) * 100);
          
          return (
            <div key={option} className="relative">
              <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500 mb-1">
                <span>Option {option}</span>
                <span>{count} ({percent}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden relative">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${percent}%`, 
                    backgroundColor: CHART_COLORS[i % CHART_COLORS.length] 
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
