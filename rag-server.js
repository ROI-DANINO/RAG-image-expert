#!/usr/bin/env node

/**
 * grok-server.js - REST API Server with RAG Integration
 * Exposes endpoints for chat and RAG queries
 * Supports both Grok API and local LLMs (Ollama, LM Studio)
 */

import 'dotenv/config';
import { SimpleRAG } from './rag/simple-rag.js';
import { FeedbackDB } from './rag/feedback-db.js';
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
    this.conversationSessions = new Map(); // sessionId -> history

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

    this.systemPrompt = `You are an expert AI Image Generation Assistant specializing in photorealistic prompts, LoRA training, and Instagram authenticity.

RESPONSE STYLE:
- Write in clear, natural language - be conversational but professional
- Use markdown formatting for better readability (headings, lists, code blocks)
- Structure answers with clear sections when covering multiple topics
- Be direct and actionable - focus on practical guidance

USING CONTEXT:
- Always prioritize the retrieved knowledge base context
- If context fully answers the question: Provide a complete, well-formatted answer
- If context is partial: Give what you know, then ask specific clarifying questions
- If context is missing: Acknowledge it briefly, then offer general guidance if helpful

FOR TECHNICAL CONTENT:
- Use bullet points or numbered lists for steps and parameters
- Format code, prompts, or technical values in code blocks
- Include specific examples when available from context
- For Instagram prompts, ensure: POV, camera/phone, imperfections (if needed), aspect ratio

Keep responses helpful, well-structured, and easy to scan.`;
  }

  async initialize() {
    console.log(chalk.cyan('Initializing RAG system...'));
    this.rag = new SimpleRAG();
    await this.rag.initialize();
    this.rag.loadCache();
    console.log(chalk.green('✓ RAG system ready'));
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
  }

  getSession(sessionId) {
    if (!this.conversationSessions.has(sessionId)) {
      this.conversationSessions.set(sessionId, []);
    }
    return this.conversationSessions.get(sessionId);
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

        // Get context
        const results = await this.queryRAG(message, topK);
        const context = this.formatContext(results);

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

        // Update history
        history.push(
          { role: 'user', content: message },
          { role: 'assistant', content: response }
        );

        // Keep last 10 messages
        if (history.length > 10) {
          this.conversationSessions.set(sessionId, history.slice(-10));
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
        res.status(500).json({ error: error.message });
      }
    });

    // Clear conversation
    app.delete('/conversation/:sessionId', (req, res) => {
      const { sessionId } = req.params;
      this.conversationSessions.delete(sessionId);
      res.json({ message: 'Conversation cleared', sessionId });
    });

    // Feedback endpoint
    app.post('/feedback', async (req, res) => {
      try {
        const result = this.feedbackDB.saveFeedback(req.body);
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
