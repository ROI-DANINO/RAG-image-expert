#!/usr/bin/env node

/**
 * RAG Retriever CLI - Easy interface for querying knowledge base
 * Usage: node rag_retriever.js "your query here"
 */

const { SimpleRAG } = require('./simple-rag');
const chalk = require('chalk');

async function retrieve(query, topK = 3) {
  try {
    const rag = new SimpleRAG();
    
    // Initialize model (takes a moment first time)
    console.log(chalk.gray('Initializing...'));
    await rag.initialize();
    
    // Load cached embeddings
    rag.loadCache();
    
    // Search
    const results = await rag.search(query, topK);
    
    // Pretty print results
    console.log(chalk.bold('\n📚 Knowledge Base Results:\n'));
    
    results.forEach((result, i) => {
      console.log(chalk.bold.cyan(`[${i + 1}] ${result.source}`));
      console.log(chalk.gray(`    Section: ${result.section}`));
      console.log(chalk.yellow(`    Relevance: ${(result.score * 100).toFixed(1)}%`));
      console.log(chalk.white(`    Lines: ${result.line_start}-${result.line_end}`));
      console.log('');
      
      // Print content with line wrapping
      const content = result.content.substring(0, 400);
      const wrapped = wrapText(content, 80);
      console.log(chalk.gray(wrapped));
      
      if (result.content.length > 400) {
        console.log(chalk.gray('    [...truncated...]'));
      }
      
      console.log('');
    });
    
    console.log(chalk.gray('─'.repeat(80)));
    console.log(chalk.green(`\n✅ Retrieved ${results.length} relevant sections\n`));
    
  } catch (error) {
    if (error.message.includes('Cache file not found')) {
      console.error(chalk.red('\n❌ Error: Index not built yet\n'));
      console.log(chalk.yellow('Please run first:'));
      console.log(chalk.cyan('  cd ~/work_station/claude/rag'));
      console.log(chalk.cyan('  node simple-rag.js build-index\n'));
    } else {
      console.error(chalk.red('\n❌ Error:'), error.message);
    }
    process.exit(1);
  }
}

function wrapText(text, width) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '    ';
  
  words.forEach(word => {
    if ((currentLine + word).length > width) {
      lines.push(currentLine);
      currentLine = '    ' + word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });
  
  if (currentLine.trim()) {
    lines.push(currentLine);
  }
  
  return lines.join('\n');
}

// CLI
const args = process.argv.slice(2);
const query = args.join(' ');

if (!query) {
  console.log(chalk.bold('\nRAG Retriever - Query AI Image Generation Knowledge Base\n'));
  console.log('Usage:');
  console.log(chalk.cyan('  node rag_retriever.js "your search query"'));
  console.log('');
  console.log('Examples:');
  console.log(chalk.gray('  node rag_retriever.js "realistic skin texture prompts"'));
  console.log(chalk.gray('  node rag_retriever.js "LoRA training parameters Qwen"'));
  console.log(chalk.gray('  node rag_retriever.js "troubleshoot plastic skin"'));
  console.log('');
  process.exit(0);
}

retrieve(query);
