import React from 'react';
import type { SummaryData } from '../../types';

interface SummaryCardProps {
  data: SummaryData;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ data }) => {
  const getTopBorderColor = () => {
    switch (data.color) {
      case 'green': return 'bg-leaf';
      case 'gold': return 'bg-gold';
      case 'red': return 'bg-red';
      case 'blue': return 'bg-blue';
      default: return 'bg-leaf';
    }
  };

  const getSubColor = () => {
    return data.trend === 'up' ? 'text-leaf' : 'text-red';
  };

  return (
    <div className="bg-surface border border-cream-3 rounded-[14px] p-[18px_20px] relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-[14px] ${getTopBorderColor()}`} />
      
      <div className="absolute top-4 right-4 text-[20px] opacity-60">
        {data.icon}
      </div>

      <div className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">
        {data.label}
      </div>
      
      <div className="font-mono text-[22px] font-medium text-ink my-[7px] tracking-[-0.5px]">
        {data.value}
      </div>
      
      <div className={`text-[11px] ${getSubColor()}`}>
        {data.sub}
      </div>
    </div>
  );
};
