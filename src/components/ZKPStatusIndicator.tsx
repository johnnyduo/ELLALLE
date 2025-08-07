import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ZKPProgress, ZKProof, ZKPStatus } from '@/types/zkp';
import {
    AlertTriangle,
    Brain,
    CheckCircle,
    Loader2,
    Lock,
    Shield,
    Zap
} from 'lucide-react';
import React from 'react';

interface ZKPStatusIndicatorProps {
  status: ZKPStatus;
  progress?: ZKPProgress | null;
  proof?: ZKProof | null;
  className?: string;
}

export const ZKPStatusIndicator: React.FC<ZKPStatusIndicatorProps> = ({
  status,
  progress,
  proof,
  className = ''
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'idle':
        return <Shield className="w-4 h-4 text-gray-400" />;
      case 'generating':
        return <Brain className="w-4 h-4 text-blue-400 animate-pulse" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'verifying':
        return <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />;
      case 'verified':
        return <Zap className="w-4 h-4 text-purple-400" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'generating':
        return 'border-blue-500/50 bg-blue-500/10';
      case 'ready':
        return 'border-green-500/50 bg-green-500/10';
      case 'verifying':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'verified':
        return 'border-purple-500/50 bg-purple-500/10';
      case 'error':
        return 'border-red-500/50 bg-red-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/5';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'idle':
        return 'Ready for ZK Proof';
      case 'generating':
        return progress?.message || 'Generating ZK Proof...';
      case 'ready':
        return 'ZK Proof Generated';
      case 'verifying':
        return 'Verifying Proof On-Chain...';
      case 'verified':
        return 'Proof Verified ✓';
      case 'error':
        return 'Proof Generation Failed';
      default:
        return 'Unknown Status';
    }
  };

  if (status === 'idle') {
    return null; // Don't show anything when idle
  }

  return (
    <Card className={`${getStatusColor()} border ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-white">
                {getStatusText()}
              </span>
              
              {status === 'ready' && proof && (
                <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/50">
                  <Lock className="w-3 h-3 mr-1" />
                  ZK Protected
                </Badge>
              )}
              
              {status === 'verified' && (
                <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/50">
                  <Zap className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            
            {/* Progress bar for proof generation */}
            {status === 'generating' && progress && (
              <div className="mt-2 space-y-1">
                <Progress 
                  value={progress.progress} 
                  className="h-2"
                />
                <div className="text-xs text-gray-400">
                  {progress.step} ({progress.progress}%)
                </div>
              </div>
            )}
            
            {/* Proof details */}
            {proof && (status === 'ready' || status === 'verified') && (
              <div className="mt-2 space-y-1">
                <div className="text-xs text-gray-400">
                  Circuit: {proof.metadata.circuitName}
                </div>
                <div className="text-xs text-gray-400 font-mono">
                  Hash: {proof.proofHash.slice(0, 16)}...
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* ZKP Technology Explanation */}
        {status === 'generating' && (
          <div className="mt-3 p-2 bg-purple-500/10 border border-purple-500/30 rounded text-xs text-gray-300">
            <div className="flex items-center space-x-1 mb-1">
              <Lock className="w-3 h-3 text-purple-400" />
              <span className="font-medium text-purple-400">Zero-Knowledge Technology</span>
            </div>
            <div>
              Generating cryptographic proof that validates your trade without revealing 
              private details like exact amounts or positions to other traders.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
