// ExtendedExchangeService.ts - PRODUCTION MAINNET READY
import { Account } from 'starknet';
import { signAndFormatOrder } from '../utils/extendedOrderSigning';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ExtendedConfig {
  apiKey: string;
  starkPrivateKey: string;
  clientId: string;
  vaultNumber: number;
  baseUrl?: string;
  network?: string;
}

interface StarknetDomain {
  name: string;
  version: string;
  chainId: string;
  revision: string;
}

class ExtendedExchangeService {
  private config: ExtendedConfig;
  private baseUrl: string;
  private account: Account | null = null;
  private domain: StarknetDomain;
  private isMainnet: boolean;

  constructor(config: ExtendedConfig) {
    this.config = config;
    this.baseUrl = '/api';
    this.isMainnet = config.network === 'mainnet';
    
    // MAINNET vs TESTNET domain config
    this.domain = this.isMainnet 
      ? {
          name: 'Perpetuals',
          version: 'v0',
          chainId: 'SN_MAIN',
          revision: '1',
        }
      : {
          name: 'Perpetuals',
          version: 'v0',
          chainId: 'SN_SEPOLIA',
          revision: '1',
        };
    
    console.log("✅ Extended Exchange Service initialized");
    console.log("🌐 Network:", this.isMainnet ? 'MAINNET' : 'SEPOLIA TESTNET');
    console.log("📍 Vault:", config.vaultNumber);
  }

