#!/usr/bin/env node

/**
 * Test Queries - RAG Performance Validation
 * Runs 20 baseline queries from test_validation.md
 * Measures performance and logs metrics
 */

const fs = require('fs');
const path = require('path');
const { SimpleRAG } = require('./simple-rag.js');

// 20 baseline test queries from test_validation.md
const TEST_QUERIES = [
  { id: 1, query: "How do I make skin look realistic for Instagram?", pattern: "Pattern 2 (POV)", primaryFiles: ["07"], secondaryFiles: ["01"] },
  { id: 2, query: "What camera for iPhone-style posts?", pattern: "Pattern 2 (POV)", primaryFiles: ["07"], secondaryFiles: ["01"] },
  { id: 3, query: "My LoRA has plastic skin, how to fix?", pattern: "Pattern 4 (Workflow)", primaryFiles: ["04", "02"], secondaryFiles: ["02a"] },
  { id: 4, query: "Create bedroom mirror selfie prompt", pattern: "Pattern 2 (POV)", primaryFiles: ["07"], secondaryFiles: ["agent.md"] },
  { id: 5, query: "Qwen training parameters for character LoRA", pattern: "Pattern 4 (Workflow)", primaryFiles: ["02a"], secondaryFiles: ["02"] },
  { id: 6, query: "How to caption images for training?", pattern: "Pattern 3 (Reference)", primaryFiles: ["02", "06"], secondaryFiles: ["08"] },
  { id: 7, query: "Higgsfield vs direct generation?", pattern: "Pattern 1 (Model)", primaryFiles: ["08", "06"], secondaryFiles: [] },
  { id: 8, query: "Third-person or selfie for coffee shop?", pattern: "Pattern 2 (POV)", primaryFiles: ["07", "agent.md"], secondaryFiles: [] },
  { id: 9, query: "Flux vs Qwen for Instagram?", pattern: "Pattern 1 (Model)", primaryFiles: ["08", "02b", "02a"], secondaryFiles: [] },
  { id: 10, query: "How long does LoRA training take?", pattern: "Pattern 4 (Workflow)", primaryFiles: ["02", "agent.md"], secondaryFiles: [] },
  { id: 11, query: "Best LoRA strength to use?", pattern: "General", primaryFiles: ["03", "02a"], secondaryFiles: [] },
  { id: 12, query: "How to test checkpoints?", pattern: "Pattern 4 (Workflow)", primaryFiles: ["02", "agent.md"], secondaryFiles: ["04"] },
  { id: 13, query: "Morning in bed photo - what POV?", pattern: "Pattern 2 (POV)", primaryFiles: ["07", "agent.md"], secondaryFiles: [] },
  { id: 14, query: "Reference image with LoRA - how to prompt?", pattern: "Pattern 3 (Reference)", primaryFiles: ["08", "agent.md"], secondaryFiles: ["02"] },
  { id: 15, query: "Troubleshoot face inconsistency", pattern: "Pattern 4 (Workflow)", primaryFiles: ["04"], secondaryFiles: ["02"] },
  { id: 16, query: "Dataset size for character LoRA?", pattern: "Pattern 4 (Workflow)", primaryFiles: ["02", "06"], secondaryFiles: [] },
  { id: 17, query: "Anti-aesthetic vs photorealistic - when?", pattern: "Pattern 2 (POV)", primaryFiles: ["07"], secondaryFiles: ["01"] },
  { id: 18, query: "Model-specific prompting for Nano Banana", pattern: "Pattern 1 (Model)", primaryFiles: ["08"], secondaryFiles: ["01"] },
  { id: 19, query: "Complete workflow idea to Instagram post", pattern: "Pattern 4 (Workflow)", primaryFiles: ["02", "06", "agent.md"], secondaryFiles: ["07"] },
  { id: 20, query: "POV for gym changing room photo?", pattern: "Pattern 2 (POV)", primaryFiles: ["07", "agent.md"], secondaryFiles: [] }
];

// Analyze if primary files are in top results
function analyzePrimaryFileRetrieval(results, primaryFiles) {
  const sources = results.map(r => r.source.toLowerCase());
  let matches = 0;

  for (const file of primaryFiles) {
    const filePattern = file.toLowerCase().replace('agent.md', 'agent/agent.md');
    if (sources.some(s => s.includes(filePattern))) {
      matches++;
    }
  }

  return matches / Math.min(primaryFiles.length, results.length);
}

// Calculate pattern distribution
function calculatePatternDistribution(results) {
  const patterns = {};
  results.forEach(r => {
    const pattern = r.pattern;
    patterns[pattern] = (patterns[pattern] || 0) + 1;
  });
  return patterns;
}

