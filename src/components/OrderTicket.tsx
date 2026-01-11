import { useState, useEffect } from 'react';
import { useAccount } from "@starknet-react/core";
import { Settings2, AlertCircle, CheckCircle2, Loader2, Wallet, AlertTriangle } from 'lucide-react';
import { useExtendedExchange } from "../contexts/ExtendedExchangeContext";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface OrderTicketProps {
  symbol?: string;
  currentPrice?: number;
}

export default function OrderTicket({ symbol, currentPrice }: OrderTicketProps) {
  const { isConnected } = useAccount();
  const { 
    placeOrder, 
    balance, 
    loadingBalance,
    isConnected: isExtendedConnected 
  } = useExtendedExchange();

  const [activeTab, setActiveTab] = useState<'long' | 'short'>('long');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [amount, setAmount] = useState('');
  const [leverage, setLeverage] = useState(10);
  const [limitPrice, setLimitPrice] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderResult, setOrderResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const BETA_MAX_POSITION = 100;

  useEffect(() => {
    if (orderResult) {
      const timer = setTimeout(() => setOrderResult(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [orderResult]);

  const amountNum = parseFloat(amount) || 0;
  const positionSize = amountNum * leverage;
  const estimatedFee = positionSize * 0.00025;
  
  const estimateLiquidation = () => {
    if (!currentPrice || amountNum === 0) return null;
    
    const maintenanceMargin = 0.03;
    const effectiveMargin = 1 / leverage;
    
    if (activeTab === 'long') {
      return currentPrice * (1 - effectiveMargin + maintenanceMargin);
    } else {
      return currentPrice * (1 + effectiveMargin - maintenanceMargin);
    }
  };

  const liquidationPrice = estimateLiquidation();

  const validateAndShowConfirmation = () => {
    // Validation checks
    if (!isConnected) {
      setOrderResult({ success: false, message: 'Please connect your wallet first' });
      return;
    }

    if (!isExtendedConnected) {
      setOrderResult({ success: false, message: 'Connecting to Extended Exchange...' });
      return;
    }

    if (!symbol) {
      setOrderResult({ success: false, message: 'No market selected' });
      return;
    }

    if (amountNum === 0) {
      setOrderResult({ success: false, message: 'Enter an amount' });
      return;
    }

    if (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) === 0)) {
      setOrderResult({ success: false, message: 'Enter a limit price' });
      return;
    }

    if (balance && amountNum > balance.available) {
      setOrderResult({ 
        success: false, 
        message: `Insufficient balance. Available: ${balance.available.toFixed(2)} USDC` 
      });
      return;
    }

    if (positionSize > BETA_MAX_POSITION) {
      setOrderResult({ 
        success: false, 
        message: `⚠️ Beta Limit: Max $${BETA_MAX_POSITION} per position during testing` 
      });
      return;
    }

    setShowConfirmModal(true);
  };

  const handlePlaceOrder = async () => {
    setShowConfirmModal(false);
    setIsPlacingOrder(true);
    setOrderResult(null);

    try {
      console.log('📤 Placing order:', {
        symbol,
        side: activeTab,
        type: orderType,
        size: amountNum,
        price: orderType === 'limit' ? parseFloat(limitPrice) : currentPrice,
        leverage,
      });

      const result = await placeOrder({
        symbol: symbol!,
        side: activeTab,
        type: orderType,
        size: amountNum,
        price: orderType === 'limit' ? parseFloat(limitPrice) : currentPrice,
        leverage: leverage,
      });

      console.log('📥 Order result:', result);

      if (result.success) {
        setOrderResult({ 
          success: true, 
          message: `✅ ${activeTab === 'long' ? 'Long' : 'Short'} order placed! ID: ${result.orderId}` 
        });
        
        setAmount('');
        setLimitPrice('');
      } else {

        if (result.error?.includes('rejected') || result.error?.includes('denied')) {
          setOrderResult({ 
            success: false, 
            message: 'Signature rejected. Please approve the transaction in your wallet.' 
          });
        } else {
          setOrderResult({ 
            success: false, 
            message: result.error || 'Failed to place order. Please try again.' 
          });
        }
      }
    } catch (error: any) {
      console.error('❌ Order error:', error);
      
      let errorMessage = 'An error occurred';
      
      if (error.message?.includes('rejected') || error.message?.includes('denied')) {
        errorMessage = 'You rejected the signature request';
      } else if (error.message?.includes('insufficient') || error.message?.includes('Insufficient')) {
        errorMessage = 'Insufficient balance';
      } else if (error.message?.includes('vault') || error.message?.includes('Vault')) {
        errorMessage = 'Account not configured. Please set up Extended Exchange first.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setOrderResult({ success: false, message: errorMessage });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const setQuickAmount = (percentage: number) => {
    if (!balance) return;
    const quickAmount = (balance.available * percentage / 100).toFixed(2);
    setAmount(quickAmount);
  };

  return (
    <>
      <div className="flex flex-col bg-[#0a0a0f] rounded-2xl border border-gray-900/25 shadow-2xl overflow-y-auto h-full p-1">
        
        <div className="shrink-0 border-b border-gray-900 flex justify-between items-center">
          <div className="flex gap-4 px-4 pt-4 pb-2">
            <button 
              onClick={() => setOrderType('market')}
              className={`text-sm font-bold pb-2 px-6 transition-all ${
                orderType === 'market' 
                  ? 'border-b-2 border-blue-500 text-white' 
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              Market
            </button>
            <button 
              onClick={() => setOrderType('limit')}
              className={`text-sm font-bold pb-2 px-6 transition-all ${
                orderType === 'limit' 
                  ? 'border-b-2 border-blue-500 text-white' 
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              Limit
            </button>
          </div>

          <Settings2 className="p-1 w-7 h-7 rounded-lg text-gray-500 cursor-pointer hover:text-white transition shrink-0 border border-gray-400/25" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 w-full">
          <div className="space-y-2">
          
          <div className="flex justify-between items-center">
            <div className="flex gap-2 flex-1">
              <button 
                onClick={() => setActiveTab('long')} 
                className={`flex-1 px-4 py-2 rounded-lg font-bold transition-all ${
                  activeTab === 'long' 
                    ? 'bg-green-500/25 text-green-400' 
                    : 'text-green-300 hover:text-white'
                }`}
              >
                Long
              </button>
              <button 
                onClick={() => setActiveTab('short')} 
                className={`flex-1 px-4 py-2 rounded-lg font-bold transition-all ${
                  activeTab === 'short' 
                    ? 'bg-red-500/25 text-red-400' 
                    : 'text-red-500 hover:text-white'
                }`}
              >
                Short
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-gray-500 text-sm">Available Balance</h3>
            <div className="flex items-center gap-2">
              {loadingBalance ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              ) : (
                <>
                  <span className="text-white font-bold">
                    {balance?.available?.toFixed(2) || '0.00'}
                  </span>
                  <span className="text-gray-500 text-sm">USDC</span>
                </>
              )}
            </div>
          </div>

          {orderType === 'limit' && (
            <div className="flex flex-col gap-2">
              <h3 className="text-gray-500 text-sm">Limit Price</h3>
              <div className="flex w-full justify-between gap-2 px-3 py-4 rounded-lg border border-gray-800">
                <input 
                  type="number" 
                  placeholder={currentPrice?.toFixed(2) || "0.00"}
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="bg-transparent flex-1 outline-none font-medium" 
                />
                <span className="text-md font-semibold text-gray-400 bg-gray-900 px-4 rounded-lg">USD</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex w-full justify-between gap-2 px-3 py-4 rounded-lg border border-gray-800">
              <input 
                type="number" 
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent flex-1 outline-none font-medium" 
              />
              <span className="text-md font-semibold text-gray-400 bg-gray-900 px-4 py-1 rounded-lg">USDC</span>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mt-2">
              {[25, 50, 75, 100].map(percent => (
                <button 
                  key={percent}
                  onClick={() => setQuickAmount(percent)}
                  disabled={!balance || balance.available === 0}
                  className="text-xs py-2 bg-gray-900 hover:bg-gray-800 rounded border border-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {percent}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Leverage</span>
              <span className="text-blue-400 font-bold">{leverage.toFixed(1)}x</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="50" 
              value={leverage}
              onChange={(e) => setLeverage(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500" 
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>1x</span>
              <span>25x</span>
              <span>50x</span>
            </div>
          </div>

          <div className="flex w-full justify-between gap-2 px-3 py-3 rounded-lg bg-gray-900/50 border border-gray-800">
            <span className="text-sm text-gray-500">Position Size</span>
            <span className="text-sm font-semibold text-white">
              {positionSize > 0 ? `$${positionSize.toFixed(2)}` : '$0.00'}
            </span>
          </div>

          {positionSize > BETA_MAX_POSITION * 0.8 && (
            <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
              <span className="text-xs text-yellow-400">
                Approaching beta limit (${BETA_MAX_POSITION})
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-gray-900 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Entry Price</span>
              <span className="text-gray-300">
                {orderType === 'market' 
                  ? `~$${currentPrice?.toFixed(2) || '---'}` 
                  : `$${limitPrice || '---'}`
                }
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Est. Liquidation</span>
              <span className="text-red-400">
                {liquidationPrice ? `$${liquidationPrice.toFixed(2)}` : '$---'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Trading Fee (0.025%)</span>
              <span className="text-gray-300">${estimatedFee.toFixed(2)}</span>
            </div>
          </div>

          {orderResult && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              orderResult.success 
                ? 'bg-green-500/10 border border-green-500/30' 
                : 'bg-red-500/10 border border-red-500/30'
            }`}>
              {orderResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span className={`text-sm ${
                orderResult.success ? 'text-green-400' : 'text-red-400'
              }`}>
                {orderResult.message}
              </span>
            </div>
          )}

          <button 
            onClick={validateAndShowConfirmation}
            disabled={isPlacingOrder || !isConnected || !isExtendedConnected || !symbol}
            className={`w-full py-4 rounded-xl font-bold text-md shadow-lg transition-all ${
              activeTab === 'long' 
                ? 'bg-green-500 hover:bg-green-600 text-black disabled:bg-gray-700' 
                : 'bg-red-500 hover:bg-red-600 text-black disabled:bg-gray-700'
            } disabled:cursor-not-allowed disabled:text-gray-500`}
          >
            {isPlacingOrder ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Placing Order...
              </span>
            ) : !isConnected ? (
              <span className="flex items-center justify-center gap-2">
                <Wallet className="w-5 h-5" />
                Connect Wallet First
              </span>
            ) : !isExtendedConnected ? (
              'Connecting to Extended...'
            ) : !symbol ? (
              'Select a Market First'
            ) : (
              `Confirm ${activeTab === 'long' ? 'Long' : 'Short'}`
            )}
          </button>

          <div className="text-center text-xs text-gray-600 mt-2">
            Powered by Extended Exchange • Mainnet
          </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-[#0d0d12] border border-gray-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold">Confirm Order</h3>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Market</span>
                <span className="font-bold">{symbol}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Side</span>
                <span className={`font-bold ${activeTab === 'long' ? 'text-green-400' : 'text-red-400'}`}>
                  {activeTab.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Size</span>
                <span className="font-bold">${positionSize.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Leverage</span>
                <span className="font-bold">{leverage}x</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Type</span>
                <span className="font-bold">{orderType.toUpperCase()}</span>
              </div>
            </div>

            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-4">
              <p className="text-xs text-yellow-400 text-center">
                ⚠️ This is REAL money on mainnet. Only proceed if you understand the risks.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePlaceOrder}
                className={`flex-1 py-3 rounded-lg font-bold text-black transition ${
                  activeTab === 'long' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                Confirm Order
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 py-3 rounded-lg font-bold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}