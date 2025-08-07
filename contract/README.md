# 🚀 ELLALLE DarkPool Perpetual DEX - Contract Documentation

## ✅ **Current Deployment Status**

### **📊 Deployed Contracts (Hedera Previewnet)**

| Contract | Address | Purpose |
|----------|---------|---------|
| **DarkpoolPerpDEX** | `0xC4D7B5729A9Dca7dfcaCd1BB435bba3d0B559617` | Main trading contract |
| **HederaDarkPoolManager** | `0xA04ea9A4184e8E8b05182338fF34e5DcB9b743e0` | Event-based management interface |
| **NoirVerifier** | `0xD2163E87d7fd20bc91e7B80D4D5AbcBad4Eb0888` | ZK proof verification |
| **PriceOracle** | `0xD2163E87d7fd20bc91e7B80D4D5AbcBad4Eb0888` | Price oracle integration |

### **🌐 Network:**
- **Chain ID:** 297 (Hedera Previewnet)
- **RPC:** https://previewnet.hashio.io/api
- **Explorer:** https://hashscan.io/previewnet

---

## 🎛️ **Using HederaDarkPoolManager**

### **Key Functions:**
```solidity
// System diagnostics
checkDarkPoolAddresses()     // Discover all contract addresses
checkNetworkInfo()           // Verify network connection
getSystemSummary()           // Complete system overview

// User operations  
depositToDarkpool()          // Deposit HBAR (payable)
checkUserBalance(address)    // Check user balance
withdrawFromDarkpool(uint256) // Withdraw funds

// Market data
getStoredMarkets()           // Get available trading pairs
```

### **Event-Based Results:**
Since Hedera EVM has limitations with view functions, the manager uses events:
- `AddressChecked` - Contract addresses
- `SystemStatus` - System health
- `UserBalanceChecked` - User balance updates
- `DepositMade` / `WithdrawalMade` - Transaction confirmations

---

## 🛠️ **Development Setup**

### **Required Compiler Settings (Remix):**
```json
{
  "language": "Solidity", 
  "version": "0.8.26",
  "settings": {
    "optimizer": {
      "enabled": true,
      "runs": 50
    },
    "viaIR": true,
    "evmVersion": "london"
  }
}
```

## 📋 **Deployment Options**

### **Option 1: Direct Deployment (Recommended)**
Use `deploy.sol` with `DirectDeploy` contract:

```solidity
// 1. Deploy DirectDeploy contract
// 2. Call deploy()
// 3. Call fund() with HBAR
// 4. Use getAddresses() to get all contract addresses
```

### **Option 2: Manual Deployment**
If size issues persist:

1. **Deploy each contract individually:**
   - Deploy `NoirVerifier.sol`
   - Deploy `PythPriceConsumer.sol`  
   - Deploy `DarkpoolPerpDEX.sol` (modify constructor to use deployed addresses)

### **Option 3: Minimal Helper**
Use the ultra-minimal `DeploymentHelper.sol`:
- Only 1KB in size
- Generic bytecode deployment
- Manual process but guaranteed to work

## 🔧 **Network Configuration**

**Hedera Testnet:**
- **Chain ID:** 296
- **RPC:** https://testnet.hashio.io/api
- **Currency:** HBAR
- **Explorer:** https://hashscan.io/testnet

## 📊 **Auto-Initialized Markets**

| Symbol   | Max Leverage | Maintenance | Funding Rate |
|----------|-------------|-------------|--------------|
| BTC/USD  | 100x        | 5%          | 1%           |
| ETH/USD  | 100x        | 5%          | 1%           |
| SOL/USD  | 50x         | 7.5%        | 1.5%         |
| HBAR/USD | 25x         | 10%         | 2%           |
| ADA/USD  | 25x         | 10%         | 2%           |
| AVAX/USD | 50x         | 7.5%        | 1.5%         |
| DOT/USD  | 25x         | 10%         | 2%           |
| MATIC/USD| 25x         | 10%         | 2%           |

## 🎯 **Quick Deployment Steps**

### **Step 1: Compiler Setup**
- Set optimizer runs to **50** (not 200!)
- Enable **Via IR**
- Use Solidity **0.8.26**

### **Step 2: Deploy**
```solidity
DirectDeploy deployer = new DirectDeploy();
address darkpool = deployer.deploy();
```

### **Step 3: Fund**
```solidity
deployer.fund{value: 1 ether}();
```

### **Step 4: Verify**
```solidity
(bool deployed, address darkpool, address noir, address oracle,,) = deployer.getAddresses();
```

## 🔒 **Security Features**

- ✅ Access control maintained
- ✅ Emergency pause functionality
- ✅ Safe transfer patterns
- ✅ Input validation
- ✅ ZK proof verification (MVP mode)
- ✅ Price feed integration (mock mode)

## ⚠️ **Troubleshooting**

**If deployment still fails:**
1. **Reduce optimizer runs to 20**
2. **Try deploying contracts individually**
3. **Use the minimal DeploymentHelper with bytecode**
4. **Ensure Via IR is enabled**

## 🎉 **Ready for Production Testing**

Once deployed, the DarkPool DEX supports:
- **Perpetual trading** with up to 100x leverage
- **Dark pool orders** with ZK privacy
- **8 major crypto markets**
- **Real-time funding rates**
- **Liquidation engine**
- **Emergency controls**

---

**⚡ ELLALLE - Privacy-First Perpetual Trading on Hedera**
