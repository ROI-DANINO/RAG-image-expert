# RAG Image Expert - Development Roadmap

## Current Status: Phase 1 (Feedback Collection) ✅

---

## Phase 1: Feedback Collection System (COMPLETED)

**Goal:** Capture user feedback to build training dataset

### Features Implemented ✅
- **Thumbs Up/Down** - Quick binary feedback on response quality
- **1-7 Star Rating** - Granular quality scoring
- **Feedback Notes** - Text field for "What should be fixed?"
- **Result Image Upload** - Users can show the actual generated image with issues
- **SQLite Storage** - All feedback stored in `rag/feedback.db`
- **Feedback API** - POST `/feedback` and GET `/feedback/stats` endpoints

### Data Collected
- Session ID (links to conversation)
- Timestamp
- Thumbs (up/down)
- Rating (1-7)
- User notes (what to fix)
- Result images (stored in `rag/feedback_images/`)

### Database Schema
```sql
CREATE TABLE feedback (
  id INTEGER PRIMARY KEY,
  feedback_id TEXT UNIQUE,
  session_id TEXT,
  timestamp TEXT,
  thumbs TEXT CHECK(thumbs IN ('up', 'down')),
  rating INTEGER CHECK(rating BETWEEN 1 AND 7),
  notes TEXT,
  result_image_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Usage
Users can:
1. Click 👍/👎 for quick feedback
2. Rate 1-7 stars for detailed scoring
3. Click "Add details" to provide notes and upload result image
4. View feedback stats at `/feedback/stats`

---

## Phase 2: Build Training Dataset (NEXT)

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

## Phase 3: Use the Data (FUTURE)

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

## Recommended Path

### Short Term (1-3 months)
1. ✅ **Phase 1**: Collect feedback (DONE)
2. **Phase 2**: Build dataset export tools
3. **Phase 3A**: Add top examples to knowledge base

### Medium Term (3-6 months)
4. Analyze patterns in low-rated responses
5. Create "Common Mistakes" guide
6. **Option B**: Fine-tune model if dataset is large enough (100+ examples)

### Long Term (6-12 months)
7. Build automated quality scoring
8. Implement feedback loop
9. **Option C**: Vision model training if image dataset is substantial

---

## Success Metrics

### Phase 1 (Current)
- ✅ Feedback UI implemented
- ✅ Database storing feedback
- **Target:** Collect 50+ feedback entries in first month

### Phase 2
- Export tool creates valid JSONL
- Dataset contains 20+ high-quality examples
- Dataset contains 20+ low-rated examples with notes

### Phase 3
- **Option A:** RAG retrieval includes user-validated examples
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

## Notes

- Start with **Phase 1** (done!) - just collect data
- Don't optimize prematurely - see what patterns emerge
- Focus on quality over quantity (10 great examples > 100 poor ones)
- User corrections are GOLD - encourage detailed feedback
- Images with notes are most valuable - build on this

**Current Status:** Feedback system is live! Now we collect and learn.
