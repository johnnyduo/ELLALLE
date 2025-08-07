// CoinGecko API utilities for real market data
import { formatPercentage, formatPrice } from './web3';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// CoinGecko coin IDs mapping
export const COIN_IDS = {
  'BTC/USDT': 'bitcoin',
  'ETH/USDT': 'ethereum',
  'SOL/USDT': 'solana',
  'AVAX/USDT': 'avalanche-2',
  'HBAR/USDT': 'hedera-hashgraph',
  'ADA/USDT': 'cardano',
  'DOT/USDT': 'polkadot',
  'MATIC/USDT': 'matic-network',
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

// Fetch current prices for multiple coins
export const fetchMarketData = async (coinIds: string[]): Promise<MarketData[]> => {
  try {
    const idsString = coinIds.join(',');
    const response = await fetch(
      `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&ids=${idsString}&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch market data');
    }
    
    const data = await response.json();
    
    return data.map((coin: any) => ({
      symbol: getSymbolFromId(coin.id),
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h || 0,
      volume24h: coin.total_volume || 0,
      marketCap: coin.market_cap || 0,
      high24h: coin.high_24h || coin.current_price,
      low24h: coin.low_24h || coin.current_price,
      sparkline: coin.sparkline_in_7d?.price?.slice(-24) || [], // Last 24 hours
    }));
  } catch (error) {
    console.error('Error fetching market data:', error);
    // Return mock data if API fails
    return getMockMarketData();
  }
};

// Fetch historical chart data
export const fetchChartData = async (coinId: string, days: number = 1): Promise<ChartData[]> => {
  try {
    const response = await fetch(
      `${COINGECKO_BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${days <= 1 ? 'hourly' : 'daily'}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch chart data');
    }
    
    const data = await response.json();
    
    return data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      price,
    }));
  } catch (error) {
    console.error('Error fetching chart data:', error);
    // Return mock chart data if API fails
    return getMockChartData();
  }
};

// Get symbol from coin ID
const getSymbolFromId = (coinId: string): string => {
  const entry = Object.entries(COIN_IDS).find(([_, id]) => id === coinId);
  return entry ? entry[0] : coinId.toUpperCase();
};

// Mock data fallback
export const getMockMarketData = (): MarketData[] => [
  {
    symbol: 'BTC/USDT',
    price: 43250.50,
    change24h: 2.34,
    volume24h: 28500000000,
    marketCap: 846000000000,
    high24h: 44100,
    low24h: 42800,
    sparkline: generateSparkline(43250.50, 24),
  },
  {
    symbol: 'ETH/USDT',
    price: 2580.25,
    change24h: -1.45,
    volume24h: 15200000000,
    marketCap: 310000000000,
    high24h: 2650,
    low24h: 2520,
    sparkline: generateSparkline(2580.25, 24),
  },
  {
    symbol: 'SOL/USDT',
    price: 98.75,
    change24h: 5.67,
    volume24h: 2100000000,
    marketCap: 42000000000,
    high24h: 102.50,
    low24h: 93.20,
    sparkline: generateSparkline(98.75, 24),
  },
  {
    symbol: 'HBAR/USDT',
    price: 0.0847,
    change24h: 3.21,
    volume24h: 45000000,
    marketCap: 3200000000,
    high24h: 0.0891,
    low24h: 0.0823,
    sparkline: generateSparkline(0.0847, 24),
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
