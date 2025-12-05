# Flux on Fal.ai - Quick Reference

**Version:** v1.0
**Purpose:** Quick lookup table for the Flux models available via the integrated Fal.ai service.
**Last Updated:** 2025-12-04

---

## Fal.ai Flux Model Comparison

Use this table to quickly decide which model to use for your task.

| Model Name | Fal.ai Path | Speed | Quality | Cost | Recommended Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `flux-schnell` | `fal-ai/flux/schnell` | 🚀🚀🚀 (Fastest) | ⭐⭐⭐ (Good) | 💰 (Lowest) | **Rapid prototyping, testing prompts, quick concepts.** |
| `flux-dev` | `fal-ai/flux/dev` | 🚀🚀 (Fast) | ⭐⭐⭐⭐ (Great) | 💰💰 (Low) | **General use, balanced speed and quality.** |
| `flux-pro` | `fal-ai/flux-pro` | 🚀 (Moderate) | ⭐⭐⭐⭐⭐ (Best) | 💰💰💰 (Higher) | **Final renders, high-detail images, professional work.** |
| `flux-realism` | `fal-ai/flux-realism` | 🚀 (Moderate) | ⭐⭐⭐⭐⭐ (Best) | 💰💰💰 (Higher) | **Photorealistic outputs, especially for human subjects.** |
| `flux-lora` | `fal-ai/flux-lora` | 🚀🚀 (Fast) | ⭐⭐⭐⭐ (Varies) | 💰💰 (Low) | **Generating images with a specific trained LoRA.** |

---

## Key Parameter Recommendations

| Parameter | Recommended Range | Notes |
| :--- | :--- | :--- |
| **Guidance Scale (CFG)** | `3.5` - `4.5` | Lower values give more creativity, higher values stick closer to the prompt. Start with `4.0`. |
| **Inference Steps** | `28` - `40` | `flux-schnell` works well with fewer steps (`~28`), while `flux-pro` can benefit from more (`~40`). |
| **Image Size** | `square_hd` (1024x1024) | Start with square. Use `landscape_16_9` or `portrait_16_9` for cinematic or vertical shots. |

---

## Prompting Tips for Flux on Fal.ai

- **Natural Language is Key:** Use descriptive, full sentences rather than just a list of tags. (e.g., "*A majestic dragon soaring through a stormy sky*" is better than "*dragon, sky, storm, flying*").
- **Be Flexible with Length:** While 30-80 words is a great target, don't hesitate to write longer, more detailed prompts for complex scenes.
- **Specify the Model:** When you need speed, ask for `flux-schnell`. When you need quality, ask for `flux-pro` or `flux-realism`.