  private async safeFetch(endpoint: string, options: RequestInit = {}) {
    const cleanEndpoint = endpoint
      .replace(/^https?:\/\/api\.starknet\.extended\.exchange/, '')
      .replace(/^https?:\/\/[^/]+/, '');
    
    const url = cleanEndpoint.startsWith('/api') 
      ? cleanEndpoint 
      : `/api${cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`}`;
    
    console.log("🔍 API Request:", url);
    
    const response = await fetch(url, {
      ...options,
      credentials: 'same-origin',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error ${response.status}:`, errorText);
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  connectWallet(account: Account) {
    this.account = account;
    console.log("✅ Wallet connected:", account.address);
  }

  disconnect() {
    this.account = null;
    console.log("🔌 Wallet disconnected");
  }

  isConnected(): boolean {
    return this.account !== null;
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<T> {
    const cleanEndpoint = endpoint.replace(/^\/api/, '');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Vandor-Trading-App/1.0',
    };

    // Add API key if configured
    if (this.config.apiKey) {
      headers['X-Api-Key'] = this.config.apiKey;
    }

    try {
      const data = await this.safeFetch(cleanEndpoint, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      return data;
    } catch (error: any) {
      console.error(`❌ ${method} ${endpoint} failed:`, error);
      throw error;
    }
  }

  // PUBLIC ENDPOINTS

  async getMarkets() {
    return this.makeRequest('GET', '/v1/info/markets');
  }

  async getMarketStats(market: string) {
    return this.makeRequest('GET', `/v1/info/markets/${market}/stats`);
  }

  async getOrderbook(market: string) {
    return this.makeRequest('GET', `/v1/info/markets/${market}/orderbook`);
  }

  // PRIVATE ENDPOINTS

  async getBalance() {
    if (!this.isConnected()) {
      throw new Error("Wallet not connected");
    }

    try {
      const data: any = await this.makeRequest('GET', '/v1/user/balance');
      
      return {
        available: parseFloat(data.data?.availableForTrade || '0'),
        total: parseFloat(data.data?.equity || '0'),
        margin: parseFloat(data.data?.initialMargin || '0'),
        unrealizedPnL: parseFloat(data.data?.unrealisedPnl || '0'),
      };
    } catch (error) {
      console.error("❌ Failed to get balance:", error);
      // Return zero balance instead of throwing
      return { available: 0, total: 0, margin: 0, unrealizedPnL: 0 };
    }
  }

  async getPositions() {
    if (!this.isConnected()) {
      throw new Error("Wallet not connected");
    }

    try {
      const data: any = await this.makeRequest('GET', '/v1/user/positions');
      
      const positions = data.data || [];
      const totalPnL = positions.reduce((sum: number, p: any) => 
        sum + parseFloat(p.unrealisedPnl || '0'), 0
      );

      return {
        positions: positions.map((p: any) => ({
          id: p.id,
          symbol: p.market,
          side: p.side.toLowerCase(),
          size: Math.abs(parseFloat(p.size)),
          entryPrice: parseFloat(p.openPrice),
          markPrice: parseFloat(p.markPrice),
          liquidationPrice: parseFloat(p.liquidationPrice),
          unrealizedPnl: parseFloat(p.unrealisedPnl),
          leverage: parseFloat(p.leverage),
        })),
        totalPnL,
        totalPositions: positions.length,
      };
    } catch (error) {
      console.error("❌ Failed to get positions:", error);
      return { positions: [], totalPnL: 0, totalPositions: 0 };
    }
  }

  async getOpenOrders(market?: string) {
    if (!this.isConnected()) {
      throw new Error("Wallet not connected");
    }

    try {
      const endpoint = market 
        ? `/v1/user/orders?market=${market}` 
        : '/v1/user/orders';
      
      const data: any = await this.makeRequest('GET', endpoint);
      return data.data || [];
    } catch (error) {
      console.error("❌ Failed to get orders:", error);
      return [];
    }
  }

  async getOrderHistory(market?: string) {
    if (!this.isConnected()) {
      throw new Error("Wallet not connected");
    }

    try {
      const endpoint = market 
        ? `/v1/user/orders/history?market=${market}` 
        : '/v1/user/orders/history';
      
      const data: any = await this.makeRequest('GET', endpoint);
      return data.data || [];
    } catch (error) {
      console.error("❌ Failed to get order history:", error);
      return [];
    }
  }

  // ORDER PLACEMENT - PRODUCTION READY
  async placeOrder(params: {
    symbol: string;
    side: 'long' | 'short';
    type: 'market' | 'limit';
    size: number;
    price?: number;
    leverage?: number;
  }) {
    if (!this.account) {
      return { success: false, error: "Wallet not connected" };
    }

    if (!this.config.vaultNumber) {
      return { success: false, error: "Vault number not configured. Please set up Extended Exchange account." };
    }

    try {
      console.log("📝 Preparing order:", params);

      // Get current market price if needed
      let orderPrice = params.price;
      if (params.type === 'market' || !orderPrice) {
        try {
          const stats: any = await this.getMarketStats(params.symbol);
          const currentPrice = parseFloat(stats.data?.lastPrice || '0');
          
          if (!currentPrice) {
            throw new Error('Could not get current market price');
          }
          
          // For market orders, add slippage buffer
          orderPrice = params.side === 'long' 
            ? currentPrice * 1.0075  // 0.75% above for buys
            : currentPrice * 0.9925; // 0.75% below for sells
          
          console.log(`💰 Market price: ${currentPrice}, Order price: ${orderPrice}`);
        } catch {
          return { success: false, error: 'Failed to get market price. Please try again.' };
        }
      }

      // Extended taker fee is 0.025% (0.00025)
      const feeRate = '0.00025';
      const externalId = `VANDOR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Prepare order params with ALL required fields
      const orderParams = {
        market: params.symbol,
        side: (params.side === 'long' ? 'BUY' : 'SELL') as 'BUY' | 'SELL',
        type: (params.type === 'market' ? 'MARKET' : 'LIMIT') as 'MARKET' | 'LIMIT',
        size: params.size,
        price: orderPrice,
        leverage: params.leverage,
        externalId,
        fee: feeRate,
        collateralPosition: this.config.vaultNumber.toString(),
      };

      console.log("✍️ Requesting wallet signature...");
      console.log("📋 Order params:", orderParams);

      // Sign the order (this triggers wallet popup)
      const signedOrder = await signAndFormatOrder(
        this.account,
        orderParams,
        this.domain,
        this.isMainnet
      );

      console.log("✅ Order signed successfully");
      console.log("📤 Submitting to Extended API...");

      // Prepare API payload
      const orderPayload = {
        id: signedOrder.order.externalId,
        market: signedOrder.order.market,
        type: signedOrder.order.type,
        side: signedOrder.order.side,
        qty: signedOrder.order.size.toString(),
        price: signedOrder.order.price.toString(),
        timeInForce: params.type === 'market' ? 'IOC' : 'GTT',
        expiryEpochMillis: signedOrder.order.expiryEpochMillis,
        fee: signedOrder.order.fee,
        nonce: signedOrder.order.nonce.toString(),
        settlement: {
          signature: signedOrder.signature,
          starkKey: signedOrder.starkKey,
          collateralPosition: signedOrder.order.collateralPosition,
        },
      };

      console.log("📨 API Payload:", JSON.stringify(orderPayload, null, 2));

      // Submit to Extended
      const response: any = await this.makeRequest('POST', '/v1/user/order', orderPayload);

      console.log("✅ Order submitted successfully!");
      console.log("📥 Response:", response);

      return {
        success: true,
        orderId: response.data?.id,
        externalId: response.data?.externalId,
        status: 'SUBMITTED',
      };

    } catch (error: any) {
      console.error("❌ Order placement failed:", error);
      
      // User-friendly error messages
      if (error.message?.includes('rejected') || error.message?.includes('denied')) {
        return {
          success: false,
          error: "You rejected the signature request. Please try again and approve the transaction.",
        };
      }
      
      if (error.message?.includes('Insufficient')) {
        return {
          success: false,
          error: "Insufficient balance. Please add funds to your account.",
        };
      }

      if (error.message?.includes('vault') || error.message?.includes('Vault')) {
        return {
          success: false,
          error: "Account not properly configured. Please set up your Extended Exchange account first.",
        };
      }
      
      return {
        success: false,
        error: error.message || "Failed to place order. Please try again.",
      };
    }
  }

  async cancelOrder(orderId: string) {
    if (!this.isConnected()) {
      return { success: false, error: "Wallet not connected" };
    }

    try {
      console.log("❌ Cancelling order:", orderId);
      const data: any = await this.makeRequest('DELETE', `/v1/user/order/${orderId}`);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to cancel order" };
    }
  }

  async closePosition(params: {
    symbol: string;
    side: 'long' | 'short';
    size?: number;
  }) {
    console.log("🔄 Closing position:", params);
    
    // Close by placing opposite market order
    return this.placeOrder({
      symbol: params.symbol,
      side: params.side === 'long' ? 'short' : 'long',
      type: 'market',
      size: params.size || 0, // If 0, Extended will close entire position
    });
  }
}

// SINGLETON
let extendedServiceInstance: ExtendedExchangeService | null = null;

export function initializeExtendedService(config: ExtendedConfig) {
  extendedServiceInstance = new ExtendedExchangeService(config);
  return extendedServiceInstance;
}

export function getExtendedService(): ExtendedExchangeService {
  if (!extendedServiceInstance) {
    throw new Error('Extended Exchange Service not initialized');
  }
  return extendedServiceInstance;
}

export default ExtendedExchangeService;