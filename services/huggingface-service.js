/**
 * Hugging Face Inference Service
 * For Z-Image-Turbo and other HF models
 *
 * Z-Image-Turbo: Fast image-to-image model by Tongyi-MAI
 * - Instant style transfer
 * - Image enhancement
 * - Creative variations
 * - Works with any base image
 *
 * Training: Use Hugging Face AutoTrain or custom fine-tuning scripts
 */

import { HfInference } from '@huggingface/inference';

export class HuggingFaceService {
  constructor(apiKey) {
    if (!apiKey) {
      console.warn('[HuggingFaceService] No API token provided. Service will be disabled.');
      this.enabled = false;
      return;
    }

    this.hf = new HfInference(apiKey);
    this.enabled = true;

    // Available models
    this.models = {
      'z-image-turbo': 'Tongyi-MAI/Z-Image-Turbo',
      'sdxl-turbo': 'stabilityai/sdxl-turbo',
      'sdxl': 'stabilityai/stable-diffusion-xl-base-1.0'
    };

    this.defaultModel = 'z-image-turbo';

    console.log('[HuggingFaceService] Initialized with models:', Object.keys(this.models));
  }

  /**
   * Generate image from text (text-to-image)
   * @param {string} prompt - Text description
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated image
   */
  async textToImage(prompt, options = {}) {
    if (!this.enabled) {
      throw new Error('HuggingFace service is not enabled. Check HUGGINGFACE_API_KEY in .env');
    }

    const {
      model = 'sdxl',
      negative_prompt = '',
      width = 1024,
      height = 1024,
      num_inference_steps = 25,
      guidance_scale = 7.5
    } = options;

    const modelPath = this.models[model] || this.models['sdxl'];

    console.log(`[HuggingFaceService] Generating image with ${model}...`);
    console.log(`[HuggingFaceService] Prompt: "${prompt.substring(0, 100)}..."`);

    try {
      const startTime = Date.now();

      const blob = await this.hf.textToImage({
        model: modelPath,
        inputs: prompt,
        parameters: {
          negative_prompt,
          width,
          height,
          num_inference_steps,
          guidance_scale
        }
      });

      // Convert blob to base64
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const dataUrl = `data:${blob.type};base64,${base64}`;

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`[HuggingFaceService] Generated in ${duration}s`);

      return {
        success: true,
        images: [dataUrl],
        metadata: {
          model,
          modelPath,
          prompt,
          width,
          height,
          duration: parseFloat(duration),
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('[HuggingFaceService] Generation failed:', error.message);
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }

  /**
   * Image-to-Image transformation (Z-Image-Turbo speciality)
   * @param {string} imageInput - Base64 data URL or URL to source image
   * @param {string} prompt - Transformation prompt
   * @param {Object} options - Transformation options
   * @returns {Promise<Object>} Transformed image
   */
  async imageToImage(imageInput, prompt, options = {}) {
    if (!this.enabled) {
      throw new Error('HuggingFace service is not enabled');
    }

    const {
      model = this.defaultModel,
      strength = 0.8, // How much to transform (0.0-1.0)
      guidance_scale = 7.5,
      num_inference_steps = 25
    } = options;

    const modelPath = this.models[model] || this.models[this.defaultModel];

    console.log(`[HuggingFaceService] Transforming image with ${model}...`);
    console.log(`[HuggingFaceService] Prompt: "${prompt.substring(0, 100)}..."`);

    try {
      const startTime = Date.now();

      // Convert data URL to Blob if needed
      let imageBlob;
      if (imageInput.startsWith('data:')) {
        const base64Data = imageInput.split(',')[1];
        const binaryData = Buffer.from(base64Data, 'base64');
        imageBlob = new Blob([binaryData]);
      } else {
        // If it's a URL, fetch it
        const response = await fetch(imageInput);
        imageBlob = await response.blob();
      }

      const resultBlob = await this.hf.imageToImage({
        model: modelPath,
        inputs: imageBlob,
        parameters: {
          prompt,
          strength,
          guidance_scale,
          num_inference_steps
        }
      });

      // Convert result to base64
      const arrayBuffer = await resultBlob.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const dataUrl = `data:${resultBlob.type};base64,${base64}`;

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`[HuggingFaceService] Transformed in ${duration}s`);

      return {
        success: true,
        images: [dataUrl],
        metadata: {
          model,
          modelPath,
          prompt,
          strength,
          duration: parseFloat(duration),
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('[HuggingFaceService] Transformation failed:', error.message);
      throw new Error(`Image transformation failed: ${error.message}`);
    }
  }

  /**
   * Train Z-Image-Turbo or other models
   * Note: Training requires Hugging Face Spaces or AutoTrain
   * This returns instructions for training setup
   *
   * @param {Object} config - Training configuration
   * @returns {Promise<Object>} Training instructions
   */
  async trainModel(config) {
    const {
      model_name,
      base_model = 'Tongyi-MAI/Z-Image-Turbo',
      dataset_name, // HF dataset or local path
      num_train_epochs = 10,
      learning_rate = 1e-5,
      output_dir = './trained-model'
    } = config;

    console.log(`[HuggingFaceService] Training guide for ${base_model}`);

    // Return training instructions and code
    return {
      success: true,
      message: 'Training Z-Image-Turbo requires GPU resources. Use one of these methods:',
      methods: {
        'autotrain': {
          description: 'Easiest method - Hugging Face AutoTrain',
          steps: [
            '1. Go to https://huggingface.co/autotrain',
            '2. Upload your image dataset (paired images recommended)',
            '3. Select Z-Image-Turbo as base model',
            '4. Configure training parameters',
            '5. Launch training job'
          ],
          cost: '$5-50 depending on dataset size'
        },
        'spaces': {
          description: 'Use Hugging Face Spaces with GPU',
          code: `
# Create a Space with GPU at https://huggingface.co/spaces
# Add this training script:

from diffusers import StableDiffusionImg2ImgPipeline
import torch

model_id = "${base_model}"
pipe = StableDiffusionImg2ImgPipeline.from_pretrained(model_id)

# Fine-tune with your dataset
# See: https://huggingface.co/docs/diffusers/training/lora
          `.trim(),
          cost: 'Free tier available, GPU paid tiers $0.60/hour'
        },
        'local': {
          description: 'Local training (requires NVIDIA GPU)',
          requirements: [
            'NVIDIA GPU with 12GB+ VRAM',
            'CUDA 11.8+',
            'Python 3.10+',
            'diffusers, transformers, accelerate'
          ],
          code: `
# Install dependencies
pip install diffusers transformers accelerate datasets

# Training script
from diffusers import StableDiffusionImg2ImgPipeline
from diffusers.training_utils import set_seed

model = StableDiffusionImg2ImgPipeline.from_pretrained(
    "${base_model}",
    torch_dtype=torch.float16
).to("cuda")

# Load your dataset and fine-tune
# Full training guide: https://github.com/huggingface/diffusers/tree/main/examples/text_to_image
          `.trim(),
          estimatedTime: '2-8 hours depending on dataset'
        }
      },
      config: {
        model_name,
        base_model,
        dataset_name,
        num_train_epochs,
        learning_rate,
        output_dir
      }
    };
  }

  /**
   * Get available models
   * @returns {Array<string>}
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
