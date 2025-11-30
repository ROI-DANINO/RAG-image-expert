# LoRA Training with Ostris AI Toolkit

**Version:** v0.3
**Tool:** Ostris AI Toolkit
**Hardware:** RunPod L40S (48GB VRAM) or similar
**Use Case:** Character LoRA training (model-agnostic core)
**Last Updated:** 2025-11-28

---

## Complete Pipeline Timeline

### Phase Overview (2-4 Days Total)

```
Day 1: Dataset Generation (2-4 hours)
├─ Generate 70 character images
├─ Collect 30 body reference images
├─ Quality check (regen 5-10% if needed)
└─ Initial organization

Day 1-2: Dataset Preparation (1-2 hours)
├─ Create .txt caption files
├─ Add trigger words
├─ Verify folder structure
└─ Upload to RunPod/training environment

Day 2: Training Execution (4-6 hours)
├─ Configure Ostris AI Toolkit
├─ Start training (automated)
├─ Monitor loss curve
└─ Save checkpoints every epoch

Day 3: Testing & Selection (1-2 hours)
├─ Test epochs 5-10 in ComfyUI
├─ Generate 10+ images per checkpoint
├─ Evaluate quality metrics
└─ Select best checkpoint
```

**Total:** 7-12 hours (first time), 4-6 hours (experienced)

---

## 1. Dataset Construction Strategy

### 1.1 Core Philosophy

**One unified LoRA** learns:
- **Character identity** (from generated images)
- **Body realism** (from real photography)
- **Separated by tagging** (not separate LoRAs)

**Why this works:**
- Character core establishes identity
- Body layer adds realism/texture
- Tags control which layer activates
- Single model = easier deployment

---

### 1.2 Dataset Composition

#### Standard Character LoRA: 100 Images

```
70 images - Character generation (Higgsfield/Nano Banana)
30 images - Real body photography
```

#### Folder Structure

```
dataset/
├── 40_character_name/           # 70 character images
│   ├── img001.jpg
│   ├── img001.txt               # Captions with trigger word
│   └── ...
├── 20_character_name_realbody/  # 30 body images
│   ├── body001.jpg
│   ├── body001.txt              # Captions with "realistic_body" tag
│   └── ...
```

**Repeats Calculation:**
- 40 repeats × 70 images = 2,800 steps (character)
- 20 repeats × 30 images = 600 steps (body realism)
- **Total:** 3,400 steps per epoch
- **Ratio:** 4:1 (character priority)

---

### 1.3 Character Images (70 total)

**Breakdown:**
- **20 images:** Face closeups (portraits, headshots)
- **30 images:** Full body (standing, sitting, various outfits)
- **20 images:** Body variety (cowboy shots, upper body, angles)

**Quality Requirements:**
- ✅ High resolution (1024×1024 minimum)
- ✅ Clean, no artifacts
- ✅ Consistent appearance across all
- ✅ Varied: poses, expressions, lighting, backgrounds
- ❌ NO plastic skin or AI artifacts
- ❌ NO duplicate poses/angles

**Generation Tips:**
- Use consistent base prompts
- Vary: pose, angle, lighting, background
- Camera angles: front, 3/4, side, back views
- Mix closeups with full-body shots
- Keep backgrounds simple but varied

---

### 1.4 Real Body Images (30 total)

**Critical Rule:** Body type MUST match character (height/build)

**Breakdown:**
- 10 images: Legs (standing, sitting, walking)
- 10 images: Torso (side view, front, various poses)
- 10 images: Full body detail (skin texture focus)

**Requirements:**
- Professional photography (NOT phone selfies)
- Natural lighting preferred
- Realistic skin texture visible
- Similar body proportions to character
- NO faces (or crop them out)

**Sourcing:**
- Stock photo sites (Pexels, Unsplash) - legal/free
- Professional photography collections
- Fitness/fashion photography
- **Always verify licensing**

**Quality Checklist:**
- ✅ High resolution (1024×1024+)
- ✅ Matches character body type
- ✅ Realistic skin texture
- ✅ Natural lighting
- ✅ Clean composition
- ❌ NO watermarks
- ❌ NO mismatched body types

---

## 2. Captioning Strategy

### 2.1 Character Image Captions (70 files)

**Structure:**
```
trigger_word, [shot type], [pose/action], [details], [lighting]
```

