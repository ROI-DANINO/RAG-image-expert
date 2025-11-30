# Model-Specific Prompting Best Practices

> Optimized prompting strategies for different image generation models
>
> **Last updated:** 2025-11-28 (v0.3)
> **Models:** Nano Banana Pro, Higgsfield Soul ID, Flux.2, Qwen Image Edit 2509
> **Purpose:** Quick reference for model-specific prompting

**For detailed photorealistic prompting:** See `01_photorealistic_prompting_v03.md`
**For Instagram/casual prompting:** See `07_instagram_authentic_v03.md`

---

## Quick Model Comparison

| Feature | Nano Banana Pro | Higgsfield Soul ID | Flux.2 | Qwen Image Edit 2509 |
|---------|----------------|-------------------|--------|---------------------|
| **Optimal Length** | <25 words | 40-60 words | 30-100 words | 50-200 characters |
| **Best For** | Text rendering, concise queries | Character consistency | Complex scenes, photorealism | Multi-image editing |
| **Prompt Style** | Structured, concise | Natural with trigger word | Detailed natural language | Expressive, specific |
| **Special Feature** | Search grounding | Face consistency | Dual encoders | Structural guides |
| **Reference Images** | Supports, infers details | Primary use case | Handles well | Multi-image native |
| **Negative Prompts** | Not used | Sparingly | Use positive phrasing | Not emphasized |

---

## 1. Nano Banana Pro (Gemini 3 Pro Image)

### Key Strength
**Best-in-class text rendering** - correctly renders legible text in images (short taglines or long paragraphs)

### Optimal Prompt Length
**Under 25 words** (30% higher accuracy vs long prompts)

### Prompt Formula
```
[Subject + Adjectives] doing [Action] in [Location]. [Composition]. [Lighting]. [Style].
```

### Best Practices

| DO ✅ | DON'T ❌ |
|------|---------|
| Be specific with details | Use long, rambling prompts (>30 words) |
| Include camera angles | Use vague descriptions ("nice," "cool") |
| Leverage text rendering | Use overly complex multi-clause sentences |
| Specify exact text in quotes: `with text "COFFEE SHOP"` | Use negative prompts (not supported) |
| Use multilingual text (95%+ accuracy) | Leave text content ambiguous |

### Example Prompts

**Portrait:**
```
Professional headshot of businesswoman. Navy blue suit. Neutral background. Soft studio lighting. Corporate photography.
```

**Text-Heavy:**
```
Book cover with title "The Future of AI". Modern minimalist design. Blue and white color scheme. Professional graphic design.
```

**Product:**
```
Luxury watch on marble surface. Close-up macro. Dramatic lighting. High-end product photography.
```

---

## 2. Higgsfield Soul ID

### Key Strength
**Character consistency across generations** - maintains visual identity while varying everything else

### Training Requirements
- **Dataset:** 10-20 well-lit images showing face from different angles
- **Training time:** ~5 minutes
- **Cost:** ~$3 per training session
- **Consistency:** 90%+ face match with good training data

### Core Principle

> **The Soul ID handles character identity. Your prompt handles everything else.**

### Prompt Structure
```
[trigger_word], [outfit], [pose/action], [setting], [lighting], [mood/expression], [camera angle]
```

### What to Include vs Exclude

| Include ✅ | Exclude ❌ |
|-----------|-----------|
| Trigger word (`grace_char`) | Hair color, length, style |
| Outfits and clothing details | Eye color |
| Poses and actions | Skin tone |
| Settings and backgrounds | Facial structure or features |
| Lighting conditions | "A woman with long brown hair..." |
| Mood and expressions | Age or physical appearance details |
| Camera angles and framing | |

### Best Practices

| Practice | Reason |
|----------|--------|
| Use negative prompts sparingly | Target only common failures: `asymmetry`, `extra fingers`, `waxy skin` |
| Iterate in small steps | Change one variable per generation to learn effects |
| Save reliable combos as presets | Reuse working combinations as base templates |
| Track quality metrics | Monitor perceived quality, time-to-image, cost per usable output |

