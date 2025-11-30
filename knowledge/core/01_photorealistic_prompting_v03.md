# Photorealistic Prompting Guide

**Version:** v0.3
**Purpose:** Essential techniques for photorealistic AI image generation
**Models:** SD, SDXL, Flux, Qwen-Image
**Last Updated:** 2025-11-28

---

## 1. Core Principles

### 1.1 Essential Keywords

**Foundation layer** (use in every photorealistic prompt):
```
photorealistic, hyper-realistic, ultra-realistic
8K UHD, ultra HD, high resolution
professional photography, cinematic composition
```

**Purpose:** These keywords signal *photographic output*, not illustration/art.

**Example base:**
```
"photorealistic, 8K UHD, professional photography, [subject], [technical details]"
```

---

### 1.2 Camera Quick Reference

**Primary cameras** (choose based on aesthetic):

| Camera | Use Case | Character |
|--------|----------|-----------|
| iPhone 17 Pro Max | Authentic smartphone aesthetic | Casual, modern, natural colors |
| Canon EOS R5 | Professional portraits | Sharp, luxury feel |
| Sony A7IV | Hybrid photo/video | Balanced, vibrant |
| Nikon D850 | High-detail editorial | Ultra-sharp, technical |
| Arri Alexa | Cinematic scenes | Dramatic, soft, film-like |
| Generic DSLR | Unspecified professional | Neutral baseline |

**When to specify:**
- iPhone → Instagram/social media style
- Canon/Sony → Professional shoots
- Arri → Cinematic/dramatic scenes
- Generic DSLR → When camera doesn't matter

---

### 1.3 Lens Selection

| Lens | Effect | Best For |
|------|--------|----------|
| 50mm f/1.8 | Natural perspective, soft bokeh | General portraits, everyday |
| 85mm f/1.4 | Strong background blur | Professional headshots |
| 35mm f/2.0 | Wider view, natural | Lifestyle, environmental portraits |
| 24mm wide-angle | Dramatic perspective | Full-body, architecture |
| 100mm macro | Extreme close-up detail | Product, texture shots |

**Example:**
```
"shot on Canon EOS R5, 85mm lens, f/1.8 aperture"
```

---

### 1.4 Aperture Quick Guide

**Simple decision tree:**

- **f/1.4 - f/2.0** → Blurry background (portraits, subject isolation)
- **f/2.8 - f/5.6** → Balanced (lifestyle, casual portraits)
- **f/8 - f/11** → Everything sharp (groups, landscapes)

**Common mistake:** Using f/1.4 for group shots (people will be out of focus)

**Example phrases:**
```
"f/1.8 aperture, shallow depth of field, bokeh background"
"f/8 aperture, everything in focus"
```

---

### 1.5 ISO & Technical Settings

**ISO guidance:**
- ISO 100-200 → Bright scenes, cleanest image
- ISO 400-800 → Indoor, balanced
- ISO 1600+ → Low light, grain acceptable

**Shutter speed** (rarely needed in prompts):
- Only mention for motion blur/freeze effects
- Example: "1/1000 shutter speed, frozen motion"

**Prompt efficiency:** Camera + lens + aperture is usually sufficient.

---

## 2. Skin Texture & Realism (CRITICAL)

### 2.1 The Plastic Skin Problem

**Symptom:** Overly smooth, airbrushed, unrealistic skin
**Cause:** Model default behavior favors "beauty" over realism

**Solution:** Explicitly describe natural skin texture

---

### 2.2 Skin Texture Keywords (Priority Order)

**Tier 1: Essential** (use always for realism)
```
natural skin texture
visible pores
skin imperfections
realistic skin details
```

**Tier 2: Enhancement** (add for closeups/portraits)
```
fine lines
subtle wrinkles (where age-appropriate)
freckles (if character has them)
moles, beauty marks
uneven skin tone
```

**Tier 3: Specific Details** (optional, for extreme realism)
```
subsurface scattering (skin translucency)
peach fuzz (fine facial hair)
slight redness (nose, cheeks)
visible veins (if very fair skin)
```

---

