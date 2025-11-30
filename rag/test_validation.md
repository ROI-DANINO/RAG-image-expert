# RAG Test Validation - 20 Baseline Queries

> Test suite for validating RAG system performance with v0.3 knowledge base
>
> **Version:** 0.3
> **Last updated:** 2025-11-28
> **Purpose:** Map test queries → expected patterns → expected retrievals

---

## Overview

This document maps each of the 20 baseline test queries to:
1. **Expected agent pattern** triggered
2. **Primary knowledge files** to retrieve
3. **Success criteria** for each query

**Source:** `SYSTEM/efficiency-metrics.json` - test_queries array

---

## Test Query Matrix

| # | Query | Pattern | Primary Files | Secondary Files | Success Criteria |
|---|-------|---------|---------------|-----------------|------------------|
| 1 | How do I make skin look realistic for Instagram? | Pattern 2 (POV) | 07 | 01 | Retrieves POV framework + imperfection layers |
| 2 | What camera for iPhone-style posts? | Pattern 2 (POV) | 07 | 01 | Retrieves selfie POV markers |
| 3 | My LoRA has plastic skin, how to fix? | Pattern 4 (Workflow) | 04, 02 | 02a | Retrieves troubleshooting decision tree |
| 4 | Create bedroom mirror selfie prompt | Pattern 2 (POV) | 07 | agent.md | Retrieves Selfie POV template |
| 5 | Qwen training parameters for character LoRA | Pattern 4 (Workflow) | 02a | 02 | Retrieves Qwen config (rank 16, LR 0.0002) |
| 6 | How to caption images for training? | Pattern 3 (Reference) | 02, 06 | 08 | Retrieves captioning strategy |
| 7 | Higgsfield vs direct generation? | Pattern 1 (Model) | 08, 06 | - | Retrieves model comparison table |
| 8 | Third-person or selfie for coffee shop? | Pattern 2 (POV) | 07, agent.md | - | Retrieves scenario → POV mapping |
| 9 | Flux vs Qwen for Instagram? | Pattern 1 (Model) | 08, 02b, 02a | - | Retrieves model comparison |
| 10 | How long does LoRA training take? | Pattern 4 (Workflow) | 02, agent.md | - | Retrieves Complete Pipeline Timeline |
| 11 | Best LoRA strength to use? | General | 03, 02a | - | Retrieves quick reference |
| 12 | How to test checkpoints? | Pattern 4 (Workflow) | 02, agent.md | 04 | Retrieves Phase 4 (Testing) |
| 13 | Morning in bed photo - what POV? | Pattern 2 (POV) | 07, agent.md | - | Retrieves Selfie POV scenario |
| 14 | Reference image with LoRA - how to prompt? | Pattern 3 (Reference) | 08, agent.md | 02 | Retrieves Reference Image Rules |
| 15 | Troubleshoot face inconsistency | Pattern 4 (Workflow) | 04 | 02 | Retrieves troubleshooting decision tree |
| 16 | Dataset size for character LoRA? | Pattern 4 (Workflow) | 02, 06 | - | Retrieves dataset composition (70+30) |
| 17 | Anti-aesthetic vs photorealistic - when? | Pattern 2 (POV) | 07 | 01 | Retrieves "When to Use This Guide" |
| 18 | Model-specific prompting for Nano Banana | Pattern 1 (Model) | 08 | 01 | Retrieves Nano Banana section |
| 19 | Complete workflow idea to Instagram post | Pattern 4 (Workflow) | 02, 06, agent.md | 07 | Retrieves complete timeline + Higgsfield workflow |
| 20 | POV for gym changing room photo? | Pattern 2 (POV) | 07, agent.md | - | Retrieves Selfie POV gym scenario |

---

## Detailed Query Breakdown

### Query 1: "How do I make skin look realistic for Instagram?"

**Pattern triggered:** Pattern 2 (POV Decision Framework)

**Expected retrieval chain:**
1. **Primary:** `07_instagram_authentic_v03.md`
   - Section 0: POV Decision Framework
   - Section 2: Imperfection Layer System (Layer B: Dirty Optics for texture)
2. **Secondary:** `01_photorealistic_prompting_v03.md`
   - Skin texture section (150+ lines)

