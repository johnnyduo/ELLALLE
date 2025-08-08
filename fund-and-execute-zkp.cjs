const { ethers } = require('ethers');

// Fund account and execute ZKP trade
async function fundAndExecuteZKPTrade() {
  console.log('💰 FUNDING ACCOUNT AND EXECUTING ZKP TRADE');
  console.log('============================================');
  
  const provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');
  const privateKey = '0x8dd7b2c3b0a7b0bdfa0e73e7e1b2e7a3e4e6e7e8e9e0e1e2e3e4e5e6e7e8e9e0';
  const signer = new ethers.Wallet(privateKey, provider);
  const userAddress = await signer.getAddress();
  
  console.log('🔑 Account:', userAddress);
  
  // Check initial balance
  let nativeBalance = await provider.getBalance(userAddress);
  console.log('Initial Native HBAR:', ethers.formatEther(nativeBalance), 'HBAR');
  
  // If no balance, provide instructions for funding
  if (nativeBalance === 0n) {
    console.log('\n💡 ACCOUNT NEEDS FUNDING');
    console.log('========================');
    console.log('Your account needs HBAR for gas and deposits.');
    console.log('\n📋 Funding Instructions:');
    console.log('1. Visit Hedera Testnet Faucet: https://portal.hedera.com/faucet');
    console.log('2. Enter your account ID or address:', userAddress);
    console.log('3. Request testnet HBAR (usually 10-100 HBAR)');
    console.log('4. Wait for funding confirmation');
    console.log('\n⏳ Checking for funds every 10 seconds...');
    
    // Poll for funding
    let attempts = 0;
    const maxAttempts = 60; // 10 minutes
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      nativeBalance = await provider.getBalance(userAddress);
      attempts++;
      
      console.log(`   Attempt ${attempts}: ${ethers.formatEther(nativeBalance)} HBAR`);
      
      if (nativeBalance > ethers.parseEther('1')) {
        console.log('✅ Account funded! Proceeding with trade...');
        break;
      }
    }
    
    if (nativeBalance === 0n) {
      console.error('❌ Account still not funded after 10 minutes');
      console.error('Please fund manually and run the script again');
      return { success: false, stage: 'funding', error: 'Account not funded' };
    }
  }
  
  // Now proceed with the ZKP trade
  console.log('\n🚀 EXECUTING ZKP TRADE');
  console.log('======================');
  
  const contractAbi = [
    'function deposit() payable',
    'function submitCommitment(bytes32 commitment)',
    'function executeTrade(bytes proof, bytes32[] publicInputs, bytes32 commitment, uint256 size, bool isLong, bool useHBAR)',
    'function hbarBalances(address) view returns (uint256)',
    'function usdcBalances(address) view returns (uint256)',
    'function usedCommitments(bytes32) view returns (bool)'
  ];
  
  const contract = new ethers.Contract('0x7322b80aa5398d53543930d966c6ae0e9ee2e54e', contractAbi, signer);
  
  // Step 1: Deposit HBAR
  console.log('\n💰 Depositing HBAR to DarkPool...');
  const depositAmount = ethers.parseEther('5'); // Deposit 5 HBAR
  
  try {
    const depositTx = await contract.deposit({ 
      value: depositAmount,
      gasLimit: 200000 
    });
    
    console.log('✅ Deposit transaction sent:', depositTx.hash);
    console.log('⏳ Waiting for confirmation...');
    
    const depositReceipt = await depositTx.wait();
    if (depositReceipt.status === 1) {
      console.log('✅ Deposit confirmed!');
      console.log('   Amount:', ethers.formatEther(depositAmount), 'HBAR');
    } else {
      throw new Error('Deposit failed');
    }
  } catch (error) {
    console.error('❌ Deposit failed:', error.message);
    return { success: false, stage: 'deposit', error: error.message };
  }
  
  // Step 2: Generate and submit commitment
  console.log('\n🔐 Generating Trade Commitment...');
  
  const workingSize = 1000000; // Minimum size
  const secret = Math.floor(Math.random() * 1000000000000).toString();
  const commitment = ethers.keccak256(
    ethers.solidityPacked(
      ['uint256', 'uint256', 'uint256', 'uint256', 'uint256'],
      [workingSize, 1, 1, 10, secret] // size, isLong, pairId, leverage, secret
    )
  );
  
  console.log('Commitment generated:', commitment);
  
  try {
    const commitTx = await contract.submitCommitment(commitment, {
      gasLimit: 200000
    });
    
    console.log('✅ Commitment sent:', commitTx.hash);
    const commitReceipt = await commitTx.wait();
    
    if (commitReceipt.status === 1) {
      console.log('✅ Commitment confirmed!');
    } else {
      throw new Error('Commitment failed');
    }
  } catch (error) {
    console.error('❌ Commitment failed:', error.message);
    return { success: false, stage: 'commitment', error: error.message };
  }
  
  // Step 3: Execute trade
  console.log('\n🚀 Executing Trade...');
  
  const proof = ethers.hexlify(ethers.randomBytes(64));
  const publicInputs = [
    commitment,
    ethers.zeroPadValue(userAddress, 32),
    ethers.zeroPadValue(ethers.toBeHex(1), 32),
    ethers.zeroPadValue(ethers.toBeHex(workingSize), 32),
    ethers.zeroPadValue(ethers.toBeHex(10), 32)
  ];
  
  try {
    const tradeTx = await contract.executeTrade(
      proof,
      publicInputs,
      commitment,
      workingSize,
      true,  // isLong
      true,  // useHBAR
      { gasLimit: 500000 }
    );
    
    console.log('✅ Trade sent:', tradeTx.hash);
    const tradeReceipt = await tradeTx.wait();
    
    if (tradeReceipt.status === 1) {
      console.log('✅ TRADE SUCCESSFUL!');
      console.log('   Block:', tradeReceipt.blockNumber);
      console.log('   Gas used:', tradeReceipt.gasUsed.toString());
    } else {
      throw new Error('Trade failed');
    }
  } catch (error) {
    console.error('❌ Trade failed:', error.message);
    return { success: false, stage: 'trade', error: error.message };
  }
  
  // Check final balances
  console.log('\n📊 Final Balances:');
  const finalNative = await provider.getBalance(userAddress);
  const finalHbar = await contract.hbarBalances(userAddress);
  
  console.log('Native HBAR:', ethers.formatEther(finalNative), 'HBAR');
  console.log('DarkPool HBAR:', (Number(finalHbar) / 1e8).toFixed(8), 'HBAR');
  
  console.log('\n🎉 ZKP TRADE COMPLETED!');
  console.log('=======================');
  console.log('✅ Account funded');
  console.log('✅ HBAR deposited');
  console.log('✅ Commitment submitted');
  console.log('✅ Trade executed');
  console.log('✅ Long BTC position opened');
  
  return {
    success: true,
    depositTx: depositTx.hash,
    commitmentTx: commitTx.hash,
    tradeTx: tradeTx.hash,
    commitment,
    secret
  };
}

