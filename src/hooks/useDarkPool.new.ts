// DarkPool contract interaction hook for ELLALLE platform - Updated for CompactDarkPoolDEX
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
    usdcAddress: string;
  } | null;
  loading: boolean;
  error: string | null;
}

interface UseDarkPoolReturn extends DarkPoolState {
  connect: () => Promise<void>;
  depositUSDC: (amount: string) => Promise<string>;
  withdrawUSDC: (amount: string) => Promise<string>;
  checkBalance: (address: string) => Promise<void>;
  refreshSystemStatus: () => Promise<void>;
  getStoredMarkets: () => Promise<void>;
}

// Utility functions for web3 operations
const toWei = (amount: string): string => {
  const num = parseFloat(amount);
  return (BigInt(Math.floor(num * 1e6))).toString(); // USDC has 6 decimals
};

const fromWei = (amountWei: string, decimals: number = 6): string => {
  try {
    const bigIntValue = BigInt(amountWei);
    const value = Number(bigIntValue) / Math.pow(10, decimals);
    return value.toFixed(decimals);
  } catch {
    return '0.000000';
  }
};

const toHex = (num: number | bigint): string => `0x${num.toString(16)}`;

// CompactDarkPoolDEX ABI function signatures
const CONTRACT_ABI = {
  // USDC functions
  depositUSDC: '0xf2d5d56b',
  withdrawUSDC: '0x3ccfd60b',
  getBalance: '0xf8b2cb4f',
  
  // Market functions
  getMarketSymbols: '0x25b8e7ca',
  getMarket: '0xa2fb1175',
  
  // System functions
  owner: '0x8da5cb5b',
  paused: '0x5c975abb',
  getUSDCAddress: '0x1e83409a',
  
  // Position functions
  openPosition: '0x15e458b8',
  closePosition: '0x43a8d127',
  getUserPositions: '0x44c0e5b1',
  getPosition: '0x791ac947',
};

// Encode function call with parameters
const encodeFunctionCall = (signature: string, params: string[] = []): string => {
  if (params.length === 0) {
    return signature;
  }
  
  const paddedParams = params.map(param => {
    if (param.startsWith('0x')) {
      return param.slice(2).padStart(64, '0');
    }
    return param.padStart(64, '0');
  }).join('');
  
  return signature + paddedParams;
};

// Encode address parameter
const encodeAddress = (address: string): string => {
  return address.toLowerCase().replace('0x', '').padStart(64, '0');
};

// Encode uint256 parameter  
const encodeUint256 = (value: string): string => {
  return BigInt(value).toString(16).padStart(64, '0');
};

