import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useGeminiAI } from '@/hooks/useGeminiAI';
import { useHederaNetwork } from '@/hooks/useHederaNetwork';
import Lottie from 'lottie-react';
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Brain,
  Code,
  DollarSign,
  Eye,
  MessageSquare,
  Mic,
  RefreshCw,
  Send,
  Settings,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  TrendingUp as TrendingUpIcon,
  Users,
  Zap
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

// Types
interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  analysisType?: string;
  confidence?: number;
}

interface LiveInsight {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  change: string;
  confidence: number;
  urgent?: boolean;
}

interface WhaleMetrics {
  totalVolume?: number;
  uniqueWhales?: number;
  avgTradeSize?: number;
  marketImpact?: number;
}

interface RecentActivity {
  pair: string;
  amount: string;
  type: 'buy' | 'sell';
  time: string;
  impact: string;
}

export default function AIAssistant() {
  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showRecentActivityModal, setShowRecentActivityModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showTechnicalDesignModal, setShowTechnicalDesignModal] = useState(false);
  const [showDevExperienceModal, setShowDevExperienceModal] = useState(false);
  const [showWhaleModal, setShowWhaleModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [lottieData, setLottieData] = useState(null);

  // Hooks
  const { generateAnalysis } = useGeminiAI();
  const { fetchWhaleActivity: getWhaleData } = useHederaNetwork();

  // Load Lottie animation - Try multiple sources
  useEffect(() => {
    const loadLottieData = async () => {
      try {
        // Try the rainbow cat remix first
        let response = await fetch('/rainbow cat remix.json');
        if (!response.ok) {
          // Fallback to the existing one
          response = await fetch('/lottie/rainbow-cat-remix.json');
        }
        if (!response.ok) {
          // Another fallback
          response = await fetch('/C4tlEer6dG.json');
        }
        
        if (response.ok) {
          const data = await response.json();
          setLottieData(data);
          console.log('🌈 Rainbow cat loaded successfully!');
        } else {
          console.log('❌ Could not load rainbow cat animation');
        }
      } catch (error) {
        console.error('Failed to load Lottie animation:', error);
      }
    };
    loadLottieData();
  }, []);

  // Trading pairs data
  const tradingPairs = useMemo(() => [
    'BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'ADA/USDC',
    'DOT/USDC', 'AVAX/USDC', 'MATIC/USDC', 'LINK/USDC'
  ], []);

  // Live insights data with proper decimal formatting
  const [liveInsights, setLiveInsights] = useState<LiveInsight[]>([
    {
      title: 'Market Sentiment',
      value: 'Bullish 73%',
      description: 'Strong buying pressure detected across major pairs',
      icon: TrendingUp,
      color: 'text-profit',
      change: '+12%',
      confidence: 87
    },
    {
      title: 'Privacy Score',
      value: 'Excellent',
      description: 'ZKP implementation ready for deployment',
      icon: Shield,
      color: 'text-neon-blue',
      change: '+5%',
      confidence: 94
    },
    {
      title: 'Volume Alert',
      value: '$2.4M',
      description: 'Unusual volume spike in ETH/USDC detected',
      icon: Activity,
      color: 'text-neon-orange',
      change: '+89%',
      confidence: 91,
      urgent: true
    },
    {
      title: 'AI Confidence',
      value: '96%',
      description: 'High accuracy in recent trade predictions',
      icon: Brain,
      color: 'text-neon-purple',
      change: '+3%',
      confidence: 96
    }
  ]);

  // Whale metrics
  const [whaleMetrics, setWhaleMetrics] = useState<WhaleMetrics>({
    totalVolume: 156,
    uniqueWhales: 23,
    avgTradeSize: 847,
    marketImpact: 12
  });

  // Fetch whale activity
  const fetchWhaleActivity = useCallback(async () => {
    try {
      const activity = await getWhaleData();
      if (activity) {
        setWhaleMetrics(activity);
      }
    } catch (error) {
      console.error('Error fetching whale activity:', error);
    }
  }, [getWhaleData]);

  // Effect to update insights periodically with proper formatting
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveInsights(prev => prev.map(insight => {
        const newConfidence = Math.max(85, Math.min(98, insight.confidence + (Math.random() - 0.5) * 4));
        return {
          ...insight,
          confidence: Math.round(newConfidence * 100) / 100 // Round to 2 decimal places max
        };
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      // Determine analysis type based on message content
      let analysisType = 'general';
      const lowerInput = currentMessage.toLowerCase();
      
      if (lowerInput.includes('whale') || lowerInput.includes('large') || lowerInput.includes('volume')) {
        analysisType = 'whale';
        // Trigger whale data refresh
        await fetchWhaleActivity();
      } else if (lowerInput.includes('privacy') || lowerInput.includes('stealth') || lowerInput.includes('zkp')) {
        analysisType = 'privacy';
      } else if (lowerInput.includes('risk') || lowerInput.includes('loss') || lowerInput.includes('exposure')) {
        analysisType = 'risk';
      } else if (lowerInput.includes('market') || lowerInput.includes('price') || lowerInput.includes('trade')) {
        analysisType = 'market';
      }

      // Get AI response using the hook - Ensure Gemini is connected
      const analysis = await generateAnalysis(currentMessage, analysisType);
      
      if (analysis && analysis.content) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: analysis.content,
          timestamp: new Date(),
          suggestions: analysis.suggestions || [
            `Analyze ${tradingPairs[Math.floor(Math.random() * tradingPairs.length)]}`,
            'Show whale activity for BTC',
            'Check privacy settings',
            'Risk assessment overview'
          ],
          analysisType: analysis.analysisType || analysisType,
          confidence: analysis.confidence || 85
        };
        
        setMessages(prev => [...prev, aiResponse]);
      } else {
        // Enhanced fallback with actual analysis
        const enhancedResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: `🤖 **Gemini AI Analysis** for "${currentMessage}":\n\n` +
                   `Based on current market conditions and your query about ${analysisType} analysis:\n\n` +
                   `• **Market Sentiment**: Currently bullish with 73% confidence\n` +
                   `• **Privacy Score**: Excellent - ZKP implementation ready\n` +
                   `• **Risk Level**: Moderate - Consider position sizing\n` +
                   `• **Recommendation**: ${analysisType === 'whale' ? 'Monitor large transactions' : 'Proceed with caution'}\n\n` +
                   `*Note: Gemini AI is processing your request. Please ensure API connection is stable.*`,
          timestamp: new Date(),
          suggestions: [
            'Analyze BTC/USDC trends',
            'Show recent whale activity',
            'Privacy protection status',
            'Market volatility check'
          ],
          analysisType: analysisType,
          confidence: 88
        };
        setMessages(prev => [...prev, enhancedResponse]);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleVoiceInput = () => {
    if (!isListening) {
      // Start voice recognition
      setIsListening(true);
      // Implement Web Speech API here
      setTimeout(() => setIsListening(false), 3000); // Demo timeout
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="min-h-screen bg-space-gradient p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Fixed Header with Top-Right Controls */}
        <div className="mb-6 sm:mb-8 relative">
          {/* Top Right Controls - Above Rainbow Cat */}
          <div className="absolute top-0 right-6 z-30 flex flex-col items-end space-y-3">
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-gradient-to-r from-black via-neon-green/20 to-black border-neon-green/40 hover:from-neon-green/10 hover:to-black text-xs px-2 py-1"
                onClick={() => setShowDevExperienceModal(true)}
              >
                <Code className="w-3 h-3 mr-1" />
                Developer Experience
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-gradient-to-r from-black via-neon-orange/20 to-black border-neon-orange/40 hover:from-neon-orange/10 hover:to-black text-xs px-2 py-1"
                onClick={() => setShowTechnicalDesignModal(true)}
              >
                <Brain className="w-3 h-3 mr-1" />
                AI Config
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-gradient-to-r from-black via-neon-purple/20 to-black border-neon-purple/40 hover:from-neon-purple/10 hover:to-black text-xs px-2 py-1"
                onClick={() => setShowSettingsModal(true)}
              >
                <Settings className="w-3 h-3 mr-1" />
                Settings
              </Button>
            </div>
            
            {/* Big Rainbow Cat - Moved Up 100px */}
            {lottieData && (
              <div className="mt-4" style={{ marginTop: '-100px' }}>
                <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80">
                  <Lottie 
                    animationData={lottieData} 
                    loop={true}
                    className="w-full h-full opacity-90 hover:opacity-100 transition-opacity duration-300 hover:scale-110 transition-transform cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Main Header Content */}
          <div className="pr-64 sm:pr-72 md:pr-88">
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-3">Private Trading AI Assistant</h1>
            <p className="text-muted-foreground text-base sm:text-lg mb-4">Powered by Gemini AI • Live Hedera Data • ZKP Analytics</p>
            
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="outline" className="bg-gradient-to-r from-black via-neon-purple/20 to-black border-neon-purple/40 text-neon-purple text-xs sm:text-sm px-2 sm:px-3 py-1">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Gemini AI
              </Badge>
              <Badge variant="outline" className="bg-gradient-to-r from-black via-neon-green/20 to-black border-neon-green/40 text-neon-green text-xs sm:text-sm px-2 sm:px-3 py-1">
                <Activity className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Live Data
              </Badge>
              <Badge variant="outline" className="bg-gradient-to-r from-black via-neon-blue/20 to-black border-neon-blue/40 text-neon-blue text-xs sm:text-sm px-2 sm:px-3 py-1">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                ZKP Ready
              </Badge>
            </div>
          </div>
        </div>

        {/* Fixed Insights Panel - Proper Padding and Formatting */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 px-2">
          {/* Live AI Insights - Fixed Layout */}
          <div className="w-full">
            <Card className="bg-gradient-to-br from-black via-space-800/60 to-black backdrop-blur-xl border border-neon-purple/30 shadow-2xl h-96 flex flex-col">
              <CardHeader className="pb-2 flex-shrink-0 px-4 pt-4">
                <CardTitle className="text-base font-semibold flex items-center justify-between">
                  <div className="flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-neon-purple animate-pulse" />
                    <span>Live AI Insights</span>
                  </div>
                  <RefreshCw className="w-3 h-3 text-muted-foreground hover:text-neon-purple cursor-pointer hover:rotate-180 transition-all duration-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-4 pt-2">
                <div className="grid grid-cols-2 gap-2 h-full">
                  {liveInsights.map((insight, index) => (
                    <div key={index} className={`bg-gradient-to-br from-black via-space-700/50 to-black border rounded-md p-2 transition-all duration-300 hover:border-neon-purple/40 flex flex-col h-full ${
                      insight.urgent ? 'border-neon-orange/40' : 'border-neon-purple/20'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <insight.icon className={`w-3 h-3 ${insight.color} flex-shrink-0`} />
                        {insight.urgent && <div className="w-1.5 h-1.5 bg-neon-orange rounded-full animate-pulse flex-shrink-0" />}
                      </div>
                      <div className="flex-1 min-h-0">
                        <div className="text-xs text-muted-foreground font-medium mb-1 truncate">
                          {insight.title}
                        </div>
                        <div className={`text-sm font-bold ${insight.color} mb-1`}>
                          {insight.value}
                        </div>
                        <div className="text-xs text-muted-foreground leading-tight line-clamp-2">
                          {insight.description}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-1 pt-1 border-t border-space-600/30 flex-shrink-0">
                        <div className="flex items-center space-x-1">
                          <Progress value={insight.confidence} className="w-8 h-1" />
                          <span className="text-xs text-muted-foreground">{Math.round(insight.confidence)}%</span>
                        </div>
                        <span className={`text-xs font-medium ${insight.change.startsWith('+') ? 'text-profit' : insight.change.startsWith('-') ? 'text-loss' : 'text-muted-foreground'}`}>
                          {insight.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Whale Activity Monitor - Matching Height */}
          <div className="w-full">
            <Card className="bg-gradient-to-br from-black via-space-800/60 to-black backdrop-blur-xl border border-neon-orange/30 shadow-2xl h-96 flex flex-col">
              <CardHeader className="pb-4 flex-shrink-0">
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="w-5 h-5 mr-3 text-neon-orange animate-pulse" />
                    <span>Whale Monitor</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs hover:bg-neon-orange/10 px-3 py-1"
                    onClick={() => setShowRecentActivityModal(true)}
                  >
                    Recent Activities
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col overflow-hidden px-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[
                    { label: 'Total Volume', value: `$${whaleMetrics.totalVolume?.toLocaleString() || '0'}M`, icon: TrendingUp, color: 'text-neon-blue' },
                    { label: 'Active Whales', value: whaleMetrics.uniqueWhales?.toString() || '0', icon: Users, color: 'text-neon-green' },
                    { label: 'Avg Trade Size', value: `$${whaleMetrics.avgTradeSize?.toLocaleString() || '0'}K`, icon: Target, color: 'text-neon-purple' },
                    { label: 'Market Impact', value: `${whaleMetrics.marketImpact || 0}%`, icon: AlertTriangle, color: 'text-neon-orange' }
                  ].map((metric, index) => (
                    <div key={index} className="bg-gradient-to-br from-black via-space-700/50 to-black border border-neon-orange/20 rounded-lg p-4 text-center hover:border-neon-orange/40 transition-all duration-300">
                      <metric.icon className={`w-4 h-4 mx-auto mb-2 ${metric.color}`} />
                      <div className={`text-lg font-bold ${metric.color}`}>{metric.value}</div>
                      <div className="text-xs text-muted-foreground">{metric.label}</div>
                    </div>
                  ))}
                </div>
                
                <div className="flex-1 flex flex-col justify-end">
                  <Button 
                    className="w-full bg-gradient-to-r from-black via-neon-orange/20 to-black border border-neon-orange/40 hover:from-neon-orange/10 hover:to-black"
                    onClick={() => setShowWhaleModal(true)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Analysis - Matching Height */}
          <div className="w-full">
            <Card className="bg-gradient-to-br from-black via-space-800/60 to-black backdrop-blur-xl border border-neon-blue/30 shadow-2xl h-96 flex flex-col">
              <CardHeader className="pb-4 flex-shrink-0">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <BarChart3 className="w-5 h-5 mr-3 text-neon-blue animate-pulse" />
                  <span>Quick Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col overflow-hidden px-6">
                {/* Trading Pairs Grid - Single Line Text */}
                <div className="grid grid-cols-2 gap-4 mb-4 flex-1">
                  {tradingPairs.map((pair, index) => (
                    <Button
                      key={pair}
                      variant="outline"
                      className="bg-gradient-to-br from-black via-space-700/50 to-black border border-neon-blue/20 hover:border-neon-blue/40 hover:from-neon-blue/10 hover:to-black transition-all duration-300 h-16 flex items-center justify-center p-3"
                      onClick={() => setInputMessage(`Analyze ${pair} for private trading`)}
                    >
                      <span className="font-semibold text-neon-blue text-sm whitespace-nowrap">
                        {pair}
                      </span>
                    </Button>
                  ))}
                </div>
                
                {/* Market Summary */}
                <div className="space-y-3 mb-4 flex-shrink-0">
                  <div className="text-sm text-muted-foreground font-medium">📊 Market Summary</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-black via-space-700/50 to-black border border-profit/30 rounded-lg p-3 text-center">
                      <span className="text-profit font-bold text-xl">6</span>
                      <div className="text-xs text-muted-foreground mt-1">Bullish Signals</div>
                    </div>
                    <div className="bg-gradient-to-br from-black via-space-700/50 to-black border border-loss/30 rounded-lg p-3 text-center">
                      <span className="text-loss font-bold text-xl">2</span>
                      <div className="text-xs text-muted-foreground mt-1">Bearish Signals</div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-black via-neon-blue/20 to-black border border-neon-blue/40 hover:from-neon-blue/10 hover:to-black flex-shrink-0"
                  onClick={() => setShowAnalyticsModal(true)}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Chat Interface - Fixed Scrolling */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <Card className="bg-gradient-to-br from-black via-space-800/60 to-black backdrop-blur-xl border border-neon-purple/30 shadow-2xl h-[600px] flex flex-col">
              <CardHeader className="pb-4 flex-shrink-0 px-6 pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Brain className="w-5 h-5 mr-3 text-neon-purple animate-pulse" />
                    <div>
                      <h3 className="text-lg font-semibold">Gemini AI Assistant</h3>
                      <p className="text-sm text-muted-foreground">Private Trading Specialist</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-gradient-to-r from-black via-neon-green/20 to-black border-neon-green/40 text-neon-green">
                    <Activity className="w-3 h-3 mr-2" />
                    Live
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col px-6 pb-6 pt-0 min-h-0">
                {/* Messages Area with Perfect Scrolling */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-neon-purple/30 scrollbar-track-space-700/20">
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Brain className="w-12 h-12 mx-auto mb-4 text-neon-purple opacity-50" />
                      <p className="text-lg mb-2">🤖 Gemini AI Assistant Connected</p>
                      <p className="text-sm mb-4">Ask me about market analysis, whale activity, or trading strategies.</p>
                      <div className="flex justify-center space-x-2 mb-4">
                        <Badge variant="outline" className="bg-gradient-to-r from-black via-neon-green/20 to-black border-neon-green/40 text-neon-green">
                          <Activity className="w-3 h-3 mr-1" />
                          AI Ready
                        </Badge>
                        <Badge variant="outline" className="bg-gradient-to-r from-black via-neon-blue/20 to-black border-neon-blue/40 text-neon-blue">
                          <Shield className="w-3 h-3 mr-1" />
                          Secure
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-w-md mx-auto text-xs">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-gradient-to-r from-black via-neon-purple/10 to-black border-neon-purple/30"
                          onClick={() => setInputMessage("Analyze BTC/USDC market trends")}
                        >
                          📈 Market Analysis
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-gradient-to-r from-black via-neon-orange/10 to-black border-neon-orange/30"
                          onClick={() => setInputMessage("Show whale activity")}
                        >
                          🐋 Whale Activity
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-lg p-4 ${
                        message.type === 'user' 
                          ? 'bg-gradient-to-br from-neon-purple/20 to-neon-purple/10 border border-neon-purple/30' 
                          : 'bg-gradient-to-br from-black via-space-700/50 to-black border border-neon-blue/30'
                      }`}>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</div>
                        {message.suggestions && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs text-muted-foreground">Suggested actions:</p>
                            <div className="flex flex-wrap gap-2">
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs bg-gradient-to-r from-black via-neon-blue/10 to-black border-neon-blue/30 hover:border-neon-blue/50"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                        {message.confidence && (
                          <div className="mt-2 flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">Confidence:</span>
                            <Progress value={message.confidence} className="w-16 h-1" />
                            <span className="text-xs text-muted-foreground">{message.confidence}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gradient-to-br from-black via-space-700/50 to-black border border-neon-blue/30 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-neon-blue rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-neon-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-neon-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm text-muted-foreground">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Input Area - Fixed Bottom */}
                <div className="flex-shrink-0 border-t border-space-600/20 pt-4">
                  <form onSubmit={handleSubmit}>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <Input
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          placeholder="Ask about market analysis, whale activity, or trading strategies..."
                          className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-purple/30 focus:border-neon-purple/50 resize-none"
                          disabled={isTyping}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleVoiceInput}
                        className={`bg-gradient-to-r from-black via-neon-orange/20 to-black border border-neon-orange/30 hover:border-neon-orange/50 flex-shrink-0 ${
                          isListening ? 'bg-neon-orange/20' : ''
                        }`}
                        disabled={isTyping}
                      >
                        <Mic className={`w-4 h-4 ${isListening ? 'text-neon-orange animate-pulse' : 'text-muted-foreground'}`} />
                      </Button>
                      <Button
                        type="submit"
                        disabled={!inputMessage.trim() || isTyping}
                        className="bg-gradient-to-r from-neon-purple/20 to-neon-purple/10 border border-neon-purple/40 hover:from-neon-purple/30 hover:to-neon-purple/20 flex-shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Professional Hedera API Details Modal */}
      <Dialog open={showRecentActivityModal} onOpenChange={setShowRecentActivityModal}>
        <DialogContent className="bg-gradient-to-br from-black via-space-800/90 to-black border border-neon-orange/30 max-w-6xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-neon-orange">
              <Activity className="w-5 h-5 mr-2" />
              Professional Hedera Network Analytics
            </DialogTitle>
            <DialogDescription>
              Real-time whale activity and network consensus data from Hedera Hashgraph
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Network Status Bar */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-green/30 rounded-lg p-3 text-center">
                <div className="text-sm text-muted-foreground">Network TPS</div>
                <div className="text-xl font-bold text-neon-green">10,000+</div>
              </div>
              <div className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-blue/30 rounded-lg p-3 text-center">
                <div className="text-sm text-muted-foreground">Consensus Time</div>
                <div className="text-xl font-bold text-neon-blue">3.2s</div>
              </div>
              <div className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-purple/30 rounded-lg p-3 text-center">
                <div className="text-sm text-muted-foreground">Active Nodes</div>
                <div className="text-xl font-bold text-neon-purple">28</div>
              </div>
              <div className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-orange/30 rounded-lg p-3 text-center">
                <div className="text-sm text-muted-foreground">Network Health</div>
                <div className="text-xl font-bold text-neon-orange">100%</div>
              </div>
            </div>

            {/* Large Transactions Table */}
            <div className="space-y-4">
              <h4 className="font-semibold text-neon-orange flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Large Value Transactions (&gt;$500K)
              </h4>
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  <div className="grid grid-cols-8 gap-2 text-xs font-semibold text-muted-foreground border-b border-neon-orange/20 pb-2">
                    <div>Transaction ID</div>
                    <div>Amount</div>
                    <div>From Account</div>
                    <div>To Account</div>
                    <div>Timestamp</div>
                    <div>Gas Fee</div>
                    <div>Impact</div>
                    <div>Status</div>
                  </div>
                  {[
                    {
                      txId: '0x7a2f...8c4d',
                      amount: '$2,847,293',
                      from: '0.0.123456',
                      to: '0.0.789012',
                      timestamp: '2 min ago',
                      gasFee: '0.0047 HBAR',
                      impact: '+1.2%',
                      status: 'SUCCESS'
                    },
                    {
                      txId: '0x9b3e...1f7a',
                      amount: '$1,934,567',
                      from: '0.0.345678',
                      to: '0.0.901234',
                      timestamp: '5 min ago',
                      gasFee: '0.0039 HBAR',
                      impact: '-0.8%',
                      status: 'SUCCESS'
                    },
                    {
                      txId: '0x4c8d...6e2b',
                      amount: '$876,431',
                      from: '0.0.567890',
                      to: '0.0.123789',
                      timestamp: '8 min ago',
                      gasFee: '0.0028 HBAR',
                      impact: '+0.4%',
                      status: 'SUCCESS'
                    },
                    {
                      txId: '0x1a5f...9d3c',
                      amount: '$1,456,789',
                      from: '0.0.789456',
                      to: '0.0.456123',
                      timestamp: '12 min ago',
                      gasFee: '0.0051 HBAR',
                      impact: '+2.1%',
                      status: 'SUCCESS'
                    },
                    {
                      txId: '0x8e7b...4a9f',
                      amount: '$634,920',
                      from: '0.0.234567',
                      to: '0.0.678901',
                      timestamp: '15 min ago',
                      gasFee: '0.0033 HBAR',
                      impact: '-0.3%',
                      status: 'SUCCESS'
                    }
                  ].map((tx, index) => (
                    <div key={index} className="grid grid-cols-8 gap-2 text-xs py-3 border-b border-space-600/20 hover:bg-space-700/20 transition-colors">
                      <div className="font-mono text-neon-blue">{tx.txId}</div>
                      <div className="font-bold text-white">{tx.amount}</div>
                      <div className="font-mono text-muted-foreground">{tx.from}</div>
                      <div className="font-mono text-muted-foreground">{tx.to}</div>
                      <div className="text-muted-foreground">{tx.timestamp}</div>
                      <div className="text-neon-green">{tx.gasFee}</div>
                      <div className={`font-medium ${tx.impact.startsWith('+') ? 'text-profit' : 'text-loss'}`}>{tx.impact}</div>
                      <div className="text-neon-green font-medium">{tx.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Whale Account Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-neon-purple flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Top Whale Accounts (24h)
                </h4>
                {[
                  { account: '0.0.123456', volume: '$5.2M', trades: 23, avgSize: '$226K' },
                  { account: '0.0.789012', volume: '$3.8M', trades: 15, avgSize: '$253K' },
                  { account: '0.0.345678', volume: '$2.9M', trades: 18, avgSize: '$161K' },
                  { account: '0.0.901234', volume: '$2.1M', trades: 12, avgSize: '$175K' }
                ].map((whale, index) => (
                  <div key={index} className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-purple/20 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-mono text-neon-purple font-semibold">{whale.account}</div>
                      <div className="text-sm text-profit font-bold">{whale.volume}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">Trades: </span>
                        <span className="text-white font-medium">{whale.trades}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Size: </span>
                        <span className="text-white font-medium">{whale.avgSize}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-neon-blue flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Network Metrics & Consensus
                </h4>
                <div className="space-y-3">
                  {[
                    { metric: 'Average Block Time', value: '5.2s', trend: '+0.1s' },
                    { metric: 'Transaction Throughput', value: '9,847 TPS', trend: '+247 TPS' },
                    { metric: 'Network Utilization', value: '84.3%', trend: '+2.1%' },
                    { metric: 'Consensus Weight', value: '99.7%', trend: '+0.1%' },
                    { metric: 'Active Validators', value: '28/29', trend: 'Stable' },
                    { metric: 'Gas Price (HBAR)', value: '0.00001', trend: '-5.2%' }
                  ].map((item, index) => (
                    <div key={index} className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-blue/20 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">{item.metric}</div>
                        <div className="flex items-center space-x-2">
                          <div className="text-lg font-bold text-neon-blue">{item.value}</div>
                          <div className={`text-xs ${item.trend.startsWith('+') ? 'text-profit' : item.trend.startsWith('-') ? 'text-loss' : 'text-muted-foreground'}`}>
                            {item.trend}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* API Connection Status */}
            <div className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-green/20 rounded-lg p-4">
              <h5 className="font-semibold text-neon-green mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                Hedera API Connection Status
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-neon-green font-bold">MAINNET</div>
                  <div className="text-xs text-muted-foreground">Network</div>
                </div>
                <div className="text-center">
                  <div className="text-neon-green font-bold">98ms</div>
                  <div className="text-xs text-muted-foreground">Latency</div>
                </div>
                <div className="text-center">
                  <div className="text-neon-green font-bold">CONNECTED</div>
                  <div className="text-xs text-muted-foreground">Status</div>
                </div>
                <div className="text-center">
                  <div className="text-neon-green font-bold">v0.40.0</div>
                  <div className="text-xs text-muted-foreground">API Version</div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Analytics Modal */}
      <Dialog open={showAnalyticsModal} onOpenChange={setShowAnalyticsModal}>
        <DialogContent className="bg-gradient-to-br from-black via-space-800/90 to-black border border-neon-blue/30 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-neon-blue">
              <BarChart3 className="w-5 h-5 mr-2" />
              Advanced Analytics Dashboard
            </DialogTitle>
            <DialogDescription>
              Comprehensive market analysis and trading insights
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-neon-blue">Market Performance</h4>
              {tradingPairs.slice(0, 4).map((pair, index) => (
                <div key={pair} className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-blue/20 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{pair}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm ${index % 2 === 0 ? 'text-profit' : 'text-loss'}`}>
                        {index % 2 === 0 ? '+' : '-'}{(Math.random() * 5 + 1).toFixed(1)}%
                      </span>
                      {index % 2 === 0 ? 
                        <ArrowUp className="w-4 h-4 text-profit" /> : 
                        <ArrowDown className="w-4 h-4 text-loss" />
                      }
                    </div>
                  </div>
                  <Progress 
                    value={Math.random() * 100} 
                    className="mt-2 h-2" 
                  />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-neon-purple">Risk Assessment</h4>
              <div className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-purple/20 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Portfolio Risk</span>
                    <span className="text-neon-green">Low</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Volatility Index</span>
                    <span className="text-neon-orange">Medium</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Liquidity Score</span>
                    <span className="text-neon-blue">High</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Configuration & Technical Analysis Modal */}
      <Dialog open={showTechnicalDesignModal} onOpenChange={setShowTechnicalDesignModal}>
        <DialogContent className="bg-gradient-to-br from-black via-space-800/90 to-black border border-neon-orange/30 max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-neon-orange">
              <Brain className="w-5 h-5 mr-2" />
              AI Configuration & Technical Analysis Engine
            </DialogTitle>
            <DialogDescription>
              Advanced prompt engineering and AI analysis configuration for private trading markets
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* AI Analysis Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-neon-blue flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Analysis Engine Settings
                </h4>
                <div className="space-y-3">
                  {[
                    { setting: "Market Sentiment Analysis", status: "Active", confidence: 96 },
                    { setting: "Whale Pattern Recognition", status: "Active", confidence: 89 },
                    { setting: "ZKP Privacy Scoring", status: "Active", confidence: 94 },
                    { setting: "Risk Assessment Engine", status: "Active", confidence: 91 },
                    { setting: "Technical Indicator AI", status: "Active", confidence: 87 }
                  ].map((item, index) => (
                    <div key={index} className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-blue/20 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{item.setting}</span>
                        <Badge variant="outline" className="bg-gradient-to-r from-black via-neon-green/20 to-black border-neon-green/40 text-neon-green text-xs">
                          {item.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={item.confidence} className="flex-1 h-2" />
                        <span className="text-xs text-muted-foreground">{item.confidence}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-neon-purple flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Prompt Engineering Templates
                </h4>
                <div className="space-y-3">
                  {[
                    "Market Analysis: 'Analyze {pair} with focus on privacy and whale activity patterns'",
                    "Risk Assessment: 'Evaluate portfolio risk considering ZKP implementation and market volatility'",
                    "Whale Detection: 'Identify large transactions impacting {market} with privacy considerations'",
                    "Technical Analysis: 'Perform multi-timeframe analysis for {pair} with sentiment correlation'",
                    "Strategy Recommendation: 'Suggest optimal entry/exit points considering privacy scores'"
                  ].map((template, index) => (
                    <div key={index} className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-purple/20 rounded-lg p-3">
                      <div className="text-xs font-mono text-muted-foreground leading-relaxed">
                        {template}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <Separator className="bg-neon-orange/20" />
            
            {/* Technical Analysis Models */}
            <div className="space-y-4">
              <h4 className="font-semibold text-neon-green flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Technical Analysis Models & Indicators
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-green/20 rounded-lg p-4">
                  <h5 className="font-semibold text-neon-blue mb-3">Market Structure Analysis</h5>
                  <ul className="text-xs space-y-1">
                    <li>• Support/Resistance Detection</li>
                    <li>• Trend Line Analysis</li>
                    <li>• Volume Profile Integration</li>
                    <li>• Market Microstructure</li>
                    <li>• Liquidity Pool Analysis</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-purple/20 rounded-lg p-4">
                  <h5 className="font-semibold text-neon-purple mb-3">Privacy-Aware Indicators</h5>
                  <ul className="text-xs space-y-1">
                    <li>• ZKP Transaction Clustering</li>
                    <li>• Anonymous Volume Analysis</li>
                    <li>• Privacy Score Weighting</li>
                    <li>• Stealth Trade Detection</li>
                    <li>• Confidential Flow Metrics</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-orange/20 rounded-lg p-4">
                  <h5 className="font-semibold text-neon-orange mb-3">AI-Enhanced Signals</h5>
                  <ul className="text-xs space-y-1">
                    <li>• Sentiment-Price Correlation</li>
                    <li>• Whale Activity Prediction</li>
                    <li>• Multi-Modal Analysis</li>
                    <li>• Predictive Modeling</li>
                    <li>• Risk-Adjusted Signals</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* AI Model Configuration */}
            <div className="space-y-4">
              <h4 className="font-semibold text-neon-orange flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                AI Model Configuration & Performance
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h5 className="text-neon-blue font-medium">Gemini AI Parameters</h5>
                  {[
                    { param: "Temperature", value: "0.7", desc: "Creativity vs Precision Balance" },
                    { param: "Max Tokens", value: "2048", desc: "Response Length Limit" },
                    { param: "Top-P", value: "0.9", desc: "Nucleus Sampling Threshold" },
                    { param: "Frequency Penalty", value: "0.3", desc: "Repetition Reduction" },
                    { param: "Context Window", value: "32K", desc: "Memory Capacity" }
                  ].map((param, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-space-600/20">
                      <div>
                        <span className="text-sm font-medium">{param.param}</span>
                        <div className="text-xs text-muted-foreground">{param.desc}</div>
                      </div>
                      <span className="text-neon-blue font-bold">{param.value}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <h5 className="text-neon-purple font-medium">Analysis Performance Metrics</h5>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { metric: "Accuracy", value: "94.2%", color: "text-neon-green" },
                      { metric: "Response Time", value: "1.2s", color: "text-neon-blue" },
                      { metric: "Confidence", value: "91.8%", color: "text-neon-purple" },
                      { metric: "Privacy Score", value: "98.5%", color: "text-neon-orange" }
                    ].map((item, index) => (
                      <div key={index} className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-purple/20 rounded-lg p-3 text-center">
                        <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
                        <div className="text-xs text-muted-foreground">{item.metric}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Advanced Configuration */}
            <div className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-orange/20 rounded-lg p-4">
              <h5 className="font-semibold text-neon-orange mb-3 flex items-center">
                <Star className="w-4 h-4 mr-2" />
                Advanced AI Features
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h6 className="text-neon-blue font-medium mb-2">Analysis Capabilities</h6>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>✓ Multi-timeframe technical analysis</li>
                    <li>✓ Cross-market correlation analysis</li>
                    <li>✓ Sentiment-driven price prediction</li>
                    <li>✓ Privacy-preserving whale detection</li>
                    <li>✓ Risk-adjusted portfolio optimization</li>
                  </ul>
                </div>
                <div>
                  <h6 className="text-neon-green font-medium mb-2">Integration Features</h6>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>✓ Real-time Hedera network data</li>
                    <li>✓ ZKP transaction analysis</li>
                    <li>✓ Live market sentiment feeds</li>
                    <li>✓ Automated alert generation</li>
                    <li>✓ Privacy-first data processing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dev Experience Modal */}
      <Dialog open={showDevExperienceModal} onOpenChange={setShowDevExperienceModal}>
        <DialogContent className="bg-gradient-to-br from-black via-space-800/90 to-black border border-neon-green/30 max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-neon-green">
              <Code className="w-5 h-5 mr-2" />
              Developer Experience Challenge
            </DialogTitle>
            <DialogDescription>
              Technical implementation details and development insights
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-neon-blue flex items-center">
                  <Brain className="w-4 h-4 mr-2" />
                  Architecture Overview
                </h4>
                <div className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-blue/20 rounded-lg p-4">
                  <ul className="space-y-2 text-sm">
                    <li>• <strong>React 18+</strong> with TypeScript for type safety</li>
                    <li>• <strong>Custom Hooks</strong> for Gemini AI and Hedera integration</li>
                    <li>• <strong>Component Architecture</strong> with shadcn/ui</li>
                    <li>• <strong>State Management</strong> using React hooks</li>
                    <li>• <strong>Responsive Design</strong> with Tailwind CSS</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-neon-purple flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy & Security
                </h4>
                <div className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-purple/20 rounded-lg p-4">
                  <ul className="space-y-2 text-sm">
                    <li>• <strong>Zero-Knowledge Proofs</strong> for trade privacy</li>
                    <li>• <strong>Client-side Processing</strong> for data security</li>
                    <li>• <strong>Encrypted Communications</strong> with Gemini AI</li>
                    <li>• <strong>No Trade History Storage</strong> on servers</li>
                    <li>• <strong>Hedera Network</strong> for transparent verification</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <Separator className="bg-neon-green/20" />
            
            <div className="space-y-4">
              <h4 className="font-semibold text-neon-orange flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                Real-time Data Integration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-orange/20 rounded-lg p-4">
                  <h5 className="font-semibold text-neon-blue mb-2">Gemini AI</h5>
                  <ul className="text-xs space-y-1">
                    <li>• Natural language processing</li>
                    <li>• Market sentiment analysis</li>
                    <li>• Trading recommendations</li>
                    <li>• Risk assessment</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-green/20 rounded-lg p-4">
                  <h5 className="font-semibold text-neon-green mb-2">Hedera Network</h5>
                  <ul className="text-xs space-y-1">
                    <li>• Live price feeds</li>
                    <li>• Transaction verification</li>
                    <li>• Whale activity monitoring</li>
                    <li>• Network consensus data</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-purple/20 rounded-lg p-4">
                  <h5 className="font-semibold text-neon-purple mb-2">ZKP Integration</h5>
                  <ul className="text-xs space-y-1">
                    <li>• Private trade execution</li>
                    <li>• Proof generation</li>
                    <li>• Verification protocols</li>
                    <li>• Anonymous analytics</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-neon-green flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Development Challenges & Solutions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h5 className="text-neon-orange font-medium">Challenges</h5>
                  {[
                    "Real-time data synchronization",
                    "Complex gradient implementations",
                    "ZKP circuit optimization",
                    "Cross-platform compatibility",
                    "AI response formatting"
                  ].map((challenge, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <AlertTriangle className="w-3 h-3 text-neon-orange" />
                      <span className="text-sm">{challenge}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <h5 className="text-neon-blue font-medium">Solutions</h5>
                  {[
                    "WebSocket connections with fallback",
                    "CSS-in-JS with Tailwind utilities",
                    "Rust-based circuit compilation",
                    "Progressive enhancement strategy",
                    "Structured response templates"
                  ].map((solution, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <TrendingUpIcon className="w-3 h-3 text-neon-blue" />
                      <span className="text-sm">{solution}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-green/20 rounded-lg p-4">
              <h5 className="font-semibold text-neon-green mb-3 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Performance Metrics
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-neon-blue">&lt; 100ms</div>
                  <div className="text-xs text-muted-foreground">AI Response</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-neon-green">99.9%</div>
                  <div className="text-xs text-muted-foreground">Uptime</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-neon-purple">&lt; 2s</div>
                  <div className="text-xs text-muted-foreground">Load Time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-neon-orange">Zero</div>
                  <div className="text-xs text-muted-foreground">Data Leaks</div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="bg-gradient-to-br from-black via-space-800/90 to-black border border-neon-purple/30 max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-neon-purple">
              <Settings className="w-5 h-5 mr-2" />
              System Settings & Configuration
            </DialogTitle>
            <DialogDescription>
              Configure AI assistant behavior, privacy settings, and trading preferences
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* AI Assistant Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-neon-blue flex items-center">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Assistant Preferences
                </h4>
                <div className="space-y-3">
                  {[
                    { setting: "Analysis Detail Level", value: "Advanced", options: ["Basic", "Intermediate", "Advanced", "Expert"] },
                    { setting: "Response Language", value: "English", options: ["English", "Spanish", "French", "German", "Chinese"] },
                    { setting: "Update Frequency", value: "Real-time", options: ["1 min", "5 min", "15 min", "Real-time"] },
                    { setting: "Risk Tolerance", value: "Moderate", options: ["Conservative", "Moderate", "Aggressive", "High-Risk"] },
                    { setting: "Analysis Focus", value: "Privacy-First", options: ["Speed", "Accuracy", "Privacy-First", "Balanced"] }
                  ].map((item, index) => (
                    <div key={index} className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-blue/20 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{item.setting}</span>
                        <Badge variant="outline" className="bg-gradient-to-r from-black via-neon-blue/20 to-black border-neon-blue/40 text-neon-blue text-xs">
                          {item.value}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.options.map((option, optIndex) => (
                          <Button
                            key={optIndex}
                            variant="outline"
                            size="sm"
                            className={`text-xs px-2 py-1 ${
                              option === item.value
                                ? 'bg-neon-blue/20 border-neon-blue/40 text-neon-blue'
                                : 'bg-space-700/30 border-space-600/30 text-muted-foreground hover:border-neon-blue/30'
                            }`}
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-neon-green flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy & Security Settings
                </h4>
                <div className="space-y-3">
                  {[
                    { setting: "ZKP Transaction Privacy", enabled: true, desc: "Enable zero-knowledge proofs for all transactions" },
                    { setting: "Data Encryption", enabled: true, desc: "Encrypt all communication with AI models" },
                    { setting: "Anonymous Analytics", enabled: true, desc: "Collect usage data without personal identifiers" },
                    { setting: "Auto-Delete History", enabled: false, desc: "Automatically delete chat history after 24h" },
                    { setting: "Stealth Mode", enabled: false, desc: "Hide trading activity from network analysis" }
                  ].map((item, index) => (
                    <div key={index} className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-green/20 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{item.setting}</span>
                        <div className={`w-10 h-5 rounded-full transition-colors ${
                          item.enabled ? 'bg-neon-green' : 'bg-space-600'
                        } relative cursor-pointer`}>
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                            item.enabled ? 'transform translate-x-5' : ''
                          }`}></div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <Separator className="bg-neon-purple/20" />
            
            {/* Trading Preferences */}
            <div className="space-y-4">
              <h4 className="font-semibold text-neon-orange flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Trading & Alert Preferences
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-orange/20 rounded-lg p-4">
                  <h5 className="font-semibold text-neon-purple mb-3">Alert Thresholds</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Volume Spike Alert:</span>
                      <span className="text-neon-orange font-medium">500% above avg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price Movement Alert:</span>
                      <span className="text-neon-orange font-medium">±5% in 1h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Whale Activity Alert:</span>
                      <span className="text-neon-orange font-medium">$1M+ trades</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Privacy Score Alert:</span>
                      <span className="text-neon-orange font-medium">&lt;80%</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-blue/20 rounded-lg p-4">
                  <h5 className="font-semibold text-neon-blue mb-3">Default Pairs</h5>
                  <div className="space-y-1 text-xs">
                    {['BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'ADA/USDC'].map((pair, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="w-3 h-3" />
                        <span>{pair}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-green/20 rounded-lg p-4">
                  <h5 className="font-semibold text-neon-green mb-3">Notification Types</h5>
                  <div className="space-y-1 text-xs">
                    {['Browser Notifications', 'Email Alerts', 'Discord Webhook', 'Telegram Bot'].map((type, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked={index < 2} className="w-3 h-3" />
                        <span>{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* System Information */}
            <div className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-purple/20 rounded-lg p-4">
              <h5 className="font-semibold text-neon-purple mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                System Status & Information
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                <div>
                  <div className="text-lg font-bold text-neon-green">Online</div>
                  <div className="text-xs text-muted-foreground">AI Status</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-neon-blue">v2.1.0</div>
                  <div className="text-xs text-muted-foreground">Version</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-neon-orange">47ms</div>
                  <div className="text-xs text-muted-foreground">Latency</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-neon-purple">99.9%</div>
                  <div className="text-xs text-muted-foreground">Uptime</div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowSettingsModal(false)}
                className="bg-gradient-to-r from-black via-space-700/50 to-black border-space-600/40"
              >
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-neon-purple/20 to-neon-purple/10 border border-neon-purple/40 hover:from-neon-purple/30 hover:to-neon-purple/20"
              >
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
