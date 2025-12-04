/**
 * Memory Bank MCP Service
 * Persists user preferences, successful prompts, and generation history
 *
 * Uses MCP (Model Context Protocol) for standardized memory operations
 * Modular design: Can swap to Redis, SQLite, or cloud storage in v1.0
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export class MemoryService {
  constructor() {
    this.client = null;
    this.enabled = false;
    this.isConnecting = false;
  }

  /**
   * Initialize MCP Memory Bank connection
   */
  async initialize() {
    if (this.isConnecting) {
      console.log('[MemoryService] Already connecting...');
      return;
    }

    if (this.enabled) {
      console.log('[MemoryService] Already initialized');
      return;
    }

    this.isConnecting = true;

    try {
      console.log('[MemoryService] Initializing Memory Bank MCP...');

      this.client = new Client(
        { name: 'rag-memory', version: '1.0.0' },
        { capabilities: {} }
      );

      const transport = new StdioClientTransport({
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-memory']
      });

      await this.client.connect(transport);

      this.enabled = true;
      this.isConnecting = false;

      console.log('[MemoryService] Connected successfully');

    } catch (error) {
      console.error('[MemoryService] Initialization failed:', error.message);
      this.enabled = false;
      this.isConnecting = false;
      throw error;
    }
  }

  /**
   * Remember a successful generation
   * @param {Object} generationData - Data about the generation
   */
  async rememberGeneration(generationData) {
    if (!this.enabled) {
      console.warn('[MemoryService] Not enabled, skipping memory save');
      return;
    }

    const { prompt, enhancedPrompt, model, imageUrl, metadata } = generationData;

    try {
      await this.client.request({
        method: 'tools/call',
        params: {
          name: 'create_entities',
          arguments: {
            entities: [{
              name: `generation_${Date.now()}`,
              entityType: 'generation',
              observations: [
                `Original prompt: ${prompt}`,
                `Enhanced prompt: ${enhancedPrompt}`,
                `Model: ${model}`,
                `Image URL: ${imageUrl}`,
                `Metadata: ${JSON.stringify(metadata)}`
              ]
            }]
          }
        }
      });

      console.log('[MemoryService] Saved generation to memory');

    } catch (error) {
      console.error('[MemoryService] Failed to save generation:', error.message);
    }
  }

  /**
   * Remember a user preference
   * @param {string} key - Preference key (e.g., 'favorite_style')
   * @param {string} value - Preference value
   */
  async rememberPreference(key, value) {
    if (!this.enabled) {
      console.warn('[MemoryService] Not enabled, skipping preference save');
      return;
    }

    try {
      await this.client.request({
        method: 'tools/call',
        params: {
          name: 'create_entities',
          arguments: {
            entities: [{
              name: key,
              entityType: 'preference',
              observations: [value]
            }]
          }
        }
      });

      console.log(`[MemoryService] Saved preference: ${key} = ${value}`);

    } catch (error) {
      console.error('[MemoryService] Failed to save preference:', error.message);
    }
  }

  /**
   * Remember a failed generation (to avoid repeating mistakes)
   * @param {Object} failureData - Data about the failed generation
   */
  async rememberFailure(failureData) {
    if (!this.enabled) {
      console.warn('[MemoryService] Not enabled, skipping failure save');
      return;
    }

    const { prompt, error, model } = failureData;

    try {
      await this.client.request({
        method: 'tools/call',
        params: {
          name: 'create_entities',
          arguments: {
            entities: [{
              name: `failure_${Date.now()}`,
              entityType: 'failure',
              observations: [
                `Failed prompt: ${prompt}`,
                `Error: ${error}`,
                `Model: ${model}`,
                `Timestamp: ${new Date().toISOString()}`
              ]
            }]
          }
        }
      });

      console.log('[MemoryService] Saved failure to memory');

    } catch (error) {
      console.error('[MemoryService] Failed to save failure:', error.message);
    }
  }

  /**
   * Recall all memories (for context enhancement)
   * @returns {Promise<string>} Formatted memory context
   */
  async recallAll() {
    if (!this.enabled) {
      return '';
    }

    try {
      const result = await this.client.request({
        method: 'resources/read',
        params: { uri: 'memory://graph' }
      });

      if (!result || !result.contents || result.contents.length === 0) {
        return '';
      }

      // Parse and format memories
      const memoryText = result.contents[0].text || '';

      console.log('[MemoryService] Recalled memories:', memoryText.substring(0, 200) + '...');

      return memoryText;

    } catch (error) {
      console.error('[MemoryService] Failed to recall memories:', error.message);
      return '';
    }
  }

  /**
   * Recall specific type of memories
   * @param {string} entityType - Type to filter (e.g., 'preference', 'generation')
   * @returns {Promise<Array>} Filtered memories
   */
  async recallByType(entityType) {
    if (!this.enabled) {
      return [];
    }

    try {
      const allMemories = await this.recallAll();

      // Simple filtering - in v1.0 this can use graph queries
      const lines = allMemories.split('\n');
      const filtered = lines.filter(line =>
        line.toLowerCase().includes(entityType.toLowerCase())
      );

      return filtered;

    } catch (error) {
      console.error('[MemoryService] Failed to recall by type:', error.message);
      return [];
    }
  }

  /**
   * Get memory statistics
   * @returns {Promise<Object>} Memory stats
   */
  async getStats() {
    if (!this.enabled) {
      return { enabled: false };
    }

    try {
      const memories = await this.recallAll();
      const lines = memories.split('\n').filter(l => l.trim());

      return {
        enabled: true,
        totalMemories: lines.length,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('[MemoryService] Failed to get stats:', error.message);
      return { enabled: true, error: error.message };
    }
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
        console.log('[MemoryService] Disconnected');
      } catch (error) {
        console.error('[MemoryService] Error during shutdown:', error.message);
      }
    }
  }
}
