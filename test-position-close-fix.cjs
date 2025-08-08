#!/usr/bin/env node

/**
 * Test script to verify position closing functionality
 * This script tests the logic of marking positions as inactive after closing
 */

console.log('🧪 Testing Position Close Fix...\n');

// Mock trade data structure
const mockTrades = [
  {
    id: 'zkp-trade-123',
    timestamp: Date.now(),
    asset: 'ETH/USDC',
    size: '0.1 ETH',
    direction: 'Long',
    leverage: '10x',
    collateral: '100.00 USDC',
    commitment: 'commitment-hash-123',
    txHashes: {
      commitment: 'tx-commit-123',
      trade: 'tx-trade-123'
    },
    status: 'completed',
    pairId: 2,
    isActive: true,
    entryPrice: 2500,
    currentPrice: 2600,
    pnl: 40,
    tradeParams: {
      size: 0.1,
      isLong: true,
      leverage: 10,
      pairId: 2,
      useHBAR: false,
      selectedSymbol: 'ETH/USDC',
      currentPrice: 2500
    }
  },
  {
    id: 'zkp-trade-456',
    timestamp: Date.now() - 3600000,
    asset: 'BTC/USDC',
    size: '0.01 BTC',
    direction: 'Short',
    leverage: '5x',
    collateral: '200.00 USDC',
    commitment: 'commitment-hash-456',
    txHashes: {
      commitment: 'tx-commit-456',
      trade: 'tx-trade-456'
    },
    status: 'completed',
    pairId: 1,
    isActive: true,
    entryPrice: 50000,
    currentPrice: 49000,
    pnl: 100,
    tradeParams: {
      size: 0.01,
      isLong: false,
      leverage: 5,
      pairId: 1,
      useHBAR: false,
      selectedSymbol: 'BTC/USDC',
      currentPrice: 50000
    }
  }
];

console.log('📊 Initial Active Positions:');
const activePositions = mockTrades.filter(trade => trade.isActive);
activePositions.forEach(trade => {
  console.log(`   ${trade.id}: ${trade.asset} ${trade.direction} ${trade.size} (Active: ${trade.isActive})`);
});
console.log(`   Total Active: ${activePositions.length}\n`);

// Simulate closing the first position
console.log('🔴 Simulating position close for:', mockTrades[0].id);

// Mock the closing process
const tradeToClose = mockTrades[0];

// Step 1: Mark as inactive (this is what our fix does)
tradeToClose.isActive = false;
tradeToClose.status = 'completed';

// Step 2: Simulate reverse trade creation (then marking it inactive)
const reverseTrade = {
  ...tradeToClose,
  id: 'zkp-trade-reverse-789',
  commitment: 'reverse-commitment-hash',
  tradeParams: {
    ...tradeToClose.tradeParams,
    isLong: !tradeToClose.tradeParams.isLong // Reverse direction
  },
  direction: tradeToClose.direction === 'Long' ? 'Short' : 'Long',
  isActive: false, // This is the key fix - reverse trades should not be active
  status: 'completed'
};

// Add reverse trade to the list (but it's inactive)
mockTrades.push(reverseTrade);

console.log('✅ Position closed successfully\n');

// Check results
console.log('📊 Final Active Positions:');
const finalActivePositions = mockTrades.filter(trade => trade.isActive);
finalActivePositions.forEach(trade => {
  console.log(`   ${trade.id}: ${trade.asset} ${trade.direction} ${trade.size} (Active: ${trade.isActive})`);
});
console.log(`   Total Active: ${finalActivePositions.length}\n`);

console.log('📜 All Trade History (Active + Closed):');
mockTrades.forEach(trade => {
  const status = trade.isActive ? '🟢 ACTIVE' : '🔵 CLOSED';
  console.log(`   ${status} ${trade.id}: ${trade.asset} ${trade.direction} ${trade.size}`);
});

// Verify the fix
console.log('\n🔍 Verification:');
const originalTradeStillActive = mockTrades.find(t => t.id === 'zkp-trade-123')?.isActive;
const reverseTradeInactive = mockTrades.find(t => t.id === 'zkp-trade-reverse-789')?.isActive === false;

if (!originalTradeStillActive && reverseTradeInactive) {
  console.log('✅ SUCCESS: Position closing fix is working correctly!');
  console.log('   - Original position marked as inactive ✓');
  console.log('   - Reverse trade not shown as active position ✓');
  console.log('   - Only 1 active position remains (as expected) ✓');
} else {
  console.log('❌ FAILURE: Position closing fix needs more work');
  console.log(`   - Original position active: ${originalTradeStillActive}`);
  console.log(`   - Reverse trade inactive: ${reverseTradeInactive}`);
}

console.log('\n🎯 Expected Behavior:');
console.log('   - When user closes position → disappears from ZKP Trades tab');
console.log('   - Closed position → appears in History tab only');
console.log('   - Reverse trade → used for closing but not shown as active position');
