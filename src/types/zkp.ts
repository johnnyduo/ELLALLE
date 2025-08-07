// ZKP Types for DarkPool Trading
export interface TradeIntent {
  userId: string;
  symbol: string;
  amount: number;
  price: number;
  side: 'long' | 'short';
  leverage: number;
  timestamp: number;
  nonce: string;
}

export interface ZKProof {
  proof: string;
  publicInputs: string[];
  proofHash: string;
  verificationKey: string;
  metadata: {
    circuitName: string;
    version: string;
    generatedAt: number;
  };
}

export type ZKPStatus = 'idle' | 'generating' | 'ready' | 'verifying' | 'verified' | 'error';

export interface PendingTrade {
  id: string;
  intent: TradeIntent;
  proof?: ZKProof;
  status: 'pending' | 'proving' | 'ready' | 'submitted' | 'confirmed' | 'error';
  txHash?: string;
  createdAt: number;
  updatedAt: number;
  errorMessage?: string;
}

export interface ZKPProgress {
  step: string;
  progress: number;
  message: string;
}
