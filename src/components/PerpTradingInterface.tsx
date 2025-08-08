import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ZKPStatusIndicator } from '@/components/ZKPStatusIndicator';
import { useZKProof } from '@/hooks/useZKProof';
import { TradeStorageManager } from '@/lib/storage/tradeStorage';
import { TradeIntent } from '@/types/zkp';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    ExternalLink,
    Eye,
    EyeOff,
    Lock,
    Shield,
    Target,
    TrendingDown,
    TrendingUp,
    Zap
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

  // ZKP Integration
  const {
    zkpStatus,
    currentProgress,
    isGeneratingProof,
    pendingTrades,
    generateProof,
    submitProof,
    updateTradeStatus,
    clearPendingTrade
  } = useZKProof();

  // Mock positions for demo
  useEffect(() => {
    setPositions([
      {
        id: '1',
        symbol: 'BTC/USD',
        side: 'long',
        size: 0.5,
        entryPrice: 42500,
        markPrice: currentPrice,
        pnl: (currentPrice - 42500) * 0.5,
        pnlPercent: ((currentPrice - 42500) / 42500) * 100,
        margin: 2125,
        leverage: 10,
        liquidationPrice: 38250,
      },
      {
        id: '2',
        symbol: 'ETH/USD',
        side: 'short',
        size: 2.0,
        entryPrice: 2600,
        markPrice: 2580,
        pnl: (2600 - 2580) * 2.0,
        pnlPercent: ((2600 - 2580) / 2600) * 100,
        margin: 520,
        leverage: 10,
        liquidationPrice: 2860,
      }
    ]);
  }, [currentPrice]);

  const calculateMargin = () => {
    const size = parseFloat(orderSize) || 0;
    const price = orderType === 'market' ? currentPrice : parseFloat(orderPrice) || currentPrice;
    return (size * price) / leverage;
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
    const totalCost = calculateTotalCost();
    const availableUSDC = parseFloat(usdcBalance) || 0;
    return totalCost <= availableUSDC;
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
      // Create trade intent for ZKP
      if (isPrivateMode) {
        const intent: TradeIntent = {
          userId: 'demo_user', // In real app, use actual wallet address
          symbol: selectedSymbol,
          amount: parseFloat(orderSize),
          price: orderType === 'market' ? currentPrice : parseFloat(orderPrice),
          side: orderSide === 'buy' ? 'long' : 'short',
          leverage,
          timestamp: Date.now(),
          nonce: TradeStorageManager.generateNonce()
        };

        // Generate ZK proof
        const proof = await generateProof(intent);
        if (!proof) {
          throw new Error('Failed to generate ZK proof');
        }

        // Submit proof to contract (simulated)
        const txHash = await submitProof(proof);
        if (!txHash) {
          throw new Error('Failed to submit proof to contract');
        }

        toast.success(`ZK-protected ${orderSide} order submitted! Tx: ${txHash.slice(0, 10)}...`);
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
              <ZKPStatusIndicator 
                status={zkpStatus}
                progress={currentProgress}
                proof={pendingTrades[0]?.proof}
              />
            </div>
          )}
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trading Panel */}
        <div className="lg:col-span-1">
          <Card className="card-glass">
            <CardHeader>
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
                  <div className="text-sm font-medium text-purple-300 mb-2">Order Summary</div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entry Price:</span>
                      <span className="font-medium">
                        {orderType === 'market' ? 
                          `$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })} (Market)` :
                          `$${parseFloat(orderPrice || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })} (Limit)`
                        }
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Position Size:</span>
                      <span className="font-medium">{orderSize} {selectedSymbol.split('/')[0]}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Notional Value:</span>
                      <span className="font-medium">${calculateNotionalValue().toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Leverage:</span>
                      <span className="font-medium text-yellow-400">{leverage}x</span>
                    </div>
                    
                    <div className="border-t border-purple-500/20 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Margin Required:</span>
                        <span className="font-medium">${calculateMargin().toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trading Fees (0.1%):</span>
                        <span className="font-medium">${calculateFees().toLocaleString(undefined, { minimumFractionDigits: 4 })} USDC</span>
                      </div>
                      
                      <div className="flex justify-between font-medium text-base pt-1 border-t border-purple-500/20 mt-1">
                        <span>Total Cost:</span>
                        <span className={canAffordOrder() ? 'text-green-400' : 'text-red-400'}>
                          ${calculateTotalCost().toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t border-purple-500/20 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Liquidation Price:</span>
                        <span className="text-red-400 font-medium">${calculateLiquidationPrice().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Available USDC:</span>
                        <span className="font-medium">${parseFloat(usdcBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC</span>
                      </div>
                      
                      {!canAffordOrder() && orderSize && (
                        <div className="flex items-center space-x-1 text-red-400 text-xs mt-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Insufficient USDC balance</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleSubmitOrder}
                disabled={
                  !orderSize || 
                  parseFloat(orderSize) <= 0 || 
                  isGeneratingProof ||
                  !canAffordOrder()
                }
                className={`w-full ${orderSide === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} ${
                  !canAffordOrder() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isGeneratingProof ? (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Generating ZK Proof...
                  </>
                ) : !canAffordOrder() && orderSize ? (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Insufficient USDC Balance
                  </>
                ) : (
                  <>
                    {orderSide === 'buy' ? <TrendingUp className="w-4 h-4 mr-2" /> : <TrendingDown className="w-4 h-4 mr-2" />}
                    {orderSide === 'buy' ? 'Open Long' : 'Open Short'} Position
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Positions & Orders */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="positions">Positions</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="zkp">ZKP Trades</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
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
                    <div className="space-y-3">
                      {positions.map((position) => (
                        <div
                          key={position.id}
                          className={`p-4 rounded-lg border ${
                            isPrivateMode ? 'bg-purple-500/5 border-purple-500/20' : 'bg-gray-500/5 border-gray-500/20'
                          } ${isPrivateMode ? 'blur-sm hover:blur-none transition-all' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant={position.side === 'long' ? 'default' : 'destructive'}>
                                {position.side.toUpperCase()}
                              </Badge>
                              <span className="font-medium">{position.symbol}</span>
                              {isPrivateMode && <Shield className="w-4 h-4 text-purple-400" />}
                            </div>
                            <div className={`text-sm font-medium ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {formatPnL(position.pnl)} USD ({position.pnlPercent.toFixed(2)}%)
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Size</div>
                              <div>{position.size} {position.symbol.split('/')[0]}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Entry Price</div>
                              <div>{formatPrice(position.entryPrice)}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Mark Price</div>
                              <div>{formatPrice(position.markPrice)}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Liq. Price</div>
                              <div className="text-red-400">{formatPrice(position.liquidationPrice)}</div>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                              Margin: {formatPrice(position.margin)} | Leverage: {position.leverage}x
                            </div>
                            <Button size="sm" variant="outline" className="text-red-400 border-red-400 hover:bg-red-400/10">
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
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-purple-400" />
                    <span>ZK-Protected Trades</span>
                    {pendingTrades.length > 0 && (
                      <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/50">
                        {pendingTrades.length} pending
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingTrades.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="w-12 h-12 mx-auto mb-3 text-purple-400/50" />
                      <div className="text-lg font-medium mb-2">No ZK-Protected Trades</div>
                      <div className="text-sm">Enable Private Mode to start trading with zero-knowledge proofs</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingTrades.map((trade) => (
                        <div
                          key={trade.id}
                          className="p-4 rounded-lg border bg-purple-500/5 border-purple-500/20"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Badge variant={trade.intent.side === 'long' ? 'default' : 'destructive'}>
                                {trade.intent.side.toUpperCase()}
                              </Badge>
                              <span className="font-medium">{trade.intent.symbol}</span>
                              <Shield className="w-4 h-4 text-purple-400" />
                              <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/50">
                                ZK Protected
                              </Badge>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`${
                                trade.status === 'confirmed' ? 'bg-green-500/20 text-green-300 border-green-500/50' :
                                trade.status === 'error' ? 'bg-red-500/20 text-red-300 border-red-500/50' :
                                'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                              }`}
                            >
                              {trade.status === 'proving' && <Clock className="w-3 h-3 mr-1" />}
                              {trade.status === 'confirmed' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {trade.status.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <div className="text-muted-foreground">Amount</div>
                              <div>{trade.intent.amount} {trade.intent.symbol.split('/')[0]}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Price</div>
                              <div>{formatPrice(trade.intent.price)}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Leverage</div>
                              <div>{trade.intent.leverage}x</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Time</div>
                              <div>{new Date(trade.createdAt).toLocaleTimeString()}</div>
                            </div>
                          </div>

                          {/* ZK Proof Details */}
                          {trade.proof && (
                            <div className="mt-3 p-2 bg-purple-500/10 border border-purple-500/30 rounded text-xs">
                              <div className="flex items-center space-x-2 mb-1">
                                <Lock className="w-3 h-3 text-purple-400" />
                                <span className="font-medium text-purple-400">ZK Proof Generated</span>
                              </div>
                              <div className="font-mono text-gray-400">
                                Proof: {trade.proof.proofHash.slice(0, 20)}...
                              </div>
                              <div className="text-gray-400">
                                Circuit: {trade.proof.metadata.circuitName} v{trade.proof.metadata.version}
                              </div>
                            </div>
                          )}

                          {/* Transaction Link */}
                          {trade.txHash && (
                            <div className="mt-2 flex items-center space-x-2">
                              <a 
                                href={`https://hashscan.io/testnet/transaction/${trade.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>View on HashScan</span>
                              </a>
                            </div>
                          )}

                          {/* Error Message */}
                          {trade.errorMessage && (
                            <div className="mt-2 text-xs text-red-400">
                              Error: {trade.errorMessage}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
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
