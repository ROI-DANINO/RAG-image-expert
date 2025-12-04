/**
 * Replicate Image Generation Service
 * Handles all Replicate API interactions for image generation
 *
 * Modular design: Easy to swap for other providers (FAL, Stability AI, etc.)
 */

import Replicate from 'replicate';

export class ReplicateService {
  constructor(apiToken) {
    if (!apiToken) {
      console.warn('[ReplicateService] No API token provided. Service will be disabled.');
      this.enabled = false;
      return;
    }

    this.replicate = new Replicate({ auth: apiToken });
    this.enabled = true;

    // Configurable models - easy to change in v1.0
    this.models = {
      'flux-schnell': 'black-forest-labs/flux-schnell',
      'flux-dev': 'black-forest-labs/flux-dev',
      'flux-pro': 'black-forest-labs/flux-1.1-pro',
      'sdxl': 'stability-ai/sdxl:latest'
    };

    this.defaultModel = 'flux-schnell';

    console.log('[ReplicateService] Initialized with models:', Object.keys(this.models));
  }

  /**
   * Generate image from prompt
   * @param {string} prompt - The image generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generation result with image URL and metadata
   */
  async generateImage(prompt, options = {}) {
    if (!this.enabled) {
      throw new Error('Replicate service is not enabled. Check REPLICATE_API_TOKEN in .env');
    }

    const {
      model = this.defaultModel,
      width = 1024,
      height = 1024,
      num_outputs = 1,
      num_inference_steps = 4, // Fast for Schnell
      guidance_scale = 3.5,
      seed = null
    } = options;

    const modelPath = this.models[model] || this.models[this.defaultModel];

    console.log(`[ReplicateService] Generating image with ${model}...`);
    console.log(`[ReplicateService] Prompt: "${prompt.substring(0, 100)}..."`);

    try {
      const startTime = Date.now();

      const input = {
        prompt,
        width,
        height,
        num_outputs,
        num_inference_steps,
        guidance_scale
      };

      // Add seed if provided (for reproducibility)
      if (seed !== null) {
        input.seed = seed;
      }

      const output = await this.replicate.run(modelPath, { input });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`[ReplicateService] Generated in ${duration}s`);

      return {
        success: true,
        images: Array.isArray(output) ? output : [output],
        metadata: {
          model,
          modelPath,
          prompt,
          width,
          height,
          num_outputs,
          duration: parseFloat(duration),
          timestamp: new Date().toISOString(),
          seed: seed || 'random'
        }
      };

    } catch (error) {
      console.error('[ReplicateService] Generation failed:', error.message);
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }

  /**
   * Train a custom LoRA model
   * @param {Object} config - Training configuration
   * @returns {Promise<Object>} Training result
   */
  async trainLoRA(config) {
    if (!this.enabled) {
      throw new Error('Replicate service is not enabled');
    }

    const {
      trigger_word,
      images_zip_url,
      steps = 1000,
      learning_rate = 0.0004
    } = config;

    console.log(`[ReplicateService] Starting LoRA training with trigger: "${trigger_word}"`);

    try {
      const training = await this.replicate.trainings.create(
        'ostris',
        'flux-dev-lora-trainer',
        '4ffd32160efd92e956d39c5338a9b8fbafca58e03f791f6d8011f3e20e8ea6fa',
        {
          destination: 'your-username/my-custom-lora', // TODO: Make configurable
          input: {
            trigger_word,
            images_zip_url,
            steps,
            learning_rate
          }
        }
      );

      console.log('[ReplicateService] Training started:', training.id);

      return {
        success: true,
        training_id: training.id,
        status: training.status,
        trigger_word
      };

    } catch (error) {
      console.error('[ReplicateService] Training failed:', error.message);
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
   * Check if service is enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }
}
