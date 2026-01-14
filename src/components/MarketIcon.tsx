import { useState } from 'react';
// import { TokenIcon } from '@token-icons/react';

interface MarketIconProps {
  symbol: string;
  size?: number;
}

const MarketIcon = ({ symbol, size = 32 }: MarketIconProps) => {
  const [imageError, setImageError] = useState(false);
  const [fallbackStage, setFallbackStage] = useState(0);
  
  const ticker = symbol.split(/[-/]/)[0].toUpperCase();
  const lowerTicker = ticker.toLowerCase();

  const fallbacks = [
    `https://cdn.jsdelivr.net/gh/ErikThiart/cryptocurrency-icons@master/128/${lowerTicker}.png`,
    `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${lowerTicker}.png`,
    `https://cryptoicons.org/api/icon/${lowerTicker}/128`,
    `https://ui-avatars.com/api/?name=${ticker}&background=1e293b&color=3b82f6&bold=true&size=${size}`
  ];

  if (!imageError) {
    return (
      <div 
        className="flex items-center justify-center rounded-full bg-slate-800 shrink-0" 
        style={{ width: size, height: size }}
      >
        <img
          src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${lowerTicker}.png`}
          alt={ticker}
          className="w-full h-full object-contain p-1.5"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  if (fallbackStage < fallbacks.length) {
    return (
      <div 
        className="flex items-center justify-center rounded-full bg-slate-800 border border-white/10 shrink-0 overflow-hidden"
        style={{ width: size, height: size }}
      >
        <img
          src={fallbacks[fallbackStage]}
          alt={ticker}
          className="w-full h-full object-contain p-1.5"
          onError={() => {
            if (fallbackStage < fallbacks.length - 1) {
              setFallbackStage(prev => prev + 1);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div 
      className="flex items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-500 shrink-0"
      style={{ width: size, height: size }}
    >
      <span 
        className="font-bold text-white"
        style={{ fontSize: size * 0.5 }}
      >
        {ticker[0]}
      </span>
    </div>
  );
};

export default MarketIcon;