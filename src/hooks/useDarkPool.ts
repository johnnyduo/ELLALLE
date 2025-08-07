// DarkPool contract interaction hook for ELLALLE platform
import { CONTRACT_CONFIG } from '@/lib/env';
import { useCallback, useEffect, useState } from 'react';

interface DarkPoolState {
  isConnected: boolean;
  balance: { available: string; locked: string } | null;
  markets: string[];
  systemStatus: {
    exists: boolean;
    paused: boolean;
    marketCount: number;
    owner: string;
  } | null;
  loading: boolean;
  error: string | null;
}

interface UseDarkPoolReturn extends DarkPoolState {
  connect: () => Promise<void>;
  deposit: (amount: string) => Promise<string>;
  withdraw: (amount: string) => Promise<string>;
  checkBalance: (address: string) => Promise<void>;
  refreshSystemStatus: () => Promise<void>;
  getStoredMarkets: () => Promise<void>;
}

// Utility functions for web3 operations
const toWei = (amount: string): string => {
  const num = parseFloat(amount);
  return (BigInt(Math.floor(num * 1e18))).toString();
};

const fromWei = (amountWei: string): string => {
  try {
    const bigIntValue = BigInt(amountWei);
    const ethValue = Number(bigIntValue) / 1e18;
    return ethValue.toFixed(4);
  } catch {
    return '0.0000';
  }
};

const toHex = (num: number | bigint): string => `0x${num.toString(16)}`;

// Contract ABI fragments for the functions we need
const CONTRACT_ABI = {
  // HederaDarkPoolManager functions
  depositToDarkpool: '0xd0d9f0ef',
  withdrawFromDarkpool: '0x8c7b6fb0',
  checkDarkPoolAddresses: '0x5c60da1b',
  getUserDarkPoolBalance: '0x7bb98a68',
  // DarkpoolPerpDEX functions
  balanceOf: '0x70a08231',
  owner: '0x8da5cb5b',
  paused: '0x5c975abb',
};

// Encode function call with parameters
const encodeFunctionCall = (signature: string, params: string[] = []): string => {
  if (params.length === 0) {
    return signature;
  }
  // For simple cases, just append padded parameters
  const paddedParams = params.map(param => {
    if (param.startsWith('0x')) {
      return param.slice(2).padStart(64, '0');
    }
    return param.padStart(64, '0');
  }).join('');
  return signature + paddedParams;
};

