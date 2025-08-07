// Cache status indicator component for debugging market data caching
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { clearMarketDataCache, getMarketDataCacheStats } from '@/lib/coingecko';
import { Database, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CacheStats {
  totalEntries: number;
  marketDataEntries: number;
  chartDataEntries: number;
  oldestEntry: number | null;
  newestEntry: number | null;
  totalSize: string;
}

export const CacheStatusIndicator: React.FC = () => {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const refreshStats = () => {
    const cacheStats = getMarketDataCacheStats();
    setStats(cacheStats);
  };

  const handleClearCache = () => {
    clearMarketDataCache();
    refreshStats();
    toast.success('Cache cleared successfully');
  };

  useEffect(() => {
    refreshStats();
    
    // Refresh stats every 5 seconds
    const interval = setInterval(refreshStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getAgeInSeconds = (timestamp: number | null) => {
    if (!timestamp) return 0;
    return Math.floor((Date.now() - timestamp) / 1000);
  };

  if (!stats) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Cache indicator button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="glass flex items-center space-x-2"
      >
        <Database className="w-4 h-4" />
        <Badge variant="secondary" className="text-xs">
          {stats.totalEntries}
        </Badge>
      </Button>

      {/* Cache details panel */}
      {isOpen && (
        <Card className="card-glass absolute bottom-12 right-0 w-80">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-neon-purple" />
                <span>Cache Status</span>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshStats}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCache}
                  className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-3 text-xs">
            {/* Entry counts */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-muted-foreground">Total Entries</div>
                <div className="font-semibold">{stats.totalEntries}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Cache Size</div>
                <div className="font-semibold">{stats.totalSize}</div>
              </div>
            </div>

            {/* Data type breakdown */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-muted-foreground">Market Data</div>
                <div className="font-semibold text-neon-blue">{stats.marketDataEntries}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Chart Data</div>
                <div className="font-semibold text-neon-purple">{stats.chartDataEntries}</div>
              </div>
            </div>

            {/* Timestamps */}
            {stats.oldestEntry && (
              <div>
                <div className="text-muted-foreground">Oldest Entry</div>
                <div className="font-semibold">
                  {formatTimestamp(stats.oldestEntry)}
                  <span className="text-muted-foreground ml-1">
                    ({getAgeInSeconds(stats.oldestEntry)}s ago)
                  </span>
                </div>
              </div>
            )}

            {stats.newestEntry && (
              <div>
                <div className="text-muted-foreground">Newest Entry</div>
                <div className="font-semibold">
                  {formatTimestamp(stats.newestEntry)}
                  <span className="text-muted-foreground ml-1">
                    ({getAgeInSeconds(stats.newestEntry)}s ago)
                  </span>
                </div>
              </div>
            )}

            {/* Cache health indicator */}
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cache Health</span>
                <Badge 
                  variant={stats.totalEntries > 50 ? "destructive" : 
                          stats.totalEntries > 20 ? "secondary" : "default"}
                  className="text-xs"
                >
                  {stats.totalEntries > 50 ? "High" : 
                   stats.totalEntries > 20 ? "Medium" : "Good"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
