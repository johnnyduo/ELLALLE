import { CacheStatusIndicator } from '@/components/CacheStatusIndicator';
import { InteractiveChart } from '@/components/InteractiveChart';
import { PerpTradingInterface } from '@/components/PerpTradingInterface';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDarkPool } from '@/hooks/useDarkPool';
import { useMarketData } from '@/hooks/useMarketData';
import { useProductionZKP } from '@/hooks/useProductionZKPNew';
import { useUSDCFaucet } from '@/hooks/useUSDCFaucet';
import { useWallet } from '@/hooks/useWallet';
import { formatPercentage, formatPrice } from '@/lib/web3';
import { Activity, AlertTriangle, Brain, CheckCircle, Minus, Plus, RefreshCw, Shield, Target, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const TradingDashboard = () => {
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const [hbarDepositAmount, setHbarDepositAmount] = useState('');
  const [hbarWithdrawAmount, setHbarWithdrawAmount] = useState('');
  const [usdcDepositAmount, setUsdcDepositAmount] = useState('');
  const [usdcWithdrawAmount, setUsdcWithdrawAmount] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedDepositToken, setSelectedDepositToken] = useState<'HBAR' | 'USDC'>('HBAR');
  const [selectedWithdrawToken, setSelectedWithdrawToken] = useState<'HBAR' | 'USDC'>('HBAR');
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
  } = useMarketData('BTC/USDC');

  const { account, isConnected: walletConnected, connect: connectWallet, balance: walletBalance } = useWallet();
  
  // USDC Faucet integration (for wallet balance)
  const { 
    balance: walletUSDCBalance, 
    checkBalance: checkWalletUSDCBalance,
    claimUSDC,
    canClaim,
    isClaiming,
    timeUntilNextClaim 
  } = useUSDCFaucet(account);
  
  const {
    isConnected: darkPoolConnected,
    balance: darkPoolBalance,
    usdcBalance: darkPoolUSDCBalance,
    markets: darkPoolMarkets,
    systemStatus,
    loading: darkPoolLoading,
    error: darkPoolError,
    connect: connectDarkPool,
    depositHBAR,
    withdrawHBAR,
    depositUSDC,
    withdrawUSDC,
    checkBalance,
    checkUSDCBalance,
    refreshSystemStatus,
  } = useDarkPool();

  // Production ZKP Integration for actual trading
  const {
    balances: zkpBalances,
    loading: zkpLoading,
    error: zkpError,
    tradeHistory: zkpTradeHistory,
    refreshBalances: refreshZKPBalances,
    isConnected: zkpConnected
  } = useProductionZKP();

  // Auto-connect DarkPool when wallet connects
  useEffect(() => {
    if (walletConnected && account && !darkPoolConnected && !darkPoolLoading) {
      connectDarkPool();
    }
  }, [walletConnected, account, darkPoolConnected, darkPoolLoading, connectDarkPool]);

  // Check wallet USDC balance when wallet connects
  useEffect(() => {
    if (walletConnected && account) {
      console.log('🔗 Wallet connected, checking USDC balance for:', account);
      checkWalletUSDCBalance(account);
    }
  }, [walletConnected, account, checkWalletUSDCBalance]);

  // Auto-check balance when DarkPool connects
  useEffect(() => {
    if (darkPoolConnected && account) {
      checkBalance(account);
      checkUSDCBalance(account);
    }
  }, [darkPoolConnected, account, checkBalance, checkUSDCBalance]);

  // Clear transaction status after 10 seconds
  useEffect(() => {
    if (txStatus.status === 'success' || txStatus.status === 'error') {
      const timer = setTimeout(() => {
        setTxStatus({ type: null, hash: null, status: null, message: null });
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [txStatus.status]);

  // Handle HBAR deposit - Native token (recommended for stability)
  const handleHBARDeposit = async () => {
    if (!hbarDepositAmount || parseFloat(hbarDepositAmount) <= 0) {
      toast.error('Please enter a valid deposit amount');
      return;
    }
    
    if (!account) {
      setTxStatus({ type: 'deposit', hash: null, status: 'error', message: 'Please connect your wallet first' });
      return;
    }
    
    const walletBalanceNum = parseFloat(walletBalance || '0');
    const depositAmountNum = parseFloat(hbarDepositAmount);
    
    console.log('HBAR Deposit validation:', {
      depositAmount: depositAmountNum,
      walletBalance: walletBalanceNum,
      account
    });
    
    if (depositAmountNum > walletBalanceNum) {
      const errorMsg = `Insufficient HBAR balance. Available: ${walletBalanceNum.toFixed(4)} HBAR, Requested: ${depositAmountNum.toFixed(4)} HBAR`;
      console.error(errorMsg);
      setTxStatus({ 
        type: 'deposit', 
        hash: null, 
        status: 'error', 
        message: errorMsg
      });
      toast.error(errorMsg);
      return;
    }
    
    setTxStatus({ type: 'deposit', hash: null, status: 'pending', message: 'Initiating HBAR deposit to DarkPool...' });
    
    try {
      console.log('Calling CompactDarkPoolDEX depositHBAR:', {
        amount: hbarDepositAmount,
        account,
        contract: 'CompactDarkPoolDEX'
      });
      
      // Create a status update function
      const updateStatus = (message: string) => {
        setTxStatus({ type: 'deposit', hash: null, status: 'pending', message });
      };
      
      // Call the native HBAR deposit function
      updateStatus('Sending HBAR to DarkPool contract...');
      const txHash = await depositHBAR(hbarDepositAmount);
      
      console.log('HBAR Deposit successful:', txHash);
      
      setTxStatus({ 
        type: 'deposit', 
        hash: txHash, 
        status: 'success', 
        message: `Successfully deposited ${hbarDepositAmount} HBAR to CompactDarkPoolDEX` 
      });
      setHbarDepositAmount('');
      setShowDepositModal(false);
      
      toast.success(`HBAR Deposit successful! ${hbarDepositAmount} HBAR deposited to DarkPool`);
      
      // Refresh balances (reduced timeout since we now have instant confirmation)
      if (account) {
        setTimeout(() => {
          checkBalance(account);
        }, 1000); // Much shorter wait since depositHBAR now handles confirmation
      }
      
    } catch (error: any) {
      console.error('HBAR Deposit failed:', error);
      
      const errorMessage = error.message || 'HBAR Deposit failed';
      setTxStatus({ 
        type: 'deposit', 
        hash: null, 
        status: 'error', 
        message: errorMessage
      });
      
      toast.error(`HBAR Deposit failed: ${errorMessage}`);
    }
  };

  // Handle HBAR withdraw - Native token (recommended for stability)
  const handleHBARWithdraw = async () => {
    if (!hbarWithdrawAmount || parseFloat(hbarWithdrawAmount) <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return;
    }
    
    if (!account) {
      setTxStatus({ type: 'withdraw', hash: null, status: 'error', message: 'Please connect your wallet first' });
      return;
    }
    
    // Check actual DarkPool HBAR balance
    const availableHBARBalance = parseFloat(darkPoolBalance?.available || '0');
    const withdrawAmountNum = parseFloat(hbarWithdrawAmount);
    
    console.log('HBAR Withdrawal validation:', {
      withdrawAmount: withdrawAmountNum,
      availableHBARBalance,
      account
    });
    
    if (withdrawAmountNum > availableHBARBalance) {
      const errorMsg = `Insufficient HBAR balance in DarkPool. Available: ${availableHBARBalance.toFixed(4)} HBAR, Requested: ${withdrawAmountNum.toFixed(4)} HBAR`;
      console.error(errorMsg);
      setTxStatus({ 
        type: 'withdraw', 
        hash: null, 
        status: 'error', 
        message: errorMsg
      });
      toast.error(errorMsg);
      return;
    }
    
    setTxStatus({ type: 'withdraw', hash: null, status: 'pending', message: 'Initiating HBAR withdrawal from CompactDarkPoolDEX...' });
    
    try {
      console.log('Calling CompactDarkPoolDEX withdrawHBAR:', {
        amount: hbarWithdrawAmount,
        account,
        contract: 'CompactDarkPoolDEX'
      });
      
      // Call the native HBAR withdraw function
      const txHash = await withdrawHBAR(hbarWithdrawAmount);
      
      console.log('HBAR Withdrawal successful:', txHash);
      
      setTxStatus({ 
        type: 'withdraw', 
        hash: txHash, 
        status: 'success', 
        message: `Successfully withdrew ${hbarWithdrawAmount} HBAR from CompactDarkPoolDEX` 
      });
      setHbarWithdrawAmount('');
      setShowWithdrawModal(false);
      
      toast.success(`HBAR Withdrawal successful! ${hbarWithdrawAmount} HBAR withdrawn from DarkPool`);
      
      // Refresh balances (reduced timeout since we now have instant confirmation)
      if (account) {
        setTimeout(() => {
          checkBalance(account);
        }, 1000); // Much shorter wait since withdrawHBAR now handles confirmation
      }
      
    } catch (error: any) {
      console.error('HBAR Withdrawal failed:', error);
      
      const errorMessage = error.message || 'HBAR Withdrawal failed';
      setTxStatus({ 
        type: 'withdraw', 
        hash: null, 
        status: 'error', 
        message: errorMessage
      });
      
      toast.error(`HBAR Withdrawal failed: ${errorMessage}`);
    }
  };

  // Handle USDC deposit - ERC-20 token (may have network stability issues)
  const handleUSDCDeposit = async () => {
    if (!usdcDepositAmount || parseFloat(usdcDepositAmount) <= 0) {
      toast.error('Please enter a valid deposit amount');
      return;
    }
    
    if (!account) {
      setTxStatus({ type: 'deposit', hash: null, status: 'error', message: 'Please connect your wallet first' });
      return;
    }
    
    const usdcBalanceNum = parseFloat(walletUSDCBalance || '0');
    const depositAmountNum = parseFloat(usdcDepositAmount);
    
    console.log('USDC Deposit validation:', {
      depositAmount: depositAmountNum,
      usdcBalance: usdcBalanceNum,
      account
    });
    
    if (depositAmountNum > usdcBalanceNum) {
      const errorMsg = `Insufficient USDC balance. Available: ${usdcBalanceNum.toFixed(2)} USDC, Requested: ${depositAmountNum.toFixed(2)} USDC`;
      console.error(errorMsg);
      setTxStatus({ 
        type: 'deposit', 
        hash: null, 
        status: 'error', 
        message: errorMsg
      });
      toast.error(errorMsg);
      return;
    }
    
    setTxStatus({ type: 'deposit', hash: null, status: 'pending', message: 'Checking USDC allowance and initiating deposit...' });
    
    try {
      console.log('Calling real CompactDarkPoolDEX depositUSDC:', {
        amount: usdcDepositAmount,
        account,
        contract: 'CompactDarkPoolDEX'
      });
      
      // Create a status update function that we can pass to the deposit function
      const updateStatus = (message: string) => {
        setTxStatus({ type: 'deposit', hash: null, status: 'pending', message });
      };
      
      // Call the real contract function with status updates
      updateStatus('Validating USDC allowance and balance...');
      const txHash = await depositUSDC(usdcDepositAmount);
      
      console.log('USDC Deposit successful:', txHash);
      
      setTxStatus({ 
        type: 'deposit', 
        hash: txHash, 
        status: 'success', 
        message: `Successfully deposited ${usdcDepositAmount} USDC to CompactDarkPoolDEX` 
      });
      setUsdcDepositAmount('');
      setShowDepositModal(false);
      
      toast.success(`USDC Deposit successful! ${usdcDepositAmount} USDC deposited to DarkPool`);
      
      // Refresh balances
      if (account) {
        setTimeout(() => {
          checkUSDCBalance(account);
          checkBalance(account);
          checkWalletUSDCBalance(account); // Refresh wallet balance too
        }, 5000); // Wait longer for Hedera transaction processing
      }
      
    } catch (error: any) {
      console.error('USDC Deposit failed:', error);
      
      const errorMessage = error.message || 'USDC Deposit failed';
      setTxStatus({ 
        type: 'deposit', 
        hash: null, 
        status: 'error', 
        message: errorMessage
      });
      
      toast.error(`USDC Deposit failed: ${errorMessage}`);
    }
  };

  // Handle USDC withdraw - Real contract call
  const handleUSDCWithdraw = async () => {
    if (!usdcWithdrawAmount || parseFloat(usdcWithdrawAmount) <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return;
    }
    
    if (!account) {
      setTxStatus({ type: 'withdraw', hash: null, status: 'error', message: 'Please connect your wallet first' });
      return;
    }
    
    // Check actual DarkPool USDC balance
    const availableUSDCBalance = parseFloat(darkPoolBalance?.available || '0');
    const withdrawAmountNum = parseFloat(usdcWithdrawAmount);
    
    console.log('USDC Withdrawal validation:', {
      withdrawAmount: withdrawAmountNum,
      availableUSDCBalance,
      account
    });
    
    if (withdrawAmountNum > availableUSDCBalance) {
      const errorMsg = `Insufficient USDC balance in DarkPool. Available: ${availableUSDCBalance.toFixed(6)} USDC, Requested: ${withdrawAmountNum.toFixed(6)} USDC`;
      console.error(errorMsg);
      setTxStatus({ 
        type: 'withdraw', 
        hash: null, 
        status: 'error', 
        message: errorMsg
      });
      toast.error(errorMsg);
      return;
    }
    
    setTxStatus({ type: 'withdraw', hash: null, status: 'pending', message: 'Initiating USDC withdrawal from CompactDarkPoolDEX...' });
    
    try {
      console.log('Calling real CompactDarkPoolDEX withdrawUSDC:', {
        amount: usdcWithdrawAmount,
        account,
        contract: 'CompactDarkPoolDEX'
      });
      
      // Call the real contract function
      const txHash = await withdrawUSDC(usdcWithdrawAmount);
      
      console.log('USDC Withdrawal successful:', txHash);
      
      setTxStatus({ 
        type: 'withdraw', 
        hash: txHash, 
        status: 'success', 
        message: `Successfully withdrew ${usdcWithdrawAmount} USDC from CompactDarkPoolDEX` 
      });
      setUsdcWithdrawAmount('');
      setShowWithdrawModal(false);
      
      toast.success(`USDC Withdrawal successful! ${usdcWithdrawAmount} USDC withdrawn from DarkPool`);
      
      // Refresh balances
      if (account) {
        setTimeout(() => {
          checkUSDCBalance(account);
          checkBalance(account);
        }, 2000); // Wait a bit for transaction to be processed
      }
      
    } catch (error: any) {
      console.error('USDC Withdrawal failed:', error);
      
      const errorMessage = error.message || 'USDC Withdrawal failed';
      setTxStatus({ 
        type: 'withdraw', 
        hash: null, 
        status: 'error', 
        message: errorMessage
      });
      
      toast.error(`USDC Withdrawal failed: ${errorMessage}`);
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
                        href={`https://hashscan.io/testnet/transaction/${txStatus.hash}`}
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
                    <div className="text-sm text-muted-foreground">Your DarkPool Deposits</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (account) {
                          checkBalance(account);
                          checkUSDCBalance(account);
                        }
                      }}
                      disabled={darkPoolLoading}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-white"
                    >
                      <RefreshCw className={`w-3 h-3 ${darkPoolLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                  
                  {/* HBAR Balance in DarkPool */}
                  <div className="space-y-1">
                    <div className="text-lg font-semibold flex items-center space-x-2">
                      <span>
                        {zkpBalances?.hbar ? 
                          parseFloat(zkpBalances.hbar).toFixed(4) 
                          : (darkPoolBalance ? 
                              (parseFloat(darkPoolBalance.available || '0') + parseFloat(darkPoolBalance.locked || '0')).toFixed(4) 
                              : '0.0000')
                        } HBAR
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {zkpBalances?.hbar ? 
                        `ZKP Available: ${parseFloat(zkpBalances.hbar).toFixed(4)} HBAR` 
                        : `Available: ${darkPoolBalance?.available || '0.0000'} HBAR`
                      }
                    </div>
                    {!zkpBalances?.hbar && darkPoolBalance?.locked && parseFloat(darkPoolBalance.locked) > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Locked in positions: {darkPoolBalance.locked} HBAR
                      </div>
                    )}
                  </div>

                  {/* USDC Balance in DarkPool */}
                  <div className="space-y-1 pt-2 border-t border-white/10">
                    <div className="text-lg font-semibold flex items-center space-x-2">
                      <span className="text-neon-blue">
                        {zkpBalances?.usdc ? 
                          parseFloat(zkpBalances.usdc).toFixed(6) 
                          : (darkPoolUSDCBalance ? 
                              (parseFloat(darkPoolUSDCBalance.available || '0') + parseFloat(darkPoolUSDCBalance.locked || '0')).toFixed(6) 
                              : '0.000000')
                        } USDC
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {zkpBalances?.usdc ? 
                        `ZKP Available: ${parseFloat(zkpBalances.usdc).toFixed(6)} USDC` 
                        : `Available: ${darkPoolUSDCBalance?.available ? parseFloat(darkPoolUSDCBalance.available).toFixed(6) : '0.000000'} USDC`
                      }
                    </div>
                    {!zkpBalances?.usdc && darkPoolUSDCBalance?.locked && parseFloat(darkPoolUSDCBalance.locked) > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Locked in positions: {parseFloat(darkPoolUSDCBalance.locked).toFixed(6)} USDC
                      </div>
                    )}
                    <div className="text-xs text-neon-blue">
                      💰 {zkpBalances ? 'ZKP Production DarkPool' : 'CompactDarkPoolDEX Contract'}
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-white/10">
                    <div className="flex justify-between">
                      <span>Wallet USDC:</span>
                      <span className="text-neon-blue">
                        {(() => {
                          console.log('💰 Rendering wallet USDC balance:', walletUSDCBalance);
                          return parseFloat(walletUSDCBalance || '0').toLocaleString(undefined, { 
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2 
                          })
                        })()} USDC
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wallet HBAR:</span>
                      <span>{walletBalance || '0.0000'} HBAR</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">DarkPool Actions</div>
                  <div className="flex flex-col space-y-2">
                    {/* HBAR Actions */}
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedDepositToken('HBAR');
                          setShowDepositModal(true);
                        }}
                        disabled={!darkPoolConnected || darkPoolLoading || !walletBalance || parseFloat(walletBalance) <= 0}
                        className="btn-hero flex-1"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Deposit HBAR
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedWithdrawToken('HBAR');
                          setShowWithdrawModal(true);
                        }}
                        disabled={!darkPoolConnected || darkPoolLoading}
                        className="flex-1"
                      >
                        <Minus className="w-4 h-4 mr-1" />
                        Withdraw HBAR
                      </Button>
                    </div>
                    
                    {/* USDC Actions */}
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedDepositToken('USDC');
                          setShowDepositModal(true);
                        }}
                        disabled={!darkPoolConnected || darkPoolLoading || !walletUSDCBalance || parseFloat(walletUSDCBalance) <= 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Deposit USDC
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedWithdrawToken('USDC');
                          setShowWithdrawModal(true);
                        }}
                        disabled={!darkPoolConnected || darkPoolLoading}
                        className="flex-1"
                      >
                        <Minus className="w-4 h-4 mr-1" />
                        Withdraw USDC
                      </Button>
                    </div>
                  </div>
                  
                  {/* Faucet Button or Deposit Message */}
                  {(!walletUSDCBalance || parseFloat(walletUSDCBalance) <= 0) ? (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">
                        Get USDC from the faucet to enable deposits
                      </div>
                      <Button
                        size="sm"
                        onClick={claimUSDC}
                        disabled={!canClaim || isClaiming}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isClaiming ? 'Claiming...' : canClaim ? 'Claim 1,000 USDC' : `Wait ${Math.ceil(timeUntilNextClaim / 3600)}h`}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      Deposit USDC to start trading in the DarkPool
                    </div>
                  )}
                </div>
              </div>

              {/* System Status */}
              {systemStatus && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-sm text-muted-foreground mb-2">System Status</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="text-muted-foreground">Status</div>
                      <div className={systemStatus.exists ? "text-green-400" : "text-red-400"}>
                        {systemStatus.exists ? "Active" : "Inactive"}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Markets</div>
                      <div className="text-green-400">
                        {systemStatus.marketCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Paused</div>
                      <div className={!systemStatus.paused ? "text-green-400" : "text-red-400"}>
                        {!systemStatus.paused ? "No" : "Yes"}
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
                    {formatPrice(asset.price || 0)}
                  </span>
                  <span className={`text-xs ${
                    (asset.change24h || 0) >= 0 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    {formatPercentage(asset.change24h || 0)}
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
          usdcBalance={darkPoolUSDCBalance?.available || '0.0'}
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
                  <span>Deposit {selectedDepositToken} to DarkPool</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground mb-3">
                  Deposit {selectedDepositToken} from your wallet into the DarkPool contract for trading.
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Amount ({selectedDepositToken})
                  </label>
                  <input
                    type="number"
                    value={selectedDepositToken === 'HBAR' ? hbarDepositAmount : usdcDepositAmount}
                    onChange={(e) => selectedDepositToken === 'HBAR' ? setHbarDepositAmount(e.target.value) : setUsdcDepositAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full glass rounded-lg p-3 text-lg font-semibold bg-transparent border border-white/10 focus:border-neon-purple/50 outline-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-muted-foreground">
                      Wallet Balance: {selectedDepositToken === 'HBAR' ? 
                        parseFloat(walletBalance).toLocaleString(undefined, { 
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2 
                        }) : 
                        parseFloat(walletUSDCBalance || '0').toLocaleString(undefined, { 
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2 
                        })
                      } {selectedDepositToken}
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => selectedDepositToken === 'HBAR' ? setHbarDepositAmount('100') : setUsdcDepositAmount('100')}
                        className="text-xs px-2 py-1"
                      >
                        100
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => selectedDepositToken === 'HBAR' ? setHbarDepositAmount('500') : setUsdcDepositAmount('500')}
                        className="text-xs px-2 py-1"
                      >
                        500
                      </Button>
                      {((selectedDepositToken === 'HBAR' && walletBalance && parseFloat(walletBalance) > 0) ||
                        (selectedDepositToken === 'USDC' && walletUSDCBalance && parseFloat(walletUSDCBalance) > 0)) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (selectedDepositToken === 'HBAR') {
                              setHbarDepositAmount((parseFloat(walletBalance) * 0.9).toFixed(2));
                            } else {
                              setUsdcDepositAmount((parseFloat(walletUSDCBalance || '0') * 0.9).toFixed(2));
                            }
                          }}
                          className="text-xs px-2 py-1"
                        >
                          Max
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Validation Messages */}
                  {selectedDepositToken === 'HBAR' && hbarDepositAmount && parseFloat(hbarDepositAmount) > parseFloat(walletBalance || '0') && (
                    <div className="text-xs text-red-400 mt-1">
                      Insufficient HBAR balance
                    </div>
                  )}
                  {selectedDepositToken === 'USDC' && usdcDepositAmount && parseFloat(usdcDepositAmount) > parseFloat(walletUSDCBalance || '0') && (
                    <div className="text-xs text-red-400 mt-1">
                      Insufficient USDC balance
                    </div>
                  )}
                  {((selectedDepositToken === 'HBAR' && hbarDepositAmount && parseFloat(hbarDepositAmount) <= 0) ||
                    (selectedDepositToken === 'USDC' && usdcDepositAmount && parseFloat(usdcDepositAmount) <= 0)) && (
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
                    onClick={selectedDepositToken === 'HBAR' ? handleHBARDeposit : handleUSDCDeposit}
                    disabled={
                      selectedDepositToken === 'HBAR' ? (
                        !hbarDepositAmount || 
                        parseFloat(hbarDepositAmount) <= 0 || 
                        parseFloat(hbarDepositAmount) > parseFloat(walletBalance || '0') ||
                        darkPoolLoading || 
                        txStatus.status === 'pending'
                      ) : (
                        !usdcDepositAmount || 
                        parseFloat(usdcDepositAmount) <= 0 || 
                        parseFloat(usdcDepositAmount) > parseFloat(walletUSDCBalance || '0') ||
                        darkPoolLoading || 
                        txStatus.status === 'pending'
                      )
                    }
                  >
                    {txStatus.status === 'pending' && txStatus.type === 'deposit' ? 'Processing...' : 
                     darkPoolLoading ? 'Processing...' : `Deposit ${selectedDepositToken}`}
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
                  <span>Withdraw {selectedWithdrawToken} from DarkPool</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground mb-3">
                  Withdraw your deposited {selectedWithdrawToken} from the DarkPool contract back to your wallet.
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Amount ({selectedWithdrawToken})
                  </label>
                  <input
                    type="number"
                    value={selectedWithdrawToken === 'HBAR' ? hbarWithdrawAmount : usdcWithdrawAmount}
                    onChange={(e) => selectedWithdrawToken === 'HBAR' ? setHbarWithdrawAmount(e.target.value) : setUsdcWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full glass rounded-lg p-3 text-lg font-semibold bg-transparent border border-white/10 focus:border-neon-purple/50 outline-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-muted-foreground">
                      DarkPool {selectedWithdrawToken} Balance: {darkPoolBalance?.available ? parseFloat(darkPoolBalance.available).toFixed(6) : '0.000000'} {selectedWithdrawToken}
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const maxAmount = darkPoolBalance?.available ? parseFloat(darkPoolBalance.available).toFixed(6) : '0';
                          if (selectedWithdrawToken === 'HBAR') {
                            setHbarWithdrawAmount(maxAmount);
                          } else {
                            setUsdcWithdrawAmount(maxAmount);
                          }
                        }}
                        className="text-xs px-2 py-1"
                        disabled={!darkPoolBalance?.available || parseFloat(darkPoolBalance.available) <= 0}
                      >
                        Max
                      </Button>
                    </div>
                  </div>
                  
                  {/* Validation Messages */}
                  {selectedWithdrawToken === 'HBAR' && hbarWithdrawAmount && parseFloat(hbarWithdrawAmount) > parseFloat(darkPoolBalance?.available || '0') && (
                    <div className="text-xs text-red-400 mt-1">
                      Insufficient HBAR balance in DarkPool
                    </div>
                  )}
                  {selectedWithdrawToken === 'USDC' && usdcWithdrawAmount && parseFloat(usdcWithdrawAmount) > parseFloat(darkPoolBalance?.available || '0') && (
                    <div className="text-xs text-red-400 mt-1">
                      Insufficient USDC balance in DarkPool
                    </div>
                  )}
                  {((selectedWithdrawToken === 'HBAR' && hbarWithdrawAmount && parseFloat(hbarWithdrawAmount) <= 0) ||
                    (selectedWithdrawToken === 'USDC' && usdcWithdrawAmount && parseFloat(usdcWithdrawAmount) <= 0)) && (
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
                    onClick={selectedWithdrawToken === 'HBAR' ? handleHBARWithdraw : handleUSDCWithdraw}
                    disabled={
                      selectedWithdrawToken === 'HBAR' ? (
                        !hbarWithdrawAmount || 
                        parseFloat(hbarWithdrawAmount) <= 0 || 
                        txStatus.status === 'pending'
                      ) : (
                        !usdcWithdrawAmount || 
                        parseFloat(usdcWithdrawAmount) <= 0 || 
                        txStatus.status === 'pending'
                      )
                    }
                  >
                    {txStatus.status === 'pending' && txStatus.type === 'withdraw' ? 'Processing...' : `Withdraw ${selectedWithdrawToken}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Cache Status Indicator (only in development) */}
      {process.env.NODE_ENV === 'development' && <CacheStatusIndicator />}
    </div>
  );
};

export default TradingDashboard;
