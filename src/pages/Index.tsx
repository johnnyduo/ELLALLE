
import AIAssistant from '@/components/AIAssistant';
import GameHub from '@/components/GameHub';
import Hero from '@/components/Hero';
import Portfolio from '@/components/Portfolio';
import TradingDashboard from '@/components/TradingDashboard';
import { ZKPTradingInterface } from '@/components/ZKPTrading';
import { Button } from '@/components/ui/button';
import {
    Brain,
    Gamepad2,
    Home,
    Menu,
    Shield,
    TrendingUp,
    Wallet,
    X
} from 'lucide-react';
import { useState } from 'react';

const Index = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { id: 'hero', label: 'Home', icon: Home },
    { id: 'trading', label: 'Trading', icon: TrendingUp },
    { id: 'zkp-trading', label: 'Private Trading', icon: Shield },
    { id: 'portfolio', label: 'Portfolio', icon: Wallet },
    { id: 'ai', label: 'AI Assistant', icon: Brain },
    { id: 'game', label: 'Game Hub', icon: Gamepad2 },
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'hero':
        return <Hero onNavigate={setActiveSection} />;
      case 'trading':
        return <TradingDashboard />;
      case 'zkp-trading':
        return <ZKPTradingInterface />;
      case 'portfolio':
        return <Portfolio />;
      case 'ai':
        return <AIAssistant />;
      case 'game':
        return <GameHub />;
      default:
        return <Hero onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold gradient-text">ELLALLE</h1>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="glass border-t border-white/10 p-4 animate-slide-in">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`w-full justify-start ${
                    activeSection === item.id
                      ? 'bg-neon-purple/20 text-neon-purple'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => {
                    setActiveSection(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <div className="fixed left-0 top-0 h-full w-64 glass border-r border-white/10 z-40">
          <div className="p-6">
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center animate-glow">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">ELLALLE</h1>
                <p className="text-xs text-muted-foreground">DarkPool DEX</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`w-full justify-start transition-all duration-300 ${
                    activeSection === item.id
                      ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30 shadow-glow'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              ))}
            </nav>

            {/* Status Indicator */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="glass rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="status-online" />
                  <span className="text-sm font-medium">System Online</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  All systems operational
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64">
          {renderActiveSection()}
        </div>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden pt-16">
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default Index;