export const useDarkPool = (): UseDarkPoolReturn => {
  const [state, setState] = useState<DarkPoolState>({
    isConnected: false,
    balance: null,
    markets: [
      'BTC/USD', 'ETH/USD', 'SOL/USD', 'HBAR/USD',
      'ADA/USD', 'AVAX/USD', 'DOT/USD', 'MATIC/USD'
    ],
    systemStatus: {
      exists: true,
      paused: false,
      marketCount: 8,
      owner: '0xD42ba3BB3B2908dc10E499D318Ab867359ca9743',
    },
    loading: false,
    error: null,
  });

  // Get ethereum provider
  const getProvider = useCallback(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      return window.ethereum;
    }
    throw new Error('No Ethereum provider found. Please install MetaMask.');
  }, []);

  // Connect to DarkPool
  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const provider = getProvider();
      
      // Request account access
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Check network
      const chainId = await provider.request({ method: 'eth_chainId' });
      const expectedChainId = toHex(297); // Hedera Previewnet
      
      if (chainId !== expectedChainId) {
        try {
          // Try to switch network
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: expectedChainId }],
          });
        } catch (switchError: any) {
          // If switch fails, try to add the network
          if (switchError.code === 4902) {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: expectedChainId,
                chainName: 'Hedera Previewnet',
                nativeCurrency: {
                  name: 'HBAR',
                  symbol: 'HBAR',
                  decimals: 18,
                },
                rpcUrls: ['https://previewnet.hashio.io/api'],
                blockExplorerUrls: ['https://hashscan.io/previewnet'],
              }],
            });
          } else {
            throw switchError;
          }
        }
      }

      setState(prev => ({ 
        ...prev, 
        isConnected: true, 
        loading: false,
        error: null 
      }));

      // Auto-refresh system status
      await refreshSystemStatus();
      
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to connect to DarkPool',
        isConnected: false,
      }));
    }
  }, []);

  // Deposit HBAR to DarkPool via HederaDarkPoolManager
  const deposit = useCallback(async (amount: string): Promise<string> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const provider = getProvider();
      const accounts = await provider.request({ method: 'eth_accounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No wallet connected');
      }

      console.log('Starting deposit process...');
      console.log('Deposit details:', {
        amount,
        from: accounts[0],
        to: CONTRACT_CONFIG.hederaDarkPoolManager
      });

      // Validate amount
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Invalid deposit amount');
      }

      // Convert amount to wei (hex)
      const amountWei = toWei(amount);
      const amountHex = `0x${BigInt(amountWei).toString(16)}`;
      
      console.log('Amount conversion:', { amount, amountWei, amountHex });
      
      // Validate the amount is not too large
      if (BigInt(amountWei) <= 0) {
        throw new Error('Deposit amount must be greater than 0');
      }

      // Call depositToDarkpool() on HederaDarkPoolManager
      const txParams = {
        from: accounts[0],
        to: CONTRACT_CONFIG.hederaDarkPoolManager,
        value: amountHex,
        data: CONTRACT_ABI.depositToDarkpool,
        gas: toHex(800000), // Increased gas limit for safety
        gasPrice: toHex(50000000000), // 50 gwei for better inclusion
      };
      
      console.log('Transaction params:', txParams);
      
      // Validate transaction parameters
      if (!txParams.to || !txParams.data || !txParams.from) {
        throw new Error('Invalid transaction parameters');
      }

      // Estimate gas first to catch potential errors
      try {
        const gasEstimate = await provider.request({
          method: 'eth_estimateGas',
          params: [txParams],
        });
        console.log('Gas estimate:', gasEstimate);
        
        // Update gas limit with estimate + buffer
        txParams.gas = toHex(Math.floor(parseInt(gasEstimate, 16) * 1.2));
      } catch (gasError: any) {
        console.error('Gas estimation failed:', gasError);
        // If gas estimation fails, the transaction will likely fail
        throw new Error(`Transaction validation failed: ${gasError.message || 'Unable to estimate gas'}`);
      }
      
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      console.log('Deposit transaction hash:', txHash);

      // Wait for transaction confirmation and refresh balance
      setTimeout(async () => {
        try {
          await checkBalance(accounts[0]);
        } catch (error) {
          console.error('Error refreshing balance after deposit:', error);
        }
      }, 3000);
      
      setState(prev => ({ ...prev, loading: false }));
      return txHash;
      
    } catch (error: any) {
      console.error('Deposit error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Deposit failed';
      if (error.code === -32603 && error.message?.includes('400')) {
        errorMessage = 'Transaction rejected by network. Please check your balance and contract permissions.';
      } else if (error.code === 4001) {
        errorMessage = 'Transaction was cancelled by user';
      } else if (error.message?.includes('insufficient')) {
        errorMessage = 'Insufficient balance or gas fees';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw new Error(errorMessage);
    }
  }, []);

  // Withdraw from DarkPool via HederaDarkPoolManager
  const withdraw = useCallback(async (amount: string): Promise<string> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const provider = getProvider();
      const accounts = await provider.request({ method: 'eth_accounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No wallet connected');
      }

      console.log('Starting withdrawal process...');
      console.log('Withdrawal details:', {
        amount,
        from: accounts[0],
        to: CONTRACT_CONFIG.hederaDarkPoolManager,
        contractAddress: CONTRACT_CONFIG.hederaDarkPoolManager
      });

      // Validate amount
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Invalid withdrawal amount');
      }

      // Convert amount to wei (18 decimals for HBAR)
      const amountWei = toWei(amount);
      console.log('Amount conversion:', { amount, amountWei });
      
      // Validate the amount is not too large
      if (BigInt(amountWei) <= 0) {
        throw new Error('Withdrawal amount must be greater than 0');
      }

      // Properly encode the function call data
      const functionSelector = CONTRACT_ABI.withdrawFromDarkpool; // 0x8c7b6fb0
      const amountHex = BigInt(amountWei).toString(16).padStart(64, '0');
      const callData = functionSelector + amountHex;
      
      console.log('Transaction data:', {
        functionSelector,
        amountHex,
        fullCallData: callData,
        dataLength: callData.length
      });
      
      // Prepare transaction parameters with more conservative gas settings
      const txParams = {
        from: accounts[0],
        to: CONTRACT_CONFIG.hederaDarkPoolManager,
        value: '0x0',
        data: callData,
        gas: toHex(800000), // Increased gas limit
        gasPrice: toHex(50000000000), // 50 gwei for better chance of inclusion
      };
      
      console.log('Final transaction params:', txParams);
      
      // Validate transaction parameters
      if (!txParams.to || !txParams.data || !txParams.from) {
        throw new Error('Invalid transaction parameters');
      }

      // Estimate gas first to catch potential errors
      try {
        const gasEstimate = await provider.request({
          method: 'eth_estimateGas',
          params: [txParams],
        });
        console.log('Gas estimate:', gasEstimate);
        
        // Update gas limit with estimate + buffer
        txParams.gas = toHex(Math.floor(parseInt(gasEstimate, 16) * 1.2));
      } catch (gasError: any) {
        console.error('Gas estimation failed:', gasError);
        // If gas estimation fails, the transaction will likely fail
        throw new Error(`Transaction validation failed: ${gasError.message || 'Unable to estimate gas'}`);
      }
      
      // Send the transaction
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      console.log('Withdrawal transaction hash:', txHash);

      // Wait for transaction confirmation and refresh balance
      setTimeout(async () => {
        try {
          await checkBalance(accounts[0]);
        } catch (error) {
          console.error('Error refreshing balance after withdrawal:', error);
        }
      }, 3000);
      
      setState(prev => ({ ...prev, loading: false }));
      return txHash;
      
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Withdrawal failed';
      if (error.code === -32603 && error.message?.includes('400')) {
        errorMessage = 'Transaction rejected by network. Please check your balance and contract permissions.';
      } else if (error.code === 4001) {
        errorMessage = 'Transaction was cancelled by user';
      } else if (error.message?.includes('insufficient')) {
        errorMessage = 'Insufficient balance or gas fees';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw new Error(errorMessage);
    }
  }, []);

  // Check DarkPool contract balance (total HBAR in the contract)
  const checkBalance = useCallback(async (address: string) => {
    if (!address) return;
    
    try {
      const provider = getProvider();
      
      // Get the actual contract balance of the DarkPool
      console.log('Checking DarkPool contract balance...');
      
      const contractBalanceResult = await provider.request({
        method: 'eth_getBalance',
        params: [CONTRACT_CONFIG.darkpoolPerpDEX, 'latest'],
      });
      
      console.log('DarkPool contract balance result:', contractBalanceResult);
      
      if (contractBalanceResult && contractBalanceResult !== '0x0') {
        // Parse the contract balance in wei
        const balanceWei = BigInt(contractBalanceResult);
        const balanceEth = fromWei(balanceWei.toString());
        
        setState(prev => ({
          ...prev,
          balance: { 
            available: balanceEth, 
            locked: '0.0000' // Contract balance is "available" for trading
          },
        }));
        
        console.log('DarkPool contract balance updated:', balanceEth, 'HBAR');
      } else {
        // No balance in contract
        setState(prev => ({
          ...prev,
          balance: { available: '0.0000', locked: '0.0000' },
        }));
      }
    } catch (error: any) {
      console.error('Contract balance check error:', error);
      // Set default balance on error to avoid blocking UI
      setState(prev => ({
        ...prev,
        balance: { available: '0.0000', locked: '0.0000' },
        error: `Balance check failed: ${error.message}`,
      }));
    }
  }, []);

  // Refresh system status from contracts
  const refreshSystemStatus = useCallback(async () => {
    try {
      const provider = getProvider();
      
      // Check if DarkPool contract exists and get basic info
      console.log('Refreshing system status...');
      
      // Call checkDarkPoolAddresses() on HederaDarkPoolManager
      const addressCheckResult = await provider.request({
        method: 'eth_call',
        params: [{
          to: CONTRACT_CONFIG.hederaDarkPoolManager,
          data: CONTRACT_ABI.checkDarkPoolAddresses,
        }, 'latest'],
      });
      
      console.log('Address check result:', addressCheckResult);
      
      // Get contract owner
      const ownerResult = await provider.request({
        method: 'eth_call',
        params: [{
          to: CONTRACT_CONFIG.darkpoolPerpDEX,
          data: CONTRACT_ABI.owner,
        }, 'latest'],
      });
      
      console.log('Owner result:', ownerResult);
      
      // Get paused status
      const pausedResult = await provider.request({
        method: 'eth_call',
        params: [{
          to: CONTRACT_CONFIG.darkpoolPerpDEX,
          data: CONTRACT_ABI.paused,
        }, 'latest'],
      });
      
      console.log('Paused result:', pausedResult);
      
      const exists = addressCheckResult && addressCheckResult !== '0x';
      const owner = ownerResult ? `0x${ownerResult.slice(-40)}` : CONTRACT_CONFIG.darkpoolPerpDEX;
      const paused = pausedResult ? BigInt(pausedResult) > 0 : false;
      
      setState(prev => ({
        ...prev,
        systemStatus: {
          exists,
          paused,
          marketCount: 8, // Default market count
          owner,
        },
      }));
      
      console.log('System status updated:', { exists, paused, owner });
      
    } catch (error: any) {
      console.error('System status refresh error:', error);
      // Set default status on error
      setState(prev => ({
        ...prev,
        systemStatus: {
          exists: true,
          paused: false,
          marketCount: 8,
          owner: CONTRACT_CONFIG.darkpoolPerpDEX,
        },
        error: `Status refresh failed: ${error.message}`,
      }));
    }
  }, []);

  // Get stored markets
  const getStoredMarkets = useCallback(async () => {
    return Promise.resolve();
  }, []);

  // Auto-connect on mount if provider is available
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setState(prev => ({ ...prev, isConnected: true }));
            checkBalance(accounts[0]);
          }
        })
        .catch(console.error);
    }
  }, [checkBalance]);

  return {
    ...state,
    connect,
    deposit,
    withdraw,
    checkBalance,
    refreshSystemStatus,
    getStoredMarkets,
  };
};