### 2.3 Skin Texture by Detail Level

**Casual/Social Media** (Instagram, lifestyle):
```
"natural skin texture, visible pores, slight imperfections"
```

**Professional Portrait**:
```
"natural skin texture, visible pores, fine lines, subtle skin details,
realistic complexion, slight uneven tone"
```

**Ultra-Detailed Editorial**:
```
"hyper-realistic skin texture, visible pores, fine lines, peach fuzz,
subsurface scattering, natural skin imperfections, freckles, beauty marks,
slightly uneven tone, realistic complexion"
```

**Anti-pattern** (causes plastic skin):
```
❌ "flawless skin, perfect complexion, smooth skin"
```

---

### 2.4 Body Skin vs Face

**Face:** Needs most detail (visible in photos)
```
"natural facial skin texture, visible pores, realistic complexion"
```

**Body:** Can be less detailed unless closeup
```
"natural skin texture" (sufficient for full-body shots)
```

**Hands:** Often forgotten, add detail
```
"realistic hands, natural skin texture, visible knuckles"
```

---

## 3. Lighting Fundamentals

### 3.1 Basic Lighting Types

**Natural Light:**
```
"natural lighting, soft daylight" → General, flattering
"golden hour lighting, warm sunlight" → Sunset/sunrise glow
"overcast soft light, diffused daylight" → Even, no harsh shadows
"window light, side lighting" → Indoor natural
```

**Artificial Light:**
```
"studio lighting, soft key light" → Professional setup
"ring light, frontal lighting" → Beauty/makeup style
"neon lighting, colored lights" → Urban/nightlife
"candlelight, warm ambient" → Intimate, moody
```

---

### 3.2 Lighting Direction

| Direction | Effect | Use |
|-----------|--------|-----|
| Front lighting | Flat, even, minimal shadows | Beauty, corporate |
| Side lighting | Dramatic, emphasizes texture | Editorial, artistic |
| Back lighting | Rim light, silhouette | Dramatic, cinematic |
| Top lighting | Shadows under eyes/nose | Harsh, avoid unless intentional |
| Bottom lighting | Unnatural, horror | Special effects only |

**Example:**
```
"soft side lighting, natural window light, subtle shadows"
```

---

### 3.3 Advanced Lighting Concepts

**Rembrandt lighting:**
```
"Rembrandt lighting, triangle of light on cheek"
(45° side + above, creates signature triangle)
```

**Butterfly lighting:**
```
"butterfly lighting, shadow under nose"
(Frontal + above, flattering for beauty)
```

**Rim lighting:**
```
"rim lighting, backlit, glowing edges"
(Light from behind, outlines subject)
```

**Subsurface scattering (SSS):**
```
"subsurface scattering, skin translucency, soft glow"
(Light passing through skin, ultra-realistic)
```

---

## 4. Optimal Prompt Structure

### 4.1 The Formula

```
[QUALITY] + [SUBJECT] + [ACTION/POSE] + [SETTING] +
[LIGHTING] + [CAMERA] + [SKIN TEXTURE] + [STYLE MODIFIERS]
```

**Example breakdown:**
```
"photorealistic, 8K UHD, professional photography,
[young woman, 25 years old],
[sitting at cafe, relaxed pose],
[outdoor terrace, afternoon],
[natural lighting, soft daylight],
[shot on Canon EOS R5, 85mm f/1.8, shallow depth of field],
[natural skin texture, visible pores, realistic complexion],
[casual style, candid moment]"
```

---

### 4.2 Prompt Length by Model

**Qwen-Image (50-200 characters ideal):**
```
"photorealistic, woman at cafe, natural lighting,
shot on Canon R5, 85mm f/1.8, natural skin texture, 8K"
```

**Flux (30-100 words):**
```
"A photorealistic portrait of a young woman sitting at an outdoor cafe.
Natural lighting, golden hour glow. Shot on Canon EOS R5, 85mm lens,
f/1.8 aperture, shallow depth of field. Natural skin texture with
visible pores and realistic complexion. 8K UHD, professional photography."
```

