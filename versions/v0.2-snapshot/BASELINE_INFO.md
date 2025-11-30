# v0.2 Baseline Snapshot

**Source:** `https://github.com/ROI-DANINO/claude-ai-image-expert.git`
**Commit:** `723a7896235889d84125328e0bf187861913748d`
**Local:** `/home/roking/work_station/v0.2-source/`
**Codename:** Source/Comprehensive
**Date:** November 2025

## Characteristics

- **Knowledge Base:** 8 documents, 4,168 lines (+89% vs v0.1)
- **Focus:** Photorealistic + LoRA + Instagram + Multi-model
- **Structure:** Comprehensive, research-inclusive
- **Scope:** Expanded domains

## Files

```
knowledge/
├── 01_photorealistic_prompting.md (134 lines)
├── 02_qwen_training_guide.md (695 lines)
├── 03_qwen_quick_reference.md (96 lines)
├── 04_qwen_troubleshooting.md (453 lines)
├── 05_qwen_workflow_diagram.md (235 lines)
├── 06_higgsfield_integration.md (592 lines)
├── 07_instagram_authentic_prompting.md (919 lines) ← NEW
└── 08_model_specific_best_practices.md (1044 lines) ← NEW
```

## Disk Usage

~103MB (excluding node_modules)

## Agent

- Enhanced with intake system
- Structured question flow
- More systematic approach

## RAG

- topK: 3
- Query time: <500ms
- Larger embeddings cache (4.4MB)

## Key Additions

✅ **POV Decision Framework** (07) - CRITICAL for Instagram prompts
✅ **Model-specific prompting** (08) - Qwen, Flux, Nano Banana
✅ **Research layer** - Experimental findings
✅ **Intake protocol** - Systematic user guidance

## Strengths

✅ Comprehensive knowledge coverage
✅ Instagram/authentic prompting support
✅ Multi-model workflows
✅ POV framework (selfie vs third-person)
✅ Research experimentation layer

## Limitations

❌ Verbose (4,168 lines vs 2,205)
❌ Some redundancy across docs
❌ Larger resource footprint
❌ Training guide not split by model

## Critical Features for v0.3

**MUST PRESERVE:**
1. POV Decision Framework (Section 0 of doc 07)
2. Model-specific prompting patterns (doc 08)
3. Instagram authenticity layers (doc 07)
4. Intake protocol (agent.md)

**MUST OPTIMIZE:**
1. Training guide split (Ostris core + Qwen + Flux)
2. Compress photorealistic prompting (reduce tables)
3. Decision tree format for troubleshooting
4. Migrate workflow diagram content, delete file

---

**Full source preserved at:** `/home/roking/work_station/v0.2-source/`
**Git reference:** `git checkout 723a7896235889d84125328e0bf187861913748d`
