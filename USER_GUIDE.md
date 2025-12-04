# RAG Image Expert - Quick User Guide

**Version:** 0.6.0 "Image Generation Integration"
**Status:** Production-ready with MCP services

---

## What Is This?

A **RAG-powered AI assistant** for image generation workflows with:
- 🔍 **Smart search** across 18 knowledge files (729 indexed chunks)
- 🎨 **Image generation** via Fal.ai/Replicate API (Flux models)
- 🧠 **Memory system** that remembers successful prompts
- 💬 **Persistent sessions** with SQLite storage
- ⚡ **Token-optimized** (52% reduction)
- 💼 **Business strategies** for FanVue/OnlyFans creators

---

## Quick Start

### 1. Install & Configure

```bash
# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
nano .env  # Add your API keys
```

### 2. API Keys Needed

| API | Required? | Purpose | Get it from |
|-----|-----------|---------|-------------|
| **Grok (xAI)** | ✅ **YES** | Chat, prompt enhancement, RAG responses | [console.x.ai](https://console.x.ai) |
| **Fal.ai** | ⚠️ Optional | Image generation (Flux, SDXL) - **RECOMMENDED** | [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys) |
| **Replicate** | ⚠️ Optional | Image generation (alternative to Fal) | [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens) |

**Minimum config (.env):**
```env
XAI_API_KEY=your-grok-api-key        # Required for all features
```

**Full config (with image generation):**
```env
XAI_API_KEY=your-grok-api-key        # Required
FAL_API_KEY=your-fal-key             # Recommended - faster & cheaper
# OR
REPLICATE_API_TOKEN=your-token       # Alternative image provider
USE_DB_SESSIONS=true                 # Optional - session persistence
```

**Cost comparison:**
- **Grok API:** ~$5/million tokens (pay-as-you-go)
- **Fal.ai:** ~$0.003/image (Flux Schnell), ~$0.04/image (Flux Pro) | **2-5s generation**
- **Replicate:** ~$0.003/image (Flux Schnell), ~$0.055/image (Flux Pro) | 3-6s generation

💡 **Tip:** Fal.ai is faster and cheaper for Flux models. The system auto-detects which provider you configured.

### 3. Start the Server

```bash
npm start
# Open http://localhost:3000
```

---

## Core Features

### Chat with RAG Context

**Web UI:** Type questions in the chat interface
**API:**
```bash
curl -X POST http://localhost:3000/conversation \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-123",
    "message": "How do I make realistic skin for Instagram?"
  }'
```

**What happens:**
1. RAG searches 18 knowledge files (technical + business)
2. Grok enhances response with retrieved context
3. Memory Bank recalls past successful patterns
4. Response saved to session database

### Content Categories

The knowledge base is organized into two main areas:

**Technical (`knowledge/core/`):**
- Photorealistic prompting (v0.4 - corrected Nano Banana Pro guidance)
- LoRA training (Qwen, Flux, Ostris)
- Fal.ai integration and quick references
- Instagram authenticity framework
- Content safety guidelines (SFW/NSFW)
- Troubleshooting

**Business (`knowledge/business/`):**
- FanVue/OnlyFans creator startup guides
- PPV pricing strategies and subscription tiers
- Content schedules and monetization
- Boudoir pose research for AI prompting
- Adult content platform best practices

**Example Queries:**
```bash
# Technical queries
"What's the optimal prompt length for Nano Banana Pro?"
"How do I use Flux models on Fal.ai?"
"What are content safety best practices for NSFW generation?"

# Business queries
"How should I price PPV content on FanVue?"
"What's a good content schedule for Week 1 on adult platforms?"
"What are effective boudoir poses for AI images?"
```

---

### Generate Images with AI-Enhanced Prompts

**API:**
```bash
curl -X POST http://localhost:3000/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "cyberpunk cat with neon fur",
    "model": "flux-schnell"
  }'
```

**Response:**
```json
{
  "success": true,
  "originalPrompt": "cyberpunk cat with neon fur",
  "enhancedPrompt": "highly detailed cyberpunk cat, glowing neon fur in pink and blue tones, futuristic city background, volumetric lighting, 8k uhd, sharp focus",
  "images": ["https://replicate.delivery/..."],
  "metadata": {
    "model": "flux-schnell",
    "duration": 3.2,
    "timestamp": "2025-12-04T04:23:00.000Z"
  }
}
```

**Available models:**
- `flux-schnell` (fast, 4 steps)
- `flux-dev` (quality, 28 steps)
- `flux-pro` (photorealistic)
- `sdxl` (classic Stable Diffusion)

---

### Train Custom LoRA Models

```bash
curl -X POST http://localhost:3000/train-lora \
  -H "Content-Type: application/json" \
  -d '{
    "trigger_word": "TOK",
    "images_zip_url": "https://example.com/dataset.zip",
    "steps": 1000,
    "learning_rate": 0.0004
  }'
```

**Response:**
```json
{
  "success": true,
  "training_id": "abc123...",
  "status": "starting",
  "trigger_word": "TOK"
}
```

---

### Memory System

**Save preferences:**
```bash
curl -X POST http://localhost:3000/memory/preference \
  -H "Content-Type: application/json" \
  -d '{
    "key": "favorite_style",
    "value": "cyberpunk neon aesthetic"
  }'
```

**Check memory stats:**
```bash
curl http://localhost:3000/memory/stats

# Response:
{
  "enabled": true,
  "totalMemories": 15,
  "lastUpdated": "2025-12-04T04:23:00.000Z"
}
```

---

## API Endpoints

### Image Generation
- `POST /generate-image` - Generate image with RAG-enhanced prompt
- `GET /generate-image/models` - List available models
- `POST /train-lora` - Train custom LoRA model

### Chat & Search
- `POST /conversation` - Stateful chat with memory
- `POST /chat` - Stateless chat
- `POST /search` - Direct RAG search

### Memory
- `GET /memory/stats` - Memory statistics
- `POST /memory/preference` - Save preference

### Sessions
- `GET /sessions` - List all sessions
- `GET /sessions/:id` - Get session with messages
- `DELETE /sessions/:id` - Delete session
- `GET /sessions/:id/stats` - Session analytics

### System
- `GET /services/status` - Check all service statuses
- `GET /health` - Server health check

---

## Examples

### Example 1: Generate Instagram-Style Portrait

```javascript
// 1. Ask RAG for best practices
const searchRes = await fetch('http://localhost:3000/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'Instagram mirror selfie best practices'
  })
});

// 2. Generate image with enhanced prompt
const imageRes = await fetch('http://localhost:3000/generate-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'bedroom mirror selfie, iPhone 14 Pro, natural lighting',
    model: 'flux-dev',
    width: 1024,
    height: 1344  // 9:16 Instagram aspect
  })
});

const result = await imageRes.json();
console.log('Image URL:', result.images[0]);
console.log('Enhanced prompt:', result.enhancedPrompt);
```

---

### Example 2: Build a Prompt Library

```javascript
// Generate variations and save successful ones
const prompts = [
  'cyberpunk street at night',
  'fantasy forest with magic',
  'minimalist product shot'
];

for (const prompt of prompts) {
  const res = await fetch('http://localhost:3000/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, model: 'flux-schnell' })
  });

  const result = await res.json();

  // Memory Bank automatically saves successful generations
  console.log(`Generated: ${result.images[0]}`);
}

// Check what was learned
const stats = await fetch('http://localhost:3000/memory/stats');
console.log(await stats.json());
```

---

## Service Architecture

```
User Query
    ↓
[Memory Bank MCP] ← Recall past successful prompts
    ↓
[RAG System] ← Search 10 knowledge files (7ms)
    ↓
[Grok API] ← Enhance prompt with context
    ↓
[Replicate API] ← Generate image (Flux models)
    ↓
[SessionDB] ← Store result + metadata
```

---

## Troubleshooting

### Image Generation Disabled
**Error:** `"Image generation unavailable"`
**Fix:** Add `REPLICATE_API_TOKEN` to `.env`

### Memory Not Working
**Check status:**
```bash
curl http://localhost:3000/services/status
```
**Expected:** `"memory": { "enabled": true }`
**If false:** Memory Bank MCP failed to start (check logs)

### Slow First Query
**Expected:** First query ~30-60s (model loads), then 5-10ms
**Why:** Embedding model downloads once, then cached

### Poor Image Results
**Solutions:**
1. Use more specific prompts
2. Try different models (`flux-dev` > `flux-schnell` quality)
3. Check RAG context with `/search` endpoint first

---

## Configuration Reference

### .env Variables

```env
# LLM (Required)
XAI_API_KEY=your-key
AI_MODEL=grok-4-1-fast-reasoning
AI_BASE_URL=https://api.x.ai/v1

# Image Generation (Optional)
REPLICATE_API_TOKEN=your-token

# Features (Optional)
USE_DB_SESSIONS=true    # Enable session persistence
PORT=3000               # Server port
```

### Models Available

**Chat/Enhancement:**
- `grok-4-1-fast-reasoning` (default)
- `grok-4-1-thinking` (complex queries)

**Image Generation:**
- `flux-schnell` - 4 steps, ~3s, good quality
- `flux-dev` - 28 steps, ~10s, high quality
- `flux-pro` - 50 steps, ~20s, photorealistic
- `sdxl` - Classic Stable Diffusion

---

## Performance Metrics

- **RAG Query:** 7ms average
- **Image Generation:** 3-20s (model dependent)
- **Token Reduction:** 52% with session optimization
- **Knowledge Base:** 542 chunks, 5.9MB cache
- **Services:** Replicate, Memory Bank MCP, SessionDB

---

## Next Steps

1. ✅ Get Replicate API token → Enable image generation
2. ✅ Try `/generate-image` endpoint
3. ✅ Check `/services/status` to see what's enabled
4. ✅ Explore knowledge files in `knowledge/core/`
5. ✅ Read `ROADMAP.md` for v1.0 plans

---

**Status:** All integrations operational 🚀
**Support:** Check logs with `npm start` for service status
