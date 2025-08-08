const { ethers } = require('ethers');

async function checkContract() {
  console.log('🔍 CHECKING CONTRACT STATUS');
  console.log('============================');
  
  const provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');
  const contractAddress = '0x7322b80aa5398d53543930d966c6ae0e9ee2e54e';
  
  console.log('Contract Address:', contractAddress);
  
  try {
    // Check if contract exists
    const code = await provider.getCode(contractAddress);
    console.log('Contract exists:', code !== '0x');
    console.log('Code length:', code.length);
    
    // Try to get the contract without specific ABI first
    const simpleContract = new ethers.Contract(contractAddress, [
      'function balanceOf(address) view returns (uint256)',
      'function getBalance(address) view returns (uint256)',
      'function hbarBalances(address) view returns (uint256)',
      'function usdcBalances(address) view returns (uint256)',
      'function getUserBalance(address) view returns (uint256, uint256)',
      'function owner() view returns (address)',
      'function darkpoolBalance(address) view returns (uint256, uint256)'
    ], provider);
    
    const userAddress = '0x95eBc930e34979991ED99B82755f8021D0dA0Fef';
    console.log('\\nUser Address:', userAddress);
    
    // Try different balance methods
    const methods = [
      'hbarBalances',
      'usdcBalances', 
      'getUserBalance',
      'darkpoolBalance'
    ];
    
    for (const method of methods) {
      try {
        console.log(`\\nTrying ${method}...`);
        const result = await simpleContract[method](userAddress);
        console.log('✅ Success:', result);
        
        if (Array.isArray(result)) {
          console.log('  HBAR:', (Number(result[0]) / 1e8).toFixed(8));
          console.log('  USDC:', ethers.formatUnits(result[1], 6));
        } else {
          console.log('  Value:', result.toString());
        }
      } catch (error) {
        console.log('❌ Failed:', error.message.split('(')[0]);
      }
    }
    
    // Check owner
    try {
      const owner = await simpleContract.owner();
      console.log('\\n📋 Contract Owner:', owner);
    } catch (error) {
      console.log('\\n❌ No owner method');
    }
    
  } catch (error) {
    console.error('❌ Error checking contract:', error.message);
  }
}

checkContract();
