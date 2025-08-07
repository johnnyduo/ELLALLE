// Simple AppKit configuration for ELLALLE platform
// Using environment variables for all configuration

import { createAppKit } from '@reown/appkit';
import { mainnet } from '@reown/appkit/networks';

// Get environment variables
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || 'd645a4537e923bd397788df964e8e866';
const appName = import.meta.env.VITE_APP_NAME || 'ELLALLE';
const appUrl = import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://ellalle.vercel.app');

// For now, use Ethereum mainnet as base network
// Hedera integration will be handled by our custom wallet hook
const networks = [mainnet];

// Metadata for the app
const metadata = {
  name: appName,
  description: 'Privacy-focused trading platform with zero-knowledge technology',
  url: appUrl,
  icons: ['/favicon.ico'],
};

// Create and configure AppKit with minimal setup
export const appKit = createAppKit({
  projectId,
  networks,
  defaultNetwork: mainnet,
  metadata,
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    email: false,
    socials: [],
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#8B5CF6',
    '--w3m-color-mix-strength': 20,
    '--w3m-font-family': 'Inter, sans-serif',
    '--w3m-border-radius-master': '8px',
  },
});

// Wallet connection utilities using environment variables
export const connectWallet = async () => {
  try {
    await appKit.open();
    return true;
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return false;
  }
};

export const disconnectWallet = async () => {
  try {
    await appKit.disconnect();
    return true;
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
    return false;
  }
};

export const getAccount = () => {
  return appKit.getAccount();
};

export const getChainId = () => {
  return appKit.getChainId();
};

// Helper functions for Hedera network (handled by custom hook)
export const isConnectedToHedera = () => {
  const chainId = getChainId();
  const hederaChainId = Number(import.meta.env.VITE_CHAIN_ID) || 296;
  return chainId === hederaChainId || chainId === 295; // Testnet or Mainnet
};

// Subscribe to account changes
export const subscribeToAccount = (callback: (account: any) => void) => {
  return appKit.subscribeAccount(callback);
};

// Subscribe to network changes
export const subscribeToNetwork = (callback: (network: any) => void) => {
  return appKit.subscribeNetwork(callback);
};

// Export configuration values for use elsewhere
export const config = {
  projectId,
  appName,
  appUrl,
  chainId: Number(import.meta.env.VITE_CHAIN_ID) || 296,
  rpcUrl: import.meta.env.VITE_RPC_URL || 'https://testnet.hashio.io/api',
  explorerUrl: import.meta.env.VITE_BLOCK_EXPLORER_URL || 'https://hashscan.io/testnet',
  networkName: import.meta.env.VITE_NETWORK_NAME || 'Hedera Testnet',
  currencySymbol: import.meta.env.VITE_CURRENCY_SYMBOL || 'HBAR',
};

// Export AppKit instance for direct access if needed
export default appKit;
