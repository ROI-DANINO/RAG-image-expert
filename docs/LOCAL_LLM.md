LOCAL LLM Usage Guide

This project already supports running against a local LLM by configuring environment variables used by grok-server.js and grok-agent.js.

Quick steps:
1. Install deps and copy .env example:
   npm install
   cp .env.example .env

2. Configure .env for a local LLM (examples):
   # Ollama (default local port)
   AI_BASE_URL=http://localhost:11434/v1
   AI_MODEL=llama3.2
   # LM Studio (example)
   # AI_BASE_URL=http://localhost:1234/v1
   # AI_MODEL=local-model

Notes:
- When AI_BASE_URL contains "localhost" the code will not require an API key (see grok-agent.js/grok-server.js).
- The server and CLI use the OpenAI client with a configurable baseURL; Ollama/LM Studio expose compatible REST endpoints when configured with /v1 paths.
- For a fully offline JS transformer (Xenova) the code would need small changes because chat completions currently use the OpenAI client; embedding (Xenova) is already a dependency for offline embeddings.

Start the server:
   npm start

Start CLI chat:
   npm run cli
