import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    CheckCircle,
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
  onTrade: (order: Omit<Order, 'id' | 'timestamp' | 'status'>) => Promise<void>;
}

export const PerpTradingInterface: React.FC<PerpTradingInterfaceProps> = ({
  selectedSymbol,
  currentPrice,
  isPrivateMode,
  onPrivateModeChange,
  walletBalance,
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
  const [zkpProofStatus, setZkpProofStatus] = useState<'generating' | 'ready' | 'verified'>('ready');

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

    // Simulate ZKP proof generation for private orders
    if (isPrivateMode) {
      setZkpProofStatus('generating');
      await new Promise(resolve => setTimeout(resolve, 2000));
      setZkpProofStatus('verified');
    }

    const order: Omit<Order, 'id' | 'timestamp' | 'status'> = {
      symbol: selectedSymbol,
      side: orderSide,
      type: orderType,
      size: parseFloat(orderSize),
      price: orderType === 'limit' ? parseFloat(orderPrice) : undefined,
    };

    try {
      await onTrade(order);
      
      // Add to orders list
      const newOrder: Order = {
        ...order,
        id: Date.now().toString(),
        timestamp: Date.now(),
        status: 'filled',
      };
      
      setOrders(prev => [newOrder, ...prev]);
      
      // Reset form
      setOrderSize('');
      setOrderPrice('');
      setZkpProofStatus('ready');
    } catch (error) {
      console.error('Order failed:', error);
      setZkpProofStatus('ready');
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
            <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Zero-Knowledge Proof Protection</span>
                <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/50">
                  {zkpProofStatus === 'generating' ? 'Generating...' : 
                   zkpProofStatus === 'verified' ? 'Verified' : 'Ready'}
                </Badge>
              </div>
              <div className="text-xs text-gray-400">
                Your order details, position sizes, and PnL are cryptographically hidden using ZK-SNARKs while maintaining
                verifiable execution on the blockchain. Trade with complete privacy.
              </div>
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
                    <Label htmlFor="price">Price (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={orderPrice}
                      onChange={(e) => setOrderPrice(e.target.value)}
                      placeholder={currentPrice.toString()}
                      className="glass"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="size">Size ({selectedSymbol.split('/')[0]})</Label>
                  <Input
                    id="size"
                    type="number"
                    value={orderSize}
                    onChange={(e) => setOrderSize(e.target.value)}
                    placeholder="0.0"
                    step="0.01"
                    className="glass"
                  />
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
                <div className="space-y-2 p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Margin Required:</span>
                    <span>{formatPrice(calculateMargin())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Liquidation Price:</span>
                    <span className="text-red-400">{formatPrice(calculateLiquidationPrice())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Available Balance:</span>
                    <span>{walletBalance} HBAR</span>
                  </div>
                </div>
              )}

              {/* ZKP Status for Private Orders */}
              {isPrivateMode && zkpProofStatus === 'generating' && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-purple-400">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm">Generating ZK Proof...</span>
                  </div>
                  <Progress value={66} className="h-2" />
                </div>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleSubmitOrder}
                disabled={!orderSize || parseFloat(orderSize) <= 0 || zkpProofStatus === 'generating'}
                className={`w-full ${orderSide === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {zkpProofStatus === 'generating' ? (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Generating ZK Proof...
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="positions">Positions</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
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
