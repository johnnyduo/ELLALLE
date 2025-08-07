
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MiniChart, SparklineChart } from '@/components/ui/chart-mini';
import { useMarketData } from '@/hooks/useMarketData';
import { formatMarketData } from '@/lib/coingecko';
import { Activity, BarChart3, Brain, RefreshCw, Shield, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const TradingDashboard = () => {
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const {
    marketData,
    chartData,
    loading,
    error,
    refreshData,
    setSelectedSymbol,
    selectedSymbol,
  } = useMarketData('BTC/USDT');

  // Get current selected asset data
  const selectedAsset = marketData.find(asset => asset.symbol === selectedSymbol) || marketData[0];
  
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
              variant="outline"
              className="btn-glass"
              onClick={refreshData}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
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
                {error && (
                  <div className="text-center p-4 text-red-400 bg-red-500/10 rounded-lg">
                    <p className="text-sm">{error}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={refreshData}
                      className="mt-2"
                    >
                      Retry
                    </Button>
                  </div>
                )}
                
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-white/5 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  marketData.map((asset) => {
                    const formatted = formatMarketData(asset);
                    return (
                      <div 
                        key={asset.symbol}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                          selectedSymbol === asset.symbol 
                            ? 'bg-neon-purple/20 border border-neon-purple/40' 
                            : 'hover:bg-white/5'
                        } ${isPrivateMode ? 'privacy-blur' : ''}`}
                        onClick={() => setSelectedSymbol(asset.symbol)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">{asset.symbol}</span>
                            {asset.change24h >= 0 ? (
                              <TrendingUp className="w-4 h-4 text-profit" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-loss" />
                            )}
                          </div>
                          <div className="w-12">
                            <SparklineChart 
                              data={asset.sparkline || []} 
                              width={48} 
                              height={16}
                            />
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground mb-1">
                          {formatted.formattedPrice}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className={`text-sm font-medium ${
                            asset.change24h >= 0 ? 'text-profit' : 'text-loss'
                          }`}>
                            {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatted.formattedVolume}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Trading Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Chart */}
            <Card className="card-glass">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-neon-purple" />
                    {selectedSymbol} Chart
                  </CardTitle>
                  {selectedAsset && (
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {formatMarketData(selectedAsset).formattedPrice}
                      </div>
                      <div className={`text-sm font-medium ${
                        selectedAsset.change24h >= 0 ? 'text-profit' : 'text-loss'
                      }`}>
                        {selectedAsset.change24h >= 0 ? '+' : ''}{selectedAsset.change24h.toFixed(2)}%
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="h-80 bg-gradient-to-br from-space-700/50 to-space-800/50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <RefreshCw className="w-16 h-16 text-neon-purple/50 mx-auto mb-4 animate-spin" />
                      <h3 className="text-xl font-semibold gradient-text mb-2">Loading Chart...</h3>
                      <p className="text-muted-foreground">Fetching latest market data</p>
                    </div>
                  </div>
                ) : chartData.length > 0 ? (
                  <div className="h-80 relative overflow-hidden rounded-lg bg-gradient-to-br from-space-700/30 to-space-800/30">
                    <MiniChart 
                      data={chartData} 
                      width={800} 
                      height={320}
                      className="absolute inset-0"
                    />
                    <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-sm rounded-lg p-3">
                      <div className="text-sm text-muted-foreground">24h Range</div>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm">
                          L: ${selectedAsset?.low24h?.toLocaleString() || 'N/A'}
                        </span>
                        <span className="text-sm">
                          H: ${selectedAsset?.high24h?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-80 bg-gradient-to-br from-space-700/50 to-space-800/50 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 via-transparent to-neon-blue/10" />
                    <div className="text-center z-10">
                      <Activity className="w-16 h-16 text-neon-purple/50 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold gradient-text mb-2">Chart Loading</h3>
                      <p className="text-muted-foreground">Interactive price chart will appear here</p>
                      <Button 
                        variant="outline" 
                        className="mt-4 btn-glass"
                        onClick={refreshData}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                      </Button>
                    </div>
                  </div>
                )}
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
                        Size ({selectedSymbol.split('/')[0]})
                      </label>
                      <div className="glass rounded-lg p-3">
                        <div className={`text-lg font-semibold ${isPrivateMode ? 'privacy-blur' : ''}`}>
                          {selectedSymbol.includes('BTC') ? '0.25 BTC' : 
                           selectedSymbol.includes('ETH') ? '5.0 ETH' :
                           selectedSymbol.includes('SOL') ? '100 SOL' : '1000 HBAR'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ≈ ${selectedAsset ? (selectedAsset.price * 0.25).toLocaleString() : '10,812.50'}
                        </div>
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
