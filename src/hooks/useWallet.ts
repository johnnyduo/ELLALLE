// Simple wallet connection hook for ELLALLE platform with Hedera Testnet
import { useCallback, useEffect, useState } from 'react';

interface WalletState {
  isConnected: boolean;
  account: string | null;
  chainId: number | null;
  balance: string | null;
  isConnecting: boolean;
  error: string | null;
}

interface UseWalletReturn extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchToHedera: () => Promise<void>;
}

const HEDERA_TESTNET_CHAIN_ID = 296;
const HEDERA_TESTNET_CONFIG = {
  chainId: `0x${HEDERA_TESTNET_CHAIN_ID.toString(16)}`, // 0x128
  chainName: 'Hedera Testnet',
  nativeCurrency: {
    name: 'HBAR',
    symbol: 'HBAR',
    decimals: 18,
  },
  rpcUrls: ['https://testnet.hashio.io/api'],
  blockExplorerUrls: ['https://hashscan.io/testnet'],
};

export const useWallet = (): UseWalletReturn => {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    account: null,
    chainId: null,
    balance: null,
    isConnecting: false,
    error: null,
  });

  // Check if wallet is already connected on component mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setState(prev => ({ ...prev, error: 'MetaMask not installed' }));
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      if (accounts.length > 0) {
        const chainId = await window.ethereum.request({
          method: 'eth_chainId',
        });

        setState(prev => ({
          ...prev,
          isConnected: true,
          account: accounts[0],
          chainId: parseInt(chainId, 16),
          error: null,
        }));

        // Get balance
        getBalance(accounts[0]);
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      setState(prev => ({ ...prev, error: 'Failed to check wallet connection' }));
    }
  };

  const getBalance = async (account: string) => {
    if (!window.ethereum) return;

    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [account, 'latest'],
      });

      // Convert from wei to HBAR (assuming 18 decimals for compatibility)
      const balanceInHBAR = parseInt(balance, 16) / Math.pow(10, 18);
      setState(prev => ({ ...prev, balance: balanceInHBAR.toFixed(4) }));
    } catch (error) {
      console.error('Error getting balance:', error);
    }
  };

  const connect = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setState(prev => ({ ...prev, error: 'MetaMask not installed' }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      setState(prev => ({
        ...prev,
        isConnected: true,
        account: accounts[0],
        chainId: parseInt(chainId, 16),
        isConnecting: false,
        error: null,
      }));

      // Get balance
      await getBalance(accounts[0]);

      // Switch to Hedera Testnet if not already on it
      if (parseInt(chainId, 16) !== HEDERA_TESTNET_CHAIN_ID) {
        await switchToHedera();
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Failed to connect wallet',
      }));
    }
  }, []);

  const disconnect = useCallback(async () => {
    setState({
      isConnected: false,
      account: null,
      chainId: null,
      balance: null,
      isConnecting: false,
      error: null,
    });
  }, []);

  const switchToHedera = useCallback(async () => {
    if (!window.ethereum) {
      setState(prev => ({ ...prev, error: 'MetaMask not installed' }));
      return;
    }

    try {
      // First try to switch to Hedera Testnet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: HEDERA_TESTNET_CONFIG.chainId }],
      });

      setState(prev => ({ ...prev, chainId: HEDERA_TESTNET_CHAIN_ID, error: null }));
    } catch (switchError: any) {
      // If the chain hasn't been added to MetaMask, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [HEDERA_TESTNET_CONFIG],
          });

          setState(prev => ({ ...prev, chainId: HEDERA_TESTNET_CHAIN_ID, error: null }));
        } catch (addError: any) {
          console.error('Error adding Hedera Testnet:', addError);
          setState(prev => ({ ...prev, error: 'Failed to add Hedera Testnet' }));
        }
      } else {
        console.error('Error switching to Hedera Testnet:', switchError);
        setState(prev => ({ ...prev, error: 'Failed to switch to Hedera Testnet' }));
      }
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setState(prev => ({ ...prev, account: accounts[0] }));
        getBalance(accounts[0]);
      }
    };

    const handleChainChanged = (chainId: string) => {
      setState(prev => ({ ...prev, chainId: parseInt(chainId, 16) }));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    switchToHedera,
  };
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (data: any) => void) => void;
      removeListener: (event: string, callback: (data: any) => void) => void;
    };
  }
}
