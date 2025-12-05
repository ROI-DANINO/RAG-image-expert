/**
 * Test Rating-Based Learning Integration
 * Verifies that high-rated feedback triggers Memory MCP saves
 */

const chalk = require('chalk');

async function testRatingIntegration() {
  console.log(chalk.bold('\n=== Rating-Based Learning Integration Test ===\n'));

  const baseUrl = 'http://localhost:3000';

  // Test data
  const testFeedback = {
    feedbackId: 'test-' + Date.now(),
    sessionId: 'test-session',
    timestamp: new Date().toISOString(),
    thumbs: 'up',
    rating: 6,
    notes: 'Great result!',
    queryText: 'Generate a cyberpunk portrait',
    responseText: 'A stunning cyberpunk portrait with neon lighting and futuristic elements',
    ragContext: JSON.stringify([{ source: 'test', content: 'test context' }])
  };

  console.log(chalk.cyan('Test Case 1: High rating (6/7) - Should save to Memory MCP'));
  console.log('Feedback data:', {
    rating: testFeedback.rating,
    queryText: testFeedback.queryText,
    responseText: testFeedback.responseText.substring(0, 50) + '...'
  });

  try {
    const response = await fetch(`${baseUrl}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testFeedback)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const result = await response.json();
    console.log(chalk.green('✅ Feedback saved successfully'));
    console.log('Result:', result);

  } catch (error) {
    console.log(chalk.red('❌ Test failed:'), error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.log(chalk.yellow('\n⚠️  Server not running. Start it with: npm start\n'));
    }
  }

  console.log(chalk.cyan('\nTest Case 2: Low rating (3/7) - Should NOT save to Memory MCP'));
  const lowRatingFeedback = {
    ...testFeedback,
    feedbackId: 'test-low-' + Date.now(),
    rating: 3,
    thumbs: 'down',
    notes: 'Not quite right'
  };

  try {
    const response = await fetch(`${baseUrl}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lowRatingFeedback)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const result = await response.json();
    console.log(chalk.green('✅ Feedback saved (but not to Memory MCP)'));
    console.log('Result:', result);

  } catch (error) {
    console.log(chalk.red('❌ Test failed:'), error.message);
  }

  console.log(chalk.cyan('\nTest Case 3: Check service status'));

  try {
    const response = await fetch(`${baseUrl}/services/status`);
    const status = await response.json();

    console.log(chalk.bold('\nService Status:'));
    console.log('  Memory MCP:', status.memory.enabled ? chalk.green('✅ Enabled') : chalk.yellow('⚠️  Disabled'));
    console.log('  Context7:', status.context7.enabled ? chalk.green('✅ Enabled') : chalk.yellow('⚠️  Disabled'));

    if (!status.memory.enabled) {
      console.log(chalk.yellow('\n⚠️  Memory MCP is disabled. Rating-based saves will be skipped.'));
    }

  } catch (error) {
    console.log(chalk.red('❌ Could not check service status:'), error.message);
  }

  console.log(chalk.bold('\n=== Test Complete ===\n'));
  console.log(chalk.dim('Note: Check server logs for "[Memory] Saving highly-rated generation" messages\n'));
}

testRatingIntegration().catch(console.error);
