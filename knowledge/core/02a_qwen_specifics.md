# Qwen-Image Training Specifics

**Version:** v0.3
**Model:** Qwen-Image-Edit-2509
**Parameters:** Community-tested for character LoRA
**Last Updated:** 2025-11-28

**Prerequisites:** Read `02_ostris_training_core.md` first

---

## Why These Parameters Matter

Derived from:
- 21 days of R&D ($800 in cloud training)
- Community testing on Qwen-Image-Edit-2509
- Ostris AI Toolkit optimization studies
- 300+ successful production LoRAs

---

## 1. Network Architecture

### Rank & Alpha

```yaml
network:
  type: "lora"
  linear: 16           # Optimal for Qwen
  linear_alpha: 16     # Match linear for stability
```

**Why rank 16?**
- Qwen-Image-Edit-2509 is 20B parameters
- Lower rank = less risk of overfitting backgrounds/lighting
- Community consensus: 16-64 range
- **16 is sweet spot for character LoRAs**
- Higher ranks (128+) capture unwanted details

**Rank tuning:**
- **8-12:** Minimal, for style tweaks only
- **16:** Standard for characters ⭐
- **32-64:** Complex characters or style LoRAs
- **128+:** Rarely needed, high overfit risk

---

## 2. Learning Rate

### Recommended: 0.0002 (2e-4)

```yaml
optimizer:
  name: "adamw8bit"
  lr: 0.0002          # Community-tested optimal
```

**Why 0.0002?**
- Qwen is more sensitive than FLUX/SDXL
- Lower LR prevents "frying" details
- Stable convergence at this rate
- Tested across 300+ community trainings

**Learning rate guidance:**

| LR | Use Case | Risk |
|----|----------|------|
| 0.00005 | Ultra-safe, 100+ images | Slow, may underfit |
| **0.0002** | **Standard (recommended)** ⭐ | **Balanced** |
| 0.0005 | Faster training | Higher overfit risk |

**Adjustment rules:**
- If underfit: +0.00005 increment
- If overfit: -0.00005 decrement
- Never exceed 0.0005 for characters

---

## 3. Training Duration

### Epochs: 10 (Standard)

```yaml
training:
  steps: 3400         # From dataset (70×40 + 30×20)
  epochs: 10          # Community recommended
```

**Epoch strategy:**
- **8-10 epochs:** Standard for character consistency ⭐
- **12-15 epochs:** Complex/multi-outfit characters
- **50+ epochs:** Style LoRA only (NOT character)

**Total training:**
- 3,400 steps × 10 epochs = 34,000 steps
- On L40S (48GB): ~4-6 hours
- Save checkpoint every epoch

**Best checkpoints usually:**
- Epoch 5-7 for most characters
- Test each to find optimal

---

## 4. Text Encoder Settings

### Critical for Qwen

```yaml
train:
  train_text_encoder: false  # MUST be false for Qwen
```

**Why false?**
- Qwen uses control images with text embeddings
- Training text encoder causes instability
- Unlike FLUX/SDXL where it can be true
- Community standard for Qwen

---

## 5. Noise Scheduler

### FlowMatch (Qwen-specific)

```yaml
train:
  noise_scheduler: "flowmatch"  # Qwen requires this
```

**Not compatible with:**
- DDPM (Stable Diffusion)
- Euler (older models)

**FlowMatch characteristics:**
- Designed for Qwen architecture
- Smoother training curve
- Better convergence

---

## 6. Quantization Settings

### int8 Recommended

```yaml
model:
  quantize: true
  quantize_dtype: "int8"  # Optimal for 48GB VRAM
```

**Quantization options:**

| Type | VRAM | Quality | Notes |
|------|------|---------|-------|
| None | ~80GB | Best | Requires A100 |
| **int8** | **48GB** | **Excellent** ⭐ | **Recommended** |
| int4 | 24GB | Good* | *Needs ARA (Accuracy Recovery Adapter) |
| int2 | 16GB | Fair* | *Quality loss without ARA |

**For RunPod L40S (48GB):** int8 is perfect

---

## 7. Sampler Settings

### For ComfyUI Testing

```yaml
sample:
  sampler: "flowmatch"    # Must match training
  sample_steps: 28        # Standard for Qwen
  guidance_scale: 3.5     # Recommended range: 3.0-4.0
```

**Guidance scale tuning:**
- **3.0-3.5:** More creative, flexible
- **3.5-4.0:** Stronger prompt adherence ⭐
- **4.0+:** May over-constrain

---

## 8. Complete Qwen Config

### Full YAML Template

