# Higgsfield to LoRA Integration

> Bridge `/generate-dataset` prompts to trained character LoRA
>
> **Last updated:** 2025-11-28 (v0.3)
> **Related:** 02_ostris_training_core.md, 02a_qwen_specifics.md (training parameters)
> **Purpose:** Complete Higgsfield Soul ID → LoRA workflow

---

## Complete Pipeline

```
Character Design → /generate-dataset → Higgsfield Generation → Dataset Prep → Qwen LoRA Training → Testing → Deployment
```

**Timeline:** 2-4 days from prompts to trained LoRA
**Requirements:** Higgsfield Soul ID access, RunPod or local GPU (48GB+ VRAM)
**Output:** Production-ready character LoRA with photorealistic results

---

## Part 1: Understanding Your Dataset Output

### What You Have After `/generate-dataset`

| Component | Details |
|-----------|---------|
| **Prompt count** | 40 detailed prompts |
| **Distribution** | Front (30%), 3/4 (30%), Side (20%), Back/Over-shoulder (20%) |
| **Diversity** | Multiple lighting, outfits, backgrounds, expressions |
| **Quality metrics** | All prompts verified for completeness and variety |

### Dataset Structure

```
GRACE_40_PROMPT_DATASET/
├── DOMAIN 1: FRONT ANGLES (12 prompts)
├── DOMAIN 2: 3/4 ANGLES (12 prompts)
├── DOMAIN 3: SIDE PROFILES (8 prompts)
└── DOMAIN 4: BACK & OVER-SHOULDER (8 prompts)
```

### Key Characteristics

✅ **Expression diversity:** Happy (30%), Peaceful (25%), Confident (20%), Contemplative (15%), Playful (10%)
✅ **Background variety:** 15+ unique settings (indoor/outdoor/neutral mix)
✅ **Outfit changes:** 15+ different clothing combinations
✅ **Lighting variety:** 8-10 different lighting conditions

---

## Part 2: Higgsfield Soul ID Generation

### Setup

1. **Access Higgsfield Soul ID:**
   - Platform: https://higgsfield.ai/soul-id (or your deployment)
   - Required: Account with generation credits
   - Model: Soul ID character generation engine

2. **Preparation:**
   - Have all 40 prompts ready (copy to clipboard-friendly format)
   - Decide on character trigger word (e.g., `grace_char`, `ohwx_woman`)
   - Prepare output folder structure

---

### Generation Strategy

**Recommended Approach:** Batch generation with quality control

```
Workflow:
1. Generate Domain 1 (12 front angles) → Review quality
2. If quality good → Continue with Domain 2
3. Generate Domains 2-4 (28 remaining)
4. Quality check: 10% manual review
5. Regenerate any low-quality images
```

---

### Generation Settings

**Higgsfield Soul ID Recommended:**

