# Environment Configuration Guide

This document explains all environment variables used in the ELLALLE platform.

## Quick Setup

1. Copy the `.env` file to your project root (already created)
2. Update values as needed for your environment
3. Restart the development server

## Environment Variables Reference

### App Configuration
- `VITE_APP_NAME`: Application name (default: "ELLALLE")
- `VITE_APP_VERSION`: Version number (default: "1.0.0")
- `VITE_APP_ENVIRONMENT`: Environment type (development/production)
- `VITE_APP_URL`: Application URL (https://ellalle.vercel.app for production)

### Hedera Network
- `VITE_CHAIN_ID`: Hedera chain ID (296 for testnet, 295 for mainnet)
- `VITE_NETWORK_NAME`: Display name for the network
- `VITE_RPC_URL`: Hedera RPC endpoint
- `VITE_BLOCK_EXPLORER_URL`: HashScan explorer URL
- `VITE_CURRENCY_SYMBOL`: Native currency symbol (HBAR)
- `VITE_HEDERA_MIRROR_NODE_URL`: Mirror node API endpoint

### Wallet Integration
- `VITE_REOWN_PROJECT_ID`: Your Reown/WalletConnect project ID
- `VITE_WALLET_CONNECT_PROJECT_ID`: Backup WalletConnect ID
- `VITE_SESSION_TIMEOUT`: Wallet session timeout in milliseconds

### Smart Contracts
All contract addresses are currently empty and will be populated after deployment:
- `VITE_TRADING_CONTRACT_ADDRESS`: Main trading contract
- `VITE_TOKEN_CONTRACT_ADDRESS`: Platform token contract
- `VITE_STAKING_CONTRACT_ADDRESS`: Staking contract
- `VITE_ELLALLE_TOKEN_ADDRESS`: ELLALLE token contract
- `VITE_LIQUIDITY_POOL_ADDRESS`: Liquidity pool contract
- `VITE_GOVERNANCE_CONTRACT_ADDRESS`: Governance contract

### External APIs
- `VITE_COINGECKO_API_KEY`: CoinGecko API key (optional, uses public API without)
- `VITE_COINGECKO_BASE_URL`: CoinGecko API base URL
- `VITE_DEFILLAMA_API_KEY`: DefiLlama API key
- `VITE_MORALIS_API_KEY`: Moralis API key
- `VITE_BINANCE_API_URL`: Binance API endpoint
- `VITE_OPENAI_API_KEY`: OpenAI API key for AI features
- `VITE_GEMINI_API_KEY`: Google Gemini API key for AI features
- `VITE_GEMINI_MODEL`: Gemini model to use (default: gemini-2.0-flash-exp)
- `VITE_GEMINI_BASE_URL`: Gemini API base URL
- `VITE_ANALYTICS_API_KEY`: Analytics service key

### Feature Flags
Control which features are enabled:
- `VITE_ENABLE_STEALTH_MODE`: Privacy/stealth mode (true/false)
- `VITE_ENABLE_GAMIFICATION`: Gamification features (true/false)
- `VITE_ENABLE_AI_ASSISTANT`: AI assistant features (true/false)
- `VITE_ENABLE_DARK_POOLS`: Dark pool trading (true/false)
- `VITE_ENABLE_TRADING`: Trading functionality (true/false)
- `VITE_ENABLE_STAKING`: Staking features (true/false)
- `VITE_ENABLE_NOTIFICATIONS`: Push notifications (true/false)

### Trading Configuration
- `VITE_DEFAULT_SLIPPAGE`: Default slippage percentage (0.5)
- `VITE_MAX_SLIPPAGE`: Maximum allowed slippage (10)
- `VITE_DEFAULT_LEVERAGE`: Default leverage (1)
- `VITE_MAX_LEVERAGE`: Maximum leverage (100)
- `VITE_MIN_ORDER_SIZE`: Minimum order size (1)
- `VITE_TRADING_FEE`: Trading fee percentage (0.1)

### Security
- `VITE_ENCRYPTION_KEY`: Encryption key for sensitive data
- `VITE_ZK_PROOF_SERVICE_URL`: Zero-knowledge proof service endpoint

### Development
- `VITE_DEBUG_MODE`: Enable debug mode (true/false)
- `VITE_ENABLE_CONSOLE_LOGS`: Enable console logging (true/false)
- `VITE_MOCK_DATA_ENABLED`: Use mock data instead of real APIs (true/false)

### Social Links
- `VITE_TWITTER_URL`: Twitter/X profile URL
- `VITE_DISCORD_URL`: Discord server URL
- `VITE_TELEGRAM_URL`: Telegram channel URL
- `VITE_GITHUB_URL`: GitHub repository URL

## Usage in Code

```typescript
import { ENV_CONFIG } from '@/lib/env';

// Access configuration
const chainId = ENV_CONFIG.hedera.chainId;
const isDebug = ENV_CONFIG.app.debug;
const tradingEnabled = ENV_CONFIG.features.trading;

// AI service configuration
const openaiKey = ENV_CONFIG.services.openai.apiKey;
const geminiKey = ENV_CONFIG.services.gemini.apiKey;
const geminiModel = ENV_CONFIG.services.gemini.model;

// Validate environment
import { validateEnvironment } from '@/lib/env';
validateEnvironment(); // Throws error if required vars missing
```

## Security Notes

1. **Never commit real API keys** to version control
2. **Use different keys** for development and production
3. **Rotate keys regularly** for production environments
4. **Keep the `.env` file** out of your repository (it's in .gitignore)

## Environment Files

- `.env.example`: Template with all variables and defaults
- `.env`: Local environment file (git ignored)
- `.env.local`: Alternative local file name
- `.env.production`: Production-specific variables

## Troubleshooting

### Common Issues

1. **"Environment validation failed"**
   - Check that required variables are set
   - Verify VITE_REOWN_PROJECT_ID is not empty

2. **"Failed to connect wallet"**
   - Verify VITE_REOWN_PROJECT_ID is valid
   - Check network configuration matches MetaMask

3. **"API rate limits exceeded"**
   - Add VITE_COINGECKO_API_KEY for higher limits
   - Consider enabling VITE_MOCK_DATA_ENABLED for development

### Getting API Keys

1. **Reown Project ID**: Register at [reown.com](https://reown.com)
2. **CoinGecko API**: Register at [coingecko.com/api](https://coingecko.com/api)
3. **OpenAI API**: Get key from [platform.openai.com](https://platform.openai.com)

### Network Configuration

For **Hedera Mainnet**, change:
```bash
VITE_CHAIN_ID=295
VITE_NETWORK_NAME=Hedera Mainnet
VITE_RPC_URL=https://mainnet.hashio.io/api
VITE_BLOCK_EXPLORER_URL=https://hashscan.io/mainnet
VITE_HEDERA_MIRROR_NODE_URL=https://mainnet.mirrornode.hedera.com
```

For **development** with mock data:
```bash
VITE_MOCK_DATA_ENABLED=true
VITE_DEBUG_MODE=true
VITE_ENABLE_CONSOLE_LOGS=true
```
