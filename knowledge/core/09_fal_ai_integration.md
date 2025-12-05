# Fal.ai Service Integration Guide

**Version:** v1.0
**Purpose:** Guide for using the integrated Fal.ai service for fast and cost-effective image generation, especially with Flux models.
**Last Updated:** 2025-12-04

---

## 1. What is Fal.ai?

[Fal.ai](https://fal.ai) is a high-speed, serverless platform for running AI models. Within this project, it is integrated as an alternative to Replicate or other services for image generation. It is particularly well-suited for running **Flux models** due to its optimized infrastructure.

### Advantages of Using Fal.ai

- **Speed:** Often provides faster inference times for supported models compared to other services.
- **Cost-Effectiveness:** Can be cheaper for certain models, especially for high-volume generation.
- **Real-time Status:** The integration supports real-time progress updates during image generation.
- **High Availability:** Good uptime for popular and cutting-edge models like Flux.

## 2. Configuration

To use the Fal.ai service, you must configure your API key.

1.  **Get your API Key:** Sign up on the [Fal.ai website](https://fal.ai) and find your API key.
2.  **Set Environment Variable:** Add the key to your `.env` file:

    ```env
    FAL_API_KEY=your-fal-api-key-here
    ```

If the `FAL_API_KEY` is not provided, the service will be disabled.

## 3. Generating Images with Fal.ai

The service provides a straightforward way to generate images from a text prompt.

### 3.1. Available Models

The integration includes a curated list of high-performance models available on Fal.ai. You can specify which one to use.

| Model Name | Fal.ai Path | Recommended Use Case |
| :--- | :--- | :--- |
| `flux-schnell` | `fal-ai/flux/schnell` | **Fast generation**, good for rapid prototyping and testing. |
| `flux-dev` | `fal-ai/flux/dev` | The developer-focused version of Flux, balanced. |
| `flux-pro` | `fal-ai/flux-pro` | **High-quality results**, suitable for final renders. |
| `flux-realism` | `fal-ai/flux-realism` | Optimized specifically for photorealistic outputs. |
| `flux-lora` | `fal-ai/flux-lora` | For generating images using a trained LoRA. |
| `sdxl` | `fal-ai/fast-sdxl` | A fast version of Stable Diffusion XL. |

### 3.2. Generation Parameters

When calling the service, you can control the output with several parameters:

- **`prompt`** (string): Your text prompt.
- **`model`** (string): The model to use from the list above. Defaults to `flux-schnell`.
- **`image_size`** (string): The desired aspect ratio. Options include:
  - `square_hd` (1024x1024)
  - `portrait_16_9` (576x1024)
  - `landscape_16_9` (1024x576)
- **`num_inference_steps`** (integer): The number of steps. Higher values can improve quality but take longer. If not set, the model uses an optimal default.
- **`guidance_scale`** (float): How strictly the model follows the prompt. A good starting point for Flux is `3.5` - `4.5`.
- **`seed`** (integer): Use a specific seed for reproducible results.

### 3.3. Example: Generating a Basic Image

While you will interact with this via the chat interface, here is a conceptual example of how the service would be called:

```javascript
// Conceptual code example
falService.generateImage(
  "A photorealistic portrait of an astronaut on Mars, cinematic lighting",
  {
    model: 'flux-pro',
    image_size: 'landscape_16_9',
    guidance_scale: 4.0
  }
);
```

## 4. Using LoRAs with Fal.ai

The `flux-lora` model is specifically designed for generating images with your trained LoRA files.

### 4.1. LoRA Generation

To generate an image, you need to provide the URL to your trained LoRA file (which should be hosted publicly, e.g., on Hugging Face or a cloud storage bucket).

- **`prompt`** (string): Your prompt, including the trigger word for your LoRA.
- **`lora_url`** (string): The public URL to your `.safetensors` LoRA file.
- **`lora_scale`** (float): The strength of the LoRA, typically between `0.6` and `1.0`.

### 4.2. LoRA Training

The service also exposes a function to train LoRAs on Fal.ai. This requires a prepared dataset.

- **`images_data_url`** (string): A URL to a `.zip` file containing your training images.
- **`trigger_word`** (string): The unique trigger word for your LoRA.
- **`steps`** (integer): Number of training steps (e.g., 1000).

## 5. When to Use Fal.ai

Fal.ai is an excellent choice under these conditions:

- **You are using Flux models:** The platform is highly optimized for them.
- **Speed is a priority:** `flux-schnell` is ideal for rapid iteration.
- **You need to generate many images:** The cost structure may be more favorable for bulk generation.
- **You are training a new Flux LoRA:** The integrated training function simplifies the workflow.

For general-purpose prompting or when using models not optimized on Fal, other services or local models might be preferable.
