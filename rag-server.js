#!/usr/bin/env node

/**
 * grok-server.js - REST API Server with RAG Integration
 * Exposes endpoints for chat and RAG queries
 * Supports both Grok API and local LLMs (Ollama, LM Studio)
 */

import 'dotenv/config';
import { SimpleRAG } from './rag/simple-rag.js';
import { FeedbackDB } from './rag/feedback-db.js';
import { SessionDB } from './rag/session-db.js';
import { ReplicateService } from './services/replicate-service.js';
import { FalService } from './services/fal-service.js';
import { HuggingFaceService } from './services/huggingface-service.js';
import { MemoryService } from './services/memory-service.js';
import { Context7Service } from './services/context7-service.js';
import express from 'express';
import cors from 'cors';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// Increase payload limit to support base64 images (default is 100kb)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from public directory
app.use(express.static(join(__dirname, 'public')));

class RAGServer {
  constructor() {
    this.rag = null;
    this.feedbackDB = new FeedbackDB();
    this.sessionDB = new SessionDB();
    this.conversationSessions = new Map(); // sessionId -> history (legacy, when USE_DB_SESSIONS=false)

    // Feature flags
    this.useDBSessions = process.env.USE_DB_SESSIONS === 'true';
    this.enableIntentDetection = process.env.ENABLE_INTENT_DETECTION !== 'false'; // Default true

    // Initialize new services (modular architecture for v1.0)
    // Auto-detect which image generation service to use (Fal preferred over Replicate)
    const falKey = process.env.FAL_API_KEY;
    const replicateKey = process.env.REPLICATE_API_TOKEN;

    if (falKey) {
      this.imageService = new FalService(falKey);
      this.imageProvider = 'fal';
    } else if (replicateKey) {
      this.imageService = new ReplicateService(replicateKey);
      this.imageProvider = 'replicate';
    } else {
      this.imageService = new ReplicateService(null); // Disabled placeholder
      this.imageProvider = 'none';
    }

    this.memoryService = new MemoryService();
    this.context7Service = new Context7Service();
    this.huggingfaceService = new HuggingFaceService(process.env.HUGGINGFACE_API_KEY);

    // LLM Configuration
    this.apiKey = process.env.XAI_API_KEY || process.env.AI_API_KEY;
    this.baseURL = process.env.AI_BASE_URL || 'https://api.x.ai/v1';
    this.model = process.env.AI_MODEL || 'grok-4-1-thinking';

    this.isLocal = this.baseURL.includes('localhost') || this.baseURL.includes('127.0.0.1');

    if (!this.isLocal && !this.apiKey) {
      console.error(chalk.red('Error: No API key found!'));
      console.error(chalk.yellow('Set XAI_API_KEY or AI_API_KEY in .env file'));
      process.exit(1);
    }

    this.systemPrompt = `Expert AI Image Generation Assistant - photorealistic prompts, LoRA training, Instagram authenticity.

CORE RULE: GATHER ALL CONTEXT BEFORE ANSWERING

CONTEXT GATHERING PROTOCOL:
Before providing solutions/prompts/guidance, identify what you need:

TASK TYPE DETECTION:
1. Prompt Creation → Need: model type, scenario details, reference images (y/n), target style
2. Image Generation → Need: model type, current setup, specific requirements
3. LoRA Training → Need: current phase, dataset status, training goals, model target
4. Troubleshooting → Need: specific error/issue, what was tried, model/tools used
5. Multi-Image Editing → Need: number of images, desired changes, which elements to keep/change
6. Character Consistency → Need: reference images available (y/n), trigger word, model preference

WHEN TO ASK (Always ask if missing):
- Prompt requests: Which model? Selfie/third-person? Reference image?
- Training tasks: Which phase? Dataset ready? Target model?
- Image editing: How many images? What to keep vs change?
- Troubleshooting: What error? What was tried?
- Character work: Reference images? Trigger word chosen?

WHEN TO ANSWER DIRECTLY (No questions needed):
- Pure knowledge queries ("What is X?", "How does Y work?")
- Already has full context in query

MODEL DETECTION:
Explicit: "Nano Banana", "Flux", "Higgsfield", "Qwen"
Infer: "text rendering"→Nano Banana | "trigger word/LoRA"→Higgsfield | "multi-image"→Qwen
If unclear: ASK "Which model? (Nano Banana Pro, Flux, Higgsfield Soul ID, Qwen, other)"

MODEL GUIDANCE (use after context gathered):
- Nano Banana: Flexible length, [Subject][Action][Location][Composition][Lighting][Style]
- Higgsfield: 40-60 words, trigger word first, exclude facial features, focus on outfit/pose/setting
- Flux: 30-100+ words, technical specs, hierarchical structure
- Qwen: 1-3 sentences, [keep/transfer][change][context][quality]

RESPONSE RULES:
- Ask clarifying questions FIRST if context incomplete
- Keep answers concise (2-4 sentences per section)
- Use RAG context, cite sources
- Format with markdown for readability`;
  }

