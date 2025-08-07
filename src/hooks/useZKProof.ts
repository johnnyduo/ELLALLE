import { TradeStorageManager } from '@/lib/storage/tradeStorage';
import { zkProofGenerator } from '@/lib/zkp/mockProofGenerator';
import { PendingTrade, TradeIntent, ZKPProgress, ZKProof, ZKPStatus } from '@/types/zkp';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export const useZKProof = () => {
  const [zkpStatus, setZkpStatus] = useState<ZKPStatus>('idle');
  const [currentProgress, setCurrentProgress] = useState<ZKPProgress | null>(null);
  const [pendingTrades, setPendingTrades] = useState<Record<string, PendingTrade>>({});
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);

  // Load pending trades from localStorage on mount
  useEffect(() => {
    const trades = TradeStorageManager.getPendingTrades();
    setPendingTrades(trades);
  }, []);

  const generateProof = useCallback(async (intent: TradeIntent): Promise<ZKProof | null> => {
    if (isGeneratingProof) {
      toast.error('Proof generation already in progress');
      return null;
    }

    try {
      setIsGeneratingProof(true);
      setZkpStatus('generating');
      
      // Create pending trade entry
      const tradeId = TradeStorageManager.generateTradeId();
      const pendingTrade: PendingTrade = {
        id: tradeId,
        intent,
        status: 'proving',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // Save to storage and update state
      TradeStorageManager.savePendingTrade(pendingTrade);
      setPendingTrades(prev => ({ ...prev, [tradeId]: pendingTrade }));

      // Generate ZK proof with progress updates
      const proof = await zkProofGenerator.generateTradeProof(intent, (progress) => {
        setCurrentProgress(progress);
      });

      // Update trade with proof
      TradeStorageManager.updateTradeProof(tradeId, proof);
      setPendingTrades(prev => ({
        ...prev,
        [tradeId]: {
          ...prev[tradeId],
          proof,
          status: 'ready',
          updatedAt: Date.now()
        }
      }));

      setZkpStatus('ready');
      setCurrentProgress(null);
      toast.success('ZK proof generated successfully!');
      
      return proof;

    } catch (error) {
      setZkpStatus('error');
      setCurrentProgress(null);
      
      const errorMessage = error instanceof Error ? error.message : 'Proof generation failed';
      toast.error(`Proof generation failed: ${errorMessage}`);
      
      console.error('ZK proof generation error:', error);
      return null;
    } finally {
      setIsGeneratingProof(false);
    }
  }, [isGeneratingProof]);

  const submitProof = useCallback(async (proof: ZKProof): Promise<string | null> => {
    try {
      setZkpStatus('verifying');
      
      // Simulate contract submission
      // In real implementation, this would call the NoirVerifier contract
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock transaction hash
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      setZkpStatus('verified');
      toast.success('Proof verified on-chain!');
      
      return txHash;
    } catch (error) {
      setZkpStatus('error');
      
      const errorMessage = error instanceof Error ? error.message : 'Proof verification failed';
      toast.error(`Proof verification failed: ${errorMessage}`);
      
      console.error('Proof verification error:', error);
      return null;
    }
  }, []);

  const updateTradeStatus = useCallback((
    tradeId: string, 
    status: PendingTrade['status'], 
    txHash?: string,
    errorMessage?: string
  ) => {
    TradeStorageManager.updateTradeStatus(tradeId, status, txHash, errorMessage);
    
    setPendingTrades(prev => {
      if (prev[tradeId]) {
        return {
          ...prev,
          [tradeId]: {
            ...prev[tradeId],
            status,
            txHash,
            errorMessage,
            updatedAt: Date.now()
          }
        };
      }
      return prev;
    });
  }, []);

  const clearPendingTrade = useCallback((tradeId: string) => {
    TradeStorageManager.removeTrade(tradeId);
    setPendingTrades(prev => {
      const newTrades = { ...prev };
      delete newTrades[tradeId];
      return newTrades;
    });
  }, []);

  const refreshPendingTrades = useCallback(() => {
    const trades = TradeStorageManager.getPendingTrades();
    setPendingTrades(trades);
  }, []);

  const resetZKPStatus = useCallback(() => {
    setZkpStatus('idle');
    setCurrentProgress(null);
  }, []);

  return {
    // Status
    zkpStatus,
    currentProgress,
    isGeneratingProof,
    
    // Data
    pendingTrades: Object.values(pendingTrades),
    pendingTradesCount: Object.keys(pendingTrades).length,
    
    // Actions
    generateProof,
    submitProof,
    updateTradeStatus,
    clearPendingTrade,
    refreshPendingTrades,
    resetZKPStatus
  };
};