**Success criteria:**
- ✅ Retrieves POV framework (context: Instagram authenticity)
- ✅ Retrieves imperfection layers (add texture, avoid "too perfect")
- ✅ Cross-references to 01 for detailed skin prompting
- ⏱️ Query time <400ms
- 📊 Relevance score >8.8/10

---

### Query 2: "What camera for iPhone-style posts?"

**Pattern triggered:** Pattern 2 (POV Decision Framework)

**Expected retrieval chain:**
1. **Primary:** `07_instagram_authentic_v03.md`
   - Selfie POV visual markers: `holding iPhone [model]`, `phone case visible`
   - Layer E: The Phone Prop
2. **Secondary:** `01_photorealistic_prompting_v03.md`
   - Camera quick reference

**Success criteria:**
- ✅ Retrieves Selfie POV markers (iPhone-specific keywords)
- ✅ Retrieves phone prop layer
- ⏱️ Query time <400ms

---

### Query 3: "My LoRA has plastic skin, how to fix?"

**Pattern triggered:** Pattern 4 (Fixed User Workflow) - Troubleshooting

**Expected retrieval chain:**
1. **Primary:** `04_troubleshooting_v03.md`
   - Issue: Plastic Skin (line 69)
   - Quick Fix Table: Diagnosis → Solution
2. **Secondary:** `02_ostris_training_core.md`
   - Dataset composition (increase body images)
3. **Tertiary:** `02a_qwen_specifics.md`
   - Consider using earlier checkpoint

**Success criteria:**
- ✅ Retrieves plastic skin troubleshooting section
- ✅ Provides quick fix table (increase body images 40-50, use epoch 5-6)
- ✅ Cross-references to dataset strategy
- ⏱️ Query time <400ms

---

### Query 4: "Create bedroom mirror selfie prompt"

**Pattern triggered:** Pattern 2 (POV Decision Framework)

**Expected retrieval chain:**
1. **Primary:** `07_instagram_authentic_v03.md`
   - Scenario → POV mapping: "Bedroom lingerie check → Selfie (mirror)"
   - Scenario Templates: Bedroom Lingerie/Intimate Check
2. **Secondary:** `agent.md`
   - Pattern 2: Selfie POV required keywords

**Success criteria:**
- ✅ Retrieves correct POV (Selfie, mirror)
- ✅ Provides template with required markers (holding iPhone, dirty mirror, flash, messy bedroom)
- ✅ Suggests imperfection layers (A, B, E)
- ⏱️ Query time <400ms

---

### Query 5: "Qwen training parameters for character LoRA"

**Pattern triggered:** Pattern 4 (Fixed User Workflow) - Training config

**Expected retrieval chain:**
1. **Primary:** `02a_qwen_specifics.md`
   - Network Architecture (rank 16, line 22)
   - Learning rate (0.0002)
   - Epochs (10)
2. **Secondary:** `02_ostris_training_core.md`
   - Dataset composition context

**Success criteria:**
- ✅ Retrieves exact Qwen config (rank 16, LR 0.0002, epochs 10)
- ✅ Provides YAML config snippet
- ✅ Explains why these parameters (vs Flux)
- ⏱️ Query time <400ms

---

### Query 6: "How to caption images for training?"

**Pattern triggered:** Pattern 3 (Reference Image Rules) + Pattern 4 (Workflow)

**Expected retrieval chain:**
1. **Primary:** `02_ostris_training_core.md`
   - Section 2: Captioning Strategy (line 150)
   - Character image captions (70 files)
   - Real body captions (30 files)
2. **Secondary:** `06_higgsfield_integration_v03.md`
   - Captioning Approach: Edited from Prompts
3. **Tertiary:** `08_model_specific_best_practices.md`
   - Reference Image Rules (what to exclude)

**Success criteria:**
- ✅ Retrieves caption templates
- ✅ Explains trigger word usage
- ✅ Provides examples (character vs body captions)
- ⏱️ Query time <400ms

---

### Query 7: "Higgsfield vs direct generation?"

**Pattern triggered:** Pattern 1 (Model Inference Protocol)

