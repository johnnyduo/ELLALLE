const { ethers } = require('ethers');

// Test actual trade execution with current balances
async function testCurrentSetup() {
  console.log('🧪 Testing Current ZKP Trade Setup');
  console.log('=====================================\n');

  const provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');
  const userAddress = '0xA5346951A6D3fAF19B96219CB12790a1db90fA0a';
  
  // Check all balances
  const nativeBalance = await provider.getBalance(userAddress);
  console.log('📊 Current Balances:');
  console.log('Native HBAR:', ethers.formatEther(nativeBalance), 'HBAR');
  
  const contractAbi = [
    'function hbarBalances(address) view returns (uint256)',
    'function usdcBalances(address) view returns (uint256)',
    'function executeTrade(bytes proof, bytes32[] publicInputs, bytes32 commitment, uint256 size, bool isLong, bool useHBAR)',
    'function usedCommitments(bytes32) view returns (bool)',
    'function commitmentToTrader(bytes32) view returns (address)'
  ];
  
  const contract = new ethers.Contract('0x7322b80aa5398d53543930d966c6ae0e9ee2e54e', contractAbi, provider);
  
  const hbarBalance = await contract.hbarBalances(userAddress);
  const usdcBalance = await contract.usdcBalances(userAddress);
  
  // Fix: Use correct Hedera decimal places (8 decimals, not 18)
  const hbarFormatted = (Number(hbarBalance) / 1e8).toFixed(8);
  console.log('DarkPool HBAR:', hbarFormatted, 'HBAR');
  console.log('DarkPool USDC:', ethers.formatUnits(usdcBalance, 6), 'USDC');
  
  // Check if we can use existing commitment
  const existingCommitment = '0x9eaea7993efee23f38bfe07e511cd574e705e1e795328c1e133d04facbb12b1e';
  const isUsed = await contract.usedCommitments(existingCommitment);
  const trader = await contract.commitmentToTrader(existingCommitment);
  
  console.log('\\n🔐 Commitment Status:');
  console.log('Existing commitment valid:', isUsed && trader.toLowerCase() === userAddress.toLowerCase());
  
  if (!isUsed || trader.toLowerCase() !== userAddress.toLowerCase()) {
    console.log('❌ Need to create new commitment first');
    return;
  }
  
  // Test USDC trade (recommended since DarkPool has plenty USDC)
  console.log('\\n🧪 Testing USDC Trade:');
  const workingSize = 1000000; // Confirmed working size
  
  try {
    const proof = '0x6d65b1d347473108ae58e7e8266ed18ba62682a3b5487a6e1a2495e6d294af0e35d28d2246e790c59f2a8f4c7ecd841504f8efbafcbab98e3963167e77b7746d';
    const publicInputs = [
      existingCommitment,
      '0x000000000000000000000000a5346951a6d3faf19b96219cb12790a1db90fa0a',
      '0x0000000000000000000000000000000000000000000000000000000000000001', // Long
      ethers.zeroPadValue(ethers.toBeHex(workingSize), 32),
      '0x000000000000000000000000000000000000000000000000000000000000000a'
    ];
    
    await contract.executeTrade.staticCall(
      proof,
      publicInputs,
      existingCommitment,
      workingSize,
      true,  // Long
      false, // Use USDC
      { from: userAddress }
    );
    
    console.log('✅ USDC trade simulation: SUCCESS');
    
    // Calculate collateral requirements
    const collateral = BigInt(workingSize) / BigInt(10);
    const fee = (collateral * BigInt(20)) / BigInt(10000); // 20 basis points
    const total = collateral + fee;
    
    console.log('💰 Trade Requirements:');
    console.log('Position size:', workingSize);
    console.log('USDC collateral needed:', ethers.formatUnits(total, 6), 'USDC');
    console.log('Available USDC:', ethers.formatUnits(usdcBalance, 6), 'USDC');
    console.log('Sufficient balance:', usdcBalance >= total ? '✅' : '❌');
    
  } catch (error) {
    console.log('❌ USDC trade failed:', error.reason || error.message);
  }
  
  // Test HBAR trade (requires DarkPool HBAR deposit)
  console.log('\\n🧪 Testing HBAR Trade:');
  
  try {
    const proof = '0x6d65b1d347473108ae58e7e8266ed18ba62682a3b5487a6e1a2495e6d294af0e35d28d2246e790c59f2a8f4c7ecd841504f8efbafcbab98e3963167e77b7746d';
    const publicInputs = [
      existingCommitment,
      '0x000000000000000000000000a5346951a6d3faf19b96219cb12790a1db90fa0a',
      '0x0000000000000000000000000000000000000000000000000000000000000000', // Short
      ethers.zeroPadValue(ethers.toBeHex(workingSize), 32),
      '0x000000000000000000000000000000000000000000000000000000000000000a'
    ];
    
    await contract.executeTrade.staticCall(
      proof,
      publicInputs,
      existingCommitment,
      workingSize,
      false, // Short
      true,  // Use HBAR
      { from: userAddress }
    );
    
    console.log('✅ HBAR trade simulation: SUCCESS');
    
    // Calculate HBAR requirements
    const collateral = BigInt(workingSize) / BigInt(10);
    const fee = (collateral * BigInt(20)) / BigInt(10000);
    const total = collateral + fee;
    
    console.log('💰 HBAR Requirements:');
    console.log('HBAR collateral needed:', (Number(total) / 1e8).toFixed(8), 'HBAR');
    console.log('Available in DarkPool:', (Number(hbarBalance) / 1e8).toFixed(8), 'HBAR');
    console.log('Available natively:', ethers.formatEther(nativeBalance), 'HBAR');
    console.log('Sufficient DarkPool balance:', hbarBalance >= total ? '✅' : '❌');
    
    if (hbarBalance < total) {
      const needed = total - hbarBalance;
      console.log('⚠️  Need to deposit:', (Number(needed) / 1e8).toFixed(8), 'HBAR to DarkPool');
    }
    
  } catch (error) {
    console.log('❌ HBAR trade failed:', error.reason || error.message);
  }
  
  // Recommendations
  console.log('\\n💡 RECOMMENDATIONS:');
  console.log('===================');
  
  if (usdcBalance >= BigInt(100200)) {
    console.log('✅ USDC trades ready - abundant balance in DarkPool');
  }
  
  if (hbarBalance < BigInt(100200)) {
    console.log('⚠️  HBAR trades need deposit - current DarkPool balance too low');
    console.log('   Native HBAR available:', ethers.formatEther(nativeBalance));
    console.log('   Consider depositing ~2 HBAR to DarkPool for HBAR trades');
  } else {
    console.log('✅ HBAR trades ready');
  }
  
  return {
    usdcReady: usdcBalance >= BigInt(100200),
    hbarReady: hbarBalance >= BigInt(100200),
    nativeHbar: ethers.formatEther(nativeBalance),
    darkpoolHbar: (Number(hbarBalance) / 1e8).toFixed(8),
    recommendDeposit: hbarBalance < BigInt(100200)
  };
}

testCurrentSetup()
  .then(results => {
    console.log('\\n📋 Test Summary:', results);
  })
  .catch(error => {
    console.error('❌ Test failed:', error.message);
  });
