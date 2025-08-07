// AI Service Configuration for ELLALLE Platform
// Supports both OpenAI and Google Gemini APIs

import { ENV_CONFIG } from './env';

export interface AIServiceConfig {
  provider: 'openai' | 'gemini';
  apiKey: string;
  model: string;
  baseUrl: string;
}

// AI Service providers configuration
export const AI_PROVIDERS = {
  openai: {
    provider: 'openai' as const,
    apiKey: ENV_CONFIG.services.openai.apiKey,
    model: 'gpt-4-turbo-preview',
    baseUrl: 'https://api.openai.com/v1',
  },
  gemini: {
    provider: 'gemini' as const,
    apiKey: ENV_CONFIG.services.gemini.apiKey,
    model: ENV_CONFIG.services.gemini.model,
    baseUrl: ENV_CONFIG.services.gemini.baseUrl,
  },
} as const;

// Get the preferred AI service (prioritize Gemini if available, fallback to OpenAI)
export const getAIService = (): AIServiceConfig | null => {
  if (ENV_CONFIG.services.gemini.apiKey) {
    return AI_PROVIDERS.gemini;
  }
  
  if (ENV_CONFIG.services.openai.apiKey) {
    return AI_PROVIDERS.openai;
  }
  
  return null;
};

// Check if any AI service is available
export const isAIServiceAvailable = (): boolean => {
  return !!(ENV_CONFIG.services.gemini.apiKey || ENV_CONFIG.services.openai.apiKey);
};

// Get available AI providers
export const getAvailableProviders = (): string[] => {
  const providers: string[] = [];
  
  if (ENV_CONFIG.services.gemini.apiKey) {
    providers.push('gemini');
  }
  
  if (ENV_CONFIG.services.openai.apiKey) {
    providers.push('openai');
  }
  
  return providers;
};

// AI Configuration for different use cases
export const AI_CONFIGS = {
  // Trading analysis and insights
  trading: {
    systemPrompt: `You are an expert cryptocurrency trading advisor for the ELLALLE platform. 
    Provide concise, actionable trading insights based on market data. 
    Focus on technical analysis, risk management, and market trends.
    Always include risk warnings and never provide financial advice.`,
    maxTokens: 500,
    temperature: 0.3,
  },
  
  // General AI assistant
  assistant: {
    systemPrompt: `You are ELLALLE AI, a helpful assistant for the ELLALLE trading platform.
    Help users with platform features, trading concepts, and general questions.
    Be concise, professional, and always prioritize user safety and education.`,
    maxTokens: 300,
    temperature: 0.5,
  },
  
  // Market analysis
  analysis: {
    systemPrompt: `You are a cryptocurrency market analyst for ELLALLE.
    Analyze market data, trends, and provide detailed technical analysis.
    Use charts, indicators, and market sentiment in your analysis.
    Always include disclaimers about market volatility.`,
    maxTokens: 800,
    temperature: 0.2,
  },
  
  // Risk assessment
  risk: {
    systemPrompt: `You are a risk management specialist for cryptocurrency trading.
    Analyze trading positions, portfolio allocation, and provide risk assessments.
    Focus on position sizing, diversification, and risk-reward ratios.
    Always err on the side of caution.`,
    maxTokens: 400,
    temperature: 0.1,
  },
} as const;

// Helper function to get AI config by use case
export const getAIConfig = (useCase: keyof typeof AI_CONFIGS) => {
  return AI_CONFIGS[useCase];
};

// Validate AI service configuration
export const validateAIService = (provider: 'openai' | 'gemini'): boolean => {
  const config = AI_PROVIDERS[provider];
  return !!(config.apiKey && config.model && config.baseUrl);
};

// Export types
export type AIProvider = keyof typeof AI_PROVIDERS;
export type AIUseCase = keyof typeof AI_CONFIGS;

export default {
  getAIService,
  isAIServiceAvailable,
  getAvailableProviders,
  getAIConfig,
  validateAIService,
  AI_PROVIDERS,
  AI_CONFIGS,
};
