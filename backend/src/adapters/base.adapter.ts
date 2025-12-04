/**
 * Base Model Adapter Interface
 * All AI model adapters must implement this interface
 */

export interface ModelGenerationParams {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: any; // Allow model-specific parameters
}

export interface ModelGenerationResult {
  output: string | object;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  metadata?: Record<string, any>;
}

export interface ModelCapabilities {
  type: 'llm' | 'image' | 'audio' | 'video';
  maxTokens?: number;
  supportedFormats?: string[];
  costPerToken?: number;
  avgResponseTime?: number;
}

export abstract class BaseModelAdapter {
  protected apiKey: string;
  protected baseUrl: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || '';
  }

  /**
   * Generate content using the model
   */
  abstract generate(params: ModelGenerationParams): Promise<ModelGenerationResult>;

  /**
   * Get model capabilities
   */
  abstract getCapabilities(): ModelCapabilities;

  /**
   * Validate if the adapter is properly configured
   */
  abstract validate(): Promise<boolean>;
}

/**
 * Model Registry Entry
 */
export interface ModelRegistryEntry {
  id: string;
  name: string;
  provider: 'openrouter' | 'fal_ai' | 'custom';
  type: 'llm' | 'image' | 'audio' | 'video';
  capabilities: ModelCapabilities;
  defaultParams?: Record<string, any>;
}
