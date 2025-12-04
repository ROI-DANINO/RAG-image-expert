# RAG Image Expert - Development Roadmap

## Current Status: Phase 1 Complete (v0.5.1) ✅

**Last Updated:** 2025-12-04
**Version:** 0.5.1 "Session Management & Learning Foundation"

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

## Phase 3: LLM-Generated Summaries (FUTURE)

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
