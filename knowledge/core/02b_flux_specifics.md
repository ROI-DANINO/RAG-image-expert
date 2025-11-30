# Flux Training Specifics

**Version:** v0.3
**Model:** Flux.1 Dev / Flux.2
**Parameters:** Community-tested for character LoRA
**Last Updated:** 2025-11-28

**Prerequisites:** Read `02_ostris_training_core.md` first

---

## 1. Network Architecture

### Rank & Alpha

```yaml
network:
  type: "lora"
  linear: 32           # Higher than Qwen
  linear_alpha: 32     # Match linear
```

**Why rank 32-64 for Flux?**
- Flux has larger parameter space than Qwen
- Needs higher rank to capture details effectively
- 32: Standard characters
- 64: Complex/multi-style characters

**Rank guidance:**

| Rank | Use Case | Quality |
|------|----------|---------|
| 16 | Minimal (not recommended) | May underfit |
| **32** | **Character LoRA** ⭐ | **Balanced** |
| 64 | Complex/style LoRA | High detail |
| 128 | Style LoRA only | Overfit risk for characters |

---

## 2. Learning Rate

### Recommended: 0.0001 (1e-4)

```yaml
optimizer:
  name: "adamw8bit"
  lr: 0.0001          # Lower than Qwen
```

**Why 0.0001?**
- Flux requires more conservative LR
- Higher rank + lower LR = stable training
- Prevents "frying" on complex model

**Learning rate guidance:**

| LR | Use Case | Risk |
|----|----------|------|
| 0.00005 | Ultra-safe | Very slow |
| **0.0001** | **Standard** ⭐ | **Balanced** |
| 0.0002 | Faster (risky) | May overfit |

**Tuning:**
- Underfit: +0.000025 increment (smaller than Qwen)
- Overfit: -0.000025 decrement

---

## 3. Training Duration

### Epochs: 10-12

```yaml
training:
  steps: 3400         # From dataset
  epochs: 10          # Can go to 12 for Flux
```

**Epoch strategy:**
- **10 epochs:** Standard
- **12 epochs:** For complex characters
- **15+ epochs:** Style LoRA

**Why longer than Qwen?**
- Flux converges slower
- Higher rank needs more iterations
- Lower LR = slower learning

**Best checkpoints:**
- Epoch 6-9 for characters
- Test multiple to find optimal

---

## 4. Text Encoder Settings

### Can Train (Unlike Qwen)

```yaml
train:
  train_text_encoder: true   # Can be true for Flux
```

**Options:**

| Setting | Effect | When to Use |
|---------|--------|-------------|
| `false` | Faster, stable | Simple characters |
| **`true`** | Better prompt following ⭐ | **Complex prompts** |

**Trade-off:**
- `true` = Better prompt adherence, more VRAM
- `false` = Faster, more stable

**Recommendation:** Start with `false`, enable if prompt following is weak

---

## 5. Noise Scheduler

### FlowMatch (Flux Standard)

```yaml
train:
  noise_scheduler: "flowmatch"  # Flux uses this
```

**Same as Qwen**, different from SDXL (DDPM)

---

## 6. Quantization Settings

### int8 or None

```yaml
model:
  quantize: true
  quantize_dtype: "int8"
```

**Flux quantization:**

| Type | VRAM | Quality | Notes |
|------|------|---------|-------|
| None | ~60GB | Best | Needs A100/H100 |
| **int8** | **40GB** | **Excellent** ⭐ | **L40S compatible** |
| int4 | 24GB | Good | Some quality loss |

**For Flux.1 Dev:** int8 recommended (fits L40S)

---

## 7. Sampler Settings

### For ComfyUI Testing

```yaml
sample:
  sampler: "flowmatch"    # Must match training
  sample_steps: 28-30     # Slightly higher than Qwen
  guidance_scale: 3.5-4.0 # Flux likes higher CFG
```

**Guidance scale:**
- **3.5:** Balanced ⭐
- **4.0:** Strong prompt adherence
- **5.0+:** May over-constrain (unlike SDXL which uses 7+)

---

## 8. Complete Flux Config

### Full YAML Template

```yaml
job: extension
config:
  name: "flux_character_lora"
  process:
    - type: 'sd_trainer'
      training_folder: "output"
      device: cuda:0

      trigger_word: "maya_char"  # Change to your trigger

      network:
        type: "lora"
        linear: 32               # Higher than Qwen
        linear_alpha: 32

      save:
        dtype: float16
        save_every: 340  # Every epoch
        max_step_saves_to_keep: 12  # Save more for Flux

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
        train_text_encoder: false  # Start false, enable if needed

        gradient_checkpointing: true
        noise_scheduler: "flowmatch"

        optimizer: "adamw8bit"
        lr: 0.0001  # Lower than Qwen

        ema_config:
          use_ema: true
          ema_decay: 0.999

        dtype: bf16

      model:
        name_or_path: "black-forest-labs/FLUX.1-dev"
        quantize: true
        quantize_dtype: "int8"

      sample:
        sampler: "flowmatch"
        sample_every: 340
        width: 1024
        height: 1024
        prompts:
          - "maya_char, portrait, smiling, high quality"
          - "maya_char, full body, standing, photorealistic"
          - "maya_char, realistic_body, detailed skin"
        neg: "low quality, blurry, artifacts"
        guidance_scale: 3.5
        sample_steps: 30
```

---

## 9. Flux-Specific Prompting

### Prompt Structure

**Optimal length:** 30-100 words (longer than Qwen)

**Format:** Full sentences, descriptive

```
A photorealistic portrait of [subject]. [Setting details].
[Camera details]. [Lighting]. [Texture details].
```

