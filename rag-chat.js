#!/usr/bin/env node

/**
 * grok-agent.js - CLI Chat Agent with RAG Integration
 * Supports both Grok API and local LLMs (Ollama, LM Studio)
 */

import 'dotenv/config';
import { SimpleRAG } from './rag/simple-rag.js';
import readline from 'readline';
import chalk from 'chalk';

class GrokAgent {
  constructor() {
    this.rag = null;
    this.conversationHistory = [];

    // LLM Configuration from environment
    this.apiKey = process.env.XAI_API_KEY || process.env.AI_API_KEY;
    this.baseURL = process.env.AI_BASE_URL || 'https://api.x.ai/v1';
    this.model = process.env.AI_MODEL || 'grok-beta';

    // Detect if using local LLM (no API key needed for localhost)
    this.isLocal = this.baseURL.includes('localhost') || this.baseURL.includes('127.0.0.1');

    if (!this.isLocal && !this.apiKey) {
      console.error(chalk.red('Error: No API key found!'));
      console.error(chalk.yellow('Set XAI_API_KEY or AI_API_KEY in .env file'));
      process.exit(1);
    }

    this.systemPrompt = `You are an expert AI Image Generation Assistant specializing in photorealistic prompts, LoRA training, and Instagram authenticity.

CRITICAL RULES:
1. Use retrieved context as PRIMARY source - always reference the knowledge base
2. Be CONCISE and DIRECT - Give actionable prompts, not lengthy explanations
3. For Instagram prompts, verify completeness:
   □ POV selected (selfie/third-person/tripod)
   □ Camera/phone specified (iPhone model or camera)
   □ Imperfection layers added (if authentic style)
   □ Story vs Feed considered (aspect ratio)
   □ Scenario-appropriate markers

RESPONSE FORMAT:
- If context is relevant: Use it directly and cite sections
- If context is partial: Ask clarifying questions
- If context is missing: State "Not in knowledge base" and provide general guidance

Be helpful, precise, and efficient.`;
  }

  async initialize() {
    console.log(chalk.cyan('Initializing RAG system...'));
    this.rag = new SimpleRAG();
    await this.rag.initialize();
    this.rag.loadCache();
    console.log(chalk.green('✓ RAG system ready'));
  }

  async queryRAG(userQuery, topK = 5) {
    // Multi-query expansion for better context retrieval
    const queries = this.expandQuery(userQuery);
    const allResults = [];

    for (const query of queries) {
      const results = await this.rag.search(query, topK);
      allResults.push(...results);
    }

    // Deduplicate and sort by score
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
    // Simple query expansion - can be enhanced
    const queries = [query];

    // Add concept-specific expansions
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

  async queryLLM(userMessage, context) {
    const messages = [
      { role: 'system', content: this.systemPrompt },
      ...this.conversationHistory,
      {
        role: 'user',
        content: `Context from knowledge base:\n${context}\n\nUser question: ${userMessage}`
      }
    ];

    const requestBody = {
      model: this.model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    };

    const headers = {
      'Content-Type': 'application/json'
    };

    if (!this.isLocal) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
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
    } catch (error) {
      console.error(chalk.red('LLM Error:'), error.message);
      throw error;
    }
  }

  async chat(userMessage) {
    console.log(chalk.blue('\n🔍 Searching knowledge base...'));

    // Get relevant context
    const results = await this.queryRAG(userMessage);
    const context = this.formatContext(results);

    console.log(chalk.gray(`Found ${results.length} relevant chunks`));

    // Query LLM
    console.log(chalk.blue('💭 Generating response...\n'));
    const response = await this.queryLLM(userMessage, context);

    // Update conversation history
    this.conversationHistory.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: response }
    );

    // Keep history manageable (last 10 messages)
    if (this.conversationHistory.length > 10) {
      this.conversationHistory = this.conversationHistory.slice(-10);
    }

    return response;
  }

  async startCLI() {
    console.log(chalk.bold.cyan('\n╔════════════════════════════════════════╗'));
    console.log(chalk.bold.cyan('║   RAG-Powered AI Image Gen Assistant   ║'));
    console.log(chalk.bold.cyan('╚════════════════════════════════════════╝\n'));
    console.log(chalk.yellow(`Using: ${this.model} ${this.isLocal ? '(Local)' : '(API)'}`));
    console.log(chalk.gray('Type "exit" or "quit" to end the conversation\n'));

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.green('You: ')
    });

    rl.prompt();

    rl.on('line', async (input) => {
      const trimmed = input.trim();

      if (!trimmed) {
        rl.prompt();
        return;
      }

      if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
        console.log(chalk.cyan('\nGoodbye! 👋\n'));
        rl.close();
        process.exit(0);
      }

      try {
        const response = await this.chat(trimmed);
        console.log(chalk.magenta('\nAssistant: ') + response + '\n');
      } catch (error) {
        console.error(chalk.red('\n❌ Error:'), error.message, '\n');
      }

      rl.prompt();
    });

    rl.on('close', () => {
      console.log(chalk.cyan('\nGoodbye! 👋\n'));
      process.exit(0);
    });
  }
}

// Main execution
async function main() {
  const agent = new GrokAgent();
  await agent.initialize();
  await agent.startCLI();
}

main().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
