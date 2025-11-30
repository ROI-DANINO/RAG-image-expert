# LoRA Training Troubleshooting - Decision Tree

> Quick diagnostic flowchart and fix tables
>
> **Last updated:** 2025-11-28 (v0.3)
> **Related:** 02_ostris_training_core.md, 02a_qwen_specifics.md

---

## Quick Diagnostic Flowchart

```
┌─ Training won't start → [Pre-Training Validation](#pre-training-validation)
│
├─ Training crashes → [Training Crashes/Errors](#training-crasheserrors)
│
├─ Training completes but:
│  ├─ Plastic/fake skin → [Plastic Skin](#issue-plastic-skin)
│  ├─ Face inconsistent → [Face Inconsistency](#issue-face-inconsistency)
│  ├─ Same images repeat → [Overfit](#issue-overfit)
│  ├─ Doesn't learn character → [Underfit](#issue-underfit)
│  ├─ Wrong body type → [Body Proportions](#issue-body-proportions)
│  └─ Background won't change → [Background Bleed](#issue-background-bleed)
│
└─ Training running but:
   ├─ Loss stuck → [Loss Curve Analysis](#loss-curve-analysis)
   ├─ Loss spikes → [Loss Curve Analysis](#loss-curve-analysis)
   └─ Too slow/fast → [During Training Diagnostics](#during-training-diagnostics)
```

---

## Pre-Training Validation

### Dataset Verification
| Check | Requirement |
|-------|-------------|
| Image count | Exactly 100 images (70 nano + 30 body) |
| Caption files | All images have matching .txt files |
| Nano quality | No artifacts, no plastic skin |
| Body match | Real body images match nano body type |
| Resolution | All images ≥1024px |
| Filenames | No spaces, no special characters |
| Duplicates | No duplicate images |

### Caption Validation
| Check | Requirement |
|-------|-------------|
| Trigger word | Every caption starts with trigger (e.g., `maya_char`) |
| Body tag | Body images include `realistic_body` |
| Conciseness | Short captions, describe what's visible |
| Uniqueness | Trigger word not in base model vocab |
| Consistency | No contradictory descriptions |

### Folder Structure
| Check | Requirement |
|-------|-------------|
| Folder names | `40_maya_char` / `20_maya_char_realbody` |
| Repeats correct | 40 and 20 match dataset strategy |
| File locations | All images in correct folders |
| Permissions | Folders readable by training script |
| No extras | No backup/temp files |

### Configuration File (Qwen-specific)
| Check | Requirement |
|-------|-------------|
| Model path | `Qwen/Qwen-Image-Edit-2509` |
| Dataset paths | Point to correct folders |
| Network rank | `16` (Qwen) |
| Learning rate | `0.0002` (2e-4) |
| Epochs | `10` |
| Quantize | `true`, `int8` |
| Trigger word | Matches captions |
| Save path | Exists, writable |

---

## During Training Diagnostics

### First 100 Steps
- [ ] Training starts without errors
- [ ] Loss begins decreasing
- [ ] VRAM usage stable (~40GB for 48GB GPU)
- [ ] GPU utilization >90%
- [ ] No CUDA OOM errors
- [ ] Checkpoint saving works

### After Epoch 1 (340 steps for Qwen)
- [ ] Loss decreased from start
- [ ] Sample images show some character features
- [ ] No extreme artifacts
- [ ] Checkpoint saved successfully
- [ ] Training time ~25-35 min per epoch

### Mid-Training (Epoch 5)
- [ ] Loss continues decreasing (not plateaued)
- [ ] Sample images clearly show character
- [ ] Face consistency visible
- [ ] No color saturation
- [ ] No identical repetitive outputs

---

## Loss Curve Analysis

### Good Training Pattern
```
Steps 0-500:    Loss 0.15 → 0.08  (rapid decrease)
Steps 500-1500: Loss 0.08 → 0.05  (steady decrease)
Steps 1500+:    Loss 0.05 → 0.03  (slow convergence)
```

### Problem Patterns → Quick Fix

