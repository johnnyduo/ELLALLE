import { useCallback, useEffect, useState } from 'react';

interface WhaleTransaction {
  hash: string;
  timestamp: number;
  amount: number;
  from: string;
  to: string;
  token: string;
  usdValue: number;
}

interface WhaleMetrics {
  totalVolume24h: number;
  uniqueWhales: number;
  avgTradeSize: number;
  marketImpact: number;
  liquidityDepth: number;
  largeTransactions: WhaleTransaction[];
}

interface NetworkStats {
  tps: number;
  avgGasFee: number;
  networkHealth: number;
  congestionLevel: 'low' | 'medium' | 'high';
}

export const useHederaNetwork = () => {
  const [whaleMetrics, setWhaleMetrics] = useState<WhaleMetrics>({
    totalVolume24h: 0,
    uniqueWhales: 0,
    avgTradeSize: 0,
    marketImpact: 0,
    liquidityDepth: 0,
    largeTransactions: []
  });

  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    tps: 0,
    avgGasFee: 0,
    networkHealth: 100,
    congestionLevel: 'low'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWhaleActivity = useCallback(async (tokenSymbol: string = 'HBAR'): Promise<WhaleMetrics | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const mirrorNodeUrl = import.meta.env.VITE_HEDERA_MIRROR_NODE_URL;
      
      // For demo purposes, we'll simulate API calls with realistic data
      // In production, replace with actual Hedera Mirror Node API calls
      
      const mockWhaleData: WhaleMetrics = {
        totalVolume24h: Math.floor(Math.random() * 3500000) + 2000000, // Higher volumes reflecting current market
        uniqueWhales: Math.floor(Math.random() * 25) + 25, // More whale activity
        avgTradeSize: Math.floor(Math.random() * 200000) + 150000, // Larger average trades
        marketImpact: Math.floor(Math.random() * 50) + 20, // Higher impact reflecting current volatility
        liquidityDepth: Math.floor(Math.random() * 25) + 85, // Better liquidity
        largeTransactions: generateMockTransactions()
      };

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      setWhaleMetrics(mockWhaleData);
      return mockWhaleData;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch whale data';
      setError(errorMessage);
      console.error('Hedera Network Error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchNetworkStats = useCallback(async (): Promise<NetworkStats | null> => {
    try {
      const mockNetworkStats: NetworkStats = {
        tps: Math.floor(Math.random() * 8000) + 2000,
        avgGasFee: Math.random() * 0.01 + 0.001,
        networkHealth: Math.floor(Math.random() * 20) + 80,
        congestionLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any
      };

      setNetworkStats(mockNetworkStats);
      return mockNetworkStats;

    } catch (err) {
      console.error('Network stats error:', err);
      return null;
    }
  }, []);

  const generateMockTransactions = (): WhaleTransaction[] => {
    const transactions: WhaleTransaction[] = [];
    const now = Date.now();
    const currentHBARPrice = 0.284; // Current HBAR price ~$0.284

    for (let i = 0; i < 10; i++) {
      const amount = Math.floor(Math.random() * 800000) + 150000; // Larger whale transactions
      transactions.push({
        hash: `0x${Math.random().toString(16).substr(2, 40)}`,
        timestamp: now - (Math.random() * 86400000), // Last 24 hours
        amount,
        from: `0x${Math.random().toString(16).substr(2, 8)}...`,
        to: `0x${Math.random().toString(16).substr(2, 8)}...`,
        token: 'HBAR',
        usdValue: amount * currentHBARPrice
      });
    }

    return transactions.sort((a, b) => b.timestamp - a.timestamp);
  };

  const getWhaleAnalysis = (metrics: WhaleMetrics) => {
    const impact = metrics.marketImpact;
    let analysis = {
      level: 'low' as 'low' | 'medium' | 'high',
      recommendation: '',
      riskLevel: 'low' as 'low' | 'medium' | 'high'
    };

    if (impact > 30) {
      analysis = {
        level: 'high',
        recommendation: 'Use stealth mode for orders >25K HBAR. High whale activity detected.',
        riskLevel: 'high'
      };
    } else if (impact > 15) {
      analysis = {
        level: 'medium',
        recommendation: 'Monitor closely. Consider splitting large orders.',
        riskLevel: 'medium'
      };
    } else {
      analysis = {
        level: 'low',
        recommendation: 'Normal market conditions. Standard trading recommended.',
        riskLevel: 'low'
      };
    }

    return analysis;
  };

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchWhaleActivity();
      fetchNetworkStats();
    }, 30000);

    // Initial fetch
    fetchWhaleActivity();
    fetchNetworkStats();

    return () => clearInterval(interval);
  }, [fetchWhaleActivity, fetchNetworkStats]);

  return {
    whaleMetrics,
    networkStats,
    isLoading,
    error,
    fetchWhaleActivity,
    fetchNetworkStats,
    getWhaleAnalysis,
    clearError: () => setError(null)
  };
};
