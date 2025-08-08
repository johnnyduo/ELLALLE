/**
 * Trading History Component
 * Shows all closed positions from both ZKP and Order tabs with proper Private/Public tags
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TradeHistoryItem } from '@/services/ProductionZKPService';
import {
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    ExternalLink,
    EyeOff,
    Hash,
    History,
    Target,
    TrendingDown,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface TradingHistoryProps {
  trades: TradeHistoryItem[];
  orders: any[]; // Regular order positions from Order tab
  loading: boolean;
  onRefresh: () => void;
  isPrivateMode?: boolean;
}

interface HistoryItem {
  id: string;
  timestamp: number;
  asset: string;
  size: string;
  direction: 'Long' | 'Short' | 'Buy' | 'Sell';
  leverage?: string;
  collateral?: string;
  price?: string;
  type: 'zkp' | 'order';
  status: 'completed' | 'closed';
  txHashes?: {
    commitment: string;
    trade: string;
  };
  commitment?: string;
  onChainData?: any;
  pnl?: number;
  entryPrice?: number;
  exitPrice?: number;
}

export const TradingHistory: React.FC<TradingHistoryProps> = ({
  trades,
  orders,
  loading,
  onRefresh,
  isPrivateMode = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const tradesPerPage = 5;

  // Combine and filter closed positions from both ZKP and Orders
  const closedPositions = useMemo(() => {
    const closedZKPTrades: HistoryItem[] = trades
      .filter(trade => !trade.isActive) // Only closed ZKP trades
      .map(trade => ({
        id: trade.id,
        timestamp: trade.timestamp,
        asset: trade.asset,
        size: trade.size,
        direction: trade.direction,
        leverage: trade.leverage,
        collateral: trade.collateral,
        type: 'zkp' as const,
        status: 'closed' as const,
        txHashes: trade.txHashes,
        commitment: trade.commitment,
        onChainData: trade.onChainData,
        pnl: Math.random() * 200 - 100, // Mock PnL
        entryPrice: trade.entryPrice,
        exitPrice: trade.currentPrice || (trade.entryPrice ? trade.entryPrice * (1 + (Math.random() * 0.1 - 0.05)) : undefined)
      }));

    // Convert completed orders to history format
    const closedOrders: HistoryItem[] = orders
      .filter(order => order.status === 'filled' || order.status === 'completed')
      .map(order => ({
        id: order.id,
        timestamp: order.timestamp || Date.now(),
        asset: order.symbol,
        size: `${order.size} ${order.symbol.split('/')[0]}`,
        direction: order.side === 'buy' ? 'Buy' as const : 'Sell' as const,
        price: order.price ? `${order.price} USDC` : 'Market',
        type: 'order' as const,
        status: 'completed' as const,
        pnl: Math.random() * 100 - 50, // Mock PnL for orders
        entryPrice: order.price,
        exitPrice: order.price ? order.price * (1 + (Math.random() * 0.05 - 0.025)) : undefined
      }));

    return [...closedZKPTrades, ...closedOrders]
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [trades, orders]);

  // Pagination logic
  const { paginatedHistory, totalPages, hasNextPage, hasPrevPage } = useMemo(() => {
    const startIndex = (currentPage - 1) * tradesPerPage;
    const endIndex = startIndex + tradesPerPage;
    const paginatedHistory = closedPositions.slice(startIndex, endIndex);
    const totalPages = Math.ceil(closedPositions.length / tradesPerPage);
    
    return {
      paginatedHistory,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }, [closedPositions, currentPage, tradesPerPage]);

  const handlePageChange = (direction: 'next' | 'prev') => {
    if (direction === 'next' && hasNextPage) {
      setCurrentPage(prev => prev + 1);
    } else if (direction === 'prev' && hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatTxHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  const getTradeBadgeColor = (direction: string) => {
    if (direction === 'Long' || direction === 'Buy') {
      return 'bg-green-500/20 text-green-300';
    }
    return 'bg-red-500/20 text-red-300';
  };

  const getPrivacyTag = (type: 'zkp' | 'order') => {
    if (type === 'zkp') {
      return (
        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
          <EyeOff className="h-3 w-3 mr-1" />
          Private
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
        <Users className="h-3 w-3 mr-1" />
        Public
      </Badge>
    );
  };

  return (
    <Card className="bg-black/40 border-neon-purple/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-neon-green flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Trading History</span>
            <Badge className="bg-gray-500/20 text-gray-300">
              Closed Positions
            </Badge>
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
        {closedPositions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No trading history</p>
            <p className="text-sm">Close your first position to see it here</p>
          </div>
        ) : (
          <>
            {/* History List */}
            <div className="space-y-4">
              {paginatedHistory.map((item) => (
                <Card key={item.id} className="bg-black/60 border-neon-purple/20">
                  <CardContent className="p-4">
                    {/* History Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {(item.direction === 'Long' || item.direction === 'Buy') ? (
                            <TrendingUp className="h-4 w-4 text-green-400" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-400" />
                          )}
                          <span className="font-semibold text-white">{item.asset}</span>
                        </div>
                        <Badge className={getTradeBadgeColor(item.direction)}>
                          {item.direction}
                        </Badge>
                        <Badge className="bg-gray-500/20 text-gray-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Closed Position
                        </Badge>
                        {getPrivacyTag(item.type)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-xs text-gray-400 flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimestamp(item.timestamp)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Position Details */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-400">Size</div>
                        <div className="text-sm font-medium text-white">{item.size}</div>
                      </div>
                      
                      {item.type === 'zkp' ? (
                        <>
                          <div>
                            <div className="text-xs text-gray-400">Leverage</div>
                            <div className="text-sm font-medium text-neon-blue">{item.leverage}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">Collateral</div>
                            <div className="text-sm font-medium text-neon-green">{item.collateral}</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <div className="text-xs text-gray-400">Entry Price</div>
                            <div className="text-sm font-medium text-neon-blue">{item.price}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">Exit Price</div>
                            <div className="text-sm font-medium text-neon-green">
                              {item.exitPrice?.toFixed(2)} USDC
                            </div>
                          </div>
                        </>
                      )}
                      
                      <div>
                        <div className="text-xs text-gray-400">Final PnL</div>
                        <div className={`text-sm font-medium ${item.pnl && item.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {item.pnl && item.pnl >= 0 ? '+' : ''}{item.pnl?.toFixed(2)} USDC
                        </div>
                      </div>

                      {item.type === 'zkp' && item.commitment && (
                        <div>
                          <div className="text-xs text-gray-400">ZK Commitment</div>
                          <div className="text-xs font-mono text-neon-purple">
                            {formatTxHash(item.commitment)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Transaction Details for ZKP trades */}
                    {item.type === 'zkp' && item.txHashes && (
                      <>
                        <Separator className="bg-neon-purple/20 my-3" />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Hash className="h-4 w-4 text-neon-blue" />
                              <span className="text-sm text-gray-400">Commitment TX</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <code className="text-xs bg-black/40 px-2 py-1 rounded text-neon-blue">
                                {formatTxHash(item.txHashes.commitment)}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-neon-blue hover:bg-neon-blue/10"
                                onClick={() => window.open(`https://hashscan.io/testnet/transaction/${item.txHashes.commitment}`, '_blank')}
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
                                {formatTxHash(item.txHashes.trade)}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-neon-green hover:bg-neon-green/10"
                                onClick={() => window.open(`https://hashscan.io/testnet/transaction/${item.txHashes.trade}`, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* On-Chain Data for ZKP trades */}
                    {item.type === 'zkp' && item.onChainData && (
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
                              <span className="ml-2 text-white">{item.onChainData.blockNumber}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Trader:</span>
                              <span className="ml-2 text-white font-mono">
                                {formatTxHash(item.onChainData.trader)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Working Size:</span>
                              <span className="ml-2 text-neon-blue">{item.onChainData.size}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Status:</span>
                              <Badge className="ml-2 h-4 bg-gray-500/20 text-gray-300 text-xs">
                                Closed
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-neon-purple/20">
                <div className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages} ({closedPositions.length} closed positions)
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => handlePageChange('prev')}
                    disabled={!hasPrevPage}
                    size="sm"
                    variant="outline"
                    className="border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    onClick={() => handlePageChange('next')}
                    disabled={!hasNextPage}
                    size="sm"
                    variant="outline"
                    className="border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10 disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
