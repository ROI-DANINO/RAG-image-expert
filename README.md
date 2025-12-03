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

### 1. Install
```bash
git clone https://github.com/ROI-DANINO/RAG-image-expert.git
cd RAG-image-expert
npm install
```

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

**User testing in fresh container:**
```bash
# Pull and run
docker run -it node:18 bash

# Inside container:
git clone https://github.com/ROI-DANINO/RAG-image-expert.git
cd RAG-image-expert
npm install
cp .env.example .env

# Edit .env with your configuration
# For Grok API: add XAI_API_KEY
# For local LLM: set AI_BASE_URL to your host's Ollama

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

**"No API key found"**
- Create `.env` file from `.env.example`
- Add your API key (not needed for localhost)

**"Connection refused" (local LLM)**
- Make sure Ollama/LM Studio is running
- Check the port matches your config

**Slow responses**
- Use smaller models locally (e.g., `llama3.2` not `llama3.2:70b`)
- Reduce `topK` for less context

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
