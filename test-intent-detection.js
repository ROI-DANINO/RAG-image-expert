#!/usr/bin/env node

/**
 * Test Intent Detection System
 * Tests the detectUserIntent() method with various query types
 */

// Mock RAGServer class with just the detectUserIntent method
class IntentTester {
  detectUserIntent(message) {
    const lowerMsg = message.toLowerCase();
    const intent = {
      patterns: [],
      modelHints: [],
      needsClarification: false,
      clarificationNeeded: null
    };

    // Pattern 1: Model Detection (explicit)
    if (lowerMsg.includes('nano banana')) intent.modelHints.push('nano-banana-pro');
    if (lowerMsg.includes('flux')) intent.modelHints.push('flux');
    if (lowerMsg.includes('higgsfield') || lowerMsg.includes('soul id')) intent.modelHints.push('higgsfield');
    if (lowerMsg.includes('qwen')) intent.modelHints.push('qwen');

    // Pattern 1: Model Detection (inferred from keywords)
    if (lowerMsg.includes('text rendering') || lowerMsg.includes('text in image')) {
      intent.modelHints.push('nano-banana-pro');
      intent.patterns.push('text-rendering');
    }
    if (lowerMsg.includes('trigger word') || lowerMsg.includes('lora') || lowerMsg.includes('character consistency')) {
      intent.modelHints.push('higgsfield');
      intent.patterns.push('character-consistency');
    }
    if (lowerMsg.includes('multi-image') || lowerMsg.includes('outfit transfer') || lowerMsg.includes('combine images')) {
      intent.modelHints.push('qwen');
      intent.patterns.push('multi-image-edit');
    }

    // Pattern 2: POV Detection (future enhancement)
    const povKeywords = ['selfie', 'mirror', 'bedroom', 'bathroom', 'gym locker'];
    if (povKeywords.some(kw => lowerMsg.includes(kw))) {
      intent.patterns.push('pov-scenario');
    }

    // Pattern 3: Reference Image Detection
    if (lowerMsg.includes('reference image') || lowerMsg.includes('reference photo') || lowerMsg.includes('ref image')) {
      intent.patterns.push('has-reference-image');
    }

    // Determine if clarification needed (model type is critical for prompt generation)
    const isPromptRequest = lowerMsg.includes('prompt') || lowerMsg.includes('generate') || lowerMsg.includes('write a prompt');
    if (isPromptRequest && intent.modelHints.length === 0) {
      intent.needsClarification = true;
      intent.clarificationNeeded = 'model-type';
    }

    return intent;
  }
}

// Test cases
const testCases = [
  {
    name: 'Model Ambiguous - Should ask',
    query: 'Help me write a prompt for a woman in a park',
    expected: { needsClarification: true, clarificationNeeded: 'model-type' }
  },
  {
    name: 'Model Explicit - Flux',
    query: 'Help me write a Flux prompt for a woman in a park',
    expected: { modelHints: ['flux'], needsClarification: false }
  },
  {
    name: 'Model Inferred - Nano Banana (text rendering)',
    query: 'I need help with text rendering in my image',
    expected: { modelHints: ['nano-banana-pro'], patterns: ['text-rendering'] }
  },
  {
    name: 'Model Inferred - Higgsfield (LoRA)',
    query: 'How do I use a trigger word with my trained LoRA?',
    expected: { modelHints: ['higgsfield'], patterns: ['character-consistency'] }
  },
  {
    name: 'General Question - No clarification needed',
    query: 'What is LoRA training?',
    expected: { needsClarification: false }
  },
  {
    name: 'POV Scenario - Selfie',
    query: 'Help me create a mirror selfie in my bedroom',
    expected: { patterns: ['pov-scenario'] }
  },
  {
    name: 'Reference Image',
    query: 'I have a reference image of my character',
    expected: { patterns: ['has-reference-image'] }
  },
  {
    name: 'Multi-Image - Qwen',
    query: 'How do I combine images with outfit transfer?',
    expected: { modelHints: ['qwen'], patterns: ['multi-image-edit'] }
  }
];

// Run tests
console.log('\n=== Intent Detection Test Results ===\n');

const tester = new IntentTester();
let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`Query: "${testCase.query}"`);

  const result = tester.detectUserIntent(testCase.query);
  console.log('Result:', JSON.stringify(result, null, 2));

  // Simple validation
  let testPassed = true;
  if (testCase.expected.needsClarification !== undefined) {
    if (result.needsClarification !== testCase.expected.needsClarification) {
      testPassed = false;
    }
  }
  if (testCase.expected.modelHints) {
    const hasExpectedModels = testCase.expected.modelHints.every(m => result.modelHints.includes(m));
    if (!hasExpectedModels) testPassed = false;
  }
  if (testCase.expected.patterns) {
    const hasExpectedPatterns = testCase.expected.patterns.every(p => result.patterns.includes(p));
    if (!hasExpectedPatterns) testPassed = false;
  }

  if (testPassed) {
    console.log('✅ PASSED\n');
    passed++;
  } else {
    console.log('❌ FAILED\n');
    failed++;
  }
});

console.log(`\n=== Summary ===`);
console.log(`Total: ${testCases.length} | Passed: ${passed} | Failed: ${failed}`);
console.log(passed === testCases.length ? '✅ All tests passed!' : '❌ Some tests failed');