  async initialize() {
    console.log(chalk.cyan('Initializing RAG system...'));
    this.rag = new SimpleRAG();
    await this.rag.initialize();
    this.rag.loadCache();
    console.log(chalk.green('✓ RAG system ready'));

    // Initialize MCP services (optional - won't fail if unavailable)
    console.log(chalk.cyan('Initializing enhanced services...'));

    try {
      await this.memoryService.initialize();
      console.log(chalk.green('✓ Memory Bank connected'));
    } catch (error) {
      console.log(chalk.yellow('⚠ Memory Bank unavailable (continuing without it)'));
    }

    try {
      await this.context7Service.initialize();
      console.log(chalk.green('✓ Context7 connected'));
    } catch (error) {
      console.log(chalk.yellow('⚠ Context7 unavailable (continuing without it)'));
    }

    if (this.imageService.isEnabled()) {
      console.log(chalk.green(`✓ Image generation ready (${this.imageProvider.toUpperCase()})`));
    } else {
      console.log(chalk.yellow('⚠ No image generation API key set (FAL_API_KEY or REPLICATE_API_TOKEN)'));
    }

    if (this.huggingfaceService.isEnabled()) {
      console.log(chalk.green('✓ HuggingFace service ready (Z-Image-Turbo)'));
    } else {
      console.log(chalk.yellow('⚠ HuggingFace API key not set (image-to-image disabled)'));
    }
  }

