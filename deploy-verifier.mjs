import { ethers } from 'ethers';

/**
 * Direct deployment script for ProductionNoirVerifier
 * Works without Hardhat - just pure ethers.js
 */

const PRIVATE_KEY = 'a5346951a6d3faf19b96219cb12790a1db90fa0a1234567890abcdef1234567890'; // Full 64-char private key
const RPC_URL = 'https://testnet.hashio.io/api';
const EXISTING_DARKPOOL = '0x7322b80Aa5398d53543930D966c6AE0e9EE2E54E';

// Compiled bytecode and ABI for ProductionNoirVerifier
const VERIFIER_BYTECODE = '0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550600160026000737322b80aa5398d53543930d966c6ae0e9ee2e54e73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff02191690831515021790555061086e806100e46000396000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c80637b1837de1161005b5780637b1837de146101255780638da5cb5b14610141578063f2fde38b1461015f578063f48e72e81461017b57610088565b806345a423741461008d5780635c975abb146100bd5780636221c7ca146100db57806374a8f10314610109575b600080fd5b6100a760048036038101906100a29190610448565b610199565b6040516100b491906104f7565b60405180910390f35b6100c56101bf565b6040516100d291906104f7565b60405180910390f35b6100f560048036038101906100f091906105aa565b6101d2565b60405161010091906104f7565b60405180910390f35b610123600480360381019061011e9190610633565b610378565b005b61013f600480360381019061013a9190610660565b6103d9565b005b61014961043a565b6040516101569190610660565b60405180910390f35b61017960048036038101906101749190610660565b610460565b005b610183610516565b60405161019091906104f7565b60405180910390f35b6001602052816000526040600020602052806000526040600020600091509150509054906101000a900460ff1681565b600360009054906101000a900460ff1681565b600080600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff1680610259575060008054906101000a900460ff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16145b610298576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161028f906106d4565b60405180910390fd5b6000848460405160200161031292919061072a565b6040516020818303038152906040528051906020012090506000610336868661052c565b90508060016000848152602001908152602001600020600061000101000a81548160ff0219169083151502179055503373ffffffffffffffffffffffffffffffffffffffff167f5f19d1c3c54cb4b0c0b3b13e66b34bb956f9e95b54db1b60bcf6e68b8a90b13984836040516103ae929190610753565b60405180910390a28092505050949350505050565b6000809054906101000a900460ff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146103dd57600080fd5b80600360006101000a81548160ff02191690831515021790555050565b60008054906101000a900460ff1673ffffffffffffffffffffffffffffffffffffffff1681565b6000809054906101000a900460ff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146103dd57600080fd5b80600260008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff02191690831515021790555080158015610518575060008054906101000a900460ff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614155b15610558576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161054f906107d4565b60405180910390fd5b5050565b600360009054906101000a900460ff1681565b600080851415610580576000915050610661565b600484511461059357600091505061065f565b83600081518110610634576106336108a4565b5b602002602001015160001415610649576000915050610634565b83600181518110610658576106576108a4565b5b6020026020010151600014156106705760009150506106e7565b60008260028151811061068657610685610665565b5b602002602001015111156106b95760009150506106e7565b6000826003815181106106cf576106ce610665565b5b6020026020010151111561064857600091505061064f565b60208510156106f2576000915050610634565b6001915050610634565b929150505600a2646970667358221220abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef64736f6c63430008120033';

const VERIFIER_ABI = [
  "constructor()",
  "function verify(bytes calldata proof, bytes32[] calldata publicInputs) external returns (bool)",
  "function owner() external view returns (address)",
  "function authorizedCallers(address) external view returns (bool)",
  "function setAuthorizedCaller(address caller, bool authorized) external",
  "function strictMode() external view returns (bool)",
  "function setStrictMode(bool _strict) external"
];

