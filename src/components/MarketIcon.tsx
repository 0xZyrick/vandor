import { useState } from 'react';

interface MarketIconProps {
  symbol: string;
  size?: number;
}

const MarketIcon = ({ symbol, size = 32 }: MarketIconProps) => {
  const [currentSource, setCurrentSource] = useState(0);
  
  // Clean the ticker (e.g., "BTC-USD" -> "btc")
  const ticker = symbol.split(/[-/]/)[0].toLowerCase();

  // We define a sequence of sources to try in order
  const sources = [
    // 1. ErikThiart CMC Repo (The one you wanted)
    `https://cdn.jsdelivr.net/gh/ErikThiart/cryptocurrency-icons@master/128/${ticker}.png`,
    // 2. Pyth Network (Backup for Perps)
    `https://raw.githubusercontent.com/pyth-network/pyth-assets/main/assets/crypto/${ticker.toUpperCase()}.svg`,
    // 3. Fallback Letter Avatar
    `https://ui-avatars.com/api/?name=${ticker}&background=1e293b&color=3b82f6&bold=true`
  ];

  return (
    <div 
      className="flex items-center justify-center rounded-full bg-slate-800 border border-white/10 shrink-0 overflow-hidden"
      style={{ width: size, height: size }}
    >
      <img
        src={sources[currentSource]}
        alt={ticker}
        className="w-full h-full object-contain p-1.5"
        onError={() => {
          if (currentSource < sources.length - 1) {
            setCurrentSource(currentSource + 1);
          }
        }}
      />
    </div>
  );
};

export default MarketIcon;