import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { TRADING_PAIRS, useNoirProof } from '@/hooks/zkp/useNoirProof';
import { useZKPTrading } from '@/hooks/zkp/useZKPTrading';
import {
    Brain,
    CheckCircle,
    Circle,
    Code,
    EyeOff,
    Hash,
    Loader2,
    Shield
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ProofGenerationModalProps {
  tradeData: {
    size: string;
    isLong: boolean;
    pairId: number;
    traderAddress: string;
  };
  onComplete: (tradeId: string) => void;
  onClose: () => void;
}

export const ProofGenerationModal: React.FC<ProofGenerationModalProps> = ({
  tradeData,
  onComplete,
  onClose
}) => {
  const [step, setStep] = useState(1);
  const [commitment, setCommitment] = useState<string>('');
  const [proof, setProof] = useState<any>(null);
  const [showCircuitDetails, setShowCircuitDetails] = useState(false);
  const [progress, setProgress] = useState(0);

  const { generateCommitment, generateProof, loading } = useNoirProof();
  const { submitCommitment, executeTrade } = useZKPTrading();

  const selectedPair = TRADING_PAIRS[tradeData.pairId];

  // Auto-progress through steps
  useEffect(() => {
    const runProofGeneration = async () => {
      try {
        // Step 1: Generate Commitment
        setStep(1);
        setProgress(10);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const commitmentHash = await generateCommitment(tradeData);
        setCommitment(commitmentHash);
        setProgress(33);

        // Step 2: Submit Commitment
        setStep(2);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const tradeId = await submitCommitment(tradeData);
        setProgress(66);

        // Step 3: Generate Proof
        setStep(3);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const generatedProof = await generateProof(tradeData, commitmentHash);
        setProof(generatedProof);
        setProgress(85);

        // Step 4: Execute Trade
        setStep(4);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await executeTrade(tradeId, tradeData);
        setProgress(100);

        // Complete
        setStep(5);
        setTimeout(() => onComplete(tradeId), 1500);

      } catch (error) {
        console.error('Proof generation failed:', error);
      }
    };

    runProofGeneration();
  }, []);

  const getStepIcon = (stepNumber: number) => {
    if (step > stepNumber) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (step === stepNumber) return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    return <Circle className="h-5 w-5 text-gray-300" />;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            🧠 Zero-Knowledge Proof Generation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Trade Summary */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">🔐 Private Trade Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pair:</span>
                    <Badge variant="outline">{selectedPair.name}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-mono">{tradeData.size} USDC</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Direction:</span>
                    <Badge variant={tradeData.isLong ? "default" : "secondary"}>
                      {tradeData.isLong ? "Long" : "Short"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Privacy:</span>
                    <Badge variant="outline" className="text-green-600">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Hidden
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ZKP Process Steps */}
          <div className="space-y-4">
            <h3 className="font-medium">Zero-Knowledge Proof Process:</h3>
            
            {/* Step 1: Commitment */}
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              {getStepIcon(1)}
              <div className="flex-1">
                <h4 className="font-medium">Step 1: Creating Commitment Hash</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Generating cryptographic hash of your trade parameters
                </p>
                {commitment && (
                  <div className="bg-muted p-2 rounded text-xs font-mono">
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="h-3 w-3" />
                      Commitment Hash:
                    </div>
                    {commitment}
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Submit Commitment */}
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              {getStepIcon(2)}
              <div className="flex-1">
                <h4 className="font-medium">Step 2: Submitting to Contract</h4>
                <p className="text-sm text-muted-foreground">
                  Sending commitment hash to smart contract (reveals nothing about your trade)
                </p>
              </div>
            </div>

            {/* Step 3: Generate Proof */}
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              {getStepIcon(3)}
              <div className="flex-1">
                <h4 className="font-medium">Step 3: Generating ZK Proof</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Creating mathematical proof that you know valid trade parameters
                </p>
                
                {/* Circuit Details Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCircuitDetails(!showCircuitDetails)}
                  className="p-0 h-auto text-blue-600"
                >
                  <Code className="h-3 w-3 mr-1" />
                  {showCircuitDetails ? 'Hide' : 'Show'} Circuit Details
                </Button>
                
                {showCircuitDetails && (
                  <div className="mt-2 p-3 bg-slate-50 rounded text-xs">
                    <div className="font-medium mb-2">Noir Circuit Constraints:</div>
                    <div className="space-y-1 text-slate-600">
                      <div>✓ assert(trade_size &gt;= 1 &amp;&amp; trade_size &lt;= 10000)</div>
                      <div>✓ assert(pair_id &lt;= 3) // Valid trading pair</div>
                      <div>✓ assert(is_long == 0 || is_long == 1) // Valid direction</div>
                      <div>✓ assert(hash(inputs) == commitment) // Commitment matches</div>
                    </div>
                  </div>
                )}

                {proof && (
                  <div className="mt-2 bg-muted p-2 rounded text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-3 w-3" />
                      Proof Generated ({proof.proof.length} bytes)
                    </div>
                    <div className="font-mono truncate">{proof.proof}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Execute Trade */}
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              {getStepIcon(4)}
              <div className="flex-1">
                <h4 className="font-medium">Step 4: Contract Verification</h4>
                <p className="text-sm text-muted-foreground">
                  Smart contract verifies proof and executes trade without seeing private details
                </p>
              </div>
            </div>

            {/* Step 5: Complete */}
            {step >= 5 && (
              <div className="flex items-start gap-3 p-3 rounded-lg border border-green-200 bg-green-50">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <h4 className="font-medium text-green-700">✅ Trade Executed Successfully!</h4>
                  <p className="text-sm text-green-600">
                    Your private trade has been executed. Trade details remain hidden from public view.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Educational Note */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">🎓 How Zero-Knowledge Proofs Work:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• You generate a mathematical proof that you know valid trade parameters</li>
              <li>• The proof reveals nothing about the actual values (size, direction, pair)</li>
              <li>• Anyone can verify the proof is valid without learning private information</li>
              <li>• This enables private trading while maintaining blockchain transparency</li>
            </ul>
          </div>

          {/* Close Button */}
          {step >= 5 && (
            <Button onClick={onClose} className="w-full">
              Continue to Dashboard
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
