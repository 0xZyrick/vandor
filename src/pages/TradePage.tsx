import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Search, PanelRightClose, PanelRightOpen, TrendingUp, TrendingDown, RefreshCw, AlertCircle, BookOpen, ChevronDown, ArrowDown } from "lucide-react";
import OrderTicket from "../components/OrderTicket";
import BottomNav from "../components/BottomNav";
import OrderbookAndTrades from "../components/OrderbookAndTrades";
import { TokenIcon } from '@token-icons/react';
import PositionsListCompact from "../components/PositionsListCompact";

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
  indexPrice: number;
  markPrice: number;
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

const fetchLiveMarkets = async (): Promise<Market[]> => {
  const response = await fetch('/api/v1/info/markets');
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Extended Exchange API structure
  let markets: any[] = [];
  
  if (data.data?.markets && Array.isArray(data.data.markets)) {
    markets = data.data.markets;
  } else if (data.markets && Array.isArray(data.markets)) {
    markets = data.markets;
  } else if (Array.isArray(data.data)) {
    markets = data.data;
  } else if (Array.isArray(data)) {
    markets = data;
  }
  
  if (markets.length === 0) {
    throw new Error("No markets found");
  }
  
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
      indexPrice: lastPrice,
      markPrice: parseFloat(stats.oraclePrice || lastPrice.toString()),
    };
  });
  
  return cryptoMarkets;
};