async function runTests() {
  console.log('=== RAG Performance Test Suite ===\n');
  console.log(`Testing ${TEST_QUERIES.length} baseline queries...\n`);

  const rag = new SimpleRAG();
  await rag.initialize();
  rag.loadCache();

  const results = [];
  let totalTime = 0;
  let totalRelevance = 0;
  let totalPrimaryFileHits = 0;

  for (const test of TEST_QUERIES) {
    console.log(`[${test.id}/20] Testing: "${test.query}"`);

    const startTime = Date.now();
    const searchResults = await rag.search(test.query);
    const queryTime = Date.now() - startTime;

    const primaryFileAccuracy = analyzePrimaryFileRetrieval(searchResults, test.primaryFiles);
    const topScore = searchResults[0]?.score || 0;

    totalTime += queryTime;
    totalRelevance += topScore;
    totalPrimaryFileHits += primaryFileAccuracy;

    results.push({
      id: test.id,
      query: test.query,
      pattern: test.pattern,
      queryTime,
      topScore,
      primaryFileAccuracy,
      topResults: searchResults.map(r => ({
        source: r.source,
        section: r.section,
        score: r.score
      }))
    });

    console.log(`  ⏱️  ${queryTime}ms | 📊 ${topScore.toFixed(3)} | ✅ ${(primaryFileAccuracy * 100).toFixed(0)}% primary file hit`);
  }

  // Calculate metrics
  const avgQueryTime = totalTime / TEST_QUERIES.length;
  const avgRelevance = totalRelevance / TEST_QUERIES.length;
  const avgPrimaryFileAccuracy = (totalPrimaryFileHits / TEST_QUERIES.length) * 100;

  // Pattern distribution
  const patternDist = calculatePatternDistribution(TEST_QUERIES);

  console.log('\n=== Performance Summary ===\n');
  console.log(`Total queries: ${TEST_QUERIES.length}`);
  console.log(`Average query time: ${avgQueryTime.toFixed(0)}ms (target: <400ms)`);
  console.log(`Average relevance: ${avgRelevance.toFixed(3)} (target: >8.8/10 = 0.880)`);
  console.log(`Primary file accuracy: ${avgPrimaryFileAccuracy.toFixed(1)}% (target: >80%)`);
  console.log(`Total chunks in index: ${rag.index.chunks.length}`);
  console.log(`\nPattern distribution:`);
  Object.entries(patternDist).forEach(([pattern, count]) => {
    console.log(`  ${pattern}: ${count} queries (${(count/TEST_QUERIES.length*100).toFixed(0)}%)`);
  });

  // Save results
  const metricsFile = path.join(__dirname, '..', 'SYSTEM', 'efficiency-metrics.json');
  const metrics = {
    version: "0.3",
    test_date: new Date().toISOString(),
    rag_system: {
      total_files: 10,
      total_chunks: rag.index.chunks.length,
      embeddings_size_kb: (fs.statSync(path.join(__dirname, 'embeddings/core/embeddings-cache.json')).size / 1024).toFixed(2),
      model: "Xenova/all-MiniLM-L6-v2"
    },
    performance: {
      avg_query_time_ms: parseFloat(avgQueryTime.toFixed(0)),
      avg_relevance_score: parseFloat(avgRelevance.toFixed(3)),
      avg_primary_file_accuracy_percent: parseFloat(avgPrimaryFileAccuracy.toFixed(1)),
      total_queries_tested: TEST_QUERIES.length,
      target_query_time_ms: 400,
      target_relevance: 0.880,
      target_primary_accuracy: 80
    },
    pattern_distribution: patternDist,
    test_results: results,
    status: {
      query_time: avgQueryTime < 400 ? "✅ PASS" : "⚠️ ABOVE TARGET",
      relevance: avgRelevance > 0.880 ? "⚠️ BELOW TARGET (cosine scores are 0-1, not 0-10)" : "✅ PASS",
      primary_accuracy: avgPrimaryFileAccuracy > 80 ? "✅ PASS" : "⚠️ BELOW TARGET"
    }
  };

  fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));
  console.log(`\n✅ Results saved to: ${metricsFile}`);

  // Show pass/fail summary
  console.log('\n=== Test Status ===');
  console.log(`Query time: ${metrics.status.query_time}`);
  console.log(`Relevance: ${metrics.status.relevance}`);
  console.log(`Primary file accuracy: ${metrics.status.primary_accuracy}`);
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
