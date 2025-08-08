/**
 * ZKP Execution Monitor Component
 * Real-time monitoring of ZKP trade execution with Noir circuit details,
 * oracle prices, and liquidity data
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    Activity,
    AlertCircle,
    CheckCircle,
    Clock,
    Code,
    Cpu,
    Database,
    ExternalLink,
    Layers,
    Lock,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ZKPExecutionStage {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  timing?: number;
  details?: string;
}

interface NoirCircuitInfo {
  name: string;
  version: string;
  constraints: number;
  publicInputs: number;
  privateInputs: number;
  verificationKey: string;
}

interface OracleData {
  source: string;
  pair: string;
  price: number;
  confidence: number;
  lastUpdate: number;
  deviation: number;
}

interface LiquidityData {
  pool: string;
  tvl: number;
  volume24h: number;
  apy: number;
  fees24h: number;
}

interface ZKPExecutionMonitorProps {
  isExecuting: boolean;
  selectedSymbol: string;
  tradeParams?: {
    size: number;
    direction: 'Long' | 'Short';
    leverage: number;
    collateral: number;
  };
  onStageUpdate?: (stage: string, status: string) => void;
}

export const ZKPExecutionMonitor: React.FC<ZKPExecutionMonitorProps> = ({
  isExecuting,
  selectedSymbol,
  tradeParams,
  onStageUpdate
}) => {
  const [executionStages, setExecutionStages] = useState<ZKPExecutionStage[]>([
    {
      id: 'commitment',
      name: 'ZK Commitment',
      description: 'Generating cryptographic commitment',
      status: 'pending',
      progress: 0
    },
    {
      id: 'circuit',
      name: 'Noir Circuit',
      description: 'Executing zero-knowledge proof circuit',
      status: 'pending',
      progress: 0
    },
    {
      id: 'proof',
      name: 'Proof Generation',
      description: 'Creating ZK proof for trade verification',
      status: 'pending',
      progress: 0
    },
    {
      id: 'verification',
      name: 'Proof Verification',
      description: 'Verifying proof on NoirVerifier contract',
      status: 'pending',
      progress: 0
    },
    {
      id: 'execution',
      name: 'Trade Execution',
      description: 'Executing trade on DarkPool contract',
      status: 'pending',
      progress: 0
    }
  ]);

  const [noirCircuit] = useState<NoirCircuitInfo>({
    name: 'DarkPool Trade Circuit',
    version: '1.0.0',
    constraints: 1024,
    publicInputs: 3,
    privateInputs: 5,
    verificationKey: '0x2f8a7b...'
  });

  const [oracleData] = useState<OracleData[]>([
    {
      source: 'Pyth Network',
      pair: selectedSymbol,
      price: 176.67,
      confidence: 0.15,
      lastUpdate: Date.now() - 1200,
      deviation: 0.08
    },
    {
      source: 'Chainlink',
      pair: selectedSymbol,
      price: 176.72,
      confidence: 0.12,
      lastUpdate: Date.now() - 800,
      deviation: 0.03
    }
  ]);

  const [liquidityData] = useState<LiquidityData[]>([
    {
      pool: `${selectedSymbol}/USDC`,
      tvl: 2847500,
      volume24h: 156750,
      apy: 12.45,
      fees24h: 1567
    },
    {
      pool: `${selectedSymbol}/HBAR`,
      tvl: 1234500,
      volume24h: 89250,
      apy: 8.75,
      fees24h: 892
    }
  ]);

  // Simulate ZKP execution process
  useEffect(() => {
    if (!isExecuting) return;

    const executeStages = async () => {
      for (let i = 0; i < executionStages.length; i++) {
        const stage = executionStages[i];
        
        // Mark stage as processing
        setExecutionStages(prev => prev.map(s => 
          s.id === stage.id ? { ...s, status: 'processing' as const } : s
        ));
        
        onStageUpdate?.(stage.name, 'processing');

        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setExecutionStages(prev => prev.map(s => 
            s.id === stage.id ? { ...s, progress } : s
          ));
        }

        // Mark stage as completed
        setExecutionStages(prev => prev.map(s => 
          s.id === stage.id ? { 
            ...s, 
            status: 'completed' as const, 
            progress: 100,
            timing: Math.random() * 2 + 0.5 // Random timing 0.5-2.5s
          } : s
        ));

        onStageUpdate?.(stage.name, 'completed');
      }
    };

    executeStages();
  }, [isExecuting, onStageUpdate]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <div className="animate-spin rounded-full h-4 w-4 border-2 border-neon-purple border-t-transparent" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatTVL = (tvl: number) => `$${(tvl / 1000000).toFixed(2)}M`;
  const formatVolume = (volume: number) => `$${(volume / 1000).toFixed(0)}K`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ZKP Execution Status */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-neon-purple" />
            <span>ZKP Execution Monitor</span>
            {isExecuting && (
              <Badge className="bg-neon-purple/20 text-neon-purple">
                <Zap className="w-3 h-3 mr-1" />
                Processing
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Trade Parameters */}
          {tradeParams && (
            <div className="bg-black/40 rounded-lg p-3 space-y-2">
              <div className="text-sm font-medium text-neon-purple">Trade Parameters</div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400">Size:</span>
                  <span className="ml-2 text-white">{tradeParams.size} {selectedSymbol.split('/')[0]}</span>
                </div>
                <div>
                  <span className="text-gray-400">Direction:</span>
                  <span className={`ml-2 font-medium ${tradeParams.direction === 'Long' ? 'text-green-400' : 'text-red-400'}`}>
                    {tradeParams.direction}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Leverage:</span>
                  <span className="ml-2 text-neon-blue">{tradeParams.leverage}x</span>
                </div>
                <div>
                  <span className="text-gray-400">Collateral:</span>
                  <span className="ml-2 text-neon-green">{tradeParams.collateral.toFixed(2)} USDC</span>
                </div>
              </div>
            </div>
          )}

          {/* Execution Stages */}
          <div className="space-y-3">
            {executionStages.map((stage, index) => (
              <div key={stage.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(stage.status)}
                    <div>
                      <div className="text-sm font-medium">{stage.name}</div>
                      <div className="text-xs text-gray-400">{stage.description}</div>
                    </div>
                  </div>
                  {stage.timing && (
                    <div className="text-xs text-gray-400">
                      {stage.timing.toFixed(1)}s
                    </div>
                  )}
                </div>
                {stage.status === 'processing' && (
                  <Progress value={stage.progress} className="h-1" />
                )}
                {index < executionStages.length - 1 && (
                  <div className="ml-2 h-4 w-px bg-gray-600"></div>
                )}
              </div>
            ))}
          </div>

          {/* Noir Circuit Details */}
          <Separator className="bg-gray-600" />
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-neon-purple" />
              <span className="text-sm font-medium">Noir Circuit Details</span>
            </div>
            <div className="bg-black/40 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400">Circuit:</span>
                  <span className="ml-2 text-white">{noirCircuit.name}</span>
                </div>
                <div>
                  <span className="text-gray-400">Version:</span>
                  <span className="ml-2 text-white">{noirCircuit.version}</span>
                </div>
                <div>
                  <span className="text-gray-400">Constraints:</span>
                  <span className="ml-2 text-neon-blue">{noirCircuit.constraints.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400">Inputs:</span>
                  <span className="ml-2 text-neon-green">
                    {noirCircuit.publicInputs} public, {noirCircuit.privateInputs} private
                  </span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-600">
                <div className="text-xs text-gray-400">Verification Key:</div>
                <div className="text-xs text-neon-purple font-mono">
                  {noirCircuit.verificationKey}...
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Oracle & Liquidity Data */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-neon-blue" />
            <span>Market Data Sources</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Oracle Price Feeds */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-neon-blue" />
              <span className="text-sm font-medium">Oracle Price Feeds</span>
            </div>
            {oracleData.map((oracle, index) => (
              <div key={index} className="bg-black/40 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">{oracle.source}</span>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-300">
                    {oracle.pair}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400">Price:</span>
                    <span className="ml-2 text-white font-medium">{formatPrice(oracle.price)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Confidence:</span>
                    <span className="ml-2 text-green-400">±{formatPrice(oracle.confidence)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Updated:</span>
                    <span className="ml-2 text-gray-300">{Math.floor(oracle.lastUpdate / 1000)}s ago</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Deviation:</span>
                    <span className="ml-2 text-gray-300">{oracle.deviation.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator className="bg-gray-600" />

          {/* Liquidity Pools */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-neon-green" />
              <span className="text-sm font-medium">SaucerSwap Liquidity</span>
            </div>
            {liquidityData.map((pool, index) => (
              <div key={index} className="bg-black/40 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{pool.pool}</span>
                  <div className="flex items-center space-x-1">
                    <Badge className="bg-green-500/20 text-green-300">
                      {pool.apy.toFixed(1)}% APY
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400">TVL:</span>
                    <span className="ml-2 text-neon-green font-medium">{formatTVL(pool.tvl)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">24h Volume:</span>
                    <span className="ml-2 text-white">{formatVolume(pool.volume24h)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">24h Fees:</span>
                    <span className="ml-2 text-neon-blue">{formatVolume(pool.fees24h)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Utilization:</span>
                    <span className="ml-2 text-gray-300">
                      {((pool.volume24h / pool.tvl) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* System Performance */}
          <Separator className="bg-gray-600" />
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-neon-purple" />
              <span className="text-sm font-medium">System Performance</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-black/40 rounded-lg p-2">
                <div className="text-gray-400">Proof Time</div>
                <div className="text-white font-medium">~2.1s avg</div>
              </div>
              <div className="bg-black/40 rounded-lg p-2">
                <div className="text-gray-400">Gas Used</div>
                <div className="text-neon-blue font-medium">~180K</div>
              </div>
              <div className="bg-black/40 rounded-lg p-2">
                <div className="text-gray-400">Success Rate</div>
                <div className="text-green-400 font-medium">99.7%</div>
              </div>
              <div className="bg-black/40 rounded-lg p-2">
                <div className="text-gray-400">Uptime</div>
                <div className="text-white font-medium">99.9%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
