/**
 * Production ZKP Status Component
 * Real-time status display for zero-knowledge proof operations
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TradeExecution } from '@/services/ZKPService';
import { AlertTriangle, CheckCircle, Clock, ExternalLink, Lock, Shield, Zap } from 'lucide-react';
import React from 'react';

interface ZKPStatusProps {
  trades: TradeExecution[];
  currentOperation: 'idle' | 'generating_commitment' | 'submitting_commitment' | 'generating_proof' | 'executing_trade';
  loading: boolean;
  error: string | null;
  onClearError?: () => void;
}

const operationLabels = {
  'idle': 'Ready',
  'generating_commitment': 'Generating Commitment',
  'submitting_commitment': 'Submitting to Contract', 
  'generating_proof': 'Generating ZK Proof',
  'executing_trade': 'Executing Trade'
};

const operationProgress = {
  'idle': 0,
  'generating_commitment': 25,
  'submitting_commitment': 50, 
  'generating_proof': 75,
  'executing_trade': 100
};

const statusColors = {
  'pending': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
  'committed': 'bg-blue-500/20 text-blue-300 border-blue-500/50',
  'proved': 'bg-purple-500/20 text-purple-300 border-purple-500/50',
  'executed': 'bg-green-500/20 text-green-300 border-green-500/50',
  'failed': 'bg-red-500/20 text-red-300 border-red-500/50'
};

const statusIcons = {
  'pending': Clock,
  'committed': Shield,
  'proved': Lock,
  'executed': CheckCircle,
  'failed': AlertTriangle
};

export const ProductionZKPStatus: React.FC<ZKPStatusProps> = ({
  trades,
  currentOperation,
  loading,
  error,
  onClearError
}) => {
  const activeTrades = trades.filter(trade => 
    trade.status === 'pending' || trade.status === 'committed' || trade.status === 'proved'
  );
  
  const completedTrades = trades.filter(trade => 
    trade.status === 'executed'
  );
  
  const failedTrades = trades.filter(trade => 
    trade.status === 'failed'
  );

  const openViewTransaction = (txHash: string) => {
    window.open(`https://hashscan.io/testnet/transaction/${txHash}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Main Status Card */}
      <Card className="card-glass border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-purple-400" />
              <span>Zero-Knowledge Proof Status</span>
            </div>
            <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/50">
              {activeTrades.length} Active • {completedTrades.length} Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Operation */}
          {loading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current Operation:</span>
                <span className="text-purple-300 font-medium">
                  {operationLabels[currentOperation]}
                </span>
              </div>
              <Progress 
                value={operationProgress[currentOperation]} 
                className="h-2"
              />
              <div className="flex items-center space-x-2 text-xs text-blue-300">
                <Zap className="w-3 h-3 animate-pulse" />
                <span>Processing on Hedera Testnet...</span>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-red-300">ZKP Error</div>
                    <div className="text-xs text-red-400 mt-1">{error}</div>
                  </div>
                </div>
                {onClearError && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearError}
                    className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Active Trades */}
          {activeTrades.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-purple-300">Active ZKP Trades</div>
              {activeTrades.map(trade => {
                const StatusIcon = statusIcons[trade.status];
                return (
                  <div
                    key={trade.tradeId}
                    className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <StatusIcon className="w-4 h-4 text-purple-400" />
                        <div>
                          <div className="text-sm font-medium">
                            {trade.isLong ? 'Long' : 'Short'} {trade.size} BTC • {trade.leverage}x
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(trade.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={statusColors[trade.status]}>
                        {trade.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    {/* Transaction Hashes */}
                    {(trade.txHashes.commitment || trade.txHashes.execution) && (
                      <div className="mt-2 pt-2 border-t border-purple-500/20">
                        <div className="text-xs space-y-1">
                          {trade.txHashes.commitment && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Commitment:</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openViewTransaction(trade.txHashes.commitment!)}
                                className="h-6 text-xs text-purple-400 hover:text-purple-300"
                              >
                                {trade.txHashes.commitment.slice(0, 8)}...
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </Button>
                            </div>
                          )}
                          {trade.txHashes.execution && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Execution:</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openViewTransaction(trade.txHashes.execution!)}
                                className="h-6 text-xs text-purple-400 hover:text-purple-300"
                              >
                                {trade.txHashes.execution.slice(0, 8)}...
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent Completed Trades */}
          {completedTrades.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-green-300">Recent Completed Trades</div>
              {completedTrades.slice(-3).map(trade => (
                <div
                  key={trade.tradeId}
                  className="p-2 rounded-lg bg-green-500/5 border border-green-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-xs">
                        {trade.isLong ? 'Long' : 'Short'} {trade.size} BTC • {trade.leverage}x
                      </span>
                    </div>
                    {trade.txHashes.execution && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openViewTransaction(trade.txHashes.execution!)}
                        className="h-5 text-xs text-green-400 hover:text-green-300"
                      >
                        View <ExternalLink className="w-2 h-2 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary Stats */}
          {trades.length > 0 && (
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-purple-500/20">
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">{completedTrades.length}</div>
                <div className="text-xs text-muted-foreground">Executed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-400">{activeTrades.length}</div>
                <div className="text-xs text-muted-foreground">Processing</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-400">{failedTrades.length}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {trades.length === 0 && !loading && (
            <div className="text-center py-6 text-muted-foreground">
              <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <div className="text-sm">No ZKP trades yet</div>
              <div className="text-xs mt-1">Enable privacy mode to start trading with zero-knowledge proofs</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
