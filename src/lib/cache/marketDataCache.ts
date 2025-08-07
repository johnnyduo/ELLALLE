// Market data caching system for CoinGecko API optimization
import type { ChartData, MarketData } from '@/lib/coingecko';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface CacheConfig {
  marketDataTTL: number; // Time to live for market data (ms)
  chartDataTTL: number;  // Time to live for chart data (ms)
  maxEntries: number;    // Maximum cache entries before cleanup
}

// Default cache configuration
const DEFAULT_CONFIG: CacheConfig = {
  marketDataTTL: 30 * 1000,     // 30 seconds for market data
  chartDataTTL: 2 * 60 * 1000,  // 2 minutes for chart data
  maxEntries: 100,               // Max 100 cache entries
};

class MarketDataCache {
  private config: CacheConfig;
  private storageKey = 'ellalle_market_cache';

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Get all cache data from localStorage
  private getCacheData(): Record<string, CacheEntry<any>> {
    try {
      const cached = localStorage.getItem(this.storageKey);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      console.warn('Failed to read cache from localStorage:', error);
      return {};
    }
  }

  // Save cache data to localStorage
  private setCacheData(data: Record<string, CacheEntry<any>>): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
      // If storage is full, clear old entries and try again
      this.cleanup();
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      } catch (retryError) {
        console.error('Failed to save cache after cleanup:', retryError);
      }
    }
  }

  // Generate cache key
  private generateKey(type: 'market' | 'chart', params: string): string {
    return `${type}:${params}`;
  }

  // Check if cache entry is valid
  private isValid(entry: CacheEntry<any>): boolean {
    return Date.now() < entry.expiresAt;
  }

  // Get cached market data
  getMarketData(coinIds: string[]): MarketData[] | null {
    const key = this.generateKey('market', coinIds.sort().join(','));
    const cache = this.getCacheData();
    const entry = cache[key];

    if (entry && this.isValid(entry)) {
      console.log('📦 Using cached market data for:', coinIds);
      return entry.data;
    }

    return null;
  }

  // Cache market data
  setMarketData(coinIds: string[], data: MarketData[]): void {
    const key = this.generateKey('market', coinIds.sort().join(','));
    const cache = this.getCacheData();
    const now = Date.now();

    cache[key] = {
      data,
      timestamp: now,
      expiresAt: now + this.config.marketDataTTL,
    };

    this.setCacheData(cache);
    console.log('💾 Cached market data for:', coinIds);
  }

  // Get cached chart data
  getChartData(coinId: string, days: number): ChartData[] | null {
    const key = this.generateKey('chart', `${coinId}:${days}`);
    const cache = this.getCacheData();
    const entry = cache[key];

    if (entry && this.isValid(entry)) {
      console.log('📦 Using cached chart data for:', coinId, days, 'days');
      return entry.data;
    }

    return null;
  }

  // Cache chart data
  setChartData(coinId: string, days: number, data: ChartData[]): void {
    const key = this.generateKey('chart', `${coinId}:${days}`);
    const cache = this.getCacheData();
    const now = Date.now();

    cache[key] = {
      data,
      timestamp: now,
      expiresAt: now + this.config.chartDataTTL,
    };

    this.setCacheData(cache);
    console.log('💾 Cached chart data for:', coinId, days, 'days');
  }

  // Check if data should be refreshed (for background updates)
  shouldRefreshMarketData(coinIds: string[]): boolean {
    const key = this.generateKey('market', coinIds.sort().join(','));
    const cache = this.getCacheData();
    const entry = cache[key];

    if (!entry) return true;

    const age = Date.now() - entry.timestamp;
    const refreshThreshold = this.config.marketDataTTL * 0.8; // Refresh at 80% of TTL

    return age > refreshThreshold;
  }

  // Check if chart data should be refreshed
  shouldRefreshChartData(coinId: string, days: number): boolean {
    const key = this.generateKey('chart', `${coinId}:${days}`);
    const cache = this.getCacheData();
    const entry = cache[key];

    if (!entry) return true;

    const age = Date.now() - entry.timestamp;
    const refreshThreshold = this.config.chartDataTTL * 0.8; // Refresh at 80% of TTL

    return age > refreshThreshold;
  }

  // Cleanup expired entries and limit cache size
  cleanup(): void {
    const cache = this.getCacheData();
    const now = Date.now();
    const validEntries: Record<string, CacheEntry<any>> = {};

    // Remove expired entries
    Object.entries(cache).forEach(([key, entry]) => {
      if (this.isValid(entry)) {
        validEntries[key] = entry;
      }
    });

    // Limit cache size - remove oldest entries if needed
    const entries = Object.entries(validEntries);
    if (entries.length > this.config.maxEntries) {
      // Sort by timestamp (oldest first)
      entries.sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      // Keep only the newest entries
      const keepEntries = entries.slice(-this.config.maxEntries);
      const limitedCache: Record<string, CacheEntry<any>> = {};
      
      keepEntries.forEach(([key, entry]) => {
        limitedCache[key] = entry;
      });

      this.setCacheData(limitedCache);
      console.log('🧹 Cache cleanup: kept', keepEntries.length, 'of', entries.length, 'entries');
    } else {
      this.setCacheData(validEntries);
    }
  }

  // Clear all cache
  clear(): void {
    try {
      localStorage.removeItem(this.storageKey);
      console.log('🗑️ Cache cleared');
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  // Get cache statistics
  getStats(): {
    totalEntries: number;
    marketDataEntries: number;
    chartDataEntries: number;
    oldestEntry: number | null;
    newestEntry: number | null;
    totalSize: string;
  } {
    const cache = this.getCacheData();
    const entries = Object.entries(cache);
    
    const marketDataEntries = entries.filter(([key]) => key.startsWith('market:')).length;
    const chartDataEntries = entries.filter(([key]) => key.startsWith('chart:')).length;
    
    const timestamps = entries.map(([, entry]) => entry.timestamp);
    const oldestEntry = timestamps.length > 0 ? Math.min(...timestamps) : null;
    const newestEntry = timestamps.length > 0 ? Math.max(...timestamps) : null;
    
    // Estimate cache size
    const cacheString = JSON.stringify(cache);
    const sizeInBytes = new Blob([cacheString]).size;
    const totalSize = sizeInBytes < 1024 
      ? `${sizeInBytes} B`
      : sizeInBytes < 1024 * 1024
        ? `${(sizeInBytes / 1024).toFixed(1)} KB`
        : `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;

    return {
      totalEntries: entries.length,
      marketDataEntries,
      chartDataEntries,
      oldestEntry,
      newestEntry,
      totalSize,
    };
  }

  // Clear all cache data (useful for debugging)
  clearCache(): void {
    try {
      localStorage.removeItem(this.storageKey);
      console.log('🧹 Market data cache cleared');
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }
}

// Export singleton instance
export const marketDataCache = new MarketDataCache();

// Cache initialization - cleanup on startup
marketDataCache.cleanup();