**SD/SDXL (tag-based, concise):**
```
"photorealistic, woman, cafe, sitting, natural lighting, bokeh,
canon eos r5, 85mm, f1.8, natural skin texture, visible pores, 8k uhd"
```

---

### 4.3 Complete Examples

**Example 1: Casual Instagram Portrait**
```
"photorealistic, 8K UHD, young woman taking mirror selfie in bedroom,
holding iPhone 17 Pro Max, morning light through window, soft natural lighting,
casual outfit, messy hair, natural skin texture with visible pores,
slight imperfections, realistic complexion, arm visible at edge of frame,
candid authentic moment, Instagram aesthetic"
```

**Example 2: Professional Headshot**
```
"photorealistic professional portrait, 8K UHD, business woman, 25-30 years old,
confident expression, neutral background, studio lighting with soft key light,
shot on Canon EOS R5, 85mm f/2.0, shallow depth of field, bokeh background,
natural skin texture, visible pores, fine lines, realistic complexion,
professional photography, crisp details, ultra HD"
```

**Example 3: Lifestyle Editorial**
```
"photorealistic lifestyle photography, woman in coffee shop, reading book,
relaxed natural pose, window seat, soft afternoon daylight, warm atmosphere,
shot on Sony A7IV, 50mm f/1.8, shallow depth of field, natural skin texture,
realistic details, candid moment, editorial style, 8K UHD, professional composition"
```

---

### 4.4 Negative Prompts

**Essential negatives** (prevent common issues):
```
"illustration, painting, drawing, art, cartoon, anime, CGI, 3D render,
plastic skin, airbrushed, overprocessed, fake, unnatural, perfect skin,
flawless complexion, doll-like, mannequin, artificial"
```

**Quality negatives:**
```
"low quality, low resolution, blurry, out of focus, grainy, noisy,
distorted, deformed, ugly, bad anatomy, bad proportions,
extra limbs, mutated hands, poorly drawn"
```

**For Instagram/casual shots:**
```
"professional studio, posed, formal, stiff, overly edited,
beauty filter, smoothed skin"
```

---

## 5. Advanced Techniques

### 5.1 Subsurface Scattering (SSS)

**What it is:** Light passing through translucent skin, creating soft glow

**When to use:** Ultra-realistic close-ups, backlit portraits

**Keywords:**
```
"subsurface scattering, skin translucency, soft glow through skin,
realistic light interaction"
```

**Best with:** Backlit or rim lighting

**Example:**
```
"backlit portrait, subsurface scattering, skin translucency,
soft glow on ears and nose, ultra-realistic"
```

---

### 5.2 Materials & Textures

**Fabric realism:**
```
"cotton texture, fabric wrinkles, realistic clothing folds"
"denim texture, stitching details, worn fabric"
"silk material, smooth sheen, flowing fabric"
```

**Environment textures:**
```
"wood grain texture, natural materials"
"concrete surface, rough texture"
"leather details, worn patina"
```

**Principle:** Describe materials specifically, not just "realistic"

---

### 5.3 Atmosphere & Mood

**Atmospheric effects:**
```
"soft haze, atmospheric depth"
"light dust particles in air, sunbeams"
"slight mist, morning fog"
"lens flare, natural sun flare" (use sparingly)
```

**Color grading (optional):**
```
"warm color temperature, golden tones"
"cool color grading, blue tones"
"muted colors, desaturated"
"vibrant colors, saturated"
```

---

## 6. Model-Specific Tips

### 6.1 Qwen-Image

**Strengths:** Natural language, concise prompts
**Optimal length:** 50-200 characters

**Structure:**
```
"[quality], [subject], [setting], [camera], [skin texture], [lighting]"
```

**Magic suffix for realism:**
```
", natural skin texture, 8K"
```

**Example:**
```
"photorealistic woman at cafe, shot on Canon R5 85mm f/1.8,
natural skin texture visible pores, soft daylight, 8K UHD"
```

---

### 6.2 Flux

**Strengths:** Natural language descriptions, understands context
**Optimal length:** 30-100 words

