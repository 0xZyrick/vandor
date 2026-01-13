import { useState } from 'react';
import { TokenIcon } from '@token-icons/react';

interface MarketIconProps {
  symbol: string;
  size?: number;
}

const MarketIcon = ({ symbol, size = 32 }: MarketIconProps) => {
  const [stage, setStage] = useState(0); 
  
  const ticker = symbol.split(/[-/]/)[0].toUpperCase();
  const lowerTicker = ticker.toLowerCase();

  if (stage === 0) {
    return (
      <div className="flex items-center justify-center rounded-full bg-slate-800" style={{ width: size, height: size }}>
        <TokenIcon 
          symbol={ticker} 
          size={size - 8} 
          variant="branded" 
          onError={() => setStage(1)} // If it fails, go to Pyth
        />
      </div>
    );
  }

  const fallbacks = [
    `https://cdn.jsdelivr.net/gh/ErikThiart/cryptocurrency-icons@master/128/${lowerTicker}.png`,
    `https://ui-avatars.com/api/?name=${ticker}&background=1e293b&color=3b82f6&bold=true`
  ];

  return (
    <div 
      className="flex items-center justify-center rounded-full bg-slate-800 border border-white/10 shrink-0 overflow-hidden"
      style={{ width: size, height: size }}
    >
      <img
        src={fallbacks[stage - 1]}
        alt={ticker}
        className="w-full h-full object-contain p-1.5"
        onError={() => {
          if (stage < fallbacks.length) setStage(stage + 1);
        }}
      />
    </div>
  );
};

export default MarketIcon;