| Pattern | Symptom | Cause | Fix |
|---------|---------|-------|-----|
| **Plateau Early** | Loss stuck at 0.10 after 500 steps | Underfit | Increase LR to 0.0003 OR add 2 epochs |
| **Spike Erratically** | Loss jumps up/down | LR too high | Reduce LR to 0.0001 |
| **No Decrease** | Loss stays at 0.15+ throughout | Dataset/config error | Check dataset, captions, config |
| **Too Fast** | Loss 0.15 → 0.01 in 200 steps | Overfit risk | Lower LR, reduce epochs to 8 |

---

## Issue: Plastic Skin

### Symptoms
- Smooth, unrealistic, CG-like skin
- No visible pores or texture
- Overly perfect complexion
- "Instagram filter" appearance

### Quick Fix Table

| Diagnosis | Solution | Priority |
|-----------|----------|----------|
| Real body images <30 | Increase to 40-50 images | **HIGH** |
| Nano has artifacts | Regenerate nano without artifacts | **HIGH** |
| LoRA strength too high | Lower to 0.7 instead of 0.9 | Medium |
| Using late checkpoint | Test epoch 5 instead of 10 | Medium |
| Dataset ratio wrong | Retrain with 60 nano / 40 body | Low |

### Test
Generate 5 images at strength 0.8. Skin should have visible pores/texture.

---

## Issue: Face Inconsistency

### Symptoms
- Face changes between generations
- Different eye colors/shapes
- Hair style varies unexpectedly
- Character not recognizable

### Quick Fix Table

| Diagnosis | Solution | Priority |
|-----------|----------|----------|
| Nano faces not same person | Regenerate nano (all same face) | **HIGH** |
| Face closeups <20 | Increase to 30+ portraits | **HIGH** |
| LoRA strength too low | Increase to 0.9-1.0 | Medium |
| Using early checkpoint | Test epoch 8-10 (more training) | Medium |
| Caption inconsistency | Describe face features same way | Low |

### Test
Generate 10 images at strength 1.0. Face should be same person 90%+ of the time.

---

## Issue: Background Bleed

### Symptoms
- Specific backgrounds appear in all generations
- Can't change scene/environment easily
- "Studio look" always present
- Lighting style from training persists

### Quick Fix Table

| Diagnosis | Solution | Priority |
|-----------|----------|----------|
| Network rank too high | Lower to 8-12 instead of 16 | **HIGH** |
| Same background in dataset | Add 50+ diverse backgrounds | **HIGH** |
| Captions mention backgrounds | Caption backgrounds explicitly | Medium |
| Testing at high strength | Lower LoRA strength to 0.6-0.7 | Low |

### Test
Generate 5 images with prompts: "urban street", "beach", "forest", "cafe", "bedroom". All should work.

---

## Issue: Overfit

### Symptoms
- Generated images identical to training
- No variation in outputs
- Same poses/angles always
- Can't follow new prompts

### Quick Fix Table

| Diagnosis | Solution | Priority |
|-----------|----------|----------|
| Using late checkpoint | Use epoch 5-7 instead of 10 | **HIGH** |
| LR too high | Retrain with LR 0.0001 | **HIGH** |
| Too many epochs | Reduce to 8 epochs | Medium |
| Low dataset variety | Increase diversity in training images | Medium |

### Test
Generate 10 images with prompts NOT in training. Should produce new poses/outfits/backgrounds.

---

## Issue: Underfit

### Symptoms
- Face doesn't look like character
- Generic/random outputs
- Trigger word has weak effect
- Looks like base model

### Quick Fix Table

| Diagnosis | Solution | Priority |
|-----------|----------|----------|
| LR too low | Increase LR to 0.0003 | **HIGH** |
| Not enough epochs | Train 12-15 epochs instead of 10 | **HIGH** |
| Trigger word missing | Verify trigger in every caption | **HIGH** |
| Using early checkpoint | Use epoch 10 instead of 5 | Medium |
| Low-quality images | Replace with high-res images | Medium |
| Not enough images | Increase to 120-150 total | Low |

### Test
Generate 5 images at strength 1.0. Should show clear character features.

---

## Issue: Body Proportions

### Symptoms
- Body too thin/thick vs training
- Height incorrect
- Body and face seem mismatched

### Quick Fix Table

