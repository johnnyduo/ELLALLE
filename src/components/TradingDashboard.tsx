
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Activity, Shield, Brain, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TradingDashboard = () => {
  const [selectedAsset, setSelectedAsset] = useState('BTC/USDT');
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  
  const assets = [
    { symbol: 'BTC/USDT', price: 43250.50, change: 2.34, volume: '1.2B' },
    { symbol: 'ETH/USDT', price: 2580.25, change: -1.45, volume: '890M' },
    { symbol: 'SOL/USDT', price: 98.75, change: 5.67, volume: '345M' },
    { symbol: 'AVAX/USDT', price: 24.80, change: -0.89, volume: '156M' },
  ];

  const positions = [
    { asset: 'BTC/USDT', side: 'Long', size: '0.5', entry: 42800, pnl: 225.50, pnlPercent: 1.05 },
    { asset: 'ETH/USDT', side: 'Short', size: '2.0', entry: 2620, pnl: -79.50, pnlPercent: -1.52 },
  ];

  const recentTrades = [
    { asset: 'BTC/USDT', side: 'Buy', size: '0.1', price: 43200, time: '14:23:45' },
    { asset: 'SOL/USDT', side: 'Sell', size: '10.0', price: 98.50, time: '14:21:32' },
    { asset: 'ETH/USDT', side: 'Buy', size: '1.5', price: 2575, time: '14:19:18' },
  ];

  return (
    <div className="min-h-screen bg-space-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Trading Dashboard</h1>
            <p className="text-muted-foreground">Real-time perpetual futures trading with privacy</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant={isPrivateMode ? "default" : "outline"}
              className={isPrivateMode ? "btn-stealth" : "btn-glass"}
              onClick={() => setIsPrivateMode(!isPrivateMode)}
            >
              <Shield className="w-4 h-4 mr-2" />
              {isPrivateMode ? 'Private Mode' : 'Public Mode'}
            </Button>
            <Button className="btn-hero">
              <Brain className="w-4 h-4 mr-2" />
              AI Assistant
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Asset List */}
          <div className="lg:col-span-1">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Markets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {assets.map((asset) => (
                  <div 
                    key={asset.symbol}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                      selectedAsset === asset.symbol 
                        ? 'bg-neon-purple/20 border border-neon-purple/40' 
                        : 'hover:bg-white/5'
                    } ${isPrivateMode ? 'privacy-blur' : ''}`}
                    onClick={() => setSelectedAsset(asset.symbol)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold">{asset.symbol}</span>
                      {asset.change >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-profit" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-loss" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${asset.price.toLocaleString()}
                    </div>
                    <div className={`text-sm font-medium ${
                      asset.change >= 0 ? 'text-profit' : 'text-loss'
                    }`}>
                      {asset.change >= 0 ? '+' : ''}{asset.change}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Vol: {asset.volume}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Trading Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Chart Placeholder */}
            <Card className="card-glass">
              <CardContent className="p-6">
                <div className="h-80 bg-gradient-to-br from-space-700/50 to-space-800/50 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 via-transparent to-neon-blue/10" />
                  <div className="text-center z-10">
                    <Activity className="w-16 h-16 text-neon-purple/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold gradient-text mb-2">{selectedAsset} Chart</h3>
                    <p className="text-muted-foreground">Interactive TradingView chart would be integrated here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Panel and Positions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Panel */}
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Target className="w-5 h-5 mr-2 text-neon-purple" />
                    Place Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button className="btn-glass text-profit">Long</Button>
                    <Button variant="outline" className="hover:bg-loss/10">Short</Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">
                        Size
                      </label>
                      <div className="glass rounded-lg p-3">
                        <div className={`text-lg font-semibold ${isPrivateMode ? 'privacy-blur' : ''}`}>
                          0.25 BTC
                        </div>
                        <div className="text-sm text-muted-foreground">≈ $10,812.50</div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">
                        Leverage
                      </label>
                      <div className="glass rounded-lg p-3">
                        <div className="text-lg font-semibold text-neon-orange">10x</div>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full btn-hero">
                    Place Long Order
                  </Button>
                </CardContent>
              </Card>

              {/* Open Positions */}
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Open Positions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {positions.map((position, index) => (
                      <div key={index} className={`card-trading ${isPrivateMode ? 'privacy-blur' : ''}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">{position.asset}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              position.side === 'Long' 
                                ? 'bg-profit/20 text-profit' 
                                : 'bg-loss/20 text-loss'
                            }`}>
                              {position.side}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${
                              position.pnl >= 0 ? 'text-profit' : 'text-loss'
                            }`}>
                              {position.pnl >= 0 ? '+' : ''}${position.pnl}
                            </div>
                            <div className={`text-xs ${
                              position.pnlPercent >= 0 ? 'text-profit' : 'text-loss'
                            }`}>
                              {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent}%
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Size: {position.size}</span>
                          <span>Entry: ${position.entry}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Trades */}
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Trades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentTrades.map((trade, index) => (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors ${isPrivateMode ? 'privacy-blur' : ''}`}>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          trade.side === 'Buy' 
                            ? 'bg-profit/20 text-profit' 
                            : 'bg-loss/20 text-loss'
                        }`}>
                          {trade.side}
                        </span>
                        <span className="font-medium">{trade.asset}</span>
                        <span className="text-muted-foreground">Size: {trade.size}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${trade.price.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{trade.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;
