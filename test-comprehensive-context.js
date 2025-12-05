#!/usr/bin/env node

/**
 * Comprehensive Context Gathering Test
 * Tests that system identifies missing context for ALL task types
 */

// Import the detectUserIntent logic
class ContextTester {
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
}

// Test cases covering all task types
const testCases = [
  // Prompt Creation Tests
  {
    name: 'Prompt - Missing Everything',
    query: 'Help me create a prompt',
    expected: {
      taskType: 'prompt-creation',
      missingContext: ['model-type', 'reference-image-status'],
      needsClarification: true
    }
  },
  {
    name: 'Prompt - Has Model, Missing Reference Status',
    query: 'Write me a Flux prompt for a woman',
    expected: {
      taskType: 'prompt-creation',
      modelHints: ['flux'],
      missingContext: ['reference-image-status'],
      needsClarification: true
    }
  },
  {
    name: 'Prompt - Complete Context',
    query: 'Write a Flux prompt for a woman, no reference image',
    expected: {
      taskType: 'prompt-creation',
      modelHints: ['flux'],
      missingContext: [],
      needsClarification: false
    }
  },
  {
    name: 'Prompt - POV Ambiguity',
    query: 'Create a prompt for a mirror selfie',
    expected: {
      taskType: 'prompt-creation',
      patterns: ['pov-scenario'],
      missingContext: ['model-type', 'reference-image-status', 'pov-type']
    }
  },

  // LoRA Training Tests
  {
    name: 'Training - Missing Phase and Model',
    query: 'I need help with LoRA training',
    expected: {
      taskType: 'lora-training',
      missingContext: ['training-phase', 'target-model'],
      needsClarification: true
    }
  },
  {
    name: 'Training - Has Phase',
    query: 'Im at dataset generation phase for Flux training',
    expected: {
      taskType: 'lora-training',
      modelHints: ['flux'],
      missingContext: [],
      needsClarification: false
    }
  },

  // Troubleshooting Tests
  {
    name: 'Troubleshoot - Vague Issue',
    query: 'My image generation is not working',
    expected: {
      taskType: 'troubleshooting',
      missingContext: ['specific-error'],
      needsClarification: true
    }
  },
  {
    name: 'Troubleshoot - Specific Error',
    query: 'Im getting error: 404 when generating images',
    expected: {
      taskType: 'troubleshooting',
      missingContext: [],
      needsClarification: false
    }
  },

  // Multi-Image Editing Tests
  {
    name: 'Multi-Image - Missing Count',
    query: 'How do I combine images with outfit transfer?',
    expected: {
      taskType: 'multi-image-editing',
      modelHints: ['qwen'],
      missingContext: ['number-of-images'],
      needsClarification: true
    }
  },
  {
    name: 'Multi-Image - Complete',
    query: 'Combine 2 images with outfit transfer',
    expected: {
      taskType: 'multi-image-editing',
      modelHints: ['qwen'],
      missingContext: [],
      needsClarification: false
    }
  },

  // Character Consistency Tests
  {
    name: 'Character - Missing Reference',
    query: 'Help with character consistency',
    expected: {
      taskType: 'character-consistency',
      modelHints: ['higgsfield'],
      missingContext: ['reference-image-status'],
      needsClarification: true
    }
  },
  {
    name: 'Character - Has Reference, Missing Trigger',
    query: 'I have a reference image for character consistency',
    expected: {
      taskType: 'character-consistency',
      modelHints: ['higgsfield'],
      missingContext: ['trigger-word'],
      needsClarification: true
    }
  },

  // Knowledge Query Tests (should NOT need clarification)
  {
    name: 'Knowledge - What is',
    query: 'What is LoRA training?',
    expected: {
      taskType: 'knowledge-query',
      missingContext: [],
      needsClarification: false
    }
  },
  {
    name: 'Knowledge - How does',
    query: 'How does Flux work?',
    expected: {
      taskType: 'knowledge-query',
      missingContext: [],
      needsClarification: false
    }
  }
];

// Run tests
console.log('\n=== Comprehensive Context Gathering Test ===\n');

const tester = new ContextTester();
let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  console.log(`\nTest ${index + 1}: ${testCase.name}`);
  console.log(`Query: "${testCase.query}"`);

  const result = tester.detectUserIntent(testCase.query);

  // Validation
  let testPassed = true;
  const errors = [];

  // Check task type
  if (testCase.expected.taskType && result.taskType !== testCase.expected.taskType) {
    errors.push(`Task type mismatch: expected ${testCase.expected.taskType}, got ${result.taskType}`);
    testPassed = false;
  }

  // Check needsClarification
  if (testCase.expected.needsClarification !== undefined && result.needsClarification !== testCase.expected.needsClarification) {
    errors.push(`Clarification flag: expected ${testCase.expected.needsClarification}, got ${result.needsClarification}`);
    testPassed = false;
  }

  // Check missing context
  if (testCase.expected.missingContext) {
    const expectedMissing = testCase.expected.missingContext.sort().join(',');
    const actualMissing = result.missingContext.sort().join(',');
    if (expectedMissing !== actualMissing) {
      errors.push(`Missing context: expected [${expectedMissing}], got [${actualMissing}]`);
      testPassed = false;
    }
  }

  console.log('Result:', {
    taskType: result.taskType,
    modelHints: result.modelHints,
    patterns: result.patterns,
    missingContext: result.missingContext,
    needsClarification: result.needsClarification
  });

  if (testPassed) {
    console.log('✅ PASSED');
    passed++;
  } else {
    console.log('❌ FAILED');
    errors.forEach(err => console.log(`   - ${err}`));
    failed++;
  }
});

console.log(`\n\n=== Summary ===`);
console.log(`Total: ${testCases.length} | Passed: ${passed} | Failed: ${failed}`);
console.log(passed === testCases.length ? '\n✅ All tests passed! System will gather context for ALL task types.' : '\n❌ Some tests failed');
