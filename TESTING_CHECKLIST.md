# RAG Image Expert - Testing Checklist

**Branch:** `feature/image-generation-integration`
**Version:** 0.6.0 (Phase 3 Complete)
**Last Updated:** 2025-12-04

---

## Pre-Testing Setup

### Environment Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Add `XAI_API_KEY` (Required - Grok API)
- [ ] Add at least ONE image provider key:
  - [ ] `FAL_API_KEY` (Recommended - faster & cheaper)
  - [ ] OR `REPLICATE_API_TOKEN` (Alternative)
  - [ ] `HUGGINGFACE_API_KEY` (Optional - for Z-Image-Turbo)
- [ ] Set `USE_DB_SESSIONS=true` (Optional - for session persistence)
- [ ] Run `npm install` (ensure all dependencies installed)

### Server Startup
- [ ] Run `npm start`
- [ ] Server starts without errors
- [ ] Check console logs for service status:
  - [ ] `[Server] Image generation provider: fal` or `replicate` (not `none`)
  - [ ] `[MemoryService] Memory Bank MCP connected successfully`
  - [ ] `[RAGService] Loaded X chunks from Y files`

---

## Phase 1: Core RAG System (Already Working)

### RAG Search
- [ ] **Endpoint:** `GET /search`
- [ ] **Test:**
  ```bash
  curl -X POST http://localhost:3000/search \
    -H "Content-Type: application/json" \
    -d '{"query": "Instagram mirror selfie best practices"}'
  ```
- [ ] **Expected:** Returns JSON with `results` array containing relevant chunks
- [ ] **Verify:** Response time < 100ms (after first query)

### Stateless Chat
- [ ] **Endpoint:** `POST /chat`
- [ ] **Test:**
  ```bash
  curl -X POST http://localhost:3000/chat \
    -H "Content-Type: application/json" \
    -d '{"message": "How do I make realistic skin tones?"}'
  ```
- [ ] **Expected:** Returns enhanced response using RAG context
- [ ] **Verify:** Response includes relevant knowledge from files

---

## Phase 2: Session Management (Already Working)

### Session Persistence
- [ ] **Endpoint:** `POST /conversation`
- [ ] **Test:**
  ```bash
  curl -X POST http://localhost:3000/conversation \
    -H "Content-Type: application/json" \
    -d '{
      "sessionId": "test-session-001",
      "message": "What are the best models for portraits?"
    }'
  ```
- [ ] **Expected:** Response with `sessionId` and enhanced answer
- [ ] **Verify:** Second message in same session has context from first

### Session Retrieval
- [ ] **Endpoint:** `GET /sessions`
- [ ] **Test:** `curl http://localhost:3000/sessions`
- [ ] **Expected:** JSON array of all sessions
- [ ] **Verify:** `test-session-001` appears in list

### Session Details
- [ ] **Endpoint:** `GET /sessions/:id`
- [ ] **Test:** `curl http://localhost:3000/sessions/test-session-001`
- [ ] **Expected:** Session object with `messages` array
- [ ] **Verify:** Messages show user query + AI response

### Session Stats
- [ ] **Endpoint:** `GET /sessions/:id/stats`
- [ ] **Test:** `curl http://localhost:3000/sessions/test-session-001/stats`
- [ ] **Expected:** Token counts, message counts, timestamps

### Session Deletion
- [ ] **Endpoint:** `DELETE /sessions/:id`
- [ ] **Test:** `curl -X DELETE http://localhost:3000/sessions/test-session-001`
- [ ] **Expected:** `{"success": true}`
- [ ] **Verify:** Session no longer in `GET /sessions`

---

## Phase 3: Image Generation Integration (NEW)

