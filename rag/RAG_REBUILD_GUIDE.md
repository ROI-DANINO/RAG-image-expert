# RAG System Rebuild Guide - v0.3

> Complete instructions for rebuilding the RAG (Retrieval-Augmented Generation) system with v0.3 knowledge base
>
> **Version:** 0.3
> **Last updated:** 2025-11-28
> **Purpose:** Rebuild embeddings and optimize retrieval for new knowledge structure

---

## Overview

This guide covers rebuilding the RAG system after the v0.3 migration to leverage:
- **9 knowledge files** (4,086 lines) - structured, table-heavy format
- **1 agent logic file** (674 lines) - operational decision patterns
- **Modular architecture** - Split training guide (02/02a/02b)
- **Cross-references** - Reduced redundancy

**Expected improvements:**
- **30-40% token reduction** per query (from better chunk matching)
- **Improved precision** (modular split: 02/02a/02b)
- **Faster retrieval** (table-heavy format = denser chunks)

---

## Prerequisites

### Files to Index

**Knowledge Base (9 files):**
```
knowledge/core/
├── 01_photorealistic_prompting_v03.md       (710 lines)
├── 02_ostris_training_core.md               (694 lines)
├── 02a_qwen_specifics.md                    (409 lines)
├── 02b_flux_specifics.md                    (483 lines)
├── 03_qwen_quick_reference.md               (97 lines)
├── 04_troubleshooting_v03.md                (407 lines)
├── 06_higgsfield_integration_v03.md         (498 lines)
├── 07_instagram_authentic_v03.md            (506 lines)
└── 08_model_specific_best_practices.md      (282 lines)
```

**Agent Logic (1 file):**
```
agent/
└── agent.md                                  (674 lines)
```

**Total:** 10 files, 4,760 lines

---

## Step 1: Clean Previous Embeddings

### Remove Old Embeddings

```bash
# Navigate to project root
cd /home/roking/work_station/claude-v0.3/

# Remove old embeddings (if exists from v0.2)
rm -rf rag/embeddings/
rm -rf rag/cache/

# Create fresh directories
mkdir -p rag/embeddings/core
mkdir -p rag/embeddings/experimental
mkdir -p rag/cache
```