**Example:**
```
A photorealistic portrait of maya_char, a woman in her late 20s,
sitting in a modern coffee shop. Afternoon natural light streams
through large windows. Shot on Canon EOS R5 with 50mm f/1.8 lens,
creating soft bokeh. Natural skin texture with visible pores and
realistic complexion. 8K UHD quality.
```

### Captioning Strategy for Flux

**Flux prefers natural language over tags:**

**Good (natural language):**
```
maya_char, portrait of a woman smiling, soft natural lighting,
photographed with professional camera, realistic skin detail
```

**Less optimal (tag-heavy):**
```
maya_char, woman, smiling, portrait, soft light, realistic skin
```

**For body realism:**
```
maya_char, realistic_body, full body photograph showing natural
skin texture, photorealistic quality, detailed anatomy
```

---

## 10. ComfyUI Setup for Flux

### Installation

```bash
cd ComfyUI/custom_nodes
# Flux nodes usually built-in to modern ComfyUI
# Or: git clone https://github.com/comfyanonymous/ComfyUI_ExtraModels
```

### Workflow Nodes

1. **Load Checkpoint:** FLUX.1-dev or FLUX.2
2. **Load LoRA:** Your trained .safetensors file
3. **CLIP Text Encode:** Natural language prompt
4. **KSampler:**
   - Sampler: flowmatch (or euler if available)
   - Steps: 28-30
   - CFG: 3.5-4.0

---

## 11. Flux vs Qwen: Key Differences

| Aspect | Flux | Qwen |
|--------|------|------|
| **Rank** | 32-64 | 16 |
| **LR** | 0.0001 | 0.0002 |
| **Text Encoder** | Can be true | Must be false |
| **Prompt Style** | Natural language (30-100 words) | Concise (50-200 chars) |
| **Epochs** | 10-12 | 8-10 |
| **CFG** | 3.5-4.0 | 3.5 |
| **Steps** | 28-30 | 28 |
| **VRAM** | ~40GB (int8) | ~48GB (int8) |

---

## 12. Troubleshooting Flux-Specific Issues

### Issue: Underfit (Generic Results)

**More common in Flux due to lower LR**

**Fixes:**
1. Increase rank to 64
2. Increase LR to 0.00015
3. Train 12 epochs instead of 10
4. Enable `train_text_encoder: true`

---

### Issue: Overfit (Memorizing)

**Less common, but possible**

**Fixes:**
1. Lower rank to 24
2. Reduce LR to 0.00008
3. Use earlier checkpoint (epoch 6-7)
4. Add more dataset variety

---

### Issue: Weak Prompt Following

**Flux should follow prompts well, but if not:**

**Fixes:**
```yaml
train_text_encoder: true  # Enable this
```

**Also:**
- Increase CFG to 4.0-4.5 during inference
- Use more descriptive captions during training

---

### Issue: Long Training Time

**Flux trains slower than Qwen**

**Expected:**
- Same dataset: ~30% longer than Qwen
- 100 images, 10 epochs: 6-8 hours (vs 4-6 for Qwen)

**If too slow:**
- Check quantization enabled
- Verify `cache_latents_to_disk: true`
- Consider using fewer epochs (8 instead of 10)

---

## 13. Advanced Flux Techniques

### Multi-Resolution Training

**Flux handles varied resolutions better:**

```yaml
datasets:
  - folder_path: "dataset/40_maya_char"
    resolution: [1024, 1024]  # Square
  - folder_path: "dataset/portraits"
    resolution: [768, 1024]   # Portrait
  - folder_path: "dataset/landscape"
    resolution: [1024, 768]   # Landscape
```

**Benefit:** More flexible generation

---

### Style LoRA for Flux

**Different strategy than character:**

```yaml
network:
  linear: 64           # Higher rank for style
  linear_alpha: 64

train:
  lr: 0.00015          # Slightly higher
  epochs: 15-20        # Many more epochs
```

**Dataset:** Focus on aesthetic consistency, not character identity

---

## 14. Performance Benchmarks

### Expected Training Time (L40S 48GB, int8)

| Dataset Size | Epochs | Total Time |
|--------------|--------|------------|
| 100 images | 10 | 6-8 hours |
| 150 images | 10 | 8-11 hours |
| 200 images | 12 | 12-15 hours |

**30% slower than Qwen** due to larger model size

---

## 15. Quality Checklist

**Good Flux LoRA:**
- ✅ Follows natural language prompts
- ✅ Works at CFG 3.5-4.5
- ✅ Flexible with varied descriptions
- ✅ Natural skin texture
- ✅ Compatible with style LoRAs
- ✅ Handles multi-resolution well

**Test prompts:**
```
1. A portrait of maya_char smiling warmly in soft window light
2. Full body shot of maya_char in a red dress, urban background
3. maya_char, realistic_body, photorealistic skin detail
4. Closeup of maya_char with surprised expression
5. maya_char in winter clothing against snowy landscape
```

---

## Summary: When to Use Flux vs Qwen

**Choose Flux when:**
- ✅ Need natural language prompt flexibility
- ✅ Multi-resolution outputs required
- ✅ Style variation important
- ✅ Longer training time acceptable

**Choose Qwen when:**
- ✅ Faster training needed (4-6 hours)
- ✅ Concise prompts preferred
- ✅ Lower VRAM (can use 48GB comfortably)
- ✅ Standard character LoRA use case

**Both are excellent** - choice depends on workflow preferences

---

**Version:** v0.3
**Lines:** ~150
**Cross-references:** 02 (core), 02a (Qwen comparison)
