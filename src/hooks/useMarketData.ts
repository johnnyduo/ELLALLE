import {
    ChartData,
    COIN_IDS,
    fetchChartData,
    fetchMarketData,
    getMockMarketData,
    MarketData
} from '@/lib/coingecko';
import { useCallback, useEffect, useState } from 'react';

export interface UseMarketDataReturn {
  marketData: MarketData[];
  chartData: ChartData[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  setSelectedSymbol: (symbol: string) => void;
  selectedSymbol: string;
}

export const useMarketData = (initialSymbol: string = 'BTC/USDT'): UseMarketDataReturn => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);

  const refreshData = useCallback(async () => {
    try {
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

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshData]);

  return {
    marketData,
    chartData,
    loading,
    error,
    refreshData,
    setSelectedSymbol,
    selectedSymbol,
  };
};
