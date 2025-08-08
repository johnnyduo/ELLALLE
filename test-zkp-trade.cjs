const { ethers } = require('ethers');

// Contract addresses
const DARKPOOL_ADDRESS = '0x7322b80aa5398d53543930d966c6ae0e9ee2e54e';

// Contract ABI
const DARKPOOL_ABI = [
  'function executeTrade(bytes proof, bytes32[] publicInputs, bytes32 commitment, uint256 size, bool isLong, bool useHBAR)',
  'function submitCommitment(bytes32 commitment)',
  'function hbarBalances(address) view returns (uint256)',
  'function usdcBalances(address) view returns (uint256)',
  'function hbarLocked(address) view returns (uint256)',
  'function usdcLocked(address) view returns (uint256)',
  'function usedCommitments(bytes32) view returns (bool)',
  'function commitmentToTrader(bytes32) view returns (address)',
  'function paused() view returns (bool)',
  'function takerFee() view returns (uint256)'
];

class ZKPTradeTest {
  constructor() {
    this.provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');
    this.privateKey = '0x8dd7b2c3b0a7b0bdfa0e73e7e1b2e7a3e4e6e7e8e9e0e1e2e3e4e5e6e7e8e9e0';
    this.signer = new ethers.Wallet(this.privateKey, this.provider);
    this.contract = new ethers.Contract(DARKPOOL_ADDRESS, DARKPOOL_ABI, this.signer);
  }

  async checkBalances() {
    console.log('🔍 Checking current balances...');
    const userAddress = await this.signer.getAddress();
    
    const hbarBalance = await this.contract.hbarBalances(userAddress);
    const usdcBalance = await this.contract.usdcBalances(userAddress);
    const hbarLocked = await this.contract.hbarLocked(userAddress);
    const usdcLocked = await this.contract.usdcLocked(userAddress);
    const takerFee = await this.contract.takerFee();
    const isPaused = await this.contract.paused();
    
    console.log('📊 Balance Report:');
    console.log('  User Address:', userAddress);
    console.log('  HBAR Balance:', ethers.formatEther(hbarBalance), 'HBAR');
    console.log('  USDC Balance:', ethers.formatUnits(usdcBalance, 6), 'USDC');
    console.log('  HBAR Locked:', ethers.formatEther(hbarLocked), 'HBAR');
    console.log('  USDC Locked:', ethers.formatUnits(usdcLocked, 6), 'USDC');
    console.log('  Taker Fee:', takerFee.toString(), 'basis points');
    console.log('  Contract Paused:', isPaused);
    
    return {
      userAddress,
      hbarBalance,
      usdcBalance,
      hbarLocked,
      usdcLocked,
      takerFee,
      isPaused
    };
  }

  generateCommitment(params) {
    // Generate a simple commitment based on trade parameters
    const commitmentData = ethers.solidityPackedKeccak256(
      ['address', 'uint256', 'bool', 'uint256', 'uint256'],
      [params.traderAddress, params.size, params.isLong, params.pairId, params.timestamp]
    );
    
    return {
      commitment: commitmentData,
      secret: ethers.randomBytes(32)
    };
  }

  generateMockProof(commitment, size, isLong, traderAddress) {
    // Generate mock proof data for testing
    const proof = ethers.randomBytes(64); // 64 bytes of random data
    
    const publicInputs = [
      commitment, // commitment
      ethers.zeroPadValue(traderAddress, 32), // trader address
      ethers.zeroPadValue(ethers.toBeHex(isLong ? 1 : 0), 32), // direction (1=long, 0=short)
      ethers.zeroPadValue(ethers.toBeHex(size), 32), // size
      ethers.zeroPadValue(ethers.toBeHex(10), 32) // leverage
    ];
    
    return {
      proof: ethers.hexlify(proof),
      publicInputs,
      commitment
    };
  }

