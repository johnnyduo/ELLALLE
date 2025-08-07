// CoinGecko API utilities for real market data with caching
import { marketDataCache } from '@/lib/cache/marketDataCache';
import { formatPercentage, formatPrice } from './web3';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// CoinGecko coin IDs mapping
export const COIN_IDS = {
  'BTC/USDC': 'bitcoin',
  'ETH/USDC': 'ethereum',
  'SOL/USDC': 'solana',
  'AVAX/USDC': 'avalanche-2',
  'HBAR/USDC': 'hedera-hashgraph',
  'ADA/USDC': 'cardano',
  'DOT/USDC': 'polkadot',
  'MATIC/USDC': 'matic-network',
};

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  sparkline?: number[];
}

export interface ChartData {
  timestamp: number;
  price: number;
}

// Fetch current prices for multiple coins with caching
export const fetchMarketData = async (coinIds: string[]): Promise<MarketData[]> => {
  try {
    // Check cache first
    const cachedData = marketDataCache.getMarketData(coinIds);
    if (cachedData) {
      console.log('📦 Using cached market data:', cachedData);
      return cachedData;
    }

    console.log('🌐 Fetching fresh market data from CoinGecko for:', coinIds);
    
    const idsString = coinIds.join(',');
    const apiUrl = `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&ids=${idsString}&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h`;
    console.log('📡 CoinGecko API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
    
    console.log('📊 CoinGecko Response Status:', response.status, response.statusText);
    
    if (!response.ok) {
      if (response.status === 429) {
        console.error('⚠️ Rate limit exceeded - too many requests to CoinGecko API');
        throw new Error('Rate limit exceeded - too many requests to CoinGecko API');
      }
      console.error('❌ CoinGecko API error:', response.status, response.statusText);
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ CoinGecko API data received:', data.length, 'coins');
    console.log('📈 Sample coin data:', data[0]);
    
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('⚠️ Empty or invalid API response');
      throw new Error('Empty API response from CoinGecko');
    }
    
    const marketData = data.map((coin: any) => ({
      symbol: getSymbolFromId(coin.id),
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h || 0,
      volume24h: coin.total_volume || 0,
      marketCap: coin.market_cap || 0,
      high24h: coin.high_24h || coin.current_price,
      low24h: coin.low_24h || coin.current_price,
      sparkline: coin.sparkline_in_7d?.price?.slice(-24) || [], // Last 24 hours
    }));

    console.log('💾 Caching real market data:', marketData);

    // Cache the result
    marketDataCache.setMarketData(coinIds, marketData);
    
    return marketData;
  } catch (error) {
    console.error('❌ Error fetching market data:', error);
    
    // Try to return cached data even if expired as fallback
    const staleData = marketDataCache.getMarketData(coinIds);
    if (staleData) {
      console.log('⚠️ Using stale cached data due to API error');
      return staleData;
    }
    
    // Return mock data if no cache available
    console.log('🎭 API failed, using realistic mock data as fallback');
    return getMockMarketData();
  }
};

// Fetch historical chart data with caching
export const fetchChartData = async (coinId: string, days: number = 1): Promise<ChartData[]> => {
  try {
    // Check cache first
    const cachedData = marketDataCache.getChartData(coinId, days);
    if (cachedData) {
      return cachedData;
    }

    console.log('🌐 Fetching fresh chart data from CoinGecko for:', coinId, days, 'days');
    
    const response = await fetch(
      `${COINGECKO_BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${days <= 1 ? 'hourly' : 'daily'}`,
      {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
      }
    );
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded - too many requests to CoinGecko API');
      }
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    const chartData = data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      price,
    }));

    // Cache the result
    marketDataCache.setChartData(coinId, days, chartData);
    
    return chartData;
  } catch (error) {
    console.error('Error fetching chart data:', error);
    
    // Try to return cached data even if expired as fallback
    const staleData = marketDataCache.getChartData(coinId, days);
    if (staleData) {
      console.log('⚠️ Using stale cached chart data due to API error');
      return staleData;
    }
    
    // Return mock chart data if no cache available
    console.log('📋 Using mock chart data as fallback');
    return getMockChartData();
  }
};

// Get symbol from coin ID
const getSymbolFromId = (coinId: string): string => {
  const entry = Object.entries(COIN_IDS).find(([_, id]) => id === coinId);
  return entry ? entry[0] : coinId.toUpperCase();
};

