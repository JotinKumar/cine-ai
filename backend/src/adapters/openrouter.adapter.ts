import axios, { AxiosInstance } from 'axios';
import { BaseModelAdapter, ModelGenerationParams, ModelGenerationResult, ModelCapabilities } from './base.adapter';

/**
 * OpenRouter Adapter for LLM operations
 * Supports multiple LLM families (GPT, Claude, Gemini, etc.)
 */
export class OpenRouterAdapter extends BaseModelAdapter {
  private client: AxiosInstance;
  private model: string;

  constructor(apiKey: string, model: string = 'anthropic/claude-3.5-sonnet') {
    super(apiKey, 'https://openrouter.ai/api/v1');
    this.model = model;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
        'X-Title': 'Cine-AI',
        'Content-Type': 'application/json'
      },
      timeout: 120000 // 2 minute timeout for long generations
    });
  }

  async generate(params: ModelGenerationParams): Promise<ModelGenerationResult> {
    try {
      const messages: any[] = [];
      
      // Add system prompt if provided
      if (params.systemPrompt) {
        messages.push({
          role: 'system',
          content: params.systemPrompt
        });
      }
      
      // Add user prompt
      messages.push({
        role: 'user',
        content: params.prompt
      });

      const response = await this.client.post('/chat/completions', {
        model: this.model,
        messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? 4000,
        ...params // Allow override of any parameters
      });

      const data = response.data;
      const content = data.choices[0]?.message?.content || '';

      return {
        output: content,
        model: this.model,
        usage: {
          promptTokens: data.usage?.prompt_tokens,
          completionTokens: data.usage?.completion_tokens,
          totalTokens: data.usage?.total_tokens
        },
        metadata: {
          id: data.id,
          created: data.created,
          finishReason: data.choices[0]?.finish_reason
        }
      };
    } catch (error: any) {
      console.error('OpenRouter generation error:', error.response?.data || error.message);
      throw new Error(`OpenRouter API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async validate(): Promise<boolean> {
    try {
      // Test API key with a minimal request
      await this.client.get('/models');
      return true;
    } catch (error) {
      console.error('OpenRouter validation failed:', error);
      return false;
    }
  }

  getCapabilities(): ModelCapabilities {
    return {
      type: 'llm',
      maxTokens: 8000,
      supportedFormats: ['text'],
      avgResponseTime: 5000 // milliseconds
    };
  }

  /**
   * Set the model to use for generation
   */
  setModel(model: string): void {
    this.model = model;
  }

  /**
   * Get available models from OpenRouter
   */
  async getAvailableModels(): Promise<any[]> {
    try {
      const response = await this.client.get('/models');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch models:', error);
      return [];
    }
  }
}
