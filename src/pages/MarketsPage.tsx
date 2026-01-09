import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, TrendingDown, ArrowRight, Activity, DollarSign, BarChart3, RefreshCw, AlertCircle } from "lucide-react";
import BottomNav from '../components/BottomNav';
import { TokenIcon } from '@token-icons/react';

/* eslint-disable @typescript-eslint/no-explicit-any */    

interface Market {
  symbol: string;
  lastPrice: number;
  priceChangePercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  openInterest: number;
  fundingRate: number;
  apy: number;
}

const formatNum = (val: any, decimals = 2): string => {
  const num = Number(val);
  return isNaN(num) ? "---" : num.toLocaleString(undefined, { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  });
};

const formatCompact = (val: any): string => {
  const num = Number(val);
  if (isNaN(num) || num === 0) return "---";
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
};

const formatPercent = (val: any): string => {
  const num = Number(val);
  if (isNaN(num)) return "---";
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
};

// API SERVICE
const fetchLiveMarkets = async (): Promise<Market[]> => {
    
  const response = await fetch('/api/v1/info/markets');
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Debug: Log everything
  console.log("📊 Full Response:", data);
  console.log("📊 Response Type:", typeof data);
  console.log("📊 Has 'data' key:", 'data' in data);
  console.log("📊 Has 'markets' key:", 'markets' in data);
  
  if (data.data) {
    console.log("📊 data.data type:", typeof data.data);
    console.log("📊 data.data keys:", Object.keys(data.data));
    if (data.data.markets) {
      console.log("📊 data.data.markets type:", typeof data.data.markets);
      console.log("📊 data.data.markets length:", Array.isArray(data.data.markets) ? data.data.markets.length : 'not array');
    }
  }
  
  
  let markets: any[] = [];
  if (data.data?.markets && Array.isArray(data.data.markets)) {
    markets = data.data.markets;
    console.log("✅ Found markets at data.data.markets");
  } else if (data.markets && Array.isArray(data.markets)) {
    markets = data.markets;
    console.log("✅ Found markets at data.markets");
  } else if (Array.isArray(data.data)) {
    markets = data.data;
    console.log("✅ Found markets at data.data (array)");
  } else if (Array.isArray(data)) {
    markets = data;
    console.log("✅ Found markets at root (array)");
  }
  
  console.log(`📊 Total markets found: ${markets.length}`);

  if (markets.length === 0) {
    console.error("❌ No markets found!");
    console.log("📋 Full response structure:", JSON.stringify(data, null, 2));
    throw new Error("No markets found in API response");
  }
  
  console.log(`✅ Found ${markets.length} markets from Extended Exchange`);
  
  
  const cryptoMarkets = markets.map((m: any) => {
    const stats = m.marketStats || {};
    const lastPrice = parseFloat(stats.lastPrice || stats.oraclePrice || '0');
    const priceChange = parseFloat(stats.dailyPriceChangePercentage || '0');
    const volume = parseFloat(stats.dailyVolume || '0');
    const high = parseFloat(stats.dailyHigh || lastPrice.toString());
    const low = parseFloat(stats.dailyLow || lastPrice.toString());
    
    const fundingRate = 0.0001;
    const apy = fundingRate * 365 * 3 * 100;
    
    return {
      symbol: m.name, 
      lastPrice: lastPrice,
      priceChangePercent: priceChange,
      high24h: high,
      low24h: low,
      volume24h: volume,
      openInterest: volume * 0.3,
      fundingRate: fundingRate,
      apy: apy,
    };
  });
  
  if (cryptoMarkets.length === 0) {
    throw new Error("No crypto markets found in API response");
  }
  
  console.log(`✅ Loaded ${cryptoMarkets.length} markets`);
  return cryptoMarkets;
};

// Mini Sparkline Chart
const Sparkline = ({ isPositive }: { isPositive: boolean }) => {
  const points = isPositive 
    ? "0,35 18,28 36,32 54,25 72,18 90,22 108,15 126,20 144,12"
    : "0,12 18,20 36,15 54,22 72,28 90,25 108,32 126,28 144,35";
  
  return (
    <svg viewBox="0 0 144 56" className="w-full h-full">
      <polyline 
        fill="none" 
        stroke={isPositive ? "#10b981" : "#ef4444"} 
        strokeWidth="2.5" 
        points={points} 
      />
    </svg>
  );
};

