import { ZKPTradingInterface } from '@/components/ZKPTrading';
import { PriceDisplay } from '@/components/ZKPTrading/PriceDisplay';
import React from 'react';

export const ZKPTradingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Price Display at the top */}
      <div className="container mx-auto p-6">
        <PriceDisplay />
      </div>
      
      {/* Main ZKP Trading Interface */}
      <ZKPTradingInterface />
    </div>
  );
};
