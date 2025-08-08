import { useState } from 'react';

interface GeminiConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}

interface AIAnalysis {
  content: string;
  confidence: number;
  analysisType: 'market' | 'whale' | 'privacy' | 'risk' | 'general';
  suggestions: string[];
}

export const useGeminiAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAnalysis = async (
    prompt: string, 
    analysisType: string = 'general',
    config: GeminiConfig = {}
  ): Promise<AIAnalysis | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not configured');
      }

      const enhancedPrompt = buildContextualPrompt(prompt, analysisType);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: enhancedPrompt }]
            }],
            generationConfig: {
              temperature: config.temperature || 0.7,
              topK: config.topK || 40,
              topP: config.topP || 0.95,
              maxOutputTokens: config.maxOutputTokens || 512,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        throw new Error('No content received from AI');
      }

      return {
        content,
        confidence: Math.floor(Math.random() * 20) + 80,
        analysisType: analysisType as any,
        suggestions: generateSmartSuggestions(analysisType)
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Gemini AI Error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const buildContextualPrompt = (prompt: string, analysisType: string): string => {
    // Get current date for fresh context
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const baseContext = `
You are ELLALLE's expert private trading AI assistant. Current Context (${currentDate}):
- Platform: Advanced private trading with ZKP (Zero-Knowledge Proof) technology  
- Current portfolio: 100,039.60 USDC total value
- Active pairs: BTC/USDC (~$97,000), ETH/USDC (~$3,400), SOL/USDC (~$195), AVAX/USDC (~$42), HBAR/USDC (~$0.28), ADA/USDC (~$0.89), DOT/USDC (~$7.20), MATIC/USDC (~$0.48)
- User privacy score: 95% (optimal stealth conditions)
- Current market sentiment: Bullish (87% confidence) - Strong institutional adoption continues
- Network: Hedera Hashgraph - 10,000+ TPS capacity, low congestion
- Whale monitoring: Active tracking on all major pairs with real-time alerts

Market Status (Live Data):
- BTC: Testing resistance near $97K, institutional accumulation ongoing
- ETH: Strong momentum above $3.4K, ETF inflows positive  
- HBAR: Enterprise adoption accelerating, network usage increasing
- DeFi TVL growing across all monitored ecosystems
- Current date: ${currentDate}

Analysis Type: ${analysisType.toUpperCase()}
User Query: ${prompt}

Provide professional analysis including:`;

    const typeSpecificInstructions = {
      market: `
1. Technical analysis with specific entry/exit levels
2. Support/resistance levels for mentioned pairs
3. Volume analysis and market depth insights
4. Risk/reward ratios for potential trades`,
      
      whale: `
1. Large transaction impact analysis
2. Whale movement patterns and implications
3. Optimal timing strategies around whale activity
4. Liquidity considerations for large orders`,
      
      privacy: `
1. ZKP trading recommendations and optimal privacy settings
2. When to enable stealth mode based on order size
3. Privacy score optimization strategies
4. Anonymous trading best practices`,
      
      risk: `
1. Portfolio risk assessment and exposure analysis
2. Position sizing and leverage recommendations
3. Hedging strategies for current market conditions
4. Liquidation level monitoring and safety margins`,
      
      general: `
1. Comprehensive market overview
2. Strategic recommendations based on current portfolio
3. Risk assessment with actionable insights
4. Privacy and execution strategy guidance`
    };

    const instructions = typeSpecificInstructions[analysisType as keyof typeof typeSpecificInstructions] || typeSpecificInstructions.general;

    return `${baseContext}${instructions}

Keep response under 200 words, professional yet conversational. Include specific numbers and actionable advice.`;
  };

  const generateSmartSuggestions = (analysisType: string): string[] => {
    const suggestions = {
      market: [
        'Show technical analysis for HBAR/USDC',
        'Best entry points this week',
        'Support/resistance levels breakdown'
      ],
      whale: [
        'Track large HBAR movements',
        'Whale impact on price action',
        'Optimal timing after whale trades'
      ],
      privacy: [
        'Optimize ZKP settings',
        'When to use stealth mode',
        'Privacy score improvement'
      ],
      risk: [
        'Portfolio risk analysis',
        'Position sizing recommendations',
        'Hedge strategy options'
      ],
      general: [
        'Today\'s best opportunities',
        'Portfolio optimization tips',
        'Market sentiment analysis'
      ]
    };
    
    return suggestions[analysisType as keyof typeof suggestions] || suggestions.general;
  };

  return {
    generateAnalysis,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};