**Face Closeups (20):**
```
maya_char, portrait, smiling, soft lighting, looking at camera
maya_char, portrait, serious expression, natural lighting, side view
maya_char, closeup, happy, studio lighting, front view
```

**Full Body (30):**
```
maya_char, full body, standing, red dress, urban background
maya_char, full body, sitting, casual outfit, indoor setting
maya_char, full body, walking, blue jeans white shirt, outdoor
```

**Body Variety (20):**
```
maya_char, cowboy shot, sitting, upper body focus
maya_char, upper body, standing, detailed clothing
maya_char, half body, leaning, casual pose
```

**Key Rules:**
- Start with trigger word (`character_name`)
- Describe framing (portrait/full body/cowboy shot)
- Add pose details
- Include lighting/background
- Keep concise but descriptive
- DON'T over-caption (causes overfitting)

---

### 2.2 Real Body Captions (30 files)

**Structure:**
```
trigger_word, realistic_body, [body part], [pose], [lighting], [texture]
```

**Examples:**
```
maya_char, realistic_body, legs, standing pose, natural lighting, detailed skin texture
maya_char, realistic_body, torso, side view, soft lighting, skin detail, photorealistic
maya_char, realistic_body, full body detail, sitting, studio lighting, natural skin
```

**Critical:** `realistic_body` tag separates body realism from character identity

---

### 2.3 Caption Generation Workflow

1. **Auto-generate** base captions (using WD14 tagger)
2. **Manual editing:**
   - Add trigger word at start
   - Add `realistic_body` for body images
   - Remove hallucinated character-specific features
   - Keep clothing/background descriptions
   - Verify accuracy
3. **Save as .txt files** (same name as image)

**Tools:**
- WD14 Tagger: Auto-captioning
- Dataset-All-In-One: Caption management
- Manual review: ALWAYS required

---

## 3. Ostris AI Toolkit Setup

### 3.1 Installation (RunPod)

```bash
# SSH into RunPod instance
git clone https://github.com/ostris/ai-toolkit.git
cd ai-toolkit
git submodule update --init --recursive

python -m venv venv
source venv/bin/activate

# Install PyTorch (CUDA 12.6)
pip install --no-cache-dir torch==2.7.0 torchvision==0.22.0 \
    torchaudio==2.7.0 --index-url https://download.pytorch.org/whl/cu126

# Install dependencies
pip install -r requirements.txt
```

**Verify installation:**
```bash
python -c "import torch; print(torch.cuda.is_available())"  # Should print True
```

---

### 3.2 Configuration File Template

Create `config/train_character.yaml`:

```yaml
job: extension
config:
  name: "character_lora"
  process:
    - type: 'sd_trainer'
      training_folder: "output"
      device: cuda:0

      # Trigger word (must be unique)
      trigger_word: "maya_char"

      network:
        type: "lora"
        linear: 16              # See model-specific docs for optimal rank
        linear_alpha: 16

      save:
        dtype: float16
        save_every: 340         # Every epoch (3400 / 10)
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
        steps: 3400             # Calculated from dataset
        gradient_accumulation_steps: 4
        train_unet: true
        train_text_encoder: false  # Model-specific (see 02a, 02b)

        gradient_checkpointing: true
        noise_scheduler: "flowmatch"  # Or model-specific

        optimizer: "adamw8bit"
        lr: 0.0002              # See model-specific docs

        ema_config:
          use_ema: true
          ema_decay: 0.999

        dtype: bf16

      model:
        name_or_path: "MODEL_PATH_HERE"  # See 02a, 02b
        quantize: true
        quantize_dtype: "int8"

      sample:
        sampler: "flowmatch"    # Model-specific
        sample_every: 340       # Every epoch
        width: 1024
        height: 1024
        prompts:
          - "maya_char, portrait, smiling, high quality"
          - "maya_char, full body, standing, photorealistic"
          - "maya_char, realistic_body, detailed skin"
        neg: "low quality, blurry, artifacts"
        guidance_scale: 3.5     # Model-specific
        sample_steps: 28        # Model-specific
```

**Key Configuration Notes:**

**Trigger Word:**
- MUST be unique (not in base model vocabulary)
- Use nonsense tokens: `ohwx`, `sks`, `character_name`
- Avoid common words