### Example Prompts

```
grace_char wearing casual white t-shirt, relaxed pose, coffee shop background, natural window light, gentle smile, waist-up shot
```

```
grace_char in athletic wear, running through park, morning sunlight, energetic expression, motion blur, side angle
```

```
grace_char in business suit, standing confidently, modern office, professional lighting, determined expression, full body shot
```

---

## 3. Flux.2

### Key Strength
**Natural language understanding** - dual text encoders (T5 + CLIP) for technical precision and hierarchical composition

### Optimal Prompt Length
**30-100 words** (detailed, specific prompts work best)

### Understanding Dual Encoders
- **CLIP encoder:** Provides broad guidance (overall vibe, style)
- **T5 encoder:** Adds detailed context (specific attributes, relationships)
- **Result:** Understands nuanced, detailed prompts better than single-encoder models

### Prompt Framework
```
[Technical framework]: [Main subject and action], [environmental effects], [special elements], [technical specifications], [conditions]
```

### Best Practices

| Practice | Example |
|----------|---------|
| **Be specific and detailed** | Include: subject, style, lighting, color palette, technical specs, atmospheric conditions |
| **Use technical specifications** | "shot on iPhone 16," "Canon EOS R5," "85mm f/1.4," "f/1.4" (shallow DOF) |
| **Use positive phrasing** | "Clean, minimalist background" NOT "No clutter, no mess" |
| **Organize hierarchically** | Describe foreground, middle ground, background separately |
| **Avoid prompt weights** | Use "with emphasis on..." NOT "(red dress:1.5)" |

### Example Prompts

**Portrait (Natural Language):**
```
A confident businesswoman in her 40s wearing a navy blue suit. She's sitting at a modern office desk with large windows behind showing a city skyline. Natural daylight coming from the left creates soft shadows on her face. She's looking directly at camera with a slight professional smile. Shot on Canon EOS R5 with 50mm f/1.8 lens. Clean, professional corporate photography style.
```

**Casual (Smartphone Style):**
```
Casual mirror selfie in gym changing room. Young woman in athletic wear holding phone at chest height. Harsh overhead fluorescent lighting creating flat illumination. Tiled wall background with lockers visible. Slightly awkward framing with head partially cut off. Shot on iPhone 15, authentic smartphone quality with subtle noise.
```

---

## 4. Qwen Image Edit 2509

### Key Strength
**Multi-image editing** - optimal with 1-3 input images, precise control over what to keep vs change

### Core Capabilities
- ✅ Multi-image editing (1-3 images)
- ✅ Combination types: person + person, person + product, person + scene
- ✅ Text replacement (fonts, colors, materials)
- ✅ Structural guides (depth maps, edge maps, keypoint poses, sketches)

### Optimal Prompt Length
**50-200 characters** (sweet spot: 80-150 characters)

### Prompt Formula
```
[What to keep/transfer] from [source], [what to change/add], [context/setting], [quality/style]
```

### Best Practices

| Practice | Example |
|----------|---------|
| **Be expressive and specific** | "Transfer the red dress from image 1 to the woman in image 2. Modern office setting. Professional lighting." |
| **Clearly specify what to keep vs change** | "KEEP: Face, hair. CHANGE: Outfit to red dress. MAINTAIN: Lighting consistency." |
| **Use industry-standard terminology** | "Seamless integration," "Consistent lighting," "Photorealistic rendering," "Studio quality" |
| **Reference well-known styles** | "Film noir style. High contrast black and white. Dramatic shadows." |
| **Break complex edits into steps** | Step 1: Major changes. Step 2: Detail optimization. Step 3: Background integration. |

### Multi-Image Editing Scenarios