// Market Row Component
const MarketListRow = ({ market, onClick }: { market: Market; onClick: () => void }) => {
  const isPositive = market.priceChangePercent >= 0;

  const symbol = market.symbol.split('-')[0].toUpperCase();

  return (
    <div 
      onClick={onClick} 
      className="flex items-center gap-3 p-4 hover:bg-white/5 cursor-pointer transition-all border-b border-gray-900/50 group"
    >
    {/* icon */}
      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-blue-500/50 transition-colors">
        <TokenIcon 
          symbol={symbol} 
          size={24} 
          variant="branded"
        />
      </div>

      {/* Token Info */}
      <div className="flex-1 gap-3 min-w-500px">
        <div className="font-bold text-base w-full">{market.symbol.replace('USDC', '/USDC').replace('USDT', '/USDT')}</div>
        <div className="text-xs text-gray-500">Perpetual</div>
      </div>

      <div className="flex w-full justify-around">
            {/* Price */}
          <div className="text-right min-w-100px">
            <div className="font-mono font-semibold">${formatNum(market.lastPrice)}</div>
            <div className={`text-sm font-mono flex items-center justify-end gap-1 ${
              isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {formatPercent(market.priceChangePercent)}
            </div>
          </div>

          {/* Volume */}
          <div className="text-right min-w-80px hidden md:block">
            <div className="text-xs text-gray-500 mb-1">24h Vol</div>
            <div className="font-mono text-md">{formatCompact(market.volume24h)}</div>
          </div>

          {/* Open Interest */}
          <div className="text-right min-w-80px hidden lg:block">
            <div className="text-xs text-gray-500 mb-1">Open Interest</div>
            <div className="font-mono text-md">{formatCompact(market.openInterest)}</div>
          </div>

          {/* Funding Rate */}
          <div className="text-right min-w-80px hidden lg:block">
            <div className="text-xs text-gray-500 mb-1">Funding</div>
            <div className="font-mono text-md text-yellow-400">
              {market.fundingRate ? (market.fundingRate * 100).toFixed(4) + '%' : '---'}
            </div>
          </div>

          {/* Chart */}
          <div className="w-20 h-10 hidden xl:block">
            <Sparkline isPositive={isPositive} />
          </div>

      </div>

      
      <ArrowRight className="w-5 h-5 text-gray-500" />
    </div>
  );
};


export default function MarketsPage() {
  const navigate = useNavigate();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'volume' | 'change' | 'name'>('volume');

  // Platform statS
  const [stats, setStats] = useState({
    tvl: 0,
    volume24h: 0,
    trades24h: 0
  });

  const loadMarkets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchLiveMarkets();
      setMarkets(data);
      
      const totalVolume = data.reduce((sum, m) => sum + m.volume24h, 0);
      const totalOI = data.reduce((sum, m) => sum + m.openInterest, 0);
      
      setStats({
        tvl: totalOI,
        volume24h: totalVolume,
        trades24h: 0 
      });
      
    } catch (err: any) {
      console.error("❌ Failed to load markets:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarkets();
    // Refresh data every 30 seconds
    const interval = setInterval(loadMarkets, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter and sort markets
  const filteredMarkets = markets
    .filter(m => m.symbol.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'volume') return b.volume24h - a.volume24h;
      if (sortBy === 'change') return b.priceChangePercent - a.priceChangePercent;
      if (sortBy === 'name') return a.symbol.localeCompare(b.symbol);
      return 0;
    });

  const handleMarketClick = (symbol: string) => {
    const slug = symbol.toLowerCase().replace('-', '');
    navigate(`/${slug}`);
  };

  // Loading State
  if (loading && markets.length === 0) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg mb-2">Loading live market data...</div>
          <div className="text-gray-500 text-sm">Fetching from Extended Exchange API</div>
        </div>
      </div>
    );
  }

  // Error State
  if (error && markets.length === 0) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-white text-2xl font-bold mb-2">Failed to Load Markets</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={loadMarkets}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#050507] text-white pb-24 lg:pb-0">
        
        {/* Hero Section */}
        <div className="bg-linear-to-b from-[#0a0a0f] to-[#050507]">
          <div className="max-w-7xl mx-auto px-6 py-10">
            
            {/* Title */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Trade Perpetuals
                </h1>
              </div>
              <p className="text-gray-400 text-lg max-w-2xl">
                Trade swiftly on vandor prep. Built on Extended Exchange.
              </p>
            </div>

            {/* Stats Cards - Live Data */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-gray-500">Total Value Locked</span>
                </div>
                <div className="text-3xl font-bold">{formatCompact(stats.tvl)}</div>
              </div>
              
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-gray-500">24h Volume</span>
                </div>
                <div className="text-3xl font-bold">{formatCompact(stats.volume24h)}</div>
              </div>
              
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-gray-500">Active Markets</span>
                </div>
                <div className="text-3xl font-bold">{markets.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Markets Section */}
        <div className="max-w-6xl mx-auto px-6 py-8 border border-gray-800/25 rounded-xl">
          
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search markets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-900/50 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className=" border border-gray-800 bg-gray-900 rounded-xl px-6 py-4 focus:outline-none focus:border-gray-500 transition"
            >
              <option value="volume" >Sort by Volume</option>
              <option value="change" >Sort by Change</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>

          {/* Error Banner */}
          {error && markets.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <span className="text-yellow-200 text-sm">Using cached data. Failed to refresh: {error}</span>
            </div>
          )}

          {/* Markets List */}
          {filteredMarkets.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-500 text-lg">No markets found</div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMarkets.map((market) => (
                <MarketListRow
                  key={market.symbol}
                  market={market}
                  onClick={() => handleMarketClick(market.symbol)}
                />
              ))}
            </div>
          )}

          {/* Market Count */}
          <div className="text-center text-gray-500 text-sm mt-6">
            Showing {filteredMarkets.length} of {markets.length} markets • Live data from Extended Exchange
          </div>
        </div>
      </div>

      <BottomNav />
    </>
  );
}