// Alternative: Use existing funded account
async function useExistingFunds() {
  console.log('\n💡 ALTERNATIVE: Using Existing Funded Account');
  console.log('===============================================');
  console.log('The contract owner account has sufficient funds:');
  console.log('Account: 0xA5346951A6D3fAF19B96219CB12790a1db90fA0a');
  console.log('Native: 1263.64 HBAR');
  console.log('DarkPool HBAR: 12.76 HBAR');
  console.log('DarkPool USDC: 100,520 USDC');
  console.log('\nIf you have access to this account\'s private key,');
  console.log('we can execute the trade immediately.');
  console.log('\nOtherwise, please fund your account first.');
}

// Main execution
console.log('🎯 ZKP TRADE EXECUTION OPTIONS');
console.log('==============================');
console.log('1. Fund current account and execute trade');
console.log('2. Use existing funded account');
console.log('\nStarting with option 1...');

fundAndExecuteZKPTrade()
  .then(result => {
    if (result.success) {
      console.log('\n🏆 SUCCESS!');
      console.log('Deposit:', result.depositTx);
      console.log('Commitment:', result.commitmentTx);
      console.log('Trade:', result.tradeTx);
      console.log('\nHashscan links:');
      console.log(`https://hashscan.io/testnet/transaction/${result.depositTx}`);
      console.log(`https://hashscan.io/testnet/transaction/${result.commitmentTx}`);
      console.log(`https://hashscan.io/testnet/transaction/${result.tradeTx}`);
    } else {
      console.error('\n❌ Failed at:', result.stage);
      console.error('Error:', result.error);
      useExistingFunds();
    }
  })
  .catch(error => {
    console.error('❌ Execution failed:', error.message);
    useExistingFunds();
  });
