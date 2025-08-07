import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const basePrice = currentPrice || (symbol === 'BTC' ? 43250 : symbol === 'ETH' ? 2580 : 180);
  const data: ChartData[] = [];
  const now = Date.now();
  
  for (let i = days; i >= 0; i--) {
    const timestamp = now - (i * 24 * 60 * 60 * 1000);
    const volatility = 0.05; // 5% daily volatility
    const trend = (Math.random() - 0.5) * volatility;
    const price = basePrice * (1 + trend + Math.sin(i / 7) * 0.02);
    
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
    
    if (chartData.length > 0) {
      const latest = chartData[chartData.length - 1];
      const previous = chartData.length > 1 ? chartData[chartData.length - 2] : chartData[0];
      
      setRealTimePrice(latest.price);
      setPriceChange(latest.price - previous.price);
      setPriceChangePercent(((latest.price - previous.price) / previous.price) * 100);
    }
  }, [externalData, symbol, currentPrice]);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (data.length === 0) return;
      
      setData(prevData => {
        const lastPoint = prevData[prevData.length - 1];
        const volatility = 0.002; // 0.2% volatility per update
        const change = (Math.random() - 0.5) * volatility;
        const newPrice = lastPoint.price * (1 + change);
        
        const newPoint: ChartData = {
          ...lastPoint,
          timestamp: Date.now(),
          price: Number(newPrice.toFixed(2)),
          close: Number(newPrice.toFixed(2)),
        };
        
        setRealTimePrice(newPoint.price);
        setPriceChange(newPoint.price - lastPoint.price);
        setPriceChangePercent(((newPoint.price - lastPoint.price) / lastPoint.price) * 100);
        
        // Keep last 100 points for real-time chart
        const newData = [...prevData.slice(-99), newPoint];
        return newData;
      });
    }, 2000); // Update every 2 seconds
    
    return () => clearInterval(interval);
  }, [data.length]);

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
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
        <div className={`h-96 ${isPrivateMode ? 'relative' : ''}`}>
          {/* Privacy Overlay */}
          {isPrivateMode && (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-purple-600/10 backdrop-blur-sm z-10 rounded-lg border border-purple-500/30">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <Shield className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-purple-300 font-medium">ZKP Protected View</div>
                <div className="text-purple-400 text-sm">Trading data encrypted with zero-knowledge proofs</div>
              </div>
            </div>
          )}

          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  domain={['dataMin - 100', 'dataMax + 100']}
                  tickFormatter={(value) => `$${value}`}
                  stroke="#9CA3AF"
                  fontSize={12}
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
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  stroke="#9CA3AF"
                  fontSize={12}
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
                />
                <YAxis 
                  domain={['dataMin - 100', 'dataMax + 100']}
                  tickFormatter={(value) => `$${value}`}
                  stroke="#9CA3AF"
                  fontSize={12}
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
