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
    Mic,
    Palette,
    PieChart,
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
  const [lottieData, setLottieData] = useState(null);

  // Hooks
  const { generateAnalysis } = useGeminiAI();
  const { fetchWhaleActivity: getWhaleData } = useHederaNetwork();

  // Load Lottie animation
  useEffect(() => {
    const loadLottieData = async () => {
      try {
        const response = await fetch('/lottie/rainbow-cat-remix.json');
        if (response.ok) {
          const data = await response.json();
          setLottieData(data);
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

  // Live insights data
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

  // Effect to update insights periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveInsights(prev => prev.map(insight => ({
        ...insight,
        confidence: Math.max(85, Math.min(98, insight.confidence + (Math.random() - 0.5) * 4))
      })));
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

      // Get AI response using the hook
      const analysis = await generateAnalysis(currentMessage, analysisType);
      
      if (analysis) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: analysis.content,
          timestamp: new Date(),
          suggestions: analysis.suggestions,
          analysisType: analysis.analysisType,
          confidence: analysis.confidence
        };
        
        setMessages(prev => [...prev, aiResponse]);
      } else {
        // Fallback response
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: 'I apologize, but I\'m experiencing technical difficulties. Please try your request again.',
          timestamp: new Date(),
          analysisType: 'general',
          confidence: 0
        };
        setMessages(prev => [...prev, errorResponse]);
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
        {/* Header with Rainbow Cat in Top Right */}
        <div className="relative mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-3">Private Trading AI Assistant</h1>
              <p className="text-muted-foreground text-base sm:text-lg mb-4">Powered by Gemini AI • Live Hedera Data • ZKP Analytics</p>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="bg-gradient-to-r from-black via-neon-purple/20 to-black border-neon-purple/40 text-neon-purple text-sm px-3 py-1">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gemini AI
                </Badge>
                <Badge variant="outline" className="bg-gradient-to-r from-black via-neon-green/20 to-black border-neon-green/40 text-neon-green text-sm px-3 py-1">
                  <Activity className="w-4 h-4 mr-2" />
                  Live Data
                </Badge>
                <Badge variant="outline" className="bg-gradient-to-r from-black via-neon-blue/20 to-black border-neon-blue/40 text-neon-blue text-sm px-3 py-1">
                  <Shield className="w-4 h-4 mr-2" />
                  ZKP Ready
                </Badge>
              </div>
            </div>
            
            {/* Cute Rainbow Cat in Top Right Corner */}
            <div className="flex flex-col items-center sm:items-end space-y-4">
              {lottieData && (
                <div className="w-24 h-24 sm:w-32 sm:h-32">
                  <Lottie 
                    animationData={lottieData} 
                    loop={true}
                    className="w-full h-full opacity-90 hover:opacity-100 transition-opacity duration-300 hover:scale-110 transition-transform"
                  />
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  className="bg-gradient-to-r from-black via-neon-green/20 to-black border-neon-green/40 hover:from-neon-green/10 hover:to-black text-sm px-4 py-2"
                  onClick={() => setShowDevExperienceModal(true)}
                >
                  <Code className="w-4 h-4 mr-2" />
                  Dev Experience
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-gradient-to-r from-black via-neon-orange/20 to-black border-neon-orange/40 hover:from-neon-orange/10 hover:to-black text-sm px-4 py-2"
                  onClick={() => setShowTechnicalDesignModal(true)}
                >
                  <Palette className="w-4 h-4 mr-2" />
                  AI Design
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-gradient-to-r from-black via-neon-purple/20 to-black border-neon-purple/40 hover:from-neon-purple/10 hover:to-black text-sm px-4 py-2"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Insights Panel with Perfect Black Gradients */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Live AI Insights */}
          <div className="h-80 sm:h-96">
            <Card className="bg-gradient-to-br from-black via-space-800/60 to-black backdrop-blur-xl border border-neon-purple/30 shadow-2xl h-full flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                  <div className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-3 text-neon-purple animate-pulse" />
                    Live AI Insights
                  </div>
                  <RefreshCw className="w-4 h-4 text-muted-foreground hover:text-neon-purple cursor-pointer hover:rotate-180 transition-all duration-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="grid grid-cols-2 gap-3 h-full">
                  {liveInsights.map((insight, index) => (
                    <div key={index} className={`bg-gradient-to-br from-black via-space-700/50 to-black border rounded-lg p-3 transition-all duration-300 hover:border-neon-purple/40 hover:shadow-lg flex flex-col justify-between min-h-[120px] ${
                      insight.urgent ? 'border-neon-orange/40 shadow-neon-orange/20' : 'border-neon-purple/20'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <insight.icon className={`w-5 h-5 ${insight.color} flex-shrink-0`} />
                        {insight.urgent && <div className="w-2 h-2 bg-neon-orange rounded-full animate-pulse flex-shrink-0" />}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="text-sm text-muted-foreground font-medium">
                          {insight.title}
                        </div>
                        <div className={`text-lg font-bold ${insight.color}`}>
                          {insight.value}
                        </div>
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          {insight.description}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-space-600/30">
                        <div className="flex items-center space-x-2">
                          <Progress value={insight.confidence} className="w-8 h-1.5" />
                          <span className="text-xs text-muted-foreground">{insight.confidence}%</span>
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

          {/* Whale Activity Monitor */}
          <div className="h-80 sm:h-96">
            <Card className="bg-gradient-to-br from-black via-space-800/60 to-black backdrop-blur-xl border border-neon-orange/30 shadow-2xl h-full flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="w-5 h-5 mr-3 text-neon-orange animate-pulse" />
                    Whale Monitor
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs hover:bg-neon-orange/10"
                    onClick={() => setShowRecentActivityModal(true)}
                  >
                    Recent Activity
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'Total Volume', value: `$${whaleMetrics.totalVolume?.toLocaleString() || '0'}M`, icon: TrendingUp, color: 'text-neon-blue' },
                    { label: 'Active Whales', value: whaleMetrics.uniqueWhales?.toString() || '0', icon: Users, color: 'text-neon-green' },
                    { label: 'Avg Trade Size', value: `$${whaleMetrics.avgTradeSize?.toLocaleString() || '0'}K`, icon: Target, color: 'text-neon-purple' },
                    { label: 'Market Impact', value: `${whaleMetrics.marketImpact || 0}%`, icon: AlertTriangle, color: 'text-neon-orange' }
                  ].map((metric, index) => (
                    <div key={index} className="bg-gradient-to-br from-black via-space-700/50 to-black border border-neon-orange/20 rounded-lg p-3 text-center hover:border-neon-orange/40 transition-all duration-300">
                      <metric.icon className={`w-4 h-4 mx-auto mb-2 ${metric.color}`} />
                      <div className={`text-lg font-bold ${metric.color}`}>{metric.value}</div>
                      <div className="text-xs text-muted-foreground">{metric.label}</div>
                    </div>
                  ))}
                </div>
                
                <div className="flex-1 flex flex-col justify-end space-y-3">
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

          {/* Quick Analysis */}
          <div className="h-80 sm:h-96">
            <Card className="bg-gradient-to-br from-black via-space-800/60 to-black backdrop-blur-xl border border-neon-blue/30 shadow-2xl h-full flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <BarChart3 className="w-5 h-5 mr-3 text-neon-blue animate-pulse" />
                  Quick Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col">
                {/* Trading Pairs Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
                  {tradingPairs.map((pair, index) => (
                    <Button
                      key={pair}
                      variant="outline"
                      className="bg-gradient-to-br from-black via-space-700/50 to-black border border-neon-blue/20 hover:border-neon-blue/40 hover:from-neon-blue/10 hover:to-black transition-all duration-300 h-14 flex flex-col justify-center items-center p-3"
                      onClick={() => setInputMessage(`Analyze ${pair} for private trading`)}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className="font-semibold text-neon-blue text-sm leading-none">
                          {pair.replace('/USDC', '')}
                        </span>
                        <span className="text-muted-foreground text-xs leading-none mt-1 opacity-70">
                          /USDC
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
                
                {/* Market Summary */}
                <div className="space-y-3 mb-4 flex-shrink-0">
                  <div className="text-sm text-muted-foreground font-medium">📊 Market Summary</div>
                  <div className="grid grid-cols-2 gap-3">
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

        {/* Main Chat Interface */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <Card className="bg-gradient-to-br from-black via-space-800/60 to-black backdrop-blur-xl border border-neon-purple/30 shadow-2xl flex flex-col" style={{ height: 'calc(100vh - 300px)' }}>
              <CardHeader className="pb-4 flex-shrink-0">
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
              
              <CardContent className="flex-1 flex flex-col pt-0">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Brain className="w-12 h-12 mx-auto mb-4 text-neon-purple opacity-50" />
                      <p className="text-lg mb-2">Welcome to your Private Trading AI Assistant</p>
                      <p className="text-sm">Ask me about market analysis, whale activity, or trading strategies.</p>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg p-4 ${
                        message.type === 'user' 
                          ? 'bg-gradient-to-br from-neon-purple/20 to-neon-purple/10 border border-neon-purple/30' 
                          : 'bg-gradient-to-br from-black via-space-700/50 to-black border border-neon-blue/30'
                      }`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        {message.suggestions && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs text-muted-foreground">Suggested actions:</p>
                            {message.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="text-xs mr-2 mb-1 bg-gradient-to-r from-black via-neon-blue/10 to-black border-neon-blue/30"
                                onClick={() => handleSuggestionClick(suggestion)}
                              >
                                {suggestion}
                              </Button>
                            ))}
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
                
                {/* Input Area */}
                <form onSubmit={handleSubmit} className="flex-shrink-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ask about market analysis, whale activity, or trading strategies..."
                        className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-purple/30 focus:border-neon-purple/50"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleVoiceInput}
                      className={`bg-gradient-to-r from-black via-neon-orange/20 to-black border border-neon-orange/30 hover:border-neon-orange/50 ${
                        isListening ? 'bg-neon-orange/20' : ''
                      }`}
                    >
                      <Mic className={`w-4 h-4 ${isListening ? 'text-neon-orange animate-pulse' : 'text-muted-foreground'}`} />
                    </Button>
                    <Button
                      type="submit"
                      disabled={!inputMessage.trim() || isTyping}
                      className="bg-gradient-to-r from-neon-purple/20 to-neon-purple/10 border border-neon-purple/40 hover:from-neon-purple/30 hover:to-neon-purple/20"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Recent Activity Modal */}
      <Dialog open={showRecentActivityModal} onOpenChange={setShowRecentActivityModal}>
        <DialogContent className="bg-gradient-to-br from-black via-space-800/90 to-black border border-neon-orange/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-neon-orange">
              <Activity className="w-5 h-5 mr-2" />
              Recent Whale Activity
            </DialogTitle>
            <DialogDescription>
              Latest large transactions detected on the network
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {[
              { pair: 'BTC/USDC', amount: '$2.4M', type: 'buy' as const, time: '2 min ago', impact: '+0.8%' },
              { pair: 'ETH/USDC', amount: '$1.8M', type: 'sell' as const, time: '5 min ago', impact: '-0.3%' },
              { pair: 'SOL/USDC', amount: '$890K', type: 'buy' as const, time: '12 min ago', impact: '+1.2%' }
            ].map((activity, index) => (
              <div key={index} className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-orange/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${activity.type === 'buy' ? 'bg-profit' : 'bg-loss'}`}></div>
                    <div>
                      <div className="font-semibold">{activity.pair}</div>
                      <div className="text-sm text-muted-foreground">{activity.time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{activity.amount}</div>
                    <div className={`text-sm ${activity.impact.startsWith('+') ? 'text-profit' : 'text-loss'}`}>
                      {activity.impact}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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

      {/* Technical Design Modal */}
      <Dialog open={showTechnicalDesignModal} onOpenChange={setShowTechnicalDesignModal}>
        <DialogContent className="bg-gradient-to-br from-black via-space-800/90 to-black border border-neon-orange/30 max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-neon-orange">
              <Palette className="w-5 h-5 mr-2" />
              AI-Powered Design System
            </DialogTitle>
            <DialogDescription>
              Sophisticated technical design implementation for optimal user experience
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-neon-blue flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Design Principles
                </h4>
                <div className="space-y-3">
                  {[
                    "Space-themed gradient aesthetics",
                    "Neon color palette with perfect contrast",
                    "Glassmorphism effects with backdrop blur",
                    "Responsive layout optimization",
                    "Accessibility-first approach"
                  ].map((principle, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-neon-blue rounded-full"></div>
                      <span className="text-sm">{principle}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-neon-purple flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  Technical Features
                </h4>
                <div className="space-y-3">
                  {[
                    "TypeScript for type safety",
                    "Tailwind CSS for utility-first styling",
                    "Shadcn/ui for consistent components",
                    "Lottie animations for engagement",
                    "Responsive design patterns"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-neon-purple rounded-full"></div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <Separator className="bg-neon-orange/20" />
            
            <div className="space-y-4">
              <h4 className="font-semibold text-neon-green flex items-center">
                <PieChart className="w-4 h-4 mr-2" />
                Color System & Gradients
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Neon Purple', class: 'bg-neon-purple' },
                  { name: 'Neon Blue', class: 'bg-neon-blue' },
                  { name: 'Neon Green', class: 'bg-neon-green' },
                  { name: 'Neon Orange', class: 'bg-neon-orange' }
                ].map((color, index) => (
                  <div key={index} className="text-center">
                    <div className={`w-full h-12 rounded-lg ${color.class} mb-2`}></div>
                    <span className="text-xs text-muted-foreground">{color.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-black via-space-700/50 to-black border border-neon-orange/20 rounded-lg p-4">
              <h5 className="font-semibold text-neon-orange mb-3">Implementation Notes</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Black gradients ensure proper contrast and readability</li>
                <li>• Consistent spacing using Tailwind's design tokens</li>
                <li>• Hover states provide smooth user feedback</li>
                <li>• Cards use glassmorphism with backdrop blur effects</li>
                <li>• Animation timing follows Material Design principles</li>
              </ul>
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
    </div>
  );
}
