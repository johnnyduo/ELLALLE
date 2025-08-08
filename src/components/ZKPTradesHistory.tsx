/**
 * ZKP Trades History Component
 * Displays successful ZKP trades with on-chain data and transaction links
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TradeHistoryItem } from '@/services/ProductionZKPService';
import {
    CheckCircle,
    Clock,
    ExternalLink,
    Hash,
    Shield,
    Target,
    TrendingDown,
    TrendingUp,
    Zap
} from 'lucide-react';
import React from 'react';

interface ZKPTradesHistoryProps {
  trades: TradeHistoryItem[];
  loading: boolean;
  onRefresh: () => void;
}

export const ZKPTradesHistory: React.FC<ZKPTradesHistoryProps> = ({
  trades,
  loading,
  onRefresh
}) => {
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatTxHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  const getTradeBadgeColor = (direction: string) => {
    return direction === 'Long' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'failed':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <Card className="bg-black/40 border-neon-purple/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-neon-green flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>ZKP Trades History</span>
          </CardTitle>
          <Button
            onClick={onRefresh}
            disabled={loading}
            variant="outline"
            size="sm"
            className="border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              'Refresh'
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {trades.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No ZKP trades found</p>
            <p className="text-sm">Execute your first ZKP trade to see it here</p>
          </div>
        ) : (
          trades.map((trade) => (
            <Card key={trade.id} className="bg-black/60 border-neon-purple/20">
              <CardContent className="p-4">
                {/* Trade Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {trade.direction === 'Long' ? (
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      )}
                      <span className="font-semibold text-white">{trade.asset}</span>
                    </div>
                    <Badge className={getTradeBadgeColor(trade.direction)}>
                      {trade.direction}
                    </Badge>
                    <Badge className={getStatusBadgeColor(trade.status)}>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {trade.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-400 flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimestamp(trade.timestamp)}</span>
                  </div>
                </div>

                {/* Trade Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-400">Size</div>
                    <div className="text-sm font-medium text-white">{trade.size}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Leverage</div>
                    <div className="text-sm font-medium text-neon-blue">{trade.leverage}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Collateral</div>
                    <div className="text-sm font-medium text-neon-green">{trade.collateral}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">ZK Commitment</div>
                    <div className="text-xs font-mono text-neon-purple">
                      {formatTxHash(trade.commitment)}
                    </div>
                  </div>
                </div>

                <Separator className="bg-neon-purple/20 my-3" />

                {/* Transaction Details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4 text-neon-blue" />
                      <span className="text-sm text-gray-400">Commitment TX</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="text-xs bg-black/40 px-2 py-1 rounded text-neon-blue">
                        {formatTxHash(trade.txHashes.commitment)}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-neon-blue hover:bg-neon-blue/10"
                        onClick={() => window.open(`https://hashscan.io/testnet/transaction/${trade.txHashes.commitment}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-neon-green" />
                      <span className="text-sm text-gray-400">Trade TX</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="text-xs bg-black/40 px-2 py-1 rounded text-neon-green">
                        {formatTxHash(trade.txHashes.trade)}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-neon-green hover:bg-neon-green/10"
                        onClick={() => window.open(`https://hashscan.io/testnet/transaction/${trade.txHashes.trade}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* On-Chain Data */}
                {trade.onChainData && (
                  <>
                    <Separator className="bg-neon-purple/20 my-3" />
                    <div className="bg-black/40 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="h-4 w-4 text-neon-purple" />
                        <span className="text-sm font-medium text-neon-purple">On-Chain Verification</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-400">Block:</span>
                          <span className="ml-2 text-white">{trade.onChainData.blockNumber}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Trader:</span>
                          <span className="ml-2 text-white font-mono">
                            {formatTxHash(trade.onChainData.trader)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Working Size:</span>
                          <span className="ml-2 text-neon-blue">{trade.onChainData.size}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Status:</span>
                          <Badge className="ml-2 h-4 bg-green-500/20 text-green-300 text-xs">
                            {trade.onChainData.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};
