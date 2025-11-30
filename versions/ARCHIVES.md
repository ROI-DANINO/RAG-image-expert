# Version Archives

## Version Comparison

| Version | Status | Knowledge Files | Lines | Key Features |
|---------|--------|----------------|-------|--------------|
| v0.3 | Current | 10 | 5,983 | Unified system, optimized RAG, formalized agent logic |
| v0.2 | Archive | 8 | 4,168 | Instagram support, multi-model, POV framework |
| v0.1 | Archive | 6 | 2,205 | Original efficient baseline, Qwen-focused |

## Migration Path

### v0.1 → v0.2
- Added Instagram prompting framework
- Added model-specific best practices
- Enhanced agent decision patterns

### v0.2 → v0.3
- Split training docs by model (Qwen/Flux)
- Formalized 4 agent logic patterns
- Optimized RAG (7ms queries)
- Production testing validated

## Accessing Versions

```bash
# Current (v0.3)
git clone https://github.com/ROI-DANINO/RAG-image-expert.git

# v0.2 snapshot
cat versions/v0.2-snapshot/BASELINE_INFO.md

# v0.1 snapshot
cat versions/v0.1-snapshot/BASELINE_INFO.md

# Checkout specific version
git checkout v0.2.0
```

## Upgrade to v0.3

```bash
git pull origin main
git checkout v0.3.0
cd rag
npm install
node simple-rag.js build-index  # First run only
```
