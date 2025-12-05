# Knowledge Base Guide

**RAG Image Expert - Comprehensive Knowledge Documentation**
**Version:** 0.7.0
**Last Updated:** 2025-12-04

---

## Overview

The RAG Image Expert knowledge base contains **18 markdown files** organized into two categories:
- **Technical Knowledge** (`knowledge/core/`) - 12 files
- **Business Knowledge** (`knowledge/business/`) - 6 files

**Total Coverage:** 729 indexed chunks for semantic search

---

## Knowledge Structure

```
knowledge/
├── core/                    # Technical prompting, training, integration
│   ├── 01_photorealistic_prompting_v03.md
│   ├── 02_ostris_training_core.md
│   ├── 02a_qwen_specifics.md
│   ├── 02b_flux_specifics.md
│   ├── 03_qwen_quick_reference.md
│   ├── 03b_flux_fal_quick_ref.md
│   ├── 04_troubleshooting_v03.md
│   ├── 06_higgsfield_integration_v03.md
│   ├── 07_instagram_authentic_v03.md
│   ├── 08_model_specific_best_practices.md
│   ├── 09_fal_ai_integration.md
│   └── 10_content_safety_guidelines.md
│
└── business/                # Creator economy, platform strategies
    ├── 11_fanvue_startup_guide.md
    ├── 12_fanvue_content_schedule.md
    ├── 13_fanvue_pricing_strategy.md
    ├── 14_onlyfans_content_strategy.md
    ├── 15_boudoir_pose_research.md
    └── 16_adult_content_creation.md
```

---

## Technical Knowledge (`knowledge/core/`)

### 01_photorealistic_prompting_v03.md (v0.4)
**Purpose:** Essential techniques for photorealistic AI image generation
**Topics:**
- Core principles (foundation keywords, camera selection, lens types)
- Aperture guide (f-stops for different scenarios)
- ISO & technical settings
- Skin texture & realism layers
- Lighting techniques (natural, studio, cinematic)
- Composition rules (rule of thirds, leading lines)
- POV selection (first-person, over-shoulder, third-person)
- Model-specific guidance (Nano Banana Pro, Qwen, Flux)

**Key Update (v0.4):** Fixed Nano Banana Pro prompt length guidance - removed incorrect 25-word limit

**Use Cases:**
- "How do I make realistic skin texture?"
- "What camera settings should I use for Instagram-style photos?"
- "What's the optimal prompt length for Nano Banana Pro?"

---

### 02_ostris_training_core.md
**Purpose:** Foundational LoRA training principles
**Topics:**
- Ostris training methodology
- Core LoRA concepts
- Training parameters (rank, alpha, learning rate)
- Dataset preparation
- Training loop understanding

**Use Cases:**
- "What are the basics of LoRA training?"
- "How do I prepare a dataset for training?"

---

### 02a_qwen_specifics.md (v0.4)
**Purpose:** Qwen LoRA training parameters and specifics
**Topics:**
- Qwen model architecture
- Recommended training parameters
- Learning rate guidance (conservative approach)
- Sampler settings (flowmatch)
- Text encoder training (experimental)
- Failure examples and fixes

**Key Update (v0.4):** Softened absolute language, added "When to Experiment" sections

**Use Cases:**
- "How do I train a Qwen LoRA?"
- "What learning rate should I use for Qwen?"

---

### 02b_flux_specifics.md (v0.4)
**Purpose:** Flux LoRA training parameters and specifics
**Topics:**
- Flux model variants (schnell, dev, pro)
- Rank/alpha recommendations by use case
- Learning rate ranges
- Prompt length guidance (flexible 30-100+ words)
- Sampler settings
- Failure examples

**Key Update (v0.4):** Added flexibility, removed rigid constraints

**Use Cases:**
- "How do I train a Flux LoRA?"
- "What's the difference between Flux schnell and pro?"

---

### 03_qwen_quick_reference.md
**Purpose:** Quick lookup tables for Qwen parameters
**Format:** Compact reference tables
**Use Cases:** Fast parameter lookups

---

### 03b_flux_fal_quick_ref.md (NEW)
**Purpose:** Quick reference for Flux models on Fal.ai
**Topics:**
- Model comparison table (schnell, dev, pro, realism)
- Speed vs quality tradeoffs
- Cost estimates
- Parameter recommendations
- Prompting tips for Fal.ai

**Use Cases:**
- "Which Flux model should I use on Fal.ai?"
- "What's the difference between flux-schnell and flux-pro?"

---

### 04_troubleshooting_v03.md (v0.4)
**Purpose:** Problem diagnosis and solutions
**Topics:**
- Quality issues (blurry, artifacts, color problems)
- Anatomy failures
- Composition problems
- LoRA training failures
- API service issues (Fal.ai, Replicate)

