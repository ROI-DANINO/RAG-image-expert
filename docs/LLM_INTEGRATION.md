# LLM Integration Guide

This RAG system supports **any OpenAI-compatible LLM API**, including:
- **xAI Grok** (API)
- **OpenAI** (API)
- **Anthropic Claude** (via API adapters)
- **Ollama** (local)
- **LM Studio** (local)
- **Any OpenAI-compatible endpoint**

The system uses the OpenAI chat completions API standard, which most LLM providers support.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment

Copy the example file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:

#### Option A: API-based LLM (xAI Grok, OpenAI, etc.)
```bash
# For xAI Grok
XAI_API_KEY=your-api-key-here
AI_MODEL=grok-beta

# For OpenAI
# XAI_API_KEY=your-openai-key
# AI_BASE_URL=https://api.openai.com/v1
# AI_MODEL=gpt-4
```

#### Option B: Local LLM (Ollama)
```bash
# No API key needed for localhost
AI_BASE_URL=http://localhost:11434/v1
AI_MODEL=llama3.2
```

#### Option C: Local LLM (LM Studio)
```bash
AI_BASE_URL=http://localhost:1234/v1
AI_MODEL=local-model
```

### 3. Start the System

**CLI Chat:**
```bash
npm run chat
```

**REST API Server:**
```bash
npm start
```

---

## Using with Different LLMs

### xAI Grok (Default)
```bash
XAI_API_KEY=your-key
AI_MODEL=grok-beta
# AI_BASE_URL defaults to https://api.x.ai/v1
```

### OpenAI
```bash
XAI_API_KEY=sk-your-openai-key
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4
```

### Anthropic Claude (via OpenAI-compatible proxy)
```bash
XAI_API_KEY=your-anthropic-key
AI_BASE_URL=https://your-proxy.com/v1
AI_MODEL=claude-3-5-sonnet-20241022
```

### Ollama (Local)
```bash
# 1. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. Pull a model
ollama pull llama3.2

# 3. Configure .env (no API key needed)
AI_BASE_URL=http://localhost:11434/v1
AI_MODEL=llama3.2

# 4. Start chatting
npm run chat
```

### LM Studio (Local)
```bash
# 1. Download and start LM Studio
# 2. Load a model and start the server
# 3. Configure .env
AI_BASE_URL=http://localhost:1234/v1
AI_MODEL=local-model
```

---

## API Endpoints (Server Mode)

When running `npm start`, the following endpoints are available:

### `GET /health`
Check server status
```bash
curl http://localhost:3000/health
```

### `POST /search`
RAG search only (no LLM)
```bash
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "How to train LoRA?", "topK": 5}'
```

### `POST /chat`
Stateless chat with RAG context
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Create an Instagram selfie prompt", "topK": 5}'
```

### `POST /conversation`
Stateful conversation with history
```bash
curl -X POST http://localhost:3000/conversation \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "user123",
    "message": "How do I make authentic Instagram photos?",
    "topK": 5
  }'
```

### `DELETE /conversation/:sessionId`
Clear conversation history
```bash
curl -X DELETE http://localhost:3000/conversation/user123
```

---

## How It Works

1. **RAG Search**: User query → Semantic search → Retrieve relevant knowledge chunks
2. **Context Building**: Format top K results into context
3. **LLM Query**: Send context + user message to LLM
4. **Response**: LLM generates answer based on retrieved knowledge

### Multi-Query Expansion
The system automatically expands queries for better context retrieval:
- "Instagram selfie" → Also searches "Instagram POV framework", "Instagram imperfections"
- "LoRA training" → Also searches "LoRA training guide"

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `XAI_API_KEY` or `AI_API_KEY` | Yes (unless localhost) | - | API key for LLM service |
| `AI_BASE_URL` | No | `https://api.x.ai/v1` | Base URL for LLM API |
| `AI_MODEL` | No | `grok-beta` | Model name/identifier |
| `PORT` | No | `3000` | Server port (server mode only) |

**Note:** When `AI_BASE_URL` contains "localhost" or "127.0.0.1", no API key is required.

---

## Files

- **`rag-chat.js`** - CLI chat interface
- **`rag-server.js`** - REST API server
- **`rag/simple-rag.js`** - Core RAG implementation
- **`rag/knowledge.db`** - SQLite database with embeddings

---

## Troubleshooting

### "No API key found"
- Make sure `.env` file exists in the project root
- Check that `XAI_API_KEY` or `AI_API_KEY` is set (unless using localhost)

### "LLM API error: 401"
- Invalid API key - check your key is correct
- For xAI Grok: Get key from https://console.x.ai/

### "Connection refused" (local LLM)
- Make sure Ollama/LM Studio is running
- Verify the port matches your configuration
- Ollama default: `http://localhost:11434/v1`
- LM Studio default: `http://localhost:1234/v1`

### Slow responses (local LLM)
- Use smaller models (e.g., `llama3.2` instead of `llama3.2:70b`)
- Reduce `max_tokens` in the code
- Ensure adequate RAM/GPU for the model

---

## Advanced Usage

### Custom System Prompt
Edit the `systemPrompt` variable in `rag-chat.js` or `rag-server.js` to customize the AI's behavior.

### Adjust Context Size
Change `topK` parameter in queries:
```javascript
const results = await this.queryRAG(userMessage, topK=10); // More context
```

### Disable RAG Context
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "includeContext": false}'
```