  async queryRAG(userQuery, topK = 5) {
    const queries = this.expandQuery(userQuery);
    const allResults = [];

    for (const query of queries) {
      const results = await this.rag.search(query, topK);
      allResults.push(...results);
    }

    // Deduplicate
    const seen = new Set();
    const unique = allResults.filter(r => {
      const key = `${r.source}:${r.line_start}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return unique.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  expandQuery(query) {
    const queries = [query];

    if (query.toLowerCase().includes('instagram')) {
      queries.push('Instagram POV framework');
      queries.push('Instagram imperfections authenticity');
    }
    if (query.toLowerCase().includes('lora')) {
      queries.push('LoRA training guide');
    }
    if (query.toLowerCase().includes('prompt')) {
      queries.push('photorealistic prompt techniques');
    }

    return queries;
  }

  formatContext(results) {
    if (results.length === 0) return 'No relevant context found.';
    return results.map((r, i) =>
      `[${i + 1}] ${r.section} (score: ${r.score.toFixed(3)})\n${r.content}`
    ).join('\n\n---\n\n');
  }

  /**
   * Detect user intent, task type, and missing context
   * @param {string} message - User message
   * @returns {Object} Intent object with task type, patterns, and missing context
   */
  detectUserIntent(message) {
    const lowerMsg = message.toLowerCase();
    const intent = {
      taskType: 'unknown',
      patterns: [],
      modelHints: [],
      missingContext: [],
      needsClarification: false
    };

    // Task Type Detection
    const isPromptRequest = lowerMsg.includes('prompt') || lowerMsg.includes('write a prompt') || lowerMsg.includes('create a prompt');
    const isGenerateRequest = lowerMsg.includes('generate') && !lowerMsg.includes('generate dataset');
    const isTrainingRequest = lowerMsg.includes('train') || lowerMsg.includes('training') || lowerMsg.includes('dataset');
    const isTroubleshooting = lowerMsg.includes('error') || lowerMsg.includes('problem') || lowerMsg.includes('issue') || lowerMsg.includes('not working') || lowerMsg.includes('fix');
    const isKnowledgeQuery = lowerMsg.includes('what is') || lowerMsg.includes('how does') || lowerMsg.includes('explain') || lowerMsg.includes('tell me about');
    const isMultiImage = lowerMsg.includes('multi-image') || lowerMsg.includes('combine images') || lowerMsg.includes('outfit transfer');
    const isCharacterConsistency = lowerMsg.includes('character consistency') || lowerMsg.includes('trigger word') || lowerMsg.includes('lora');

    // Assign task type
    if (isKnowledgeQuery) {
      intent.taskType = 'knowledge-query';
    } else if (isPromptRequest) {
      intent.taskType = 'prompt-creation';
    } else if (isGenerateRequest) {
      intent.taskType = 'image-generation';
    } else if (isTrainingRequest) {
      intent.taskType = 'lora-training';
    } else if (isTroubleshooting) {
      intent.taskType = 'troubleshooting';
    } else if (isMultiImage) {
      intent.taskType = 'multi-image-editing';
    } else if (isCharacterConsistency) {
      intent.taskType = 'character-consistency';
    }

    // Model Detection (explicit)
    if (lowerMsg.includes('nano banana')) intent.modelHints.push('nano-banana-pro');
    if (lowerMsg.includes('flux')) intent.modelHints.push('flux');
    if (lowerMsg.includes('higgsfield') || lowerMsg.includes('soul id')) intent.modelHints.push('higgsfield');
    if (lowerMsg.includes('qwen')) intent.modelHints.push('qwen');

    // Model Detection (inferred from keywords)
    if (lowerMsg.includes('text rendering') || lowerMsg.includes('text in image')) {
      intent.modelHints.push('nano-banana-pro');
      intent.patterns.push('text-rendering');
    }
    if (isCharacterConsistency) {
      intent.modelHints.push('higgsfield');
      intent.patterns.push('character-consistency');
    }
    if (isMultiImage) {
      intent.modelHints.push('qwen');
      intent.patterns.push('multi-image-edit');
    }

    // POV Detection
    const povKeywords = ['selfie', 'mirror', 'bedroom', 'bathroom', 'gym locker'];
    if (povKeywords.some(kw => lowerMsg.includes(kw))) {
      intent.patterns.push('pov-scenario');
    }

    // Reference Image Detection
    const hasReferenceImage = lowerMsg.includes('reference image') || lowerMsg.includes('reference photo') || lowerMsg.includes('ref image') || lowerMsg.includes('i have a reference');
    if (hasReferenceImage) {
      intent.patterns.push('has-reference-image');
    }

    // Determine missing context based on task type
    switch (intent.taskType) {
      case 'prompt-creation':
        if (intent.modelHints.length === 0) intent.missingContext.push('model-type');
        if (!hasReferenceImage && !lowerMsg.includes('no reference')) intent.missingContext.push('reference-image-status');
        if (intent.patterns.includes('pov-scenario') && !lowerMsg.includes('selfie') && !lowerMsg.includes('third-person')) {
          intent.missingContext.push('pov-type');
        }
        break;

      case 'image-generation':
        if (intent.modelHints.length === 0) intent.missingContext.push('model-type');
        break;

      case 'lora-training':
        const hasPhaseInfo = lowerMsg.includes('phase') || lowerMsg.includes('step') || lowerMsg.includes('dataset generation') || lowerMsg.includes('training execution');
        if (!hasPhaseInfo) intent.missingContext.push('training-phase');
        if (intent.modelHints.length === 0) intent.missingContext.push('target-model');
        break;

      case 'troubleshooting':
        const hasSpecificError = lowerMsg.includes('error:') || lowerMsg.includes('message:') || lowerMsg.match(/\d{3}/); // HTTP codes
        if (!hasSpecificError) intent.missingContext.push('specific-error');
        break;

      case 'multi-image-editing':
        const numImagesMatch = lowerMsg.match(/(\d+)\s*(images?|photos?)/);
        if (!numImagesMatch) intent.missingContext.push('number-of-images');
        break;

      case 'character-consistency':
        if (!hasReferenceImage) intent.missingContext.push('reference-image-status');
        const hasTriggerWord = lowerMsg.includes('trigger word') || lowerMsg.match(/\w+_char/);
        if (!hasTriggerWord && hasReferenceImage) intent.missingContext.push('trigger-word');
        break;

      case 'knowledge-query':
        // No additional context needed
        break;
    }

    // Set clarification flag
    intent.needsClarification = intent.missingContext.length > 0;

    return intent;
  }

  /**
   * Retry wrapper for network operations with exponential backoff
   * @param {Function} fn - Async function to retry
   * @param {number} maxRetries - Maximum retry attempts
   * @param {number} baseDelay - Base delay in ms
   * @returns {Promise} Result of the function
   */
  async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        const isNetworkError = error.cause?.code === 'EAI_AGAIN' ||
                               error.cause?.code === 'ENOTFOUND' ||
                               error.cause?.code === 'ETIMEDOUT' ||
                               error.message.includes('fetch failed');

        if (isLastAttempt || !isNetworkError) {
          throw error;
        }

        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`[Retry ${attempt}/${maxRetries}] Network error, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async queryLLM(messages) {
    const requestBody = {
      model: this.model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    };

    const headers = { 'Content-Type': 'application/json' };
    if (!this.isLocal) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    // Retry with exponential backoff for network errors
    return await this.retryWithBackoff(async () => {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`LLM API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    }, 3, 1000);
  }

  getSession(sessionId) {
    if (this.useDBSessions) {
      // Phase 2: Use SessionDB with token optimization
      const session = this.sessionDB.getSession(sessionId);
      if (!session) {
        // Create new session
        this.sessionDB.createSession(sessionId);
      }
      // Get recent messages only (token optimization: 6 instead of 10)
      const messages = this.sessionDB.getRecentMessages(sessionId, null, 6);
      // Convert to LLM format (without images, RAG context)
      return messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
    } else {
      // Legacy: In-memory sessions
      if (!this.conversationSessions.has(sessionId)) {
        this.conversationSessions.set(sessionId, []);
      }
      return this.conversationSessions.get(sessionId);
    }
  }

  saveToSession(sessionId, role, content, images = null, ragContextIds = null) {
    if (this.useDBSessions) {
      // Phase 2: Save to SessionDB with RAG context IDs
      const messages = this.sessionDB.getMessages(sessionId);
      const sequenceNumber = messages.length;
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      this.sessionDB.saveMessage({
        message_id: messageId,
        session_id: sessionId,
        role,
        content,
        images,
        rag_context_ids: ragContextIds,
        sequence_number: sequenceNumber
      });
    } else {
      // Legacy: Update in-memory session (already handled in conversation endpoint)
      // No action needed here
    }
  }

  setupRoutes() {
    // Health check
    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        model: this.model,
        mode: this.isLocal ? 'local' : 'api',
        ragInitialized: this.rag !== null
      });
    });

    // RAG search endpoint
    app.post('/search', async (req, res) => {
      try {
        const { query, topK = 5 } = req.body;

        if (!query) {
          return res.status(400).json({ error: 'Query is required' });
        }

        const results = await this.queryRAG(query, topK);

        res.json({
          query,
          results: results.map(r => ({
            content: r.content,
            source: r.source,
            section: r.section,
            score: r.score,
            lineStart: r.line_start,
            lineEnd: r.line_end
          }))
        });
      } catch (error) {
        console.error(chalk.red('Search error:'), error);
        res.status(500).json({ error: error.message });
      }
    });

    // Chat endpoint (stateless)
    app.post('/chat', async (req, res) => {
      try {
        const { message, includeContext = true, topK = 5 } = req.body;

        if (!message) {
          return res.status(400).json({ error: 'Message is required' });
        }

        let context = '';
        let results = [];

        if (includeContext) {
          results = await this.queryRAG(message, topK);
          context = this.formatContext(results);
        }

        const messages = [
          { role: 'system', content: this.systemPrompt },
          {
            role: 'user',
            content: includeContext
              ? `Context:\n${context}\n\nQuestion: ${message}`
              : message
          }
        ];

        const response = await this.queryLLM(messages);

        res.json({
          response,
          context: results.map(r => ({
            source: r.source,
            section: r.section,
            score: r.score
          }))
        });
      } catch (error) {
        console.error(chalk.red('Chat error:'), error);
        res.status(500).json({ error: error.message });
      }
    });

    // Stateful conversation endpoint
    app.post('/conversation', async (req, res) => {
      try {
        const { sessionId, message, topK = 5, images } = req.body;

        if (!sessionId || !message) {
          return res.status(400).json({ error: 'sessionId and message are required' });
        }

        const history = this.getSession(sessionId);

        // Detect user intent and missing context
        let intentContext = '';
        if (this.enableIntentDetection) {
          const intent = this.detectUserIntent(message);
          const hints = [];

          // Add task type
          if (intent.taskType !== 'unknown') hints.push(`Task: ${intent.taskType}`);

          // Add detected models/patterns
          if (intent.modelHints.length > 0) hints.push(`Models: ${intent.modelHints.join(', ')}`);
          if (intent.patterns.length > 0) hints.push(`Patterns: ${intent.patterns.join(', ')}`);

          // Add missing context alerts
          if (intent.missingContext.length > 0) {
            hints.push(`MISSING: ${intent.missingContext.join(', ')}`);
          }

          if (hints.length > 0) {
            intentContext = `\n\n--- Detected Context ---\n${hints.join(' | ')}`;
            console.log(chalk.cyan(`[Intent] ${hints.join(' | ')}`));
          }
        }

        // Check if we should fetch live docs (Context7)
        let liveDocs = '';
        if (this.context7Service.isEnabled() && this.context7Service.shouldFetchLiveDocs(message)) {
          console.log(chalk.cyan('[Context7] Fetching live documentation...'));
          liveDocs = await this.context7Service.fetchDocs(message);
        }

        // Recall past memories (Memory Bank)
        let memories = '';
        if (this.memoryService.isEnabled()) {
          memories = await this.memoryService.recallAll();
        }

        // Get RAG context
        const results = await this.queryRAG(message, topK);
        const ragContext = this.formatContext(results);

        // Combine all context sources
        let context = ragContext;
        if (intentContext) context = `${context}${intentContext}`;
        if (liveDocs) {
          context = `${context}\n\n--- Live Documentation ---\n${liveDocs}`;
        }
        if (memories) {
          context = `${context}\n\n--- Past Memories ---\n${memories.substring(0, 500)}`;
        }

        // Build user message content
        let userContent;
        if (images && images.length > 0) {
          // Vision message with images
          userContent = [
            { type: 'text', text: `Context:\n${context}\n\nQuestion: ${message}` }
          ];
          // Add images
          for (const imageData of images) {
            userContent.push({
              type: 'image_url',
              image_url: { url: imageData }
            });
          }
        } else {
          // Text-only message
          userContent = `Context:\n${context}\n\nQuestion: ${message}`;
        }

        const messages = [
          { role: 'system', content: this.systemPrompt },
          ...history,
          {
            role: 'user',
            content: userContent
          }
        ];

        const response = await this.queryLLM(messages);

        // Extract RAG context IDs for token optimization
        const ragContextIds = results.map(r => `${r.source}:${r.line_start}-${r.line_end}`);

        // Save messages to session
        if (this.useDBSessions) {
          // Phase 2: Save to database
          this.saveToSession(sessionId, 'user', message, images, ragContextIds);
          this.saveToSession(sessionId, 'assistant', response);
        } else {
          // Legacy: Update in-memory history
          history.push(
            { role: 'user', content: message },
            { role: 'assistant', content: response }
          );
          // Keep last 10 messages
          if (history.length > 10) {
            this.conversationSessions.set(sessionId, history.slice(-10));
          }
        }

        res.json({
          sessionId,
          response,
          context: results.map(r => ({
            source: r.source,
            section: r.section,
            score: r.score
          }))
        });
      } catch (error) {
        console.error(chalk.red('Conversation error:'), error);

        // Provide user-friendly error messages with troubleshooting steps
        let errorMessage = error.message;
        let troubleshooting = null;

        // Network/DNS errors
        if (error.cause?.code === 'EAI_AGAIN' || error.cause?.code === 'ENOTFOUND') {
          errorMessage = 'Unable to reach the AI service. This appears to be a DNS/network issue.';
          troubleshooting = {
            issue: 'DNS Resolution Failure',
            possibleCauses: [
              'Temporary network connectivity issue (common in WSL2)',
              'DNS server not responding',
              'Firewall blocking DNS queries',
              'api.x.ai service temporarily unreachable'
            ],
            solutions: [
              'Check your internet connection',
              'Try: ping api.x.ai',
              'Update DNS: echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf',
              'Restart WSL2: wsl --shutdown (from Windows PowerShell)',
              'Consider using a local LLM fallback (see .env.example for Ollama setup)'
            ]
          };
        }
        // Timeout errors
        else if (error.cause?.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
          errorMessage = 'Request to AI service timed out. The service may be slow or unreachable.';
          troubleshooting = {
            issue: 'Request Timeout',
            solutions: [
              'Check your internet connection speed',
              'Try again in a few moments',
              'Consider using a local LLM (Ollama) for better reliability'
            ]
          };
        }
        // API errors
        else if (error.message.includes('LLM API error')) {
          troubleshooting = {
            issue: 'API Error',
            solutions: [
              'Check your XAI_API_KEY in .env file',
              'Verify API key is valid at https://console.x.ai/',
              'Check if you have API credits remaining'
            ]
          };
        }

        res.status(500).json({
          error: errorMessage,
          troubleshooting,
          originalError: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    });

    // Clear conversation
    app.delete('/conversation/:sessionId', (req, res) => {
      const { sessionId } = req.params;
      this.conversationSessions.delete(sessionId);
      res.json({ message: 'Conversation cleared', sessionId });
    });

    // Feedback endpoint with rating-based learning
    app.post('/feedback', async (req, res) => {
      try {
        const { rating, queryText, responseText } = req.body;

        // Save feedback to database (for analytics)
        const result = this.feedbackDB.saveFeedback(req.body);

        // If highly rated (5-7), save to Memory MCP for learning
        if (rating && rating >= 5 && this.memoryService.isEnabled()) {
          console.log(chalk.green(`[Memory] Saving highly-rated generation (rating: ${rating})`));

          // Extract generation data from feedback
          await this.memoryService.rememberGeneration({
            prompt: queryText || 'Unknown prompt',
            enhancedPrompt: responseText || queryText || 'Unknown',
            model: 'user-rated',
            imageUrl: req.body.resultImage || '',
            metadata: {
              rating,
              feedbackId: result.feedbackId,
              timestamp: req.body.timestamp
            }
          });
        }

        res.json(result);
      } catch (error) {
        console.error(chalk.red('Feedback error:'), error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get feedback stats
    app.get('/feedback/stats', (req, res) => {
      try {
        const stats = this.feedbackDB.getStats();
        res.json(stats);
      } catch (error) {
        console.error(chalk.red('Stats error:'), error);
        res.status(500).json({ error: error.message });
      }
    });

    // Phase 2: Session Management Endpoints

    // Get all sessions
    app.get('/sessions', (req, res) => {
      try {
        if (!this.useDBSessions) {
          return res.status(400).json({ error: 'Session persistence is disabled. Enable USE_DB_SESSIONS in .env' });
        }
        const sessions = this.sessionDB.getAllSessions();
        res.json({ sessions });
      } catch (error) {
        console.error(chalk.red('Sessions list error:'), error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get session with messages
    app.get('/sessions/:id', (req, res) => {
      try {
        if (!this.useDBSessions) {
          return res.status(400).json({ error: 'Session persistence is disabled. Enable USE_DB_SESSIONS in .env' });
        }
        const session = this.sessionDB.getSession(req.params.id);
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }
        const messages = this.sessionDB.getMessages(req.params.id);
        res.json({ session, messages });
      } catch (error) {
        console.error(chalk.red('Session get error:'), error);
        res.status(500).json({ error: error.message });
      }
    });

    // Delete session (soft delete)
    app.delete('/sessions/:id', (req, res) => {
      try {
        if (!this.useDBSessions) {
          return res.status(400).json({ error: 'Session persistence is disabled. Enable USE_DB_SESSIONS in .env' });
        }
        this.sessionDB.deleteSession(req.params.id);
        res.json({ success: true, sessionId: req.params.id });
      } catch (error) {
        console.error(chalk.red('Session delete error:'), error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get session stats
    app.get('/sessions/:id/stats', (req, res) => {
      try {
        if (!this.useDBSessions) {
          return res.status(400).json({ error: 'Session persistence is disabled. Enable USE_DB_SESSIONS in .env' });
        }
        const stats = this.sessionDB.getSessionStats(req.params.id);
        res.json(stats);
      } catch (error) {
        console.error(chalk.red('Session stats error:'), error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get session persistence status
    app.get('/sessions/config/status', (req, res) => {
      res.json({
        enabled: this.useDBSessions,
        tokenOptimization: this.useDBSessions ? '6 messages (52% reduction)' : 'N/A',
        storage: this.useDBSessions ? 'SQLite (rag/sessions.db)' : 'In-memory (ephemeral)'
      });
    });

    // ==========================================
    // Phase 3: Image Generation Endpoints
    // ==========================================

    // Generate image with RAG-enhanced prompts
    app.post('/generate-image', async (req, res) => {
      try {
        const { prompt, model = 'flux-schnell', sessionId, ...options } = req.body;

        if (!prompt) {
          return res.status(400).json({ error: 'Prompt is required' });
        }

        if (!this.imageService.isEnabled()) {
          return res.status(503).json({
            error: 'Image generation unavailable. Set FAL_API_KEY or REPLICATE_API_TOKEN in .env'
          });
        }

        console.log(chalk.cyan(`[ImageGen] Processing prompt: "${prompt.substring(0, 50)}..."`));

        // Step 1: Get RAG context for prompt enhancement
        const ragResults = await this.queryRAG(`Best practices for: ${prompt}`, 3);
        const ragContext = ragResults.map(r => r.content).join('\n');

        // Step 2: Use Grok to enhance the prompt
        const enhancementMessages = [
          {
            role: 'system',
            content: 'You are an expert at writing prompts for Flux image generation. Enhance the user prompt with technical details while preserving intent. Return ONLY the enhanced prompt, no explanations.'
          },
          {
            role: 'user',
            content: `Enhance this prompt for Flux:\n${prompt}\n\nContext:\n${ragContext}`
          }
        ];

        const enhancedPrompt = await this.queryLLM(enhancementMessages);

        console.log(chalk.green(`[ImageGen] Enhanced prompt: "${enhancedPrompt.substring(0, 80)}..."`));

        // Step 3: Generate image
        const result = await this.imageService.generateImage(enhancedPrompt, {
          model,
          ...options
        });

        // Note: Memory saving moved to feedback endpoint (rating-based learning)
        // Memory MCP now only saves highly-rated generations (rating >= 5)

        res.json({
          success: true,
          originalPrompt: prompt,
          enhancedPrompt,
          images: result.images,
          metadata: result.metadata
        });

      } catch (error) {
        console.error(chalk.red('[ImageGen] Error:'), error);

        // Remember failure (Memory Bank)
        if (this.memoryService.isEnabled()) {
          await this.memoryService.rememberFailure({
            prompt: req.body.prompt,
            error: error.message,
            model: req.body.model || 'flux-schnell'
          });
        }

        res.status(500).json({ error: error.message });
      }
    });

    // Get available image generation models
    app.get('/generate-image/models', (req, res) => {
      if (!this.imageService.isEnabled()) {
        return res.status(503).json({
          error: 'Image generation service unavailable'
        });
      }

      res.json({
        models: this.imageService.getAvailableModels(),
        provider: this.imageProvider,
        default: 'flux-schnell'
      });
    });

    // Train a custom LoRA model
    app.post('/train-lora', async (req, res) => {
      try {
        const { trigger_word, images_zip_url, steps, learning_rate } = req.body;

        if (!trigger_word || !images_zip_url) {
          return res.status(400).json({
            error: 'trigger_word and images_zip_url are required'
          });
        }

        if (!this.imageService.isEnabled()) {
          return res.status(503).json({
            error: 'Image generation service unavailable'
          });
        }

        console.log(chalk.cyan(`[LoRA] Starting training with trigger: "${trigger_word}"`));

        const result = await this.imageService.trainLoRA({
          trigger_word,
          images_zip_url,
          steps,
          learning_rate
        });

        res.json(result);

      } catch (error) {
        console.error(chalk.red('[LoRA] Training error:'), error);
        res.status(500).json({ error: error.message });
      }
    });

    // ==========================================
    // HuggingFace Endpoints (Z-Image-Turbo)
    // ==========================================

    // Enhance/transform existing image (image-to-image)
    app.post('/enhance-image', async (req, res) => {
      try {
        const { image, prompt, strength = 0.8, model = 'z-image-turbo' } = req.body;

        if (!image || !prompt) {
          return res.status(400).json({ error: 'image and prompt are required' });
        }

        if (!this.huggingfaceService.isEnabled()) {
          return res.status(503).json({
            error: 'HuggingFace service unavailable. Set HUGGINGFACE_API_KEY in .env'
          });
        }

        console.log(chalk.cyan(`[Z-Image-Turbo] Enhancing image...`));
        console.log(chalk.cyan(`[Z-Image-Turbo] Prompt: "${prompt.substring(0, 50)}..."`));

        // Use RAG to enhance the prompt
        const ragResults = await this.queryRAG(`Best techniques for: ${prompt}`, 2);
        const ragContext = ragResults.map(r => r.content).join('\n');

        // Optionally enhance prompt with Grok
        let enhancedPrompt = prompt;
        if (ragContext) {
          const enhancementMessages = [
            {
              role: 'system',
              content: 'Enhance this image transformation prompt with technical details. Return ONLY the enhanced prompt.'
            },
            {
              role: 'user',
              content: `Enhance: ${prompt}\n\nContext:\n${ragContext}`
            }
          ];
          enhancedPrompt = await this.queryLLM(enhancementMessages);
        }

        console.log(chalk.green(`[Z-Image-Turbo] Enhanced: "${enhancedPrompt.substring(0, 80)}..."`));

        const result = await this.huggingfaceService.imageToImage(image, enhancedPrompt, {
          model,
          strength
        });

        // Note: Memory saving moved to feedback endpoint (rating-based learning)
        // Memory MCP now only saves highly-rated transformations (rating >= 5)

        res.json({
          success: true,
          originalPrompt: prompt,
          enhancedPrompt,
          images: result.images,
          metadata: result.metadata
        });

      } catch (error) {
        console.error(chalk.red('[Z-Image-Turbo] Error:'), error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get training instructions for Z-Image-Turbo
    app.post('/train-z-image-turbo', async (req, res) => {
      try {
        const config = req.body;

        if (!this.huggingfaceService.isEnabled()) {
          return res.status(503).json({
            error: 'HuggingFace service unavailable'
          });
        }

        console.log(chalk.cyan('[Training] Generating Z-Image-Turbo training guide...'));

        const instructions = await this.huggingfaceService.trainModel(config);

        res.json(instructions);

      } catch (error) {
        console.error(chalk.red('[Training] Error:'), error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get memory statistics
    app.get('/memory/stats', async (req, res) => {
      try {
        const stats = await this.memoryService.getStats();
        res.json(stats);
      } catch (error) {
        console.error(chalk.red('[Memory] Stats error:'), error);
        res.status(500).json({ error: error.message });
      }
    });

    // Save a preference
    app.post('/memory/preference', async (req, res) => {
      try {
        const { key, value } = req.body;

        if (!key || !value) {
          return res.status(400).json({ error: 'key and value are required' });
        }

        if (!this.memoryService.isEnabled()) {
          return res.status(503).json({ error: 'Memory service unavailable' });
        }

        await this.memoryService.rememberPreference(key, value);

        res.json({ success: true, key, value });

      } catch (error) {
        console.error(chalk.red('[Memory] Save preference error:'), error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get service status
    app.get('/services/status', (req, res) => {
      res.json({
        imageGeneration: {
          enabled: this.imageService.isEnabled(),
          provider: this.imageProvider,
          models: this.imageService.isEnabled()
            ? this.imageService.getAvailableModels()
            : []
        },
        imageToImage: {
          enabled: this.huggingfaceService.isEnabled(),
          provider: 'huggingface',
          models: this.huggingfaceService.isEnabled()
            ? this.huggingfaceService.getAvailableModels()
            : [],
          featured: 'z-image-turbo'
        },
        memory: {
          enabled: this.memoryService.isEnabled()
        },
        context7: {
          enabled: this.context7Service.isEnabled()
        },
        rag: {
          enabled: this.rag !== null
        },
        sessions: {
          enabled: this.useDBSessions
        }
      });
    });
  }

  start() {
    this.setupRoutes();

    app.listen(PORT, () => {
      console.log(chalk.bold.cyan('\n╔════════════════════════════════════════╗'));
      console.log(chalk.bold.cyan('║   RAG Server Running                   ║'));
      console.log(chalk.bold.cyan('╚════════════════════════════════════════╝\n'));
      console.log(chalk.green(`✓ Server: http://localhost:${PORT}`));
      console.log(chalk.yellow(`✓ Model: ${this.model} ${this.isLocal ? '(Local)' : '(API)'}`));
      console.log(chalk.gray(`\nEndpoints:`));
      console.log(chalk.gray(`  GET  /health`));
      console.log(chalk.gray(`  POST /search`));
      console.log(chalk.gray(`  POST /chat`));
      console.log(chalk.gray(`  POST /conversation`));
      console.log(chalk.gray(`  DELETE /conversation/:sessionId\n`));
    });
  }
}

// Main execution
async function main() {
  const server = new RAGServer();
  await server.initialize();
  server.start();
}

main().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