| Scenario | Prompt Example |
|----------|----------------|
| **Character Consistency** | "Place grace_char from image 1 into the beach scene from image 2. Match lighting and atmosphere from scene. Natural integration with realistic shadows and reflections. Maintain character's appearance exactly." |
| **Outfit Transfer** | "Transfer outfit from image 2 onto character from image 1. Keep character's face, pose, and background from image 1. Ensure outfit fits naturally with proper draping and shadows. Photorealistic quality." |
| **Pose Matching** | "Make character from image 1 replicate the pose from image 2. Maintain character's appearance, outfit, and setting from image 1. Natural body proportions and realistic joint positions." |

---

## 5. Reference Image Workflows

### The Core Rule

> **When user provides reference images for character consistency:**
> **DO NOT describe character appearance.**

### What to Include vs Exclude

| Exclude ❌ (Reference Handles This) | Include ✅ (Prompt Handles This) |
|-----------------------------------|--------------------------------|
| Hair color, length, style | Trigger word (`grace_char`) |
| Eye color | Pose/action ("standing," "sitting") |
| Skin tone or ethnicity | Outfit/clothing ("wearing red dress") |
| Facial features | Background/setting ("urban street") |
| Age or physical appearance | Lighting ("golden hour") |
| "A woman with long brown hair..." | Mood/expression ("smiling") |
|  | Camera angle ("medium shot") |
|  | Style ("photorealistic") |

### Prompt Structure with References
```
[trigger_word], [pose/action], [outfit], [background], [lighting], [mood/expression], [camera angle], [style]
```

### Model-Specific Reference Workflows

| Model | Approach | Example |
|-------|----------|---------|
| **Nano Banana Pro** | Concise (<25 words) | "Business attire, confident pose, office setting, natural lighting, professional headshot." |
| **Higgsfield Soul ID** | Primary use case | "grace_char wearing casual white t-shirt and jeans, sitting in coffee shop, natural window light, relaxed smile, waist-up shot, lifestyle photography" |
| **Flux.2** | Detailed natural language | "Wearing an elegant black evening gown, standing in art gallery with paintings on walls, soft gallery lighting from ceiling, looking over shoulder at camera with mysterious expression, medium shot from slight angle, professional fashion photography style" |
| **Qwen Image Edit** | Multi-image native | "Place character from image 1 into beach scene from image 2. Match lighting and atmosphere. Natural integration with realistic shadows. Photorealistic quality." |

---

## 6. General Best Practices (Model Unspecified)

### Universal Prompt Structure
```
[Subject description], [action/pose], [clothing/appearance], [setting/background], [lighting], [mood/atmosphere], [camera angle], [style/quality]
```

### Core Principles

| Principle | Good Example | Bad Example |
|-----------|-------------|-------------|
| **Be Specific** | "Woman in her 30s with curly brown hair wearing blue jeans and white t-shirt" | "A woman in clothes" |
| **Describe Lighting** | "Soft window light from the left creating gentle shadows" | "Light" |
| **Specify Camera Angle** | "Medium shot from eye level" | (omitted) |
| **Include Style/Quality** | "Cinematic photography style, high quality, photorealistic" | "Nice photo" |

### Length Guidelines (When Model Unsure)

| Range | Word Count | Use Case |
|-------|-----------|----------|
| **Minimum** | 20-30 words | Include essentials only |
| **Optimal** | 40-60 words | Detailed but not overwhelming |
| **Maximum** | 100 words | Very detailed, complex scenes |

---

## Cross-References

| Topic | See Document |
|-------|--------------|
| **Photorealistic prompting** | 01_photorealistic_prompting_v03.md |
| **Instagram/casual prompting** | 07_instagram_authentic_v03.md |
| **Higgsfield → LoRA workflow** | 06_higgsfield_integration_v03.md |
| **Training dataset captioning** | 02_ostris_training_core.md, 02a_qwen_specifics.md |

---

**Version:** 3.0
**Last Updated:** 2025-11-28 (v0.3 Migration - Consolidated from 1,044 → 254 lines, table format)
**Part of:** AI Image Generation Helper Agent System
