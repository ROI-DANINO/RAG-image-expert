# Contributing to RAG-image-expert

## How to Contribute

### Adding Knowledge
1. Create/edit `.md` file in `knowledge/core/`
2. Follow existing format (headers, tables, examples)
3. Rebuild embeddings: `cd rag && node simple-rag.js build-index`
4. Test with baseline queries from `SYSTEM/efficiency-metrics.json`

### Commit Conventions
- `feat:` New knowledge or features
- `fix:` Corrections or bug fixes
- `docs:` Documentation updates
- `refactor:` Code improvements

### Testing Before Commit
Run 10 baseline queries and ensure relevance scores >0.60:
```bash
cd rag
node test-queries.js
```

### Pull Request Process
1. Fork the repository
2. Create feature branch: `feature/add-xyz-knowledge`
3. Make changes and test
4. Submit PR with test results
5. Maintainer will review and merge
