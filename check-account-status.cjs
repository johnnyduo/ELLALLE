const { ethers } = require('ethers');

async function checkAccountStatus() {
  console.log('🔍 CHECKING ACCOUNT STATUS');
  console.log('===========================');
  
  const provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');
  const privateKey = '0x8dd7b2c3b0a7b0bdfa0e73e7e1b2e7a3e4e6e7e8e9e0e1e2e3e4e5e6e7e8e9e0';
  const signer = new ethers.Wallet(privateKey, provider);
  const userAddress = await signer.getAddress();
  
  console.log('Account:', userAddress);
  
  // Check native balance
  const nativeBalance = await provider.getBalance(userAddress);
  console.log('Native HBAR:', ethers.formatEther(nativeBalance), 'HBAR');
  console.log('Native Balance (tinybars):', nativeBalance.toString());
  
  // Check if we have at least some gas
  const minGas = ethers.parseEther('0.01'); // 0.01 HBAR for gas
  console.log('Can pay gas:', nativeBalance >= minGas ? '✅' : '❌');
  
  // Check contract balances anyway
  const contractAbi = [
    'function hbarBalances(address) view returns (uint256)',
    'function usdcBalances(address) view returns (uint256)'
  ];
  
  const contract = new ethers.Contract('0x7322b80aa5398d53543930d966c6ae0e9ee2e54e', contractAbi, provider);
  
  try {
    const hbarBalance = await contract.hbarBalances(userAddress);
    const usdcBalance = await contract.usdcBalances(userAddress);
    
    console.log('\nDarkPool Balances:');
    console.log('  HBAR:', (Number(hbarBalance) / 1e8).toFixed(8), 'HBAR');
    console.log('  USDC:', ethers.formatUnits(usdcBalance, 6), 'USDC');
    
    // Check if we have enough in darkpool for a trade
    const minCollateral = ethers.parseUnits('0.1', 8); // 0.1 HBAR minimum
    console.log('Can trade with existing:', hbarBalance >= minCollateral ? '✅' : '❌');
    
  } catch (error) {
    console.error('❌ Error checking darkpool:', error.message);
  }
  
  // Check different accounts from conversation history
  console.log('\n🔍 Checking other possible accounts...');
  
  const testAccounts = [
    '0x95eBc930e34979991ED99B82755f8021D0dA0Fef', // Current
    '0xA5346951A6D3fAF19B96219CB12790a1db90fA0a', // Contract owner
    '0x1234567890123456789012345678901234567890', // Test
  ];
  
  for (const account of testAccounts) {
    try {
      const balance = await provider.getBalance(account);
      const hbar = await contract.hbarBalances(account);
      const usdc = await contract.usdcBalances(account);
      
      console.log(`\\n${account}:`);
      console.log(`  Native: ${ethers.formatEther(balance)} HBAR`);
      console.log(`  Pool HBAR: ${(Number(hbar) / 1e8).toFixed(8)} HBAR`);
      console.log(`  Pool USDC: ${ethers.formatUnits(usdc, 6)} USDC`);
      
    } catch (error) {
      console.log(`\\n${account}: Error checking`);
    }
  }
  
  console.log('\\n💡 Solutions:');
  console.log('1. Fund account with Hedera testnet faucet');
  console.log('2. Use account with existing darkpool balance');
  console.log('3. Test with minimal gas if darkpool has funds');
}

checkAccountStatus();
