// Environment configuration utility for ELLALLE platform
// Centralized access to all environment variables

// App Configuration
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'ELLALLE',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
  url: import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://ellalle.vercel.app'),
  debug: import.meta.env.VITE_DEBUG_MODE === 'true',
} as const;

// API Configuration
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3000',
  rateLimit: Number(import.meta.env.VITE_API_RATE_LIMIT) || 100,
  wsReconnectTimeout: Number(import.meta.env.VITE_WS_RECONNECT_TIMEOUT) || 5000,
} as const;

// Hedera Network Configuration (Updated to Testnet)
export const HEDERA_CONFIG = {
  chainId: Number(import.meta.env.VITE_CHAIN_ID) || 296,
  networkName: import.meta.env.VITE_NETWORK_NAME || 'Hedera Testnet',
  rpcUrl: import.meta.env.VITE_RPC_URL || 'https://testnet.hashio.io/api',
  explorerUrl: import.meta.env.VITE_BLOCK_EXPLORER_URL || 'https://hashscan.io/testnet',
  nativeCurrency: { name: 'HBAR', symbol: 'HBAR', decimals: 18 },
  mirrorNodeUrl: import.meta.env.VITE_HEDERA_MIRROR_NODE_URL || 'https://testnet.mirrornode.hedera.com',
} as const;

// Wallet Configuration
export const WALLET_CONFIG = {
  reownProjectId: import.meta.env.VITE_REOWN_PROJECT_ID || 'd645a4537e923bd397788df964e8e866',
  walletConnectProjectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'd645a4537e923bd397788df964e8e866',
  sessionTimeout: Number(import.meta.env.VITE_SESSION_TIMEOUT) || 3600000,
} as const;

// Smart Contract Addresses (Updated for Hedera Testnet)
export const CONTRACT_CONFIG = {
  // CompactDarkPoolDEX - New USDC-enabled self-contained trading contract (DEPLOYED on Testnet)
  compactDarkPoolDEX: import.meta.env.VITE_COMPACT_DARKPOOL_DEX_ADDRESS || '0x7322b80Aa5398d53543930D966c6AE0e9EE2E54E',
  
  // DarkPool Perpetual DEX - Legacy trading contract (Backward compatibility)
  darkpoolPerpDEX: import.meta.env.VITE_DARKPOOL_PERP_DEX_ADDRESS || '0xC4D7B5729A9Dca7dfcaCd1BB435bba3d0B559617',
  
  // HederaDarkPoolManager - Event-based management interface (DEPLOYED)
  hederaDarkPoolManager: import.meta.env.VITE_HEDERA_DARKPOOL_MANAGER_ADDRESS || '0xA04ea9A4184e8E8b05182338fF34e5DcB9b743e0',
  
  // SimpleDarkPoolManager - Legacy management interface (Backward compatibility)
  simpleDarkPoolManager: import.meta.env.VITE_SIMPLE_DARKPOOL_MANAGER_ADDRESS || '0xbFFfC841011586DA5613F07292ffAb9504793A97',
  
  // ZKP & Oracle Contracts (Deployed addresses confirmed)
  noirVerifier: import.meta.env.VITE_NOIR_VERIFIER_ADDRESS || '0xD2163E87d7fd20bc91e7B80D4D5AbcBad4Eb0888',
  priceOracle: import.meta.env.VITE_PRICE_ORACLE_ADDRESS || '0xD2163E87d7fd20bc91e7B80D4D5AbcBad4Eb0888',
  
  // Token Contracts (Updated for Hedera Testnet)
  usdcToken: import.meta.env.VITE_USDC_TOKEN_ADDRESS || '0x340e7949d378C6d6eB1cf7391F5C39b6c826BA9d',
  
  // Legacy contract addresses (kept for backward compatibility)
  trading: import.meta.env.VITE_TRADING_CONTRACT_ADDRESS || '0xC4D7B5729A9Dca7dfcaCd1BB435bba3d0B559617',
  token: import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS || '',
  staking: import.meta.env.VITE_STAKING_CONTRACT_ADDRESS || '',
  ellalleToken: import.meta.env.VITE_ELLALLE_TOKEN_ADDRESS || '',
  liquidityPool: import.meta.env.VITE_LIQUIDITY_POOL_ADDRESS || '',
  governance: import.meta.env.VITE_GOVERNANCE_CONTRACT_ADDRESS || '',
} as const;

