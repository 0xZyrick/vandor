'use client';
import { useState } from 'react';
import { X , LayersPlus, ArrowUpRight } from 'lucide-react';

export default function PositionsDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  // Fake data - later real from wallet
  const positions = [
    {
      side: 'Long',
      pair: 'SOL/USDT',
      size: '5.2 SOL',
      leverage: '10x',
      entry: '129.58',
      mark: '132.45',
      liq: '110.20',
      pnl: '+148.72',
      pnlPercent: '+22.8%',
    },
  ];

  const hasPositions = positions.length > 0;

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
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-14 w-80 bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h3 className="font-bold text-lg">Open Positions</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Positions List */}
            <div className="max-h-96 overflow-y-auto">
              {positions.map((pos, i) => (
                <div key={i} className="p-4 border-b border-gray-800 last:border-0">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-lg">
                        {pos.side} {pos.pair}
                      </div>
                      <div className="text-sm text-gray-400">
                        {pos.leverage} • {pos.size}
                      </div>
                    </div>
                    <button className="text-red-400 font-medium hover:text-red-300">
                      Close
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-400">Entry Price</div>
                      <div className="font-medium">${pos.entry}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Mark Price</div>
                      <div className="font-medium">${pos.mark}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Liq. Price</div>
                      <div className="font-medium">${pos.liq}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Unrealized PnL</div>
                      <div className="font-bold text-green-400">
                        ${pos.pnl} ({pos.pnlPercent})
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800">
              <button className="w-full text-center text-green-400 font-medium hover:text-green-300 flex items-center justify-center space-x-1">
              <span>View all positions</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}