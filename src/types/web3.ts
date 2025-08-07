// Web3 and Blockchain related types
export interface ChainInfo {
  chainId: number;
  name: string;
  currency: string;
  rpcUrl: string;
  blockExplorer: string;
  testnet: boolean;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export interface WalletConnection {
  address: string;
  chain: ChainInfo;
  balance: string;
  connected: boolean;
}

export interface TradingPair {
  id: string;
  baseToken: TokenInfo;
  quoteToken: TokenInfo;
  price: number;
  change24h: number;
  volume24h: number;
  liquidity: number;
}

export interface Trade {
  id: string;
  pair: TradingPair;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: number;
  txHash?: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface Portfolio {
  totalValue: number;
  assets: Array<{
    token: TokenInfo;
    balance: number;
    value: number;
    allocation: number;
  }>;
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
}

export interface GameStats {
  level: number;
  xp: number;
  xpToNext: number;
  achievements: string[];
  rank: number;
  totalTrades: number;
  winRate: number;
  streak: number;
}
