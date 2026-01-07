import { Account } from 'starknet';

/* eslint-disable @typescript-eslint/no-explicit-any */


// TYPES

interface ExtendedConfig {
  apiKey: string;
  starkPrivateKey: string;
  clientId: string;
  vaultNumber: number;
  baseUrl?: string;
}

interface OrderParams {
  market: string; // "BTC-USD"
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  size: string; // Amount in USDC as string
  price: string; // Required even for market orders
  leverage?: number;
  reduceOnly?: boolean;
  postOnly?: boolean;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
}


// EXTENDED EXCHANGE SERVICE

class ExtendedExchangeService {
  private config: ExtendedConfig;
  private baseUrl: string;
  private account: Account | null = null;

  constructor(config: ExtendedConfig) {
    this.config = config;
    
    // 🔥 ALWAYS use /api - no exceptions
    this.baseUrl = '/api';
    
    console.log("✅ Extended Exchange Service initialized");
    console.log("📍 Base URL:", this.baseUrl);
  }

  // 🛡️ SAFE FETCH - strips any full URLs and forces proxy
  private async safeFetch(endpoint: string, options: RequestInit = {}) {
    // Strip any full URLs that might sneak in
    const cleanEndpoint = endpoint
      .replace(/^https?:\/\/api\.starknet\.extended\.exchange/, '')
      // eslint-disable-next-line no-useless-escape
      .replace(/^https?:\/\/[^\/]+/, '');
    
    // Ensure it starts with /api
    const url = cleanEndpoint.startsWith('/api') 
      ? cleanEndpoint 
      : `/api${cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`}`;
    
    console.log("🔍 Fetching from:", url);
    
    const response = await fetch(url, {
      ...options,
      credentials: 'same-origin',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  async fetchMarkets() {
    try {
      const data = await this.safeFetch('/v1/info/markets');
      console.log("✅ Markets loaded successfully");
      return data;
    } catch (error) {
      console.error("❌ Failed to load markets:", error);
      throw error;
    }
  }

    // AUTHENTICATION
  
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

    // API REQUEST HELPER
  
  private async makeRequest<T>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<T> {
    // Strip /api prefix if it exists since safeFetch adds it
    const cleanEndpoint = endpoint.replace(/^\/api/, '');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Api-Key': this.config.apiKey,
      'User-Agent': 'Vello-Trading-App/1.0',
    };

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

    // PUBLIC ENDPOINTS (No Auth Required)
  

  async getMarkets() {
    return this.makeRequest('GET', '/v1/info/markets');
  }


  async getMarketStats(market: string) {
    return this.makeRequest('GET', `/v1/info/markets/${market}/stats`);
  }

  async getFees() {
    return this.makeRequest('GET', '/v1/info/fees');
  }

  /**
   * Get orderbook depth
   */
  async getOrderbook(market: string, depth: number = 20) {
    return this.makeRequest('GET', `/v1/info/orderbook/${market}?depth=${depth}`);
  }


  // PRIVATE ENDPOINTS (Auth Required)

      async getBalance() {
        if (!this.isConnected()) {
          throw new Error("Wallet not connected");
        }

        try {
          const data: any = await this.makeRequest('GET', '/v1/private/account');
          
          return {
            available: parseFloat(data.data?.availableBalance || '0'),
            total: parseFloat(data.data?.totalBalance || '0'),
            margin: parseFloat(data.data?.usedMargin || '0'),
            unrealizedPnL: parseFloat(data.data?.unrealizedPnl || '0'),
          };
        } catch (error) {
          console.error("❌ Failed to get balance:", error);
          throw error;
        }
      }


    //  Get all open positions

    async getPositions() {
      if (!this.isConnected()) {
        throw new Error("Wallet not connected");
      }

      try {
        const data: any = await this.makeRequest('GET', '/v1/private/positions');
        
        const positions = data.data?.positions || [];
        const totalPnL = positions.reduce((sum: number, p: any) => 
          sum + parseFloat(p.unrealizedPnl || '0'), 0
        );

        return {
          positions: positions.map((p: any) => ({
            id: p.positionId,
            symbol: p.market,
            side: parseFloat(p.size) > 0 ? 'long' : 'short',
            size: Math.abs(parseFloat(p.size)),
            entryPrice: parseFloat(p.entryPrice),
            markPrice: parseFloat(p.markPrice),
            liquidationPrice: parseFloat(p.liquidationPrice),
            unrealizedPnl: parseFloat(p.unrealizedPnl),
            leverage: parseFloat(p.leverage),
          })),
          totalPnL,
          totalPositions: positions.length,
        };
      } catch (error) {
        console.error("❌ Failed to get positions:", error);
        throw error;
      }
    }

  async getOpenOrders(market?: string) {
    if (!this.isConnected()) {
      throw new Error("Wallet not connected");
    }

    try {
      const endpoint = market 
        ? `/v1/private/orders?market=${market}` 
        : '/v1/private/orders';
      
      const data: any = await this.makeRequest('GET', endpoint);
      return data.data?.orders || [];
    } catch (error) {
      console.error("❌ Failed to get orders:", error);
      throw error;
    }
  }

  async getOrderHistory(params?: {
    market?: string;
    startTime?: number;
    endTime?: number;
    limit?: number;
  }) {
    if (!this.isConnected()) {
      throw new Error("Wallet not connected");
    }

    try {
      const queryParams = new URLSearchParams();
      if (params?.market) queryParams.append('market', params.market);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const endpoint = `/v1/private/orders/history?${queryParams}`;
      const data: any = await this.makeRequest('GET', endpoint);

      return data.data?.orders || [];
    } catch (error) {
      console.error("❌ Failed to get order history:", error);
      throw error;
    }
  }

  
  // ORDER PLACEMENT 
  
  async placeOrder(params: {
    symbol: string;
    side: 'long' | 'short';
    type: 'market' | 'limit';
    size: number;
    price?: number;
    leverage?: number;
    reduceOnly?: boolean;
  }) {
    if (!this.isConnected()) {
      return {
        success: false,
        error: "Wallet not connected"
      };
    }

    console.log("📤 Placing order:", params);

    try {
      // Get current market price for market orders
      let orderPrice = params.price?.toString() || '0';
      
      if (params.type === 'market' && !params.price) {
        const marketData: any = await this.getMarketStats(params.symbol);
        orderPrice = marketData.data?.lastPrice || '0';
      }

      const feesData: any = await this.getFees();
      const marketFees = feesData.data?.find((f: any) => f.market === params.symbol);
      const fee = params.type === 'limit' ? marketFees?.makerFeeRate : marketFees?.takerFeeRate;

      // Prepare order payload
      const orderPayload: OrderParams = {
        market: params.symbol,
        side: params.side === 'long' ? 'BUY' : 'SELL',
        type: params.type.toUpperCase() as 'MARKET' | 'LIMIT',
        size: params.size.toString(),
        price: orderPrice,
        leverage: params.leverage || 1,
        reduceOnly: params.reduceOnly || false,
        timeInForce: params.type === 'market' ? 'IOC' : 'GTC',
      };

      // Add builder code info
      const builderPayload = {
        ...orderPayload,
        builderId: this.config.clientId,
        builderFee: '0.0001', // 0.01% builder fee
        fee: fee || '0.00025',
      };

      console.log("⚠️ DEMO MODE: Stark signature required for actual order placement");
      console.log("📋 Order payload:", builderPayload);

      // Simulated response for development
      return {
        success: true,
        orderId: `demo_${Date.now()}`,
        status: 'PENDING_SIGNATURE',
        message: 'Stark signature required - see Extended API docs',
        ...builderPayload
      };

    } catch (error: any) {
      console.error("❌ Order failed:", error);
      return {
        success: false,
        error: error.message || "Failed to place order"
      };
    }
  }

  async cancelOrder(orderId: string) {
    if (!this.isConnected()) {
      return { success: false, error: "Wallet not connected" };
    }

    try {
      console.log("❌ Cancelling order:", orderId);
      
      const data: any = await this.makeRequest('DELETE', `/v1/private/orders/${orderId}`);

      return {
        success: true,
        data: data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to cancel order"
      };
    }
  }

  /**
   * Close a position (place opposite order with reduceOnly)
   */
  async closePosition(params: {
    symbol: string;
    side: 'long' | 'short';
    size?: number;
  }) {
    return this.placeOrder({
      symbol: params.symbol,
      side: params.side === 'long' ? 'short' : 'long', // Opposite side
      type: 'market',
      size: params.size || 0, // If 0, closes entire position
      reduceOnly: true,
    });
  }
}

// SINGLETON INSTANCE

let extendedServiceInstance: ExtendedExchangeService | null = null;

export function initializeExtendedService(config: ExtendedConfig) {
  extendedServiceInstance = new ExtendedExchangeService(config);
  return extendedServiceInstance;
}

export function getExtendedService(): ExtendedExchangeService {
  if (!extendedServiceInstance) {
    throw new Error('Extended Exchange Service not initialized. Call initializeExtendedService() first.');
  }
  return extendedServiceInstance;
}

export default ExtendedExchangeService;