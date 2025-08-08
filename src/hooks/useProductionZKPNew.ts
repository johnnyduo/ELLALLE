/**
 * Production ZKP Hook - Updated to match successful script workflow
 * Integrates with ProductionZKPService for reliable ZKP trading
 */

import { TradeHistoryItem, TradeParams, TradeResult, zkpService } from '@/services/ProductionZKPService';
import { useCallback, useEffect, useState } from 'react';
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
  tradeHistory: TradeHistoryItem[];
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
    loadTradeHistory();
  }, []);

  const loadTradeHistory = useCallback(async () => {
    try {
      const history = await zkpService.getTradeHistory();
      setState(prev => ({ 
        ...prev, 
        tradeHistory: history 
      }));
    } catch (error) {
      console.error('❌ Error loading trade history:', error);
    }
  }, []);

  const loadBalances = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const balances = await zkpService.checkBalances(forceRefresh);
      
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
        
        // Update current trade
        setState(prev => ({
          ...prev,
          currentTrade: result,
          loading: false
        }));
        
        // Refresh balances and trade history after successful trade
        // Force refresh balances to reflect the trade immediately
        setTimeout(async () => {
          try {
            console.log('🔄 Force refreshing balances after trade...');
            const freshBalances = await zkpService.forceRefreshBalances();
            setState(prev => ({ 
              ...prev, 
              balances: freshBalances 
            }));
            console.log('✅ Balances refreshed after trade:', freshBalances);
          } catch (error) {
            console.error('❌ Error refreshing balances:', error);
          }
        }, 2000);
        
        // Refresh trade history to show the new trade
        setTimeout(() => {
          loadTradeHistory();
        }, 1000);
        
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
    return loadBalances(false);
  }, [loadBalances]);

  const forceRefreshBalances = useCallback(() => {
    return loadBalances(true);
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
    forceRefreshBalances,
    loadTradeHistory,
    clearError,
    
    // Computed
    hasBalances: !!state.balances,
    canTrade: !state.loading && !!state.balances,
    isConnected: !!state.balances?.address
  };
};
