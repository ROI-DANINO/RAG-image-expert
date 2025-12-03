# RAG Image Expert

**Semantic search engine + LLM integration for AI image generation workflows**

Retrieve-Augmented Generation (RAG) system specialized in photorealistic prompts, LoRA training, and Instagram authenticity. Works with any OpenAI-compatible LLM (Grok, OpenAI, Ollama, LM Studio, etc.).

---

## Features

- **Fast Semantic Search**: ~7ms query response using local embeddings
- **LLM Integration**: Supports any OpenAI-compatible API
- **Multi-Query RAG**: Automatic query expansion for better context
- **Local & API**: Works with both local LLMs and cloud APIs
- **REST API Server**: Deploy as a service
- **CLI Chat**: Interactive terminal interface
- **Offline Embeddings**: No API calls for search (Xenova transformers)

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
AI_MODEL=grok-beta
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

### REST API Server
```bash
npm start
# Server runs on http://localhost:3000
```

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
```

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