**Expected retrieval chain:**
1. **Primary:** `08_model_specific_best_practices.md`
   - Quick Model Comparison table
   - Higgsfield Soul ID section
2. **Secondary:** `06_higgsfield_integration_v03.md`
   - What is Soul ID? (character consistency)

**Success criteria:**
- ✅ Retrieves model comparison
- ✅ Explains Higgsfield strength (character consistency, 90%+ face match)
- ✅ Compares to direct generation (face drift risk)
- ⏱️ Query time <400ms

---

### Query 8: "Third-person or selfie for coffee shop?"

**Pattern triggered:** Pattern 2 (POV Decision Framework)

**Expected retrieval chain:**
1. **Primary:** `07_instagram_authentic_v03.md`
   - Scenario → POV Mapping table
   - "Coffee shop casual → Third-person"
2. **Secondary:** `agent.md`
   - Pattern 2: Perspective 2 (Third-Person)

**Success criteria:**
- ✅ Retrieves correct POV (Third-person, social setting)
- ✅ Provides reasoning ("friend present")
- ✅ Suggests visual markers (`shot by friend`, `NO phone visible`)
- ⏱️ Query time <400ms

---

### Query 9: "Flux vs Qwen for Instagram?"

**Pattern triggered:** Pattern 1 (Model Inference Protocol) + Pattern 2 (POV context)

**Expected retrieval chain:**
1. **Primary:** `08_model_specific_best_practices.md`
   - Model comparison table
2. **Secondary:** `02b_flux_specifics.md` + `02a_qwen_specifics.md`
   - Training parameter differences
3. **Tertiary:** `07_instagram_authentic_v03.md`
   - Instagram context (both can work, depends on use case)

**Success criteria:**
- ✅ Compares models (Flux: complex scenes, natural language; Qwen: multi-image editing)
- ✅ Notes Instagram suitability (both work, but Qwen better for character LoRAs)
- ⏱️ Query time <400ms

---

### Query 10: "How long does LoRA training take?"

**Pattern triggered:** Pattern 4 (Fixed User Workflow)

**Expected retrieval chain:**
1. **Primary:** `02_ostris_training_core.md`
   - Complete Pipeline Timeline (line 11)
   - Phase Overview (2-4 days total)
2. **Secondary:** `agent.md`
   - Pattern 4: Fixed User Workflow timeline

**Success criteria:**
- ✅ Retrieves timeline (7-12 hours hands-on, 2-4 days total)
- ✅ Breaks down by phase (Dataset 2-4h, Prep 1-2h, Training 4-6h, Testing 1-2h)
- ✅ Notes first-time vs experienced difference
- ⏱️ Query time <400ms

---

### Query 11: "Best LoRA strength to use?"

**Pattern triggered:** General (no specific pattern)

**Expected retrieval chain:**
1. **Primary:** `03_qwen_quick_reference.md`
   - ComfyUI Usage: LoRA Strength
   - Standard: 0.8-0.9, Maximum: 1.0, Subtle: 0.6-0.7
2. **Secondary:** `02a_qwen_specifics.md`
   - Testing recommendations

**Success criteria:**
- ✅ Retrieves strength recommendations (0.8-0.9 standard)
- ✅ Provides range for different use cases
- ⏱️ Query time <400ms

---

### Query 12: "How to test checkpoints?"

**Pattern triggered:** Pattern 4 (Fixed User Workflow) - Phase 4

**Expected retrieval chain:**
1. **Primary:** `02_ostris_training_core.md`
   - Phase 4: Testing & Selection (Day 3)
2. **Secondary:** `agent.md`
   - Pattern 4: Testing & Selection template
3. **Tertiary:** `04_troubleshooting_v03.md`
   - Quality benchmarks

**Success criteria:**
- ✅ Retrieves Phase 4 testing procedure
- ✅ Provides test prompt templates (5 test types)
- ✅ Lists quality metrics (face consistency 90%+, no plastic skin, etc.)
- ⏱️ Query time <400ms

---

### Query 13: "Morning in bed photo - what POV?"

**Pattern triggered:** Pattern 2 (POV Decision Framework)