| Diagnosis | Solution | Priority |
|-----------|----------|----------|
| Nano/body mismatch | Replace real body images (match type) | **HIGH** |
| Not enough nano full-body | Increase to 40+ full-body shots | **HIGH** |
| Repeats ratio wrong | Adjust to 5:1 or 6:1 (nano:body) | Medium |
| Using late checkpoint | Test epoch 5 (less body influence) | Low |

### Test
Generate 5 full-body images. Body proportions should match character consistently.

---

## Training Crashes/Errors

### CUDA Out of Memory

| Solution | Command/Setting |
|----------|-----------------|
| Enable quantization | `quantize: true`, `int8` in config |
| Reduce batch size | `batch_size: 1` |
| Enable gradient checkpointing | `gradient_checkpointing: true` |
| Reduce gradient accumulation | `gradient_accumulation: 2` (from 4) |
| Close other GPU apps | Kill other processes using GPU |

---

### Invalid Configuration

| Error Type | Check |
|------------|-------|
| YAML syntax | No tabs, proper indentation |
| File paths | All paths exist and accessible |
| Model name | Exact: `Qwen/Qwen-Image-Edit-2509` |
| Trigger word | String in quotes: `"maya_char"` |
| Number values | Not in quotes: `lr: 0.0002` (not `"0.0002"`) |

---

### Missing Dependencies

```bash
# Activate environment
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt

# Update torch
pip install --upgrade torch torchvision

# Verify CUDA version matches torch
python -c "import torch; print(torch.cuda.is_available())"
```

---

### Checkpoint Not Saving

| Check | Fix |
|-------|-----|
| Output folder exists | Create folder, verify writable |
| Disk space | Ensure 50GB+ free space |
| save_every setting | Set to `340` (one epoch for Qwen) |
| Filesystem errors | Check logs for permission errors |

---

## Quality Assurance

### Pre-Release Checklist

| Test | Target |
|------|--------|
| Checkpoints tested | 5 checkpoints (epochs 5-10) |
| Test images generated | 50+ total |
| LoRA strengths tested | 5 different (0.6-1.0) |
| Varied prompts | 10+ different scenarios |
| Face consistency | 90%+ match |
| Body realism | No plastic skin |
| Pose variety | 10+ different poses work |
| Style compatibility | Works with 3+ style LoRAs |

### Performance Benchmarks

| Metric | Target |
|--------|--------|
| **Face Consistency** | 95%+ across generations |
| **Body Realism** | Natural skin texture visible |
| **Pose Flexibility** | 20+ different poses work |
| **Style Compatibility** | Works with 3+ style LoRAs |
| **Prompt Adherence** | 90%+ of instructions followed |
| **Strength Range** | Usable from 0.6 to 1.0 |
| **Generation Speed** | <30sec per image |

---

## Emergency Fixes

### Training Completely Failed

1. **Verify dataset integrity:**
   - All 100 images present
   - All captions present
   - No corrupted files

2. **Test with minimal config:**
   - 10 images only
   - 2 epochs
   - Default parameters

3. **Build back up:**
   - Gradually add images
   - Increase epochs
   - Adjust parameters

---

### Results Completely Unusable

1. **Go back to basics:**
   - Regenerate entire nano banana dataset
   - Verify face consistency manually
   - Recollect body images (exact match)
   - Recaption everything

2. **Start fresh training:**
   - Lower learning rate (0.0001)
   - Fewer epochs (5-8)
   - Monitor closely
   - Test each checkpoint

---

## Support Checklist

### When Asking for Help, Provide:

- [ ] Full training config (yaml file)
- [ ] Loss curve screenshot
- [ ] Sample generations (good and bad)
- [ ] System specs (GPU, VRAM)
- [ ] Dataset size and composition
- [ ] Error messages (full text)
- [ ] Training logs (relevant sections)

### Self-Debugging Checklist:

1. [ ] Read error message carefully
2. [ ] Check configuration against this guide
3. [ ] Verify dataset quality manually
4. [ ] Test with default parameters
5. [ ] Review community examples

---

**Remember:** 80% of issues are dataset quality problems. Fix the dataset first, not the parameters.

---

**Version:** 3.0
**Last Updated:** 2025-11-28 (v0.3 Migration - Decision tree format, 454 → 300 lines)
