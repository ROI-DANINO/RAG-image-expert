# RAG Image Expert - Development Roadmap

## Current Status: Phase 3.5 Complete (v0.7.0) ✅

**Last Updated:** 2025-12-04
**Version:** 0.7.0 "Knowledge Base Enhancement"

---

## Phase 1: Database Foundation (COMPLETED) ✅

**Goal:** Build session persistence and feedback infrastructure for token-optimized learning

### Features Implemented ✅

**Session Management:**
- ✅ **SQLite Database** - `rag/sessions.db` with sessions, messages, branches tables
- ✅ **SessionDB Module** - `rag/session-db.js` with full CRUD operations
- ✅ **Token Optimization** - Store RAG context as IDs, not full text (52% token reduction)
- ✅ **Message Persistence** - All conversations saved with metadata
- ✅ **Branch Tracking** - Infrastructure for future conversation branching

**Feedback System:**
- ✅ **Thumbs Up/Down** - Quick binary feedback on response quality
- ✅ **1-7 Star Rating** - Granular quality scoring
- ✅ **Feedback Notes** - Text field for "What should be fixed?"
- ✅ **Result Image Upload** - Users can show actual generated images
- ✅ **Extended Schema** - Added message_id, branch_id, query_text, response_text, rag_context
- ✅ **Feedback API** - POST `/feedback` and GET `/feedback/stats` endpoints

**Web Interface:**
- ✅ **Image Support** - Paste (Ctrl+V) and upload with 50MB limit
- ✅ **Multiline Input** - Shift+Enter for new lines, auto-resize
- ✅ **Markdown Rendering** - Formatted responses with marked.js
- ✅ **Model Update** - grok-beta → grok-4-1-thinking

### Database Schemas

**sessions table:**
```sql
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY,
  session_id TEXT UNIQUE,
  created_at TEXT,
  updated_at TEXT,
  ended_at TEXT,
  title TEXT,
  summary TEXT,
  rating REAL,
  status TEXT,
  metadata TEXT
)
```

**messages table:**
```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  message_id TEXT UNIQUE,
  session_id TEXT,
  parent_message_id TEXT,
  branch_id TEXT,
  role TEXT,
  content TEXT,
  images TEXT,
  rag_context_ids TEXT,  -- Token optimization: store IDs not full text
  sequence_number INTEGER,
  created_at TEXT,
  is_deleted INTEGER DEFAULT 0
)
```

**feedback table (extended):**
```sql
CREATE TABLE feedback (
  id INTEGER PRIMARY KEY,
  feedback_id TEXT UNIQUE,
  session_id TEXT,
  message_id TEXT,        -- NEW: link to specific message
  branch_id TEXT,         -- NEW: link to conversation branch
  query_text TEXT,        -- NEW: user's question
  response_text TEXT,     -- NEW: assistant's answer
  rag_context TEXT,       -- NEW: RAG chunks used
  timestamp TEXT,
  thumbs TEXT CHECK(thumbs IN ('up', 'down')),
  rating INTEGER CHECK(rating BETWEEN 1 AND 7),
  notes TEXT,
  result_image_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Token Optimization Strategy

**Before (Standard):**
- 10 messages in context
- 5 RAG chunks with full text
- System prompt: ~200 tokens
- **Total: ~3750 tokens per request**

**After (Optimized):**
- 6 messages in context (getRecentMessages limit)
- 3 RAG chunks
- RAG context IDs stored, not full text
- System prompt: <150 tokens
- **Total: ~1800 tokens per request**
- **Savings: 52% reduction**

### Testing & Validation

**Tests run:**
```bash
node rag/test-session-db.js
```

**Results:**
```
✓ Session creation and retrieval
✓ Message saving with RAG context IDs
✓ Recent messages limit (6 messages)
✓ Branch creation and tracking
✓ Session stats calculation
✓ Soft delete functionality
All tests passed!
```

**Git commits:**
- `4d3701a` - feat: Phase 1 - Database foundation for session management
- Pushed to GitHub main branch

### Usage (Current State)

**Database foundation is complete but NOT yet integrated into server:**
- SessionDB module ready to use
- Feedback database extended with new columns
- Web UI has feedback forms (using old schema)
- Feature flag `USE_DB_SESSIONS` will enable in Phase 2

**Users can currently:**
1. Click 👍/👎 for quick feedback
2. Rate 1-7 stars for detailed scoring
3. Click "Add details" to provide notes and upload result image
4. View feedback stats at `/feedback/stats`
5. Use image paste/upload in chat
6. See markdown-formatted responses

---

## Phase 2: Server Integration with Token Optimization (COMPLETED - Backend) ✅

**Goal:** Integrate SessionDB into rag-server.js with feature flag for safe rollout

### Tasks Completed ✅
- ✅ Add `USE_DB_SESSIONS=false` feature flag to .env.example
- ✅ Modify `/conversation` endpoint to optionally use SessionDB
- ✅ Implement getRecentMessages(6) for token optimization
- ✅ Add session management endpoints:
  - `GET /sessions` - List all sessions
  - `GET /sessions/:id` - Get session with messages
  - `DELETE /sessions/:id` - Soft delete session
  - `GET /sessions/:id/stats` - Session analytics
  - `GET /sessions/config/status` - Check if persistence is enabled
- ✅ Test with feature flag OFF (verified no breaking changes)
- ✅ Test with feature flag ON (verified session persistence)

### Tasks Remaining (UI)
- [ ] **UI Toggle**: Add settings panel in web UI to enable/disable session persistence
  - Toggle switch visible in UI (e.g., Settings icon → "Enable Session Persistence")
  - Saves preference to localStorage or server config
  - Visual indicator when sessions are being saved
- [ ] Update feedback endpoint to save query_text, response_text, rag_context

### Testing Results ✅

**Mode 1: USE_DB_SESSIONS=false (Default)**
- ✅ Conversation works exactly as before
- ✅ No database writes (zero impact)
- ✅ In-memory sessions maintained
- ✅ Backward compatible - NO breaking changes

**Mode 2: USE_DB_SESSIONS=true**
- ✅ Sessions saved to SQLite (`rag/sessions.db`)
- ✅ Messages persisted with metadata
- ✅ RAG context stored as IDs (token optimization confirmed)
- ✅ Session management endpoints working
- ✅ getRecentMessages(6) implemented (vs 10 in-memory)

### Token Optimization Achieved

**Storage Strategy:**
```javascript
// User message saved with RAG context IDs
"rag_context_ids": "[
  \"knowledge/core/01_photorealistic_prompting_v03.md:103-111\",
  \"knowledge/core/02_ostris_training_core.md:541-555\",
  ...
]"
// Full text stored in DB for UI display
// Only IDs sent to LLM = massive token savings
```

**Context Reduction:**
- Legacy: Full message history (10 messages)
- Optimized: Recent messages only (6 messages)
- RAG context: IDs instead of full text
- Target: 52% token reduction (1800 vs 3750)

### Git Commits
- `3d4e645` - feat: Phase 2 - Server integration with SessionDB
- `d6f6860` - fix: Generate message_id and sequence_number

### UI Integration Note
**User requirement:** Feature flag must be accessible in UI, not buried in .env file. Users won't remember to check .env flags during regular use. Settings panel or visible toggle required for Phase 2 completion.

---

## Phase 3: Image Generation Integration (COMPLETED) ✅

**Goal:** Add Replicate API, Memory Bank MCP, and Context7 MCP for full image generation workflow

### Features Implemented ✅

**Modular Service Architecture:**
- ✅ Created `services/` directory for external integrations
- ✅ **ReplicateService** (`services/replicate-service.js`)
  - Flux model support (schnell, dev, pro)
  - SDXL support
  - LoRA training capabilities
  - Configurable models (easy to swap in v1.0)
- ✅ **MemoryService** (`services/memory-service.js`)
  - MCP (Model Context Protocol) integration
  - Remembers successful generations
  - Saves user preferences
  - Tracks failed generations (avoid repeating mistakes)
- ✅ **Context7Service** (`services/context7-service.js`)
  - Fetches live documentation from GitHub
  - Auto-triggers on keywords ("latest", "new", etc.)
  - Gracefully degrades if unavailable

**New API Endpoints:**
- ✅ `POST /generate-image` - Generate with RAG-enhanced prompts
- ✅ `GET /generate-image/models` - List available models
- ✅ `POST /train-lora` - Train custom LoRA models
- ✅ `GET /memory/stats` - Memory statistics
- ✅ `POST /memory/preference` - Save user preferences
- ✅ `GET /services/status` - Check all service statuses

**Enhanced /conversation Endpoint:**
- ✅ Memory Bank integration (recalls past successful patterns)
- ✅ Context7 integration (fetches live docs when needed)
- ✅ Combined context: RAG + Live Docs + Memories

**Configuration:**
- ✅ Updated `.env.example` with Replicate API token
- ✅ MCP services auto-start via npx (no extra config)
- ✅ Graceful degradation if services unavailable

### Image Generation Flow

```
User Prompt
    ↓
[Memory Bank] ← Recall past successful prompts
    ↓
[RAG Search] ← Find best practices from knowledge base
    ↓
[Grok API] ← Enhance prompt with retrieved context
    ↓
[Replicate] ← Generate image (Flux/SDXL)
    ↓
[Memory Bank] ← Save successful generation
    ↓
[SessionDB] ← Store metadata
```

### Testing Results ✅

**Services Status:**
```bash
curl http://localhost:3000/services/status
```
```json
{
  "replicate": { "enabled": false, "models": [] },  # Needs API token
  "memory": { "enabled": true },                     # ✅ Working
  "context7": { "enabled": false },                  # Package not found
  "rag": { "enabled": true },                        # ✅ Working
  "sessions": { "enabled": true }                    # ✅ Working
}
```

**Key Achievements:**
- Memory Bank MCP successfully integrated
- Modular architecture ready for v1.0 (user-selectable models/datasets)
- All services gracefully degrade if unavailable
- Zero breaking changes to existing features

### Git Commits
- `100cc80` - docs: Update ROADMAP - Phase 2 backend complete
- `d6f6860` - fix: Generate message_id and sequence_number
- `3d4e645` - feat: Phase 2 - Server integration with SessionDB

---

## Phase 3.5: Knowledge Base Enhancement (COMPLETED) ✅

**Goal:** Expand and correct knowledge base with Fal.ai integration, content safety, and creator business strategies

### Features Implemented ✅

**Critical Corrections:**
- ✅ **Nano Banana Pro Fix** - Removed incorrect 25-word prompt limit (v0.3→v0.4)
  - Old guidance: "Under 25 words (30% higher accuracy)"
  - New guidance: "Flexible. Short prompts work, but detailed prompts encouraged"
  - Source: Official Google blog confirms NO strict word limit
  - Impact: Prevents unnecessary user constraints

- ✅ **Language Flexibility** - Softened absolute terms across all guides
  - MUST → recommended
  - NEVER → not recommended
  - Added "When to Break the Rules" sections
  - More nuanced, experimental-friendly guidance

**New Technical Knowledge (3 files):**
- ✅ `09_fal_ai_integration.md` - Comprehensive Fal.ai service guide
- ✅ `03b_flux_fal_quick_ref.md` - Quick reference for Flux on Fal.ai
- ✅ `10_content_safety_guidelines.md` - SFW/NSFW generation guidelines

**New Business Knowledge (6 files):**
- ✅ `11_fanvue_startup_guide.md` - Complete startup guide for FanVue creators
- ✅ `12_fanvue_content_schedule.md` - Week 1 content schedule
- ✅ `13_fanvue_pricing_strategy.md` - Subscription and PPV pricing
- ✅ `14_onlyfans_content_strategy.md` - Platform-specific strategies
- ✅ `15_boudoir_pose_research.md` - AI prompting for poses
- ✅ `16_adult_content_creation.md` - Best practices and research

**Updated Core Files (6 files):**
- ✅ `01_photorealistic_prompting_v03.md` → v0.4
- ✅ `02a_qwen_specifics.md` → v0.4
- ✅ `02b_flux_specifics.md` → v0.4
- ✅ `04_troubleshooting_v03.md` → v0.4 (added API troubleshooting)
- ✅ `07_instagram_authentic_v03.md` → updated
- ✅ `08_model_specific_best_practices.md` → v4.0

**Research Documentation:**
- ✅ Moved 11 research files to `/docs/research/`
- ✅ Official findings (Flux, Qwen, Nano Banana Pro)
- ✅ Analysis summaries and planning documents
- ✅ Strictness analysis and imperfection research

**RAG System Updates:**
- ✅ Updated `rag/simple-rag.js` to index both `knowledge/core/` and `knowledge/business/`
- ✅ Rebuilt embeddings cache
- ✅ **Impact:** 125→729 chunks (+483% coverage)
- ✅ **Files:** 9→18 knowledge files (+100%)

**Documentation Updates:**
- ✅ Updated README.md with new knowledge base structure
- ✅ Updated USER_GUIDE.md with content categories and example queries
- ✅ Updated ROADMAP.md (this file)

### Knowledge Base Structure

```
knowledge/
├── core/                    # Technical (12 files)
│   ├── 01_photorealistic_prompting_v03.md (v0.4)
│   ├── 02_ostris_training_core.md
│   ├── 02a_qwen_specifics.md (v0.4)
│   ├── 02b_flux_specifics.md (v0.4)
│   ├── 03_qwen_quick_reference.md
│   ├── 03b_flux_fal_quick_ref.md (NEW)
│   ├── 04_troubleshooting_v03.md (v0.4)
│   ├── 06_higgsfield_integration_v03.md
│   ├── 07_instagram_authentic_v03.md
│   ├── 08_model_specific_best_practices.md (v4.0)
│   ├── 09_fal_ai_integration.md (NEW)
│   └── 10_content_safety_guidelines.md (NEW)
│
└── business/                # Creator Economy (6 files)
    ├── 11_fanvue_startup_guide.md (NEW)
    ├── 12_fanvue_content_schedule.md (NEW)
    ├── 13_fanvue_pricing_strategy.md (NEW)
    ├── 14_onlyfans_content_strategy.md (NEW)
    ├── 15_boudoir_pose_research.md (NEW)
    └── 16_adult_content_creation.md (NEW)
```

### Git Commits
- Will be committed on `data-enhancement` branch
- Separate from feature code for clear git history

---

## Phase 4: UI Integration for Image Generation (NEXT)

**Goal:** Add image generation UI to web interface with API key management

### Tasks (Planned)

**4.1: Settings Panel with API Key Management**
- [ ] Create Settings modal/panel (⚙️ icon in header)
- [ ] **API Keys Section** (instead of .env file):
  - [ ] Input field: `XAI_API_KEY` (Grok) - Required
  - [ ] Input field: `FAL_API_KEY` (Image generation) - Optional
  - [ ] Input field: `REPLICATE_API_TOKEN` (Alternative) - Optional
  - [ ] Input field: `HUGGINGFACE_API_KEY` (Z-Image-Turbo) - Optional
  - [ ] Password-style inputs (hidden by default, show/hide button)
  - [ ] "Test Connection" button for each key
  - [ ] Status indicators (🟢 Connected, 🔴 Invalid, ⚪ Not set)
  - [ ] Save keys to localStorage (browser-only, not server)
  - [ ] Warning: "Keys stored in browser only. Clear on logout."
- [ ] **Feature Toggles**:
  - [ ] `USE_DB_SESSIONS` on/off toggle
  - [ ] Show which services are enabled (from `/services/status`)
- [ ] **Current Provider Display**:
  - [ ] "Image Generation: Fal.ai" (or "None", "Replicate")
  - [ ] "Image-to-Image: HuggingFace Z-Image-Turbo" (or "None")

**4.2: Image Generation Interface**
- [ ] Add "Generate Image" button in chat interface
- [ ] Show enhanced prompt before generation
- [ ] Display generated images inline
- [ ] Add model selector dropdown (flux-schnell, flux-dev, z-image-turbo)
- [ ] Add generation settings panel:
  - Width/Height sliders
  - Steps slider
  - Guidance scale
  - Seed (for reproducibility)
- [ ] Show generation metadata (duration, model used, cost estimate)
- [ ] Save generated images to session history

**4.3: Image-to-Image Interface**
- [ ] Upload/paste existing image
- [ ] Transformation prompt input
- [ ] Strength slider (how much to transform)
- [ ] Preview original vs transformed side-by-side

**4.4: Training UI**
- [ ] LoRA training request form
- [ ] Z-Image-Turbo training guide display
- [ ] Training status tracker

### API Key Flow (New Approach)

**Old:** User edits `.env` file → Restarts server
**New:** User enters keys in UI → Stored in localStorage → Sent with each request

**Implementation:**
```javascript
// Frontend stores keys in localStorage
localStorage.setItem('apiKeys', JSON.stringify({
  xai: 'key...',
  fal: 'key...',
  huggingface: 'key...'
}));

// Each API request includes keys in headers
fetch('/generate-image', {
  headers: {
    'X-FAL-API-Key': localStorage.getItem('apiKeys').fal
  },
  body: { prompt: '...' }
});

// Server checks header first, falls back to .env
const falKey = req.headers['x-fal-api-key'] || process.env.FAL_API_KEY;
```

**Security Considerations:**
- ⚠️ Keys in localStorage are accessible to JavaScript (XSS risk)
- ✅ Keys never stored on server (privacy)
- ✅ User controls their own keys
- 🔒 HTTPS required in production
- 🔄 Option to still use .env for server-managed keys

**UI/UX Benefits:**
- ✅ No need to edit files
- ✅ No server restart required
- ✅ Instant provider switching
- ✅ Easy to test multiple keys
- ✅ Clear visual status of what's enabled

---

## Phase 4.5: Prompt Library & History (SMART ADDITION)

**Goal:** Build a reusable prompt library from successful generations

### Tasks (Planned)
- [ ] **Prompt Library**:
  - [ ] Save successful prompts (original + enhanced)
  - [ ] Star/favorite prompts
  - [ ] Tag prompts by style (cyberpunk, realistic, fantasy)
  - [ ] Search library by tags or keywords
  - [ ] "Use this prompt" button to copy to input
  - [ ] Export library as JSON
- [ ] **Generation History**:
  - [ ] View all past generations with thumbnails
  - [ ] Filter by model, date, rating
  - [ ] Regenerate with same settings
  - [ ] Compare variations (same prompt, different seeds)
- [ ] **Smart Suggestions**:
  - [ ] "Similar prompts" based on current input
  - [ ] Auto-suggest tags based on prompt content
  - [ ] Show cost estimate before generating

### Why This Matters:
- ✅ Learn from successful patterns
- ✅ Faster iteration (no rewriting prompts)
- ✅ Build personal style guide
- ✅ Track what works best

---

## Phase 4.6: Batch Operations & Workflows (POWER USER FEATURES)

**Goal:** Enable professional workflows for multiple generations

### Tasks (Planned)
- [ ] **Batch Generation**:
  - [ ] Upload CSV with prompts → Generate all
  - [ ] Generate variations (same prompt, 10 different seeds)
  - [ ] A/B testing (compare 2 prompts side-by-side)
  - [ ] Queue system (generate 50 images overnight)
- [ ] **Workflows**:
  - [ ] Pipeline: Generate → Enhance (Z-Image-Turbo) → Upscale
  - [ ] Auto-apply LoRA to all generations
  - [ ] Preset profiles (Instagram style, Product shots, etc.)
- [ ] **Export/Import**:
  - [ ] Download all images as ZIP
  - [ ] Export metadata as CSV (for dataset creation)
  - [ ] Import existing datasets for LoRA training

### Why This Matters:
- ✅ Professional use cases (agencies, creators)
- ✅ Dataset creation for training
- ✅ Time savings (automation)

---

## Phase 4.7: Cost Tracking & Analytics (BUSINESS INTELLIGENCE)

**Goal:** Track costs and optimize spending

### Tasks (Planned)
- [ ] **Cost Dashboard**:
  - [ ] Total spent per provider (Fal, Replicate, HF)
  - [ ] Cost per image by model
  - [ ] Monthly spending chart
  - [ ] Budget alerts ("You've spent $50 this month")
- [ ] **Performance Analytics**:
  - [ ] Average generation time by model
  - [ ] Success rate (% of generations that worked)
  - [ ] Most-used models
  - [ ] Peak usage times
- [ ] **ROI Tracking**:
  - [ ] Tag generations by project/client
  - [ ] Cost per project
  - [ ] Compare provider costs (Fal vs Replicate)

### Why This Matters:
- ✅ Budget control
- ✅ Provider optimization (choose cheapest)
- ✅ Client billing transparency

---

## Phase 4.8: Collaboration & Sharing (TEAM FEATURES)

**Goal:** Enable team workflows and sharing

### Tasks (Planned)
- [ ] **User Accounts**:
  - [ ] Simple auth (email/password or GitHub OAuth)
  - [ ] Per-user API keys and sessions
  - [ ] User-specific prompt libraries
- [ ] **Sharing**:
  - [ ] Share generated images with link
  - [ ] Share prompts with team
  - [ ] Public gallery (opt-in)
- [ ] **Team Features**:
  - [ ] Shared prompt library
  - [ ] Comment on generations
  - [ ] Approve/reject workflow

### Why This Matters:
- ✅ Team collaboration
- ✅ Knowledge sharing
- ✅ Quality control

---

## Phase 5: LLM-Generated Summaries (FUTURE)

**Goal:** Auto-generate session summaries for highly-rated conversations

### Tasks (Planned)
- [ ] Create summary endpoint: `POST /sessions/:id/summarize`
- [ ] Use grok-3 (cheaper model) for summaries
- [ ] Trigger auto-summarize on rating >= 5 stars
- [ ] Store summary in sessions.summary field
- [ ] Summary format: "User asked about X. Helped with Y. Key points: Z."
- [ ] Add summary display in UI
- [ ] Skip verbose LLM explanations (concise output only)

---

## Phase 4: Tab-Based UI (FUTURE)

**Goal:** Add Sessions and Stats tabs to web interface

### Tasks (Planned)
- [ ] Create tab navigation (Chat | Sessions | Stats)
- [ ] Sessions tab:
  - List all sessions with title, date, rating
  - Click to load session messages
  - Delete button with confirmation
  - Filter by rating, date range
- [ ] Stats tab:
  - Average rating over time
  - Most common topics (from summaries)
  - Token usage statistics
  - Feedback distribution chart

---

## Phase 5: Message Editing & Branching (FUTURE)

**Goal:** Allow users to edit messages and create conversation branches

### Tasks (Planned)
- [ ] Add edit button to user messages
- [ ] On edit: Show keep/delete dialog for current branch
- [ ] Create new branch from edited message
- [ ] Update branch_id for diverged messages
- [ ] Show branch indicator in UI
- [ ] Auto-delete old branch after summary (if user confirms)

---

## Phase 6: Cleanup & Optimization (FUTURE)

**Goal:** Remove feature flags, optimize performance, finalize v1.0

### Tasks (Planned)
- [ ] Remove USE_DB_SESSIONS flag (always on)
- [ ] Archive old feedback.db schema
- [ ] Add database indexes for performance
- [ ] Implement database backup/restore
- [ ] Add export functionality for training data
- [ ] Documentation updates
- [ ] Release v1.0

---

## Original Learning Roadmap (Long-term)

### Phase 7: Build Training Dataset

**Goal:** Process feedback into structured training data

### Tasks
- [ ] Export high-rated examples (rating >= 5)
- [ ] Export low-rated examples (rating <= 3) with corrections
- [ ] Create JSON dataset format:
  ```json
  {
    "question": "user query",
    "context": "RAG chunks used",
    "response": "assistant answer",
    "rating": 6,
    "feedback": "user notes",
    "result_image": "path/to/image",
    "corrections": "what should have been said"
  }
  ```
- [ ] Link feedback to original conversation (store query + context with each response)
- [ ] Build "good examples" library (5+ stars)
- [ ] Build "bad examples" library (3- stars with user corrections)

### Tools to Build
- `scripts/export-training-data.js` - Export feedback to JSONL format
- `scripts/analyze-feedback.js` - Generate insights from feedback patterns
- Filter by:
  - High ratings → Add to knowledge base as examples
  - Low ratings → Identify common failure patterns
  - Images with notes → Vision critique training data

---

## Phase 8: Use the Training Data (FUTURE)

**Goal:** Improve system using collected feedback

### Option A: Enhance Knowledge Base (Easiest)
- Add best-rated prompt examples to knowledge base
- Create "Common Mistakes" document from low-rated feedback
- Add image critique examples from result images + notes
- **Effort:** Low
- **Timeline:** 1-2 weeks
- **Benefit:** Immediate improvement via better RAG context

### Option B: Fine-tune LLM (Medium Complexity)
- Use high-rated examples for supervised fine-tuning
- Format as prompt/response pairs
- Fine-tune Grok or local model (via API or LoRA)
- **Effort:** Medium
- **Timeline:** 1-2 months
- **Benefit:** Model learns your specific critique style

### Option C: Vision Model Training (Complex)
- Train custom image critique model
- Use result images + user notes as training data
- Detect common AI image flaws automatically
- **Effort:** High
- **Timeline:** 3-6 months
- **Benefit:** Automated image quality analysis

### Option D: Feedback Loop (Advanced)
- Automatically incorporate high-rated responses into knowledge base
- Use low-rated responses to refine prompts
- A/B test different prompt strategies
- **Effort:** High
- **Timeline:** 2-3 months
- **Benefit:** Self-improving system

---

## Implementation Timeline

### Completed ✅
1. **Phase 1** (v0.5.1): Database foundation - Session persistence, token optimization, extended feedback

### Near Term (Next 2-4 weeks)
2. **Phase 2**: Server integration with USE_DB_SESSIONS feature flag
3. **Phase 3**: LLM-generated summaries for 5+ star sessions

### Medium Term (1-2 months)
4. **Phase 4**: Tab-based UI (Chat | Sessions | Stats)
5. **Phase 5**: Message editing and conversation branching

### Long Term (3-6 months)
6. **Phase 6**: Cleanup and v1.0 release
7. **Phase 7**: Build training dataset export tools
8. **Phase 8**: Use training data (enhance knowledge base, fine-tuning, etc.)

---

## Success Metrics

### Phase 1 (Completed) ✅
- ✅ SessionDB module created and tested
- ✅ Feedback database extended with message links
- ✅ Token optimization strategy designed (52% reduction target)
- ✅ All tests passing
- ✅ Committed and pushed to GitHub

### Phase 2 (Next)
- Feature flag implementation works
- No breaking changes when flag OFF
- 50%+ token reduction when flag ON
- Feedback properly linked to messages

### Phase 3
- Summaries generated for 5+ star sessions
- Summary quality rated by users
- grok-3 successfully used (cost reduction)

### Later Phases
- **Phase 7:** Export tool creates valid JSONL with 20+ examples
- **Phase 8:** RAG retrieval includes user-validated examples
- **Option B:** Fine-tuned model scores higher on test set
- **Option C:** Vision model achieves 80%+ accuracy on common flaws

---

## Data Quality Guidelines

### What Makes Good Training Data?
**High-Rated (5-7 stars):**
- Clear, actionable responses
- Properly formatted prompts
- Accurate technical details
- Helpful examples from knowledge base

**Low-Rated (1-3 stars) WITH user corrections:**
- User specifies what was wrong
- User provides correct answer or approach
- Result image shows the actual issue
- Clear improvement path

### Data to Prioritize
1. **Feedback with result images** - Most valuable for vision training
2. **Detailed notes** - Explains what to improve
3. **Edge cases** - Unusual queries that failed
4. **Consistent patterns** - Same issue across multiple sessions

---

## Technical Notes

### Current Storage
- **Location:** `rag/feedback.db` (SQLite)
- **Images:** `rag/feedback_images/` (base64 decoded to JPG/PNG)
- **Backup:** Add to `.gitignore`, backup separately

### API Endpoints
- `POST /feedback` - Submit feedback
- `GET /feedback/stats` - View statistics
- (Future) `GET /feedback/export` - Download training data
- (Future) `GET /feedback/good-examples` - Get 5+ rated examples

### Database Queries

**Get good examples:**
```sql
SELECT * FROM feedback WHERE rating >= 5 ORDER BY rating DESC;
```

**Get examples needing improvement:**
```sql
SELECT * FROM feedback WHERE rating <= 3 AND notes IS NOT NULL;
```

**Get statistics:**
```sql
SELECT AVG(rating), COUNT(*), SUM(CASE WHEN thumbs='up' THEN 1 ELSE 0 END) FROM feedback;
```

---

## Development Notes

### Token Efficiency Focus
- All design decisions prioritize token reduction
- Store full context in DB, send minimal context to LLM
- Use cheaper models (grok-3) for non-critical tasks
- Concise but not "cheap" - quality maintained

### Incremental Rollout Strategy
- Feature flags for safe deployment
- Each phase independently testable
- No breaking changes to existing functionality
- Database foundation ready before UI changes

### Learning System Philosophy
- Start with **Phase 1** (done!) - build infrastructure
- Don't optimize prematurely - see what patterns emerge
- Focus on quality over quantity (10 great examples > 100 poor ones)
- User corrections are GOLD - encourage detailed feedback
- Images with notes are most valuable - build on this

**Current Status (v0.5.1):** Database foundation complete. Ready for Phase 2 integration.