### Service Status Check
- [ ] **Endpoint:** `GET /services/status`
- [ ] **Test:** `curl http://localhost:3000/services/status`
- [ ] **Expected:** JSON showing all service statuses
- [ ] **Verify:**
  - [ ] `rag.enabled: true`
  - [ ] `session.enabled: true` (if USE_DB_SESSIONS=true)
  - [ ] `image.enabled: true` (if FAL_API_KEY or REPLICATE_API_TOKEN set)
  - [ ] `image.provider: "fal"` or `"replicate"` (not `"none"`)
  - [ ] `memory.enabled: true` (if Memory Bank MCP connected)
  - [ ] `context7.enabled: false` (package doesn't exist - expected)

### Available Models
- [ ] **Endpoint:** `GET /generate-image/models`
- [ ] **Test:** `curl http://localhost:3000/generate-image/models`
- [ ] **Expected:** JSON with `models` array and `provider` name
- [ ] **Verify:** Models list matches your provider:
  - **Fal:** flux-schnell, flux-dev, flux-pro, flux-realism, sdxl
  - **Replicate:** flux-schnell, flux-dev, flux-pro, sdxl

### Basic Image Generation
- [ ] **Endpoint:** `POST /generate-image`
- [ ] **Test:**
  ```bash
  curl -X POST http://localhost:3000/generate-image \
    -H "Content-Type: application/json" \
    -d '{
      "prompt": "cyberpunk cat with neon fur",
      "model": "flux-schnell"
    }'
  ```
- [ ] **Expected:** JSON response with:
  - [ ] `success: true`
  - [ ] `originalPrompt: "cyberpunk cat with neon fur"`
  - [ ] `enhancedPrompt: "..."` (longer, more detailed)
  - [ ] `images: [...]` (array with image URLs or data URLs)
  - [ ] `metadata.model: "flux-schnell"`
  - [ ] `metadata.duration: X.XX` (seconds)
- [ ] **Verify:** Image URL or data URL is valid
- [ ] **Performance:**
  - [ ] Fal: 2-5 seconds (flux-schnell)
  - [ ] Replicate: 3-6 seconds (flux-schnell)

### Advanced Image Generation Options
- [ ] **Test with custom size:**
  ```bash
  curl -X POST http://localhost:3000/generate-image \
    -H "Content-Type: application/json" \
    -d '{
      "prompt": "sunset over mountains",
      "model": "flux-dev",
      "width": 1024,
      "height": 1344,
      "num_images": 2
    }'
  ```
- [ ] **Expected:** 2 images in 9:16 aspect ratio (Instagram portrait)
- [ ] **Verify:** Higher quality than flux-schnell (more detailed)

### LoRA Training (Replicate Only)
- [ ] **Endpoint:** `POST /train-lora`
- [ ] **Skip if using Fal** (LoRA training only on Replicate)
- [ ] **Test:**
  ```bash
  curl -X POST http://localhost:3000/train-lora \
    -H "Content-Type: application/json" \
    -d '{
      "trigger_word": "TOK",
      "images_zip_url": "https://example.com/dataset.zip",
      "steps": 1000
    }'
  ```
- [ ] **Expected:** Training job ID and status
- [ ] **Note:** This starts a paid training job - test with caution!

### HuggingFace Z-Image-Turbo (If API Key Set)
- [ ] **Endpoint:** `POST /enhance-image`
- [ ] **Test:**
  ```bash
  curl -X POST http://localhost:3000/enhance-image \
    -H "Content-Type: application/json" \
    -d '{
      "imageUrl": "https://example.com/image.jpg",
      "prompt": "cyberpunk style",
      "model": "z-image-turbo"
    }'
  ```
- [ ] **Expected:** Transformed image with cyberpunk style applied
- [ ] **Verify:** Image-to-image transformation works

---

## Phase 3: Memory Bank MCP Integration (NEW)

### Memory Storage
- [ ] **Automatic:** Memory Bank saves successful generations
- [ ] **Test:** Generate 2-3 images with different prompts
- [ ] **Verify:** Check server logs for:
  ```
  [MemoryService] Remembered successful generation: <prompt>
  ```

### Memory Recall
- [ ] **Automatic:** Memory is included in `/conversation` context
- [ ] **Test:**
  ```bash
  # First, generate an image
  curl -X POST http://localhost:3000/generate-image \
    -H "Content-Type: application/json" \
    -d '{"prompt": "neon cyberpunk city", "model": "flux-schnell"}'

  # Then ask about it in conversation
  curl -X POST http://localhost:3000/conversation \
    -H "Content-Type: application/json" \
    -d '{
      "sessionId": "memory-test",
      "message": "What kind of images have I generated recently?"
    }'
  ```
- [ ] **Expected:** AI response mentions the cyberpunk city prompt
- [ ] **Note:** Memory recall has compatibility issues but doesn't break functionality

### Memory Stats
- [ ] **Endpoint:** `GET /memory/stats`
- [ ] **Test:** `curl http://localhost:3000/memory/stats`
- [ ] **Expected:**
  ```json
  {
    "enabled": true,
    "totalMemories": X,
    "lastUpdated": "2025-12-04T..."
  }
  ```

### Save Preference
- [ ] **Endpoint:** `POST /memory/preference`
- [ ] **Test:**
  ```bash
  curl -X POST http://localhost:3000/memory/preference \
    -H "Content-Type: application/json" \
    -d '{
      "key": "favorite_style",
      "value": "cyberpunk neon aesthetic"
    }'
  ```
- [ ] **Expected:** `{"success": true}`
- [ ] **Verify:** Preference appears in future `/conversation` context

---

## Web UI Testing

### Homepage
- [ ] **URL:** `http://localhost:3000`
- [ ] **Verify:**
  - [ ] Chat interface loads
  - [ ] "RAG Image Expert" title visible
  - [ ] Message input box present
  - [ ] Send button functional

### Chat Functionality
- [ ] Type message: "How do I make realistic portraits?"
- [ ] Click send
- [ ] **Expected:**
  - [ ] Message appears in chat
  - [ ] Loading indicator shows
  - [ ] AI response appears with RAG context
  - [ ] Response is formatted (markdown)

### Session Persistence (If USE_DB_SESSIONS=true)
- [ ] Send 3 messages in a row
- [ ] Refresh the page
- [ ] **Expected:** Chat history persists
- [ ] **Verify:** Session ID consistent across refresh

---

## Error Handling & Graceful Degradation

### No API Keys Set
- [ ] Remove all API keys from `.env` except `XAI_API_KEY`
- [ ] Restart server
- [ ] **Verify:**
  - [ ] Server starts without errors
  - [ ] `/services/status` shows `image.enabled: false`
  - [ ] `/conversation` and `/search` still work
  - [ ] `/generate-image` returns error: "Image generation unavailable"

### Invalid API Key
- [ ] Set `FAL_API_KEY=invalid-key-test`
- [ ] Try to generate image
- [ ] **Expected:** Graceful error message, no server crash

### Memory Bank MCP Unavailable
- [ ] **Automatic:** If MCP fails to connect
- [ ] **Verify:** Server logs warning but continues
- [ ] **Verify:** `/services/status` shows `memory.enabled: false`
- [ ] **Verify:** Conversations still work without memory

---

## Performance Benchmarks

### RAG Search Speed
- [ ] First query: 30-60s (model download)
- [ ] Subsequent queries: < 100ms
- [ ] **Test:** Run `/search` endpoint 5 times
- [ ] **Verify:** Average response time < 50ms

### Image Generation Speed
- [ ] **Fal.ai:**
  - [ ] flux-schnell: 2-5s
  - [ ] flux-dev: 8-15s
  - [ ] flux-pro: 15-25s
- [ ] **Replicate:**
  - [ ] flux-schnell: 3-6s
  - [ ] flux-dev: 10-20s
  - [ ] flux-pro: 20-30s
- [ ] **Test:** Generate same prompt 3 times, average duration

### Session Query Optimization
- [ ] **With USE_DB_SESSIONS=true:**
- [ ] Create session with 10 messages
- [ ] Check token usage in `/sessions/:id/stats`
- [ ] **Verify:** Only last 6 messages used for context (not all 10)

---

## Database Integrity (If USE_DB_SESSIONS=true)

### SQLite Database
- [ ] **File:** `sessions.db` exists in project root
- [ ] **Test:** `sqlite3 sessions.db "SELECT COUNT(*) FROM sessions;"`
- [ ] **Expected:** Count of sessions created
- [ ] **Verify:** Messages table has entries:
  ```bash
  sqlite3 sessions.db "SELECT COUNT(*) FROM messages;"
  ```

### Soft Deletion
- [ ] Delete a session via `DELETE /sessions/:id`
- [ ] **Verify:** Session not in `GET /sessions`
- [ ] **Verify:** Session still in database (soft delete):
  ```bash
  sqlite3 sessions.db "SELECT * FROM sessions WHERE session_id='test-session-001';"
  # Check deleted_at is NOT NULL
  ```

---

## Documentation Accuracy

### USER_GUIDE.md
- [ ] Open `USER_GUIDE.md`
- [ ] **Verify:**
  - [ ] API endpoints match actual implementation
  - [ ] Example requests work when copy-pasted
  - [ ] Cost estimates are current (Fal: ~$0.003, Replicate: ~$0.003-0.055)
  - [ ] Model names correct (flux-schnell, flux-dev, flux-pro, sdxl)

### .env.example
- [ ] Open `.env.example`
- [ ] **Verify:**
  - [ ] All providers documented (Fal, Replicate, HuggingFace)
  - [ ] Comments accurate
  - [ ] Default values sensible

### ROADMAP.md
- [ ] Open `ROADMAP.md`
- [ ] **Verify:**
  - [ ] Phase 3 marked complete ✅
  - [ ] Phase 4 additions present:
    - [ ] Phase 4.1: Settings Panel
    - [ ] Phase 4.5: Prompt Library
    - [ ] Phase 4.6: Batch Operations
    - [ ] Phase 4.7: Cost Tracking
    - [ ] Phase 4.8: Collaboration

---

## Cost Tracking (Manual)

### Track Actual Costs
- [ ] Note starting balance on Fal.ai dashboard
- [ ] Generate 10 images with flux-schnell
- [ ] Check new balance
- [ ] **Expected cost:** ~$0.03 (10 × $0.003)
- [ ] **Verify:** Matches estimate in documentation

---

## Final Integration Test

### Complete Workflow
1. [ ] **Search for best practices:**
   ```bash
   curl -X POST http://localhost:3000/search \
     -H "Content-Type: application/json" \
     -d '{"query": "best prompts for Instagram portraits"}'
   ```

2. [ ] **Generate image based on results:**
   ```bash
   curl -X POST http://localhost:3000/generate-image \
     -H "Content-Type: application/json" \
     -d '{
       "prompt": "bedroom mirror selfie, iPhone 14 Pro, natural lighting",
       "model": "flux-dev",
       "width": 1024,
       "height": 1344
     }'
   ```

3. [ ] **Ask about the generation in conversation:**
   ```bash
   curl -X POST http://localhost:3000/conversation \
     -H "Content-Type: application/json" \
     -d '{
       "sessionId": "workflow-test",
       "message": "I just generated a mirror selfie. How can I improve it?"
     }'
   ```

4. [ ] **Expected:**
   - [ ] Search returns relevant RAG context
   - [ ] Image generation uses enhanced prompt
   - [ ] Conversation includes memory of generation
   - [ ] Response suggests improvements based on knowledge base

---

## Known Issues (Expected Behavior)

### Non-Breaking Issues
- [ ] **Context7 MCP:** Package not found - gracefully disabled
  - **Expected:** `context7.enabled: false` in `/services/status`
  - **Impact:** None - system works without it

- [ ] **Memory Recall:** Method not found error in logs
  - **Expected:** `[MemoryService] Failed to recall memories: Method not found`
  - **Impact:** Memory writes work, reads fail silently
  - **Result:** Conversations still functional

- [ ] **First Query Slow:** Embedding model downloads on first use
  - **Expected:** 30-60s first query, then < 100ms
  - **Impact:** One-time delay, then fast

---

## Branch & Git Status

### Current Branch
- [ ] `git branch --show-current` returns `feature/image-generation-integration`
- [ ] Branch pushed to remote: `git push -u origin feature/image-generation-integration`
- [ ] Visible on GitHub: https://github.com/ROI-DANINO/RAG-image-expert

### Commits
- [ ] All changes committed
- [ ] Commit messages follow convention
- [ ] No uncommitted changes: `git status` clean

---

## Ready for Merge?

After completing all tests above:

- [ ] **All core features working** (RAG, sessions, image generation)
- [ ] **No breaking errors** (known issues are non-breaking)
- [ ] **Documentation accurate** (USER_GUIDE, ROADMAP, .env.example)
- [ ] **Performance acceptable** (RAG < 100ms, images 2-30s depending on model)
- [ ] **Cost tracking validated** (actual costs match estimates)

### Next Steps:
- [ ] **Option A:** Merge to main (`git checkout main && git merge feature/image-generation-integration`)
- [ ] **Option B:** Start Phase 4.1 (Settings Panel with UI API key management)
- [ ] **Option C:** Additional testing or refinements

---

## Testing Log

**Date:** _________
**Tester:** _________
**Environment:** Local / Production
**API Keys Used:** Fal / Replicate / HuggingFace

### Issues Found:
1. _______________________________________________________
2. _______________________________________________________
3. _______________________________________________________

### Recommendations:
1. _______________________________________________________
2. _______________________________________________________
3. _______________________________________________________

**Overall Status:** ☐ Ready to Merge  ☐ Needs Fixes  ☐ Needs Discussion

---

---

## Phase 3.5: Data Enhancement Testing (NEW)

**Branch:** `data-enhancement`
**Version:** 0.7.0
**Changes:** Knowledge base expansion (9→18 files), token efficiency improvements

### Pre-Testing Requirements
- [ ] `data-enhancement` branch checked out
- [ ] Knowledge base rebuilt: `npm run build-index`
- [ ] Embeddings cache exists: `rag/embeddings/core/embeddings-cache.json` (~8MB)

---

### Test 3.5.1: File Structure Validation

**Purpose:** Verify all new knowledge files are present

```bash
# Count files in each directory
ls knowledge/core/*.md | wc -l      # Expected: 12
ls knowledge/business/*.md | wc -l  # Expected: 6
ls docs/research/* | wc -l          # Expected: 11
```

**Expected Results:**
- [ ] **Core files:** 12 (6 updated to v0.4 + 3 new + 3 existing)
- [ ] **Business files:** 6 (all new FanVue/OnlyFans guides)
- [ ] **Research docs:** 11 (moved from dataset to /docs)

**New Core Files:**
- [ ] `knowledge/core/09_fal_ai_integration.md` exists
- [ ] `knowledge/core/10_content_safety_guidelines.md` exists
- [ ] `knowledge/core/03b_flux_fal_quick_ref.md` exists

**New Business Files:**
- [ ] `knowledge/business/11_fanvue_startup_guide.md` exists
- [ ] `knowledge/business/12_fanvue_content_schedule.md` exists
- [ ] `knowledge/business/13_fanvue_pricing_strategy.md` exists
- [ ] `knowledge/business/14_onlyfans_content_strategy.md` exists
- [ ] `knowledge/business/15_boudoir_pose_research.md` exists
- [ ] `knowledge/business/16_adult_content_creation.md` exists

---

### Test 3.5.2: Embeddings Integrity

**Purpose:** Validate embeddings were rebuilt correctly

```bash
node -e "
const fs = require('fs');
const cache = JSON.parse(fs.readFileSync('rag/embeddings/core/embeddings-cache.json', 'utf-8'));
console.log('Total chunks:', cache.chunks.length);
console.log('Total embeddings:', cache.embeddings.length);
console.log('Match:', cache.chunks.length === cache.embeddings.length ? 'YES' : 'NO');

const sources = new Set(cache.chunks.map(c => c.source));
console.log('Indexed files:', sources.size);
"
```

**Expected Results:**
- [ ] **Total chunks:** 729 (vs 125 before = +483%)
- [ ] **Total embeddings:** 729 (must match chunks exactly)
- [ ] **Indexed files:** 19 (12 core + 6 business + 1 agent)
- [ ] **Cache file size:** 7-9 MB

**Sources Check:**
- [ ] All 12 core files appear in sources list
- [ ] All 6 business files appear in sources list
- [ ] `agent/agent.md` appears in sources list

---

### Test 3.5.3: Critical Correction Validation

**Purpose:** Verify Nano Banana Pro v0.4 correction (CRITICAL)

```bash
# Check for v0.4 flexible guidance
grep -A 5 "Nano Banana Pro" knowledge/core/01_photorealistic_prompting_v03.md | grep "Flexible"

# Verify 25-word limit removed
grep -r "25 word\|under 25\|<25" knowledge/core/ || echo "✅ No 25-word limit found"
```

**Expected Results:**
- [ ] **"Flexible" guidance present** in Nano Banana Pro section
- [ ] **NO references to "25 words"** or "under 25"
- [ ] **NO "30% higher accuracy"** claims for short prompts
- [ ] Version in file header shows **v0.4**

**Why This Matters:**
- v0.3 incorrectly stated Nano Banana Pro required <25 word prompts
- Official Google docs confirm NO strict word limit
- This was a critical user-facing error

**Test Query:**
```bash
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the optimal prompt length for Nano Banana Pro?", "topK": 3}'
```

**Expected in Results:**
- [ ] Top result mentions "Flexible" approach
- [ ] Encourages both short AND detailed prompts
- [ ] No 25-word restriction mentioned

---

### Test 3.5.4: Token Efficiency Validation

**Purpose:** Ensure expanded knowledge base maintains token efficiency

```bash
node -e "
const fs = require('fs');
const cache = JSON.parse(fs.readFileSync('rag/embeddings/core/embeddings-cache.json', 'utf-8'));

// Sample first 100 chunks
const sample = cache.chunks.slice(0, 100);
const avgLength = sample.reduce((sum, c) => sum + c.content.length, 0) / sample.length;
const avgTokens = Math.round(avgLength / 4);
const ragContext = avgTokens * 3; // topK=3

console.log('Avg chunk size:', Math.round(avgLength), 'chars');
console.log('Estimated tokens/chunk:', avgTokens);
console.log('RAG context (topK=3):', ragContext, 'tokens');
console.log('Total per request:', ragContext + 900 + 150, 'tokens (RAG + 6 messages + system)');
"
```

**Expected Results:**
- [ ] **Avg chunk size:** 300-350 chars
- [ ] **Tokens per chunk:** ~75-85 tokens
- [ ] **RAG context (topK=3):** 225-255 tokens (< 300 tokens)
- [ ] **Total per request:** ~1,275-1,305 tokens (< 1,500 tokens)

**Baseline Comparison:**
- **v0.3 baseline:** ~1,800 tokens/request
- **v0.7 target:** ~1,293 tokens/request
- **Improvement:** -28% despite 6× more chunks

**Performance Requirements:**
- [ ] Token usage <= 1,500 per request
- [ ] RAG context <= 300 tokens
- [ ] Maintains 52% reduction from pre-optimization baseline

---

### Test 3.5.5: RAG Retrieval Quality - Technical Queries

**Purpose:** Verify technical knowledge retrieval works correctly

**Test Queries:**

1. **Fal.ai Integration:**
```bash
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "How do I use Flux models on Fal.ai?", "topK": 3}'
```
- [ ] Top result from `09_fal_ai_integration.md`
- [ ] Score > 0.7
- [ ] Mentions flux-schnell, flux-dev, flux-pro

2. **Content Safety:**
```bash
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "NSFW content generation safety guidelines", "topK": 3}'
```
- [ ] Top result from `10_content_safety_guidelines.md`
- [ ] Score > 0.6
- [ ] Mentions Terms of Service, artistic framing

3. **LoRA Training:**
```bash
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "How do I train a Flux LoRA?", "topK": 3}'
```
- [ ] Results from `02b_flux_specifics.md`
- [ ] Score > 0.7
- [ ] Contains parameter recommendations

---

### Test 3.5.6: RAG Retrieval Quality - Business Queries

**Purpose:** Verify business knowledge retrieval works correctly

**Test Queries:**

1. **FanVue Pricing:**
```bash
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "How should I price PPV content on FanVue?", "topK": 3}'
```
- [ ] Top result from `knowledge/business/13_fanvue_pricing_strategy.md`
- [ ] Score > 0.6
- [ ] Includes actual dollar amounts ($10-$25)

2. **Boudoir Poses:**
```bash
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "What are effective boudoir poses for AI images?", "topK": 3}'
```
- [ ] Top result from `knowledge/business/15_boudoir_pose_research.md`
- [ ] Score > 0.6
- [ ] Lists specific poses (S-curve, arched back, etc.)

3. **Content Scheduling:**
```bash
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Content schedule for Week 1 on adult platforms", "topK": 3}'
```
- [ ] Results from `knowledge/business/11_fanvue_startup_guide.md` or `12_fanvue_content_schedule.md`
- [ ] Score > 0.6
- [ ] Includes day-by-day schedule

---

### Test 3.5.7: Cross-Domain Retrieval

**Purpose:** Verify retrieval from BOTH technical and business knowledge

**Test Query:**
```bash
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "How do I generate boudoir images with Flux for FanVue?", "topK": 5}'
```

**Expected Results:**
- [ ] Results include chunks from **both** `knowledge/core/` AND `knowledge/business/`
- [ ] Technical aspects covered (Flux models, prompting)
- [ ] Business aspects covered (FanVue, boudoir poses)
- [ ] At least 1 result from core, 1 from business in top 5

---

### Test 3.5.8: Documentation Accuracy

**Purpose:** Verify documentation reflects actual changes

```bash
# Check README.md
grep "18 files" README.md && echo "✅ File count updated"
grep "729" README.md && echo "✅ Chunk count updated"

# Check ROADMAP.md
grep "v0.7.0\|0.7.0" ROADMAP.md && echo "✅ Version updated"
grep "Phase 3.5" ROADMAP.md && echo "✅ Phase documented"

# Check USER_GUIDE.md
grep "18 knowledge files\|729 chunks" USER_GUIDE.md && echo "✅ Stats updated"
```

**Expected Results:**
- [ ] README.md mentions "18 files" and "729 chunks"
- [ ] ROADMAP.md updated to v0.7.0
- [ ] ROADMAP.md includes Phase 3.5 section
- [ ] USER_GUIDE.md mentions expanded knowledge base
- [ ] KNOWLEDGE_BASE.md file exists

---

### Test 3.5.9: Performance & Regression

**Purpose:** Ensure performance maintained and old queries still work

**RAG Query Speed:**
```bash
# Test query performance (after initial model load)
time curl -s -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Instagram selfie techniques", "topK": 3}' > /dev/null
```
- [ ] Response time < 100ms (after first query)
- [ ] No degradation despite 6× more chunks

**Regression Tests (v0.3 queries):**
```bash
# Old query from v0.3 - should still work
curl -X POST http://localhost:3000/search \
  -d '{"query": "LoRA training parameters"}'
```
- [ ] Returns relevant results
- [ ] Score > 0.6
- [ ] Results from updated files work correctly

---

### Test 3.5.10: Git & Branch Validation

**Purpose:** Verify commits and branch status

```bash
# Check current branch
git branch --show-current  # Should be: data-enhancement

# Count new commits
git log --oneline data-enhancement ^feature/image-generation-integration | wc -l  # Should be: 7

# Show commit messages
git log --oneline -7
```

**Expected Results:**
- [ ] On `data-enhancement` branch
- [ ] 7 new commits since feature branch
- [ ] Commit messages follow convention:
  - [ ] `docs: Update core knowledge to v0.4...`
  - [ ] `docs: Add Fal.ai integration...`
  - [ ] `docs: Add FanVue/OnlyFans...`
  - [ ] `docs: Add research documentation...`
  - [ ] `docs: Update README, USER_GUIDE, ROADMAP...`
  - [ ] `chore: Update RAG build script...`
  - [ ] `docs: Add comprehensive testing guide...`

---

### Test 3.5.11: Quick Validation Script

**Purpose:** Run all critical tests in one script

```bash
#!/bin/bash
echo "=== Phase 3.5 Quick Validation ==="

# File counts
CORE=$(ls knowledge/core/*.md 2>/dev/null | wc -l)
BUSINESS=$(ls knowledge/business/*.md 2>/dev/null | wc -l)
RESEARCH=$(ls docs/research/* 2>/dev/null | wc -l)

echo "Files: $CORE core, $BUSINESS business, $RESEARCH research"
[ "$CORE" -eq 12 ] && [ "$BUSINESS" -eq 6 ] && [ "$RESEARCH" -eq 11 ] && echo "✅ File counts correct" || echo "❌ File counts wrong"

# Embeddings check
CHUNKS=$(node -e "console.log(JSON.parse(require('fs').readFileSync('rag/embeddings/core/embeddings-cache.json')).chunks.length)")
echo "Chunks: $CHUNKS"
[ "$CHUNKS" -eq 729 ] && echo "✅ Chunk count correct" || echo "❌ Chunk count wrong"

# Critical correction
grep -q "Flexible" knowledge/core/01_photorealistic_prompting_v03.md && echo "✅ Nano Banana Pro corrected" || echo "❌ Correction missing"
grep -r "under 25" knowledge/core/ > /dev/null 2>&1 && echo "❌ Old limit still present" || echo "✅ 25-word limit removed"

# Token efficiency
AVG_TOKENS=$(node -e "const c=require('fs').readFileSync('rag/embeddings/core/embeddings-cache.json');const j=JSON.parse(c);const avg=j.chunks.slice(0,100).reduce((s,ch)=>s+ch.content.length,0)/100;console.log(Math.round(avg/4));")
RAG_CONTEXT=$((AVG_TOKENS * 3))
echo "RAG context: $RAG_CONTEXT tokens"
[ "$RAG_CONTEXT" -le 300 ] && echo "✅ Token efficiency maintained" || echo "❌ Token usage too high"

echo "=== All Phase 3.5 Tests Complete ==="
```

**Run this script:**
```bash
chmod +x test-phase-3.5.sh
./test-phase-3.5.sh
```

---

## Phase 3.5 Summary Checklist

**Data Enhancement (v0.7.0):**
- [ ] All file structure tests pass (3.5.1)
- [ ] Embeddings integrity verified (3.5.2)
- [ ] Nano Banana Pro correction validated (3.5.3) **CRITICAL**
- [ ] Token efficiency maintained (3.5.4)
- [ ] Technical queries work (3.5.5)
- [ ] Business queries work (3.5.6)
- [ ] Cross-domain retrieval works (3.5.7)
- [ ] Documentation accurate (3.5.8)
- [ ] Performance & regression tests pass (3.5.9)
- [ ] Git commits verified (3.5.10)

**Ready to Merge When:**
- [ ] All Phase 3 tests pass (image generation)
- [ ] All Phase 3.5 tests pass (data enhancement)
- [ ] Combined integration test successful
- [ ] Documentation reviewed and accurate

---

**Generated:** 2025-12-04
**Versions:** 0.6.0 (Phase 3) + 0.7.0 (Phase 3.5)
**Branches:** feature/image-generation-integration + data-enhancement
