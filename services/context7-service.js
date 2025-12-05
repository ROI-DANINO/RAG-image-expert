/**
 * Context7 MCP Service
 * Fetches live documentation from GitHub, web sources, and code repositories
 *
 * Complements static RAG with up-to-date information
 * Modular design: Can swap to other doc fetchers in v1.0
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export class Context7Service {
  constructor() {
    this.client = null;
    this.enabled = false;
    this.isConnecting = false;
  }

  /**
   * Initialize Context7 MCP connection
   */
  async initialize() {
    if (this.isConnecting) {
      console.log('[Context7Service] Already connecting...');
      return;
    }

    if (this.enabled) {
      console.log('[Context7Service] Already initialized');
      return;
    }

    this.isConnecting = true;

    try {
      console.log('[Context7Service] Initializing Context7 MCP...');

      this.client = new Client(
        { name: 'rag-context7', version: '1.0.0' },
        { capabilities: {} }
      );

      const transport = new StdioClientTransport({
        command: 'npx',
        args: ['-y', '@upstash/context7-mcp']
      });

      await this.client.connect(transport);

      this.enabled = true;
      this.isConnecting = false;

      console.log('[Context7Service] Connected successfully');

    } catch (error) {
      console.error('[Context7Service] Initialization failed:', error.message);
      console.warn('[Context7Service] Will continue without live docs');
      this.enabled = false;
      this.isConnecting = false;
      // Don't throw - this is optional enhancement
    }
  }

  /**
   * Fetch live documentation for a query
   * @param {string} query - Search query
   * @param {Object} options - Fetch options
   * @returns {Promise<string>} Fetched documentation
   */
  async fetchDocs(query, options = {}) {
    if (!this.enabled) {
      console.log('[Context7Service] Not enabled, skipping live docs fetch');
      return '';
    }

    const {
      source = 'github',
      maxResults = 3
    } = options;

    try {
      console.log(`[Context7Service] Fetching docs for: "${query}"`);

      const result = await this.client.request({
        method: 'tools/call',
        params: {
          name: 'fetch_documentation',
          arguments: {
            query,
            source,
            max_results: maxResults
          }
        }
      });

      if (!result || !result.content) {
        return '';
      }

      const docs = result.content[0]?.text || '';

      console.log(`[Context7Service] Fetched ${docs.length} chars of documentation`);

      return docs;

    } catch (error) {
      console.error('[Context7Service] Failed to fetch docs:', error.message);
      return '';
    }
  }

  /**
   * Check if query needs live documentation
   * @param {string} query - User query
   * @returns {boolean}
   */
  shouldFetchLiveDocs(query) {
    const liveKeywords = [
      'latest',
      'new',
      'recent',
      'updated',
      'current',
      'modern',
      '2024',
      '2025'
    ];

    const lowerQuery = query.toLowerCase();
    return liveKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  /**
   * Fetch documentation for specific topics
   * @param {Array<string>} topics - List of topics to fetch
   * @returns {Promise<Object>} Map of topic -> documentation
   */
  async fetchMultipleTopics(topics) {
    if (!this.enabled) {
      return {};
    }

    const results = {};

    for (const topic of topics) {
      try {
        const docs = await this.fetchDocs(topic);
        if (docs) {
          results[topic] = docs;
        }
      } catch (error) {
        console.error(`[Context7Service] Failed to fetch topic "${topic}":`, error.message);
      }
    }

    return results;
  }

  /**
   * Fetch latest Flux model documentation
   * @returns {Promise<string>}
   */
  async fetchFluxDocs() {
    return this.fetchDocs('Flux image generation model documentation', {
      source: 'github',
      maxResults: 5
    });
  }

  /**
   * Fetch ComfyUI latest nodes
   * @returns {Promise<string>}
   */
  async fetchComfyUIDocs() {
    return this.fetchDocs('ComfyUI custom nodes latest', {
      source: 'github',
      maxResults: 5
    });
  }

  /**
   * Fetch LoRA training best practices
   * @returns {Promise<string>}
   */
  async fetchLoRADocs() {
    return this.fetchDocs('LoRA training best practices 2024', {
      source: 'github',
      maxResults: 5
    });
  }

  /**
   * Get service statistics
   * @returns {Object}
   */
  getStats() {
    return {
      enabled: this.enabled,
      isConnecting: this.isConnecting
    };
  }

  /**
   * Check if service is enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Graceful shutdown
   */
  async close() {
    if (this.client) {
      try {
        await this.client.close();
        console.log('[Context7Service] Disconnected');
      } catch (error) {
        console.error('[Context7Service] Error during shutdown:', error.message);
      }
    }
  }
}