  async submitCommitment(commitment) {
    console.log('📝 Submitting commitment...');
    
    try {
      const tx = await this.contract.submitCommitment(commitment, {
        gasLimit: 200000
      });
      
      console.log('✅ Commitment transaction sent:', tx.hash);
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log('✅ Commitment confirmed on blockchain');
        return { success: true, txHash: tx.hash };
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('❌ Commitment failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async executeTrade(proof, size, isLong, useHBAR) {
    const collateralType = useHBAR ? 'HBAR' : 'USDC';
    console.log(`\n🚀 Executing ZKP Trade with ${collateralType}...`);
    console.log('  Size:', size);
    console.log('  Direction:', isLong ? 'Long' : 'Short');
    console.log('  Collateral:', collateralType);
    
    try {
      const tx = await this.contract.executeTrade(
        proof.proof,
        proof.publicInputs,
        proof.commitment,
        size,
        isLong,
        useHBAR,
        {
          gasLimit: 500000
        }
      );
      
      console.log('✅ Trade transaction sent:', tx.hash);
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log('✅ Trade confirmed on blockchain');
        
        // Parse events from receipt
        if (receipt.logs && receipt.logs.length > 0) {
          console.log('📋 Transaction Events:');
          receipt.logs.forEach((log, index) => {
            try {
              const parsedLog = this.contract.interface.parseLog(log);
              console.log(`  Event ${index + 1}:`, parsedLog.name, parsedLog.args);
            } catch (e) {
              console.log(`  Raw Log ${index + 1}:`, log.topics);
            }
          });
        }
        
        return { success: true, txHash: tx.hash, receipt };
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('❌ Trade execution failed:', error.message);
      if (error.reason) {
        console.error('   Reason:', error.reason);
      }
      if (error.data) {
        console.error('   Data:', error.data);
      }
      return { success: false, error: error.message, reason: error.reason };
    }
  }

  async testFullTradeFlow(size, isLong, useHBAR) {
    const collateralType = useHBAR ? 'HBAR' : 'USDC';
    console.log(`\n===============================`);
    console.log(`🧪 Testing ZKP Trade Flow with ${collateralType}`);
    console.log(`   Size: ${size}`);
    console.log(`   Direction: ${isLong ? 'Long' : 'Short'}`);
    console.log(`===============================`);
    
    const userAddress = await this.signer.getAddress();
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Step 1: Generate commitment
    const commitmentData = this.generateCommitment({
      traderAddress: userAddress,
      size,
      isLong,
      pairId: 1, // BTC/USD
      timestamp
    });
    
    console.log('🔐 Generated commitment:', commitmentData.commitment);
    
    // Step 2: Submit commitment
    const commitmentResult = await this.submitCommitment(commitmentData.commitment);
    if (!commitmentResult.success) {
      console.log('❌ Test failed at commitment stage');
      return { success: false, stage: 'commitment' };
    }
    
    // Step 3: Generate proof
    const proof = this.generateMockProof(
      commitmentData.commitment,
      size,
      isLong,
      userAddress
    );
    
    console.log('🔬 Generated proof with', proof.publicInputs.length, 'public inputs');
    
    // Step 4: Execute trade
    const tradeResult = await this.executeTrade(proof, size, isLong, useHBAR);
    
    return {
      success: tradeResult.success,
      stage: tradeResult.success ? 'completed' : 'execution',
      commitmentTx: commitmentResult.txHash,
      tradeTx: tradeResult.txHash,
      error: tradeResult.error,
      reason: tradeResult.reason
    };
  }

  async runTests() {
    console.log('🎯 Starting ZKP Trade Tests');
    console.log('=====================================\n');
    
    // Check initial balances
    const balances = await this.checkBalances();
    
    if (balances.isPaused) {
      console.log('❌ Contract is paused, cannot test trades');
      return;
    }
    
    // Test parameters
    const testSize = 10000; // Use size that matches our working proof
    
    // Test 1: Trade with USDC
    console.log('\n🧪 TEST 1: Long position with USDC collateral');
    const usdcTest = await this.testFullTradeFlow(testSize, true, false);
    
    // Check balances after USDC test
    if (usdcTest.success) {
      console.log('\n📊 Balances after USDC trade:');
      await this.checkBalances();
    }
    
    // Test 2: Trade with HBAR (if sufficient balance)
    console.log('\n🧪 TEST 2: Short position with HBAR collateral');
    const hbarTest = await this.testFullTradeFlow(testSize, false, true);
    
    // Check final balances
    if (hbarTest.success) {
      console.log('\n📊 Final balances after HBAR trade:');
      await this.checkBalances();
    }
    
    // Summary
    console.log('\n📋 TEST SUMMARY');
    console.log('=====================================');
    console.log('USDC Trade:', usdcTest.success ? '✅ SUCCESS' : '❌ FAILED');
    if (!usdcTest.success) {
      console.log('  Error:', usdcTest.error);
      console.log('  Stage:', usdcTest.stage);
    } else {
      console.log('  Commitment TX:', usdcTest.commitmentTx);
      console.log('  Trade TX:', usdcTest.tradeTx);
    }
    
    console.log('HBAR Trade:', hbarTest.success ? '✅ SUCCESS' : '❌ FAILED');
    if (!hbarTest.success) {
      console.log('  Error:', hbarTest.error);
      console.log('  Stage:', hbarTest.stage);
    } else {
      console.log('  Commitment TX:', hbarTest.commitmentTx);
      console.log('  Trade TX:', hbarTest.tradeTx);
    }
  }
}

// Run the tests
async function main() {
  try {
    const tester = new ZKPTradeTest();
    await tester.runTests();
  } catch (error) {
    console.error('❌ Test script failed:', error);
  }
}

main().catch(console.error);