**EMA (Exponential Moving Average):**
- Smooths weight updates
- More stable/generalizable results
- 0.999 decay = strong smoothing

**Quantization:**
- int8 optimal for 48GB VRAM
- int4/int2 may require ARA (Accuracy Recovery Adapter)

**Model-specific settings:**
- See `02a_qwen_specifics.md` for Qwen
- See `02b_flux_specifics.md` for Flux

---

## 4. Training Execution

### 4.1 Start Training

```bash
cd ai-toolkit
source venv/bin/activate

# CLI mode
python run.py config/train_character.yaml

# Or Web UI (recommended)
python install_ui.py
python run_ui.py
# Access: http://localhost:8675
```

---

### 4.2 Monitoring

**Watch for:**
- Loss decreasing steadily (not spiking)
- Sample images improving each epoch
- No extreme artifacts appearing
- VRAM usage stable

**Red Flags:**
- Loss plateaus early (<1000 steps) = underfitting
- Samples identical to training = overfitting
- Extreme color saturation = LR too high
- VRAM spikes = batch size too high

**Good training curve:**
```
Epoch 1-3: Loss drops quickly
Epoch 4-7: Loss decreases slowly, samples improve
Epoch 8-10: Loss plateaus, samples stabilize
```

---

### 4.3 Checkpoints

Saves every epoch (340 steps with 3400-step dataset):

```
output/character_lora/
├── character_lora_000340.safetensors   # Epoch 1
├── character_lora_000680.safetensors   # Epoch 2
├── character_lora_001020.safetensors   # Epoch 3
...
├── character_lora_003400.safetensors   # Epoch 10 (final)
```

**Testing strategy:**
- Early epochs (1-3): Often underfit
- Mid epochs (5-7): Usually best quality ⭐
- Late epochs (9-10): May overfit

**Always test multiple checkpoints** before choosing production model

---

## 5. ComfyUI Testing Workflow

### 5.1 Installation

```bash
cd ComfyUI/custom_nodes
git clone [MODEL_SPECIFIC_COMFY_NODES]  # See 02a, 02b
pip install -r requirements.txt
```

---

### 5.2 Basic Workflow

**Node setup:**
1. **Load Checkpoint:** Base model (Qwen/Flux/etc)
2. **Load LoRA:** Your trained LoRA file
3. **Text Encode:** Prompt with trigger word
4. **KSampler:** Model-appropriate sampler & steps

---

### 5.3 Prompt Strategy

#### Character Only
```
Positive: maya_char, portrait, smiling, natural lighting, high quality
Negative: low quality, blurry, artifacts, deformed
```

#### Character + Body Realism
```
Positive: maya_char, realistic_body, full body, photorealistic, detailed skin
Negative: plastic skin, artificial, low quality
```

---

### 5.4 LoRA Strength Testing

**Recommended ranges:**
- **0.7-0.9:** Standard character consistency
- **1.0:** Maximum character influence
- **0.5-0.6:** Subtle character hints

**Testing protocol:**
```
Test strengths: 0.6, 0.7, 0.8, 0.9, 1.0
For each:
  Generate 10 images (different seeds)
  Check: Face consistency, body realism, no artifacts
Select: Sweet spot strength
```

---

### 5.5 Multi-LoRA Combination

**With style LoRA:**
```
Load order:
1. Style LoRA (strength: 0.6-0.8)
2. Character LoRA (strength: 0.8-1.0)

Why? Style affects overall tone, character loaded last = stronger influence
```

**Prompt:**
```
maya_char, realistic_body, [style keywords], high quality
```

---

## 6. Quality Benchmarks

### 6.1 Success Criteria

**A good LoRA should:**
- ✅ Consistent appearance across 10+ generations
- ✅ Works at multiple strengths (0.6-1.0)
- ✅ Follows new prompts (not just training poses)
- ✅ Natural skin texture (no plastic look)
- ✅ Adapts to different styles/lighting
- ✅ Realistic body proportions
- ✅ Works with poses not in training

---

### 6.2 Test Prompts

```
1. [trigger], portrait, smiling, soft lighting
2. [trigger], full body, dancing, dynamic pose
3. [trigger], realistic_body, sitting, photorealistic
4. [trigger], closeup, surprised expression
5. [trigger], full body, winter clothing, snowy background
```

Generate 5-10 images per prompt at different seeds. Verify consistency.

