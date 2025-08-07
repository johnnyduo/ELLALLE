# ELLALLE Development Setup

## Quick Start Guide

Follow these steps to get the ELLALLE platform running locally on Hedera Testnet:

### Prerequisites

- Node.js (v18 or higher)
- **Yarn package manager (required - do not use npm)**
- Git
- MetaMask browser extension

### Installation Steps

1. **Install Yarn globally**
   ```bash
   npm install -g yarn
   ```

2. **Clone and setup**
   ```bash
   git clone <your-repo-url>
   cd ellalle
   yarn install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development**
   ```bash
   yarn dev
   ```
   
   Visit `http://localhost:8080` in your browser.

### Hedera Testnet Configuration

The project is configured for Hedera Testnet:
- **Network**: Hedera Testnet
- **Chain ID**: 296
- **RPC**: https://testnet.hashio.io/api
- **Explorer**: https://hashscan.io/testnet
- **Currency**: HBAR

### MetaMask Setup

1. Install MetaMask browser extension
2. Connect your wallet to the app
3. The app will automatically prompt to add/switch to Hedera Testnet

### Testing Production Build

Before deploying, always test the production build:

```bash
# Build for production
yarn build

# Preview production build
yarn preview
```

### Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "feat: initial setup"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect the Vite configuration
   - Set build command to `yarn build`
   - Deploy with one click!

### Project Structure

```
ellalle/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom hooks
│   └── lib/            # Utilities
├── vercel.json         # Vercel configuration
├── .yarnrc.yml         # Yarn configuration
└── README.md           # Project documentation
```

### Available Commands

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server |
| `yarn build` | Build for production |
| `yarn preview` | Preview production build |
| `yarn lint` | Run linting |

### Troubleshooting

**Port already in use?**
- The dev server runs on port 8080 by default
- Kill any process using that port or modify `vite.config.ts`

**Build errors?**
- Run `yarn install` to ensure all dependencies are installed
- Check that Node.js version is 18 or higher

**Deployment issues?**
- Ensure `vercel.json` is properly configured
- Check build logs in Vercel dashboard
- Verify all environment variables are set

---

Happy coding! 🚀
