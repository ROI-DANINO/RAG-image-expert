# RAG Image Expert

**Semantic search engine + LLM integration for AI image generation workflows**

Retrieve-Augmented Generation (RAG) system specialized in photorealistic prompts, LoRA training, and Instagram authenticity. Works with any OpenAI-compatible LLM (Grok, OpenAI, Ollama, LM Studio, etc.).

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [1. Install](#1-install)
  - [2. Configure LLM](#2-configure-llm)
  - [3. Start Chatting](#3-start-chatting)
- [Usage](#usage)
  - [CLI Chat Mode](#cli-chat-mode)
  - [REST API Server & Web UI](#rest-api-server--web-ui)
  - [API Endpoints](#api-endpoints)
- [Supported LLMs](#supported-llms)
- [Docker Quick Start](#docker-quick-start)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [How It Works](#how-it-works)
- [Knowledge Base](#knowledge-base)
- [Feedback & Learning System](#feedback--learning-system)
  - [Providing Feedback](#providing-feedback)
  - [What Gets Stored](#what-gets-stored)
  - [Future Use (Roadmap)](#future-use-roadmap)
  - [Session Management](#session-management-phase-1-complete)
- [Troubleshooting](#troubleshooting)
  - [Docker/Container Issues](#dockercontainer-issues)
  - [LLM Integration Issues](#llm-integration-issues)
- [License](#license)
- [Contributing](#contributing)
- [Next Steps for Testing](#next-steps-for-testing)

---

## Features

- **Fast Semantic Search**: ~7ms query response using local embeddings
- **LLM Integration**: Supports any OpenAI-compatible API
- **Multi-Query RAG**: Automatic query expansion for better context
- **Local & API**: Works with both local LLMs and cloud APIs
- **REST API Server**: Deploy as a service with web UI
- **CLI Chat**: Interactive terminal interface
- **Offline Embeddings**: No API calls for search (Xenova transformers)
- **Persistent Sessions**: Conversations saved to SQLite database
- **Feedback System**: Rate responses (👍/👎, 1-7 stars) with notes and images
- **Token Optimized**: 52% reduction in context tokens for cost efficiency
- **Learning Database**: Track what works, build training datasets from user feedback

---

## Quick Start

### Prerequisites

Before starting, ensure you have:
- **Node.js 16+** installed ([download here](https://nodejs.org/))
- **npm** (comes with Node.js)
- **git** (for cloning the repository)

**For Docker/container users:**
```bash
# Install Node.js and git
apt-get update && apt-get install -y nodejs npm git

# Or for newer Node.js (recommended):
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs git
```

### 1. Install
```bash
git clone https://github.com/ROI-DANINO/RAG-image-expert.git
cd RAG-image-expert
npm install
```

**Note:** `npm install` will download:
- Dependencies to `node_modules/` (~85 packages)
- Embedding model (~90MB, one-time download on first use)

### 2. Configure LLM
```bash
cp .env.example .env
# Edit .env with your API key or local LLM settings
```

**For Grok API:**
```bash
XAI_API_KEY=your-key-here
AI_MODEL=grok-4-1-thinking
```

**For Local LLM (Ollama):**
```bash
# Install Ollama first: curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.2

# In .env:
AI_BASE_URL=http://localhost:11434/v1
AI_MODEL=llama3.2
# No API key needed!
```

### 3. Start Chatting
```bash
# CLI chat
npm run chat

# OR start REST API server
npm start
```

---

## Usage

### CLI Chat Mode
```bash
npm run chat
```

Interactive terminal chat with RAG-enhanced responses.

### REST API Server & Web UI
```bash
npm start
# Server runs on http://localhost:3000
# Open http://localhost:3000 in your browser for the web UI
```

**Web Interface Features:**
- Interactive chat with markdown rendering
- Image upload/paste support (Ctrl+V)
- Feedback system (thumbs, ratings, notes)
- Multiline input (Shift+Enter for new line)
- Session persistence across page reloads

#### API Endpoints

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Search (RAG only, no LLM):**
```bash
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Instagram selfie techniques", "topK": 5}'
```

**Chat (Stateless):**
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I train a LoRA?"}'
```

**Conversation (Stateful with history):**
```bash
curl -X POST http://localhost:3000/conversation \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "user123",
    "message": "What are the best practices for Instagram prompts?"
  }'
```

---

## Supported LLMs

The system works with **any OpenAI-compatible API**:

| Provider | Configuration |
|----------|---------------|
| **xAI Grok** | Default, API key required |
| **OpenAI** | Set `AI_BASE_URL=https://api.openai.com/v1` |
| **Ollama** (local) | Set `AI_BASE_URL=http://localhost:11434/v1` |
| **LM Studio** (local) | Set `AI_BASE_URL=http://localhost:1234/v1` |
| **Custom** | Any OpenAI-compatible endpoint |

See [`docs/LLM_INTEGRATION.md`](docs/LLM_INTEGRATION.md) for detailed setup instructions.

---

## Docker Quick Start

### Testing in Fresh Container (Grok API)

```bash
# 1. Pull and run Node.js container
docker run -it node:18 bash

# 2. Inside container - install git (if needed)
apt-get update && apt-get install -y git

# 3. Clone and setup
git clone https://github.com/ROI-DANINO/RAG-image-expert.git
cd RAG-image-expert
npm install

# 4. Configure for Grok API
cp .env.example .env
nano .env  # or vi .env
# Add your XAI_API_KEY=your-key-here
# Save and exit (Ctrl+X, Y, Enter for nano)

# 5. Start chatting!
npm run chat
```

### RunPod / Local LLM Setup

```bash
# 1. Install Ollama on RunPod
curl -fsSL https://ollama.com/install.sh | sh

# 2. Pull a model
ollama pull llama3.2

# 3. Clone and setup
git clone https://github.com/ROI-DANINO/RAG-image-expert.git
cd RAG-image-expert
npm install

# 4. Configure for local LLM
cp .env.example .env
nano .env
# Set: AI_BASE_URL=http://localhost:11434/v1
# Set: AI_MODEL=llama3.2
# No API key needed!

# 5. Start chatting
npm run chat
```

---

## Project Structure

```
RAG-image-expert/
├── rag-chat.js          # CLI chat interface
├── rag-server.js        # REST API server
├── rag/
│   ├── simple-rag.js    # Core RAG implementation
│   └── knowledge.db     # SQLite + embeddings
├── docs/
│   └── LLM_INTEGRATION.md  # Detailed LLM setup guide
├── .env.example         # Configuration template
└── package.json         # Dependencies & scripts
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `XAI_API_KEY` | Yes* | - | API key for LLM (*not needed for localhost) |
| `AI_BASE_URL` | No | `https://api.x.ai/v1` | LLM API endpoint |
| `AI_MODEL` | No | `grok-beta` | Model name |
| `PORT` | No | `3000` | Server port |

---

## How It Works

1. **Semantic Search**: User query → Xenova embeddings → Cosine similarity → Top K chunks
2. **Query Expansion**: Automatically adds related queries (e.g., "Instagram" → also searches "POV framework")
3. **Context Building**: Format retrieved chunks with scores and sections
4. **LLM Generation**: Send context + query to LLM → Generate response
5. **Multi-turn Support**: Conversation history maintained per session

---

## Knowledge Base

The system includes pre-indexed knowledge on:
- Photorealistic prompt engineering
- LoRA training (Ostris, Qwen, Flux models)
- Instagram authenticity framework
- POV selection and camera techniques
- Imperfection layers for realism

Add your own knowledge by placing `.md` files in `knowledge/` and rebuilding the index:
```bash
npm run build-index
# Or run directly:
node rag/simple-rag.js build-index
```

---

## Feedback & Learning System

The system collects user feedback to improve over time and build training datasets.

### Providing Feedback

After each AI response, you can:
- **Quick Feedback**: Click 👍 or 👎
- **Detailed Rating**: Rate 1-7 stars
- **Add Notes**: Click "Add details" to:
  - Write what should be fixed
  - Upload the result image
  - Provide corrections

### What Gets Stored

Feedback is saved in SQLite database (`rag/feedback.db`) with:
- Your rating and notes
- The original question and response
- RAG context that was used
- Result images (if uploaded)
- Links to conversation sessions

### Future Use (Roadmap)

Collected feedback will be used to:
- **Phase 2**: Export high-rated examples (5+ stars) to JSONL
- **Phase 3**: Add best examples to knowledge base
- **Phase 4**: Fine-tune model on your feedback data
- **Phase 5**: Build vision model for image critique

See [ROADMAP.md](ROADMAP.md) for detailed learning system plans.

### Session Management (Phase 1 Complete)

Conversations are now persistent:
- Stored in SQLite database (`rag/sessions.db`)
- Survive page reloads and server restarts
- Token-optimized: sends minimal context to LLM
- Foundation for future session browsing UI

**Coming Soon (Phase 2+):**
- Web UI tabs: Chat | Sessions | Stats
- Browse past conversations
- AI-generated session summaries
- Message editing with branching
- Session export and learning analytics

---

## Troubleshooting

### Docker/Container Issues

**"git: command not found"**
```bash
apt-get update && apt-get install -y git
```

**"npm: command not found" or old Node.js version**
```bash
# Install newer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
node --version  # Should show v18.x or higher
```

**"Cannot find module" errors**
```bash
# Make sure you're in the project root
cd RAG-image-expert
npm install
```

### LLM Integration Issues

**"No API key found"**
- Create `.env` file from `.env.example`: `cp .env.example .env`
- Add your API key (not needed for localhost)
- Verify the file exists: `ls -la .env`

**"Connection refused" (local LLM)**
- Make sure Ollama/LM Studio is running
- Check the port matches your config
- For Ollama: Run `ollama list` to verify models are installed

**"Module 'simple-rag.js' not found"**
```bash
# The RAG files are in the rag/ subdirectory
cd rag
ls simple-rag.js  # Should exist
```

**Slow responses**
- Use smaller models locally (e.g., `llama3.2` not `llama3.2:70b`)
- Reduce `topK` for less context
- Check your system has enough RAM (4GB+ recommended)

---

## License

BSD-3-Clause

---

## Contributing

Issues and PRs welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Next Steps for Testing

**With Docker (fresh environment):**
1. Clone the repo
2. Run `npm install`
3. Copy `.env.example` to `.env`
4. Add your Grok API key
5. Run `npm run chat`

**With RunPod (local LLM):**
1. Start Ollama on RunPod
2. Pull a model: `ollama pull llama3.2`
3. In `.env`: Set `AI_BASE_URL=http://localhost:11434/v1`
4. Run `npm run chat` - no API key needed!

---

**Ready to test? Let me know if you hit any issues!**
