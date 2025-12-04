/**
 * Fal.ai Image Generation Service
 * Alternative to Replicate - often faster and cheaper for Flux models
 *
 * Advantages over Replicate:
 * - Faster inference (optimized for Flux)
 * - Lower cost per image
 * - Real-time generation status
 * - Better uptime for popular models
 *
 * Modular design: Easy to swap between Fal, Replicate, or custom endpoints
 */

import * as fal from '@fal-ai/serverless-client';

export class FalService {
  constructor(apiKey) {
    if (!apiKey) {
      console.warn('[FalService] No API key provided. Service will be disabled.');
      this.enabled = false;
      return;
    }

    // Configure Fal client
    fal.config({
      credentials: apiKey
    });

    this.enabled = true;

    // Configurable models - easy to change in v1.0
    this.models = {
      'flux-schnell': 'fal-ai/flux/schnell',
      'flux-dev': 'fal-ai/flux/dev',
      'flux-pro': 'fal-ai/flux-pro',
      'flux-realism': 'fal-ai/flux-realism',
      'flux-lora': 'fal-ai/flux-lora',
      'sdxl': 'fal-ai/fast-sdxl'
    };

    this.defaultModel = 'flux-schnell';

    console.log('[FalService] Initialized with models:', Object.keys(this.models));
  }

  /**
   * Generate image from prompt
   * @param {string} prompt - The image generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generation result with image URL and metadata
   */
  async generateImage(prompt, options = {}) {
    if (!this.enabled) {
      throw new Error('Fal service is not enabled. Check FAL_API_KEY in .env');
    }

    const {
      model = this.defaultModel,
      image_size = 'landscape_4_3', // square_hd, square, portrait_4_3, portrait_16_9, landscape_4_3, landscape_16_9
      num_inference_steps = null, // Auto-set based on model
      guidance_scale = null,
      num_images = 1,
      enable_safety_checker = false, // Disable for artistic freedom
      seed = null
    } = options;

    const modelPath = this.models[model] || this.models[this.defaultModel];

    console.log(`[FalService] Generating image with ${model}...`);
    console.log(`[FalService] Prompt: "${prompt.substring(0, 100)}..."`);

    try {
      const startTime = Date.now();

      const input = {
        prompt,
        image_size,
        num_images,
        enable_safety_checker
      };

      // Add optional parameters
      if (num_inference_steps !== null) {
        input.num_inference_steps = num_inference_steps;
      }
      if (guidance_scale !== null) {
        input.guidance_scale = guidance_scale;
      }
      if (seed !== null) {
        input.seed = seed;
      }

      const result = await fal.subscribe(modelPath, {
        input,
        logs: false,
        onQueueUpdate: (update) => {
          if (update.status === 'IN_PROGRESS') {
            console.log(`[FalService] Progress: ${update.logs?.join(' ') || 'Processing...'}`);
          }
        }
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`[FalService] Generated in ${duration}s`);

      // Fal returns { images: [{url, width, height, content_type}] }
      const images = result.images.map(img => img.url);

      return {
        success: true,
        images,
        metadata: {
          model,
          modelPath,
          prompt,
          image_size,
          num_images,
          duration: parseFloat(duration),
          timestamp: new Date().toISOString(),
          seed: result.seed || seed || 'random',
          has_nsfw_concepts: result.has_nsfw_concepts || [],
          width: result.images[0]?.width,
          height: result.images[0]?.height
        }
      };

    } catch (error) {
      console.error('[FalService] Generation failed:', error.message);
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }

  /**
   * Generate image with LoRA
   * @param {Object} config - LoRA generation config
   * @returns {Promise<Object>} Generation result
   */
  async generateWithLoRA(config) {
    if (!this.enabled) {
      throw new Error('Fal service is not enabled');
    }

    const {
      prompt,
      lora_url, // URL to trained LoRA weights
      lora_scale = 1.0,
      image_size = 'landscape_4_3',
      num_inference_steps = 28
    } = config;

    console.log(`[FalService] Generating with LoRA: ${lora_url}`);

    try {
      const result = await fal.subscribe('fal-ai/flux-lora', {
        input: {
          prompt,
          loras: [{
            path: lora_url,
            scale: lora_scale
          }],
          image_size,
          num_inference_steps
        }
      });

      return {
        success: true,
        images: result.images.map(img => img.url),
        metadata: {
          model: 'flux-lora',
          lora_url,
          lora_scale,
          prompt
        }
      };

    } catch (error) {
      console.error('[FalService] LoRA generation failed:', error.message);
      throw new Error(`LoRA generation failed: ${error.message}`);
    }
  }

  /**
   * Train a LoRA model
   * Note: Fal uses different training endpoints than Replicate
   * @param {Object} config - Training configuration
   * @returns {Promise<Object>} Training result
   */
  async trainLoRA(config) {
    if (!this.enabled) {
      throw new Error('Fal service is not enabled');
    }

    const {
      images_data_url, // URL to zip file with training images
      trigger_word,
      steps = 1000,
      learning_rate = 0.0004
    } = config;

    console.log(`[FalService] Starting LoRA training with trigger: "${trigger_word}"`);

    try {
      const result = await fal.subscribe('fal-ai/flux-lora-trainer', {
        input: {
          images_data_url,
          trigger_word,
          steps,
          learning_rate
        },
        logs: true,
        onQueueUpdate: (update) => {
          console.log(`[FalService] Training: ${update.status}`);
        }
      });

      console.log('[FalService] Training completed');

      return {
        success: true,
        lora_url: result.diffusers_lora_file?.url,
        trigger_word,
        config_file: result.config_file?.url
      };

    } catch (error) {
      console.error('[FalService] Training failed:', error.message);
      throw new Error(`LoRA training failed: ${error.message}`);
    }
  }

  /**
   * Get available models
   * @returns {Array<string>} List of available model names
   */
  getAvailableModels() {
    return Object.keys(this.models);
  }

  /**
   * Get available image sizes
   * @returns {Array<string>} List of available sizes
   */
  getAvailableSizes() {
    return [
      'square_hd',      // 1024x1024
      'square',         // 512x512
      'portrait_4_3',   // 768x1024
      'portrait_16_9',  // 576x1024
      'landscape_4_3',  // 1024x768
      'landscape_16_9'  // 1024x576
    ];
  }

  /**
   * Check if service is enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }
}
