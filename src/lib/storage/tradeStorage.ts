import { PendingTrade, ZKProof } from '@/types/zkp';

export class TradeStorageManager {
  private static readonly STORAGE_KEY = 'ellalle_pending_trades';
  private static readonly MAX_TRADES = 100; // Limit storage size

  static savePendingTrade(trade: PendingTrade): void {
    try {
      const trades = this.getPendingTrades();
      trades[trade.id] = trade;
      
      // Clean up old trades if we exceed the limit
      this.cleanupOldTrades(trades);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trades));
    } catch (error) {
      console.error('Failed to save pending trade:', error);
    }
  }

  static getPendingTrades(): Record<string, PendingTrade> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load pending trades:', error);
      return {};
    }
  }

  static getPendingTradeById(id: string): PendingTrade | null {
    const trades = this.getPendingTrades();
    return trades[id] || null;
  }

  static updateTradeStatus(
    id: string, 
    status: PendingTrade['status'], 
    txHash?: string,
    errorMessage?: string
  ): void {
    try {
      const trades = this.getPendingTrades();
      if (trades[id]) {
        trades[id].status = status;
        trades[id].updatedAt = Date.now();
        
        if (txHash) {
          trades[id].txHash = txHash;
        }
        
        if (errorMessage) {
          trades[id].errorMessage = errorMessage;
        }
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trades));
      }
    } catch (error) {
      console.error('Failed to update trade status:', error);
    }
  }

  static updateTradeProof(id: string, proof: ZKProof): void {
    try {
      const trades = this.getPendingTrades();
      if (trades[id]) {
        trades[id].proof = proof;
        trades[id].status = 'ready';
        trades[id].updatedAt = Date.now();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trades));
      }
    } catch (error) {
      console.error('Failed to update trade proof:', error);
    }
  }

  static removeTrade(id: string): void {
    try {
      const trades = this.getPendingTrades();
      delete trades[id];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trades));
    } catch (error) {
      console.error('Failed to remove trade:', error);
    }
  }

  static clearAllTrades(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear all trades:', error);
    }
  }

  static getTradesByStatus(status: PendingTrade['status']): PendingTrade[] {
    const trades = this.getPendingTrades();
    return Object.values(trades).filter(trade => trade.status === status);
  }

  static getRecentTrades(limit: number = 10): PendingTrade[] {
    const trades = this.getPendingTrades();
    return Object.values(trades)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit);
  }

  private static cleanupOldTrades(trades: Record<string, PendingTrade>): void {
    const tradeList = Object.values(trades);
    
    if (tradeList.length <= this.MAX_TRADES) {
      return;
    }

    // Remove oldest completed/error trades first
    const completedTrades = tradeList
      .filter(trade => trade.status === 'confirmed' || trade.status === 'error')
      .sort((a, b) => a.updatedAt - b.updatedAt);

    const tradesToRemove = tradeList.length - this.MAX_TRADES + 10; // Remove extra for buffer
    
    for (let i = 0; i < Math.min(tradesToRemove, completedTrades.length); i++) {
      delete trades[completedTrades[i].id];
    }
  }

  static generateTradeId(): string {
    return `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateNonce(): string {
    return Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
  }

  // Export/Import functionality for backup
  static exportTrades(): string {
    const trades = this.getPendingTrades();
    return JSON.stringify(trades, null, 2);
  }

  static importTrades(data: string): boolean {
    try {
      const trades = JSON.parse(data);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trades));
      return true;
    } catch (error) {
      console.error('Failed to import trades:', error);
      return false;
    }
  }
}
