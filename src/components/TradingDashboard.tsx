import { InteractiveChart } from '@/components/InteractiveChart';
import { PerpTradingInterface } from '@/components/PerpTradingInterface';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDarkPool } from '@/hooks/useDarkPool';
import { useMarketData } from '@/hooks/useMarketData';
import { useWallet } from '@/hooks/useWallet';
import { Activity, AlertTriangle, Brain, CheckCircle, Minus, Plus, RefreshCw, Shield, Target, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const TradingDashboard = () => {
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [txStatus, setTxStatus] = useState<{
    type: 'deposit' | 'withdraw' | null;
    hash: string | null;
    status: 'pending' | 'success' | 'error' | null;
    message: string | null;
  }>({ type: null, hash: null, status: null, message: null });
  
  const {
    marketData,
    chartData,
    loading,
    error,
    refreshData,
    setSelectedSymbol,
    selectedSymbol,
  } = useMarketData('BTC/USDT');

  const { account, isConnected: walletConnected, connect: connectWallet, balance: walletBalance } = useWallet();
  
  const {
    isConnected: darkPoolConnected,
    balance: darkPoolBalance,
    markets: darkPoolMarkets,
    systemStatus,
    loading: darkPoolLoading,
    error: darkPoolError,
    connect: connectDarkPool,
    deposit,
    withdraw,
    checkBalance,
    refreshSystemStatus,
  } = useDarkPool();

  // Auto-connect DarkPool when wallet connects
  useEffect(() => {
    if (walletConnected && account && !darkPoolConnected && !darkPoolLoading) {
      connectDarkPool();
    }
  }, [walletConnected, account, darkPoolConnected, darkPoolLoading, connectDarkPool]);

  // Auto-check balance when DarkPool connects
  useEffect(() => {
    if (darkPoolConnected && account) {
      checkBalance(account);
    }
  }, [darkPoolConnected, account, checkBalance]);

  // Clear transaction status after 10 seconds
  useEffect(() => {
    if (txStatus.status === 'success' || txStatus.status === 'error') {
      const timer = setTimeout(() => {
        setTxStatus({ type: null, hash: null, status: null, message: null });
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [txStatus.status]);

  // Handle deposit
  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    if (!account) {
      setTxStatus({ type: 'deposit', hash: null, status: 'error', message: 'Please connect your wallet first' });
      return;
    }
    
    setTxStatus({ type: 'deposit', hash: null, status: 'pending', message: 'Initiating deposit...' });
    
    try {
      const txHash = await deposit(depositAmount);
      console.log('Deposit successful:', txHash);
      setTxStatus({ 
        type: 'deposit', 
        hash: txHash, 
        status: 'success', 
        message: `Successfully deposited ${depositAmount} HBAR` 
      });
      setDepositAmount('');
      setShowDepositModal(false);
    } catch (error: any) {
      console.error('Deposit failed:', error);
      setTxStatus({ 
        type: 'deposit', 
        hash: null, 
        status: 'error', 
        message: error.message || 'Deposit failed' 
      });
    }
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    if (!account) {
      setTxStatus({ type: 'withdraw', hash: null, status: 'error', message: 'Please connect your wallet first' });
      return;
    }
    
    const availableBalance = parseFloat(darkPoolBalance?.available || '0');
    const withdrawAmountNum = parseFloat(withdrawAmount);
    
    if (withdrawAmountNum > availableBalance) {
      setTxStatus({ 
        type: 'withdraw', 
        hash: null, 
        status: 'error', 
        message: `Insufficient balance. Available: ${availableBalance} HBAR` 
      });
      return;
    }
    
    setTxStatus({ type: 'withdraw', hash: null, status: 'pending', message: 'Initiating withdrawal...' });
    
    try {
      const txHash = await withdraw(withdrawAmount);
      console.log('Withdrawal successful:', txHash);
      setTxStatus({ 
        type: 'withdraw', 
        hash: txHash, 
        status: 'success', 
        message: `Successfully withdrew ${withdrawAmount} HBAR` 
      });
      setWithdrawAmount('');
      setShowWithdrawModal(false);
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      setTxStatus({ 
        type: 'withdraw', 
        hash: null, 
        status: 'error', 
        message: error.message || 'Withdrawal failed' 
      });
    }
  };

  const selectedAsset = marketData.find(asset => asset.symbol === selectedSymbol) || marketData[0];

  if (loading && !marketData.length) {
    return (
      <div className="min-h-screen bg-dark p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-purple"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-400 p-8">
            <p>Error loading market data: {error}</p>
            <Button onClick={refreshData} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Trading Dashboard</h1>
            <p className="text-muted-foreground">
              Advanced perpetual DEX with privacy features
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* DarkPool Connection Status */}
            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg glass">
              {darkPoolConnected ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">DarkPool Connected</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-yellow-400">DarkPool Disconnected</span>
                </>
              )}
            </div>

            {/* Wallet Connection */}
            <Button
              onClick={walletConnected ? undefined : connectWallet}
              variant={walletConnected ? "outline" : "default"}
              className={walletConnected ? "glass" : "btn-hero"}
            >
              <Wallet className="w-4 h-4 mr-2" />
              {walletConnected ? `${account?.slice(0, 6)}...${account?.slice(-4)}` : 'Connect Wallet'}
            </Button>

            {/* Privacy Toggle */}
            <Button
              onClick={() => setIsPrivateMode(!isPrivateMode)}
              variant={isPrivateMode ? "default" : "outline"}
              className={isPrivateMode ? "btn-hero" : "glass"}
            >
              <Shield className="w-4 h-4 mr-2" />
              {isPrivateMode ? 'Private' : 'Public'}
            </Button>
            
            <Button onClick={refreshData} variant="outline" className="glass">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Transaction Status Notification */}
        {txStatus.status && (
          <Card className={`card-glass border-l-4 ${
            txStatus.status === 'success' ? 'border-l-green-400' : 
            txStatus.status === 'error' ? 'border-l-red-400' : 
            'border-l-yellow-400'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                {txStatus.status === 'pending' && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400"></div>
                )}
                {txStatus.status === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                {txStatus.status === 'error' && (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                )}
                
                <div className="flex-1">
                  <div className={`font-medium ${
                    txStatus.status === 'success' ? 'text-green-400' : 
                    txStatus.status === 'error' ? 'text-red-400' : 
                    'text-yellow-400'
                  }`}>
                    {txStatus.type === 'deposit' ? 'Deposit' : 'Withdrawal'} {
                      txStatus.status === 'pending' ? 'In Progress' :
                      txStatus.status === 'success' ? 'Successful' :
                      'Failed'
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {txStatus.message}
                  </div>
                  {txStatus.hash && (
                    <div className="text-xs text-muted-foreground mt-1">
                      <a 
                        href={`https://hashscan.io/previewnet/transaction/${txStatus.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neon-purple hover:underline"
                      >
                        View on HashScan →
                      </a>
                    </div>
                  )}
                </div>
                
                {txStatus.status !== 'pending' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTxStatus({ type: null, hash: null, status: null, message: null })}
                    className="text-muted-foreground hover:text-white"
                  >
                    ×
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* DarkPool Status Section */}
        {walletConnected && (
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-neon-purple" />
                <span>DarkPool Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Connection Status */}
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Connection</div>
                  <div className="flex items-center space-x-2">
                    {darkPoolConnected ? (
                      <>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-400 font-medium">Connected</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="text-red-400 font-medium">Disconnected</span>
                        <Button
                          size="sm"
                          onClick={connectDarkPool}
                          className="ml-2 btn-hero text-xs"
                          disabled={darkPoolLoading}
                        >
                          {darkPoolLoading ? 'Connecting...' : 'Connect'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Balance */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">DarkPool Balance</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => account && checkBalance(account)}
                      disabled={darkPoolLoading}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-white"
                    >
                      <RefreshCw className={`w-3 h-3 ${darkPoolLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                  <div className="text-lg font-semibold">
                    {darkPoolBalance ? 
                      (parseFloat(darkPoolBalance.available || '0') + parseFloat(darkPoolBalance.locked || '0')).toFixed(4) 
                      : '-.----'
                    } HBAR
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Available: {darkPoolBalance?.available || '-.----'} HBAR
                  </div>
                  {darkPoolBalance?.locked && parseFloat(darkPoolBalance.locked) > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Locked: {darkPoolBalance.locked} HBAR
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Actions</div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => setShowDepositModal(true)}
                      disabled={!darkPoolConnected || darkPoolLoading}
                      className="btn-hero"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Deposit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowWithdrawModal(true)}
                      disabled={!darkPoolConnected || darkPoolLoading || !darkPoolBalance?.available || parseFloat(darkPoolBalance.available) <= 0}
                    >
                      <Minus className="w-4 h-4 mr-1" />
                      Withdraw
                    </Button>
                  </div>
                </div>
              </div>

              {/* System Status */}
              {systemStatus && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-sm text-muted-foreground mb-2">System Status</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <div className="text-muted-foreground">Status</div>
                      <div className={systemStatus.exists ? "text-green-400" : "text-red-400"}>
                        {systemStatus.exists ? "Active" : "Inactive"}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Paused</div>
                      <div className={!systemStatus.paused ? "text-green-400" : "text-red-400"}>
                        {!systemStatus.paused ? "No" : "Yes"}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Markets</div>
                      <div className="text-green-400">
                        {systemStatus.marketCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Owner</div>
                      <div className="text-green-400 text-xs">
                        {systemStatus.owner.slice(0, 6)}...{systemStatus.owner.slice(-4)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DarkPool Error Display */}
              {darkPoolError && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-2 text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">DarkPool Error</span>
                  </div>
                  <div className="text-xs text-red-300 mt-1">
                    {darkPoolError}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={connectDarkPool}
                    className="mt-2 text-xs"
                    disabled={darkPoolLoading}
                  >
                    Retry Connection
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Market Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="card-glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${marketData.reduce((acc, asset) => acc + (asset.volume24h || 0), 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">24h trading volume</p>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${marketData.reduce((acc, asset) => acc + (asset.marketCap || 0), 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total market capitalization</p>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Signals</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neon-purple">Active</div>
              <p className="text-xs text-muted-foreground">ML predictions enabled</p>
            </CardContent>
          </Card>
        </div>

        {/* Asset Selector */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Select Trading Pair</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {marketData.map((asset, index) => (
                <Button
                  key={asset.symbol}
                  onClick={() => setSelectedSymbol(asset.symbol)}
                  variant={selectedSymbol === asset.symbol ? "default" : "outline"}
                  className={`p-3 h-auto flex flex-col items-center space-y-1 ${
                    selectedSymbol === asset.symbol ? 'btn-hero' : 'glass'
                  }`}
                >
                  <span className="font-semibold text-sm">{asset.symbol.toUpperCase()}</span>
                  <span className="text-xs text-muted-foreground">
                    ${asset.price?.toFixed(2)}
                  </span>
                  <span className={`text-xs ${
                    (asset.change24h || 0) >= 0 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    {(asset.change24h || 0) >= 0 ? '+' : ''}
                    {asset.change24h?.toFixed(2)}%
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Interactive Chart */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-neon-purple" />
              <span>Price Chart</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InteractiveChart
              symbol={selectedSymbol}
              data={chartData}
              isPrivateMode={isPrivateMode}
              currentPrice={marketData.find(m => m.symbol === selectedSymbol)?.price || 0}
            />
          </CardContent>
        </Card>

        {/* Perpetual Trading Interface */}
        <PerpTradingInterface
          selectedSymbol={selectedSymbol}
          currentPrice={marketData.find(m => m.symbol === selectedSymbol)?.price || 0}
          isPrivateMode={isPrivateMode}
          onPrivateModeChange={setIsPrivateMode}
          walletBalance={walletBalance || '0.0'}
          onTrade={async (order) => {
            // Simulate order processing
            toast.success(`${order.side.toUpperCase()} order placed for ${order.size} ${order.symbol}`);
            
            // In real implementation, this would call the contract
            console.log('Placing order:', order);
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));
          }}
        />

        {/* Deposit Modal */}
        {showDepositModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="card-glass w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-neon-purple" />
                  <span>Deposit HBAR</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Amount (HBAR)
                  </label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.0"
                    step="0.1"
                    min="0"
                    className="w-full glass rounded-lg p-3 text-lg font-semibold bg-transparent border border-white/10 focus:border-neon-purple/50 outline-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-muted-foreground">
                      Wallet Balance: {walletBalance || '0.0'} HBAR
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDepositAmount('1')}
                        className="text-xs px-2 py-1"
                      >
                        1
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDepositAmount('5')}
                        className="text-xs px-2 py-1"
                      >
                        5
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDepositAmount('10')}
                        className="text-xs px-2 py-1"
                      >
                        10
                      </Button>
                      {walletBalance && parseFloat(walletBalance) > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDepositAmount((parseFloat(walletBalance) * 0.9).toFixed(2))}
                          className="text-xs px-2 py-1"
                        >
                          Max
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Validation Messages */}
                  {depositAmount && parseFloat(depositAmount) > parseFloat(walletBalance || '0') && (
                    <div className="text-xs text-red-400 mt-1">
                      Insufficient wallet balance
                    </div>
                  )}
                  {depositAmount && parseFloat(depositAmount) <= 0 && (
                    <div className="text-xs text-red-400 mt-1">
                      Amount must be greater than 0
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowDepositModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 btn-hero"
                    onClick={handleDeposit}
                    disabled={
                      !depositAmount || 
                      parseFloat(depositAmount) <= 0 || 
                      parseFloat(depositAmount) > parseFloat(walletBalance || '0') ||
                      darkPoolLoading || 
                      txStatus.status === 'pending'
                    }
                  >
                    {txStatus.status === 'pending' && txStatus.type === 'deposit' ? 'Processing...' : 
                     darkPoolLoading ? 'Processing...' : 'Deposit'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="card-glass w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Minus className="w-5 h-5 text-neon-purple" />
                  <span>Withdraw HBAR</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Amount (HBAR)
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.0"
                    step="0.1"
                    min="0"
                    className="w-full glass rounded-lg p-3 text-lg font-semibold bg-transparent border border-white/10 focus:border-neon-purple/50 outline-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-muted-foreground">
                      Available: {darkPoolBalance?.available || '0.0'} HBAR
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setWithdrawAmount('1')}
                        className="text-xs px-2 py-1"
                        disabled={!darkPoolBalance?.available || parseFloat(darkPoolBalance.available) < 1}
                      >
                        1
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setWithdrawAmount('5')}
                        className="text-xs px-2 py-1"
                        disabled={!darkPoolBalance?.available || parseFloat(darkPoolBalance.available) < 5}
                      >
                        5
                      </Button>
                      {darkPoolBalance?.available && parseFloat(darkPoolBalance.available) > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setWithdrawAmount(darkPoolBalance.available)}
                          className="text-xs px-2 py-1"
                        >
                          Max
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Validation Messages */}
                  {withdrawAmount && parseFloat(withdrawAmount) > parseFloat(darkPoolBalance?.available || '0') && (
                    <div className="text-xs text-red-400 mt-1">
                      Insufficient DarkPool balance
                    </div>
                  )}
                  {withdrawAmount && parseFloat(withdrawAmount) <= 0 && (
                    <div className="text-xs text-red-400 mt-1">
                      Amount must be greater than 0
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowWithdrawModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 btn-hero"
                    onClick={handleWithdraw}
                    disabled={
                      !withdrawAmount || 
                      parseFloat(withdrawAmount) <= 0 || 
                      parseFloat(withdrawAmount) > parseFloat(darkPoolBalance?.available || '0') ||
                      darkPoolLoading || 
                      txStatus.status === 'pending'
                    }
                  >
                    {txStatus.status === 'pending' && txStatus.type === 'withdraw' ? 'Processing...' : 
                     darkPoolLoading ? 'Processing...' : 'Withdraw'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingDashboard;
