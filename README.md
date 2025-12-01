# RAG-image-expert

[![License](https://img.shields.io/badge/license-BSD--3--Clause-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.3.0-green.svg)](https://github.com/ROI-DANINO/RAG-image-expert/releases/tag/v0.3.0)
[![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)

**RAG-powered expert system for AI image generation and LoRA training**

---

## What Is This?

A **semantic search engine** for AI image generation workflows, powered by Retrieval-Augmented Generation (RAG):

- 📚 **10 knowledge files** (5,983 lines) - Photorealistic prompting, LoRA training, Instagram authenticity
- ⚡ **7ms queries** - Semantic search (not keyword matching)
- 🔍 **Offline-first** - No API keys, runs completely locally
- 🎯 **Fine-grained precision** - 542 searchable chunks, high relevance
- ✅ **Production-tested** - 20+ baseline queries validated

**Perfect for:** Image generation practitioners, LoRA trainers, Instagram content creators.

---

## Quick Start (2 minutes)

### 1. Install Dependencies
```bash
git clone https://github.com/ROI-DANINO/RAG-image-expert.git
cd RAG-image-expert/rag
npm install
```

### 2. Search the Knowledge Base
```bash
node simple-rag.js search "How do I make skin look realistic for Instagram?"
```

### 3. Get Instant Answers
Results point you to specific files and sections with relevance scores.

**Example output:**
```
📚 Top 3 Results:
[1] Source: knowledge/core/01_photorealistic_prompting_v03.md | Score: 0.654
    Section: 2.3 Skin Texture by Detail Level
    Lines: 141-158
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| [USER_GUIDE.md](USER_GUIDE.md) | Complete usage guide |
| [CHANGELOG.md](CHANGELOG.md) | Version updates and changes |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |
| [versions/ARCHIVES.md](versions/ARCHIVES.md) | Version history & migration |
| [docs/FINAL_IMPLEMENTATION_REPORT.md](docs/FINAL_IMPLEMENTATION_REPORT.md) | Technical deep-dive |
| [rag/RAG_REBUILD_GUIDE.md](rag/RAG_REBUILD_GUIDE.md) | How RAG works |

---

## Architecture

```
Knowledge Base (10 files, 5,983 lines)
          ↓
    [Semantic Chunking] → 542 chunks (500 chars, table-preserved)
          ↓
    [Xenova Embeddings] → 384-dim local vectors
          ↓
    [Cosine Similarity] → 7ms semantic search
          ↓
    [Relevance Ranking] → Top 3 results with scores
```

**Key Features:**
- Embedding Model: Xenova/all-MiniLM-L6-v2 (offline, no API)
- Search Algorithm: Cosine similarity (semantic closeness)
- Cache: JSON-based embeddings (5.9MB, regenerates on demand)
- Decision Logic: 4 formalized agent patterns (see agent/agent.md)

---

## Performance Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Query Time | <400ms | 7ms | ✅ 57x faster |
| Relevance | >0.60 | 0.616 | ✅ Good matches |
| Knowledge Files | 10 | 10 | ✅ Complete |
| Chunks | ~127 | 542 | ✅ Fine-grained |

*See `SYSTEM/efficiency-metrics.json` for detailed benchmarks.*

---

## Knowledge Base

### Core Content
1. **Photorealistic Prompting** (710 lines) - Detailed techniques for realistic imagery
2. **LoRA Training** - Split by model for clarity:
   - **Ostris Core** (694 lines) - Fundamental training concepts
   - **Qwen Specifics** (409 lines) - Qwen model parameters
   - **Flux Specifics** (483 lines) - Flux model parameters
3. **Model Comparison** (282 lines) - Qwen vs Flux vs Nano Banana
4. **Instagram Authenticity** (506 lines) - POV framework & authentic prompting
5. **Higgsfield Integration** (498 lines) - Workflow integration
6. **Troubleshooting** (407 lines) - Problem diagnosis & solutions
7. **Quick Reference** (97 lines) - Lookup tables

### Agent Logic
- **4 Decision Patterns** (722 lines) - Formalized decision frameworks
  1. Model inference protocol
  2. POV decision framework (selfie vs third-person)
  3. Reference image rules
  4. Fixed user workflow
  5. Response format standards (concise vs full-length prompts)

---

## Version History

| Version | Release | Status | Key Features |
|---------|---------|--------|--------------|
| [v0.3](https://github.com/ROI-DANINO/RAG-image-expert/releases/tag/v0.3.0) | Current | Production | Unified system, optimized RAG, formalized agent logic |
| [v0.2](https://github.com/ROI-DANINO/RAG-image-expert/releases/tag/v0.2.0) | Archive | Stable | Instagram support, multi-model, 8 docs |
| [v0.1](https://github.com/ROI-DANINO/RAG-image-expert/releases/tag/v0.1.0) | Archive | Stable | Original efficient baseline, 6 docs |

See [versions/ARCHIVES.md](versions/ARCHIVES.md) for migration paths and historical details.

---

## Common Searches

### Prompting
```bash
# Realistic skin for Instagram
node simple-rag.js search "skin texture Instagram realistic"

# Bedroom selfie scenario
node simple-rag.js search "bedroom mirror selfie prompt"
```

### Training
```bash
# Qwen LoRA parameters
node simple-rag.js search "Qwen training parameters"

# Flux vs Qwen comparison
node simple-rag.js search "Flux vs Qwen for Instagram"
```

### Troubleshooting
```bash
# Fix plastic-looking skin
node simple-rag.js search "plastic skin fix"

# Hands generation issues
node simple-rag.js search "hands generation problems"
```

---

## Adding Knowledge

1. Create/edit `.md` file in `knowledge/core/`
2. Follow existing format (headers, tables, examples)
3. Rebuild embeddings: `cd rag && node simple-rag.js build-index`
4. Test with baseline queries

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## Directory Structure

```
RAG-image-expert/
├── knowledge/core/          # 9 knowledge files (4,086 lines)
├── agent/                   # Agent logic (722 lines)
├── rag/                     # RAG system
│   ├── simple-rag.js       # Search engine
│   ├── test-queries.js     # Test suite
│   ├── config.json         # Configuration
│   └── package.json        # Dependencies
├── SYSTEM/                  # System tracking
│   ├── version.json        # Version & status
│   ├── knowledge-map.json  # File registry
│   └── efficiency-metrics.json  # Performance log
├── docs/                    # Documentation
│   └── FINAL_IMPLEMENTATION_REPORT.md
├── versions/                # v0.1 & v0.2 snapshots
│   ├── v0.1-snapshot/
│   ├── v0.2-snapshot/
│   └── ARCHIVES.md
├── .github/                 # GitHub templates
│   └── ISSUE_TEMPLATE/
├── USER_GUIDE.md           # User documentation
├── CONTRIBUTING.md         # Contribution guide
└── README.md               # This file
```

---

## Common Commands

```bash
# Search knowledge base
node rag/simple-rag.js search "your question here"

# Run full test suite
node rag/test-queries.js

# Rebuild embeddings (if docs change)
node rag/simple-rag.js build-index

# View performance metrics
cat SYSTEM/efficiency-metrics.json
```

---

## Technical Details

**Embedding Model:** Xenova/all-MiniLM-L6-v2
- 384 dimensions
- Runs locally (no API)
- ~90MB download (one-time)
- Battle-tested for semantic search

**Chunking Strategy:**
- Size: 500 characters
- Overlap: 100 characters (context preservation)
- Table preservation: Enabled (keeps tables intact)
- Section-aware: Respects markdown headers

**Search Algorithm:**
- Cosine similarity (measures semantic closeness)
- Returns top 3 results
- Scores 0-1 scale (>0.6 = good match)

---

## License

BSD-3-Clause License - See [LICENSE](LICENSE) file for details.

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Knowledge base standards
- Testing procedures
- Commit conventions
- Review process

---

## Citation

If you use this system in research or production:

```bibtex
@software{rag_image_expert,
  title={RAG-Powered AI Image Generation Expert System},
  author={Danino, ROI},
  year={2025},
  url={https://github.com/ROI-DANINO/RAG-image-expert}
}
```

---

## Support

- **Questions:** See [USER_GUIDE.md](USER_GUIDE.md)
- **Issues:** [GitHub Issues](https://github.com/ROI-DANINO/RAG-image-expert/issues)
- **Documentation:** [Full docs](docs/)
- **Performance:** [SYSTEM/efficiency-metrics.json](SYSTEM/efficiency-metrics.json)

---

**Built with:** Node.js, Xenova Transformers, Semantic Search
**Status:** Production-ready, actively maintained
**Last Updated:** 2025-12-01
