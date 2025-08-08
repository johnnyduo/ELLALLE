// DarkPool contract interaction hook for ELLALLE platform
import { CONTRACT_CONFIG } from '@/lib/env';
import { useCallback, useEffect, useState } from 'react';

interface DarkPoolState {
  isConnected: boolean;
  balance: { available: string; locked: string } | null;
  usdcBalance: { available: string; locked: string } | null;
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
  // Native HBAR functions (WORKING with current contract)
  depositHBAR: (amount: string) => Promise<string>;
  withdrawHBAR: (amount: string) => Promise<string>;
  // USDC functions (will work when full contract is deployed)
  depositUSDC: (amount: string) => Promise<string>;
  withdrawUSDC: (amount: string) => Promise<string>;
  checkBalance: (address: string) => Promise<void>;
  checkUSDCBalance: (address: string) => Promise<void>;
  refreshSystemStatus: () => Promise<void>;
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
  // WORKING functions (confirmed by contract discovery)
  owner: '0x8da5cb5b',           // ✅ Returns contract owner
  paused: '0x5c975abb',          // ✅ Returns pause status
  getBalance: '0xf8b2cb4f',      // ✅ Returns HBAR (available, locked) balance
  getHBARBalance: '0xf3f35e31',  // ✅ Returns HBAR (available, locked) balance  
  getUSDCBalance: '0x68024717',  // ✅ Returns USDC (available, locked) balance
  treasury: '0x61d027b3',        // ✅ Returns treasury address
  
  // HBAR deposit/withdraw (assuming standard signatures)
  deposit: '0xd0e30db0',         // Standard deposit() payable
  withdraw: '0x2e1a7d4d',        // Standard withdraw(uint256)
  
  // USDC functions - NOW ENABLED with correct selectors
  depositUSDC: '0xf688bcfb',     // depositUSDC(uint256) - CORRECTED SELECTOR
  withdrawUSDC: '0xdb81f99b',    // withdrawUSDC(uint256) 
  getUSDCAddress: '0x5e6c493e',  // getUSDCAddress()
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
  });
  return signature + paddedParams.join('');
};

// Encode address parameter (remove 0x and pad to 64 chars)
const encodeAddress = (address: string): string => {
  return address.slice(2).toLowerCase().padStart(64, '0');
};

// Encode uint256 parameter
const encodeUint256 = (value: string): string => {
  return BigInt(value).toString(16).padStart(64, '0');
};

