import { marketDataCache } from '@/lib/cache/marketDataCache';
import {
    ChartData,
    COIN_IDS,
    fetchChartData,
    fetchMarketData,
    getMockMarketData,
    MarketData,
    refreshChartDataInBackground,
    refreshMarketDataInBackground
} from '@/lib/coingecko';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseMarketDataReturn {
  marketData: MarketData[];
  chartData: ChartData[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  setSelectedSymbol: (symbol: string) => void;
  selectedSymbol: string;
}

export const useMarketData = (initialSymbol: string = 'BTC/USDC'): UseMarketDataReturn => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);
  
  // Use refs to track intervals and prevent memory leaks
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundRefreshRef = useRef<NodeJS.Timeout | null>(null);

  const refreshData = useCallback(async (force: boolean = false) => {
    try {
      if (!force) {
        // Check if we have cached data first to show immediately
        const coinIds = Object.values(COIN_IDS);
        const cachedMarketData = marketDataCache.getMarketData(coinIds);
        const selectedCoinId = COIN_IDS[selectedSymbol as keyof typeof COIN_IDS];
        const cachedChartData = selectedCoinId ? marketDataCache.getChartData(selectedCoinId, 1) : null;
        
        if (cachedMarketData) {
          setMarketData(cachedMarketData);
          setLoading(false);
        }
        
        if (cachedChartData) {
          setChartData(cachedChartData);
        }
        
        // If we have both cached data, no need to show loading
        if (cachedMarketData && cachedChartData) {
          setError(null);
          return;
        }
      }

      setLoading(true);
      setError(null);

      // Fetch market data for all coins
      const coinIds = Object.values(COIN_IDS);
      const markets = await fetchMarketData(coinIds);
      setMarketData(markets);

      // Fetch chart data for selected symbol
      const selectedCoinId = COIN_IDS[selectedSymbol as keyof typeof COIN_IDS];
      if (selectedCoinId) {
        const chart = await fetchChartData(selectedCoinId, 1); // 1 day
        setChartData(chart);
      }
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch market data');
      
      // Fallback to mock data
      setMarketData(getMockMarketData());
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSymbol]);

  // Fetch chart data when selected symbol changes
  const updateChartData = useCallback(async (symbol: string) => {
    try {
      const coinId = COIN_IDS[symbol as keyof typeof COIN_IDS];
      if (coinId) {
        // Check cache first
        const cachedChart = marketDataCache.getChartData(coinId, 1);
        if (cachedChart) {
          setChartData(cachedChart);
          return;
        }
        
        // Fetch fresh data if not in cache
        const chart = await fetchChartData(coinId, 1);
        setChartData(chart);
      }
    } catch (err) {
      console.error('Error fetching chart data:', err);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Update chart when symbol changes
  useEffect(() => {
    if (!loading && selectedSymbol) {
      updateChartData(selectedSymbol);
    }
  }, [selectedSymbol, loading, updateChartData]);

  // Optimized refresh strategy with background updates
  useEffect(() => {
    // Clear existing intervals
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    if (backgroundRefreshRef.current) {
      clearInterval(backgroundRefreshRef.current);
    }

    // Main refresh interval - less frequent but forces fresh data
    refreshIntervalRef.current = setInterval(() => {
      refreshData(true); // Force refresh
    }, 60000); // Every minute

    // Background refresh - more frequent but uses cache-aware logic
    backgroundRefreshRef.current = setInterval(async () => {
      const coinIds = Object.values(COIN_IDS);
      const selectedCoinId = COIN_IDS[selectedSymbol as keyof typeof COIN_IDS];
      
      // Background refresh market data if needed
      await refreshMarketDataInBackground(coinIds);
      
      // Background refresh chart data if needed
      if (selectedCoinId) {
        await refreshChartDataInBackground(selectedCoinId, 1);
      }
      
      // Update state if new data is available in cache
      const newMarketData = marketDataCache.getMarketData(coinIds);
      const newChartData = selectedCoinId ? marketDataCache.getChartData(selectedCoinId, 1) : null;
      
      if (newMarketData) {
        setMarketData(newMarketData);
      }
      if (newChartData) {
        setChartData(newChartData);
      }
    }, 15000); // Every 15 seconds

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (backgroundRefreshRef.current) {
        clearInterval(backgroundRefreshRef.current);
      }
    };
  }, [selectedSymbol, refreshData]);

  return {
    marketData,
    chartData,
    loading,
    error,
    refreshData: () => refreshData(true), // Always force refresh when manually called
    setSelectedSymbol,
    selectedSymbol,
  };
};
