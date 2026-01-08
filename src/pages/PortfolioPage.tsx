import { useState, useEffect } from 'react';
import { useAccount, useBalance } from "@starknet-react/core";
import { 
  Wallet, 
  TrendingUp, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownLeft,
  DollarSign,
  Activity,
  Clock,
  X,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { useExtendedExchange } from '../contexts/ExtendedExchangeContext';
import BottomNav from '../components/BottomNav';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function PortfolioPage() {
  const { address, isConnected, connector } = useAccount();
  const { data: balance } = useBalance({ address });
  const extendedExchange = useExtendedExchange();
  const { 
    positions, 
    loadingPositions, 
    closePosition,
    refreshPositions
  } = extendedExchange;
  
  // Safe access to getOrderHistory if it exists
//   const getOrderHistory = extendedExchange.getOrderHistory || (async () => []);

  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions');
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [closingPositionId, setClosingPositionId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get wallet type
  const getWalletType = () => {
    if (!connector) return 'Wallet';
    if (connector.id.includes('cartridge')) return 'Controller';
    if (connector.id.includes('argent')) return 'Argent X';
    if (connector.id.includes('braavos')) return 'Braavos';
    return connector.name || 'Wallet';
  };

  // Calculate portfolio metrics
  const totalPnL = positions.reduce((sum, pos) => sum + pos.unrealizedPnl, 0);
  const usdcBalance = balance?.formatted ? parseFloat(balance.formatted) : 0;
  const totalEquity = usdcBalance + totalPnL;
  const marginUsed = positions.reduce((sum, p) => sum + (p.size * p.entryPrice / p.leverage), 0);
  const marginAvailable = usdcBalance - marginUsed;

  // Load order history (placeholder - implement when context has this method)
  const loadOrderHistory = async () => {
    if (!isConnected) return;
    
    setLoadingHistory(true);
    try {
      // TODO: Implement when getOrderHistory is added to context
      // const history = await getOrderHistory({ limit: 50 });
      // setOrderHistory(history);
      setOrderHistory([]); // Placeholder
    } catch (error) {
      console.error('Failed to load order history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Refresh all data
  const refreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refreshPositions(),
      loadOrderHistory()
    ]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (isConnected && activeTab === 'history') {
      loadOrderHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, activeTab]);

  // Close position handler
  const handleClosePosition = async (position: any) => {
    if (!confirm(`Close your ${position.side} position on ${position.symbol}?`)) {
      return;
    }

    setClosingPositionId(position.id);

    try {
      const result = await closePosition({
        symbol: position.symbol,
        side: position.side,
      });

      if (result.success) {
        alert('Position closed successfully!');
        refreshPositions();
      } else {
        alert(`Failed to close position: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setClosingPositionId(null);
    }
  };

  if (!isConnected) {
    return (
      <>
        <div className="min-h-screen bg-[#050507] flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-white text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">Connect your wallet to view your portfolio and trading activity</p>
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#050507] text-white pb-24">
        {/* Portfolio Header */}
        <div className="bg-[#0a0a0f] border-b border-gray-900 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Wallet Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-linear-to-tr from-blue-600 to-purple-600 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Connected with {getWalletType()}</p>
                  <p className="font-mono text-sm">{address?.slice(0, 8)}...{address?.slice(-6)}</p>
                </div>
              </div>

              <button 
                onClick={refreshAll}
                disabled={isRefreshing}
                className="p-2 hover:bg-gray-800 rounded-lg transition"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Portfolio Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Total Equity */}
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 uppercase">Total Equity</span>
                </div>
                <p className="text-2xl font-bold font-mono">${totalEquity.toFixed(2)}</p>
              </div>

              {/* Unrealized PnL */}
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 uppercase">Unrealized PnL</span>
                </div>
                <p className={`text-2xl font-bold font-mono ${
                  totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                </p>
              </div>

              {/* USDC Balance */}
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 uppercase">USDC Balance</span>
                </div>
                <p className="text-2xl font-bold font-mono">${usdcBalance.toFixed(2)}</p>
              </div>

              {/* Available Margin */}
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 uppercase">Available Margin</span>
                </div>
                <p className="text-2xl font-bold font-mono">${marginAvailable.toFixed(2)}</p>
              </div>
            </div>

            {/* Deposit/Withdraw Buttons */}
            <div className="flex gap-3 mt-4">
              <a 
                href="https://starkgate.starknet.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-black font-bold py-3 rounded-xl transition"
              >
                <ArrowDownLeft className="w-4 h-4" />
                Deposit USDC
                <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href="https://starkgate.starknet.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition"
              >
                <ArrowUpRight className="w-4 h-4" />
                Withdraw USDC
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <div className="flex gap-6 border-b border-gray-800 mb-6">
            <button
              onClick={() => setActiveTab('positions')}
              className={`pb-3 px-1 font-semibold text-sm transition border-b-2 ${
                activeTab === 'positions'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              Open Positions ({positions.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 px-1 font-semibold text-sm transition border-b-2 ${
                activeTab === 'history'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              Trade History
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'positions' ? (
            // POSITIONS TAB
            loadingPositions && positions.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : positions.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Open Positions</h3>
                <p className="text-gray-500 mb-6">Start trading to see your positions here</p>
                <a 
                  href="/trade"
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition"
                >
                  Start Trading
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {positions.map((position) => {
                  const isProfit = position.unrealizedPnl >= 0;
                  const pnlPercent = (position.unrealizedPnl / (position.size * position.entryPrice)) * 100;
                  const isLong = position.side === 'long';
                  const isClosing = closingPositionId === position.id;

                  return (
                    <div
                      key={position.id}
                      className="bg-[#0a0a0f] rounded-xl p-5 border border-gray-800 hover:border-gray-700 transition"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold">{position.symbol}</span>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                            isLong 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {isLong ? 'LONG' : 'SHORT'} {position.leverage}x
                          </span>
                        </div>

                        <button
                          onClick={() => handleClosePosition(position)}
                          disabled={isClosing}
                          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg font-semibold text-sm transition flex items-center gap-2"
                        >
                          {isClosing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Closing...
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4" />
                              Close
                            </>
                          )}
                        </button>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Size</div>
                          <div className="text-sm font-mono font-semibold">
                            ${(position.size * position.entryPrice).toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Entry</div>
                          <div className="text-sm font-mono font-semibold">
                            ${position.entryPrice.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Mark</div>
                          <div className="text-sm font-mono font-semibold">
                            ${position.markPrice.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Liq. Price</div>
                          <div className="text-sm font-mono font-semibold text-red-400">
                            ${position.liquidationPrice.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Unrealized PnL</div>
                          <div className={`text-sm font-mono font-bold ${
                            isProfit ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {isProfit ? '+' : ''}${position.unrealizedPnl.toFixed(2)}
                            <span className="text-xs ml-1">
                              ({isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            // HISTORY TAB
            loadingHistory ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : orderHistory.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Trade History</h3>
                <p className="text-gray-500">Your completed trades will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {orderHistory.map((order, i) => (
                  <div
                    key={i}
                    className="bg-[#0a0a0f] rounded-lg p-4 border border-gray-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${
                        order.side === 'BUY' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-semibold">{order.market}</p>
                        <p className="text-xs text-gray-500">
                          {order.side} • {order.type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm">${order.price}</p>
                      <p className="text-xs text-gray-500">{order.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      <BottomNav />
    </>
  );
}