**Expected retrieval chain:**
1. **Primary:** `07_instagram_authentic_v03.md`
   - Scenario → POV Mapping: "Morning in bed, waking up → Selfie"
   - Scenario Templates: Morning in Bed (Waking Up)
2. **Secondary:** `agent.md`
   - Pattern 2: Selfie POV for intimate moments

**Success criteria:**
- ✅ Retrieves correct POV (Selfie - intimate, solo moment)
- ✅ Provides template (messy hair, rumpled sheets, natural window light, etc.)
- ⏱️ Query time <400ms

---

### Query 14: "Reference image with LoRA - how to prompt?"

**Pattern triggered:** Pattern 3 (Reference Image Rules)

**Expected retrieval chain:**
1. **Primary:** `08_model_specific_best_practices.md`
   - Section 5: Reference Image Workflows (line 221)
   - The Core Rule
   - Exclusion/Inclusion lists
2. **Secondary:** `agent.md`
   - Pattern 3: Reference Image Rules
3. **Tertiary:** `02_ostris_training_core.md`
   - Captioning for training (related)

**Success criteria:**
- ✅ Retrieves The Core Rule ("reference handles identity, prompt handles everything else")
- ✅ Lists what to exclude (hair color, eye color, etc.)
- ✅ Lists what to include (trigger word, outfit, pose, setting, etc.)
- ✅ Provides example (bad vs good)
- ⏱️ Query time <400ms

---

### Query 15: "Troubleshoot face inconsistency"

**Pattern triggered:** Pattern 4 (Fixed User Workflow) - Troubleshooting

**Expected retrieval chain:**
1. **Primary:** `04_troubleshooting_v03.md`
   - Issue: Face Inconsistency (line 91)
   - Quick Fix Table
2. **Secondary:** `02_ostris_training_core.md`
   - Dataset quality requirements

**Success criteria:**
- ✅ Retrieves face inconsistency troubleshooting
- ✅ Provides quick fix (regenerate dataset, increase face closeups to 30+, use later checkpoint 8-10)
- ⏱️ Query time <400ms

---

### Query 16: "Dataset size for character LoRA?"

**Pattern triggered:** Pattern 4 (Fixed User Workflow) - Dataset construction

**Expected retrieval chain:**
1. **Primary:** `02_ostris_training_core.md`
   - Section 1.2: Dataset Composition
   - Standard Character LoRA: 100 Images (70 character + 30 body)
2. **Secondary:** `06_higgsfield_integration_v03.md`
   - Dataset requirements

**Success criteria:**
- ✅ Retrieves dataset size (100 images: 70 character + 30 body)
- ✅ Explains breakdown (20 face, 30 full-body, 20 variety)
- ⏱️ Query time <400ms

---

### Query 17: "Anti-aesthetic vs photorealistic - when?"

**Pattern triggered:** Pattern 2 (POV) - Guide selection

**Expected retrieval chain:**
1. **Primary:** `07_instagram_authentic_v03.md`
   - Section 11: When to Use This Guide
   - Decision tree
2. **Secondary:** `01_photorealistic_prompting_v03.md`
   - When to use photorealistic

**Success criteria:**
- ✅ Retrieves decision tree
- ✅ Explains anti-aesthetic (social media, casual, "real person" vibe) vs photorealistic (professional, product photography)
- ⏱️ Query time <400ms

---

### Query 18: "Model-specific prompting for Nano Banana"

**Pattern triggered:** Pattern 1 (Model Inference Protocol)

**Expected retrieval chain:**
1. **Primary:** `08_model_specific_best_practices.md`
   - Section 1: Nano Banana Pro
   - Optimal prompt length (<25 words)
   - Best practices table
2. **Secondary:** `01_photorealistic_prompting_v03.md`
   - Section 6.4: Nano Banana Pro model tips

**Success criteria:**
- ✅ Retrieves Nano Banana section
- ✅ Provides prompt formula and best practices
- ✅ Highlights text rendering strength
- ⏱️ Query time <400ms

---

### Query 19: "Complete workflow idea to Instagram post"

**Pattern triggered:** Pattern 4 (Fixed User Workflow) - Full pipeline

**Expected retrieval chain:**
1. **Primary:** `02_ostris_training_core.md`
   - Complete Pipeline Timeline (4 phases)
