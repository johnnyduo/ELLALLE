
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Brain,
  Download,
  Eye,
  EyeOff,
  Filter,
  Lock,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap
} from 'lucide-react';
import { useState } from 'react';

const Portfolio = () => {
  const [isPrivateMode, setIsPrivateMode] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [activeTab, setActiveTab] = useState('overview');

  // Advanced Portfolio Data for Private Trading
  const portfolioValue = 100039.600615;
  const portfolioChange = 3143.59;
  const portfolioChangePercent = 3.24;
  const zkpTradingVolume = 43954.83;
  const privacyScore = 95.7;
  const riskScore = 23.5;

  // Private Trading Assets with ZKP data
  const assets = [
    { 
      symbol: 'HBAR', 
      name: 'Hedera Hashgraph', 
      amount: 245096, 
      value: 62024.55, 
      change: 3.24, 
      allocation: 62,
      zkpTrades: 147,
      privatePool: 'HBAR-Dark-Pool-A',
      stealth: true,
      lastTrade: '2 hours ago'
    },
    { 
      symbol: 'USDC', 
      name: 'USD Coin', 
      amount: 21008, 
      value: 21008.32, 
      change: 0.01, 
      allocation: 21,
      zkpTrades: 89,
      privatePool: 'USDC-Vault-Prime',
      stealth: true,
      lastTrade: '5 minutes ago'
    },
    { 
      symbol: 'BTC', 
      name: 'Bitcoin', 
      amount: 0.0940, 
      value: 11004.36, 
      change: 1.87, 
      allocation: 11,
      zkpTrades: 23,
      privatePool: 'BTC-Stealth-Alpha',
      stealth: true,
      lastTrade: '1 hour ago'
    },
    { 
      symbol: 'ETH', 
      name: 'Ethereum', 
      amount: 1.578, 
      value: 6002.45, 
      change: -0.45, 
      allocation: 6,
      zkpTrades: 34,
      privatePool: 'ETH-Shadow-Beta',
      stealth: false,
      lastTrade: '3 hours ago'
    },
  ];

  // Advanced Private Trading Positions
  const privatePositions = [
    { 
      id: 'zkp-001',
      asset: 'HBAR/USDC', 
      type: 'Long', 
      size: '87.8K HBAR', 
      entry: 0.2445, 
      mark: 0.2534, 
      pnl: 781.95, 
      pnlPercent: 3.64,
      margin: 4394,
      leverage: 5.2,
      zkpProof: 'verified',
      poolType: 'Private Alpha',
      riskLevel: 'Medium',
      timeInPosition: '2d 14h',
      liquidationPrice: 0.1890,
      confidenceScore: 94.2
    },
    { 
      id: 'zkp-002',
      asset: 'BTC/USDC', 
      type: 'Short', 
      size: '0.0264 BTC', 
      entry: 118750, 
      mark: 116514, 
      pnl: 59.02, 
      pnlPercent: 1.88,
      margin: 791,
      leverage: 3.8,
      zkpProof: 'verified',
      poolType: 'Institutional Dark',
      riskLevel: 'Low',
      timeInPosition: '5d 8h',
      liquidationPrice: 156250,
      confidenceScore: 97.8
    },
    { 
      id: 'zkp-003',
      asset: 'ETH/USDC', 
      type: 'Long', 
      size: '0.422 ETH', 
      entry: 3780, 
      mark: 3858, 
      pnl: 32.92, 
      pnlPercent: 2.06,
      margin: 545,
      leverage: 2.9,
      zkpProof: 'pending',
      poolType: 'Private Beta',
      riskLevel: 'Medium',
      timeInPosition: '1d 3h',
      liquidationPrice: 2650,
      confidenceScore: 89.4
    }
  ];

  // Private Trading Performance History
  const performanceHistory = [
    { period: '1H', pnl: 149.44, percent: 0.15, zkpTrades: 8, avgSize: 4394 },
    { period: '1D', pnl: 825.02, percent: 0.84, zkpTrades: 47, avgSize: 3129 },
    { period: '1W', pnl: 5515.56, percent: 5.83, zkpTrades: 234, avgSize: 2689 },
    { period: '1M', pnl: 17201.39, percent: 20.74, zkpTrades: 1247, avgSize: 2893 },
    { period: '3M', pnl: 29791.84, percent: 42.37, zkpTrades: 3891, avgSize: 2804 }
  ];

  // ZKP Trading Analytics
  const zkpAnalytics = {
    totalProofs: 3891,
    verifiedProofs: 3876,
    privacyMaintained: 99.97,
    avgProofTime: '2.3s',
    gasEfficiency: 94.2,
    stealthTrades: 3654,
    institutionalVolume: 89.4
  };

  // Risk Management Metrics
  const riskMetrics = {
    portfolioVaR: 2.4, // Value at Risk (%)
    sharpeRatio: 2.847,
    maxDrawdown: 5.67,
    winRate: 73.4,
    profitFactor: 2.89,
    exposureRatio: 23.5,
    liquidationRisk: 'Low',
    diversificationScore: 87.3
  };

  const timeframes = ['1h', '24h', '7d', '30d'];
  const tabs = ['overview', 'positions', 'analytics', 'privacy'];

  return (
    <div className="min-h-screen bg-space-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Advanced Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Private Trading Portfolio</h1>
            <p className="text-muted-foreground">Advanced analytics and ZKP trading dashboard</p>
            <div className="flex items-center space-x-4 mt-3">
              <Badge variant="outline" className="bg-neon-purple/10 border-neon-purple text-neon-purple">
                <Shield className="w-3 h-3 mr-1" />
                ZKP Verified
              </Badge>
              <Badge variant="outline" className="bg-neon-green/10 border-neon-green text-neon-green">
                <Lock className="w-3 h-3 mr-1" />
                Privacy Score: {privacyScore}%
              </Badge>
              <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500 text-yellow-500">
                <Target className="w-3 h-3 mr-1" />
                Risk Score: {riskScore}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant={isPrivateMode ? "default" : "outline"}
              className={isPrivateMode ? "btn-stealth" : "btn-glass"}
              onClick={() => setIsPrivateMode(!isPrivateMode)}
            >
              {isPrivateMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {isPrivateMode ? 'Stealth Mode' : 'Public View'}
            </Button>
            
            <Button variant="outline" className="btn-glass">
              <Download className="w-4 h-4 mr-2" />
              Export
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

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-space-700/30 rounded-lg p-1">
          {tabs.map((tab) => (
            <Button
              key={tab}
              variant="ghost"
              className={`flex-1 capitalize ${
                activeTab === tab
                  ? 'bg-neon-purple/20 text-neon-purple'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' && <Activity className="w-4 h-4 mr-2" />}
              {tab === 'positions' && <TrendingUp className="w-4 h-4 mr-2" />}
              {tab === 'analytics' && <Brain className="w-4 h-4 mr-2" />}
              {tab === 'privacy' && <Shield className="w-4 h-4 mr-2" />}
              {tab}
            </Button>
          ))}
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="card-glass hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Wallet className="w-8 h-8 text-neon-purple" />
                <Shield className={`w-5 h-5 ${isPrivateMode ? 'text-neon-purple' : 'text-muted-foreground'}`} />
              </div>
              <div className="text-2xl font-bold mb-1">
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
              }`}>
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
                <Lock className="w-8 h-8 text-neon-blue" />
              </div>
              <div className="text-2xl font-bold mb-1">
                ${zkpTradingVolume.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">ZKP Trading Volume</div>
            </CardContent>
          </Card>

          <Card className="card-glass hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Brain className="w-8 h-8 text-neon-green" />
              </div>
              <div className="text-2xl font-bold mb-1">
                {privatePositions.length}
              </div>
              <div className="text-sm text-muted-foreground">Active Positions</div>
            </CardContent>
          </Card>

          <Card className="card-glass hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold mb-1">
                {zkpAnalytics.totalProofs}
              </div>
              <div className="text-sm text-muted-foreground">ZKP Proofs Generated</div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Private Assets Breakdown */}
            <div className="space-y-6">
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Lock className="w-5 h-5 mr-2 text-neon-purple" />
                    Private Asset Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assets.map((asset, index) => (
                    <div key={asset.symbol} className="card-trading">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {asset.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold flex items-center">
                              {asset.symbol}
                              {asset.stealth && <Shield className="w-3 h-3 ml-1 text-neon-purple" />}
                            </div>
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
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Allocation</span>
                          <span>{asset.allocation}%</span>
                        </div>
                        <Progress value={asset.allocation} className="h-2" />
                        
                        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground mt-2">
                          <div>ZKP Trades: {asset.zkpTrades}</div>
                          <div>Pool: {asset.privatePool}</div>
                          <div>Amount: {asset.amount.toLocaleString()}</div>
                          <div>Last: {asset.lastTrade}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Performance History */}
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-neon-green" />
                    Trading Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {performanceHistory.map((perf, index) => (
                      <div key={perf.period} className="card-trading">
                        <div className="flex justify-between items-center">
                          <div>
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
                          <div className="text-right text-xs text-muted-foreground">
                            <div>Trades: {perf.zkpTrades}</div>
                            <div>Avg Size: ${perf.avgSize.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Management Dashboard */}
            <div className="space-y-6">
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Target className="w-5 h-5 mr-2 text-yellow-500" />
                    Risk Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="card-trading">
                      <div className="text-sm text-muted-foreground">Portfolio VaR</div>
                      <div className="text-xl font-bold text-yellow-500">{riskMetrics.portfolioVaR}%</div>
                    </div>
                    <div className="card-trading">
                      <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                      <div className="text-xl font-bold text-neon-green">{riskMetrics.sharpeRatio}</div>
                    </div>
                    <div className="card-trading">
                      <div className="text-sm text-muted-foreground">Max Drawdown</div>
                      <div className="text-xl font-bold text-loss">{riskMetrics.maxDrawdown}%</div>
                    </div>
                    <div className="card-trading">
                      <div className="text-sm text-muted-foreground">Win Rate</div>
                      <div className="text-xl font-bold text-profit">{riskMetrics.winRate}%</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Profit Factor</span>
                      <span className="font-semibold">{riskMetrics.profitFactor}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Exposure Ratio</span>
                      <span className="font-semibold">{riskMetrics.exposureRatio}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Liquidation Risk</span>
                      <Badge className="bg-neon-green/20 text-neon-green">{riskMetrics.liquidationRisk}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Diversification Score</span>
                      <span className="font-semibold">{riskMetrics.diversificationScore}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ZKP Analytics */}
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-neon-purple" />
                    ZKP Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="card-trading">
                      <div className="text-muted-foreground">Total Proofs</div>
                      <div className="font-bold">{zkpAnalytics.totalProofs.toLocaleString()}</div>
                    </div>
                    <div className="card-trading">
                      <div className="text-muted-foreground">Verified</div>
                      <div className="font-bold text-neon-green">{zkpAnalytics.verifiedProofs.toLocaleString()}</div>
                    </div>
                    <div className="card-trading">
                      <div className="text-muted-foreground">Privacy Rate</div>
                      <div className="font-bold text-neon-purple">{zkpAnalytics.privacyMaintained}%</div>
                    </div>
                    <div className="card-trading">
                      <div className="text-muted-foreground">Avg Proof Time</div>
                      <div className="font-bold">{zkpAnalytics.avgProofTime}</div>
                    </div>
                    <div className="card-trading">
                      <div className="text-muted-foreground">Gas Efficiency</div>
                      <div className="font-bold text-neon-blue">{zkpAnalytics.gasEfficiency}%</div>
                    </div>
                    <div className="card-trading">
                      <div className="text-muted-foreground">Stealth Trades</div>
                      <div className="font-bold">{zkpAnalytics.stealthTrades.toLocaleString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'positions' && (
          <div className="space-y-6">
            {/* Active Private Positions */}
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-neon-green" />
                    Active Private Positions
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" className="btn-glass">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm" className="btn-hero">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      New Position
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {privatePositions.map((position, index) => (
                  <div key={position.id} className="card-trading">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex flex-col">
                          <span className="font-semibold flex items-center">
                            {position.asset}
                            <Badge className="ml-2 bg-neon-purple/20 text-neon-purple text-xs">
                              {position.zkpProof}
                            </Badge>
                          </span>
                          <span className="text-xs text-muted-foreground">ID: {position.id}</span>
                        </div>
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            position.type === 'Long' 
                              ? 'bg-profit/20 text-profit' 
                              : 'bg-loss/20 text-loss'
                          }`}>
                            {position.type}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {position.poolType}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-semibold ${
                          position.pnl >= 0 ? 'text-profit' : 'text-loss'
                        }`}>
                          {position.pnl >= 0 ? '+' : ''}${position.pnl.toLocaleString()}
                        </div>
                        <div className={`text-sm ${
                          position.pnlPercent >= 0 ? 'text-profit' : 'text-loss'
                        }`}>
                          {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent}%
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-muted-foreground">Size:</span>
                        <div className="font-semibold">{position.size}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Entry:</span>
                        <div className="font-semibold">${position.entry.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mark:</span>
                        <div className="font-semibold">${position.mark.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Margin:</span>
                        <div className="font-semibold">${position.margin.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Leverage:</span>
                        <div className="font-semibold">{position.leverage}x</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Time:</span>
                        <div className="font-semibold">{position.timeInPosition}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Risk:</span>
                        <Badge className={`text-xs ${
                          position.riskLevel === 'Low' ? 'bg-neon-green/20 text-neon-green' :
                          position.riskLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-loss/20 text-loss'
                        }`}>
                          {position.riskLevel}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Confidence:</span>
                        <div className="font-semibold text-neon-blue">{position.confidenceScore}%</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">
                        Liquidation: ${position.liquidationPrice.toLocaleString()}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="btn-glass">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-loss border-loss hover:bg-loss/10">
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Advanced analytics features coming soon...</p>
              </CardContent>
            </Card>
            <Card className="card-glass">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Detailed performance metrics coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Privacy configuration options coming soon...</p>
              </CardContent>
            </Card>
            <Card className="card-glass">
              <CardHeader>
                <CardTitle>ZKP Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Zero-knowledge proof settings coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
