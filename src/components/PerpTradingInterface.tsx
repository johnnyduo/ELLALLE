import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ZKPTradesHistory } from '@/components/ZKPTradesHistory';
import { useProductionZKP } from '@/hooks/useProductionZKPNew';
import { usePythOracle } from '@/hooks/zkp/usePythOracle';
import { CONTRACT_CONFIG } from '@/lib/env';
import { getPairIdFromSymbol, TradeParams } from '@/services/ProductionZKPService';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Shield,
  Target,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  pnlPercent: number;
  margin: number;
  leverage: number;
  liquidationPrice: number;
}

interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  size: number;
  price?: number;
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: number;
}

interface PerpTradingInterfaceProps {
  selectedSymbol: string;
  currentPrice: number;
  isPrivateMode: boolean;
  onPrivateModeChange: (enabled: boolean) => void;
  walletBalance: string;
  usdcBalance: string;
  onTrade: (order: Omit<Order, 'id' | 'timestamp' | 'status'>) => Promise<void>;
}

export const PerpTradingInterface: React.FC<PerpTradingInterfaceProps> = ({
  selectedSymbol,
  currentPrice,
  isPrivateMode,
  onPrivateModeChange,
  walletBalance,
  usdcBalance,
  onTrade
}) => {
  const [activeTab, setActiveTab] = useState('trade');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderSize, setOrderSize] = useState('');
  const [orderPrice, setOrderPrice] = useState('');
  const [leverage, setLeverage] = useState(10);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [collateralInfo, setCollateralInfo] = useState<{
    collateral: string;
    fee: string;
    total: string;
    sufficient: boolean;
  } | null>(null);

  // Production ZKP Integration
  const {
    balances: zkpBalances,
    loading: zkpLoading,
    error: zkpError,
    currentTrade,
    tradeHistory,
    executeTrade: executeZKPTrade,
    loadTradeHistory,
    clearError,
    refreshBalances,
    forceRefreshBalances,
    canTrade,
    isConnected
  } = useProductionZKP();

  // Pyth Oracle integration for real-time prices
  const { prices } = usePythOracle();

    // Mock positions for demo
  useEffect(() => {
    setPositions([
      {
        id: '1',
        symbol: 'BTC-USD',
        side: 'long',
        size: 0.5,
        entryPrice: 42150,
        markPrice: currentPrice,
        pnl: (currentPrice - 42150) * 0.5,
        pnlPercent: ((currentPrice - 42150) / 42150) * 100,
        margin: 2125,
        leverage: 10,
        liquidationPrice: 3794,
      },
      {
        id: '2',
        symbol: 'ETH-USD',
        side: 'short',
        size: 2.0,
        entryPrice: 2650,
        markPrice: 2600,
        pnl: (2650 - 2600) * 2.0,
        pnlPercent: ((2650 - 2600) / 2650) * 100,
        margin: 520,
        leverage: 8,
        liquidationPrice: 2860,
      }
    ]);
  }, [currentPrice]);

  // Calculate ZKP collateral when order size, leverage, or balances change
  useEffect(() => {
    if (orderSize && zkpBalances) {
      calculateZKPCollateral();
    }
  }, [orderSize, leverage, zkpBalances]);

  const calculateMargin = () => {
    const size = parseFloat(orderSize) || 0;
    const price = orderType === 'market' ? currentPrice : parseFloat(orderPrice) || currentPrice;
    return (size * price) / leverage;
  };

  // Calculate actual ZKP collateral requirements based on notional value and leverage
  const calculateZKPCollateral = async () => {
    const size = parseFloat(orderSize) || 0;
    if (size <= 0) {
      setCollateralInfo(null);
      return;
    }

    try {
      // Calculate based on actual notional value and leverage (CORRECT METHOD)
      const notionalValue = size * currentPrice; // e.g., 1 SOL × $176.67 = $176.67 USDC
      const requiredCollateral = notionalValue / leverage; // e.g., $176.67 ÷ 10 = $17.67 USDC
      const tradingFee = (requiredCollateral * 20) / 10000; // 20 basis points (0.2%)
      const totalRequired = requiredCollateral + tradingFee;

      console.log('🧮 ZKP Collateral Calculation:');
      console.log(`   Pair: ${selectedSymbol}`);
      console.log(`   Size: ${size} ${selectedSymbol.split('/')[0]}`);
      console.log(`   Current Price: $${currentPrice} USDC`);
      console.log(`   Notional Value: $${notionalValue.toFixed(2)} USDC`);
      console.log(`   Leverage: ${leverage}x`);
      console.log(`   Required Collateral: $${requiredCollateral.toFixed(2)} USDC`);
      console.log(`   Trading Fee (0.2%): $${tradingFee.toFixed(2)} USDC`);
      console.log(`   Total Required: $${totalRequired.toFixed(2)} USDC`);

      // Check if user has sufficient balance
      const userBalance = zkpBalances ? parseFloat(zkpBalances.usdc) : 0;
      const sufficient = userBalance >= totalRequired;

      setCollateralInfo({
        collateral: requiredCollateral.toFixed(2),
        fee: tradingFee.toFixed(2),
        total: totalRequired.toFixed(2),
        sufficient
      });

    } catch (error) {
      console.error('❌ Error calculating ZKP collateral:', error);
      setCollateralInfo(null);
    }
  };

  const calculateNotionalValue = () => {
    const size = parseFloat(orderSize) || 0;
    const price = orderType === 'market' ? currentPrice : parseFloat(orderPrice) || currentPrice;
    return size * price;
  };

  const calculateFees = () => {
    const notional = calculateNotionalValue();
    // 0.1% trading fee
    return notional * 0.001;
  };

  const calculateTotalCost = () => {
    const margin = calculateMargin();
    const fees = calculateFees();
    return margin + fees;
  };

  const canAffordOrder = () => {
    if (isPrivateMode && collateralInfo) {
      // Use ZKP collateral calculation for private mode
      return collateralInfo.sufficient;
    } else {
      // Use standard calculation for regular mode
      const totalCost = calculateTotalCost();
      const availableUSDC = parseFloat(usdcBalance) || 0;
      return totalCost <= availableUSDC;
    }
  };

  const calculateLiquidationPrice = () => {
    const size = parseFloat(orderSize) || 0;
    const price = orderType === 'market' ? currentPrice : parseFloat(orderPrice) || currentPrice;
    const margin = calculateMargin();
    
    if (orderSide === 'buy') {
      return price - (margin / size);
    } else {
      return price + (margin / size);
    }
  };

  const handleSubmitOrder = async () => {
    if (!orderSize || parseFloat(orderSize) <= 0) return;
    if (orderType === 'limit' && (!orderPrice || parseFloat(orderPrice) <= 0)) return;

    try {
      if (isPrivateMode) {
        // Get wallet address
        const provider = (window as any).ethereum;
        if (!provider) {
          throw new Error('No Ethereum provider found');
        }
        
        const accounts = await provider.request({ method: 'eth_accounts' });
        if (!accounts || accounts.length === 0) {
          throw new Error('No wallet connected');
        }
        
        const walletAddress = accounts[0];

        // ZKP Private Trading with proven workflow
        toast.info('🔐 Starting zero-knowledge proof trade execution...');
        
        // Get dynamic pairId based on selected trading pair
        const pairId = getPairIdFromSymbol(selectedSymbol);
        
        // Prepare trade parameters with dynamic pair support and current price
        const tradeParams: TradeParams = {
          size: parseFloat(orderSize),     // e.g., 0.01 for 0.01 tokens
          isLong: orderSide === 'buy',     // true = Long, false = Short
          leverage,                        // e.g., 10 for 10x leverage
          pairId,                          // Dynamic pairId based on selected symbol
          useHBAR: false,                  // Use USDC collateral (as successful script)
          selectedSymbol,                  // Pass the selected symbol for display
          currentPrice                     // Current market price for accurate collateral calculation
        };

        console.log('🚀 Executing ZKP trade with params:', tradeParams);

        const result = await executeZKPTrade(tradeParams);

        if (result.success) {
          // Clear form on success
          setOrderSize('');
          setOrderPrice('');
          
          // Automatically switch to ZKP Trades tab to show the new trade
          setActiveTab('zkp-trades');
          
          toast.success('🎉 ZKP trade executed successfully!');
          
          // Force immediate balance refresh to show deduction
          console.log('🔄 Triggering immediate balance refresh...');
          forceRefreshBalances();
          
          // Log transaction details for user
          console.log('Trade completed:', {
            pair: selectedSymbol,
            pairId,
            commitment: result.commitmentTx,
            execution: result.tradeTx,
            hashscan: [
              `https://hashscan.io/testnet/transaction/${result.commitmentTx}`,
              `https://hashscan.io/testnet/transaction/${result.tradeTx}`
            ]
          });
        } else {
          toast.error(`ZKP trade failed: ${result.error}`);
        }

      } else {
        // Regular order flow
        const order: Omit<Order, 'id' | 'timestamp' | 'status'> = {
          symbol: selectedSymbol,
          side: orderSide,
          type: orderType,
          size: parseFloat(orderSize),
          price: orderType === 'limit' ? parseFloat(orderPrice) : undefined,
        };

        await onTrade(order);
      }
      
      // Add to orders list
      const newOrder: Order = {
        symbol: selectedSymbol,
        side: orderSide,
        type: orderType,
        size: parseFloat(orderSize),
        price: orderType === 'limit' ? parseFloat(orderPrice) : undefined,
        id: Date.now().toString(),
        timestamp: Date.now(),
        status: 'filled',
      };
      
      setOrders(prev => [newOrder, ...prev]);
      
      // Reset form
      setOrderSize('');
      setOrderPrice('');
    } catch (error: any) {
      console.error('Order failed:', error);
      toast.error(error.message || 'Order failed');
    }
  };

  const formatPrice = (price: number) => `$${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  const formatPnL = (pnl: number) => `${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}`;

  return (
    <div className="space-y-6">
      {/* Trading Interface Header */}
      <Card className="card-glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-neon-purple" />
              <span>Perpetual Trading</span>
              {isPrivateMode && (
                <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/50">
                  <Shield className="w-3 h-3 mr-1" />
                  ZK Protected
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={isPrivateMode ? "default" : "outline"}
                size="sm"
                onClick={() => onPrivateModeChange(!isPrivateMode)}
                className={isPrivateMode ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                {isPrivateMode ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                {isPrivateMode ? 'Private Mode' : 'Public Mode'}
              </Button>
            </div>
          </div>
          
          {isPrivateMode && (
            <div className="mt-3">
              {/* ZKP Status Display */}
            <Card className="p-4 border-purple-200 bg-purple-50/30">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-purple-800">🔐 ZKP Status</h4>
                {zkpLoading && <div className="animate-spin">⚡</div>}
              </div>
              
              {zkpBalances && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>DarkPool HBAR:</span>
                    <span className="font-mono">{zkpBalances.hbar} HBAR</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DarkPool USDC:</span>
                    <span className="font-mono">{zkpBalances.usdc} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Can Trade:</span>
                    <span className={canTrade ? 'text-green-600' : 'text-red-600'}>
                      {canTrade ? '✅ Ready' : '❌ Not Ready'}
                    </span>
                  </div>
                </div>
              )}
              
              {zkpError && (
                <div className="mt-2 p-2 bg-red-100 text-red-700 rounded text-sm">
                  ❌ {zkpError}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearError}
                    className="ml-2 h-5 px-2"
                  >
                    Clear
                  </Button>
                </div>
              )}
              
              {currentTrade && (
                <div className="mt-2 p-2 bg-green-100 text-green-700 rounded text-sm">
                  ✅ Last trade successful
                  {currentTrade.commitmentTx && (
                    <div className="text-xs mt-1">
                      <a
                        href={`https://hashscan.io/testnet/transaction/${currentTrade.commitmentTx}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View on Hashscan ↗
                      </a>
                    </div>
                  )}
                </div>
              )}
            </Card>
            </div>
          )}
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Trading Panel */}
        <div className="xl:col-span-1">
          <Card className="card-glass">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Place Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Type Tabs */}
              <Tabs value={orderType} onValueChange={(value) => setOrderType(value as 'market' | 'limit')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="market">Market</TabsTrigger>
                  <TabsTrigger value="limit">Limit</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Buy/Sell Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={orderSide === 'buy' ? "default" : "outline"}
                  onClick={() => setOrderSide('buy')}
                  className={orderSide === 'buy' ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Long
                </Button>
                <Button
                  variant={orderSide === 'sell' ? "default" : "outline"}
                  onClick={() => setOrderSide('sell')}
                  className={orderSide === 'sell' ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  <TrendingDown className="w-4 h-4 mr-1" />
                  Short
                </Button>
              </div>

              {/* Order Inputs */}
              <div className="space-y-3">
                {orderType === 'limit' && (
                  <div>
                    <Label htmlFor="price">Price (USDC)</Label>
                    <div className="space-y-2">
                      <Input
                        id="price"
                        type="number"
                        value={orderPrice}
                        onChange={(e) => setOrderPrice(e.target.value)}
                        placeholder={currentPrice.toFixed(2)}
                        step="0.01"
                        className="glass"
                      />
                      <div className="flex space-x-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setOrderPrice((currentPrice * 0.99).toFixed(2))}
                          className="text-xs px-2 py-1 h-6"
                        >
                          -1%
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setOrderPrice((currentPrice * 0.995).toFixed(2))}
                          className="text-xs px-2 py-1 h-6"
                        >
                          -0.5%
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setOrderPrice(currentPrice.toFixed(2))}
                          className="text-xs px-2 py-1 h-6 text-yellow-400"
                        >
                          Market
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setOrderPrice((currentPrice * 1.005).toFixed(2))}
                          className="text-xs px-2 py-1 h-6"
                        >
                          +0.5%
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setOrderPrice((currentPrice * 1.01).toFixed(2))}
                          className="text-xs px-2 py-1 h-6"
                        >
                          +1%
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="size">Size ({selectedSymbol.split('/')[0]})</Label>
                  <div className="space-y-2">
                    <Input
                      id="size"
                      type="number"
                      value={orderSize}
                      onChange={(e) => setOrderSize(e.target.value)}
                      placeholder="0.0"
                      step="0.01"
                      className="glass"
                    />
                    <div className="flex space-x-1">
                      {selectedSymbol.includes('BTC') && (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setOrderSize('0.01')}
                            className="text-xs px-2 py-1 h-6"
                          >
                            0.01
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setOrderSize('0.1')}
                            className="text-xs px-2 py-1 h-6"
                          >
                            0.1
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setOrderSize('0.5')}
                            className="text-xs px-2 py-1 h-6"
                          >
                            0.5
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setOrderSize('1')}
                            className="text-xs px-2 py-1 h-6"
                          >
                            1
                          </Button>
                        </>
                      )}
                      {selectedSymbol.includes('ETH') && (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setOrderSize('0.1')}
                            className="text-xs px-2 py-1 h-6"
                          >
                            0.1
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setOrderSize('1')}
                            className="text-xs px-2 py-1 h-6"
                          >
                            1
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setOrderSize('5')}
                            className="text-xs px-2 py-1 h-6"
                          >
                            5
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setOrderSize('10')}
                            className="text-xs px-2 py-1 h-6"
                          >
                            10
                          </Button>
                        </>
                      )}
                      {!selectedSymbol.includes('BTC') && !selectedSymbol.includes('ETH') && (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setOrderSize('10')}
                            className="text-xs px-2 py-1 h-6"
                          >
                            10
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setOrderSize('50')}
                            className="text-xs px-2 py-1 h-6"
                          >
                            50
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setOrderSize('100')}
                            className="text-xs px-2 py-1 h-6"
                          >
                            100
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setOrderSize('500')}
                            className="text-xs px-2 py-1 h-6"
                          >
                            500
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="leverage">Leverage: {leverage}x</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-sm text-muted-foreground">1x</span>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={leverage}
                      onChange={(e) => setLeverage(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">100x</span>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              {orderSize && (
                <div className="space-y-3 p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-purple-300">Order Summary</div>
                    {isPrivateMode && (
                      <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/50 text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        ZK Protected
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Entry Price:</span>
                      <span className="font-medium text-right">
                        {orderType === 'market' ? 
                          `$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })} (Market)` :
                          `$${parseFloat(orderPrice || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })} (Limit)`
                        }
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Position Size:</span>
                      <span className="font-medium text-right">{orderSize} {selectedSymbol.split('/')[0]}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Notional Value:</span>
                      <span className="font-medium text-right">${calculateNotionalValue().toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Leverage:</span>
                      <span className="font-medium text-yellow-400 text-right">{leverage}x</span>
                    </div>
                    
                    {isPrivateMode && (
                      <div className="border border-purple-500/30 rounded-lg p-3 bg-purple-500/5">
                        <div className="text-xs font-medium text-purple-300 mb-2 flex items-center">
                          <Shield className="w-3 h-3 mr-1" />
                          Privacy Features
                        </div>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div className="flex justify-between items-center">
                            <span>Trade Size:</span>
                            <span className="text-purple-400 text-right">Hidden via ZK proof</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Direction:</span>
                            <span className="text-purple-400 text-right">Encrypted commitment</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Leverage:</span>
                            <span className="text-purple-400 text-right">ZK verified: {leverage}x</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Trader Identity:</span>
                            <span className="text-purple-400 text-right">Anonymous</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="border-t border-purple-500/20 pt-3 mt-3 space-y-3">
                      {isPrivateMode ? (
                        collateralInfo ? (
                          // ZKP Collateral Information
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">ZKP Collateral:</span>
                              <span className="font-medium text-neon-blue text-right">${collateralInfo.collateral} USDC</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Trading Fee (0.2%):</span>
                              <span className="font-medium text-right">${collateralInfo.fee} USDC</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground font-medium">Total Required:</span>
                              <span className={`font-medium text-right ${collateralInfo.sufficient ? 'text-green-400' : 'text-red-400'}`}>
                                ${collateralInfo.total} USDC
                              </span>
                            </div>
                            
                            {!collateralInfo.sufficient && (
                              <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-300">
                                <div className="flex items-center">
                                  <AlertTriangle className="w-3 h-3 mr-1 flex-shrink-0" />
                                  <span>Insufficient USDC balance in DarkPool</span>
                                </div>
                              </div>
                            )}
                            
                            <div className="mt-2 p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs text-purple-300">
                              <div className="flex items-start">
                                <Shield className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                                <span>ZKP collateral calculated from working size (min 1M units)</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          // Loading or no order size
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">ZKP Collateral:</span>
                            <span className="font-medium text-gray-400 text-right">
                              {orderSize ? 'Calculating...' : 'Enter order size'}
                            </span>
                          </div>
                        )
                      ) : (
                        // Standard Margin Display
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Margin Required:</span>
                            <span className="font-medium text-right">${calculateMargin().toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC</span>
                          </div>
                        </>
                      )}
                      
                      {!isPrivateMode && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Trading Fees (0.1%):</span>
                          <span className="font-medium text-right">${calculateFees().toLocaleString(undefined, { minimumFractionDigits: 4 })} USDC</span>
                        </div>
                      )}
                      
                      {isPrivateMode && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">ZK Proof Gas:</span>
                          <span className="font-medium text-purple-400 text-right">~$0.50 USDC</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center font-medium text-base pt-2 border-t border-purple-500/20 mt-2">
                        <span>Total Cost:</span>
                        <span className={`text-right ${canAffordOrder() ? 'text-green-400' : 'text-red-400'}`}>
                          ${(calculateTotalCost() + (isPrivateMode ? 0.5 : 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t border-purple-500/20 pt-3 mt-3 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Liquidation Price:</span>
                        <span className="text-red-400 font-medium text-right">${calculateLiquidationPrice().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Available USDC:</span>
                        <span className="font-medium text-right">${parseFloat(usdcBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC</span>
                      </div>
                      
                      {!canAffordOrder() && orderSize && (
                        <div className="flex items-center space-x-2 text-red-400 text-xs p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                          <span>Insufficient USDC balance</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ZKP Status Indicator */}
              {isPrivateMode && (
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-300 font-medium">ZK Verifier Connected</span>
                    </div>
                    <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/50 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <span>Contract:</span>
                      <code className="bg-purple-500/20 px-2 py-1 rounded text-xs font-mono break-all overflow-hidden">
                        {CONTRACT_CONFIG.noirVerifier.slice(0, 6)}...{CONTRACT_CONFIG.noirVerifier.slice(-4)}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0 text-purple-400 hover:text-purple-300"
                        onClick={() => navigator.clipboard.writeText(CONTRACT_CONFIG.noirVerifier)}
                        title="Copy full address"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  {zkpLoading && (
                    <div className="text-xs text-blue-300 mt-2 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Processing ZK proof...
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleSubmitOrder}
                disabled={
                  !orderSize || 
                  parseFloat(orderSize) <= 0 || 
                  zkpLoading ||
                  !canAffordOrder()
                }
                className={`w-full h-12 text-base font-medium ${orderSide === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} ${
                  !canAffordOrder() ? 'opacity-50 cursor-not-allowed' : ''
                } ${isPrivateMode ? 'border border-purple-500/50' : ''} transition-all duration-200`}
              >
                {zkpLoading ? (
                  <>
                    <Lock className="w-4 h-4 mr-2 animate-pulse" />
                    {isPrivateMode ? 'Generating ZK Proof...' : 'Processing...'}
                  </>
                ) : !canAffordOrder() && orderSize ? (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Insufficient USDC Balance
                  </>
                ) : (
                  <>
                    {isPrivateMode && <Shield className="w-4 h-4 mr-2" />}
                    {orderSide === 'buy' ? <TrendingUp className="w-4 h-4 mr-2" /> : <TrendingDown className="w-4 h-4 mr-2" />}
                    {isPrivateMode ? 
                      `Open ${orderSide === 'buy' ? 'Long' : 'Short'} (ZK Private)` :
                      `Open ${orderSide === 'buy' ? 'Long' : 'Short'} Position`
                    }
                  </>
                )}
              </Button>

              {/* ZKP Process Information */}
              {isPrivateMode && (
                <div className="text-xs text-muted-foreground space-y-2 bg-purple-500/5 border border-purple-500/20 rounded-lg p-3">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span>Your trade details remain completely private</span>
                  </div>
                  <div className="text-center text-purple-300">
                    ZK proof will be generated locally and verified on-chain
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Positions & Orders */}
        <div className="xl:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="positions" className="text-xs sm:text-sm">Positions</TabsTrigger>
              <TabsTrigger value="orders" className="text-xs sm:text-sm">Orders</TabsTrigger>
              <TabsTrigger value="zkp" className="text-xs sm:text-sm">ZKP Trades</TabsTrigger>
              <TabsTrigger value="history" className="text-xs sm:text-sm">History</TabsTrigger>
            </TabsList>

            <TabsContent value="positions" className="mt-4">
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-lg">Open Positions</CardTitle>
                </CardHeader>
                <CardContent>
                  {positions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No open positions
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {positions.map((position) => (
                        <div
                          key={position.id}
                          className={`p-4 rounded-lg border ${
                            isPrivateMode ? 'bg-purple-500/5 border-purple-500/20' : 'bg-gray-500/5 border-gray-500/20'
                          } ${isPrivateMode ? 'blur-sm hover:blur-none transition-all duration-300' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Badge variant={position.side === 'long' ? 'default' : 'destructive'} className="text-xs">
                                {position.side.toUpperCase()}
                              </Badge>
                              <span className="font-medium text-sm">{position.symbol}</span>
                              {isPrivateMode && <Shield className="w-4 h-4 text-purple-400" />}
                            </div>
                            <div className={`text-sm font-medium text-right ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              <div>{formatPnL(position.pnl)} USD</div>
                              <div className="text-xs">({position.pnlPercent.toFixed(2)}%)</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                            <div className="space-y-1">
                              <div className="text-muted-foreground text-xs">Size</div>
                              <div className="font-medium">{position.size} {position.symbol.split('/')[0]}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-muted-foreground text-xs">Entry Price</div>
                              <div className="font-medium">{formatPrice(position.entryPrice)}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-muted-foreground text-xs">Mark Price</div>
                              <div className="font-medium">{formatPrice(position.markPrice)}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-muted-foreground text-xs">Liq. Price</div>
                              <div className="text-red-400 font-medium">{formatPrice(position.liquidationPrice)}</div>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                              <span>Margin: {formatPrice(position.margin)}</span>
                              <span className="mx-2">•</span>
                              <span>Leverage: {position.leverage}x</span>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-400 border-red-400 hover:bg-red-400/10 text-xs px-3 py-1 h-8"
                            >
                              Close Position
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="mt-4">
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-lg">Open Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    No open orders
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="zkp" className="mt-4">
              <ZKPTradesHistory 
                trades={tradeHistory}
                loading={zkpLoading}
                onRefresh={loadTradeHistory}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-lg">Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No order history
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className={`p-3 rounded-lg border ${
                            isPrivateMode ? 'bg-purple-500/5 border-purple-500/20' : 'bg-gray-500/5 border-gray-500/20'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant={order.side === 'buy' ? 'default' : 'destructive'}>
                                {order.side.toUpperCase()}
                              </Badge>
                              <span className="font-medium">{order.symbol}</span>
                              <span className="text-sm text-muted-foreground">{order.type.toUpperCase()}</span>
                              {isPrivateMode && <Shield className="w-3 h-3 text-purple-400" />}
                            </div>
                            <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/50">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {order.status.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Size</div>
                              <div>{order.size} {order.symbol.split('/')[0]}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Price</div>
                              <div>{order.price ? formatPrice(order.price) : 'Market'}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Time</div>
                              <div>{new Date(order.timestamp).toLocaleTimeString()}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PerpTradingInterface;
