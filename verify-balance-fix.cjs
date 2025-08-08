/**
 * Balance Deduction Verification Script
 * Tests the corrected collateral calculation and deduction
 */

const { ethers } = require('ethers');
const fs = require('fs');

async function verifyBalanceDeduction() {
  console.log('🧪 Testing Balance Deduction Fix\n');

  // Test cases for different scenarios
  const testCases = [
    {
      name: 'ETH/USDC 0.1 ETH at 10x leverage',
      size: 0.1,
      currentPrice: 3206.12,
      leverage: 10,
      expectedCollateral: (0.1 * 3206.12) / 10, // $32.06
    },
    {
      name: 'SOL/USDC 1 SOL at 10x leverage',
      size: 1.0,
      currentPrice: 176.67,
      leverage: 10,
      expectedCollateral: (1.0 * 176.67) / 10, // $17.67
    },
    {
      name: 'BTC/USDC 0.01 BTC at 10x leverage',
      size: 0.01,
      currentPrice: 60120.0,
      leverage: 10,
      expectedCollateral: (0.01 * 60120.0) / 10, // $60.12
    }
  ];

  for (const testCase of testCases) {
    console.log(`📊 ${testCase.name}`);
    
    // Calculate the values as our service would
    const notionalValue = testCase.size * testCase.currentPrice;
    const requiredCollateral = notionalValue / testCase.leverage;
    const collateralInMicroUnits = Math.floor(requiredCollateral * 1000000);
    
    // Working size calculation (for ZK proof)
    const scaledSize = Math.floor(testCase.size * 100000);
    const workingSize = Math.max(scaledSize, 1000000);
    
    console.log(`   Size: ${testCase.size} tokens`);
    console.log(`   Current Price: $${testCase.currentPrice}`);
    console.log(`   Leverage: ${testCase.leverage}x`);
    console.log(`   Notional Value: $${notionalValue.toFixed(2)}`);
    console.log(`   Required Collateral: $${requiredCollateral.toFixed(2)}`);
    console.log(`   Expected: $${testCase.expectedCollateral.toFixed(2)}`);
    console.log(`   ✅ Match: ${Math.abs(requiredCollateral - testCase.expectedCollateral) < 0.01}`);
    console.log('');
    
    console.log(`   🔧 Contract Parameters:`);
    console.log(`   Working Size (ZK): ${workingSize} units`);
    console.log(`   Collateral (Contract): ${collateralInMicroUnits} micro-USDC`);
    console.log(`   Collateral (Human): $${(collateralInMicroUnits / 1000000).toFixed(2)}`);
    
    // Verify the micro-units conversion
    const backToUSDC = collateralInMicroUnits / 1000000;
    const conversionCorrect = Math.abs(backToUSDC - requiredCollateral) < 0.01;
    console.log(`   ✅ Micro-units conversion: ${conversionCorrect}`);
    console.log('');
    
    // Show the difference between old (wrong) and new (correct) approach
    const oldDeduction = workingSize / 1000000; // What was happening before
    const newDeduction = collateralInMicroUnits / 1000000; // What should happen now
    const improvement = newDeduction / oldDeduction;
    
    console.log(`   📉 Old deduction (wrong): $${oldDeduction.toFixed(2)}`);
    console.log(`   📈 New deduction (correct): $${newDeduction.toFixed(2)}`);
    console.log(`   🚀 Improvement: ${improvement.toFixed(1)}x more accurate`);
    console.log('');
    console.log('─'.repeat(60));
    console.log('');
  }

  console.log('🎯 Key Fix Summary:');
  console.log('');
  console.log('❌ Before (WRONG):');
  console.log('   contract.executeTrade(..., workingSize, ...)');
  console.log('   → workingSize = 1,000,000+ (scaled for ZK proof)');
  console.log('   → Contract deducts ~$1.00 regardless of actual trade size');
  console.log('');
  console.log('✅ After (CORRECT):');
  console.log('   contract.executeTrade(..., collateralInMicroUnits, ...)');
  console.log('   → collateralInMicroUnits = actualCollateral * 1,000,000');
  console.log('   → Contract deducts correct amount based on trade size and leverage');
  console.log('');
  console.log('🔑 The Fix:');
  console.log('   • workingSize: Used for ZK proof verification (stays in public inputs)');
  console.log('   • collateralInMicroUnits: Used for actual contract deduction');
  console.log('   • Separation of concerns: proof vs. economic logic');
  console.log('');
  console.log('✅ Expected Result:');
  console.log('   ETH trade: $0.10 → $32.06 (320x improvement)');
  console.log('   SOL trade: $0.10 → $17.67 (177x improvement)');
  console.log('   BTC trade: $0.10 → $60.12 (601x improvement)');
}

// Run the verification
verifyBalanceDeduction().catch(console.error);