**Key Update (v0.4):** Added API service troubleshooting section

**Use Cases:**
- "Why are my generated images blurry?"
- "How do I fix anatomy issues in AI images?"
- "Fal.ai API returns 401 error - what's wrong?"

---

### 06_higgsfield_integration_v03.md
**Purpose:** Higgsfield workflow integration
**Topics:**
- Higgsfield setup
- Workflow automation
- Integration with existing tools

**Use Cases:**
- "How do I use Higgsfield with this system?"

---

### 07_instagram_authentic_v03.md
**Purpose:** Instagram authenticity framework
**Topics:**
- POV framework (authenticity techniques)
- Imperfection layers (realistic flaws)
- Social media aesthetics
- Authentic vs studio look
- Model-specific Instagram approaches

**Use Cases:**
- "How do I make AI images look more authentic for Instagram?"
- "What imperfections should I add for realism?"

---

### 08_model_specific_best_practices.md (v4.0)
**Purpose:** Model comparison and selection guide
**Topics:**
- Model comparison table (Nano Banana Pro, Qwen, Flux, SDXL)
- Optimal prompt lengths (all models)
- Strengths and weaknesses
- Use case recommendations
- Fal.ai service integration

**Key Update (v4.0):** Added Fal.ai section, corrected Nano Banana Pro guidance

**Use Cases:**
- "Which model should I use for my project?"
- "Fal.ai vs Replicate - which is better?"

---

### 09_fal_ai_integration.md (NEW)
**Purpose:** Comprehensive Fal.ai service guide
**Topics:**
- What is Fal.ai? (advantages, speed, cost)
- Configuration (API key setup)
- Available models and parameters
- LoRA generation and training
- When to use Fal.ai

**Use Cases:**
- "How do I configure Fal.ai?"
- "How do I use LoRAs with Fal.ai?"
- "What models are available on Fal.ai?"

---

### 10_content_safety_guidelines.md (NEW)
**Purpose:** SFW/NSFW generation guidance
**Topics:**
- Terms of Service compliance
- NSFW spectrum (artistic nudity, implied, explicit)
- Prompting strategies for borderline content
- Artistic framing techniques
- Model-specific behavior
- Responsible generation disclaimer

**Use Cases:**
- "How do I generate artistic nude content safely?"
- "What are the content policy limits for different models?"
- "How do I frame prompts for suggestive content?"

---

## Business Knowledge (`knowledge/business/`)

### 11_fanvue_startup_guide.md (NEW)
**Purpose:** Complete startup guide for FanVue AI creators
**Topics:**
- Week 1 content schedule
- Core strategy (80/20 rule: feed vs PPV)
- Day-by-day posting guide
- AI generation strategy (25 images/day quota)
- Sample prompts for each day
- Launch promotion tactics

**Use Cases:**
- "How do I start on FanVue as an AI creator?"
- "What should I post in my first week?"
- "How do I use FanVue's 25 image/day limit?"

---

### 12_fanvue_content_schedule.md (NEW)
**Purpose:** Week 1 content and generation schedule
**Topics:**
- Daily posting plan
- Content mix (feed vs PPV)
- Generation planning (2-3 days ahead)
- Engagement tactics (polls, Q&A)

**Use Cases:**
- "What's a good content schedule for FanVue?"

---

### 13_fanvue_pricing_strategy.md (NEW)
**Purpose:** Subscription and PPV pricing menu
**Topics:**
- Subscription tiers ($14.99/month, bundles)
- PPV photo set pricing ($10-$25)
- Custom content menu ($50-$150+)
- Tip menu and rewards
- Launch promotions (50% off first month)

**Use Cases:**
- "How should I price PPV content on FanVue?"
- "What's a good subscription price for a new creator?"
- "How do I structure custom content pricing?"

---

### 14_onlyfans_content_strategy.md (NEW)
**Purpose:** FanVue & OnlyFans AI content strategy
**Topics:**
- Platform comparison
- Content differentiation
- Cross-promotion strategies
- PPV vs subscription balance

**Use Cases:**
- "Should I use FanVue or OnlyFans?"
- "How do I cross-promote between platforms?"

---

### 15_boudoir_pose_research.md (NEW)
**Purpose:** AI prompting for boudoir poses
**Topics:**
- Core boudoir principles (curves, arching, S-curves)
- Top 8 boudoir poses for AI generation
- Prompt keywords for each pose
- Why each pose works (aesthetic reasoning)
- Hand placement and body positioning

**Use Cases:**
- "What are effective boudoir poses for AI images?"
- "How do I prompt for flattering poses?"
- "What keywords should I use for boudoir photography?"

---

