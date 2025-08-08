import { CONTRACT_CONFIG } from '@/lib/env';
import { ethers } from 'ethers';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

// USDC Contract ABI - only the functions we need
const USDC_ABI = [
  // Read functions
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function timeUntilNextClaim(address user) view returns (uint256)',
  'function lastMintTime(address user) view returns (uint256)',
  'function FAUCET_AMOUNT() view returns (uint256)',
  
  // Write functions
  'function faucet() returns (bool)',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Mint(address indexed to, uint256 amount)'
];

interface USDCFaucetState {
  balance: string;
  isLoading: boolean;
  isClaiming: boolean;
  timeUntilNextClaim: number;
  canClaim: boolean;
  lastClaimTime: number;
}

export const useUSDCFaucet = (account?: string) => {
  const [state, setState] = useState<USDCFaucetState>({
    balance: '0',
    isLoading: false,
    isClaiming: false,
    timeUntilNextClaim: 0,
    canClaim: true,
    lastClaimTime: 0,
  });

  // Get contract instance
  const getContract = async (needsSigner = false) => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not found');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    
    if (needsSigner) {
      const signer = await provider.getSigner();
      return new ethers.Contract(CONTRACT_CONFIG.usdcToken, USDC_ABI, signer);
    }
    
    return new ethers.Contract(CONTRACT_CONFIG.usdcToken, USDC_ABI, provider);
  };

  // Check USDC balance
  const checkBalance = useCallback(async (userAccount?: string) => {
    if (!userAccount && !account) return;
    
    try {
      console.log('🔍 Checking wallet USDC balance for:', userAccount || account);
      setState(prev => ({ ...prev, isLoading: true }));
      
      const contract = await getContract(false);
      const address = userAccount || account;
      
      const [balance, decimals, timeUntilNext, lastClaim] = await Promise.all([
        contract.balanceOf(address),
        contract.decimals(),
        contract.timeUntilNextClaim(address),
        contract.lastMintTime(address)
      ]);
      
      const formattedBalance = ethers.formatUnits(balance, decimals);
      const timeUntilNextClaim = Number(timeUntilNext);
      
      console.log('💰 Wallet USDC balance result:', {
        raw: balance.toString(),
        formatted: formattedBalance,
        decimals: decimals.toString(),
        canClaim: timeUntilNextClaim === 0
      });
      
      setState(prev => ({
        ...prev,
        balance: formattedBalance,
        timeUntilNextClaim,
        canClaim: timeUntilNextClaim === 0,
        lastClaimTime: Number(lastClaim),
        isLoading: false
      }));
      
      return formattedBalance;
    } catch (error) {
      console.error('❌ Error checking wallet USDC balance:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return '0';
    }
  }, [account]);

  // Claim USDC from faucet
  const claimUSDC = useCallback(async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return false;
    }

    try {
      setState(prev => ({ ...prev, isClaiming: true }));
      
      const contract = await getContract(true);
      
      // Check if user can claim
      const timeUntilNext = await contract.timeUntilNextClaim(account);
      if (Number(timeUntilNext) > 0) {
        const hours = Math.floor(Number(timeUntilNext) / 3600);
        const minutes = Math.floor((Number(timeUntilNext) % 3600) / 60);
        toast.error(`You can claim again in ${hours}h ${minutes}m`);
        setState(prev => ({ ...prev, isClaiming: false }));
        return false;
      }
      
      // Call faucet function
      console.log('🚰 Calling USDC faucet...');
      const tx = await contract.faucet();
      
      toast.loading(`Claiming USDC tokens... Tx: ${tx.hash.slice(0, 10)}...`, {
        id: 'usdc-claim'
      });
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        toast.success('Successfully claimed 1,000 USDC tokens! 🎉', {
          id: 'usdc-claim'
        });
        
        // Refresh balance
        await checkBalance(account);
        
        setState(prev => ({ ...prev, isClaiming: false }));
        return true;
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error: any) {
      console.error('Error claiming USDC:', error);
      
      let errorMessage = 'Failed to claim USDC tokens';
      if (error.message?.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient HBAR for gas fees';
      } else if (error.message?.includes('cooldown')) {
        errorMessage = 'You must wait before claiming again';
      }
      
      toast.error(errorMessage, { id: 'usdc-claim' });
      setState(prev => ({ ...prev, isClaiming: false }));
      return false;
    }
  }, [account, checkBalance]);

  // Format time remaining until next claim
  const formatTimeUntilNextClaim = useCallback((seconds: number): string => {
    if (seconds === 0) return 'Available now';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }, []);

  // Get contract info
  const getContractInfo = useCallback(async () => {
    try {
      const contract = await getContract(false);
      const [name, symbol, decimals, faucetAmount] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.FAUCET_AMOUNT()
      ]);
      
      return {
        name,
        symbol,
        decimals: Number(decimals),
        faucetAmount: ethers.formatUnits(faucetAmount, decimals),
        contractAddress: CONTRACT_CONFIG.usdcToken
      };
    } catch (error) {
      console.error('Error getting contract info:', error);
      return null;
    }
  }, []);

  return {
    ...state,
    checkBalance,
    claimUSDC,
    formatTimeUntilNextClaim,
    getContractInfo,
    contractAddress: CONTRACT_CONFIG.usdcToken
  };
};

export default useUSDCFaucet;
