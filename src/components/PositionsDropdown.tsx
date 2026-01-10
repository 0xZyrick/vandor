import { useState } from 'react';
import { X, LayersPlus, ArrowUpRight, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { useExtendedExchange } from '../contexts/ExtendedExchangeContext';
import { useNavigate } from 'react-router-dom';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function PositionsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [closingPositionId, setClosingPositionId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const { 
    positions, 
    loadingPositions, 
    closePosition 
  } = useExtendedExchange();

  const hasPositions = positions.length > 0;


  const handleClosePosition = async (position: any) => {
    if (!confirm(`Close ${position.side} ${position.symbol}?`)) {
      return;
    }

    setClosingPositionId(position.id);

    try {
      const result = await closePosition({
        symbol: position.symbol,
        side: position.side,
      });

      if (result.success) {
        alert('✅ Position closed!');
      } else {
        alert(`❌ Failed: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setClosingPositionId(null);
    }
  };

  return (
    <div className="xl:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-xl hover:bg-gray-800 transition"
      >
        <LayersPlus className="text-md" />
        {hasPositions && (
          <span className="absolute -top-1 -right-1 bg-green-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {positions.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-14 w-80 bg-[#0d0d12] rounded-2xl shadow-2xl border border-gray-800 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h3 className="font-bold text-lg">Open Positions</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Positions List */}
            <div className="max-h-96 overflow-y-auto">
              {loadingPositions && positions.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : positions.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <LayersPlus className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No open positions</p>
                  <p className="text-gray-600 text-xs mt-1">Start trading to see positions here</p>
                </div>
              ) : (
                positions.map((pos) => {
                  const isProfit = pos.unrealizedPnl >= 0;
                  const pnlPercent = (pos.unrealizedPnl / (pos.size * pos.entryPrice)) * 100;
                  const isLong = pos.side === 'long';
                  const isClosing = closingPositionId === pos.id;

                  return (
                    <div key={pos.id} className="p-4 border-b border-gray-800 last:border-0">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-bold text-base flex items-center gap-2">
                            {pos.symbol}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              isLong 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {isLong ? 'LONG' : 'SHORT'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {pos.leverage}x • ${(pos.size * pos.entryPrice).toFixed(2)}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleClosePosition(pos)}
                          disabled={isClosing}
                          className="text-red-400 text-xs font-semibold hover:text-red-300 px-3 py-1 bg-red-500/10 rounded-lg border border-red-500/30 disabled:opacity-50"
                        >
                          {isClosing ? 'Closing...' : 'Close'}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-gray-500">Entry Price</div>
                          <div className="font-mono font-semibold">${pos.entryPrice.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Mark Price</div>
                          <div className="font-mono font-semibold">${pos.markPrice.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Liq. Price</div>
                          <div className="font-mono font-semibold text-red-400">${pos.liquidationPrice.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Unrealized PnL</div>
                          <div className={`font-mono font-bold flex items-center gap-1 ${
                            isProfit ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            ${pos.unrealizedPnl.toFixed(2)}
                            <span className="text-[10px]">
                              ({isProfit ? '+' : ''}{pnlPercent.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {hasPositions && (
              <div className="p-4 border-t border-gray-800">
                <button 
                  onClick={() => {
                    navigate('/portfolio');
                    setIsOpen(false);
                  }}
                  className="w-full text-center text-blue-400 font-semibold hover:text-blue-300 flex items-center justify-center gap-2 text-sm"
                >
                  <span>View Full Portfolio</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}