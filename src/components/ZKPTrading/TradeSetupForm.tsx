import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDarkPool } from '@/hooks/useDarkPool';
import { TRADING_PAIRS } from '@/hooks/zkp/useNoirProof';
import { useZKPTrading } from '@/hooks/zkp/useZKPTrading';
import { EyeOff, Shield, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { ProofGenerationModal } from './ProofGenerationModal';

interface TradeSetupFormProps {
  onTradeSubmit?: (tradeId: string) => void;
}

export const TradeSetupForm: React.FC<TradeSetupFormProps> = ({ onTradeSubmit }) => {
  const [size, setSize] = useState('');
  const [pairId, setPairId] = useState<number>(0);
  const [isLong, setIsLong] = useState(true);
  const [showProofModal, setShowProofModal] = useState(false);
  const [currentTradeData, setCurrentTradeData] = useState<any>(null);

  const { isConnected, usdcBalance } = useDarkPool();
  const { submitCommitment, executeTrade, loading, error } = useZKPTrading();

  const selectedPair = TRADING_PAIRS[pairId];
  const availableBalance = usdcBalance?.available || '0';

  const handleGenerateProof = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!size || parseFloat(size) <= 0) {
      alert('Please enter a valid trade size');
      return;
    }

    if (parseFloat(size) > parseFloat(availableBalance)) {
      alert('Insufficient balance');
      return;
    }

    // Get connected wallet address (mock for now)
    const traderAddress = '0xa5346951a6d3faf19b96219cb12790a1db90fa0a';

    const tradeData = {
      size,
      isLong,
      pairId,
      traderAddress
    };

    setCurrentTradeData(tradeData);
    setShowProofModal(true);
  };

  const handleProofComplete = async (tradeId: string) => {
    setShowProofModal(false);
    if (onTradeSubmit) {
      onTradeSubmit(tradeId);
    }
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            🔐 Private Trading Setup
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Your trade details will be hidden using Zero-Knowledge Proofs
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Trading Pair Selection */}
          <div className="space-y-2">
            <Label>Trading Pair</Label>
            <Select value={pairId.toString()} onValueChange={(value) => setPairId(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRADING_PAIRS.map((pair) => (
                  <SelectItem key={pair.id} value={pair.id.toString()}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{pair.symbol}</Badge>
                      {pair.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Trade Size */}
          <div className="space-y-2">
            <Label>Trade Size (USDC)</Label>
            <Input
              type="number"
              placeholder="Enter amount..."
              value={size}
              onChange={(e) => setSize(e.target.value)}
              min="1"
              max="10000"
            />
            <div className="text-xs text-muted-foreground">
              Available: {availableBalance} USDC
            </div>
          </div>

          {/* Direction Selection */}
          <div className="space-y-2">
            <Label>Trade Direction</Label>
            <div className="flex gap-2">
              <Button
                variant={isLong ? "default" : "outline"}
                onClick={() => setIsLong(true)}
                className="flex-1"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Long
              </Button>
              <Button
                variant={!isLong ? "default" : "outline"}
                onClick={() => setIsLong(false)}
                className="flex-1"
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                Short
              </Button>
            </div>
          </div>

          {/* Privacy Preview */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <EyeOff className="h-4 w-4" />
              <span className="text-sm font-medium">Privacy Preview</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>• Trade size: <span className="text-red-500">Hidden</span></div>
              <div>• Direction: <span className="text-red-500">Hidden</span></div>
              <div>• Pair: <span className="text-red-500">Hidden</span></div>
              <div>• Only you know these details!</div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Generate Proof Button */}
          <Button 
            onClick={handleGenerateProof}
            disabled={loading || !isConnected || !size}
            className="w-full"
            size="lg"
          >
            {loading ? (
              'Processing...'
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                🔐 Generate Proof & Trade
              </>
            )}
          </Button>

          {!isConnected && (
            <p className="text-center text-sm text-muted-foreground">
              Connect your wallet to start trading
            </p>
          )}
        </CardContent>
      </Card>

      {/* Proof Generation Modal */}
      {showProofModal && currentTradeData && (
        <ProofGenerationModal
          tradeData={currentTradeData}
          onComplete={handleProofComplete}
          onClose={() => setShowProofModal(false)}
        />
      )}
    </>
  );
};
