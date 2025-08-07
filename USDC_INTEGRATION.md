# USDC Integration Documentation

## Overview
ELLALLE platform now includes full integration with a custom USDC token contract deployed on Hedera Previewnet for testing purposes.

## Contract Details
- **Contract Address**: `0x1b20865c8C1B8B50cC19F54D8Da4873bfFcaD1F3`
- **Token Name**: Test USD Coin
- **Token Symbol**: USDC
- **Decimals**: 6 (standard for USDC)
- **Network**: Hedera Previewnet (Chain ID: 297)

## Faucet Functionality
The USDC contract includes a built-in faucet system:

### Features
- **Amount**: 1,000 USDC per claim
- **Cooldown**: 24 hours between claims
- **Access**: Any connected wallet can claim
- **Network**: Hedera Previewnet only

### Smart Contract Functions
```solidity
// Claim 1,000 USDC tokens
function faucet() public

// Check balance
function balanceOf(address account) view returns (uint256)

// Check time until next claim
function timeUntilNextClaim(address user) view returns (uint256)

// Get faucet amount constant
function FAUCET_AMOUNT() view returns (uint256) // Returns 1000 * 10^6
```

## UI Integration

### Hero Component Faucet
When a wallet is connected, users see:
- Current USDC balance display
- "Claim 1,000 USDC" button (when available)
- Countdown timer showing next claim availability
- Loading state during claim transaction

### Trading Integration
All trading pairs now use USDC as the quote currency:
- `BTC/USDC`
- `ETH/USDC`
- `SOL/USDC`
- `AVAX/USDC`
- `HBAR/USDC`
- `ADA/USDC`
- `DOT/USDC`
- `MATIC/USDC`

## Usage Instructions

### For Users
1. Connect your MetaMask wallet to Hedera Previewnet
2. Visit the platform homepage
3. Click "Claim 1,000 USDC" in the faucet section
4. Confirm the transaction in MetaMask
5. Wait for confirmation
6. Use USDC for trading on the platform

### For Developers
```typescript
import { useUSDCFaucet } from '@/hooks/useUSDCFaucet';

const { 
  balance, 
  canClaim, 
  isClaiming,
  claimUSDC,
  checkBalance 
} = useUSDCFaucet(userAccount);

// Claim USDC
await claimUSDC();

// Check balance
await checkBalance();
```

## Environment Configuration
Required environment variables:
```bash
VITE_USDC_TOKEN_ADDRESS=0x1b20865c8C1B8B50cC19F54D8Da4873bfFcaD1F3
```

## Security Notes
- This is a **testnet token** for development and testing only
- Do not use real funds - this is for Hedera Previewnet only
- The faucet has no rate limiting beyond the 24-hour cooldown
- All transactions are public on Hedera Previewnet

## Troubleshooting

### Common Issues
1. **"Insufficient funds" error**: You need HBAR for gas fees
2. **"Cooldown period" error**: Wait 24 hours between claims
3. **"MetaMask not connected"**: Ensure wallet is connected to Hedera Previewnet
4. **Transaction fails**: Check you're on the correct network (Chain ID: 297)

### Network Setup
Add Hedera Previewnet to MetaMask:
- **Network Name**: Hedera Previewnet
- **RPC URL**: https://previewnet.hashio.io/api
- **Chain ID**: 297
- **Currency Symbol**: HBAR
- **Block Explorer**: https://hashscan.io/previewnet

## Testing Checklist
- [ ] Wallet connection working
- [ ] USDC balance displays correctly
- [ ] Faucet claim button appears when wallet connected
- [ ] Claim transaction executes successfully
- [ ] Balance updates after claim
- [ ] Cooldown timer displays correctly
- [ ] Trading pairs show USDC pricing
- [ ] Error handling works for edge cases

## Smart Contract Source
The complete USDC contract source is available at:
`/contract/USDC.sol`

## Next Steps
1. Test faucet functionality thoroughly
2. Integrate USDC balance checking in trading dashboard
3. Add USDC allowance management for trading
4. Implement proper error handling and user feedback
5. Consider adding transaction history tracking
