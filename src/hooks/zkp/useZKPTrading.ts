import { CONTRACT_CONFIG } from '@/lib/env';
import { AbiCoder, toBeHex, zeroPadValue } from 'ethers';
import { useCallback, useState } from 'react';
import { useDarkPool } from '../useDarkPool';
import { TRADING_PAIRS, useNoirProof } from './useNoirProof';

interface ZKPTrade {
  id: string;
  commitment: string;
  timestamp: number;
  status: 'pending' | 'committed' | 'executed' | 'failed';
  pairName?: string;
  txHash?: string;
}

interface UseZKPTradingReturn {
  trades: ZKPTrade[];
  submitCommitment: (params: any) => Promise<{tradeId: string; trade: ZKPTrade}>;
  executeTrade: (tradeId: string, params: any) => Promise<string>;
  executeTradeWithObject: (trade: ZKPTrade, params: any) => Promise<string>;
  loading: boolean;
  error: string | null;
}

export const useZKPTrading = (): UseZKPTradingReturn => {
  const [trades, setTrades] = useState<ZKPTrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isConnected } = useDarkPool();
  const { generateCommitment, generateProof } = useNoirProof();

  // Get ethereum provider
  const getProvider = useCallback(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      return window.ethereum;
    }
    throw new Error('No Ethereum provider found. Please install MetaMask.');
  }, []);

  // Convert to hex
  const toHex = (num: number | bigint): string => `0x${num.toString(16)}`;

  // Submit commitment to actual contract
  const submitCommitment = useCallback(async (params: {
    size: string;
    isLong: boolean;
    pairId: number;
    leverage: number;
    traderAddress: string;
  }): Promise<{tradeId: string; trade: ZKPTrade}> => {
    try {
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      console.log('🔐 Starting ZKP commitment submission...');

      const provider = getProvider();
      const accounts = await provider.request({ method: 'eth_accounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No wallet connected');
      }

      // Generate commitment
      const commitment = await generateCommitment(params);
      
      // Create trade record
      const tradeId = Date.now().toString();
      const newTrade: ZKPTrade = {
        id: tradeId,
        commitment,
        timestamp: Date.now(),
        status: 'pending',
        pairName: TRADING_PAIRS[params.pairId].name
      };

      setTrades(prev => [...prev, newTrade]);
      console.log('✅ Trade added to array:', newTrade);
      console.log('📊 Current trades count:', trades.length + 1);

      // Submit commitment to your existing CompactDarkPoolDEX contract
      const txParams = {
        from: accounts[0],
        to: CONTRACT_CONFIG.compactDarkPoolDEX, // Your existing contract
        data: '0x' + 
              '53f3eb8f' + // submitCommitment(bytes32) function selector
              commitment.slice(2).padStart(64, '0'), // commitment parameter
        gas: toHex(150000), // Gas for commitment
      };

      console.log('📤 Submitting commitment to contract:', {
        contract: CONTRACT_CONFIG.compactDarkPoolDEX,
        commitment: commitment,
        from: accounts[0]
      });

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      console.log('✅ Commitment transaction sent:', txHash);
      
      // Update trade status
      setTrades(prev => prev.map(trade => 
        trade.id === tradeId 
          ? { ...trade, status: 'committed', txHash }
          : trade
      ));

      return { tradeId, trade: newTrade };

    } catch (err: any) {
      const errorMsg = err.message || 'Failed to submit commitment';
      console.error('❌ Commitment submission error:', errorMsg);
      setError(errorMsg);
      
      // Update trade status to failed if we created one
      setTrades(prev => prev.map(trade => 
        trade.status === 'pending' 
          ? { ...trade, status: 'failed' }
          : trade
      ));
      
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [isConnected, generateCommitment, getProvider]);

  // Execute trade with ZK proof on actual contract
  const executeTrade = useCallback(async (
    tradeId: string,
    params: {
      size: string;
      isLong: boolean;
      pairId: number;
      leverage: number;
      traderAddress: string;
    }
  ): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Executing ZKP trade on contract...');
      console.log('🔍 Looking for trade ID:', tradeId);
      console.log('🔍 Available trades:', trades.map(t => ({id: t.id, status: t.status})));

      const provider = getProvider();
      const accounts = await provider.request({ method: 'eth_accounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No wallet connected');
      }

      // Find trade - use callback to get latest trades state
      const trade = trades.find(t => t.id === tradeId);
      console.log('🔍 Found trade:', trade);
      
      if (!trade) {
        console.error('❌ Trade not found. Available trades:', trades);
        throw new Error('Trade not found');
      }

      // Generate proof
      const proof = await generateProof(params, trade.commitment);
      
      console.log('📋 Calling executeTrade on CompactDarkPoolDEX...', {
        commitment: trade.commitment,
        size: params.size,
        isLong: params.isLong,
        leverage: params.leverage,
        useHBAR: false // Default to USDC for now
      });

      // Encode executeTrade function call with leverage
      // executeTrade(bytes proof, bytes32[] publicInputs, bytes32 commitment, uint256 size, bool isLong, uint256 leverage, bool useHBAR)
      const encodedCall = '0x' +
        'e970866b' + // executeTrade function selector (correct one)
        // proof data (simplified for demo)
        '00000000000000000000000000000000000000000000000000000000000000e0' + // proof offset
        '0000000000000000000000000000000000000000000000000000000000000160' + // publicInputs offset
        trade.commitment.slice(2).padStart(64, '0') + // commitment
        BigInt(Math.floor(parseFloat(params.size) * 1e6)).toString(16).padStart(64, '0') + // size in token units
        (params.isLong ? '1' : '0').padStart(64, '0') + // isLong
        params.leverage.toString(16).padStart(64, '0') + // leverage
        '0'.padStart(64, '0') + // useHBAR (false = USDC)
        // proof length and data
        '0000000000000000000000000000000000000000000000000000000000000020' + // proof length (32 bytes)
        proof.proof.slice(2).padStart(64, '0') + // proof data
        // publicInputs length and data
        '0000000000000000000000000000000000000000000000000000000000000005' + // 5 public inputs now (including leverage)
        proof.publicInputs[0].slice(2).padStart(64, '0') + // commitment
        proof.publicInputs[1].slice(2).padStart(64, '0') + // trader address  
        proof.publicInputs[2].padStart(64, '0') + // min size
        proof.publicInputs[3].padStart(64, '0') + // max size
        params.leverage.toString(16).padStart(64, '0'); // leverage
        proof.publicInputs[3].padStart(64, '0'); // max size

      const txParams = {
        from: accounts[0],
        to: CONTRACT_CONFIG.compactDarkPoolDEX,
        data: encodedCall,
        gas: toHex(500000), // Higher gas for trade execution
      };

      console.log('📤 Sending executeTrade transaction...');

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      console.log('✅ Trade execution transaction sent:', txHash);

      // Update trade status
      setTrades(prev => prev.map(t => 
        t.id === tradeId 
          ? { ...t, status: 'executed', txHash }
          : t
      ));

      return txHash;

    } catch (err: any) {
      const errorMsg = err.message || 'Failed to execute trade';
      console.error('❌ Trade execution error:', errorMsg);
      
      // Update trade status to failed
      setTrades(prev => prev.map(t => 
        t.id === tradeId 
          ? { ...t, status: 'failed' }
          : t
      ));
      
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [trades, generateProof, getProvider]);

  // Execute trade with trade object (avoids state timing issues)
  const executeTradeWithObject = useCallback(async (
    trade: ZKPTrade,
    params: {
      size: string;
      isLong: boolean;
      pairId: number;
      leverage: number;
      traderAddress: string;
    }
  ): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Executing ZKP trade with trade object...');
      console.log('🔍 Using trade:', trade);

      const provider = getProvider();
      const accounts = await provider.request({ method: 'eth_accounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No wallet connected');
      }

      // Generate proof using the provided trade object
      const proof = await generateProof(params, trade.commitment);
      
      console.log('📋 Calling executeTrade on CompactDarkPoolDEX...', {
        commitment: trade.commitment,
        size: params.size,
        isLong: params.isLong,
        leverage: params.leverage,
        useHBAR: false // Default to USDC for now
      });

      // Use proper ethers encoding for the function call
      const abiCoder = new AbiCoder();
      
      // Convert trader address to proper format (pad to 32 bytes for bytes32)
      const traderAddress = accounts[0]; // Use actual connected wallet address
      const paddedTraderAddress = zeroPadValue(traderAddress, 32); // Properly pad to 32 bytes
      
      // Prepare the function parameters
      const functionSelector = '0xe970866b'; // executeTrade function selector
      
      // Convert size to BigInt (6 decimals for USDC)
      const sizeInUnits = BigInt(Math.floor(parseFloat(params.size) * 1e6));
      
      // Convert numbers to properly padded bytes32
      const minSizeBytes32 = toBeHex(1, 32);                                // min_size: 1 (32 bytes)
      const maxSizeBytes32 = toBeHex(10000, 32);                            // max_size: 10000 (32 bytes)  
      const leverageBytes32 = toBeHex(params.leverage, 32);                 // leverage (32 bytes)
      
      // Encode the parameters properly
      const encodedParams = abiCoder.encode(
        ['bytes', 'bytes32[]', 'bytes32', 'uint256', 'bool', 'uint256', 'bool'],
        [
          proof.proof,                    // bytes proof
          [
            trade.commitment,             // commitment (bytes32)
            paddedTraderAddress,          // trader address padded to bytes32
            minSizeBytes32,               // min size as bytes32
            maxSizeBytes32,               // max size as bytes32
            leverageBytes32               // leverage as bytes32
          ],                            // bytes32[] publicInputs
          trade.commitment,             // bytes32 commitment
          sizeInUnits,                  // uint256 size
          params.isLong,                // bool isLong
          BigInt(params.leverage),      // uint256 leverage
          false                         // bool useHBAR (false = USDC)
        ]
      );

      const txParams = {
        from: accounts[0],
        to: CONTRACT_CONFIG.compactDarkPoolDEX,
        data: functionSelector + encodedParams.slice(2), // Remove 0x from encoded params
        gas: toHex(500000), // Higher gas for trade execution
      };

      console.log('📤 Sending executeTrade transaction...');

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      console.log('✅ Trade execution transaction sent:', txHash);

      // Update trade status
      setTrades(prev => prev.map(t => 
        t.id === trade.id 
          ? { ...t, status: 'executed', txHash }
          : t
      ));

      return txHash;

    } catch (err: any) {
      const errorMsg = err.message || 'Failed to execute trade';
      console.error('❌ Trade execution error:', errorMsg);
      
      // Update trade status to failed
      setTrades(prev => prev.map(t => 
        t.id === trade.id 
          ? { ...t, status: 'failed' }
          : t
      ));
      
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [generateProof, getProvider]);

  return {
    trades,
    submitCommitment,
    executeTrade,
    executeTradeWithObject,
    loading,
    error
  };
};