---

### 6.3 Expected Results

```
✓ 95%+ face/character consistency across generations
✓ Natural, realistic skin texture (no plastic)
✓ Works with multiple poses not in training
✓ Adapts to different lighting/backgrounds
✓ Compatible with style LoRAs
✓ Stable at LoRA strengths 0.6-1.0
✓ Follows new prompts effectively
✓ Anatomically correct proportions
```

**Target:** Production-ready LoRA for professional use

---

## 7. Troubleshooting Common Issues

### Issue 1: Plastic/AI-looking Skin

**Causes:**
- Training images had artifacts
- Insufficient real body images (need 30+)
- LoRA strength too high

**Fixes:**
- Increase real body ratio (40 real / 60 character)
- Lower LoRA strength (0.7 instead of 0.9)
- Add more varied real body shots
- Check source image quality

---

### Issue 2: Inconsistent Appearance

**Causes:**
- Character images not consistent
- Too few closeups (need 20+)
- Learning rate too high

**Fixes:**
- Regenerate character images with better consistency
- Add more portrait/face shots
- Lower learning rate (see model-specific docs)
- Use earlier checkpoint (epoch 5-6)

---

### Issue 3: Background/Lighting Bleed

**Causes:**
- Network rank too high (capturing unwanted details)
- Too many images with same background

**Fixes:**
- Reduce rank (try 8-12)
- Ensure varied backgrounds in dataset
- Caption backgrounds explicitly
- Add background variety

---

### Issue 4: Incorrect Body Proportions

**Causes:**
- Real body images don't match character
- Conflicting body shapes in dataset

**Fixes:**
- Curate body images to match character type
- Increase character full-body shots (40+)
- Adjust repeats ratio (try 5:1)

---

### Issue 5: Overfit (Memorizing Training)

**Symptoms:**
- Generated images identical to training
- No variation in outputs
- Can't follow new prompts

**Fixes:**
- Use earlier checkpoint (epoch 5-7)
- Lower learning rate for next training
- Add more dataset variety
- Reduce epochs

---

### Issue 6: Underfit (Not Learning)

**Symptoms:**
- Appearance doesn't match character
- Generic outputs
- Trigger word has no effect

**Fixes:**
- Increase learning rate (see model docs)
- Train more epochs (12-15)
- Verify captions include trigger word
- Check image quality

---

## 8. Advanced Techniques

### 8.1 Dataset Expansion

**For multi-outfit support:**
- Add 20-30 images per outfit
- Tag: `[trigger], red_dress, full body`
- Keeps core identity separate

**For style variants:**
- Add 15-20 images per style
- Tag: `[trigger], anime_style` or `[trigger], realistic_style`
- LoRA learns to switch

---

### 8.2 Hyperparameter Tuning

| Issue | Adjustment |
|-------|------------|
| Slightly underfit | +0.00005 to LR OR +2 epochs |
| Slightly overfit | -0.00005 from LR OR -2 epochs |
| Plastic skin | More real body images (40-50) |
| Face drift | More closeup portraits (30+) |
| Background bleed | Lower rank (8-12) |

---

### 8.3 Multi-Stage Training

**Advanced workflow:**
1. **Stage 1:** Train face only (20 portraits, 5000 steps)
2. **Stage 2:** Resume, add full dataset (70 character + 30 real)
3. **Result:** Stronger face priority, body as enhancement

---

## 9. Resources

**Ostris AI Toolkit:**
- GitHub: https://github.com/ostris/ai-toolkit
- Documentation: https://deepwiki.com/ostris/ai-toolkit

**Tools:**
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- WD14 Tagger: Auto-captioning
- Dataset-All-In-One: Caption management

**Model-Specific:**
- See `02a_qwen_specifics.md` for Qwen
- See `02b_flux_specifics.md` for Flux

---

## Final Notes

**Key Takeaway:** Dataset quality > quantity. 70 perfect character images + 30 matched body shots outperform 200 mixed-quality images every time.

**Remember:** Regularization images NOT needed. Two-folder strategy with different repeats achieves the same goal more effectively.

**Community wisdom:** These techniques represent tested best practices. Parameters evolve as tools/models update.

---

**Version:** v0.3
**Lines:** ~300
**Cross-references:** 02a (Qwen), 02b (Flux), 06 (Higgsfield)
