# System Upgrade Research: Tools, MCPs & SDKs

**Current System:** RAG-powered knowledge base (retrieval-only, no generation)
- Xenova embeddings, 7ms queries, 542 chunks, offline-first
- Node.js based, production-ready

**Research Date:** 2025-12-01

---

## MCP Servers (Model Context Protocol)

### Filesystem MCP
**Use Case:** Enhanced file operations for Claude Code
- Better integration than raw bash commands
- Granular permission controls for security
- Useful for: Complex codebase refactoring, multi-file operations

### Sequential Thinking MCP
**Use Case:** Complex problem-solving with structured reasoning
- Enables step-by-step thought process for RAG queries
- Revises approaches when needed, maintains context
- Useful for: Multi-step analysis, debugging complex queries

### Memory Bank MCP
**Use Case:** Retain conversation context across sessions
- Remembers previous queries and patterns
- Complements your existing agent logic (agent/agent.md)
- Useful for: Building on previous interactions, personalized responses

### GitHub MCP
**Use Case:** Automate version control workflows
- Manage commits, PRs, issues directly from AI
- Track knowledge base changes systematically
- Useful for: Collaboration, change tracking, CI/CD integration

### PostgreSQL/Database MCP
**Use Case:** Scale beyond JSON embeddings cache
- Upgrade from 5.9MB JSON to proper database
- Better performance at >10k chunks
- Useful for: Production deployments, concurrent users, larger knowledge bases

### Context7 MCP
**Use Case:** Real-time documentation fetching
- Gets latest docs from source repos (transformers, ONNX, etc.)
- Ensures current library information
- Useful for: Keeping RAG knowledge up-to-date with upstream changes

### Puppeteer/Playwright MCP
**Use Case:** Web automation and testing
- Automate testing of RAG search interface
- Scrape web content for knowledge base expansion
- Useful for: E2E testing, dynamic content ingestion

---

## Local LLM Tools (for adding generation capability)

### Ollama
**Use Case:** Run local LLMs with OpenAI-compatible API
- Models: Llama 3.2, Qwen, Mistral, etc.
- Simple commands: `ollama run llama3.2`
- Useful for: Privacy-first generation, offline usage, no API costs
- **Best fit:** CLI power users, developers comfortable with terminal

### LM Studio
**Use Case:** GUI-based local LLM management
- Desktop app, ChatGPT-like interface
- Model downloads, chat, API server
- Useful for: Beginners, testing models quickly, visual preference
- **Best fit:** Users who prefer graphical interfaces

### vLLM
**Use Case:** Production-grade local LLM serving
- Maximum performance, optimized inference
- Production API endpoints
- Useful for: High-throughput deployments, serving multiple users
- **Best fit:** Production environments, performance-critical applications

### Jan
**Use Case:** Cross-platform desktop AI assistant
- Windows/macOS/Linux support
- Polished UI, model management
- Useful for: Desktop integration, non-technical users
- **Best fit:** General-purpose local AI assistant

### AnythingLLM
**Use Case:** Offline AI with RAG built-in
- Desktop app, document chat, agents
- React UI + Node.js backend
- Useful for: Quick RAG setup without coding, all-in-one solution
- **Best fit:** Non-developers, rapid prototyping

---

## Node.js RAG Frameworks (for extending current system)

### EmbedJS
**Use Case:** Production-ready RAG framework for Node.js
- Built-in LLM integrations (OpenAI, Anthropic, Ollama)
- Vector stores, chunking, retrieval utilities
- Useful for: Adding generation to existing RAG, standardized architecture
- **Best fit:** Extending your current system with full RAG pipeline
- **Trade-off:** More dependencies vs faster development

### LangChain (Node.js)
**Use Case:** Comprehensive LLM application framework
- Chains, agents, tools, memory
- Extensive integrations, large ecosystem
- Useful for: Complex workflows, multi-step reasoning, production apps
- **Best fit:** Advanced use cases, mature framework needed
- **Trade-off:** Steeper learning curve, heavier than EmbedJS

