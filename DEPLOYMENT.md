# Vercel Deployment Guide for ELLALLE

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/johnnyduo/stealthflow-aiview)

## Manual Deployment Steps

### 1. Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Sign in and click "Add New Project"
3. Import your GitHub repository: `johnnyduo/stealthflow-aiview`
4. Select the root directory

### 2. Configure Build Settings
Vercel will auto-detect the configuration from `vercel.json`:
- **Framework**: Vite
- **Build Command**: `yarn build`
- **Output Directory**: `dist`
- **Install Command**: `yarn install`

### 3. Environment Variables
Set these in the Vercel dashboard under "Environment Variables":

#### Required Variables
```bash
VITE_REOWN_PROJECT_ID=d645a4537e923bd397788df964e8e866
VITE_APP_ENVIRONMENT=production
VITE_APP_URL=https://ellalle.vercel.app
```

#### Optional but Recommended
```bash
# CoinGecko API for better rate limits
VITE_COINGECKO_API_KEY=your_coingecko_api_key

# AI Services
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key

# Analytics
VITE_ANALYTICS_API_KEY=your_analytics_key

# Custom encryption key
VITE_ENCRYPTION_KEY=your_secure_encryption_key
```

### 4. Domain Configuration
The app is configured for `ellalle.vercel.app` domain:
- **Production URL**: https://ellalle.vercel.app
- **Meta tags** and **Open Graph** configured for the domain
- **Wallet integration** configured for production URLs

### 5. Deploy
1. Click "Deploy" in Vercel
2. Wait for build completion (1-2 minutes)
3. Your app will be live at `https://ellalle.vercel.app`

## Post-Deployment Setup

### 1. Contract Deployment
After deploying smart contracts, update these variables:
```bash
VITE_TRADING_CONTRACT_ADDRESS=0x...
VITE_TOKEN_CONTRACT_ADDRESS=0x...
VITE_STAKING_CONTRACT_ADDRESS=0x...
VITE_ELLALLE_TOKEN_ADDRESS=0x...
```

### 2. Network Configuration
For **Hedera Mainnet** (when ready for production):
```bash
VITE_CHAIN_ID=295
VITE_NETWORK_NAME=Hedera Mainnet
VITE_RPC_URL=https://mainnet.hashio.io/api
VITE_BLOCK_EXPLORER_URL=https://hashscan.io/mainnet
VITE_HEDERA_MIRROR_NODE_URL=https://mainnet.mirrornode.hedera.com
```

### Getting API Keys

1. **Reown Project ID**: Register at [reown.com](https://reown.com)
2. **CoinGecko API**: Register at [coingecko.com/api](https://coingecko.com/api)
3. **OpenAI API**: Get key from [platform.openai.com](https://platform.openai.com)
4. **Google Gemini API**: Get key from [makersuite.google.com](https://makersuite.google.com)

## Environment Files

- `.env.production` - Production environment template
- `vercel.json` - Vercel deployment configuration
- Environment variables set in Vercel dashboard override file values

## Build Optimizations

The build is optimized for production:
- **Bundle size**: ~367KB (113KB gzipped)
- **Caching**: Assets cached for 1 year
- **Security headers**: CSP, X-Frame-Options, etc.
- **SPA routing**: All routes redirect to index.html

## Monitoring

After deployment, monitor:
1. **Build logs** in Vercel dashboard
2. **Runtime logs** for any errors
3. **Analytics** (if configured)
4. **Web3 connection** functionality

## Troubleshooting

### Build Fails
- Check TypeScript errors: `yarn type-check`
- Verify all imports are correct
- Check environment variables are set

### Wallet Connection Issues
- Verify `VITE_REOWN_PROJECT_ID` is set correctly
- Check network configuration matches MetaMask
- Ensure domain is whitelisted in Reown dashboard

### API Rate Limits
- Add `VITE_COINGECKO_API_KEY` for higher limits
- Monitor API usage in external service dashboards

## Security Notes

1. **Never commit** real API keys to repository
2. **Use Vercel environment variables** for sensitive data
3. **Rotate keys** regularly for production
4. **Monitor** for any security alerts

## Custom Domain (Optional)

To use a custom domain:
1. Go to Vercel project settings
2. Add your custom domain
3. Update `VITE_APP_URL` environment variable
4. Update meta tags in `index.html`

## Performance

The app is optimized for:
- **Fast loading**: Code splitting and lazy loading
- **SEO**: Proper meta tags and Open Graph
- **Caching**: Aggressive caching for static assets
- **Bundle size**: Minimal dependencies and tree shaking
