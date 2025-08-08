/**
 * Production ZKP Trading Hook
 * Comprehensive zero-knowledge proof trading implementation
 * Integrates with deployed ProductionNoirVerifier on Hedera Testnet
 */

import { TradeExecution, ZKPService } from '@/services/ZKPService';
import { BrowserProvider } from 'ethers';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

type OperationStatus = 'idle' | 'generating_commitment' | 'submitting_commitment' | 'generating_proof' | 'executing_trade';

interface TradeParams {
  symbol: string;
  isLong: boolean;
  size: string;
  price: string;
  leverage: number;
}

export function useProductionZKP() {
  const [trades, setTrades] = useState<TradeExecution[]>([]);
  const [currentOperation, setCurrentOperation] = useState<OperationStatus>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const zkpServiceRef = useRef<ZKPService | null>(null);

  // Initialize ZKP Service
  const getZKPService = useCallback(async (): Promise<ZKPService> => {
    if (!zkpServiceRef.current) {
      zkpServiceRef.current = new ZKPService();
    }
    return zkpServiceRef.current;
  }, []);

  // Update trade status
  const updateTradeStatus = useCallback((tradeId: string, status: TradeExecution['status'], txHash?: string) => {
    setTrades(prev => prev.map(trade => {
      if (trade.tradeId === tradeId) {
        const updated = { ...trade, status };
        if (txHash) {
          if (status === 'committed') {
            updated.txHashes.commitment = txHash;
          } else if (status === 'executed') {
            updated.txHashes.execution = txHash;
          }
        }
        return updated;
      }
      return trade;
    }));
  }, []);

  // Execute ZKP Trade
  const executeZKPTrade = useCallback(async (params: TradeParams): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const zkpService = await getZKPService();
      
      // Create trade execution record
      const tradeExecution: TradeExecution = {
        tradeId: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        commitment: '',
        proof: {
          proof: '',
          publicInputs: [],
          commitment: ''
        },
        size: params.size,
        isLong: params.isLong,
        leverage: params.leverage,
        traderAddress: '0x0', // Will be set by service
        status: 'pending',
        timestamp: Date.now(),
        txHashes: {}
      };
      
      // Add to trades list
      setTrades(prev => [...prev, tradeExecution]);
      
      toast.info('🔐 Starting ZKP trade execution...', {
        description: `${params.isLong ? 'Long' : 'Short'} ${params.size} ${params.symbol} • ${params.leverage}x leverage`,
      });

      // Get the user's wallet address first
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const traderAddress = await signer.getAddress();

      // Step 1: Check USDC balance first
      toast.info('💰 Checking USDC balance...', {
        description: 'Ensuring sufficient funds for trade'
      });

      const tradeValue = (parseFloat(params.size) * parseFloat(params.price) * params.leverage).toString();
      const balanceCheck = await zkpService.checkUSDCBalance(traderAddress, tradeValue);
      
      if (!balanceCheck.hasBalance) {
        toast.error('❌ Insufficient USDC balance', {
          description: `Required: ${balanceCheck.required} USDC, Available: ${balanceCheck.currentBalance} USDC`,
          action: {
            label: 'Get Test USDC',
            onClick: () => {
              // Import and use faucet service
              import('@/services/USDCFaucetService').then(({ usdcFaucetService }) => {
                usdcFaucetService.requestTokens();
              });
            }
          }
        });
        
        // Continue with demo trade anyway (for testing)
        toast.info('🎭 Continuing with demo trade...', {
          description: 'Using simulated USDC for testing purposes'
        });
      } else {
        toast.success('✅ USDC balance sufficient', {
          description: `Available: ${balanceCheck.currentBalance} USDC`
        });
      }

      // Step 2: Generate Commitment with proper trader address
      setCurrentOperation('generating_commitment');
      
      const commitmentData = zkpService.generateCommitment({
        size: params.size,
        isLong: params.isLong,
        pairId: 0, // BTC/USD pair
        leverage: params.leverage,
        traderAddress: traderAddress // Use actual wallet address
      });

      // Step 3: Submit Commitment
      setCurrentOperation('submitting_commitment');
      
      // Show info about commitment attempt
      toast.info('🔐 Submitting commitment to blockchain...', {
        description: 'Trying ZK Verifier first, with DarkPool fallback ready'
      });
      
      const commitmentResult = await zkpService.submitCommitment(commitmentData.commitment);
      updateTradeStatus(tradeExecution.tradeId, 'committed', commitmentResult.txHash);
      
      // Show appropriate success message based on method used
      if (commitmentResult.method === 'NoirVerifier') {
        toast.success('✅ Commitment submitted via ZK Verifier', {
          description: `Transaction: ${commitmentResult.txHash.slice(0, 10)}...`,
        });
      } else if (commitmentResult.method === 'DarkPool') {
        toast.success('✅ Commitment submitted via DarkPool', {
          description: `Fallback successful: ${commitmentResult.txHash.slice(0, 10)}...`,
        });
      } else {
        toast.success('✅ Commitment processed successfully', {
          description: `Demo mode: ${commitmentResult.txHash.slice(0, 10)}...`,
        });
      }

      // Step 4: Generate ZK Proof with proper trader address
      setCurrentOperation('generating_proof');
      const proof = await zkpService.generateProof({
        size: params.size,
        isLong: params.isLong,
        pairId: 0,
        leverage: params.leverage,
        traderAddress: traderAddress, // Use actual wallet address
        secret: commitmentData.secret
      }, commitmentData.commitment);
      updateTradeStatus(tradeExecution.tradeId, 'proved');
      
      toast.success('🔐 Zero-knowledge proof generated', {
        description: 'Trade privacy mathematically guaranteed',
      });

      // Step 5: Execute Trade
      setCurrentOperation('executing_trade');
      const executionResult = await zkpService.executeTrade(proof, {
        size: params.size,
        isLong: params.isLong,
        leverage: params.leverage,
        useHBAR: false
      });
      updateTradeStatus(tradeExecution.tradeId, 'executed', executionResult.txHash);
      
      // Show appropriate success message based on execution method
      if (executionResult.method === 'DarkPool') {
        toast.success('🎯 ZKP trade executed via DarkPool!', {
          description: `Private ${params.isLong ? 'long' : 'short'} position opened`,
          action: {
            label: 'View on Hashscan',
            onClick: () => window.open(`https://hashscan.io/testnet/transaction/${executionResult.txHash}`, '_blank')
          }
        });
      } else {
        toast.success('🎯 ZKP trade executed successfully!', {
          description: `Private ${params.isLong ? 'long' : 'short'} position opened (Demo mode)`,
        });
      }
      
      return true;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      // Update trade status to failed
      setTrades(prev => prev.map(trade => {
        if (trade.status === 'pending' || trade.status === 'committed' || trade.status === 'proved') {
          return { ...trade, status: 'failed' };
        }
        return trade;
      }));
      
      toast.error('❌ ZKP trade failed', {
        description: errorMessage,
      });
      
      return false;
    } finally {
      setLoading(false);
      setCurrentOperation('idle');
    }
  }, [getZKPService, updateTradeStatus]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear completed trades
  const clearCompletedTrades = useCallback(() => {
    setTrades(prev => prev.filter(trade => 
      trade.status !== 'executed' && trade.status !== 'failed'
    ));
  }, []);

  // Get trade statistics
  const getTradeStats = useCallback(() => {
    const total = trades.length;
    const executed = trades.filter(t => t.status === 'executed').length;
    const failed = trades.filter(t => t.status === 'failed').length;
    const active = trades.filter(t => 
      t.status === 'pending' || t.status === 'committed' || t.status === 'proved'
    ).length;
    
    return { total, executed, failed, active };
  }, [trades]);

  return {
    // State
    trades,
    currentOperation,
    loading,
    error,
    
    // Actions
    executeZKPTrade,
    clearError,
    clearCompletedTrades,
    updateTradeStatus,
    
    // Computed
    tradeStats: getTradeStats(),
    
    // Service access
    getZKPService
  };
}
