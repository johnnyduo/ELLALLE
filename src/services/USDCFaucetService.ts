/**
 * USDC Faucet Service
 * Provides test USDC tokens for development and testing
 */

import { USDC_ABI, USDC_CONTRACT_ADDRESS } from '@/contracts/USDC';
import { BrowserProvider, Contract } from 'ethers';
import { toast } from 'sonner';

export class USDCFaucetService {
  private provider: BrowserProvider | null = null;
  private usdcContract: Contract | null = null;

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider(): Promise<void> {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new BrowserProvider(window.ethereum);
      
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        if (USDC_CONTRACT_ADDRESS && USDC_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
          const signer = await this.provider.getSigner();
          this.usdcContract = new Contract(USDC_CONTRACT_ADDRESS, USDC_ABI, signer);
        }
      } catch (error) {
        console.error('❌ Failed to initialize USDC provider:', error);
      }
    }
  }

  /**
   * Request test USDC tokens from faucet
   */
  public async requestTokens(): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.usdcContract) {
        // Simulate faucet for demo when no USDC contract is available
        return this.simulateFaucet();
      }

      toast.info('🚰 Requesting test USDC tokens...', {
        description: 'Processing faucet request'
      });

      const tx = await this.usdcContract.faucet();
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        toast.success('✅ Test USDC tokens received!', {
          description: '1000 USDC added to your wallet'
        });

        return {
          success: true,
          txHash: tx.hash
        };
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('❌ Faucet request failed:', error);
      
      // Try simulation as fallback
      if (error instanceof Error && error.message.includes('faucet')) {
        return this.simulateFaucet();
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('❌ Faucet request failed', {
        description: errorMessage
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Simulate faucet for demo purposes
   */
  private async simulateFaucet(): Promise<{ success: boolean; txHash?: string }> {
    console.log('🎭 Simulating USDC faucet for demo...');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    
    toast.success('✅ Demo USDC tokens received!', {
      description: 'Simulated 1000 USDC for testing'
    });

    return {
      success: true,
      txHash: mockTxHash
    };
  }

  /**
   * Check if user can request tokens (24 hour cooldown)
   */
  public async canRequestTokens(userAddress: string): Promise<boolean> {
    try {
      if (!this.usdcContract) {
        return true; // Always allow in demo mode
      }

      const lastMintTime = await this.usdcContract.lastMintTime(userAddress);
      const now = Math.floor(Date.now() / 1000);
      const cooldownPeriod = 24 * 60 * 60; // 24 hours

      return (now - Number(lastMintTime)) >= cooldownPeriod;
    } catch (error) {
      console.warn('⚠️ Could not check faucet cooldown:', error);
      return true; // Allow request if check fails
    }
  }

  /**
   * Get user's current USDC balance
   */
  public async getBalance(userAddress: string): Promise<string> {
    try {
      if (!this.usdcContract) {
        return '1000.0'; // Return demo balance
      }

      const balanceWei = await this.usdcContract.balanceOf(userAddress);
      const balance = (Number(balanceWei) / Math.pow(10, 6)).toString(); // USDC has 6 decimals
      
      return balance;
    } catch (error) {
      console.warn('⚠️ Could not get USDC balance:', error);
      return '0';
    }
  }
}

// Singleton instance
export const usdcFaucetService = new USDCFaucetService();
