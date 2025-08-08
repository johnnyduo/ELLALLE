// Web3 utility functions for ELLALLE platform with Hedera support

export const SUPPORTED_CHAINS = {
  296: {
    chainId: 296,
    name: 'Hedera Testnet',
    currency: 'HBAR',
    rpcUrl: 'https://testnet.hashio.io/api',
    blockExplorer: 'https://hashscan.io/testnet',
    mirrorNode: 'https://testnet.mirrornode.hedera.com',
    testnet: true,
  },
  295: {
    chainId: 295,
    name: 'Hedera Mainnet',
    currency: 'HBAR',
    rpcUrl: 'https://mainnet.hashio.io/api',
    blockExplorer: 'https://hashscan.io/mainnet',
    mirrorNode: 'https://mainnet.mirrornode.hedera.com',
    testnet: false,
  },
  // Legacy Ethereum support for reference
  1: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    currency: 'ETH',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorer: 'https://etherscan.io',
    testnet: false,
  },
} as const;

export const DEFAULT_CHAIN_ID = 296; // Hedera Testnet

export const formatAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  return `${address.substring(0, chars + 2)}...${address.substring(
    address.length - chars
  )}`;
};

export const formatBalance = (
  balance: string | number,
  decimals = 4,
  symbol = ''
): string => {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  
  if (num === 0) return `0 ${symbol}`.trim();
  
  if (num < 0.0001) {
    return `< 0.0001 ${symbol}`.trim();
  }
  
  if (num < 1) {
    return `${num.toFixed(decimals)} ${symbol}`.trim();
  }
  
  if (num < 1000) {
    return `${num.toFixed(2)} ${symbol}`.trim();
  }
  
  if (num < 1000000) {
    return `${(num / 1000).toFixed(2)}K ${symbol}`.trim();
  }
  
  if (num < 1000000000) {
    return `${(num / 1000000).toFixed(2)}M ${symbol}`.trim();
  }
  
  return `${(num / 1000000000).toFixed(2)}B ${symbol}`.trim();
};

export const formatPrice = (price: number, currency = 'USD'): string => {
  if (price === 0) return '$0.00';
  
  // For very small prices (less than $0.01), show more decimal places
  if (Math.abs(price) < 0.01) {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    });
    return formatter.format(price);
  }
  
  // For small prices (less than $1), show 4 decimal places
  if (Math.abs(price) < 1) {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    });
    return formatter.format(price);
  }
  
  // For normal prices, show 2 decimal places
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(price);
};

export const formatPercentage = (value: number, decimals = 2): string => {
  const formatted = value.toFixed(decimals);
  const sign = value >= 0 ? '+' : '';
  return `${sign}${formatted}%`;
};

export const getExplorerUrl = (
  chainId: number,
  hash: string,
  type: 'tx' | 'address' | 'token' = 'tx'
): string => {
  const chain = SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS];
  if (!chain) return '';
  
  const baseUrl = chain.blockExplorer;
  
  switch (type) {
    case 'tx':
      return `${baseUrl}/tx/${hash}`;
    case 'address':
      return `${baseUrl}/address/${hash}`;
    case 'token':
      return `${baseUrl}/token/${hash}`;
    default:
      return baseUrl;
  }
};

export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const isValidTxHash = (hash: string): boolean => {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
};

export const calculateSlippage = (
  inputAmount: number,
  outputAmount: number,
  expectedOutput: number
): number => {
  return ((expectedOutput - outputAmount) / expectedOutput) * 100;
};

export const calculatePriceImpact = (
  inputAmount: number,
  outputAmount: number,
  inputReserve: number,
  outputReserve: number
): number => {
  const currentPrice = outputReserve / inputReserve;
  const newInputReserve = inputReserve + inputAmount;
  const newOutputReserve = outputReserve - outputAmount;
  const newPrice = newOutputReserve / newInputReserve;
  
  return ((currentPrice - newPrice) / currentPrice) * 100;
};