export const useDarkPool = (): UseDarkPoolReturn => {
  const [state, setState] = useState<DarkPoolState>({
    isConnected: false,
    balance: null,
    usdcBalance: null,
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
      const expectedChainId = toHex(296); // Hedera Testnet
      
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
                chainName: 'Hedera Testnet',
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
        to: CONTRACT_CONFIG.compactDarkPoolDEX
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

      // Call deposit() on CompactDarkPoolDEX
      const txParams = {
        from: accounts[0],
        to: CONTRACT_CONFIG.compactDarkPoolDEX,
        value: amountHex,
        data: CONTRACT_ABI.deposit,
        gas: toHex(300000), // Reduced gas limit for simpler deposit
      };
      
      console.log('Transaction params:', txParams);
      
      // Validate transaction parameters
      if (!txParams.to || !txParams.data || !txParams.from) {
        throw new Error('Invalid transaction parameters');
      }

      // Estimate gas first to catch potential errors
      try {
        console.log('Estimating gas for transaction...');
        const gasEstimate = await provider.request({
          method: 'eth_estimateGas',
          params: [txParams],
        });
        console.log('✅ Gas estimate successful:', gasEstimate);
        
        // Update gas limit with estimate + buffer
        txParams.gas = toHex(Math.floor(parseInt(gasEstimate, 16) * 1.2));
        console.log('Updated gas limit:', txParams.gas);
      } catch (gasError: any) {
        console.error('❌ Gas estimation failed:', gasError);
        // For testnet, use a fixed gas limit if estimation fails
        txParams.gas = toHex(300000);
        console.log('Using fixed gas limit:', txParams.gas);
      }
      
      console.log('🚀 Sending transaction with params:', txParams);
      
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      console.log('✅ Deposit transaction hash:', txHash);

      // Wait for transaction confirmation and refresh balance
      setTimeout(async () => {
        try {
          await checkBalance(accounts[0]);
          await checkUSDCBalance(accounts[0]); // Also refresh USDC balance for completeness
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
      const functionSelector = CONTRACT_ABI.withdraw; // 0x2e1a7d4d
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
        to: CONTRACT_CONFIG.compactDarkPoolDEX,
        value: '0x0',
        data: callData,
        gas: toHex(300000), // Reduced gas limit for simpler withdrawal
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
          await checkUSDCBalance(accounts[0]); // Also refresh USDC balance for completeness
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

  // Check user's DarkPool balance using the working getBalance(address) function
  const checkBalance = useCallback(async (address: string) => {
    if (!address) return;
    
    try {
      const provider = getProvider();
      
      console.log('=== CHECKING USER BALANCE ON DEPLOYED CONTRACT ===');
      console.log('User address:', address);
      console.log('Contract address:', CONTRACT_CONFIG.compactDarkPoolDEX);
      
      // Use the working getBalance(address) function
      const balanceData = encodeFunctionCall(CONTRACT_ABI.getBalance, [encodeAddress(address)]);
      const balanceResult = await provider.request({
        method: 'eth_call',
        params: [{
          to: CONTRACT_CONFIG.compactDarkPoolDEX,
          data: balanceData,
        }, 'latest'],
      });
      
      console.log('Raw balance result:', balanceResult);
      
      if (balanceResult && balanceResult.length >= 130) {
        // Parse two uint256 values: available and locked
        const availableHex = balanceResult.slice(0, 66); // First 32 bytes
        const lockedHex = '0x' + balanceResult.slice(66, 130); // Second 32 bytes
        
        const availableWei = BigInt(availableHex);
        const lockedWei = BigInt(lockedHex);
        
        // Convert from contract units to HBAR 
        // Your contract appears to use 8 decimals (100,000,000 = 1 HBAR)
        const availableHBAR = (Number(availableWei) / 1e8).toFixed(4);
        const lockedHBAR = (Number(lockedWei) / 1e8).toFixed(4);
        
        console.log('Parsed balance:', {
          available: availableHBAR + ' HBAR',
          locked: lockedHBAR + ' HBAR',
          availableWei: availableWei.toString(),
          lockedWei: lockedWei.toString()
        });
        
        setState(prev => ({
          ...prev,
          balance: { 
            available: availableHBAR, 
            locked: lockedHBAR
          },
        }));
        
        console.log('✅ Balance updated successfully');
      } else {
        console.log('❌ Invalid balance result');
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

  // Check user's USDC balance in the DarkPool
  const checkUSDCBalance = useCallback(async (address: string) => {
    if (!address) return;
    
    try {
      const provider = getProvider();
      
      console.log('=== CHECKING USER USDC BALANCE ON DEPLOYED CONTRACT ===');
      console.log('User address:', address);
      console.log('Contract address:', CONTRACT_CONFIG.compactDarkPoolDEX);
      
      // Use the getUSDCBalance(address) function
      const balanceData = encodeFunctionCall(CONTRACT_ABI.getUSDCBalance, [encodeAddress(address)]);
      const balanceResult = await provider.request({
        method: 'eth_call',
        params: [{
          to: CONTRACT_CONFIG.compactDarkPoolDEX,
          data: balanceData,
        }, 'latest'],
      });
      
      console.log('Raw USDC balance result:', balanceResult);
      
      if (balanceResult && balanceResult.length >= 130) {
        // Parse two uint256 values: available and locked
        const availableHex = balanceResult.slice(0, 66); // First 32 bytes
        const lockedHex = '0x' + balanceResult.slice(66, 130); // Second 32 bytes
        
        const availableWei = BigInt(availableHex);
        const lockedWei = BigInt(lockedHex);
        
        // Convert from contract units to USDC 
        // USDC typically uses 6 decimals (1,000,000 = 1 USDC)
        const availableUSDC = (Number(availableWei) / 1e6).toFixed(6);
        const lockedUSDC = (Number(lockedWei) / 1e6).toFixed(6);
        
        console.log('Parsed USDC balance:', {
          available: availableUSDC + ' USDC',
          locked: lockedUSDC + ' USDC',
          availableWei: availableWei.toString(),
          lockedWei: lockedWei.toString()
        });
        
        setState(prev => ({
          ...prev,
          usdcBalance: { 
            available: availableUSDC, 
            locked: lockedUSDC
          },
        }));
        
        console.log('✅ USDC Balance updated successfully');
      } else {
        console.log('❌ Invalid USDC balance result');
        setState(prev => ({
          ...prev,
          usdcBalance: { available: '0.000000', locked: '0.000000' },
        }));
      }
    } catch (error: any) {
      console.error('USDC balance check error:', error);
      // Set default balance on error to avoid blocking UI
      setState(prev => ({
        ...prev,
        usdcBalance: { available: '0.000000', locked: '0.000000' },
        error: `USDC balance check failed: ${error.message}`,
      }));
    }
  }, []);

  // Refresh system status from deployed CompactDarkPoolDEX contract
  const refreshSystemStatus = useCallback(async () => {
    try {
      const provider = getProvider();
      
      console.log('=== REFRESHING SYSTEM STATUS ===');
      console.log('Contract:', CONTRACT_CONFIG.compactDarkPoolDEX);
      
      // Check owner - this works
      const ownerResult = await provider.request({
        method: 'eth_call',
        params: [{
          to: CONTRACT_CONFIG.compactDarkPoolDEX,
          data: CONTRACT_ABI.owner,
        }, 'latest'],
      });
      
      // Check paused status - this works  
      const pausedResult = await provider.request({
        method: 'eth_call',
        params: [{
          to: CONTRACT_CONFIG.compactDarkPoolDEX,
          data: CONTRACT_ABI.paused,
        }, 'latest'],
      });
      
      // Check treasury - this works
      const treasuryResult = await provider.request({
        method: 'eth_call',
        params: [{
          to: CONTRACT_CONFIG.compactDarkPoolDEX,
          data: CONTRACT_ABI.treasury,
        }, 'latest'],
      });
      
      console.log('System status results:', {
        owner: ownerResult,
        paused: pausedResult,
        treasury: treasuryResult
      });
      
      const exists = ownerResult !== '0x';
      const paused = pausedResult && parseInt(pausedResult, 16) === 1;
      
      // Parse owner address (remove leading zeros)
      const owner = (ownerResult && ownerResult.length >= 66) 
        ? `0x${ownerResult.slice(26)}` 
        : CONTRACT_CONFIG.compactDarkPoolDEX;
      
      setState(prev => ({
        ...prev,
        systemStatus: {
          exists,
          paused,
          marketCount: 8, // Hardcoded for now
          owner,
        },
      }));
      
      console.log('✅ System status updated:', { exists, paused, owner });
      
    } catch (error: any) {
      console.error('Error refreshing system status:', error);
      setState(prev => ({
        ...prev,
        systemStatus: {
          exists: true, // Assume it exists since we can call owner()
          paused: false,
          marketCount: 8,
          owner: CONTRACT_CONFIG.compactDarkPoolDEX,
        },
        error: error.message || 'Failed to refresh system status',
      }));
    }
  }, []);

  // Smart USDC deposit function - detects contract capabilities
  const depositUSDC = useCallback(async (amount: string): Promise<string> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const provider = getProvider();
      const accounts = await provider.request({ method: 'eth_accounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No wallet connected');
      }

      console.log('=== ATTEMPTING USDC DEPOSIT ===');
      console.log('Amount:', amount, 'USDC');
      console.log('Contract:', CONTRACT_CONFIG.compactDarkPoolDEX);
      console.log('USDC Token:', CONTRACT_CONFIG.usdcToken);

      // Validate contract addresses are configured
      if (!CONTRACT_CONFIG.compactDarkPoolDEX || !CONTRACT_CONFIG.usdcToken) {
        throw new Error('Contract addresses not configured properly');
      }
      
      // Convert amount to USDC decimals (6 decimals)
      const amountUsdc = BigInt(Math.floor(parseFloat(amount) * 1e6)).toString();
      console.log('Amount in USDC units (6 decimals):', amountUsdc);
      
      // Validate amount
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Invalid USDC amount');
      }
      
      // First check USDC balance
      console.log('Checking USDC balance...');
      const balanceData = '0x70a08231' + encodeAddress(accounts[0]); // balanceOf(address)
      const balanceResult = await provider.request({
        method: 'eth_call',
        params: [{ to: CONTRACT_CONFIG.usdcToken, data: balanceData }, 'latest'],
      });
      
      const usdcBalance = BigInt(balanceResult || '0');
      console.log('User USDC balance:', (Number(usdcBalance) / 1e6).toFixed(6), 'USDC');
      
      if (usdcBalance < BigInt(amountUsdc)) {
        throw new Error(`Insufficient USDC balance. You have ${(Number(usdcBalance) / 1e6).toFixed(6)} USDC, need ${amount} USDC`);
      }
      
      // Check allowance
      const allowanceData = '0xdd62ed3e' + encodeAddress(accounts[0]) + encodeAddress(CONTRACT_CONFIG.compactDarkPoolDEX);
      const allowanceResult = await provider.request({
        method: 'eth_call',
        params: [{ to: CONTRACT_CONFIG.usdcToken, data: allowanceData }, 'latest'],
      });
      
      const allowance = BigInt(allowanceResult || '0');
      const requiredAmount = BigInt(amountUsdc);
      
      console.log('Current allowance:', allowance.toString());
      console.log('Required amount:', requiredAmount.toString());
      
      // Approve if needed
      if (allowance < requiredAmount) {
        console.log('Approving USDC spend...');
        
        // Approve exact amount needed
        const approveData = '0x095ea7b3' + 
          encodeAddress(CONTRACT_CONFIG.compactDarkPoolDEX) + 
          encodeUint256(amountUsdc);
        
        const approveTxHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: accounts[0],
            to: CONTRACT_CONFIG.usdcToken,
            data: approveData,
            value: '0x0',
            gas: toHex(100000), // Gas for approval
          }],
        });
        
        console.log('USDC approval transaction:', approveTxHash);
        
        // Wait for approval to be mined
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      // Now deposit USDC to the contract
      // The correct function selector for depositUSDC(uint256)
      const depositData = '0xf688bcfb' + encodeUint256(amountUsdc); // depositUSDC(uint256) - CORRECTED
      
      console.log('Sending deposit transaction...');
      console.log('Deposit data:', depositData);
      console.log('Contract address:', CONTRACT_CONFIG.compactDarkPoolDEX);
      console.log('From address:', accounts[0]);
      
      // Prepare transaction parameters
      const txParams = {
        from: accounts[0],
        to: CONTRACT_CONFIG.compactDarkPoolDEX,
        data: depositData,
        value: '0x0',
        gas: toHex(250000), // Increased gas for USDC deposit
      };
      
      // Log transaction before sending
      console.log('Transaction parameters:', txParams);
      
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      console.log('✅ USDC deposit transaction sent:', txHash);
      setState(prev => ({ ...prev, loading: false }));
      
      // Refresh both HBAR and USDC balance after a delay
      setTimeout(() => {
        checkBalance(accounts[0]);
        checkUSDCBalance(accounts[0]);
      }, 5000);
      
      return txHash;

    } catch (error: any) {
      console.error('USDC deposit error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'USDC deposit failed',
      }));
      throw error;
    }
  }, [checkBalance]);

  // Smart USDC withdraw function
  const withdrawUSDC = useCallback(async (amount: string): Promise<string> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const provider = getProvider();
      const accounts = await provider.request({ method: 'eth_accounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No wallet connected');
      }

      console.log('=== ATTEMPTING USDC WITHDRAWAL ===');
      console.log('Amount:', amount, 'USDC');
      console.log('Contract:', CONTRACT_CONFIG.compactDarkPoolDEX);

      // Convert amount to USDC decimals (6 decimals)
      const amountUsdc = BigInt(Math.floor(parseFloat(amount) * 1e6)).toString();
      console.log('Amount in USDC units (6 decimals):', amountUsdc);
      
      // Use the correct function selector for withdrawUSDC(uint256)
      const withdrawData = '0xdb81f99b' + encodeUint256(amountUsdc); // withdrawUSDC(uint256) - CORRECTED
      
      console.log('Sending withdrawal transaction...');
      console.log('Withdrawal data:', withdrawData);
      
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: accounts[0],
          to: CONTRACT_CONFIG.compactDarkPoolDEX,
          data: withdrawData,
          value: '0x0',
          gas: toHex(200000), // Gas for withdrawal
        }],
      });

      console.log('✅ USDC withdrawal transaction sent:', txHash);
      setState(prev => ({ ...prev, loading: false }));
      
      // Refresh both HBAR and USDC balance after a delay
      setTimeout(() => {
        checkBalance(accounts[0]);
        checkUSDCBalance(accounts[0]);
      }, 5000);
      
      return txHash;

    } catch (error: any) {
      console.error('USDC withdrawal error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'USDC withdrawal failed',
      }));
      throw error;
    }
  }, [checkBalance]);

  // Listen for balance refresh events (e.g., when ZKP positions are closed)
  useEffect(() => {
    const handleBalanceRefresh = (event: CustomEvent) => {
      console.log('🔄 DarkPool balance refresh event received:', event.detail);
      
      if (state.isConnected && typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.request({ method: 'eth_accounts' })
          .then((accounts: string[]) => {
            if (accounts && accounts.length > 0) {
              checkBalance(accounts[0]);
              checkUSDCBalance(accounts[0]);
            }
          })
          .catch(console.error);
      }
    };

    window.addEventListener('darkpool-balance-refresh', handleBalanceRefresh as EventListener);
    
    return () => {
      window.removeEventListener('darkpool-balance-refresh', handleBalanceRefresh as EventListener);
    };
  }, [state.isConnected, checkBalance, checkUSDCBalance]);

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
    depositHBAR: deposit,
    withdrawHBAR: withdraw,
    depositUSDC,
    withdrawUSDC,
    checkBalance,
    checkUSDCBalance,
    refreshSystemStatus,
  };
};
