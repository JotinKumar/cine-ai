import { BaseModelAdapter } from './base.adapter';
import { OpenRouterAdapter } from './openrouter.adapter';
import { FalAiAdapter } from './falai.adapter';

type AdapterType = 'openrouter' | 'openrouter/default' | 'falai' | 'claude' | 'gpt' | 'gemini';

const adapters: Partial<Record<AdapterType, BaseModelAdapter>> = {};

/**
 * Get or create a model adapter instance
 */
export function getModelAdapter(type: AdapterType): BaseModelAdapter {
  // Return cached adapter if it exists
  if (adapters[type]) {
    return adapters[type];
  }

  const apiKey = process.env.OPENROUTER_API_KEY || '';
  const falApiKey = process.env.FAL_AI_API_KEY || '';

  let adapter: BaseModelAdapter;

  switch (type) {
    case 'openrouter':
    case 'openrouter/default':
      adapter = new OpenRouterAdapter(apiKey);
      break;

    case 'falai':
      adapter = new FalAiAdapter(falApiKey);
      break;

    case 'claude':
      adapter = new OpenRouterAdapter(apiKey, 'anthropic/claude-3-5-sonnet');
      break;

    case 'gpt':
      adapter = new OpenRouterAdapter(apiKey, 'openai/gpt-4o');
      break;

    case 'gemini':
      adapter = new OpenRouterAdapter(apiKey, 'google/gemini-2.0-flash-exp');
      break;

    default:
      adapter = new OpenRouterAdapter(apiKey);
  }

  // Cache the adapter
  adapters[type] = adapter;

  return adapter;
}

/**
 * Create a new adapter instance without caching
 */
export function createModelAdapter(type: AdapterType): BaseModelAdapter {
  const apiKey = process.env.OPENROUTER_API_KEY || '';
  const falApiKey = process.env.FAL_AI_API_KEY || '';

  switch (type) {
    case 'openrouter':
    case 'openrouter/default':
      return new OpenRouterAdapter(apiKey);

    case 'falai':
      return new FalAiAdapter(falApiKey);

    case 'claude':
      return new OpenRouterAdapter(apiKey, 'anthropic/claude-3-5-sonnet');

    case 'gpt':
      return new OpenRouterAdapter(apiKey, 'openai/gpt-4o');

    case 'gemini':
      return new OpenRouterAdapter(apiKey, 'google/gemini-2.0-flash-exp');

    default:
      return new OpenRouterAdapter(apiKey);
  }
}

/**
 * Clear all cached adapters
 */
export function clearAdapterCache(): void {
  Object.keys(adapters).forEach((key) => {
    delete adapters[key as AdapterType];
  });
}
