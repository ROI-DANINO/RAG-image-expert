# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.2] - 2025-12-05

### Fixed
- **Context7 MCP Service:** Fixed package name from `@upsoft/mcp-server-context7` to `@upstash/context7-mcp`
  - Service now connects successfully
  - Enables live documentation fetching
  - File: `services/context7-service.js:45`

- **Network Reliability:** Added automatic retry logic with exponential backoff
  - Handles DNS failures (EAI_AGAIN) common in WSL2
  - 3 retry attempts with 1s → 2s → 4s delays
  - File: `rag-server.js:186-213`

- **Error Handling:** Enhanced error responses with troubleshooting guidance
  - User-friendly error messages for DNS/network issues
  - Actionable solutions (DNS config, WSL restart)
  - File: `rag-server.js:470-526`

### Changed
- **MemoryService:** Temporarily disabled recall due to MCP SDK compatibility
  - Memory writes still functional
  - Reads gracefully degrade without errors
  - Added `enableRecall` flag for future re-enablement
  - Files: `services/memory-service.js:19,183,238`

### Documentation
- Updated README.md with new troubleshooting section
  - Network & MCP Service Issues
  - DNS resolution fixes for WSL2
  - Context7 and Memory Bank status
- Updated TESTING_CHECKLIST.md with resolved issues
- Updated .env.example with Ollama fallback recommendation

## [0.5.1] - Previous

### Added
- Response Format Standards section in agent.md (48 lines)
  - Concise agent communication guidelines
  - Model-specific prompt length examples
  - DO/DON'T formatting examples

### Changed
- Refined tripod/timer shot terminology for better clarity
  - Updated `tripod setup` to `centered framing, stationary camera angle`
  - Updated `slight awkwardness` to `self-timed awkwardness`
- Improved POV markers in Instagram authentic knowledge base
- Updated agent.md from 674 to 722 lines
- Documentation dates updated to 2025-12-01

### Fixed
- Self-timer shot descriptions now more precise and actionable

## [0.3.0] - 2025-11-30

### Added
- v0.3 "Unified Testbed" production release
- 10 knowledge files (5,983 lines total)
- RAG-powered semantic search system
- 542 searchable chunks with fine-grained precision
- Agent logic patterns (4 core decision frameworks)
- Comprehensive documentation system

### Features
- 7ms average query time (57x faster than target)
- Offline-first architecture (no API keys required)
- Production-tested with 20+ baseline queries
- Complete LoRA training workflows
- Instagram authenticity POV framework
- Model-specific best practices (Qwen, Flux, Nano Banana Pro, Higgsfield Soul ID)

### Documentation
- README.md - Project overview and quick start
- USER_GUIDE.md - Complete usage guide
- CONTRIBUTING.md - Contribution guidelines
- RAG_REBUILD_GUIDE.md - RAG system architecture
- FINAL_IMPLEMENTATION_REPORT.md - Technical deep-dive

## [0.2.0] - Archive

### Added
- Instagram support and multi-model coverage
- 8 documentation files
- Comprehensive expansion from v0.1

## [0.1.0] - Archive

### Added
- Initial efficient baseline
- 6 core documentation files
- Basic RAG system

---

**Note:** For detailed version history and migration paths, see [versions/ARCHIVES.md](versions/ARCHIVES.md)
