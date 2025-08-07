// Hedera-specific utility functions for ELLALLE platform

import type { ChainInfo } from '../types/web3';

// Hedera account ID format validation (0.0.xxxxx)
export const isValidHederaAccountId = (accountId: string): boolean => {
  return /^0\.0\.\d+$/.test(accountId);
};

// Convert Hedera account ID to EVM address format when needed
export const hederaAccountToEvmAddress = async (accountId: string): Promise<string | null> => {
  if (!isValidHederaAccountId(accountId)) return null;
  
  try {
    // This would typically involve calling Hedera Mirror Node API
    const mirrorNodeUrl = import.meta.env.VITE_HEDERA_MIRROR_NODE_URL;
    const response = await fetch(`${mirrorNodeUrl}/api/v1/accounts/${accountId}`);
    const data = await response.json();
    return data.evm_address || null;
  } catch (error) {
    console.error('Error converting Hedera account to EVM address:', error);
    return null;
  }
};

// Format HBAR amounts (8 decimal places)
export const formatHBAR = (
  amount: string | number,
  decimals = 4,
  showSymbol = true
): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (num === 0) return showSymbol ? '0 HBAR' : '0';
  
  // Convert from tinybars to HBAR if needed (1 HBAR = 100,000,000 tinybars)
  const hbarAmount = num > 100000000 ? num / 100000000 : num;
  
  if (hbarAmount < 0.0001) {
    return showSymbol ? '< 0.0001 HBAR' : '< 0.0001';
  }
  
  const formatted = hbarAmount.toFixed(decimals);
  return showSymbol ? `${formatted} HBAR` : formatted;
};

// Convert HBAR to tinybars
export const hbarToTinybars = (hbar: number): number => {
  return Math.floor(hbar * 100000000);
};

// Convert tinybars to HBAR
export const tinybarsToHbar = (tinybars: number): number => {
  return tinybars / 100000000;
};

// Get Hedera transaction info from HashScan
export const getHederaTransactionUrl = (transactionId: string, isPreviewnet = true): string => {
  const network = isPreviewnet ? 'previewnet' : 'mainnet';
  return `https://hashscan.io/${network}/transaction/${transactionId}`;
};

// Get Hedera account info from HashScan
export const getHederaAccountUrl = (accountId: string, isPreviewnet = true): string => {
  const network = isPreviewnet ? 'previewnet' : 'mainnet';
  return `https://hashscan.io/${network}/account/${accountId}`;
};

// Get Hedera token info from HashScan
export const getHederaTokenUrl = (tokenId: string, isPreviewnet = true): string => {
  const network = isPreviewnet ? 'previewnet' : 'mainnet';
  return `https://hashscan.io/${network}/token/${tokenId}`;
};

// Validate Hedera transaction ID format
export const isValidHederaTransactionId = (transactionId: string): boolean => {
  // Format: 0.0.xxxxx-xxxxxxxxxx-xxxxxxxxx
  return /^0\.0\.\d+-\d{10}-\d{9}$/.test(transactionId);
};

// Validate Hedera token ID format
export const isValidHederaTokenId = (tokenId: string): boolean => {
  return /^0\.0\.\d+$/.test(tokenId);
};

// Get current Hedera network info
export const getHederaNetworkInfo = (): ChainInfo => {
  const chainId = parseInt(import.meta.env.VITE_CHAIN_ID || '297');
  const isPreviewnet = chainId === 297;
  
  return {
    chainId,
    name: isPreviewnet ? 'Hedera Previewnet' : 'Hedera Mainnet',
    currency: 'HBAR',
    rpcUrl: import.meta.env.VITE_RPC_URL || 'https://previewnet.hashio.io/api',
    blockExplorer: import.meta.env.VITE_BLOCK_EXPLORER_URL || 'https://hashscan.io/previewnet',
    testnet: isPreviewnet,
  };
};

// Hedera Mirror Node API helpers
export const fetchAccountInfo = async (accountId: string) => {
  try {
    const mirrorNodeUrl = import.meta.env.VITE_HEDERA_MIRROR_NODE_URL;
    const response = await fetch(`${mirrorNodeUrl}/api/v1/accounts/${accountId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching account info:', error);
    return null;
  }
};

export const fetchAccountTokens = async (accountId: string) => {
  try {
    const mirrorNodeUrl = import.meta.env.VITE_HEDERA_MIRROR_NODE_URL;
    const response = await fetch(`${mirrorNodeUrl}/api/v1/accounts/${accountId}/tokens`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching account tokens:', error);
    return null;
  }
};

export const fetchTokenInfo = async (tokenId: string) => {
  try {
    const mirrorNodeUrl = import.meta.env.VITE_HEDERA_MIRROR_NODE_URL;
    const response = await fetch(`${mirrorNodeUrl}/api/v1/tokens/${tokenId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching token info:', error);
    return null;
  }
};
