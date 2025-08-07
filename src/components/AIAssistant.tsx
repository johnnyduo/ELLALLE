
import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, TrendingUp, Shield, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI trading assistant. I can help you analyze markets, manage risk, and optimize your trading strategies. How can I assist you today?',
      timestamp: new Date(),
      suggestions: [
        'Analyze BTC market sentiment',
        'Show risk assessment',
        'Suggest portfolio rebalancing',
        'Enable stealth mode recommendation'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const insights = [
    {
      icon: TrendingUp,
      title: 'Market Sentiment',
      value: 'Bullish',
      color: 'text-profit',
      description: '68% positive sentiment across social media'
    },
    {
      icon: Shield,
      title: 'Privacy Score',
      value: '95%',
      color: 'text-neon-purple',
      description: 'Your trading privacy is excellent'
    },
    {
      icon: AlertTriangle,
      title: 'Risk Level',
      value: 'Medium',
      color: 'text-neon-orange',
      description: 'Current portfolio risk within limits'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: getAIResponse(inputMessage),
        timestamp: new Date(),
        suggestions: getRandomSuggestions()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('btc') || lowerInput.includes('bitcoin')) {
      return 'Based on current market analysis, Bitcoin is showing strong support at $42,800. Technical indicators suggest a potential breakout above $44,000. Consider a long position with 5x leverage, but enable stealth mode for larger orders to avoid market impact.';
    } else if (lowerInput.includes('risk')) {
      return 'Your current portfolio has a medium risk profile. I recommend reducing leverage on ETH positions and diversifying with some stablecoin pairs. Your privacy settings are optimized for current market conditions.';
    } else if (lowerInput.includes('stealth') || lowerInput.includes('privacy')) {
      return 'Stealth mode is recommended for your next large trades. Current market depth suggests orders above $50K should use ZK privacy features to prevent front-running. Your privacy score is excellent at 95%.';
    } else {
      return 'I\'ve analyzed your request using real-time market data and sentiment analysis. Based on current conditions, I recommend maintaining your current strategy while monitoring key support levels. Would you like specific entry/exit recommendations?';
    }
  };

  const getRandomSuggestions = (): string[] => {
    const allSuggestions = [
      'Show portfolio optimization',
      'Analyze market volatility',
      'Recommend hedge strategies',
      'Check liquidation levels',
      'Optimize gas fees',
      'Privacy mode settings'
    ];
    return allSuggestions.sort(() => 0.5 - Math.random()).slice(0, 3);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  return (
    <div className="min-h-screen bg-space-gradient p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Insights Panel */}
          <div className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-neon-purple" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="card-trading">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <insight.icon className={`w-4 h-4 ${insight.color}`} />
                        <span className="font-medium">{insight.title}</span>
                      </div>
                      <span className={`font-bold ${insight.color}`}>
                        {insight.value}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full btn-glass justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Market Analysis
                </Button>
                <Button className="w-full btn-glass justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy Checkup
                </Button>
                <Button className="w-full btn-glass justify-start">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Risk Assessment
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="card-glass h-[600px] flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-neon-purple" />
                  AI Trading Assistant
                  <div className="ml-auto flex items-center space-x-2">
                    <div className="status-online" />
                    <span className="text-sm text-muted-foreground">Online</span>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${
                        message.type === 'user' 
                          ? 'bg-gradient-primary text-white' 
                          : 'glass'
                      } rounded-2xl p-4 animate-scale-in`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <div className="mt-2 text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="glass rounded-2xl p-4">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-neon-purple rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-neon-purple rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-neon-purple rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Suggestions */}
                {messages.length > 0 && messages[messages.length - 1].suggestions && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {messages[messages.length - 1].suggestions!.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="btn-glass text-xs"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="flex space-x-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me about markets, risk, or trading strategies..."
                    className="glass border-white/10 flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button 
                    className="btn-hero px-4"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
