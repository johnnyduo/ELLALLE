
import { Button } from '@/components/ui/button';
import { WalletButton } from '@/components/WalletButton';
import { useUSDCFaucet } from '@/hooks/useUSDCFaucet';
import { useWallet } from '@/hooks/useWallet';
import Lottie from 'lottie-react';
import { Brain, Coins, Gamepad2, Shield, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HeroProps {
  onNavigate?: (section: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const { account, isConnected } = useWallet();
  const [lottieData, setLottieData] = useState(null);
  
  const { 
    balance, 
    canClaim, 
    isClaiming, 
    timeUntilNextClaim,
    checkBalance, 
    claimUSDC,
    formatTimeUntilNextClaim 
  } = useUSDCFaucet(account);

  // Load Lottie animation data
  useEffect(() => {
    fetch('/qeBRbfgoTC.json')
      .then(response => response.json())
      .then(data => setLottieData(data))
      .catch(error => console.error('Error loading Lottie animation:', error));
  }, []);

  // Check USDC balance when wallet connects
  useEffect(() => {
    if (isConnected && account) {
      checkBalance(account);
    }
  }, [isConnected, account, checkBalance]);

  const features = [
    {
      icon: Shield,
      title: "Dark Pool Privacy",
      description: "Execute trades in complete anonymity using institutional-grade dark pools"
    },
    {
      icon: Brain,
      title: "AI Market Intelligence",
      description: "Advanced algorithms for optimal trade execution and liquidity discovery"
    },
    {
      icon: TrendingUp,
      title: "Private Derivatives",
      description: "Access sophisticated financial instruments with zero market impact"
    },
    {
      icon: Gamepad2,
      title: "Exclusive Access",
      description: "Premium trading tier with enhanced features and priority execution"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-space-gradient">
        <div className="absolute top-20 left-10 w-64 h-64 bg-neon-purple/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-neon-blue/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-neon-green/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10">
        {/* Top Navigation - aligned with sidebar */}
        <div className="absolute top-[10px] right-0 p-4 md:p-6">
          <div className="flex items-center space-x-3 md:space-x-4">
            {isConnected && (
              <Button 
                onClick={claimUSDC}
                disabled={!canClaim || isClaiming}
                className={`${canClaim && !isClaiming ? 'btn-hero' : 'btn-disabled'} text-xs md:text-sm px-3 md:px-4 py-2`}
              >
                {isClaiming ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                    <span className="hidden sm:inline">Claiming...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : canClaim ? (
                  <>
                    <Coins className="w-3 h-3 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Claim USDC</span>
                    <span className="sm:hidden">Claim</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-3 h-3 mr-1 md:mr-2" />
                    <span className="text-xs">{formatTimeUntilNextClaim(timeUntilNextClaim)}</span>
                  </>
                )}
              </Button>
            )}
            <WalletButton />
          </div>
        </div>

        {/* Main Content Container */}
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-20">
          {/* Hero Content */}
          <div className="text-center max-w-5xl mx-auto mb-12 md:mb-16 pt-16 md:pt-20">
            {/* Lottie Animation */}
            <div className="flex justify-center mb-6 md:mb-8">
              <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-80 md:h-80">
                {lottieData ? (
                  <Lottie 
                    animationData={lottieData}
                    loop={true}
                    autoplay={true}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-primary/20 rounded-full flex items-center justify-center animate-pulse">
                    <Shield className="w-16 h-16 md:w-20 md:h-20 text-neon-purple/50" />
                  </div>
                )}
              </div>
            </div>

            <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 md:mb-6 leading-tight px-2">
              The Future of <span className="gradient-text animate-gradient">Private Trading Market</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 md:mb-8 leading-relaxed px-4 max-w-4xl mx-auto">
              Experience institutional-grade dark pool trading with complete privacy. 
              Execute large orders without market impact using advanced Zero-Knowledge Proofs 
              and AI-powered liquidity optimization.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4">
              <Button 
                className="btn-hero animate-glow w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 text-base md:text-lg"
                onClick={() => onNavigate?.('trading')}
              >
                Enter Dark Pool
              </Button>
              <Button className="btn-glass w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 text-base md:text-lg">
                Explore Features
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16 px-2">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="card-glass hover-lift animate-scale-in p-4 md:p-6"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <feature.icon className="w-6 h-6 md:w-8 md:h-8 text-neon-purple mb-3 md:mb-4" />
                <h3 className="text-base md:text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 px-2">
            <div className="card-glass text-center p-4 md:p-6">
              <div className="text-2xl md:text-3xl font-bold gradient-text mb-2">$2.4B+</div>
              <div className="text-sm md:text-base text-muted-foreground">Dark Pool Volume</div>
            </div>
            <div className="card-glass text-center p-4 md:p-6">
              <div className="text-2xl md:text-3xl font-bold text-profit mb-2">850+</div>
              <div className="text-sm md:text-base text-muted-foreground">Institutional Traders</div>
            </div>
            <div className="card-glass text-center p-4 md:p-6">
              <div className="text-2xl md:text-3xl font-bold text-neon-blue mb-2">100%</div>
              <div className="text-sm md:text-base text-muted-foreground">Anonymous Execution</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