// External Services Configuration
export const SERVICES_CONFIG = {
  coingecko: {
    apiKey: import.meta.env.VITE_COINGECKO_API_KEY || '',
    baseUrl: import.meta.env.VITE_COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3',
  },
  defillama: {
    apiKey: import.meta.env.VITE_DEFILLAMA_API_KEY || '',
  },
  moralis: {
    apiKey: import.meta.env.VITE_MORALIS_API_KEY || '',
  },
  binance: {
    apiUrl: import.meta.env.VITE_BINANCE_API_URL || 'https://api.binance.com/api/v3',
  },
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  },
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash-exp',
    baseUrl: import.meta.env.VITE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
  },
  analytics: {
    apiKey: import.meta.env.VITE_ANALYTICS_API_KEY || '',
  },
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  stealthMode: import.meta.env.VITE_ENABLE_STEALTH_MODE === 'true',
  gamification: import.meta.env.VITE_ENABLE_GAMIFICATION === 'true',
  aiAssistant: import.meta.env.VITE_ENABLE_AI_ASSISTANT === 'true',
  darkPools: import.meta.env.VITE_ENABLE_DARK_POOLS === 'true',
  trading: import.meta.env.VITE_ENABLE_TRADING !== 'false', // Default to true
  staking: import.meta.env.VITE_ENABLE_STAKING !== 'false', // Default to true
  notifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false', // Default to true
  consoleLogs: import.meta.env.VITE_ENABLE_CONSOLE_LOGS === 'true',
  mockData: import.meta.env.VITE_MOCK_DATA_ENABLED === 'true',
} as const;

// Trading Configuration
export const TRADING_CONFIG = {
  defaultSlippage: Number(import.meta.env.VITE_DEFAULT_SLIPPAGE) || 0.5,
  maxSlippage: Number(import.meta.env.VITE_MAX_SLIPPAGE) || 10,
  defaultLeverage: Number(import.meta.env.VITE_DEFAULT_LEVERAGE) || 1,
  maxLeverage: Number(import.meta.env.VITE_MAX_LEVERAGE) || 100,
  minOrderSize: Number(import.meta.env.VITE_MIN_ORDER_SIZE) || 1,
  tradingFee: Number(import.meta.env.VITE_TRADING_FEE) || 0.1,
} as const;

// Security Configuration
export const SECURITY_CONFIG = {
  encryptionKey: import.meta.env.VITE_ENCRYPTION_KEY || 'ellalle-secure-key-2024',
  zkProofServiceUrl: import.meta.env.VITE_ZK_PROOF_SERVICE_URL || '',
} as const;

// Social & Marketing Configuration
export const SOCIAL_CONFIG = {
  twitter: import.meta.env.VITE_TWITTER_URL || 'https://twitter.com/ellalle_platform',
  discord: import.meta.env.VITE_DISCORD_URL || 'https://discord.gg/ellalle',
  telegram: import.meta.env.VITE_TELEGRAM_URL || 'https://t.me/ellalle_platform',
  github: import.meta.env.VITE_GITHUB_URL || 'https://github.com/ellalle-platform',
} as const;

// Utility functions
export const isDevelopment = () => APP_CONFIG.environment === 'development';
export const isProduction = () => APP_CONFIG.environment === 'production';
export const isDebugMode = () => APP_CONFIG.debug;

// Environment validation
export const validateEnvironment = () => {
  const errors: string[] = [];
  
  // Check required environment variables
  if (!WALLET_CONFIG.reownProjectId) {
    errors.push('VITE_REOWN_PROJECT_ID is required');
  }
  
  if (!HEDERA_CONFIG.rpcUrl) {
    errors.push('VITE_RPC_URL is required');
  }
  
  // Log warnings for optional but recommended variables
  if (!SERVICES_CONFIG.coingecko.apiKey && !FEATURE_FLAGS.mockData) {
    console.warn('VITE_COINGECKO_API_KEY not set - using public API with rate limits');
  }
  
  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.join(', ')}`);
  }
  
  return true;
};

// Export all configurations as a single object
export const ENV_CONFIG = {
  app: APP_CONFIG,
  api: API_CONFIG,
  hedera: HEDERA_CONFIG,
  wallet: WALLET_CONFIG,
  contracts: CONTRACT_CONFIG,
  services: SERVICES_CONFIG,
  features: FEATURE_FLAGS,
  trading: TRADING_CONFIG,
  security: SECURITY_CONFIG,
  social: SOCIAL_CONFIG,
} as const;

export default ENV_CONFIG;