2. **Secondary:** `06_higgsfield_integration_v03.md`
   - Higgsfield → LoRA workflow
3. **Tertiary:** `agent.md`
   - Pattern 4: All 4 phases
4. **Quaternary:** `07_instagram_authentic_v03.md`
   - Instagram posting (final step)

**Success criteria:**
- ✅ Retrieves complete workflow (idea → dataset → training → testing → Instagram post)
- ✅ Provides timeline (2-4 days)
- ✅ Links all 4 phases
- ⏱️ Query time <500ms (complex query, acceptable)

---

### Query 20: "POV for gym changing room photo?"

**Pattern triggered:** Pattern 2 (POV Decision Framework)

**Expected retrieval chain:**
1. **Primary:** `07_instagram_authentic_v03.md`
   - Scenario → POV Mapping: "Gym changing room → Selfie (mirror)"
   - Scenario Templates: Gym Changing Room
2. **Secondary:** `agent.md`
   - Pattern 2: Selfie POV for private spaces

**Success criteria:**
- ✅ Retrieves correct POV (Selfie - private locker room space)
- ✅ Provides template (mirror selfie, dirty mirror, harsh fluorescent lighting, etc.)
- ⏱️ Query time <400ms

---

## Performance Targets

### Overall Metrics

| Metric | Target | Acceptable | Red Flag |
|--------|--------|------------|----------|
| **Avg Query Time** | <400ms | <500ms | >600ms |
| **P95 Query Time** | <500ms | <650ms | >800ms |
| **Relevance Score** | >8.8/10 | >8.0/10 | <7.5/10 |
| **Chunks Returned** | 3 | 3-4 | >5 |
| **Token Usage** | ~800 | ~1000 | >1500 |
| **Cache Hit Rate** | >30% | >20% | <10% |

### Pattern Distribution

Expected pattern triggers across 20 queries:

| Pattern | Query Count | % |
|---------|-------------|---|
| **Pattern 1 (Model Inference)** | 4 | 20% |
| **Pattern 2 (POV Framework)** | 8 | 40% |
| **Pattern 3 (Reference Rules)** | 2 | 10% |
| **Pattern 4 (Fixed Workflow)** | 6 | 30% |

**Validation:** Pattern 2 (POV) should be most frequently triggered (40%) - validates Instagram/casual focus of knowledge base.

---

## Test Execution

### Run Tests

```bash
# Run all 20 baseline queries
node rag/test-queries.js

# Expected output format per query:
# Query 1: "How do I make skin look realistic for Instagram?"
#   Pattern: POV_FRAMEWORK
#   Retrieved: 07_instagram_authentic_v03.md (chunks 2, 7)
#   Retrieved: 01_photorealistic_prompting_v03.md (chunk 14)
#   Query time: 385ms ✅
#   Relevance: 9.1/10 ✅
#   Tokens: 742 ✅
```

### Generate Report

After running all 20 queries, update `SYSTEM/efficiency-metrics.json`:

```json
{
  "rag_performance": {
    "queries_logged": 20,
    "avg_query_time_ms": [MEASURED],
    "p95_query_time_ms": [MEASURED],
    "cache_hit_rate": [MEASURED],
    "avg_chunks_returned": 3
  },
  "knowledge_utilization": {
    "doc_01_queries": [COUNT],
    "doc_02_queries": [COUNT],
    ...
  }
}
```

---

## Success Criteria Summary

**Week 3 RAG optimization successful if:**

- [ ] All 20 queries execute successfully
- [ ] **18/20 queries** (90%) meet query time target (<400ms)
- [ ] **18/20 queries** (90%) meet relevance target (>8.8/10)
- [ ] **Average** query time <400ms
- [ ] **Average** relevance score >8.8/10
- [ ] Pattern distribution matches expected (POV 40%, Workflow 30%, Model 20%, Reference 10%)
- [ ] Knowledge utilization balanced (no single file >40% of queries)
- [ ] Token usage 30%+ lower than v0.2 baseline

---

**Version:** 3.0
**Last Updated:** 2025-11-28 (v0.3 Migration - Week 3)
**Part of:** AI Image Generation Helper Agent System (v0.3)