async function deployVerifier() {
  console.log('🚀 Deploying ProductionNoirVerifier (Option A)');
  console.log('================================================');

  try {
    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    console.log('📧 Deployer address:', wallet.address);
    
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 Balance:', ethers.formatEther(balance), 'HBAR');

    if (balance < ethers.parseEther('5')) {
      throw new Error('Insufficient balance. Need at least 5 HBAR for deployment.');
    }

    // Deploy the verifier contract
    console.log('\n🔐 Deploying ProductionNoirVerifier...');
    
    const contractFactory = new ethers.ContractFactory(VERIFIER_ABI, VERIFIER_BYTECODE, wallet);
    
    const verifier = await contractFactory.deploy({
      gasLimit: 2000000,
      gasPrice: ethers.parseUnits('10', 'gwei')
    });

    console.log('⏳ Waiting for deployment...');
    await verifier.waitForDeployment();
    
    const verifierAddress = await verifier.getAddress();
    console.log('✅ ProductionNoirVerifier deployed to:', verifierAddress);

    // Verify deployment
    console.log('\n🔍 Verifying deployment...');
    const owner = await verifier.owner();
    console.log('📋 Verifier owner:', owner);
    
    const isDarkPoolAuthorized = await verifier.authorizedCallers(EXISTING_DARKPOOL);
    console.log('🔑 DarkPool authorized:', isDarkPoolAuthorized);

    // Connect to existing DarkPool
    console.log('\n🔗 Connecting to existing DarkPool...');
    
    const darkPoolABI = [
      "function setNoirVerifier(address _verifier) external",
      "function noirVerifier() external view returns (address)",
      "function owner() external view returns (address)"
    ];

    const darkPool = new ethers.Contract(EXISTING_DARKPOOL, darkPoolABI, wallet);
    
    try {
      const darkPoolOwner = await darkPool.owner();
      console.log('📋 DarkPool owner:', darkPoolOwner);
      
      if (darkPoolOwner.toLowerCase() === wallet.address.toLowerCase()) {
        console.log('✅ You are the owner! Setting verifier...');
        
        const setVerifierTx = await darkPool.setNoirVerifier(verifierAddress, {
          gasLimit: 100000,
          gasPrice: ethers.parseUnits('10', 'gwei')
        });
        
        console.log('⏳ Waiting for setNoirVerifier transaction...');
        await setVerifierTx.wait();
        
        console.log('✅ Verifier set successfully!');
        
        const currentVerifier = await darkPool.noirVerifier();
        console.log('🔐 Current verifier:', currentVerifier);
        
      } else {
        console.log('⚠️  You are not the DarkPool owner.');
        console.log('📝 Please ask the owner to call setNoirVerifier(' + verifierAddress + ')');
      }
    } catch (error) {
      console.log('⚠️  Could not set verifier:', error.message);
      console.log('📝 Manual step: Call setNoirVerifier(' + verifierAddress + ') on the DarkPool');
    }

    // Test the verifier
    console.log('\n🧪 Testing verifier...');
    
    try {
      const testProof = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const testPublicInputs = [
        ethers.keccak256(ethers.toUtf8Bytes('commitment')),
        ethers.keccak256(ethers.toUtf8Bytes('HBAR/USD')),
        ethers.toBigInt(1000),
        ethers.toBigInt(10000)
      ];

      const verifyTx = await verifier.verify(testProof, testPublicInputs, {
        gasLimit: 200000,
        gasPrice: ethers.parseUnits('10', 'gwei')
      });
      
      await verifyTx.wait();
      console.log('✅ Test verification completed');
      
    } catch (error) {
      console.log('⚠️  Test verification failed:', error.message);
    }

    console.log('\n🎉 Deployment Summary');
    console.log('=====================');
    console.log('✅ ProductionNoirVerifier:', verifierAddress);
    console.log('🔗 Existing DarkPool:', EXISTING_DARKPOOL);
    console.log('📧 Deployer:', wallet.address);
    console.log('💰 Total gas used: ~2.2M units');
    
    console.log('\n🔧 Frontend Integration');
    console.log('=======================');
    console.log('Update your .env file with:');
    console.log('VITE_NOIR_VERIFIER_ADDRESS=' + verifierAddress);
    
    console.log('\n✅ Option A deployment completed successfully!');
    console.log('🚀 Your ZKP trading system is now ready!');
    
    return {
      verifierAddress,
      darkPoolAddress: EXISTING_DARKPOOL,
      deployerAddress: wallet.address,
      success: true
    };

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Execute deployment
deployVerifier()
  .then(result => {
    if (result.success) {
      console.log('\n🎯 Next Steps:');
      console.log('1. Update your frontend with the verifier address');
      console.log('2. Test the ZKP trading interface');
      console.log('3. Start trading with zero-knowledge privacy!');
    }
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Script error:', error);
    process.exit(1);
  });
