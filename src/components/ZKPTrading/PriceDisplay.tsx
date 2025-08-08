import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TRADING_PAIRS } from '@/hooks/zkp/useNoirProof';
import { usePythOracle } from '@/hooks/zkp/usePythOracle';
import { RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';

export const PriceDisplay: React.FC = () => {
  const { prices, updatePrices, loading } = usePythOracle();

  const formatPrice = (price: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(price);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            📊 Live Prices
            <Badge variant="outline">Pyth Oracle</Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={updatePrices}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TRADING_PAIRS.map((pair) => {
            const priceData = prices[pair.name];
            
            if (!priceData) {
              return (
                <div key={pair.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{pair.symbol}</Badge>
                    <div className="h-2 w-2 bg-gray-300 rounded-full" />
                  </div>
                  <div className="text-lg font-mono">Loading...</div>
                  <div className="text-xs text-muted-foreground">{pair.name}</div>
                </div>
              );
            }

            // Calculate mock price change (for demo)
            const changePercent = (Math.random() - 0.5) * 10; // Random ±5%
            const isPositive = changePercent > 0;

            return (
              <div key={pair.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{pair.symbol}</Badge>
                  <div className={`h-2 w-2 rounded-full ${
                    isPositive ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                </div>
                
                <div className="text-lg font-mono mb-1">
                  {formatPrice(priceData.price, pair.symbol === 'HBAR' ? 4 : 2)}
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className={`flex items-center gap-1 ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(changePercent).toFixed(2)}%
                  </div>
                  
                  <div className="text-muted-foreground">
                    {formatTime(priceData.publishTime)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground text-center">
          Powered by Pyth Network • Updated every 10 seconds
        </div>
      </CardContent>
    </Card>
  );
};
