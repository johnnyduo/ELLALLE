const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying CompactDarkPoolDEX...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "HBAR");
  
  const USDC_ADDRESS = "0x340e7949d378C6d6eB1cf7391F5C39b6c826BA9d";
  console.log("USDC Token Address:", USDC_ADDRESS);
  
  // Deploy contract
  const CompactDarkPoolDEX = await ethers.getContractFactory("CompactDarkPoolDEX");
  const contract = await CompactDarkPoolDEX.deploy(USDC_ADDRESS, {
    gasLimit: 3500000
  });
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  
  console.log("\n🎉 CompactDarkPoolDEX deployed to:", contractAddress);
  console.log("🔗 Explorer:", `https://hashscan.io/testnet/address/${contractAddress}`);
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const owner = await contract.owner();
  const usdcAddress = await contract.getUSDCAddress();
  const paused = await contract.paused();
  
  console.log("✅ Owner:", owner);
  console.log("✅ USDC Token:", usdcAddress);
  console.log("✅ Paused:", paused);
  
  // Test basic functions
  console.log("\n🧪 Testing basic functions...");
  try {
    const balance = await contract.getBalance(deployer.address);
    console.log("✅ getBalance() works:", balance);
    
    const usdcBalance = await contract.getUSDCBalance(deployer.address);
    console.log("✅ getUSDCBalance() works:", usdcBalance);
    
    console.log("\n🎯 Contract ready for USDC deposits!");
    
  } catch (error) {
    console.log("⚠️  Function test failed:", error.message);
  }
  
  console.log("\n📝 Update your .env file:");
  console.log(`VITE_COMPACT_DARKPOOL_DEX_ADDRESS=${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });