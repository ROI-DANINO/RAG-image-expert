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

**Generated:** 2025-12-04
**Version:** 0.6.0
**Branch:** feature/image-generation-integration