export const useDarkPool = (): UseDarkPoolReturn => {
  const [state, setState] = useState<DarkPoolState>({
    isConnected: false,
    balance: null,
    markets: [
      'BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'HBAR/USDC',
      'ADA/USDC', 'AVAX/USDC', 'DOT/USDC', 'MATIC/USDC'
    ],
    systemStatus: {
      exists: true,
      paused: false,
      marketCount: 8,
      owner: '0xda00Ac16510536E3AcF70C9Ab6cbb75dd467BbEc',
      usdcAddress: '0x1b20865c8C1B8B50cC19F54D8Da4873bfFcaD1F3',
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
                rpcUrls: ['https://testnet.hashio.io/api'],
                blockExplorerUrls: ['https://hashscan.io/testnet'],
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

  // Deposit USDC to CompactDarkPoolDEX
  const depositUSDC = useCallback(async (amount: string): Promise<string> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const provider = getProvider();
      const accounts = await provider.request({ method: 'eth_accounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No wallet connected');
      }

      console.log('Starting USDC deposit process...');
      console.log('Deposit details:', {
        amount,
        from: accounts[0],
        to: CONTRACT_CONFIG.compactDarkPoolDEX
      });

      // Validate amount
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Invalid deposit amount');
      }

      // Convert amount to USDC units (6 decimals)
      const amountUsdc = toWei(amount);
      const data = encodeFunctionCall(CONTRACT_ABI.depositUSDC, [encodeUint256(amountUsdc)]);
      
      console.log('Amount conversion:', { amount, amountUsdc, data });

      // Call depositUSDC() on CompactDarkPoolDEX
      const txParams = {
        from: accounts[0],
        to: CONTRACT_CONFIG.compactDarkPoolDEX,
        value: '0x0', // No ETH value for USDC deposit
        data: data,
        gas: toHex(300000),
        gasPrice: toHex(20000000000), // 20 gwei
      };
      
      console.log('Transaction params:', txParams);

      // Estimate gas first
      try {
        const gasEstimate = await provider.request({
          method: 'eth_estimateGas',
          params: [txParams],
        });
        console.log('Gas estimate:', gasEstimate);
        txParams.gas = toHex(Math.floor(parseInt(gasEstimate, 16) * 1.2));
      } catch (gasError: any) {
        console.error('Gas estimation failed:', gasError);
        throw new Error(`Transaction validation failed: ${gasError.message || 'Unable to estimate gas'}`);
      }
      
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      console.log('USDC deposit transaction hash:', txHash);

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
      console.error('USDC deposit error:', error);
      
      let errorMessage = 'USDC deposit failed';
      if (error.code === 4001) {
        errorMessage = 'Transaction was cancelled by user';
      } else if (error.message?.includes('insufficient')) {
        errorMessage = 'Insufficient USDC balance or gas fees';
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

  // Withdraw USDC from CompactDarkPoolDEX
  const withdrawUSDC = useCallback(async (amount: string): Promise<string> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const provider = getProvider();
      const accounts = await provider.request({ method: 'eth_accounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No wallet connected');
      }

      console.log('Starting USDC withdrawal process...');

      // Validate amount
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Invalid withdrawal amount');
      }

      // Convert amount to USDC units (6 decimals)
      const amountUsdc = toWei(amount);
      const data = encodeFunctionCall(CONTRACT_ABI.withdrawUSDC, [encodeUint256(amountUsdc)]);

      const txParams = {
        from: accounts[0],
        to: CONTRACT_CONFIG.compactDarkPoolDEX,
        value: '0x0',
        data: data,
        gas: toHex(300000),
        gasPrice: toHex(20000000000),
      };

      console.log('Withdrawal transaction params:', txParams);

      // Estimate gas
      try {
        const gasEstimate = await provider.request({
          method: 'eth_estimateGas',
          params: [txParams],
        });
        txParams.gas = toHex(Math.floor(parseInt(gasEstimate, 16) * 1.2));
      } catch (gasError: any) {
        console.error('Gas estimation failed:', gasError);
        throw new Error(`Transaction validation failed: ${gasError.message}`);
      }

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      console.log('USDC withdrawal transaction hash:', txHash);

      // Refresh balance after withdrawal
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
      console.error('USDC withdrawal error:', error);
      
      let errorMessage = 'USDC withdrawal failed';
      if (error.code === 4001) {
        errorMessage = 'Transaction was cancelled by user';
      } else if (error.message?.includes('insufficient')) {
        errorMessage = 'Insufficient DarkPool balance';
      } else if (error.message?.includes('locked')) {
        errorMessage = 'Balance is locked in open positions';
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

  // Check balance for a specific address using CompactDarkPoolDEX
  const checkBalance = useCallback(async (address: string) => {
    if (!address) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const provider = getProvider();
      
      // Call getBalance(address) on CompactDarkPoolDEX
      const data = encodeFunctionCall(CONTRACT_ABI.getBalance, [encodeAddress(address)]);
      
      const result = await provider.request({
        method: 'eth_call',
        params: [{
          to: CONTRACT_CONFIG.compactDarkPoolDEX,
          data: data,
        }, 'latest'],
      });
      
      if (result && result !== '0x') {
        // Parse returned data (available, locked)
        const available = fromWei(result.slice(2, 66), 6); // First 32 bytes
        const locked = fromWei(result.slice(66, 130), 6); // Second 32 bytes
        
        setState(prev => ({
          ...prev,
          balance: { available, locked },
          loading: false,
        }));
      }
      
    } catch (error: any) {
      console.error('Error checking balance:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to check balance',
      }));
    }
  }, []);

  // Refresh system status using CompactDarkPoolDEX
  const refreshSystemStatus = useCallback(async () => {
    try {
      const provider = getProvider();
      
      // Check if contract exists and get basic info
      const [ownerResult, pausedResult, usdcResult] = await Promise.all([
        provider.request({
          method: 'eth_call',
          params: [{
            to: CONTRACT_CONFIG.compactDarkPoolDEX,
            data: CONTRACT_ABI.owner,
          }, 'latest'],
        }),
        provider.request({
          method: 'eth_call',
          params: [{
            to: CONTRACT_CONFIG.compactDarkPoolDEX,
            data: CONTRACT_ABI.paused,
          }, 'latest'],
        }),
        provider.request({
          method: 'eth_call',
          params: [{
            to: CONTRACT_CONFIG.compactDarkPoolDEX,
            data: CONTRACT_ABI.getUSDCAddress,
          }, 'latest'],
        }),
      ]);
      
      const exists = ownerResult !== '0x';
      const paused = pausedResult && parseInt(pausedResult, 16) === 1;
      const owner = ownerResult ? `0x${ownerResult.slice(26)}` : '';
      const usdcAddress = usdcResult ? `0x${usdcResult.slice(26)}` : '';
      
      setState(prev => ({
        ...prev,
        systemStatus: {
          exists,
          paused,
          marketCount: 8,
          owner,
          usdcAddress,
        },
      }));
      
    } catch (error: any) {
      console.error('Error refreshing system status:', error);
      setState(prev => ({
        ...prev,
        systemStatus: {
          exists: true,
          paused: false,
          marketCount: 8,
          owner: CONTRACT_CONFIG.compactDarkPoolDEX,
          usdcAddress: '0x1b20865c8C1B8B50cC19F54D8Da4873bfFcaD1F3',
        },
        error: error.message || 'Failed to refresh system status',
      }));
    }
  }, []);

  // Get stored markets from CompactDarkPoolDEX
  const getStoredMarkets = useCallback(async () => {
    try {
      const provider = getProvider();
      
      // Call getMarketSymbols() on CompactDarkPoolDEX
      const result = await provider.request({
        method: 'eth_call',
        params: [{
          to: CONTRACT_CONFIG.compactDarkPoolDEX,
          data: CONTRACT_ABI.getMarketSymbols,
        }, 'latest'],
      });
      
      if (result && result !== '0x') {
        // For now, use the default markets we know are initialized
        const markets = [
          'BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'HBAR/USDC',
          'ADA/USDC', 'AVAX/USDC', 'DOT/USDC', 'MATIC/USDC'
        ];
        
        setState(prev => ({
          ...prev,
          markets,
        }));
      }
      
    } catch (error: any) {
      console.error('Error getting stored markets:', error);
      // Use default markets on error
      setState(prev => ({
        ...prev,
        markets: [
          'BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'HBAR/USDC',
          'ADA/USDC', 'AVAX/USDC', 'DOT/USDC', 'MATIC/USDC'
        ],
      }));
    }
  }, []);

  // Auto-refresh system status on mount
  useEffect(() => {
    refreshSystemStatus();
  }, [refreshSystemStatus]);

  return {
    ...state,
    connect,
    depositUSDC,
    withdrawUSDC,
    checkBalance,
    refreshSystemStatus,
    getStoredMarkets,
  };
};
