import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/web3';
import { Activity, Lock, Shield, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ChartData {
  timestamp: number;
  price: number;
  volume?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

interface InteractiveChartProps {
  symbol: string;
  isPrivateMode: boolean;
  currentPrice: number;
  data?: ChartData[];
}

// Generate realistic price data for demo
const generatePriceData = (symbol: string, currentPrice: number, days: number = 30): ChartData[] => {
  // Use actual current price if available, otherwise fallback to realistic defaults
  let basePrice = currentPrice;
  
  // Only use fallback prices if currentPrice is 0 or invalid
  if (!basePrice || basePrice <= 0) {
    const fallbackPrices: { [key: string]: number } = {
      'BTC': 116000,  // Updated to realistic current BTC price
      'ETH': 3800,    // Updated to realistic current ETH price  
      'SOL': 172,     // Updated to realistic current SOL price
      'AVAX': 22,     // Updated to realistic current AVAX price
      'HBAR': 0.25,   // Updated to realistic current HBAR price
      'ADA': 0.78,    // Updated to realistic current ADA price
      'DOT': 3.79,    // Updated to realistic current DOT price
      'MATIC': 0.29,  // Updated to realistic current MATIC price
    };
    
    const symbolKey = symbol.split('/')[0]; // Extract base symbol (e.g., 'BTC' from 'BTC/USDC')
    basePrice = fallbackPrices[symbolKey] || 180;
  }
  
  const data: ChartData[] = [];
  const now = Date.now();
  
  // Reduce volatility for more stable chart data
  const volatility = 0.02; // 2% daily volatility instead of 5%
  
  for (let i = days; i >= 0; i--) {
    const timestamp = now - (i * 24 * 60 * 60 * 1000);
    const trend = (Math.random() - 0.5) * volatility;
    const seasonalVariation = Math.sin(i / 7) * 0.01; // 1% seasonal variation instead of 2%
    const price = basePrice * (1 + trend + seasonalVariation);
    
    data.push({
      timestamp,
      price: Number(price.toFixed(2)),
      volume: Math.random() * 1000000 + 500000,
      open: Number((price * 0.995).toFixed(2)),
      high: Number((price * 1.02).toFixed(2)),
      low: Number((price * 0.98).toFixed(2)),
      close: Number(price.toFixed(2)),
    });
  }
  
  return data;
};

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  symbol,
  isPrivateMode,
  currentPrice,
  data: externalData
}) => {
  const [timeframe, setTimeframe] = useState('1D');
  const [chartType, setChartType] = useState<'line' | 'volume'>('line');
  const [showZKPIndicator, setShowZKPIndicator] = useState(false);
  const [data, setData] = useState<ChartData[]>([]);
  const [realTimePrice, setRealTimePrice] = useState<number>(currentPrice);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);

  // Initialize data
  useEffect(() => {
    console.log(`🎯 Initializing chart data for ${symbol}:`, {
      hasExternalData: externalData && externalData.length > 0,
      currentPrice,
      externalDataLength: externalData?.length || 0
    });
    
    const chartData = externalData && externalData.length > 0 
      ? externalData.map(d => ({
          ...d,
          volume: d.volume || Math.random() * 1000000 + 500000,
          open: d.open || d.price * 0.995,
          high: d.high || d.price * 1.02,
          low: d.low || d.price * 0.98,
          close: d.close || d.price,
        })) 
      : generatePriceData(symbol, currentPrice, 30);
    
    setData(chartData);
    
    // Use the actual current price from market data, not chart data
    setRealTimePrice(currentPrice);
    
    if (chartData.length > 1) {
      const latest = chartData[chartData.length - 1];
      const previous = chartData[chartData.length - 2];
      
      // Calculate change based on current price vs previous chart point
      setPriceChange(currentPrice - previous.price);
      setPriceChangePercent(((currentPrice - previous.price) / previous.price) * 100);
    }
    
    console.log(`📊 Chart data initialized with ${chartData.length} points, latest price: $${currentPrice}`);
  }, [externalData, symbol, currentPrice]);

  // Sync with current price updates (when market data refreshes)
  useEffect(() => {
    setRealTimePrice(currentPrice);
    
    // Update the latest chart point to match current price
    if (data.length > 0) {
      setData(prevData => {
        const newData = [...prevData];
        const lastIndex = newData.length - 1;
        
        // Update the last point to match current market price
        newData[lastIndex] = {
          ...newData[lastIndex],
          price: currentPrice,
          close: currentPrice,
        };
        
        return newData;
      });
      
      // Calculate price change based on current price vs previous point
      // Use a more stable calculation to prevent big jumps
      if (data.length > 1) {
        const previous = data[data.length - 2];
        const change = currentPrice - previous.price;
        const changePercent = previous.price > 0 ? ((change / previous.price) * 100) : 0;
        
        // Cap extreme changes to prevent UI jumps (max ±25% change)
        const cappedChange = Math.max(-previous.price * 0.25, Math.min(previous.price * 0.25, change));
        const cappedChangePercent = Math.max(-25, Math.min(25, changePercent));
        
        setPriceChange(cappedChange);
        setPriceChangePercent(cappedChangePercent);
      }
    }
  }, [currentPrice]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    
    // Format based on selected timeframe
    switch (timeframe) {
      case '5M':
      case '1H':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '1D':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      case '1W':
      case '1M':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      default:
        // Fallback: show time for recent data, date for older data
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays < 7) {
          return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
        } else {
          return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    }
  };

  const formatYAxisPrice = (value: number, symbol: string = '') => {
    // Handle different price ranges for different trading pairs
    if (value >= 10000) {
      // BTC range: $10K - $100K+
      return `$${(value / 1000).toFixed(0)}K`;
    } else if (value >= 1000) {
      // ETH range: $1K - $10K  
      return `$${(value / 1000).toFixed(1)}K`;
    } else if (value >= 100) {
      // SOL, AVAX range: $100 - $1000
      return `$${value.toFixed(0)}`;
    } else if (value >= 10) {
      // DOT range: $10 - $100
      return `$${value.toFixed(1)}`;
    } else if (value >= 1) {
      // ADA, MATIC range: $1 - $10
      return `$${value.toFixed(2)}`;
    } else if (value >= 0.1) {
      // HBAR range: $0.1 - $1
      return `$${value.toFixed(3)}`;
    } else if (value >= 0.01) {
      // Small coins: $0.01 - $0.1
      return `$${value.toFixed(4)}`;
    } else if (value >= 0.001) {
      // Very small coins: $0.001 - $0.01
      return `$${value.toFixed(5)}`;
    } else {
      // Micro coins: < $0.001
      return `$${value.toFixed(6)}`;
    }
  };

  // Wrapper for recharts tick formatter
  const priceTickFormatter = (value: any) => formatYAxisPrice(value, symbol);

  const calculateYAxisDomain = (data: ChartData[], chartType: string, symbol: string = '') => {
    if (chartType === 'volume') return ['auto', 'auto'];
    
    if (data.length === 0) return ['auto', 'auto'];
    
    const prices = data.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    
    // Dynamic padding based on price range and symbol
    let paddingPercent = 0.02; // Default 2%
    
    // Adjust padding based on price level for better visualization
    if (maxPrice >= 10000) {
      // BTC: larger padding for high-value assets
      paddingPercent = 0.03;
    } else if (maxPrice < 1) {
      // HBAR, small coins: smaller padding for precision
      paddingPercent = 0.05;
    } else if (priceRange / maxPrice < 0.01) {
      // Very stable price: increase padding for visibility
      paddingPercent = 0.1;
    }
    
    const padding = priceRange * paddingPercent;
    const paddedMin = Math.max(0, minPrice - padding);
    const paddedMax = maxPrice + padding;
    
    // Return numbers, not strings, so Recharts can properly calculate ticks
    return [paddedMin, paddedMax];
  };

  const getOptimalTickCount = (symbol: string, priceRange: number) => {
    // Adjust tick count based on symbol and price range
    if (symbol.includes('BTC')) {
      return 6; // More ticks for BTC's large range
    } else if (symbol.includes('HBAR') || priceRange < 1) {
      return 5; // Fewer ticks for small price ranges
    } else {
      return 6; // Standard tick count
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-purple-500/50 rounded-lg p-3 text-white text-sm">
          <p className="text-gray-300">{formatTime(label)}</p>
          <p className="text-green-400">
            Price: {formatPrice(payload[0].value)}
          </p>
          {payload[1] && (
            <p className="text-blue-400">
              Volume: {(payload[1].value / 1000).toFixed(0)}K
            </p>
          )}
          {isPrivateMode && (
            <div className="flex items-center mt-2 text-purple-400">
              <Shield className="w-3 h-3 mr-1" />
              <span className="text-xs">ZKP Protected</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="card-glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-neon-purple" />
              <span>{symbol} Perpetual</span>
              {isPrivateMode && (
                <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/50">
                  <Shield className="w-3 h-3 mr-1" />
                  ZKP
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">{formatPrice(realTimePrice)}</span>
              <div className={`flex items-center space-x-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="font-medium">
                  {priceChange >= 0 ? '+' : ''}{formatPrice(Math.abs(priceChange)).replace('$', '')} ({priceChangePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Chart Type Selector */}
            <div className="flex items-center space-x-1 bg-gray-800/50 rounded-lg p-1">
              <Button
                variant={chartType === 'line' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('line')}
                className="text-xs px-2 py-1"
              >
                Line
              </Button>
              <Button
                variant={chartType === 'volume' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('volume')}
                className="text-xs px-2 py-1"
              >
                Volume
              </Button>
            </div>

            {/* ZKP Indicator */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowZKPIndicator(!showZKPIndicator)}
              className="text-purple-400 hover:text-purple-300"
            >
              <Zap className="w-4 h-4 mr-1" />
              ZK Proof
            </Button>
          </div>
        </div>

        {/* ZKP Status Indicator */}
        {showZKPIndicator && (
          <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300">Zero-Knowledge Proof Status</span>
              </div>
              <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/50">
                Active
              </Badge>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Your trading positions and order book interactions are cryptographically protected using ZKP technology.
              Trade amounts, positions, and PnL are hidden from public view while maintaining verifiable execution.
            </div>
          </div>
        )}

        {/* Chart Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex space-x-2">
            {['5M', '1H', '1D', '1W', '1M'].map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe(tf)}
                className={timeframe === tf ? "btn-hero" : "glass"}
              >
                {tf}
              </Button>
            ))}
          </div>

          <div className="flex space-x-2">
            {(['line', 'volume'] as const).map((type) => (
              <Button
                key={type}
                variant={chartType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType(type)}
                className={chartType === type ? "btn-hero" : "glass"}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-96 min-h-[384px]">
          <ResponsiveContainer width="100%" height="100%" minHeight={350}>
            {chartType === 'line' ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  stroke="#9CA3AF"
                  fontSize={12}
                  tick={{ fill: '#9CA3AF' }}
                  axisLine={{ stroke: '#4B5563' }}
                  tickLine={{ stroke: '#4B5563' }}
                  interval="preserveStartEnd"
                  minTickGap={50}
                />
                <YAxis 
                  domain={calculateYAxisDomain(data, 'line', symbol)}
                  tickFormatter={priceTickFormatter}
                  stroke="#9CA3AF"
                  fontSize={12}
                  tick={{ fill: '#9CA3AF' }}
                  axisLine={{ stroke: '#4B5563' }}
                  tickLine={{ stroke: '#4B5563' }}
                  width={70}
                  tickCount={6}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#8b5cf6' }}
                />
              </LineChart>
            ) : chartType === 'volume' ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  stroke="#9CA3AF"
                  fontSize={12}
                  tick={{ fill: '#9CA3AF' }}
                  axisLine={{ stroke: '#4B5563' }}
                  tickLine={{ stroke: '#4B5563' }}
                  interval="preserveStartEnd"
                  minTickGap={50}
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  stroke="#9CA3AF"
                  fontSize={12}
                  tick={{ fill: '#9CA3AF' }}
                  axisLine={{ stroke: '#4B5563' }}
                  tickLine={{ stroke: '#4B5563' }}
                  width={70}
                  tickCount={5}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="volume" fill="#06b6d4" opacity={0.7} />
              </BarChart>
            ) : (
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  stroke="#9CA3AF"
                  fontSize={12}
                  tick={{ fill: '#9CA3AF' }}
                  axisLine={{ stroke: '#4B5563' }}
                  tickLine={{ stroke: '#4B5563' }}
                  interval="preserveStartEnd"
                  minTickGap={50}
                />
                <YAxis 
                  domain={calculateYAxisDomain(data, 'area', symbol)}
                  tickFormatter={priceTickFormatter}
                  stroke="#9CA3AF"
                  fontSize={12}
                  tick={{ fill: '#9CA3AF' }}
                  axisLine={{ stroke: '#4B5563' }}
                  tickLine={{ stroke: '#4B5563' }}
                  width={70}
                  tickCount={6}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#8b5cf6" 
                  fill="url(#gradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Chart Footer with ZKP Info */}
        {isPrivateMode && (
          <div className="mt-4 p-2 bg-purple-500/5 border border-purple-500/20 rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-purple-400">
                <Lock className="w-3 h-3" />
                <span>Private trading mode enabled</span>
              </div>
              <div className="text-gray-500">
                Order flow hidden • Position sizes encrypted • PnL protected
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InteractiveChart;