### Custom Extension
**Use Case:** Extend current simple-rag.js without framework
- Keep minimal dependencies, full control
- Add LLM client directly (fetch + API)
- Useful for: Learning, simplicity, avoiding framework lock-in
- **Best fit:** Small projects, educational purposes, maximum control
- **Trade-off:** Build everything yourself vs faster with framework

---

## Cloud LLM APIs (for generation capability)

### OpenAI API (GPT-4, GPT-4o)
**Use Case:** Powerful generation with wide model selection
- Best-in-class models, fast inference
- Pay-per-token pricing (~$0.01/1k tokens)
- Useful for: Production quality, complex reasoning, general-purpose
- **Best fit:** Budget for API costs, need reliability

### Anthropic API (Claude 3.5 Sonnet)
**Use Case:** Long context, nuanced responses
- 200k context window, excellent for RAG
- Strong at following instructions
- Useful for: Large document analysis, detailed reasoning
- **Best fit:** Complex knowledge bases, need for accuracy

### Hybrid Approach (Local + Cloud)
**Use Case:** Best of both worlds with config switching
- Local (Ollama) for development/testing
- Cloud (OpenAI/Anthropic) for production
- Useful for: Cost optimization, offline capability, flexibility
- **Best fit:** Production systems with varying requirements
- **Trade-off:** More complex configuration management

---

## Recommended Next Steps (Research Phase)

1. **Quick Win:** Install Filesystem + Sequential Thinking MCPs
   - Immediate enhancement to Claude Code capabilities
   - No architecture changes needed
   - Estimated time: 15 minutes

2. **Experiment:** Try Ollama locally
   - Install: `curl -fsSL https://ollama.com/install.sh | sh`
   - Test: `ollama run llama3.2`
   - See if local LLM meets your quality needs
   - Estimated time: 30 minutes

3. **Evaluate:** Test EmbedJS with your data
   - Create proof-of-concept with 1 knowledge file
   - Compare generation quality (local vs cloud)
   - Assess framework fit for your use case
   - Estimated time: 2-3 hours

4. **Decide:** Local vs Cloud vs Hybrid
   - Based on: privacy needs, budget, performance requirements
   - Consider: API costs vs hardware requirements
   - Document decision rationale

5. **Plan:** Full migration (if needed)
   - Only after validating approach with small tests
   - Preserve existing embeddings cache
   - Ensure backward compatibility

---

## Key Insights

### Current System Strengths (Keep These)
- **7ms query speed** - Excellent performance
- **Offline-first** - No external dependencies
- **Production-ready** - Well-tested, zero vulnerabilities
- **Custom implementation** - Full control, minimal dependencies

### What's Missing (Potential Additions)
- **LLM Generation** - System only retrieves, doesn't generate answers
- **Multi-user support** - Single-user CLI, no API
- **Database scaling** - JSON cache works now, may need DB later
- **Model flexibility** - Locked to Xenova embeddings

### Decision Framework
Ask yourself:
1. **Do I need generation?** If yes → Add LLM integration
2. **Privacy or cost priority?** Privacy → Local (Ollama), Cost/Quality → Cloud
3. **Single user or multi-user?** Single → Keep CLI, Multi → Add API
4. **Framework or custom?** Learning → Custom, Speed → Framework

---

## Sources

- [Best MCP Servers - MCPcat](https://mcpcat.io/guides/best-mcp-servers-for-claude-code/)
- [Top 10 Essential MCP Servers](https://apidog.com/blog/top-10-mcp-servers-for-claude-code/)
- [Local LLM Hosting Guide 2025](https://www.glukhov.org/post/2025/11/hosting-llms-ollama-localai-jan-lmstudio-vllm-comparison/)
- [Best Local LLM Tools](https://getstream.io/blog/best-local-llm-tools/)
- [EmbedJs GitHub](https://github.com/llm-tools/embedJs)
- [Build Local AI with RAG](https://www.freecodecamp.org/news/build-a-local-ai/)
- [awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)

---

**Status:** Research complete - ready for experimentation phase
**Next Action:** User decides which tools to test based on use case priorities