**Structure:** Full sentences, descriptive
```
"A photorealistic [description]. [Setting details].
[Camera details]. [Lighting]. [Texture details]."
```

**Example:**
```
"A photorealistic portrait of a woman in her late 20s sitting in a
modern coffee shop. Afternoon natural light streams through large windows.
Shot on Canon EOS R5 with 50mm f/1.8 lens, creating soft bokeh.
Natural skin texture with visible pores and realistic complexion.
8K UHD quality."
```

---

### 6.3 SD/SDXL

**Strengths:** Tag-based, keywords
**Optimal:** Comma-separated tags

**Structure:**
```
"quality tags, subject, action, setting, camera tags,
lighting tags, texture tags"
```

**Example:**
```
"photorealistic, 8k uhd, professional photography, woman, sitting,
cafe, outdoor, canon eos r5, 85mm, f1.8, bokeh, natural lighting,
afternoon, natural skin texture, visible pores, realistic details"
```

---

### 6.4 Nano Banana Pro

**Strengths:** Ultra-fast generation, concise prompts, character consistency
**Optimal length:** <25 words (shorter than Qwen)

**Best for:**
- Quick character iterations
- Dataset generation for LoRA training
- Consistent character appearance
- When speed matters

**Prompt structure:**
```
"[subject], [pose], [outfit], [lighting], [quality]"
```

**Key principles:**
- Keep it SHORT (15-25 words max)
- Focus on pose and outfit variation
- Lighting keywords work well
- Natural language, not tags

**Examples:**
```
"woman, portrait, smiling, red dress, soft lighting, photorealistic"

"woman, full body, standing, blue jeans white shirt, natural light, high quality"

"woman, sitting, casual outfit, window light, realistic, detailed"
```

**For character consistency:**
- Use same basic description across prompts
- Vary: pose, outfit, lighting, background
- Don't over-describe facial features (model handles this)

**Magic keywords for realism:**
```
", photorealistic, natural lighting, high quality"
```

**Common mistakes:**
- ❌ Too long (>30 words) - model ignores extras
- ❌ Over-describing face - causes inconsistency
- ❌ Complex technical specs - keep simple

**Dataset generation workflow:**
```
1. Base prompt: "woman, [pose], [outfit], photorealistic"
2. Vary pose: portrait, full body, cowboy shot, sitting, standing
3. Vary outfit: red dress, casual, blue jeans, etc.
4. Keep lighting simple: natural light, soft lighting, studio lighting
5. Generate 40-70 images with these variations
```

**See also:** `02_ostris_training_core.md` for using Nano Banana in LoRA datasets

---

### 6.5 Higgsfield Soul ID

**Strengths:** Reference image guidance, character consistency, body realism
**Optimal:** Natural language + reference image

**Critical concept:** Reference image controls appearance, prompt controls everything else

**What to include in prompts:**
- ✅ Pose/action ("sitting", "standing", "walking")
- ✅ Outfit/clothing ("red dress", "blue jeans", "casual outfit")
- ✅ Setting/background ("coffee shop", "urban street", "bedroom")
- ✅ Lighting ("natural light", "soft lighting", "golden hour")
- ✅ Camera angle ("front view", "side view", "three-quarter")
- ✅ Mood/atmosphere ("candid", "relaxed", "confident")

**What to NEVER include:**
- ❌ Hair color/style (reference image handles this)
- ❌ Eye color (reference image handles this)
- ❌ Skin tone (reference image handles this)
- ❌ Facial features/age (reference image handles this)
- ❌ Body type (reference image handles this)

**Why?** Describing appearance conflicts with reference image, causes inconsistency

**Prompt structure:**
```
"[pose/action], [outfit], [setting], [lighting], [camera], photorealistic"
```

**Examples:**

**Good (describes action/context):**
```
"full body, standing, red dress, urban background, natural daylight,
front view, photorealistic, 8K"

"sitting at cafe table, casual outfit, reading book, soft window light,
three-quarter view, candid moment, high quality"

"portrait, smiling, looking at camera, soft studio lighting,
professional photography, natural skin texture"
```

