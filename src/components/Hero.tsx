
import React, { useState } from 'react';
import { Shield, TrendingUp, Brain, Gamepad2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  const [isStealthMode, setIsStealthMode] = useState(false);

  const features = [
    {
      icon: Shield,
      title: "Zero-Knowledge Privacy",
      description: "Trade with complete anonymity using advanced ZKP technology"
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Smart portfolio management with real-time market analysis"
    },
    {
      icon: TrendingUp,
      title: "DarkPool Perpetuals",
      description: "Advanced derivatives trading with institutional-grade liquidity"
    },
    {
      icon: Gamepad2,
      title: "Gamified Experience",
      description: "Earn XP, unlock achievements, and climb leaderboards"
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

      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Header */}
        <div className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">ELLALLE</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="btn-stealth"
              onClick={() => setIsStealthMode(!isStealthMode)}
            >
              {isStealthMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {isStealthMode ? 'Stealth ON' : 'Stealth OFF'}
            </Button>
            <Button className="btn-glass">Connect Wallet</Button>
          </div>
        </div>

        {/* Hero Content */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-6xl md:text-7xl font-bold mb-6">
            The Future of{' '}
            <span className="gradient-text animate-gradient">DeFi Trading</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Trade perpetuals with complete privacy using Zero-Knowledge Proofs. 
            Powered by AI insights and gamified experiences in the first DarkPool DEX.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button className="btn-hero animate-glow">
              Start Trading
            </Button>
            <Button className="btn-glass">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className={`card-glass hover-lift animate-scale-in ${isStealthMode ? 'stealth-mode' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <feature.icon className="w-8 h-8 text-neon-purple mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card-glass text-center">
            <div className="text-3xl font-bold gradient-text mb-2">$2.4B+</div>
            <div className="text-muted-foreground">Total Volume</div>
          </div>
          <div className="card-glass text-center">
            <div className="text-3xl font-bold text-profit mb-2">45K+</div>
            <div className="text-muted-foreground">Active Traders</div>
          </div>
          <div className="card-glass text-center">
            <div className="text-3xl font-bold text-neon-blue mb-2">99.9%</div>
            <div className="text-muted-foreground">Privacy Guarantee</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