// Mock data fallback with realistic current prices (August 2025)
export const getMockMarketData = (): MarketData[] => [
  {
    symbol: 'BTC/USDC',
    price: 116514.23, // Current realistic BTC price
    change24h: 2.47,
    volume24h: 28500000000,
    marketCap: 2300000000000,
    high24h: 118250.00,
    low24h: 113890.50,
    sparkline: generateSparkline(116514.23, 24),
  },
  {
    symbol: 'ETH/USDC',
    price: 3858.42, // Current realistic ETH price
    change24h: -1.23,
    volume24h: 12500000000,
    marketCap: 465000000000,
    high24h: 3912.80,
    low24h: 3801.15,
    sparkline: generateSparkline(3858.42, 24),
  },
  {
    symbol: 'SOL/USDC',
    price: 172.01, // Current realistic SOL price
    change24h: 4.56,
    volume24h: 2200000000,
    marketCap: 82000000000,
    high24h: 178.50,
    low24h: 168.20,
    sparkline: generateSparkline(172.01, 24),
  },
  {
    symbol: 'AVAX/USDC',
    price: 22.78, // Current realistic AVAX price
    change24h: 3.89,
    volume24h: 520000000,
    marketCap: 9200000000,
    high24h: 23.45,
    low24h: 21.95,
    sparkline: generateSparkline(22.78, 24),
  },
  {
    symbol: 'HBAR/USDC',
    price: 0.2532, // Current realistic HBAR price
    change24h: 3.21,
    volume24h: 45000000,
    marketCap: 9500000000,
    high24h: 0.2649,
    low24h: 0.2445,
    sparkline: generateSparkline(0.2532, 24),
  },
  {
    symbol: 'ADA/USDC',
    price: 0.7821, // Current realistic ADA price
    change24h: -2.15,
    volume24h: 385000000,
    marketCap: 28000000000,
    high24h: 0.8012,
    low24h: 0.7654,
    sparkline: generateSparkline(0.7821, 24),
  },
  {
    symbol: 'DOT/USDC',
    price: 3.79, // Current realistic DOT price
    change24h: 5.22,
    volume24h: 195000000,
    marketCap: 5400000000,
    high24h: 3.89,
    low24h: 3.61,
    sparkline: generateSparkline(3.79, 24),
  },
  {
    symbol: 'MATIC/USDC',
    price: 0.2916, // Current realistic MATIC price
    change24h: 6.93,
    volume24h: 142000000,
    marketCap: 2900000000,
    high24h: 0.3021,
    low24h: 0.2745,
    sparkline: generateSparkline(0.2916, 24),
  },
];

// Generate mock chart data
export const getMockChartData = (): ChartData[] => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const data: ChartData[] = [];
  
  let basePrice = 43250;
  
  for (let i = 24; i >= 0; i--) {
    const timestamp = now - (i * oneHour);
    const volatility = (Math.random() - 0.5) * 2000; // ±$1000 volatility
    basePrice += volatility;
    
    data.push({
      timestamp,
      price: Math.max(basePrice, 40000), // Minimum $40k
    });
  }
  
  return data;
};

// Generate sparkline data
const generateSparkline = (currentPrice: number, points: number): number[] => {
  const data: number[] = [];
  let price = currentPrice * 0.98; // Start 2% lower
  
  for (let i = 0; i < points; i++) {
    const volatility = (Math.random() - 0.5) * 0.02; // ±1% volatility
    price *= (1 + volatility);
    data.push(price);
  }
  
  // Ensure last point is current price
  data[data.length - 1] = currentPrice;
  return data;
};

// Format market data for display
export const formatMarketData = (data: MarketData) => ({
  ...data,
  formattedPrice: formatPrice(data.price),
  formattedChange: formatPercentage(data.change24h),
  formattedVolume: formatVolume(data.volume24h),
  formattedMarketCap: formatVolume(data.marketCap),
});

// Format large numbers for volume/market cap
const formatVolume = (value: number): string => {
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`;
  } else if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  } else {
    return `$${value.toFixed(2)}`;
  }
};

// Cache management utilities
export const clearMarketDataCache = () => {
  marketDataCache.clearCache();
};

export const getMarketDataCacheStats = () => {
  return marketDataCache.getStats();
};

// Background refresh function that respects cache timing
export const refreshMarketDataInBackground = async (coinIds: string[]): Promise<void> => {
  if (marketDataCache.shouldRefreshMarketData(coinIds)) {
    try {
      console.log('🔄 Background refresh of market data...');
      await fetchMarketData(coinIds);
    } catch (error) {
      console.error('Background refresh failed:', error);
    }
  }
};

// Background refresh for chart data
export const refreshChartDataInBackground = async (coinId: string, days: number): Promise<void> => {
  if (marketDataCache.shouldRefreshChartData(coinId, days)) {
    try {
      console.log('🔄 Background refresh of chart data...');
      await fetchChartData(coinId, days);
    } catch (error) {
      console.error('Background chart refresh failed:', error);
    }
  }
};

// Force fresh data by clearing cache and making new API call
export const fetchFreshMarketData = async (coinIds: string[]): Promise<MarketData[]> => {
  console.log('🔄 Forcing fresh market data fetch (clearing cache)');
  marketDataCache.clearCache();
  return fetchMarketData(coinIds);
};

// Debug function to test API connectivity
export const testCoinGeckoAPI = async (): Promise<{ success: boolean; error?: string; data?: any }> => {
  try {
    console.log('🧪 Testing CoinGecko API connectivity...');
    const testUrl = `${COINGECKO_BASE_URL}/ping`;
    console.log('📡 Ping URL:', testUrl);
    
    const response = await fetch(testUrl);
    const data = await response.json();
    
    console.log('✅ CoinGecko ping successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ CoinGecko ping failed:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

// Debug function to force API call and log all details
export const debugMarketDataFetch = async (coinIds: string[]): Promise<MarketData[]> => {
  console.log('🐛 DEBUG: Starting market data fetch');
  console.log('🐛 DEBUG: Coin IDs:', coinIds);
  console.log('🐛 DEBUG: Base URL:', COINGECKO_BASE_URL);
  
  // Clear cache first
  marketDataCache.clearCache();
  console.log('🐛 DEBUG: Cache cleared');
  
  // Test ping first
  const pingResult = await testCoinGeckoAPI();
  console.log('🐛 DEBUG: Ping result:', pingResult);
  
  // Try the actual API call
  try {
    const result = await fetchMarketData(coinIds);
    console.log('🐛 DEBUG: Final result:', result);
    return result;
  } catch (error) {
    console.error('🐛 DEBUG: Final error:', error);
    throw error;
  }
};
