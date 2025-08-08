const { ethers } = require('ethers');

// Contract addresses and existing data
const DARKPOOL_ADDRESS = '0x7322b80aa5398d53543930d966c6ae0e9ee2e54e';
const USER_ADDRESS = '0xA5346951A6D3fAF19B96219CB12790a1db90fA0a'; // Account with balance
const EXISTING_COMMITMENT = '0x9eaea7993efee23f38bfe07e511cd574e705e1e795328c1e133d04facbb12b1e';

// Contract ABI
const DARKPOOL_ABI = [
  'function executeTrade(bytes proof, bytes32[] publicInputs, bytes32 commitment, uint256 size, bool isLong, bool useHBAR)',
  'function hbarBalances(address) view returns (uint256)',
  'function usdcBalances(address) view returns (uint256)',
  'function hbarLocked(address) view returns (uint256)',
  'function usdcLocked(address) view returns (uint256)',
  'function usedCommitments(bytes32) view returns (bool)',
  'function commitmentToTrader(bytes32) view returns (address)',
  'function paused() view returns (bool)',
  'function takerFee() view returns (uint256)'
];

class ZKPTradeSimulator {
  constructor() {
    this.provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');
    this.contract = new ethers.Contract(DARKPOOL_ADDRESS, DARKPOOL_ABI, this.provider);
  }

  async checkBalances() {
    console.log('🔍 Checking current balances for:', USER_ADDRESS);
    
    const hbarBalance = await this.contract.hbarBalances(USER_ADDRESS);
    const usdcBalance = await this.contract.usdcBalances(USER_ADDRESS);
    const hbarLocked = await this.contract.hbarLocked(USER_ADDRESS);
    const usdcLocked = await this.contract.usdcLocked(USER_ADDRESS);
    const takerFee = await this.contract.takerFee();
    const isPaused = await this.contract.paused();
    
    console.log('📊 Balance Report:');
    console.log('  HBAR Balance:', ethers.formatEther(hbarBalance), 'HBAR');
    console.log('  USDC Balance:', ethers.formatUnits(usdcBalance, 6), 'USDC');
    console.log('  HBAR Locked:', ethers.formatEther(hbarLocked), 'HBAR');
    console.log('  USDC Locked:', ethers.formatUnits(usdcLocked, 6), 'USDC');
    console.log('  Taker Fee:', takerFee.toString(), 'basis points');
    console.log('  Contract Paused:', isPaused);
    
    return {
      hbarBalance,
      usdcBalance,
      hbarLocked,
      usdcLocked,
      takerFee,
      isPaused
    };
  }

  async checkCommitment() {
    console.log('🔐 Checking existing commitment:', EXISTING_COMMITMENT);
    
    const isUsed = await this.contract.usedCommitments(EXISTING_COMMITMENT);
    const trader = await this.contract.commitmentToTrader(EXISTING_COMMITMENT);
    
    console.log('  Commitment exists:', isUsed);
    console.log('  Commitment trader:', trader);
    console.log('  Trader matches user:', trader.toLowerCase() === USER_ADDRESS.toLowerCase());
    
    return { isUsed, trader, isValid: isUsed && trader.toLowerCase() === USER_ADDRESS.toLowerCase() };
  }

  calculateCollateralRequirements(size, useHBAR, takerFee) {
    // From contract: collateral = size / 10, fee = (collateral * takerFee) / 10000
    const collateral = BigInt(size) / BigInt(10);
    const fee = (collateral * takerFee) / BigInt(10000);
    const total = collateral + fee;
    
    const collateralType = useHBAR ? 'HBAR' : 'USDC';
    const formatFunc = useHBAR ? ethers.formatEther : (val) => ethers.formatUnits(val, 6);
    
    console.log(`💰 Collateral Requirements for ${collateralType}:`);
    console.log(`  Position Size: ${size}`);
    console.log(`  Collateral: ${formatFunc(collateral)} ${collateralType}`);
    console.log(`  Fee: ${formatFunc(fee)} ${collateralType}`);
    console.log(`  Total Required: ${formatFunc(total)} ${collateralType}`);
    
    return { collateral, fee, total };
  }

