import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, X, RefreshCw } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface OrderbookEntry {
  price: number;
  size: number;
  total: number;
}

interface Trade {
  price: number;
  size: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

interface OrderbookAndTradesProps {
  symbol: string;
  onClose?: () => void;
  isMobile?: boolean;
}

export default function OrderbookAndTrades({ 
  symbol, 
  onClose, 
  isMobile = false 
}: OrderbookAndTradesProps) {
  const [activeTab, setActiveTab] = useState<'orderbook' | 'trades'>('orderbook');
  const [bids, setBids] = useState<OrderbookEntry[]>([]);
  const [asks, setAsks] = useState<OrderbookEntry[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrderbook = async () => {
    try {
      setLoading(true);
      
      const apiUrl = import.meta.env.DEV 
        ? `/api/v1/info/orderbook/${symbol}?depth=20`
        : `https://api.starknet.extended.exchange/api/v1/info/orderbook/${symbol}?depth=20`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      console.log('📊 Orderbook data:', data);
      
      if (data.data) {
        const orderbookBids = (data.data.bids || []).map((bid: any) => ({
          price: parseFloat(bid.price || bid[0]),
          size: parseFloat(bid.size || bid[1]),
          total: parseFloat(bid.total || bid[1]),
        })).slice(0, 15);
        
        const orderbookAsks = (data.data.asks || []).map((ask: any) => ({
          price: parseFloat(ask.price || ask[0]),
          size: parseFloat(ask.size || ask[1]),
          total: parseFloat(ask.total || ask[1]),
        })).slice(0, 15);
        
        setBids(orderbookBids);
        setAsks(orderbookAsks.reverse());
      }
    } catch (error) {
      console.error('❌ Failed to fetch orderbook:', error);
      generateMockData();
    } finally {
      setLoading(false);
    }
  };


  const fetchTrades = async () => {
    try {
      const apiUrl = import.meta.env.DEV 
        ? `/api/v1/info/trades/${symbol}?limit=50`
        : `https://api.starknet.extended.exchange/api/v1/info/trades/${symbol}?limit=50`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      console.log('📊 Trades data:', data);
      
      if (data.data && Array.isArray(data.data.trades)) {
        const recentTrades = data.data.trades.map((trade: any) => ({
          price: parseFloat(trade.price),
          size: parseFloat(trade.size),
          side: trade.side.toLowerCase() as 'buy' | 'sell',
          timestamp: trade.timestamp || Date.now(),
        }));
        
        setTrades(recentTrades);
      }
    } catch (error) {
      console.error('❌ Failed to fetch trades:', error);
      generateMockTrades();
    }
  };

  const generateMockData = () => {
    const basePrice = 93800; 
    const mockBids: OrderbookEntry[] = [];
    const mockAsks: OrderbookEntry[] = [];
    
    for (let i = 0; i < 15; i++) {
      mockBids.push({
        price: basePrice - (i * 10),
        size: Math.random() * 2,
        total: Math.random() * 20,
      });
      
      mockAsks.push({
        price: basePrice + (i * 10),
        size: Math.random() * 2,
        total: Math.random() * 20,
      });
    }
    
    setBids(mockBids);
    setAsks(mockAsks.reverse());
  };

  const generateMockTrades = () => {
    const basePrice = 93800;
    const mockTrades: Trade[] = [];
    
    for (let i = 0; i < 20; i++) {
      mockTrades.push({
        price: basePrice + (Math.random() * 100 - 50),
        size: Math.random() * 2,
        side: Math.random() > 0.5 ? 'buy' : 'sell',
        timestamp: Date.now() - (i * 1000),
      });
    }
    
    setTrades(mockTrades);
  };

    useEffect(() => {
      fetchOrderbook();
      fetchTrades();
      
      const interval = setInterval(() => {
        fetchOrderbook();
        fetchTrades();
      }, 5000);
      
      return () => clearInterval(interval);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [symbol]);

  const maxBidSize = Math.max(...bids.map(b => b.size), 1);
  const maxAskSize = Math.max(...asks.map(a => a.size), 1);

  return (
    <div className={`bg-[#0a0a0f] border-l border-gray-900 flex flex-col ${
      isMobile ? 'w-full h-full' : 'w-[320px] h-full'
    }`}>
      
      <div className="flex items-center justify-between p-4 border-b border-gray-900">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('orderbook')}
            className={`text-sm font-semibold px-3 py-1.5 rounded transition ${
              activeTab === 'orderbook'
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Order Book
          </button>
          <button
            onClick={() => setActiveTab('trades')}
            className={`text-sm font-semibold px-3 py-1.5 rounded transition ${
              activeTab === 'trades'
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Trades
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              fetchOrderbook();
              fetchTrades();
            }}
            className="p-1 hover:bg-gray-800 rounded"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        
        {activeTab === 'orderbook' && (
          <div className="h-full flex flex-col text-xs">
            
            <div className="flex justify-between px-4 py-2 text-gray-500 font-semibold border-b border-gray-900">
              <span>Price (USD)</span>
              <span>Size</span>
              <span>Total</span>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col-reverse">
              {asks.map((ask, index) => (
                <div
                  key={`ask-${index}`}
                  className="relative flex justify-between px-4 py-1 hover:bg-red-500/10 transition"
                >
                  {/* Background bar */}
                  <div 
                    className="absolute right-0 top-0 h-full bg-red-500/10"
                    style={{ width: `${(ask.size / maxAskSize) * 100}%` }}
                  />
                  
                  <span className="text-red-400 font-mono relative z-10">
                    {ask.price.toFixed(2)}
                  </span>
                  <span className="text-gray-300 font-mono relative z-10">
                    {ask.size.toFixed(4)}
                  </span>
                  <span className="text-gray-500 font-mono relative z-10">
                    {ask.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="py-3 px-4 bg-gray-900/50 border-y border-gray-800">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs">Spread</span>
                <span className="text-gray-400 font-mono text-sm">
                  {bids.length && asks.length
                    ? `$${(asks[asks.length - 1].price - bids[0].price).toFixed(2)}`
                    : '--'}
                </span>
              </div>
            </div>

            {/* Bids (Buys) - Green */}
            <div className="flex-1 overflow-y-auto">
              {bids.map((bid, index) => (
                <div
                  key={`bid-${index}`}
                  className="relative flex justify-between px-4 py-1 hover:bg-green-500/10 transition"
                >
                  <div 
                    className="absolute right-0 top-0 h-full bg-green-500/10"
                    style={{ width: `${(bid.size / maxBidSize) * 100}%` }}
                  />
                  
                  <span className="text-green-400 font-mono relative z-10">
                    {bid.price.toFixed(2)}
                  </span>
                  <span className="text-gray-300 font-mono relative z-10">
                    {bid.size.toFixed(4)}
                  </span>
                  <span className="text-gray-500 font-mono relative z-10">
                    {bid.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRADES TAB */}
        {activeTab === 'trades' && (
          <div className="h-full flex flex-col text-xs">
            
            <div className="flex justify-between px-4 py-2 text-gray-500 font-semibold border-b border-gray-900">
              <span>Price (USD)</span>
              <span>Size</span>
              <span>Time</span>
            </div>

            <div className="flex-1 overflow-y-auto">
              {trades.map((trade, index) => (
                <div
                  key={`trade-${index}`}
                  className={`flex justify-between px-4 py-1.5 hover:bg-gray-800/50 transition ${
                    trade.side === 'buy' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {trade.side === 'buy' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span className="font-mono">{trade.price.toFixed(2)}</span>
                  </div>
                  <span className="text-gray-300 font-mono">{trade.size.toFixed(4)}</span>
                  <span className="text-gray-500 font-mono">
                    {new Date(trade.timestamp).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false 
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}