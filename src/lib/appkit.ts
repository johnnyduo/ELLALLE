// Reown AppKit configuration for ELLALLE platform with Hedera Testnet

import { createAppKit } from '@reown/appkit';

// Get environment variables
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || 'd645a4537e923bd397788df964e8e866';

// Hedera network configurations
const hederaTestnet = {
  chainId: 296,
  name: 'Hedera Testnet',
  currency: 'HBAR',
  explorerUrl: 'https://hashscan.io/testnet',
  rpcUrl: 'https://testnet.hashio.io/api',
  chainNamespace: 'eip155',
};

const hederaMainnet = {
  chainId: 295,
  name: 'Hedera Mainnet', 
  currency: 'HBAR',
  explorerUrl: 'https://hashscan.io/mainnet',
  rpcUrl: 'https://mainnet.hashio.io/api',
  chainNamespace: 'eip155',
};

// Configure networks
const networks = [hederaTestnet];

// Metadata for the app
const metadata = {
  name: 'ELLALLE',
  description: 'Privacy-focused trading platform with zero-knowledge technology',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://ellalle.com',
  icons: ['/favicon.ico'],
};

// Create and configure AppKit
export const appKit = createAppKit({
  projectId,
  networks,
  defaultNetwork: hederaTestnet,
  metadata,
  features: {
    analytics: true,
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

// Wallet connection utilities
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

export const switchToHederaTestnet = async () => {
  try {
    await appKit.switchNetwork(hederaTestnet);
    return true;
  } catch (error) {
    console.error('Error switching to Hedera Testnet:', error);
    return false;
  }
};

export const switchToHederaMainnet = async () => {
  try {
    await appKit.switchNetwork(hederaMainnet);
    return true;
  } catch (error) {
    console.error('Error switching to Hedera Mainnet:', error);
    return false;
  }
};

// Subscribe to account changes
export const subscribeToAccount = (callback: (account: any) => void) => {
  return appKit.subscribeAccount(callback);
};

// Subscribe to network changes
export const subscribeToNetwork = (callback: (network: any) => void) => {
  return appKit.subscribeNetwork(callback);
};

// Helper to check if connected to Hedera
export const isConnectedToHedera = () => {
  const chainId = getChainId();
  return chainId === 296 || chainId === 295; // Hedera Testnet or Mainnet
};

// Export AppKit instance for direct access if needed
export default appKit;
