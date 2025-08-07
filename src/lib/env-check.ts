// Environment validation script for ELLALLE platform
// Use this to verify all environment variables are properly loaded

import { ENV_CONFIG, validateEnvironment } from './env';

// Validate environment on module load
console.log('🔧 ELLALLE Environment Configuration');
console.log('=====================================');

try {
  validateEnvironment();
  console.log('✅ Environment validation passed');
} catch (error) {
  console.error('❌ Environment validation failed:', error);
}

// Log configuration summary
console.log('\n📊 Configuration Summary:');
console.log('-------------------------');
console.log(`App Name: ${ENV_CONFIG.app.name}`);
console.log(`Version: ${ENV_CONFIG.app.version}`);
console.log(`Environment: ${ENV_CONFIG.app.environment}`);
console.log(`Debug Mode: ${ENV_CONFIG.app.debug}`);

console.log('\n🌐 Hedera Configuration:');
console.log(`Chain ID: ${ENV_CONFIG.hedera.chainId}`);
console.log(`Network: ${ENV_CONFIG.hedera.networkName}`);
console.log(`RPC URL: ${ENV_CONFIG.hedera.rpcUrl}`);
console.log(`Explorer: ${ENV_CONFIG.hedera.explorerUrl}`);
console.log(`Currency: ${ENV_CONFIG.hedera.currencySymbol}`);

console.log('\n🔗 Wallet Configuration:');
console.log(`Reown Project ID: ${ENV_CONFIG.wallet.reownProjectId.substring(0, 8)}...`);

console.log('\n🛠️ API Configuration:');
console.log(`Base URL: ${ENV_CONFIG.api.baseUrl}`);
console.log(`WebSocket URL: ${ENV_CONFIG.api.wsUrl}`);

console.log('\n🎯 Feature Flags:');
Object.entries(ENV_CONFIG.features).forEach(([key, value]) => {
  console.log(`${key}: ${value ? '✅' : '❌'}`);
});

console.log('\n💰 Trading Configuration:');
console.log(`Default Slippage: ${ENV_CONFIG.trading.defaultSlippage}%`);
console.log(`Max Leverage: ${ENV_CONFIG.trading.maxLeverage}x`);
console.log(`Trading Fee: ${ENV_CONFIG.trading.tradingFee}%`);

console.log('\n🔒 Smart Contracts:');
Object.entries(ENV_CONFIG.contracts).forEach(([key, address]) => {
  console.log(`${key}: ${address || 'Not deployed'}`);
});

console.log('\n🌍 External Services:');
console.log(`CoinGecko API: ${ENV_CONFIG.services.coingecko.baseUrl}`);
console.log(`CoinGecko Key: ${ENV_CONFIG.services.coingecko.apiKey ? '✅ Set' : '❌ Not set'}`);
console.log(`OpenAI API: ${ENV_CONFIG.services.openai.apiKey ? '✅ Set' : '❌ Not set'}`);
console.log(`Gemini API: ${ENV_CONFIG.services.gemini.apiKey ? '✅ Set' : '❌ Not set'}`);
console.log(`Gemini Model: ${ENV_CONFIG.services.gemini.model}`);

export default ENV_CONFIG;
