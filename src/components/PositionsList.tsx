// src/components/PositionsList.tsx

import { useState } from 'react';
import { TrendingUp, TrendingDown, X, Loader2, RefreshCw } from 'lucide-react';
import { useExtendedExchange } from '../contexts/ExtendedExchangeContext';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function PositionsList() {
  const { 
    positions, 
    loadingPositions, 
    closePosition,
    refreshPositions 
  } = useExtendedExchange();

  const [closingPositionId, setClosingPositionId] = useState<string | null>(null);

  // Calculate total PnL
  const totalPnL = positions.reduce((sum, pos) => sum + pos.unrealizedPnl, 0);
  const totalPnLPercent = positions.reduce((sum, pos) => {
    const pnlPercent = (pos.unrealizedPnl / (pos.size * pos.entryPrice)) * 100;
    return sum + pnlPercent;
  }, 0) / (positions.length || 1);

  // Handle close position
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
      } else {
        alert(`Failed to close position: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setClosingPositionId(null);
    }
  };

  if (loadingPositions && positions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Header with Total PnL */}
      <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800">
        <div>
          <h3 className="text-sm text-gray-500 mb-1">Total Unrealized PnL</h3>
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold font-mono ${
              totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
            </span>
            <span className={`text-sm font-semibold ${
              totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              ({totalPnL >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <button
          onClick={refreshPositions}
          disabled={loadingPositions}
          className="p-2 hover:bg-gray-800 rounded-lg transition"
        >
          <RefreshCw className={`w-5 h-5 text-gray-400 ${loadingPositions ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Positions List */}
      {positions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-600 mb-2">No open positions</div>
          <p className="text-gray-500 text-sm">Place an order to get started</p>
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
                className="bg-gray-900/50 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* Symbol */}
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{position.symbol}</span>
                      <span className={`text-xs px-2 py-1 rounded font-semibold ${
                        isLong 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {isLong ? 'LONG' : 'SHORT'} {position.leverage}x
                      </span>
                    </div>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => handleClosePosition(position)}
                    disabled={isClosing}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition group"
                  >
                    {isClosing ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                    ) : (
                      <X className="w-4 h-4 text-gray-500 group-hover:text-red-400" />
                    )}
                  </button>
                </div>

                {/* Position Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  {/* Size */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Size</div>
                    <div className="text-sm font-mono font-semibold">
                      ${(position.size * position.entryPrice).toFixed(2)}
                    </div>
                  </div>

                  {/* Entry Price */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Entry Price</div>
                    <div className="text-sm font-mono font-semibold">
                      ${position.entryPrice.toFixed(2)}
                    </div>
                  </div>

                  {/* Mark Price */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Mark Price</div>
                    <div className="text-sm font-mono font-semibold">
                      ${position.markPrice.toFixed(2)}
                    </div>
                  </div>

                  {/* Liq. Price */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Liq. Price</div>
                    <div className="text-sm font-mono font-semibold text-red-400">
                      ${position.liquidationPrice.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* PnL Section */}
                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  isProfit 
                    ? 'bg-green-500/10 border border-green-500/30' 
                    : 'bg-red-500/10 border border-red-500/30'
                }`}>
                  <div className="flex items-center gap-2">
                    {isProfit ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-xs text-gray-400">Unrealized PnL</span>
                  </div>

                  <div className="text-right">
                    <div className={`text-lg font-bold font-mono ${
                      isProfit ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {isProfit ? '+' : ''}${position.unrealizedPnl.toFixed(2)}
                    </div>
                    <div className={`text-xs font-semibold ${
                      isProfit ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {positions.length > 0 && (
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-900/30 rounded-xl border border-gray-800">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Open Positions</div>
            <div className="text-lg font-bold">{positions.length}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Total Size</div>
            <div className="text-lg font-bold">
              ${positions.reduce((sum, p) => sum + (p.size * p.entryPrice), 0).toFixed(0)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Avg. Leverage</div>
            <div className="text-lg font-bold">
              {(positions.reduce((sum, p) => sum + p.leverage, 0) / positions.length).toFixed(1)}x
            </div>
          </div>
        </div>
      )}
    </div>
  );
}