**Why split embeddings?**
- **core/** - Production knowledge (9 files + agent.md) - rebuilt infrequently
- **experimental/** - Future additions - can rebuild independently

---

## Step 2: Configure Chunking Strategy

### Recommended Chunking Parameters

**For table-heavy v0.3 format:**

```javascript
{
  "chunkSize": 500,           // Increased from 400 (tables are denser)
  "chunkOverlap": 100,        // Maintain context across chunks
  "separator": "\n\n",        // Split on markdown sections
  "preserveTables": true,     // Keep tables intact
  "preserveCodeBlocks": true  // Keep code examples intact
}
```

**Why chunk size 500?**
- Tables compress information (more data per line)
- Cross-references reduce duplication
- Larger chunks = fewer retrievals = faster queries

### Expected Chunk Counts

| File | Lines | Est. Chunks | Reasoning |
|------|-------|-------------|-----------|
| 01_photorealistic_prompting_v03.md | 710 | 18-20 | Tables, model tips |
| 02_ostris_training_core.md | 694 | 16-18 | Timeline, workflow |
| 02a_qwen_specifics.md | 409 | 10-12 | Config tables |
| 02b_flux_specifics.md | 483 | 11-13 | Config tables |
| 03_qwen_quick_reference.md | 97 | 3-4 | Compact reference |
| 04_troubleshooting_v03.md | 407 | 10-12 | Decision trees |
| 06_higgsfield_integration_v03.md | 498 | 12-14 | Workflow steps |
| 07_instagram_authentic_v03.md | 506 | 13-15 | POV framework |
| 08_model_specific_best_practices.md | 282 | 8-10 | Comparison tables |
| agent.md | 674 | 16-18 | Logic patterns |
| **TOTAL** | 4,760 | **117-136** | Avg ~125 chunks |

**v0.2 comparison:**
- v0.2: ~200 chunks from 4,168 lines
- v0.3: ~125 chunks from 4,760 lines
- **37% fewer chunks** despite more content (better density)

---

## Step 3: Generate Embeddings

### Using Xenova Transformers (Current Stack)

**Model:** `Xenova/all-MiniLM-L6-v2`

```javascript
// rag/rebuild-embeddings.js

import { pipeline } from '@xenova/transformers';

const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

const files = [
  'knowledge/core/01_photorealistic_prompting_v03.md',
  'knowledge/core/02_ostris_training_core.md',
  'knowledge/core/02a_qwen_specifics.md',
  'knowledge/core/02b_flux_specifics.md',
  'knowledge/core/03_qwen_quick_reference.md',
  'knowledge/core/04_troubleshooting_v03.md',
  'knowledge/core/06_higgsfield_integration_v03.md',
  'knowledge/core/07_instagram_authentic_v03.md',
  'knowledge/core/08_model_specific_best_practices.md',
  'agent/agent.md'
];

// Chunk and embed each file
for (const file of files) {
  const content = await fs.readFile(file, 'utf-8');
  const chunks = chunkDocument(content, {
    chunkSize: 500,
    chunkOverlap: 100,
    separator: '\n\n',
    preserveTables: true
  });

  // Generate embeddings
  const embeddings = await embedder(chunks, { pooling: 'mean', normalize: true });

  // Store in vector database
  await storeEmbeddings(file, chunks, embeddings);
}
```

### Expected Output

```
rag/embeddings/core/
├── 01_photorealistic_prompting_v03.bin      (~300KB)
├── 02_ostris_training_core.bin              (~280KB)
├── 02a_qwen_specifics.bin                   (~180KB)
├── 02b_flux_specifics.bin                   (~200KB)
├── 03_qwen_quick_reference.bin              (~50KB)
├── 04_troubleshooting_v03.bin               (~180KB)
├── 06_higgsfield_integration_v03.bin        (~220KB)
├── 07_instagram_authentic_v03.bin           (~230KB)
├── 08_model_specific_best_practices.bin     (~150KB)
└── agent.bin                                 (~300KB)

Total: ~2.1MB (vs v0.2: 4.4MB)
```

**52% size reduction** despite more content (better chunking efficiency)

---

## Step 4: Configure Vector Search

### Search Configuration

```javascript
{
  "topK": 3,                    // Return top 3 most relevant chunks
  "scoreThreshold": 0.7,        // Minimum similarity score
  "rerankResults": true,        // Re-rank by cross-reference proximity
  "cacheEnabled": true,         // Cache common queries
  "cacheExpiry": 900000         // 15 minutes
}
```

### Cross-Reference Aware Search

**New for v0.3:** Boost chunks that reference each other

```javascript
// If query matches Pattern 4 (training workflow)
// AND retrieves chunk from 02_ostris_training_core.md
// THEN boost related chunks from 02a_qwen_specifics.md and 02b_flux_specifics.md

function rerankWithCrossRefs(chunks, query) {
  const crossRefMap = {
    '02_ostris_training_core.md': ['02a_qwen_specifics.md', '02b_flux_specifics.md'],
    '06_higgsfield_integration_v03.md': ['02_ostris_training_core.md', '02a_qwen_specifics.md'],
    '04_troubleshooting_v03.md': ['02_ostris_training_core.md'],
    '07_instagram_authentic_v03.md': ['01_photorealistic_prompting_v03.md']
  };

  // Boost chunks from cross-referenced files
  return chunks.map(chunk => {
    if (crossRefMap[chunk.file]?.includes(sourceFile)) {
      chunk.score *= 1.2;  // 20% boost
    }
    return chunk;
  }).sort((a, b) => b.score - a.score);
}
```

---

## Step 5: Integrate Agent Patterns

### Pattern-Aware Retrieval

**When agent patterns trigger, pre-filter retrieval targets:**

| Pattern Detected | Target Files | Rationale |
|-----------------|--------------|-----------|
| **Model Inference (Pattern 1)** | 08, 01, 07 | Model comparison, prompting guides |
| **POV Framework (Pattern 2)** | 07 | Instagram POV framework, imperfections |
| **Reference Rules (Pattern 3)** | 08, 02, 06 | Reference workflows, captioning |
| **Fixed Workflow (Pattern 4)** | 02, 02a/02b, 04, 06 | Training pipeline, configs, troubleshooting |

**Example implementation:**

```javascript
async function retrieveWithPatterns(query, detectedPatterns) {
  let targetFiles = [];

  if (detectedPatterns.includes('POV_FRAMEWORK')) {
    targetFiles.push('07_instagram_authentic_v03.md');
  }

  if (detectedPatterns.includes('TRAINING_WORKFLOW')) {
    targetFiles.push('02_ostris_training_core.md', '02a_qwen_specifics.md', '02b_flux_specifics.md');
  }

  if (detectedPatterns.includes('REFERENCE_RULES')) {
    targetFiles.push('08_model_specific_best_practices.md', '02_ostris_training_core.md');
  }

  // Perform filtered search
  return await vectorSearch(query, { filterFiles: targetFiles });
}
```

---

## Step 6: Build Search Index

### Indexing Script

```bash
# Run embedding generation
node rag/rebuild-embeddings.js

# Expected output:
# ✓ Processed 01_photorealistic_prompting_v03.md (19 chunks)
# ✓ Processed 02_ostris_training_core.md (17 chunks)
# ✓ Processed 02a_qwen_specifics.md (11 chunks)
# ✓ Processed 02b_flux_specifics.md (12 chunks)
# ✓ Processed 03_qwen_quick_reference.md (4 chunks)
# ✓ Processed 04_troubleshooting_v03.md (11 chunks)
# ✓ Processed 06_higgsfield_integration_v03.md (13 chunks)
# ✓ Processed 07_instagram_authentic_v03.md (14 chunks)
# ✓ Processed 08_model_specific_best_practices.md (9 chunks)
# ✓ Processed agent.md (17 chunks)
#
# Total chunks: 127
# Total embeddings size: 2.1MB
# Build time: ~45 seconds
```

---

## Step 7: Validate Retrieval Quality

### Test with 20 Baseline Queries

**From `SYSTEM/efficiency-metrics.json`:**

Run validation script (see `rag/test_validation.md` for details):

```bash
node rag/test-queries.js
```

**Expected results:**

| Metric | v0.2 Baseline | v0.3 Target | Success Criteria |
|--------|---------------|-------------|------------------|
| **Avg query time** | 500ms | <400ms | ✅ Pass if <400ms |
| **P95 query time** | 650ms | <500ms | ✅ Pass if <500ms |
| **Relevance score** | 8.5/10 | >8.8/10 | ✅ Pass if >8.8 |
| **Chunks returned** | 4-5 | 3 | ✅ Pass if ≤3 |
| **Token usage** | ~1200 | ~800 | ✅ Pass if 30% reduction |

---

## Step 8: Performance Optimization

### Cache Common Queries

**Frequently asked:**
1. "How to train LoRA?" → Cache Pattern 4 response
2. "Qwen training parameters?" → Cache 02a retrieval
3. "POV for bedroom selfie?" → Cache Pattern 2 + 07 retrieval

### Hybrid Search (Optional Enhancement)

**Combine semantic + keyword search:**

```javascript
// For technical queries (training, parameters), boost keyword match
if (query.includes('parameter') || query.includes('config')) {
  results = await hybridSearch(query, {
    semanticWeight: 0.7,
    keywordWeight: 0.3
  });
}
```

---

## Step 9: Monitor Performance

### Metrics to Track

Update `SYSTEM/efficiency-metrics.json` after rebuild:

```json
{
  "rag_performance": {
    "avg_query_time_ms": [MEASURED],
    "p95_query_time_ms": [MEASURED],
    "avg_chunks_returned": [MEASURED],
    "cache_hit_rate": [MEASURED]
  },
  "knowledge_utilization": {
    "doc_01_queries": [COUNT],
    "doc_02_queries": [COUNT],
    "doc_02a_queries": [COUNT],
    ...
  }
}
```

### Red Flags

⚠️ **Query time >500ms:** Check chunking strategy (may be too large)
⚠️ **Relevance <8.0:** Check embeddings model (may need fine-tuning)
⚠️ **Chunks >4 per query:** Check topK setting (should be 3)

---

## Step 10: Documentation

### Update System Files

1. **SYSTEM/version.json:**
   ```json
   {
     "status": "week_3_complete",
     "rag_chunks_current": 127,
     "embeddings_size_mb_current": 2.1
   }
   ```

2. **Create `rag/REBUILD_LOG.md`:**
   - Date of rebuild
   - Files processed
   - Chunk count
   - Embeddings size
   - Performance metrics

---

## Troubleshooting

### Issue: Embeddings size larger than expected

**Solution:** Check chunk size (should be 500). If larger, reduce to 400 and rebuild.

### Issue: Query time slower than v0.2

**Solution:**
1. Enable caching
2. Reduce topK from 3 to 2
3. Check cross-reference boost (may be too aggressive)

### Issue: Low relevance scores

**Solution:**
1. Verify chunk boundaries don't split tables
2. Check preserveTables: true in config
3. Consider fine-tuning embeddings model on domain-specific data

---

## Success Criteria

**Week 3 complete when:**
- [ ] All 10 files indexed (127 chunks)
- [ ] Embeddings size ≤2.5MB
- [ ] 20 test queries run
- [ ] Avg query time <400ms
- [ ] Relevance score >8.8/10
- [ ] Performance logged in efficiency-metrics.json
- [ ] Comparison to v0.2 documented

---

**Version:** 3.0
**Last Updated:** 2025-11-28 (v0.3 Migration - Week 3)
**Part of:** AI Image Generation Helper Agent System (v0.3)
