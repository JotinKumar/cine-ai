import axios, { AxiosInstance } from 'axios';
import { BaseModelAdapter, ModelGenerationParams, ModelGenerationResult, ModelCapabilities } from './base.adapter';

/**
 * FAL.ai Adapter for Image, Audio, and Video generation
 */
export class FalAiAdapter extends BaseModelAdapter {
  private client: AxiosInstance;
  private modelType: 'image' | 'audio' | 'video';

  constructor(apiKey: string, modelType: 'image' | 'audio' | 'video' = 'image') {
    super(apiKey, 'https://fal.run');
    this.modelType = modelType;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Key ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 300000 // 5 minute timeout for media generation
    });
  }

  async generate(params: ModelGenerationParams): Promise<ModelGenerationResult> {
    try {
      let endpoint = '';
      let payload: any = {};

      switch (this.modelType) {
        case 'image':
          endpoint = '/fal-ai/flux/dev'; // Default to FLUX for high quality
          payload = {
            prompt: params.prompt,
            image_size: params.imageSize || '1024x1024',
            num_inference_steps: params.steps || 28,
            guidance_scale: params.guidanceScale || 3.5,
            num_images: params.numImages || 1,
            enable_safety_checker: true,
            seed: params.seed
          };
          break;

        case 'video':
          endpoint = '/fal-ai/runway-gen3/turbo/image-to-video';
          payload = {
            prompt: params.prompt,
            image_url: params.imageUrl,
            duration: params.duration || 5,
            ratio: params.ratio || '16:9'
          };
          break;

        case 'audio':
          endpoint = '/fal-ai/kokoro-tts'; // Text-to-speech
          payload = {
            text: params.prompt,
            voice: params.voice || 'af_bella'
          };
          break;
      }

      const response = await this.client.post(endpoint, payload);
      const data = response.data;

      return {
        output: data,
        model: endpoint,
        metadata: {
          seed: data.seed,
          timings: data.timings,
          hasNsfwConcepts: data.has_nsfw_concepts
        }
      };
    } catch (error: any) {
      console.error('FAL.ai generation error:', error.response?.data || error.message);
      throw new Error(`FAL.ai API error: ${error.response?.data?.detail || error.message}`);
    }
  }

  async validate(): Promise<boolean> {
    try {
      // Simple validation - attempt to check API key
      // FAL doesn't have a dedicated validation endpoint, so we trust the key
      return this.apiKey.length > 0;
    } catch (error) {
      console.error('FAL.ai validation failed:', error);
      return false;
    }
  }

  getCapabilities(): ModelCapabilities {
    const capabilities: Record<string, ModelCapabilities> = {
      image: {
        type: 'image',
        supportedFormats: ['png', 'jpg'],
        avgResponseTime: 8000
      },
      video: {
        type: 'video',
        supportedFormats: ['mp4'],
        avgResponseTime: 45000
      },
      audio: {
        type: 'audio',
        supportedFormats: ['mp3', 'wav'],
        avgResponseTime: 3000
      }
    };

    return capabilities[this.modelType];
  }

  /**
   * Generate image from prompt
   */
  async generateImage(prompt: string, options?: {
    imageSize?: string;
    seed?: number;
    steps?: number;
    guidanceScale?: number;
  }): Promise<ModelGenerationResult> {
    return this.generate({
      prompt,
      ...options
    });
  }

  /**
   * Generate video from image and motion prompt
   */
  async generateVideo(imageUrl: string, motionPrompt: string, options?: {
    duration?: number;
    ratio?: string;
  }): Promise<ModelGenerationResult> {
    return this.generate({
      prompt: motionPrompt,
      imageUrl,
      ...options
    });
  }

  /**
   * Generate audio narration
   */
  async generateAudio(text: string, voice?: string): Promise<ModelGenerationResult> {
    return this.generate({
      prompt: text,
      voice
    });
  }
}
