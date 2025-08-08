import { useCallback, useEffect, useState } from 'react';

// Pyth price feed IDs for Hedera testnet
export const PYTH_PRICE_FEEDS = {
  'HBAR/USD': '0x5c2d9bb08fa82ee8ae4b8eec3fa12b05885db9ad9a7e1c8a0b698c8e53b0b5f1',
  'BTC/USD': '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  'ETH/USD': '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  'SOL/USD': '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d'
};

interface PriceData {
  price: number;
  confidence: number;
  publishTime: number;
  expo: number;
}

interface UsePythOracleReturn {
  prices: Record<string, PriceData>;
  getPairPrice: (pairId: number) => number;
  updatePrices: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const usePythOracle = (): UsePythOracleReturn => {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock price data for demo (replace with real Pyth integration)
  const mockPrices = {
    'HBAR/USD': { price: 0.0842, confidence: 0.0001, publishTime: Date.now(), expo: -4 },
    'BTC/USD': { price: 43250.75, confidence: 12.5, publishTime: Date.now(), expo: -2 },
    'ETH/USD': { price: 2345.80, confidence: 1.2, publishTime: Date.now(), expo: -2 },
    'SOL/USD': { price: 98.45, confidence: 0.15, publishTime: Date.now(), expo: -2 }
  };

  // Update prices from Pyth network
  const updatePrices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // For demo, simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Add some random variation to mock prices
      const updatedPrices = Object.entries(mockPrices).reduce((acc, [pair, basePrice]) => {
        const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
        const newPrice = basePrice.price * (1 + variation);
        
        acc[pair] = {
          ...basePrice,
          price: newPrice,
          publishTime: Date.now()
        };
        
        return acc;
      }, {} as Record<string, PriceData>);

      setPrices(updatedPrices);
      // console.log('📊 Prices updated:', updatedPrices);

    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update prices';
      console.error('❌ Price update error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get price for specific trading pair
  const getPairPrice = useCallback((pairId: number): number => {
    const pairNames = ['HBAR/USD', 'BTC/USD', 'ETH/USD', 'SOL/USD'];
    const pairName = pairNames[pairId];
    
    if (!pairName || !prices[pairName]) {
      return 0;
    }
    
    return prices[pairName].price;
  }, [prices]);

  // Auto-update prices every 10 seconds
  useEffect(() => {
    updatePrices(); // Initial load
    
    const interval = setInterval(updatePrices, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, [updatePrices]);

  return {
    prices,
    getPairPrice,
    updatePrices,
    loading,
    error
  };
};

// Real Pyth oracle integration (for future use)
export const connectToPythOracle = async () => {
  // This would connect to actual Pyth oracle on Hedera
  // For now, return mock connection
  return {
    connected: true,
    endpoint: 'wss://hermes.pyth.network/ws'
  };
};