const MarketSidebar = ({ 
  markets, 
  currentSymbol, 
  onSelectMarket, 
  onClose, 
  isRefreshing 
}: { 
  markets: Market[]; 
  currentSymbol: string; 
  onSelectMarket: (symbol: string) => void; 
  onClose: () => void; 
  isRefreshing: boolean;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredMarkets = markets.filter(m => 
    m.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" onClick={onClose} />
      
      <div className="fixed top-0 left-0 h-full w-80 bg-[#0a0a0f] border-r border-gray-800 z-50 shadow-2xl flex flex-col">
        <div className="p-6 border-b border-gray-900 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              MARKETS
            </span>
            {isRefreshing && <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />}
          </div>
          <button onClick={onClose} className="hover:bg-gray-800 p-2 rounded-lg transition">
            <PanelRightClose className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            <input 
              placeholder="Search markets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-gray-800 py-2.5 pl-10 pr-4 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition" 
            />
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
            {filteredMarkets.map((market) => {
              const isPositive = market.priceChangePercent >= 0;
              const isActive = market.symbol === currentSymbol;
              const symbol = market.symbol.split('-')[0].toUpperCase();

              return (
                <div
                  key={market.symbol}
                  onClick={() => { onSelectMarket(market.symbol); onClose(); }}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-blue-500/10 border border-blue-500/30' 
                      : 'hover:bg-white/5 border border-transparent hover:border-gray-800'
                  }`}
                >
                  <div className="flex flex-1 items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center shrink-0 border border-white/10 hover:border-blue-500/50 transition-colors">
                      <TokenIcon 
                        symbol={symbol} 
                        size={24} 
                        variant="branded"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{market.symbol.replace('-USD', '/USD')}</p>
                      <p className="text-[10px] text-gray-500">Perpetual</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-mono font-semibold">${formatNum(market.lastPrice)}</p>
                    <p className={`text-xs font-mono flex items-center justify-end gap-1 ${
                      isPositive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {formatPercent(market.priceChangePercent)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

const StatCard = ({ 
  label, 
  value, 
  subValue, 
  color = "text-white" 
}: { 
  label: string; 
  value: string; 
  subValue?: string; 
  color?: string;
}) => (
  <div className="flex flex-col">
    <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</span>
    <div className={`font-mono font-semibold ${color}`}>{value}</div>
    {subValue && <div className="text-[10px] text-gray-600 font-mono">{subValue}</div>}
  </div>
);

// MAIN TRADE PAGE

export default function TradePage() {
  const { pairSlug } = useParams<{ pairSlug: string }>();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [currentSymbol, setCurrentSymbol] = useState('');
  const [currentMarket, setCurrentMarket] = useState<Market | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOrderbookOpen, setIsOrderbookOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mobileView, setMobileView] = useState<'chart' | 'orderbook'>('chart');
  const [showScrollButton, setShowScrollButton] = useState(true);
  
  const orderTicketRef = useRef<HTMLDivElement>(null);

  // Convert URL slug to symbol format
  const slugToSymbol = (slug: string): string => {
    const clean = slug.replace(/[-_]/g, '').toUpperCase();
    
    if (clean.endsWith('USD') || clean.endsWith('USDC') || clean.endsWith('USDT')) {
      const base = clean.replace(/USD[CT]?$/, '');
      return `${base}-USD`;
    }
    
    return clean;
  };

  // Save and load market persistence
  const saveCurrentMarket = (symbol: string) => {
    try {
      localStorage.setItem('vello_current_market', symbol);
    } catch (error) {
      console.error('Failed to save market:', error);
    }
  };

  const loadSavedMarket = (): string | null => {
    try {
      return localStorage.getItem('vello_current_market');
    } catch {
      return null;
    }
  };

  const loadMarkets = async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const data = await fetchLiveMarkets();
      setMarkets(data);
      
      const targetSymbol = slugToSymbol(pairSlug || 'BTCUSD');
      const savedSymbol = loadSavedMarket();
      
      let current = data.find(m => m.symbol === targetSymbol);
      
      if (!current && savedSymbol) {
        current = data.find(m => m.symbol === savedSymbol);
      }
      
      if (!current) {
        current = data[0];
      }
      
      setCurrentMarket(current);
      setCurrentSymbol(current.symbol);
      saveCurrentMarket(current.symbol);
      
      console.log(`✅ Trading ${current.symbol}`);
      
    } catch (err: any) {
      console.error("❌ Failed to load markets:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Scroll detection for mobile button
  useEffect(() => {
    const handleScroll = () => {
      if (orderTicketRef.current) {
        const rect = orderTicketRef.current.getBoundingClientRect();
        const isOrderTicketVisible = rect.top < window.innerHeight && rect.bottom >= 0;
        setShowScrollButton(!isOrderTicketVisible);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTrade = () => {
    orderTicketRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    loadMarkets();
    
    const interval = setInterval(() => {
      loadMarkets(false);
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairSlug]);

  useEffect(() => {
    if (markets.length > 0 && currentSymbol) {
      const market = markets.find(m => m.symbol === currentSymbol);
      if (market) setCurrentMarket(market);
    }
  }, [currentSymbol, markets]);

  const handleMarketSelect = (symbol: string) => {
    setCurrentSymbol(symbol);
    saveCurrentMarket(symbol);
    
    const slug = symbol.toLowerCase().replace('-', '');
    window.history.pushState({}, '', `/${slug}`);
  };

  if (loading && !currentMarket) {
    return (
      <div className="h-screen bg-[#050507] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg mb-2">Loading market data...</div>
        </div>
      </div>
    );
  }

  if (error && !currentMarket) {
    return (
      <div className="h-screen bg-[#050507] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-white text-2xl font-bold mb-2">Failed to Load Market Data</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => loadMarkets()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isPositive = currentMarket ? currentMarket.priceChangePercent >= 0 : false;

  return (
    <>
      <div className="min-h-screen bg-[#050507] text-white flex flex-col">
        
        {/* HEADER */}
        <header className="border-b border-gray-900 bg-[#0a0a0f]">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="p-2 hover:bg-gray-800 rounded-lg border border-gray-800 transition"
              >
                <PanelRightOpen className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold">
                    {currentSymbol.replace('-USD', '/USD')}
                  </h1>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {formatPercent(currentMarket?.priceChangePercent)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-2xl font-bold font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    ${formatNum(currentMarket?.lastPrice)}
                  </span>
                  <span className="text-xs text-gray-500">
                    Mark: ${formatNum(currentMarket?.markPrice)}
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden xl:flex items-center gap-8">
              <StatCard 
                label="24h High" 
                value={`$${formatNum(currentMarket?.high24h)}`}
                color="text-green-400"
              />
              <StatCard 
                label="24h Low" 
                value={`$${formatNum(currentMarket?.low24h)}`}
                color="text-red-400"
              />
              <StatCard 
                label="24h Volume" 
                value={formatCompact(currentMarket?.volume24h)}
              />
              <StatCard 
                label="Open Interest" 
                value={formatCompact(currentMarket?.openInterest)}
              />
              <StatCard 
                label="Funding / APY" 
                value={currentMarket?.fundingRate ? `${(currentMarket.fundingRate * 100).toFixed(4)}%` : '---'}
                subValue={currentMarket?.apy ? `${currentMarket.apy.toFixed(2)}% APY` : '---'}
                color="text-yellow-400"
              />
            </div>
          </div>

          <div className="xl:hidden border-t border-gray-900 px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="24h High" value={`$${formatNum(currentMarket?.high24h)}`} color="text-green-400" />
              <StatCard label="24h Low" value={`$${formatNum(currentMarket?.low24h)}`} color="text-red-400" />
              <StatCard label="Volume" value={formatCompact(currentMarket?.volume24h)} />
              <StatCard 
                label="Funding" 
                value={currentMarket?.fundingRate ? `${(currentMarket.fundingRate * 100).toFixed(4)}%` : '---'} 
                color="text-yellow-400" 
              />
            </div>
          </div>
        </header>

        {error && currentMarket && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-6 py-3 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-200 text-sm">Using cached data. Failed to refresh: {error}</span>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="flex flex-1">
          
          {/* DESKTOP LAYOUT */}
          <div className="hidden xl:flex flex-1">
            
            <div className="flex-1 flex flex-col">
              {/* Chart */}
              <div className="flex-1 relative bg-[#0a0a0f] m-4 rounded-xl border border-gray-800">
                
                <button
                  onClick={() => setIsOrderbookOpen(!isOrderbookOpen)}
                  className="absolute top-4 right-4 z-10 p-2 bg-gray-900/90 hover:bg-gray-800 rounded-lg border border-gray-800 transition flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="text-xs font-semibold">
                    {isOrderbookOpen ? 'Hide' : 'Show'} Orderbook
                  </span>
                </button>
                
                <iframe
                  key={currentSymbol}
                  src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=BINANCE:${currentSymbol.replace('-USD', 'USDT')}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=0a0a0f&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en`}
                  className="absolute inset-0 w-full h-full rounded-xl"
                  title="TradingView Chart"
                />
              </div>
              
              <div className="flex-col border-t border-gray-900 bg-[#0a0a0f] hidden xl:flex max-h-80">
                <div className="flex gap-6 px-6 py-3 border-b border-gray-900">
                  <button className="text-sm font-semibold pb-2 border-b-2 border-blue-500">Positions</button>
                  <button className="text-sm font-semibold pb-2 text-gray-600 hover:text-gray-400 transition">Orders</button>
                  <button className="text-sm font-semibold pb-2 text-gray-600 hover:text-gray-400 transition">History</button>
                </div>
                
                <div className="overflow-y-auto px-6 py-4">
                  <PositionsListCompact />
                </div>
              </div>
            </div>

            {isOrderbookOpen && (
              <div className="w-[320px]">
                <OrderbookAndTrades 
                  symbol={currentSymbol}
                  onClose={() => setIsOrderbookOpen(false)}
                />
              </div>
            )}

            <aside className="w-96 overflow-y-auto">
              <OrderTicket 
                symbol={currentSymbol} 
                currentPrice={currentMarket?.lastPrice}
              />
            </aside>
          </div>

          {/* MOBILE LAYOUT */}
          <div className="xl:hidden flex-1 flex flex-col">

            {/* Mobile View Switcher */}
            <div className="sticky top-0 z-10 bg-[#0a0a0f] border-b border-gray-800 px-4 py-3">
              <div className="relative">
                <select
                  value={mobileView}
                  onChange={(e) => setMobileView(e.target.value as 'chart' | 'orderbook')}
                  className="w-full appearance-none bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 pr-10 text-sm font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="chart">📈 Chart View</option>
                  <option value="orderbook">📊 Order Book & Trades</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              </div>
            </div>
            
            {/* Chart or Orderbook View */}
            {mobileView === 'chart' ? (
              <div className="relative h-[60vh] bg-[#0a0a0f] border-b border-gray-800">
                <iframe
                  key={currentSymbol}
                  src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=BINANCE:${currentSymbol.replace('-USD', 'USDT')}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=0a0a0f&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en`}
                  className="w-full h-full"
                  title="TradingView Chart"
                />
              </div>
            ) : (
              <div className="h-[60vh] bg-[#0a0a0f] border-b border-gray-800 overflow-hidden">
                <OrderbookAndTrades 
                  symbol={currentSymbol}
                  onClose={() => setMobileView('chart')}
                  isMobile={true}
                />
              </div>
            )}

            {/* Order Ticket */}
            <div ref={orderTicketRef} className="bg-[#0a0a0f] w-full">
              <OrderTicket 
                symbol={currentSymbol} 
                currentPrice={currentMarket?.lastPrice}
              />
            </div>
          </div>
        </div>

        {isSidebarOpen && (
          <MarketSidebar
            markets={markets}
            currentSymbol={currentSymbol}
            onSelectMarket={handleMarketSelect}
            onClose={() => setIsSidebarOpen(false)}
            isRefreshing={isRefreshing}
          />
        )}

        {/* Scroll to Trade Button (Mobile Only) */}
        {showScrollButton && (
          <button 
            onClick={scrollToTrade}
            className="xl:hidden fixed bottom-24 left-1/2 -translate-x-1/2 bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2 transition-all animate-bounce"
          >
            <span>Scroll to Trade</span>
            <ArrowDown className="w-4 h-4" />
          </button>
        )}
      </div>

      <BottomNav />
    </>
  );
}