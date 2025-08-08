import { keccak256, solidityPacked, toBeHex, zeroPadValue } from 'ethers';
import { useCallback, useState } from 'react';

interface TradeParams {
  size: string;        // Trade size in tokens
  isLong: boolean;     // true = long, false = short  
  pairId: number;      // 0=HBAR/USD, 1=BTC/USD, 2=ETH/USD, 3=SOL/USD
  leverage: number;    // Leverage multiplier (1x to 100x)
  traderAddress: string;
}

interface ZKPProof {
  proof: string;
  publicInputs: string[];
  commitment: string;
}

interface UseNoirProofReturn {
  generateCommitment: (params: TradeParams) => Promise<string>;
  generateProof: (params: TradeParams, commitment: string) => Promise<ZKPProof>;
  verifyProof: (proof: ZKPProof) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

// Trading pair configuration
export const TRADING_PAIRS = [
  { id: 0, name: 'HBAR/USD', symbol: 'HBAR', decimals: 8 },
  { id: 1, name: 'BTC/USD', symbol: 'BTC', decimals: 8 },
  { id: 2, name: 'ETH/USD', symbol: 'ETH', decimals: 18 },
  { id: 3, name: 'SOL/USD', symbol: 'SOL', decimals: 9 },
];

export const useNoirProof = (): UseNoirProofReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate commitment hash from trade parameters
  const generateCommitment = useCallback(async (params: TradeParams): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔐 Generating commitment for trade:', params);

      // Generate random secret for uniqueness
      const traderSecret = Math.floor(Math.random() * 1000000000000).toString();
      
      // Convert boolean to number for hashing
      const direction = params.isLong ? 1 : 0;
      
      // Convert size to wei (multiply by 1e6 for USDC 6 decimals)
      const sizeInWei = BigInt(Math.floor(parseFloat(params.size) * 1e6));
      
      // Create commitment hash using the same method as Noir circuit
      const commitment = keccak256(
        solidityPacked(
          ['uint256', 'uint256', 'uint256', 'uint256', 'uint256'],
          [sizeInWei, direction, params.pairId, params.leverage, traderSecret]
        )
      );

      console.log('✅ Commitment generated:', {
        size: params.size + ' tokens (' + sizeInWei.toString() + ' units)',
        direction: params.isLong ? 'Long' : 'Short',
        leverage: params.leverage + 'x',
        pair: TRADING_PAIRS[params.pairId].name,
        commitment: commitment,
        secret: traderSecret
      });

      // Store secret for proof generation (in real app, use secure storage)
      sessionStorage.setItem('traderSecret', traderSecret);
      
      return commitment;

    } catch (err: any) {
      const errorMsg = err.message || 'Failed to generate commitment';
      console.error('❌ Commitment generation error:', errorMsg);
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate ZK proof (mock implementation for demo)
  const generateProof = useCallback(async (
    params: TradeParams, 
    commitment: string
  ): Promise<ZKPProof> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🧠 Generating ZK proof...');
      console.log('Private inputs (hidden):', {
        size: params.size + ' tokens',
        direction: params.isLong ? 'Long' : 'Short',
        leverage: params.leverage + 'x',
        pair: TRADING_PAIRS[params.pairId].name,
        secret: '***hidden***'
      });

      // Simulate proof generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get stored secret
      const traderSecret = sessionStorage.getItem('traderSecret') || '0';

      // Create mock proof (in real implementation, use Noir.js)
      const mockProof = {
        proof: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        publicInputs: [
          commitment,                                                         // commitment hash (bytes32)
          zeroPadValue(params.traderAddress.startsWith('0x') ? params.traderAddress : '0x' + '0'.repeat(40), 32), // trader address padded to bytes32
          toBeHex(1, 32),                                                    // min_size as bytes32
          toBeHex(10000, 32),                                                // max_size as bytes32
          toBeHex(params.leverage, 32)                                       // leverage as bytes32
        ],
        commitment
      };

      console.log('✅ ZK Proof generated:', {
        proofLength: mockProof.proof.length,
        publicInputsCount: mockProof.publicInputs.length,
        commitment: commitment
      });

      return mockProof;

    } catch (err: any) {
      const errorMsg = err.message || 'Failed to generate proof';
      console.error('❌ Proof generation error:', errorMsg);
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify proof (mock implementation)
  const verifyProof = useCallback(async (proof: ZKPProof): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Verifying proof...');
      
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock verification (always returns true for demo)
      const isValid = proof.proof.length > 60 && proof.publicInputs.length === 5;

      console.log('✅ Proof verification result:', isValid);
      
      return isValid;

    } catch (err: any) {
      const errorMsg = err.message || 'Failed to verify proof';
      console.error('❌ Proof verification error:', errorMsg);
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    generateCommitment,
    generateProof,
    verifyProof,
    loading,
    error
  };
};
