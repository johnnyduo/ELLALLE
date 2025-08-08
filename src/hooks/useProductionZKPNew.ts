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
        // Increased delay to ensure blockchain state has updated
        setTimeout(async () => {
          try {
            console.log('🔄 Force refreshing balances after trade...');
            const freshBalances = await zkpService.checkBalances(true);
            setState(prev => ({ 
              ...prev, 
              balances: freshBalances 
            }));
            console.log('✅ Balances refreshed after trade:', freshBalances);
          } catch (error) {
            console.error('❌ Error refreshing balances:', error);
          }
        }, 5000); // Increased from 2000ms to 5000ms
        
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

  const closePosition = useCallback(async (tradeId: string): Promise<{ success: boolean; message: string; txHash?: string }> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await zkpService.closePosition(tradeId);
      
      if (result.success) {
        // Refresh trade history and balances
        await Promise.all([
          loadTradeHistory(),
          loadBalances(true)
        ]);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error closing position:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ 
        ...prev, 
        error: `Close position failed: ${errorMessage}`,
        loading: false 
      }));
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [loadTradeHistory, loadBalances]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refreshBalances = useCallback(() => {
    return loadBalances(false);
  }, [loadBalances]);

  const forceRefreshBalances = useCallback(() => {
    return loadBalances(true);
  }, [loadBalances]);

  // Load balances on mount and listen for refresh events
  useEffect(() => {
    loadBalances();
    loadTradeHistory();

    // Listen for balance refresh events
    const handleBalanceRefresh = () => {
      console.log('🔄 Balance refresh event received');
      loadBalances(true);
      loadTradeHistory();
    };
    
    // Listen for trade update events (position close, etc.)
    const handleTradeUpdate = (event: any) => {
      console.log('🔄 Trade update event received:', event.detail);
      loadTradeHistory();
    };

    // Listen for position closed events for immediate UI update
    const handlePositionClosed = (event: any) => {
      console.log('🔄 Position closed event received:', event.detail);
      // Force immediate refresh of trade history
      loadTradeHistory();
      // Also refresh balances
      loadBalances(true);
    };

    window.addEventListener('zkp-balance-refresh', handleBalanceRefresh);
    window.addEventListener('zkp-trade-update', handleTradeUpdate);
    window.addEventListener('zkp-position-closed', handlePositionClosed);

    return () => {
      window.removeEventListener('zkp-balance-refresh', handleBalanceRefresh);
      window.removeEventListener('zkp-trade-update', handleTradeUpdate);
      window.removeEventListener('zkp-position-closed', handlePositionClosed);
    };
  }, [loadBalances, loadTradeHistory]);

  return {
    // State
    balances: state.balances,
    loading: state.loading,
    error: state.error,
    currentTrade: state.currentTrade,
    tradeHistory: state.tradeHistory,
    
    // Actions
    executeTrade,
    closePosition,
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
