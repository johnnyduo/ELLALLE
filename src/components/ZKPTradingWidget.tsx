import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useZKPTrading } from '@/hooks/zkp/useZKPTrading';
import { CONTRACT_CONFIG } from '@/lib/env';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    ExternalLink,
    Lock,
    Shield,
    Zap
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface ZKPTradingWidgetProps {
  selectedSymbol: string;
  currentPrice: number;
  isPrivateMode: boolean;
}

export const ZKPTradingWidget: React.FC<ZKPTradingWidgetProps> = ({
  selectedSymbol,
  currentPrice,
  isPrivateMode
}) => {
  const [orderSize, setOrderSize] = useState('');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    submitCommitment,
    executeTrade,
    loading: zkpLoading,
    trades: zkpTrades,
    error: zkpError
  } = useZKPTrading();

  const handleZKPTrade = async () => {
    if (!orderSize || parseFloat(orderSize) <= 0) return;

    try {
      setIsSubmitting(true);
      
      // Step 1: Submit commitment
      toast.info('🔐 Submitting ZK commitment...');
      
      const commitmentParams = {
        size: orderSize,
        isLong: orderSide === 'buy',
        pairId: 0, // HBAR/USD
        traderAddress: 'wallet_address' // Would be actual wallet
      };

      const commitmentTxHash = await submitCommitment(commitmentParams);
      
      toast.success(`✅ ZK commitment submitted! Tx: ${commitmentTxHash.slice(0, 10)}...`, {
        action: {
          label: 'View',
          onClick: () => window.open(`https://hashscan.io/testnet/transaction/${commitmentTxHash}`, '_blank')
        }
      });

      // Step 2: Execute trade after short delay
      setTimeout(async () => {
        try {
          const executionParams = {
            commitment: commitmentTxHash,
            tradePair: selectedSymbol,
            size: parseFloat(orderSize),
            isLong: orderSide === 'buy'
          };

          const executionTxHash = await executeTrade(commitmentTxHash, executionParams);
          
          toast.success(`🚀 ZK trade executed privately! Tx: ${executionTxHash.slice(0, 10)}...`, {
            action: {
              label: 'View',
              onClick: () => window.open(`https://hashscan.io/testnet/transaction/${executionTxHash}`, '_blank')
            }
          });

          // Clear form
          setOrderSize('');
          
        } catch (execError) {
          console.error('Trade execution failed:', execError);
          toast.error('Failed to execute ZK trade: ' + (execError as Error).message);
        } finally {
          setIsSubmitting(false);
        }
      }, 2000);

    } catch (error) {
      console.error('ZKP trade failed:', error);
      toast.error('ZKP trade failed: ' + (error as Error).message);
      setIsSubmitting(false);
    }
  };

  if (!isPrivateMode) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-purple-400" />
          <span>Zero-Knowledge Private Trading</span>
          <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/50">
            <Zap className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Protected by deployed verifier: <code className="text-xs bg-purple-500/20 px-1 rounded">
            {CONTRACT_CONFIG.noirVerifier}
          </code>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* ZKP Status */}
        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-300">Verifier Connected</span>
            </div>
            <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/50 text-xs">
              Ready
            </Badge>
          </div>
        </div>

        {/* Error Display */}
        {zkpError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">ZKP Error</span>
            </div>
            <div className="text-xs mt-1">{zkpError}</div>
          </div>
        )}

        {/* Trade Form */}
        <div className="space-y-3">
          <div className="flex space-x-2">
            <Button
              variant={orderSide === 'buy' ? 'default' : 'outline'}
              onClick={() => setOrderSide('buy')}
              className="flex-1"
            >
              Buy
            </Button>
            <Button
              variant={orderSide === 'sell' ? 'default' : 'outline'}
              onClick={() => setOrderSide('sell')}
              className="flex-1"
            >
              Sell
            </Button>
          </div>

          <div>
            <Label htmlFor="zkp-size">Size ({selectedSymbol.split('/')[0]})</Label>
            <Input
              id="zkp-size"
              type="number"
              value={orderSize}
              onChange={(e) => setOrderSize(e.target.value)}
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price:</span>
              <span>${currentPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Total:</span>
              <span>${((parseFloat(orderSize) || 0) * currentPrice).toFixed(2)}</span>
            </div>
          </div>

          <Button
            onClick={handleZKPTrade}
            disabled={!orderSize || parseFloat(orderSize) <= 0 || isSubmitting || zkpLoading}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting || zkpLoading ? (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Processing ZK Proof...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Submit Private {orderSide.toUpperCase()} Order
              </>
            )}
          </Button>
        </div>

        {/* Recent ZKP Trades */}
        {zkpTrades.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Recent ZK Trades
            </h4>
            <div className="space-y-2">
              {zkpTrades.slice(0, 3).map((trade) => (
                <div
                  key={trade.id}
                  className="p-2 rounded border bg-purple-500/5 border-purple-500/20"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={`${
                          trade.status === 'executed' ? 'bg-green-500/20 text-green-300 border-green-500/50' :
                          trade.status === 'failed' ? 'bg-red-500/20 text-red-300 border-red-500/50' :
                          'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                        }`}
                      >
                        {trade.status}
                      </Badge>
                      {trade.pairName && <span>{trade.pairName}</span>}
                    </div>
                    {trade.txHash && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://hashscan.io/testnet/transaction/${trade.txHash}`, '_blank')}
                        className="h-5 px-1 text-xs"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