### 16_adult_content_creation.md (NEW)
**Purpose:** OnlyFans content creation research findings
**Topics:**
- Content ideas and themes
- Engagement strategies
- Subscriber retention
- Platform-specific best practices

**Use Cases:**
- "What content performs well on OnlyFans?"

---

## How RAG Retrieval Works

### Query Routing

The RAG system automatically routes queries to the most relevant knowledge:

**Technical Queries** → `knowledge/core/`
- Keywords: prompting, training, LoRA, camera, lighting, model, Flux, Qwen, troubleshooting, Fal.ai
- Example: "How do I train a Flux LoRA?"

**Business Queries** → `knowledge/business/`
- Keywords: pricing, PPV, FanVue, OnlyFans, subscription, content schedule, poses, creator
- Example: "How should I price PPV content?"

**Cross-Domain Queries** → Both directories
- Example: "How do I generate boudoir images?" (technical + business)

### Search Process

1. **Query Embedding:** User query → 384-dimensional vector
2. **Similarity Search:** Cosine similarity across 729 chunks
3. **Top-K Retrieval:** Returns top 3-5 most relevant chunks
4. **Context Building:** Formats chunks with scores and sections
5. **LLM Enhancement:** Grok uses context to generate response

---

## Adding New Knowledge

### For Technical Knowledge

1. Create `.md` file in `knowledge/core/`
2. Follow naming convention: `##_descriptive_name.md`
3. Include:
   - Version number in header
   - Purpose statement
   - Clear section headers
   - Examples and code blocks
   - Cross-references to related files

4. Rebuild embeddings:
```bash
npm run build-index
```

### For Business Knowledge

1. Create `.md` file in `knowledge/business/`
2. Same conventions as technical knowledge
3. Focus on:
   - Actionable strategies
   - Pricing/monetization
   - Platform-specific tactics
   - Creator economy insights

### Best Practices

- **Use markdown headers** (H1-H6) for section awareness
- **Include tables** for parameter references (preserved as complete chunks)
- **Add examples** with code blocks
- **Cross-reference** related files
- **Keep chunks focused** (~500 characters per concept)
- **Update version numbers** when making changes

---

## Research Documentation

Research and analysis documents are stored in `/docs/research/` and are **NOT** indexed by RAG:

- `Final Knowledge Base Enrichment Summary.md`
- `RAG Image Expert_ Repository Analysis and Knowledge Enrichment Plan.md`
- `Knowledge Base Enrichment Summary.md`
- `Knowledge Base Flexibility Analysis & Recommendations.md`
- `flux_official_findings.md`
- `qwen_official_findings.md`
- `Official Nano Banana Pro Prompting Guidelines - Key Findings.md`
- `Proposed New Imperfection Layers.md`
- `social_media_imperfection_research.md`
- `strictness_analysis.txt`
- `detailed_issues.txt`

These files provide context for knowledge development but are not used in RAG queries.

---

## Version History

### v0.7.0 (2025-12-04) - Knowledge Base Enhancement
- ✅ Updated 6 core files to v0.4 (Nano Banana Pro corrections, language flexibility)
- ✅ Added 3 new core files (Fal.ai, content safety)
- ✅ Added 6 business files (FanVue/OnlyFans strategies)
- ✅ Moved research docs to `/docs/research/`
- ✅ Rebuilt embeddings: 125→729 chunks (+483%)

### v0.6.0 (2025-12-04) - Image Generation Integration
- Service integrations (Fal.ai, Replicate, HuggingFace)

### v0.5.1 - Database Foundation
- Session persistence, feedback system

### v0.3 - Initial Knowledge Base
- 9 core files, basic RAG implementation

---

## Quick Reference: Common Queries

| Query Type | Example | Target Files |
|------------|---------|--------------|
| Prompting Basics | "How do I write photorealistic prompts?" | 01, 07, 08 |
| Model Selection | "Which model for Instagram style?" | 08, 07, 01 |
| LoRA Training | "How do I train a Flux LoRA?" | 02b, 02 |
| Troubleshooting | "Why are my images blurry?" | 04 |
| Fal.ai Usage | "How do I use Flux on Fal.ai?" | 09, 03b, 08 |
| Content Safety | "How do I generate artistic nude content?" | 10 |
| FanVue Startup | "How do I start on FanVue?" | 11, 12, 13 |
| Pricing Strategy | "How much should I charge for PPV?" | 13 |
| Pose Prompting | "What are good boudoir poses?" | 15 |

---

## Support & Contribution

**Issues:** Report at https://github.com/ROI-DANINO/RAG-image-expert/issues
**Contributions:** See CONTRIBUTING.md for guidelines
**Documentation:** README.md, USER_GUIDE.md, ROADMAP.md

---

**Last Updated:** 2025-12-04
**Version:** 0.7.0
