import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDarkPool } from '@/hooks/useDarkPool';
import { useZKPTrading } from '@/hooks/zkp/useZKPTrading';
import {
    CheckCircle,
    Clock,
    Eye,
    EyeOff,
    Shield,
    TrendingUp
} from 'lucide-react';
import React, { useState } from 'react';
import { TradeSetupForm } from './TradeSetupForm';

export const ZKPTradingInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState('trade');
  const { trades } = useZKPTrading();
  const { isConnected, balance, usdcBalance } = useDarkPool();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'committed':
        return <Badge variant="outline"><Shield className="h-3 w-3 mr-1" />Committed</Badge>;
      case 'executed':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Executed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold">Zero-Knowledge Private Trading</h1>
        </div>
        <p className="text-muted-foreground">
          Trade with complete privacy using Zero-Knowledge Proofs. Your trade details remain hidden from all observers.
        </p>
      </div>

      {/* Balance Overview */}
      {isConnected && (
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">HBAR Balance</p>
                  <p className="text-2xl font-bold">{balance?.available || '0.0000'}</p>
                </div>
                <Badge variant="outline">Available</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">USDC Balance</p>
                  <p className="text-2xl font-bold">{usdcBalance?.available || '0.000000'}</p>
                </div>
                <Badge variant="outline">Available</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Trading Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trade">🔐 New Trade</TabsTrigger>
          <TabsTrigger value="positions">📊 Positions</TabsTrigger>
          <TabsTrigger value="education">🎓 Learn ZKP</TabsTrigger>
        </TabsList>

        {/* New Trade Tab */}
        <TabsContent value="trade" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Trade Setup Form */}
            <div>
              <TradeSetupForm onTradeSubmit={(tradeId) => setActiveTab('positions')} />
            </div>

            {/* Privacy Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <EyeOff className="h-5 w-5" />
                  Privacy Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Hidden Trade Size</h4>
                      <p className="text-sm text-muted-foreground">
                        Nobody can see how much you're trading
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Hidden Direction</h4>
                      <p className="text-sm text-muted-foreground">
                        Long or short positions remain private
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Eye className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Hidden Trading Pairs</h4>
                      <p className="text-sm text-muted-foreground">
                        Which asset you're trading stays secret
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-1">How it works:</h4>
                  <p className="text-sm text-blue-700">
                    Zero-Knowledge Proofs let you prove you have valid trade parameters 
                    without revealing what they are. The blockchain verifies your trade 
                    is legitimate while keeping all details private.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Positions Tab */}
        <TabsContent value="positions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Private Trades</CardTitle>
              <p className="text-sm text-muted-foreground">
                Only you can see the details of your trades
              </p>
            </CardHeader>
            <CardContent>
              {trades.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No trades yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Start your first private trade to see it here
                  </p>
                  <Button 
                    onClick={() => setActiveTab('trade')} 
                    className="mt-4"
                  >
                    Create First Trade
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {trades.map((trade) => (
                    <div key={trade.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{trade.pairName}</Badge>
                            {getStatusBadge(trade.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(trade.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                      
                      <div className="text-xs font-mono bg-muted p-2 rounded">
                        Commitment: {trade.commitment.slice(0, 20)}...
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>🧠 What are Zero-Knowledge Proofs?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  Zero-Knowledge Proofs (ZKPs) are cryptographic methods that allow you to 
                  prove you know something without revealing what you know.
                </p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">🔐 Privacy</h4>
                    <p className="text-sm text-muted-foreground">
                      Keep your trading strategy completely private
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">✅ Verification</h4>
                    <p className="text-sm text-muted-foreground">
                      Prove your trades are valid without showing details
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">🔗 Trustless</h4>
                    <p className="text-sm text-muted-foreground">
                      No need to trust intermediaries with your data
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>⚡ Powered by Noir</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  We use Noir, a domain-specific language for writing zero-knowledge circuits, 
                  to create proofs for your trades.
                </p>
                
                <div className="p-3 bg-slate-50 rounded text-xs font-mono">
                  <div className="text-slate-600 mb-2">// Simple Noir circuit example</div>
                  <div>fn verify_trade(</div>
                  <div>&nbsp;&nbsp;secret_size: Field,</div>
                  <div>&nbsp;&nbsp;public_commitment: Field</div>
                  <div>) {`{`}</div>
                  <div>&nbsp;&nbsp;assert(secret_size &gt; 0);</div>
                  <div>&nbsp;&nbsp;assert(hash(secret_size) == commitment);</div>
                  <div>{`}`}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
