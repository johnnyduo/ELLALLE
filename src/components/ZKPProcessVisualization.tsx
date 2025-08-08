/**
 * ZKP Process Visualization Component
 * Shows Noir circuit details, NoirVerifier status, Oracle prices, and LP information
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Activity,
    Brain,
    CheckCircle,
    Code2,
    Cpu,
    Database,
    ExternalLink,
    Shield,
    Target,
    TrendingUp,
    Waves,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ZKPProcessVisualizationProps {
  isActive: boolean;
  currentTrade?: any;
  zkpLoading: boolean;
  zkpBalances?: any;
  zkpError?: string;
  prices?: any;
  canTrade: boolean;
  onClearError: () => void;
}

interface NoirCircuitStatus {
  circuitLoaded: boolean;
  proofGenerating: boolean;
  verificationComplete: boolean;
  gasEstimate: string;
  executionTime: string;
}

interface OracleData {
  pythPrices: Record<string, { price: number; confidence: number; timestamp: number }>;
  saucerswapLPs: Record<string, { liquidity: string; volume24h: string; fees: string }>;
}

export const ZKPProcessVisualization: React.FC<ZKPProcessVisualizationProps> = ({
  isActive,
  currentTrade,
  zkpLoading,
  zkpBalances,
  zkpError,
  prices,
  canTrade,
  onClearError
}) => {
  const [circuitStatus, setCircuitStatus] = useState<NoirCircuitStatus>({
    circuitLoaded: false,
    proofGenerating: false,
    verificationComplete: false,
    gasEstimate: '0.15 HBAR',
    executionTime: '~2.3s'
  });

  const [oracleData, setOracleData] = useState<OracleData>({
    pythPrices: {
      'BTC/USDC': { price: 67420.50, confidence: 0.02, timestamp: Date.now() },
      'ETH/USDC': { price: 3480.25, confidence: 0.015, timestamp: Date.now() },
      'SOL/USDC': { price: 176.67, confidence: 0.025, timestamp: Date.now() }
    },
    saucerswapLPs: {
      'HBAR/USDC': { liquidity: '2.4M USDC', volume24h: '580K', fees: '0.3%' },
      'SAUCE/HBAR': { liquidity: '1.2M HBAR', volume24h: '320K', fees: '0.3%' }
    }
  });

  const [processSteps, setProcessSteps] = useState([
    { id: 'circuit', name: 'Load Noir Circuit', status: 'completed', icon: Code2 },
    { id: 'params', name: 'Generate Parameters', status: 'idle', icon: Cpu },
    { id: 'proof', name: 'Generate ZK Proof', status: 'idle', icon: Shield },
    { id: 'verify', name: 'Verify On-Chain', status: 'idle', icon: CheckCircle },
    { id: 'execute', name: 'Execute Trade', status: 'idle', icon: Zap }
  ]);

  // Simulate circuit loading and proof generation
  useEffect(() => {
    if (isActive) {
      setCircuitStatus(prev => ({ ...prev, circuitLoaded: true }));
      
      // Simulate progressive loading
      const timer = setTimeout(() => {
        setProcessSteps(prev => prev.map((step, idx) => 
          idx === 0 ? { ...step, status: 'completed' } : step
        ));
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isActive]);

  // Update process when ZKP is loading
  useEffect(() => {
    if (zkpLoading) {
      setCircuitStatus(prev => ({ ...prev, proofGenerating: true }));
      
      // Simulate step progression
      const timers = [
        setTimeout(() => updateStep('params', 'active'), 500),
        setTimeout(() => updateStep('params', 'completed'), 1000),
        setTimeout(() => updateStep('proof', 'active'), 1500),
        setTimeout(() => updateStep('proof', 'completed'), 3000),
        setTimeout(() => updateStep('verify', 'active'), 3500),
        setTimeout(() => updateStep('verify', 'completed'), 4000),
        setTimeout(() => updateStep('execute', 'active'), 4500),
      ];

      return () => timers.forEach(clearTimeout);
    } else {
      setCircuitStatus(prev => ({ ...prev, proofGenerating: false, verificationComplete: true }));
    }
  }, [zkpLoading]);

  const updateStep = (stepId: string, status: 'idle' | 'active' | 'completed' | 'error') => {
    setProcessSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const getStepIcon = (step: any) => {
    const IconComponent = step.icon;
    if (step.status === 'completed') {
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    } else if (step.status === 'active') {
      return <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />;
    } else if (step.status === 'error') {
      return <IconComponent className="h-4 w-4 text-red-400" />;
    }
    return <IconComponent className="h-4 w-4 text-gray-400" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'active': return 'text-purple-400 animate-pulse';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (!isActive) {
    return (
      <Card className="p-4 border-gray-300 bg-gray-50/30">
        <div className="text-center text-gray-500">
          <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Enable Private Mode to see ZKP details</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 border-purple-200 bg-purple-50/30">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <h4 className="font-medium text-purple-800">Noir ZKP Engine</h4>
            <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700">
              NoirVerifier v1.2.0
            </Badge>
          </div>
          {zkpLoading && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin">⚡</div>
              <span className="text-xs text-purple-600">Processing...</span>
            </div>
          )}
        </div>

        {/* Circuit Status */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Circuit Status:</span>
              <Badge className={`text-xs ${circuitStatus.circuitLoaded ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {circuitStatus.circuitLoaded ? '✅ Loaded' : '⏳ Loading'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Gas Estimate:</span>
              <span className="font-mono text-purple-700">{circuitStatus.gasEstimate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Exec Time:</span>
              <span className="font-mono text-purple-700">{circuitStatus.executionTime}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Privacy Level:</span>
              <Badge className="text-xs bg-purple-100 text-purple-700">🔒 Maximum</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Proof Size:</span>
              <span className="font-mono text-purple-700">1.2KB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Verification:</span>
              <Badge className={`text-xs ${circuitStatus.verificationComplete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {circuitStatus.verificationComplete ? '✅ Ready' : '⏳ Standby'}
              </Badge>
            </div>
          </div>
        </div>

        <Separator className="bg-purple-200" />

        {/* Process Steps */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 mb-2">
            <Cpu className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">ZKP Process Pipeline</span>
          </div>
          
          {processSteps.map((step, index) => (
            <div key={step.id} className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-6 h-6">
                {getStepIcon(step)}
              </div>
              <span className={`text-xs flex-1 ${getStatusColor(step.status)}`}>
                {step.name}
              </span>
              <div className="w-16 text-right">
                {step.status === 'completed' && <span className="text-xs text-green-600">✓</span>}
                {step.status === 'active' && <span className="text-xs text-purple-600 animate-pulse">•••</span>}
              </div>
            </div>
          ))}
        </div>

        <Separator className="bg-purple-200" />

        {/* Oracle & LP Data */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Oracle & Liquidity Data</span>
          </div>
          
          {/* Pyth Oracle Prices */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-3 w-3 text-orange-500" />
              <span className="text-xs font-medium text-gray-700">Pyth Network Prices</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {Object.entries(oracleData.pythPrices).map(([pair, data]) => (
                <div key={pair} className="bg-white/50 rounded p-2">
                  <div className="font-medium text-gray-800">{pair}</div>
                  <div className="font-mono text-green-600">${data.price.toLocaleString()}</div>
                  <div className="text-gray-500">±{(data.confidence * 100).toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Saucerswap LP Data */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Waves className="h-3 w-3 text-blue-500" />
              <span className="text-xs font-medium text-gray-700">Saucerswap Liquidity</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(oracleData.saucerswapLPs).map(([pair, data]) => (
                <div key={pair} className="bg-white/50 rounded p-2">
                  <div className="font-medium text-gray-800">{pair}</div>
                  <div className="text-blue-600">TVL: {data.liquidity}</div>
                  <div className="text-gray-600">Vol: {data.volume24h}</div>
                  <div className="text-gray-500">Fee: {data.fees}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Balance Status */}
        {zkpBalances && (
          <>
            <Separator className="bg-purple-200" />
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">DarkPool Balances</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">HBAR:</span>
                  <span className="font-mono text-purple-700">{zkpBalances.hbar} HBAR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">USDC:</span>
                  <span className="font-mono text-purple-700">{zkpBalances.usdc} USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge className={`text-xs ${canTrade ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {canTrade ? '✅ Ready' : '❌ Not Ready'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Network:</span>
                  <Badge className="text-xs bg-blue-100 text-blue-700">Hedera Testnet</Badge>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Error Display */}
        {zkpError && (
          <>
            <Separator className="bg-red-200" />
            <div className="p-2 bg-red-100 text-red-700 rounded text-sm">
              <div className="flex items-start space-x-2">
                <Target className="h-4 w-4 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium">ZKP Error</div>
                  <div className="text-xs">{zkpError}</div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClearError}
                  className="h-6 px-2 text-red-600 hover:bg-red-200"
                >
                  Clear
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Success Display */}
        {currentTrade && (
          <>
            <Separator className="bg-green-200" />
            <div className="p-2 bg-green-100 text-green-700 rounded text-sm">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium">Trade Executed Successfully</div>
                  <div className="text-xs">ZK proof verified and trade committed on-chain</div>
                  {currentTrade.commitmentTx && (
                    <div className="mt-1">
                      <a
                        href={`https://hashscan.io/testnet/transaction/${currentTrade.commitmentTx}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-blue-600 hover:underline text-xs"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>View on Hashscan</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};