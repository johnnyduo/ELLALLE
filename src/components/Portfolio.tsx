
import React, { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, PieChart, BarChart3, Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const Portfolio = () => {
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

  const portfolioValue = 125420.50;
  const portfolioChange = 2847.25;
  const portfolioChangePercent = 2.32;

  const assets = [
    { symbol: 'BTC', name: 'Bitcoin', amount: 2.5, value: 108125.75, change: 3.45, allocation: 45 },
    { symbol: 'ETH', name: 'Ethereum', value: 38640.20, change: -1.23, allocation: 28 },
    { symbol: 'SOL', name: 'Solana', value: 9875.30, change: 5.67, allocation: 12 },
    { symbol: 'USDT', name: 'Tether', value: 18780.00, change: 0.01, allocation: 15 },
  ];

  const positions = [
    { 
      asset: 'BTC/USDT', 
      type: 'Long', 
      size: '1.2 BTC', 
      entry: 42500, 
      mark: 43250, 
      pnl: 900.50, 
      pnlPercent: 1.76,
      margin: 8500
    },
    { 
      asset: 'ETH/USDT', 
      type: 'Short', 
      size: '5.0 ETH', 
      entry: 2620, 
      mark: 2580, 
      pnl: 200.75, 
      pnlPercent: 1.53,
      margin: 2620
    }
  ];

  const performance = [
    { period: '1D', pnl: 847.25, percent: 0.68 },
    { period: '1W', pnl: 2450.80, percent: 1.99 },
    { period: '1M', pnl: 12350.40, percent: 10.94 },
    { period: '3M', pnl: 18750.20, percent: 17.57 }
  ];

  const timeframes = ['1h', '24h', '7d', '30d'];

  return (
    <div className="min-h-screen bg-space-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Portfolio Overview</h1>
            <p className="text-muted-foreground">Track your DeFi assets and perpetual positions</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant={isPrivateMode ? "default" : "outline"}
              className={isPrivateMode ? "btn-stealth" : "btn-glass"}
              onClick={() => setIsPrivateMode(!isPrivateMode)}
            >
              {isPrivateMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {isPrivateMode ? 'Private' : 'Public'}
            </Button>
            
            <div className="flex bg-space-700/50 rounded-lg p-1">
              {timeframes.map((timeframe) => (
                <Button
                  key={timeframe}
                  variant="ghost"
                  size="sm"
                  className={`px-3 py-1 rounded-md text-sm ${
                    selectedTimeframe === timeframe
                      ? 'bg-neon-purple/20 text-neon-purple'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setSelectedTimeframe(timeframe)}
                >
                  {timeframe}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-glass hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Wallet className="w-8 h-8 text-neon-purple" />
                <Shield className={`w-5 h-5 ${isPrivateMode ? 'text-neon-purple' : 'text-muted-foreground'}`} />
              </div>
              <div className={`text-2xl font-bold mb-1 ${isPrivateMode ? 'privacy-blur' : ''}`}>
                ${portfolioValue.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Portfolio Value</div>
            </CardContent>
          </Card>

          <Card className="card-glass hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                {portfolioChangePercent >= 0 ? (
                  <TrendingUp className="w-8 h-8 text-profit" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-loss" />
                )}
              </div>
              <div className={`text-2xl font-bold mb-1 ${
                portfolioChangePercent >= 0 ? 'text-profit' : 'text-loss'
              } ${isPrivateMode ? 'privacy-blur' : ''}`}>
                {portfolioChangePercent >= 0 ? '+' : ''}${portfolioChange.toLocaleString()}
              </div>
              <div className={`text-sm font-medium ${
                portfolioChangePercent >= 0 ? 'text-profit' : 'text-loss'
              }`}>
                {portfolioChangePercent >= 0 ? '+' : ''}{portfolioChangePercent}% ({selectedTimeframe})
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <PieChart className="w-8 h-8 text-neon-blue" />
              </div>
              <div className={`text-2xl font-bold mb-1 ${isPrivateMode ? 'privacy-blur' : ''}`}>
                {assets.length}
              </div>
              <div className="text-sm text-muted-foreground">Assets Held</div>
            </CardContent>
          </Card>

          <Card className="card-glass hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-8 h-8 text-neon-green" />
              </div>
              <div className={`text-2xl font-bold mb-1 ${isPrivateMode ? 'privacy-blur' : ''}`}>
                {positions.length}
              </div>
              <div className="text-sm text-muted-foreground">Open Positions</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assets Breakdown */}
          <div className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Wallet className="w-5 h-5 mr-2 text-neon-purple" />
                  Asset Allocation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {assets.map((asset, index) => (
                  <div key={asset.symbol} className={`card-trading ${isPrivateMode ? 'privacy-blur' : ''}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {asset.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold">{asset.symbol}</div>
                          <div className="text-xs text-muted-foreground">{asset.name}</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold">${asset.value.toLocaleString()}</div>
                        <div className={`text-sm font-medium ${
                          asset.change >= 0 ? 'text-profit' : 'text-loss'
                        }`}>
                          {asset.change >= 0 ? '+' : ''}{asset.change}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Allocation</span>
                        <span>{asset.allocation}%</span>
                      </div>
                      <Progress value={asset.allocation} className="h-2" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance History */}
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Performance History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {performance.map((perf, index) => (
                    <div key={perf.period} className={`card-trading text-center ${isPrivateMode ? 'privacy-blur' : ''}`}>
                      <div className="text-sm text-muted-foreground mb-1">{perf.period}</div>
                      <div className={`text-lg font-bold ${
                        perf.percent >= 0 ? 'text-profit' : 'text-loss'
                      }`}>
                        {perf.percent >= 0 ? '+' : ''}${perf.pnl.toLocaleString()}
                      </div>
                      <div className={`text-xs ${
                        perf.percent >= 0 ? 'text-profit' : 'text-loss'
                      }`}>
                        {perf.percent >= 0 ? '+' : ''}{perf.percent}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Open Positions */}
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-neon-green" />
                Open Positions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {positions.map((position, index) => (
                <div key={index} className={`card-trading ${isPrivateMode ? 'privacy-blur' : ''}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold">{position.asset}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        position.type === 'Long' 
                          ? 'bg-profit/20 text-profit' 
                          : 'bg-loss/20 text-loss'
                      }`}>
                        {position.type}
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-semibold ${
                        position.pnl >= 0 ? 'text-profit' : 'text-loss'
                      }`}>
                        {position.pnl >= 0 ? '+' : ''}${position.pnl}
                      </div>
                      <div className={`text-sm ${
                        position.pnlPercent >= 0 ? 'text-profit' : 'text-loss'
                      }`}>
                        {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span>{position.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entry:</span>
                      <span>${position.entry.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mark:</span>
                      <span>${position.mark.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Margin:</span>
                      <span>${position.margin.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <Button size="sm" className="flex-1 btn-glass">
                      Close
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}

              <Button className="w-full btn-hero mt-4">
                <TrendingUp className="w-4 h-4 mr-2" />
                Open New Position
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