| Setting | Value | Reason |
|---------|-------|--------|
| **Resolution** | 1024×1024 minimum | Required for Qwen training |
| **Quality** | High/Maximum | Ensures clean features |
| **Seed** | Varied (don't fix) | Want diversity |
| **Batch size** | 1-4 images at a time | Manageable review |
| **Iterations** | 1 per prompt | Regenerate if needed |

---

### Quality Checklist

For each generated image, verify:

- ✅ Face is consistent across all images
- ✅ No AI artifacts (extra fingers, deformed features)
- ✅ Good lighting (matches prompt)
- ✅ Sharp, in-focus
- ✅ No plastic/smooth skin (should look natural)
- ✅ Background matches prompt description
- ✅ Outfit/pose matches prompt

**Acceptable Regeneration Rate:** 5-10% (4-8 images need regeneration is normal)

---

## Part 3: Dataset Organization

### Folder Structure

**For Qwen LoRA training** (see `02_ostris_training_core.md:71` for full details):

```
grace_lora_project/
├── dataset/
│   ├── 40_grace_char/              # Main character folder (40 repeats/epoch)
│   │   ├── img_001.jpg             # Front angle, casual café
│   │   ├── img_001.txt             # Caption file
│   │   └── ... (70 nano banana images total)
│   │
│   └── 20_grace_char_realbody/     # Body realism folder (20 repeats/epoch)
│       ├── body_001.jpg
│       ├── body_001.txt
│       └── ... (30 real body images total)
│
├── models/                          # Output LoRAs
└── logs/                            # Training logs
```

**Folder Naming Convention:** `{repeats}_{trigger_word}/` (e.g., `40_grace_char/`)

---

### File Naming

**Systematic naming:**
```
img_001.jpg → Front angle, prompt #1
img_002.jpg → Front angle, prompt #2
...
img_012.jpg → Front angle, prompt #12
img_013.jpg → 3/4 angle, prompt #1
...
img_040.jpg → Back/over-shoulder, prompt #8
```

**Keep a mapping file:** `prompt_mapping.txt`
```
img_001.jpg = DOMAIN 1, Prompt 1: Golden hour sunlight, grace_char wearing...
img_002.jpg = DOMAIN 1, Prompt 2: Natural window light, grace_char in...
...
```

---

## Part 4: Captioning Strategy

### Why Captioning Matters

Captions teach the LoRA:
- **What to learn:** Character identity (trigger word)
- **What to ignore:** Backgrounds, lighting, outfits (these should vary)
- **What to control:** Body type, posture, framing

---

### Captioning Approach: Edited from Prompts

**Start with your generation prompt, then edit:**

#### Example Transformation

**Original Prompt (from `/generate-dataset`):**
```
Golden hour sunlight creating warm backlight, grace_char wearing soft beige cashmere sweater and high-waisted jeans, waist-up shot in modern minimalist café, warm wooden furniture and plants softly blurred in background, looking at camera with genuine warm smile, eyes bright and engaged, joyful content mood, shot on Canon EOS R5, 85mm f/1.8, natural bokeh, professional lifestyle photography
```

**Edited Caption (for .txt file):**
```
grace_char, waist-up shot, wearing beige sweater and jeans, modern café background, looking at camera with genuine smile, joyful mood, natural lighting
```

#### What to Remove vs Keep

| Remove ❌ | Keep ✅ |
|----------|---------|
| Specific lighting details (golden hour, backlight) | Trigger word (`grace_char`) |
| Technical camera details (Canon EOS R5, 85mm f/1.8) | Framing (`waist-up shot`) |
| Detailed background description (wooden furniture, plants) | Outfit description |
| Professional photography keywords | General background type |
| Overly specific details | Expression and mood |
| | Pose description |

---

### Caption Template

**Standard format:**
```
[trigger_word], [framing], [clothing], [background type], [expression], [pose/action]
```

**Examples by angle:**

| Angle | Example Caption |
|-------|----------------|
| **Front** | `grace_char, close-up portrait, black turtleneck, indoor setting, serene expression, looking at camera` |
| **3/4** | `grace_char, half-body shot, wearing casual jeans and white shirt, outdoor park, playful smile, glancing over shoulder` |
| **Side** | `grace_char, profile view, athletic wear, gym environment, focused expression, side lighting` |
| **Back** | `grace_char, over-shoulder shot, flowing dress, beach background, looking back at camera, windswept hair` |

---

### Automated Captioning Tool: Joy Caption

**Using Joy Caption Alpha Two:**

1. **Install & Run:**
   ```bash
   python joy_caption.py --input_dir dataset/40_grace_char/ --output_format txt
   ```

2. **Manual Editing (Required!):**
   - Add trigger word to start of every caption
   - Remove character-specific features (hair color, eye color - these are fixed)
   - Keep clothing, background, pose descriptions
   - Simplify overly detailed descriptions

3. **Example Edit:**
   ```
   Joy Caption output:
   "A woman with long brown hair and blue eyes wearing a red dress..."

   Your edit:
   "grace_char wearing red dress, full body shot, urban street, confident pose, looking at camera"
   ```

---

## Part 5: Training Configuration

**For complete training parameters and setup, see:**
- `02_ostris_training_core.md` - Full training workflow
- `02a_qwen_specifics.md:22` - Qwen configuration (rank 16, LR 0.0002, etc.)
- `02b_flux_specifics.md:22` - Flux configuration (if using Flux instead)

**Quick reference for Higgsfield → Qwen workflow:**

| Parameter | Value | Reference |
|-----------|-------|-----------|
| Network rank | 16 | 02a_qwen_specifics.md:22 |
| Learning rate | 0.0002 | 02a_qwen_specifics.md:22 |
| Epochs | 10 | 02a_qwen_specifics.md:22 |
| Dataset | 70 nano + 30 body | 02_ostris_training_core.md:60 |
| Repeats | 40:1 and 20:1 | 02_ostris_training_core.md:71 |

---

## Part 6: Testing & Validation

### Testing Strategy

**Test each saved checkpoint** (epochs 5, 6, 7, 8, 9, 10):

#### Load in ComfyUI

| Setting | Value |
|---------|-------|
| Base model | Qwen-Image-Edit-2509 |
| LoRA | grace_char_lora_epoch5.safetensors |
| LoRA strength | Start with 0.8 |

#### Test Prompts (5 per checkpoint)

```
# Test 1: Basic consistency
grace_char, portrait, smiling, soft lighting, high quality

# Test 2: New outfit
grace_char, full body, wearing red cocktail dress, elegant pose

# Test 3: Different setting
grace_char, outdoor, forest background, natural daylight, contemplative

# Test 4: Action
grace_char, dancing, dynamic movement, joyful expression

# Test 5: Style variation
grace_char, artistic portrait, dramatic lighting, cinematic mood
```

#### Evaluation Criteria

- Face consistency (90%+ match across generations)
- Natural skin texture (no plastic look)
- Follows prompt (new outfits/backgrounds work)
- No artifacts at strength 0.7-1.0

---

### Quality Benchmarks

**Good LoRA should:**

- ✅ Consistent face across 10+ generations
- ✅ Works at LoRA strengths 0.6-1.0
- ✅ Adapts to new prompts (not just training poses)
- ✅ Natural skin texture (no plastic)
- ✅ Body proportions realistic
- ✅ Compatible with style LoRAs

---

### Common Issues → Quick Fix

| Issue | Cause | Solution | Reference |
|-------|-------|----------|-----------|
| **Plastic skin** | Insufficient variety | Use epoch 5-6 instead of 10 | 04_troubleshooting_v03.md:69 |
| **Face drift** | Inconsistent training images | Regenerate dataset with tighter consistency | 04_troubleshooting_v03.md:91 |
| **Overfit** | Too many epochs | Use epoch 5-7, lower LR next time | 04_troubleshooting_v03.md:153 |
| **Underfit** | Not enough training | Use epoch 10, or increase LR to 0.0003 | 04_troubleshooting_v03.md:177 |

---

## Part 7: Production Deployment

### Selecting Best Checkpoint

**Decision Matrix:**

| Epoch | Characteristics | Use Case |
|-------|----------------|----------|
| **5** | Good balance, slightly underfit | Versatility, new prompts |
| **6-7** | Sweet spot for most characters | **RECOMMENDED** |
| **8-9** | High fidelity, risk of slight overfit | Maximum consistency |
| **10** | Maximum training, check for overfit | Test first |

**Test each with 20+ generations** across varied prompts.

---

### Documentation Template

```markdown
# Grace Character LoRA v1.0

## Trigger Word
grace_char

## Recommended Settings
- LoRA Strength: 0.8-0.9
- Sampler: flowmatch
- Steps: 28
- Guidance: 3.5

## Example Prompts
[Include 5-10 tested prompts with images]

## Compatible Style LoRAs
- Boreal (strength 0.6-0.7)
- [Others you've tested]

## Known Limitations
- Works best for [use case]
- May need adjustment for [edge case]
```

---

### Sharing (Optional)

**Civitai Upload:**
- Model file: `grace_char_lora_epoch7.safetensors`
- Preview images: 10-15 varied examples
- Trigger word: Clearly documented
- Training info: Dataset size, parameters used

---

## Part 8: Iteration & Improvement

### When to Retrain

Consider retraining if:
- Face consistency <85%
- Plastic skin appearance
- Can't follow new prompts
- Artifacts at normal strengths

---

### Improvement Strategies

**For next version:**

| Area | Current | Improvement |
|------|---------|-------------|
| **Dataset Quality** | 40 Higgsfield + 30 body | 70 Higgsfield + 40 body |
| **Expression variety** | 5 types | 8-10 types |
| **Edge cases** | Basic angles | Add profile, extreme back views |
| **Training LR** | 0.0002 (if overfit) | Lower to 0.0001 |
| **Training epochs** | 10 (if overfit) | Reduce to 8 |
| **Network rank** | 16 (if underfit) | Increase to 32 |

---

### Advanced: Multi-Outfit Training

To support multiple signature outfits:

```
# Add outfit tags to captions
grace_char, red_dress, evening wear, elegant
grace_char, casual_jeans, everyday look, relaxed
grace_char, business_suit, professional attire, confident
```

Train with 20-30 images per outfit.

---

## Part 9: Complete Workflow Checklist

### Phase 1: Generation (Day 1)

- [ ] Run `/generate-dataset` command
- [ ] Review 40 prompts for quality
- [ ] Generate images via Higgsfield Soul ID
- [ ] Quality check: Regenerate 5-10% if needed
- [ ] Organize into folder structure

### Phase 2: Preparation (Day 1-2)

- [ ] Create caption files (.txt)
- [ ] Edit captions (add trigger word, remove specifics)
- [ ] Verify all 40 pairs (image + caption)
- [ ] Optional: Add 30 real body images
- [ ] Upload to RunPod

### Phase 3: Training (Day 2)

- [ ] Setup Ostris AI Toolkit (see 02_ostris_training_core.md)
- [ ] Create config file (see 02a_qwen_specifics.md:22)
- [ ] Start training (4-6 hours)
- [ ] Monitor progress (loss curve, samples)
- [ ] Save all checkpoints

### Phase 4: Testing (Day 3)

- [ ] Load each checkpoint in ComfyUI
- [ ] Generate 5 test images per checkpoint
- [ ] Evaluate quality metrics
- [ ] Select best checkpoint
- [ ] Generate 20+ varied examples

### Phase 5: Production (Day 4)

- [ ] Document usage (trigger, settings, examples)
- [ ] Test with style LoRAs
- [ ] Create preview images
- [ ] Optional: Upload to Civitai
- [ ] Archive training data

---

## Key Success Factors

1. **Quality over quantity** (40 excellent prompts >> 100 mediocre)
2. **Diverse dataset** (expressions, backgrounds, lighting)
3. **Proper captioning** (trigger word + variety)
4. **Community-tested parameters** (rank 16, LR 0.0002 - see 02a)
5. **Checkpoint testing** (epoch 5-7 usually best)

---

## Cross-References

| Topic | See Document |
|-------|--------------|
| **Training parameters** | 02_ostris_training_core.md, 02a_qwen_specifics.md |
| **Folder structure** | 02_ostris_training_core.md:71 |
| **Dataset ratios** | 02_ostris_training_core.md:60 |
| **Timeline** | 02_ostris_training_core.md:11 |
| **Troubleshooting** | 04_troubleshooting_v03.md |
| **Quick reference** | 03_qwen_quick_reference.md |

---

**Version:** 3.0
**Last Updated:** 2025-11-28 (v0.3 Migration - Removed training parameter overlap, added cross-references to 02/02a)
**Part of:** AI Image Generation Helper Agent System
