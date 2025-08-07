# ELLALLE - Stealth Trading Platform

A privacy-focused trading platform featuring zero-knowledge technology, AI-powered insights, and gamified trading experience.

## 🚀 Features

- **Zero-Knowledge Privacy**: Trade with complete anonymity using advanced ZKP technology
- **AI-Powered Insights**: Smart portfolio management with real-time market analysis  
- **DarkPool Perpetuals**: Advanced derivatives trading with institutional-grade liquidity
- **Gamified Experience**: Earn XP, unlock achievements, and climb leaderboards
- **Hedera Integration**: Native support for Hedera Testnet with HBAR
- **Wallet Connection**: Seamless wallet integration via Reown AppKit

## 🛠️ Tech Stack

This project is built with modern technologies for Hedera Testnet:

- **Blockchain**: Hedera Testnet (Chain ID: 296)
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Wallet**: Reown AppKit + MetaMask integration
- **State Management**: TanStack Query
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Package Manager**: Yarn (required)

## 📦 Installation

> **⚠️ Important**: This project uses **Yarn exclusively**. Do not use npm or other package managers.

1. **Install Yarn globally** (if not already installed)
   ```bash
   npm install -g yarn
   ```

2. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ellalle
   ```

3. **Install dependencies**
   ```bash
   yarn install
   ```

4. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

5. **Start development server**
   ```bash
   yarn dev
   ```

6. **Build for production**
   ```bash
   yarn build
   ```

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── Hero.tsx         # Landing page hero
│   ├── TradingDashboard.tsx
│   ├── AIAssistant.tsx
│   ├── GameHub.tsx
│   └── Portfolio.tsx
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── pages/               # Page components
└── main.tsx            # App entry point
```

## 🎮 Available Features

### Trading Dashboard
- Real-time market data
- Advanced charting
- Order management
- Risk metrics

### AI Assistant  
- Portfolio analysis
- Market insights
- Trading recommendations
- Risk assessment

### Game Hub
- Trading competitions
- Achievement system
- Leaderboards
- XP and rewards

### Portfolio Management
- Asset allocation
- Performance tracking
- Risk analysis
- Historical data

## 🔧 Development

### Development Workflow

1. **Start development server**
   ```bash
   yarn dev
   ```
   The app will be available at `http://localhost:8080`

2. **Make your changes**
   - Edit components in `src/components/`
   - Update styles using Tailwind CSS classes
   - Add new pages in `src/pages/`

3. **Test locally before deployment**
   ```bash
   # Build for production
   yarn build
   
   # Test the production build
   yarn preview
   ```

4. **Deploy to Vercel**
   - Push changes to your repository
   - Vercel will automatically deploy

### Available Scripts

- `yarn dev` - Start development server (accessible on network)
- `yarn build` - Build for production  
- `yarn build:dev` - Build in development mode
- `yarn preview` - Preview production build locally
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Run ESLint and fix issues automatically
- `yarn type-check` - Check TypeScript types without building
- `yarn clean` - Remove build artifacts

### Environment Setup

Make sure you have Node.js (v18+) and Yarn installed:
```bash
node --version
yarn --version
```

## 🚀 Deployment

### Local Testing

Before deploying, always test the build locally:

```bash
# Build the project
yarn build

# Preview the production build locally
yarn preview
```

The preview server will start at `http://localhost:4173` by default.

### Vercel Deployment (Recommended)

This project is optimized for deployment on Vercel:

1. **Install Vercel CLI** (optional, for command-line deployment)
   ```bash
   yarn global add vercel
   ```

2. **Deploy via Vercel Dashboard**
   - Push your code to GitHub/GitLab/Bitbucket
   - Connect your repository to [Vercel](https://vercel.com)
   - Vercel will automatically detect this is a Vite project
   - Configure build settings (usually auto-detected):
     - **Build Command**: `yarn build`
     - **Output Directory**: `dist`
     - **Install Command**: `yarn install`

3. **Deploy via CLI** (alternative)
   ```bash
   vercel --prod
   ```

### Environment Variables

For production deployment, you may need to set environment variables in your Vercel dashboard:

- `NODE_ENV=production` (usually set automatically)
- Add any API keys or configuration variables as needed

### Custom Domain

After deployment, you can add a custom domain in your Vercel project settings.

### Other Hosting Platforms

You can also deploy to other platforms by building and uploading the `dist` folder:

- Netlify
- AWS S3 + CloudFront  
- GitHub Pages
- Firebase Hosting

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## � Security

ELLALLE prioritizes user privacy and security. All trading data is processed with zero-knowledge protocols, ensuring complete anonymity and protection of sensitive information.

For security issues, please see our [Security Policy](SECURITY.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Documentation

- [Development Setup](DEVELOPMENT.md) - Detailed setup instructions
- [Contributing Guidelines](CONTRIBUTING.md) - How to contribute
- [Security Policy](SECURITY.md) - Security guidelines and reporting

---

**Built with ❤️ by the ELLALLE Team**
