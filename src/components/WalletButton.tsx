// Wallet connection button component for ELLALLE
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { formatAddress } from '@/lib/web3';
import { AlertCircle, Power, Wallet } from 'lucide-react';
import React from 'react';

export const WalletButton: React.FC = () => {
  const { 
    isConnected, 
    account, 
    chainId, 
    balance, 
    isConnecting, 
    error, 
    connect, 
    disconnect, 
    switchToHedera 
  } = useWallet();

  const isHederaPreviewnet = chainId === 297;

  if (isConnected && account) {
    return (
      <div className="flex items-center gap-2">
        {!isHederaPreviewnet && (
          <Button
            variant="outline"
            size="sm"
            onClick={switchToHedera}
            className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Switch to Hedera
          </Button>
        )}
        
        <div className="flex items-center gap-2 bg-background border rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm font-medium">
              {formatAddress(account)}
            </span>
          </div>
          
          {balance && (
            <Badge variant="secondary" className="text-xs">
              {balance} HBAR
            </Badge>
          )}
          
          {isHederaPreviewnet && (
            <Badge variant="outline" className="text-xs text-purple-600">
              Hedera Previewnet
            </Badge>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={disconnect}
          className="text-red-600 border-red-600 hover:bg-red-50"
        >
          <Power className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <Badge variant="destructive" className="text-xs">
          {error}
        </Badge>
      )}
      
      <Button
        onClick={connect}
        disabled={isConnecting}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    </div>
  );
};