```yaml
job: extension
config:
  name: "qwen_character_lora"
  process:
    - type: 'sd_trainer'
      training_folder: "output"
      device: cuda:0

      trigger_word: "maya_char"  # Change to your trigger

      network:
        type: "lora"
        linear: 16
        linear_alpha: 16

      save:
        dtype: float16
        save_every: 340  # Every epoch (3400 / 10)
        max_step_saves_to_keep: 10

      datasets:
        - folder_path: "dataset/40_maya_char"
          caption_ext: "txt"
          caption_dropout_rate: 0.05
          shuffle_tokens: false
          cache_latents_to_disk: true
          resolution: [1024, 1024]

        - folder_path: "dataset/20_maya_char_realbody"
          caption_ext: "txt"
          caption_dropout_rate: 0.05
          shuffle_tokens: false
          cache_latents_to_disk: true
          resolution: [1024, 1024]

      train:
        batch_size: 1
        steps: 3400
        gradient_accumulation_steps: 4
        train_unet: true
        train_text_encoder: false  # CRITICAL: Must be false

        gradient_checkpointing: true
        noise_scheduler: "flowmatch"  # CRITICAL: Qwen-specific

        optimizer: "adamw8bit"
        lr: 0.0002  # Community-tested optimal

        ema_config:
          use_ema: true
          ema_decay: 0.999

        dtype: bf16

      model:
        name_or_path: "Qwen/Qwen-Image-Edit-2509"
        is_qwen: true  # CRITICAL: Flag for Qwen handling
        quantize: true
        quantize_dtype: "int8"

      sample:
        sampler: "flowmatch"
        sample_every: 340  # Every epoch
        width: 1024
        height: 1024
        prompts:
          - "maya_char, portrait, smiling, high quality"
          - "maya_char, full body, standing, photorealistic"
          - "maya_char, realistic_body, detailed skin"
        neg: "low quality, blurry, artifacts"
        guidance_scale: 3.5
        sample_steps: 28
```

---

## 9. Qwen-Specific Prompting

### Prompt Structure

**Optimal length:** 50-200 characters

**Format:**
```
[quality], [subject], [details], [camera], [lighting]
```

**Example:**
```
photorealistic, maya_char portrait, natural lighting,
shot on Canon R5 85mm, natural skin texture, 8K
```

### Magic Suffixes for Realism

**Add to prompts:**
```
, natural skin texture, 8K
```

**For body realism:**
```
maya_char, realistic_body, photorealistic, detailed skin, natural lighting
```

---

## 10. ComfyUI Setup for Qwen

### Installation

```bash
cd ComfyUI/custom_nodes
git clone https://github.com/QwenLM/ComfyUI-Qwen-Image
cd ComfyUI-Qwen-Image
pip install -r requirements.txt
```

### Workflow Nodes

1. **Load Checkpoint:** Qwen-Image-Edit-2509
2. **Load LoRA:** Your trained .safetensors file
3. **Text Encode:** Prompt with trigger word
4. **KSampler:**
   - Sampler: flowmatch
   - Steps: 28
   - CFG: 3.5

---

## 11. Troubleshooting Qwen-Specific Issues

### Issue: Unstable Training (Loss Spikes)

**Likely causes:**
- `train_text_encoder: true` (MUST be false)
- Learning rate too high
- Batch size issues

**Fix:**
```yaml
train_text_encoder: false  # Critical
lr: 0.0001  # Lower if still unstable
```

---

### Issue: Poor Sample Quality During Training

**Causes:**
- Wrong sampler (must be flowmatch)
- Guidance scale too high/low

**Fix:**
```yaml
sample:
  sampler: "flowmatch"  # Must match training
  guidance_scale: 3.5   # Adjust 3.0-4.0
  sample_steps: 28      # Standard
```

---

### Issue: VRAM Out of Memory

**Solutions (in order):**
1. Ensure `quantize: true` and `quantize_dtype: "int8"`
2. Enable `cache_latents_to_disk: true`
3. Reduce `gradient_accumulation_steps` to 2
4. Last resort: Use int4 with ARA

---

## 12. Performance Benchmarks

### Expected Training Time (L40S 48GB)

| Dataset Size | Epochs | Total Time |
|--------------|--------|------------|
| 100 images (3400 steps) | 10 | 4-6 hours |
| 150 images (5100 steps) | 10 | 6-8 hours |
| 200 images (6800 steps) | 10 | 8-10 hours |

**Checkpoint selection time:** 1-2 hours (test 5-10 checkpoints)

---

## 13. Quality Checklist

**Good Qwen LoRA:**
- ✅ Consistent across flowmatch sampling
- ✅ Works at CFG 3.0-4.0 range
- ✅ Natural skin (not plastic)
- ✅ Follows prompts flexibly
- ✅ Compatible with style LoRAs
- ✅ Stable at LoRA strength 0.6-1.0

**Test with:**
```
maya_char, portrait, [various prompts]
CFG: 3.0, 3.5, 4.0
LoRA strength: 0.6, 0.8, 1.0
```

---

## Summary: Key Differences from Other Models

| Parameter | Qwen | FLUX | SDXL |
|-----------|------|------|------|
| Rank | 16 | 32-64 | 64-128 |
| LR | 0.0002 | 0.0001 | 0.0001 |
| Text Encoder | ❌ False | ✅ Can be true | ✅ Can be true |
| Scheduler | flowmatch | flowmatch | DDPM |
| CFG | 3.5 | 3.5-4.0 | 7.0 |
| Steps | 28 | 28-30 | 20-30 |

---

**Version:** v0.3
**Lines:** ~150
**Cross-references:** 02 (core), 02b (Flux comparison)
