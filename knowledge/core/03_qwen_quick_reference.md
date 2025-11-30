# Qwen LoRA Training - Quick Reference Card

## Dataset Ratios (100 images total)

```
70 nano banana (40 repeats) → 2,800 steps
30 real body   (20 repeats) →   600 steps
                    Total:     3,400 steps
```

**Nano banana breakdown:**
- 20 face closeups
- 30 full body
- 20 body variety

**Real body:** Match body type to nano banana!

---

## Training Parameters

```yaml
Network Rank: 16
Learning Rate: 0.0002 (2e-4)
Epochs: 10
Optimizer: adamw8bit
Quantize: int8
Batch Size: 1
Gradient Accumulation: 4
EMA: true (0.999 decay)
```

---

## Captioning Templates

**Nano banana:**
```
maya_char, [framing], [pose], [details]
```

**Real body:**
```
maya_char, realistic_body, [body part], [details]
```

---

## ComfyUI Usage

**LoRA Strength:**
- Standard: 0.8-0.9
- Maximum: 1.0
- Subtle: 0.6-0.7

**Prompts:**
```
Character only: maya_char, portrait, high quality
Body realism:   maya_char, realistic_body, photorealistic
```

---

## Red Flags

❌ Loss plateau <1000 steps = underfit
❌ Identical samples = overfit
❌ Color saturation = LR too high
❌ Plastic skin = need more real body images

---

## Best Checkpoints

Test epochs: **5, 6, 7, 8, 9, 10**

Usually best: **Epochs 5-7**

---

## Quick Fixes

| Problem | Solution |
|---------|----------|
| Plastic skin | ↑ real body images (40-50) |
| Face drift | ↑ nano portraits (30+) |
| Overfit | Use earlier epoch (5-7) |
| Underfit | ↑ LR to 0.0003 OR +2 epochs |

---

## Remember

- **NO regularization images**
- **Quality > Quantity**
- **Body must match between datasets**
- **Trigger word must be unique**