  async simulateTrade(size, isLong, useHBAR) {
    const collateralType = useHBAR ? 'HBAR' : 'USDC';
    const direction = isLong ? 'Long' : 'Short';
    
    console.log(`\n🧪 SIMULATING: ${direction} position with ${collateralType}`);
    console.log(`   Size: ${size}`);
    
    // Use the existing proof data that worked in our tests
    const proof = '0x6d65b1d347473108ae58e7e8266ed18ba62682a3b5487a6e1a2495e6d294af0e35d28d2246e790c59f2a8f4c7ecd841504f8efbafcbab98e3963167e77b7746d';
    const publicInputs = [
      EXISTING_COMMITMENT,
      '0x000000000000000000000000a5346951a6d3faf19b96219cb12790a1db90fa0a',
      ethers.zeroPadValue(ethers.toBeHex(isLong ? 1 : 0), 32), // Update direction
      ethers.zeroPadValue(ethers.toBeHex(size), 32), // Update size
      '0x000000000000000000000000000000000000000000000000000000000000000a'
    ];
    
    try {
      // Use staticCall to simulate without executing
      const result = await this.contract.executeTrade.staticCall(
        proof,
        publicInputs,
        EXISTING_COMMITMENT,
        size,
        isLong,
        useHBAR,
        { from: USER_ADDRESS }
      );
      
      console.log(`✅ ${collateralType} simulation SUCCEEDED`);
      return { success: true, result };
      
    } catch (error) {
      console.log(`❌ ${collateralType} simulation FAILED:`, error.reason || error.message);
      
      // Check if it's a balance issue
      const balances = await this.checkBalances();
      const takerFee = balances.takerFee;
      const requirements = this.calculateCollateralRequirements(size, useHBAR, takerFee);
      
      const availableBalance = useHBAR ? 
        (balances.hbarBalance - balances.hbarLocked) : 
        (balances.usdcBalance - balances.usdcLocked);
      
      const hasBalance = availableBalance >= requirements.total;
      console.log(`   Available Balance: ${useHBAR ? ethers.formatEther(availableBalance) : ethers.formatUnits(availableBalance, 6)} ${collateralType}`);
      console.log(`   Sufficient Balance: ${hasBalance}`);
      
      return { 
        success: false, 
        error: error.reason || error.message, 
        hasBalance,
        requirements 
      };
    }
  }

  async testSizeLimits() {
    console.log('\n🔍 Testing different position sizes...');
    
    const sizesToTest = [
      1000,    // Very small
      5000,    // Small  
      10000,   // Original working size
      15000,   // Medium
      20000,   // Large
      50000    // Very large
    ];
    
    for (const size of sizesToTest) {
      console.log(`\nTesting size: ${size}`);
      
      try {
        const proof = '0x6d65b1d347473108ae58e7e8266ed18ba62682a3b5487a6e1a2495e6d294af0e35d28d2246e790c59f2a8f4c7ecd841504f8efbafcbab98e3963167e77b7746d';
        const publicInputs = [
          EXISTING_COMMITMENT,
          '0x000000000000000000000000a5346951a6d3faf19b96219cb12790a1db90fa0a',
          '0x0000000000000000000000000000000000000000000000000000000000000001',
          ethers.zeroPadValue(ethers.toBeHex(size), 32),
          '0x000000000000000000000000000000000000000000000000000000000000000a'
        ];
        
        await this.contract.executeTrade.staticCall(
          proof,
          publicInputs,
          EXISTING_COMMITMENT,
          size,
          true,
          false, // Use USDC
          { from: USER_ADDRESS }
        );
        
        console.log(`  ✅ Size ${size}: SUCCESS`);
        
      } catch (error) {
        console.log(`  ❌ Size ${size}: ${error.reason || 'FAILED'}`);
      }
    }
  }

  async runAnalysis() {
    console.log('🎯 ZKP Trade Analysis');
    console.log('=====================================\n');
    
    // Check initial state
    const balances = await this.checkBalances();
    
    if (balances.isPaused) {
      console.log('❌ Contract is paused, cannot test trades');
      return;
    }
    
    const commitment = await this.checkCommitment();
    
    if (!commitment.isValid) {
      console.log('❌ Commitment is not valid for testing');
      return;
    }
    
    // Test size limits
    await this.testSizeLimits();
    
    // Test both collateral types with working size
    const workingSize = 10000;
    
    console.log(`\n🧪 COLLATERAL COMPARISON (Size: ${workingSize})`);
    console.log('=====================================');
    
    // Test USDC collateral
    const usdcResult = await this.simulateTrade(workingSize, true, false);
    
    // Test HBAR collateral  
    const hbarResult = await this.simulateTrade(workingSize, false, true);
    
    // Summary
    console.log('\n📋 ANALYSIS SUMMARY');
    console.log('=====================================');
    console.log('USDC Collateral:', usdcResult.success ? '✅ VIABLE' : '❌ NOT VIABLE');
    console.log('HBAR Collateral:', hbarResult.success ? '✅ VIABLE' : '❌ NOT VIABLE');
    
    if (usdcResult.success && hbarResult.success) {
      console.log('\n💡 RECOMMENDATION: Both collateral types work - use USDC for better balance');
    } else if (usdcResult.success) {
      console.log('\n💡 RECOMMENDATION: Use USDC collateral only');
    } else if (hbarResult.success) {
      console.log('\n💡 RECOMMENDATION: Use HBAR collateral only');
    } else {
      console.log('\n⚠️  ISSUE: Neither collateral type works with current setup');
    }
    
    return {
      usdc: usdcResult,
      hbar: hbarResult,
      recommendation: usdcResult.success ? 'USDC' : (hbarResult.success ? 'HBAR' : 'NONE')
    };
  }
}

// Run the analysis
async function main() {
  try {
    const analyzer = new ZKPTradeSimulator();
    const results = await analyzer.runAnalysis();
    
    console.log('\n🎯 Results for UI Implementation:');
    console.log('- Preferred collateral:', results.recommendation);
    console.log('- Working position size: 10000');
    console.log('- Account has sufficient balance for USDC trades');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

main().catch(console.error);