**Bad (conflicts with reference):**
```
❌ "blonde woman with blue eyes, fair skin, full body, red dress..."
   (Don't describe what's in reference image)

❌ "young woman, 25 years old, long hair, standing..."
   (Reference already shows this)
```

**For LoRA training datasets:**
```
With trigger word + reference image:
"maya_char, full body, standing, red dress, urban background, natural light"
"maya_char, portrait, sitting, casual outfit, soft lighting, front view"
"maya_char, realistic_body, photorealistic, detailed skin texture, natural"
```

**Reference image + prompt workflow:**
1. Upload reference image (establishes character identity)
2. Prompt focuses on: NEW pose, NEW outfit, NEW setting, NEW lighting
3. Reference maintains: face, hair, body, skin tone, age
4. Result: Same character, infinite scenarios

**Integration with LoRA:**
- Generate 40+ images with Soul ID using varied prompts
- Each image = same character, different scenario
- Use these for LoRA training (see `02_ostris_training_core.md`)
- Trained LoRA = character without needing reference image anymore

**Lighting tips for Soul ID:**
- "natural daylight" - even, flattering
- "soft window light" - side lighting, depth
- "golden hour" - warm, cinematic
- "studio lighting" - professional, controlled
- "overcast soft light" - no harsh shadows

**Camera angle keywords:**
- "front view" - straight on
- "three-quarter view" - 45° angle
- "side view" - profile
- "low angle" - camera below subject
- "high angle" - camera above subject

**See also:** `06_higgsfield_integration_v03.md` for complete Soul ID workflow

---

## 7. Common Mistakes & Fixes

### 7.1 Plastic Skin
**Problem:** "perfect skin, flawless complexion"
**Fix:** "natural skin texture, visible pores, slight imperfections"

### 7.2 Unrealistic Lighting
**Problem:** "dramatic lighting" (too vague)
**Fix:** "soft side lighting, natural window light, subtle shadows"

### 7.3 Generic Camera
**Problem:** "professional camera" (not specific enough)
**Fix:** "shot on Canon EOS R5, 85mm f/1.8"

### 7.4 Over-Specification
**Problem:** Listing every technical detail
**Fix:** Camera + lens + aperture + lighting = sufficient

### 7.5 Contradictions
**Problem:** "f/1.4 aperture, everything in focus"
**Fix:** "f/8 aperture, large depth of field" OR "f/1.4, shallow DOF"

---

## 8. Quick Reference

### Minimum Viable Photorealistic Prompt
```
"photorealistic, [subject], [action/setting],
shot on [camera] [lens], natural skin texture,
[lighting], 8K UHD"
```

### Standard Quality Prompt (200 chars)
```
"photorealistic, 8K UHD, professional photography, [subject], [pose/action],
[setting], [lighting], shot on [camera], [lens], [aperture],
natural skin texture, visible pores, realistic details"
```

### Ultra-Detailed Prompt (400+ chars)
```
"photorealistic, ultra-realistic, 8K UHD, professional photography,
[detailed subject description], [specific pose/action], [environment details],
[specific lighting setup], shot on [camera body], [specific lens],
[aperture] aperture, [DOF description], natural skin texture,
visible pores, fine lines, realistic complexion, [atmospheric effects],
[color grading], crisp details, high resolution, RAW photo quality"
```

---

## 9. Workflow Integration

**For use with LoRA training** (see 02_ostris_training_core.md):
- Keep prompts consistent across dataset
- Focus on lighting/pose variation, not prompt variation
- Always include skin texture keywords

**For use with Soul ID** (see 06_higgsfield_integration.md):
- Reference image handles appearance
- Prompt focuses on: pose, setting, lighting, camera
- NEVER describe: hair, face, skin tone (reference handles this)

**For Instagram-style** (see 07_instagram_authentic_v03.md):
- Use iPhone camera references
- Specify POV (selfie vs third-person)
- Add authentic imperfections

---

**End of Guide**
**Lines:** ~710
**Version:** v0.3
**Models Covered:** Qwen, Flux, SD/SDXL, Nano Banana Pro, Higgsfield Soul ID
**Cross-references:** 02, 06, 07
