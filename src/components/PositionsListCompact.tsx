import { useState } from 'react';
import { X, Loader2, ArrowUpDown } from 'lucide-react';
import { useExtendedExchange } from '../contexts/ExtendedExchangeContext';
import { useNavigate } from 'react-router-dom';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function PositionsListCompact() {
  const { positions, loadingPositions, closePosition } = useExtendedExchange();
  const [closingPositionId, setClosingPositionId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleClosePosition = async (position: any) => {
    if (!confirm(`Close ${position.side} ${position.symbol}?`)) return;

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

  if (loadingPositions && positions.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-600">
        <ArrowUpDown className="w-8 h-8 mb-2 opacity-50" />
        <span className="text-sm">No active positions</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {positions.map((position) => {
        const isProfit = position.unrealizedPnl >= 0;
        const isLong = position.side === 'long';
        const isClosing = closingPositionId === position.id;

        return (
          <div
            key={position.id}
            className="bg-gray-900/50 rounded-lg p-3 border border-gray-800 hover:border-gray-700 transition"
          >
            {/* Header Row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{position.symbol}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isLong 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {isLong ? 'LONG' : 'SHORT'} {position.leverage}x
                </span>
              </div>

              <button
                onClick={() => handleClosePosition(position)}
                disabled={isClosing}
                className="p-1.5 hover:bg-red-500/20 rounded-lg transition group"
              >
                {isClosing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                ) : (
                  <X className="w-3.5 h-3.5 text-gray-500 group-hover:text-red-400" />
                )}
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2 text-[11px]">
              <div>
                <div className="text-gray-500 mb-0.5">Size</div>
                <div className="font-mono font-semibold">
                  ${(position.size * position.entryPrice).toFixed(0)}
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-0.5">Entry</div>
                <div className="font-mono font-semibold">
                  ${position.entryPrice.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-0.5">Mark</div>
                <div className="font-mono font-semibold">
                  ${position.markPrice.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-0.5">PnL</div>
                <div className={`font-mono font-bold ${
                  isProfit ? 'text-green-400' : 'text-red-400'
                }`}>
                  {isProfit ? '+' : ''}${position.unrealizedPnl.toFixed(0)}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* View All Button */}
      {positions.length > 3 && (
        <button
          onClick={() => navigate('/portfolio')}
          className="w-full text-center text-blue-400 text-xs font-semibold hover:text-blue-300 py-2"
        >
          View all positions →
        </button>
      )}
    </div>
  );
}