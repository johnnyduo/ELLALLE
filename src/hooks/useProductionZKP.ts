/**
 * Production ZKP Hook - Updated to match successful script workflow
 * Integrates with ProductionZKPService for reliable ZKP trading
 */

import { zkpService, TradeParams, TradeResult } from '@/services/ProductionZKPService';
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export interface ZKPBalances {
  hbar: string;
  usdc: string;
  native: string;
  address: string;
}

export interface ZKPTradeState {
  balances: ZKPBalances | null;
  loading: boolean;
  error: string | null;
  currentTrade: TradeResult | null;
  tradeHistory: TradeResult[];
}

export const useProductionZKP = () => {
  const [state, setState] = useState<ZKPTradeState>({
    balances: null,
    loading: false,
    error: null,
    currentTrade: null,
    tradeHistory: []
  });

  // Load balances on mount
  useEffect(() => {
    loadBalances();
  }, []);

  const loadBalances = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const balances = await zkpService.checkBalances();
      
      setState(prev => ({ 
        ...prev, 
        balances, 
        loading: false 
      }));
      
      console.log('✅ Balances loaded:', balances);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load balances';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      toast.error('Failed to load balances: ' + errorMessage);
    }
  }, []);

  const executeTrade = useCallback(async (params: TradeParams): Promise<TradeResult> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      toast.info('🚀 Starting ZKP trade execution...');
      
      // Execute the complete ZKP trade flow
      const result = await zkpService.executeCompleteZKPTrade(params);
      
      if (result.success) {
        toast.success('🎉 ZKP trade executed successfully!');
        
        // Add to trade history
        setState(prev => ({
          ...prev,
          currentTrade: result,
          tradeHistory: [result, ...prev.tradeHistory],
          loading: false
        }));
        
        // Refresh balances after successful trade
        await loadBalances();
        
        console.log('✅ Trade completed:', result);
      } else {
        toast.error('❌ Trade failed: ' + result.error);
        
        setState(prev => ({
          ...prev,
          error: result.error || 'Trade failed',
          loading: false
        }));
      }
      
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Trade execution failed';
      
      toast.error('❌ Trade failed: ' + errorMessage);
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      return {
        success: false,
        error: errorMessage,
        stage: 'execution'
      };
    }
  }, [loadBalances]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refreshBalances = useCallback(() => {
    return loadBalances();
  }, [loadBalances]);

  return {
    // State
    balances: state.balances,
    loading: state.loading,
    error: state.error,
    currentTrade: state.currentTrade,
    tradeHistory: state.tradeHistory,
    
    // Actions
    executeTrade,
    refreshBalances,
    clearError,
    
    // Computed
    hasBalances: !!state.balances,
    canTrade: !state.loading && !!state.balances,
    isConnected: !!state.balances?.address
  };
};
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

      // Step 1: Generate Commitment
      setCurrentOperation('generating_commitment');
      const commitmentData = zkpService.generateCommitment({
        size: params.size,
        isLong: params.isLong,
        pairId: 0, // BTC/USD pair
        leverage: params.leverage,
        traderAddress: '0x0' // Will be set by service
      });

      // Step 2: Submit Commitment
      setCurrentOperation('submitting_commitment');
      const commitmentTx = await zkpService.submitCommitment(commitmentData.commitment);
      updateTradeStatus(tradeExecution.tradeId, 'committed', commitmentTx);
      
      toast.success('✅ Commitment submitted to blockchain', {
        description: `Transaction: ${commitmentTx.slice(0, 10)}...`,
      });

      // Step 3: Generate ZK Proof
      setCurrentOperation('generating_proof');
      const proof = await zkpService.generateProof({
        size: params.size,
        isLong: params.isLong,
        pairId: 0,
        leverage: params.leverage,
        traderAddress: '0x0',
        secret: commitmentData.secret
      }, commitmentData.commitment);
      updateTradeStatus(tradeExecution.tradeId, 'proved');
      
      toast.success('🔐 Zero-knowledge proof generated', {
        description: 'Trade privacy mathematically guaranteed',
      });

      // Step 4: Execute Trade
      setCurrentOperation('executing_trade');
      const executionTx = await zkpService.executeTrade(proof, {
        size: params.size,
        isLong: params.isLong,
        leverage: params.leverage,
        useHBAR: false
      });
      updateTradeStatus(tradeExecution.tradeId, 'executed', executionTx);
      
      toast.success('🎯 ZKP trade executed successfully!', {
        description: `Private ${params.isLong ? 'long' : 'short'} position opened`,
        action: {
          label: 'View on Hashscan',
          onClick: () => window.open(`https://hashscan.io/testnet/transaction/${executionTx}`, '_blank')
        }
      });
      
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
