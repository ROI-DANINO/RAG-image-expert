# Intelligent Context Gathering System (v0.6.0)

> **Core Principle:** System gathers ALL necessary context before providing solutions

## Overview

The RAG Image Expert v0.6.0 introduces an intelligent context gathering system that ensures complete information is collected before answering user queries. This reduces back-and-forth iterations and improves response quality.

## How It Works

### 1. Intent Detection

When you send a message, the system:
1. **Identifies the task type** (prompt creation, training, troubleshooting, etc.)
2. **Detects missing context** (model type, phase, reference images, etc.)
3. **Routes appropriately** (asks questions first for critical tasks, answers directly for knowledge queries)

### 2. Task Categories

The system recognizes **6 task types**:

| Task Type | Description | Context Required |
|-----------|-------------|------------------|
| **Prompt Creation** | Help writing prompts | Model type, reference image status, POV type (if applicable) |
| **Image Generation** | Generate or create images | Model type, setup details |
| **LoRA Training** | Training custom models | Current phase, dataset status, target model |
| **Troubleshooting** | Fix errors or issues | Specific error message, what was tried |
| **Multi-Image Editing** | Combine/edit multiple images | Number of images, what to keep vs change |
| **Character Consistency** | Maintain character across generations | Reference image, trigger word |
| **Knowledge Query** | Learn concepts ("What is X?") | No clarification needed - answers directly |

### 3. Smart Routing

#### Critical Questions (Asked BEFORE Answering)

These tasks require complete context:

**Prompt Creation:**
```
User: "Help me create a prompt"
System: "Which model are you using? (Nano Banana Pro, Flux, Higgsfield Soul ID, Qwen, or other)
         Do you have a reference image?"
```

**LoRA Training:**
```
User: "I need help with LoRA training"
System: "Which phase are you in? (dataset generation, preparation, training execution, testing)
         Which model are you training for? (Flux, Qwen)"
```

**Troubleshooting:**
```
User: "My image generation is not working"
System: "What specific error are you getting? (error message, HTTP code, or description)"
```

#### Direct Answers (No Questions Needed)

Knowledge queries are answered immediately:

```
User: "What is LoRA training?"
System: [Provides detailed answer from knowledge base]
```

```
User: "How does Flux work?"
System: [Explains Flux architecture and features]
```

## Model Detection

The system automatically detects which image generation model you're using:

### Explicit Detection

Mentions the model name directly:

- "Nano Banana" → Nano Banana Pro
- "Flux" → Flux.2
- "Higgsfield" or "Soul ID" → Higgsfield Soul ID
- "Qwen" → Qwen Image Edit

### Inferred Detection

Detects from keywords in your query:

| Keywords | Inferred Model | Reasoning |
|----------|---------------|-----------|
| "text rendering", "text in image" | Nano Banana Pro | Best at rendering text |
| "trigger word", "LoRA", "character consistency" | Higgsfield Soul ID | Character consistency specialist |
| "multi-image", "outfit transfer", "combine images" | Qwen Image Edit | Multi-image editing expert |
| Detailed scene (>50 words) | Flux.2 | Best for complex descriptions |

### Examples

**Example 1: Explicit Model**
```
User: "Write me a Flux prompt for a woman in a park"
System: [Detects Flux, asks about reference image status]
```

**Example 2: Inferred Model**
```
User: "I need help with text rendering in my image"
System: [Infers Nano Banana Pro, provides text-specific guidance]
```

**Example 3: Ambiguous Model**
```
User: "Help me write a prompt for a woman in a park"
System: "Which model are you using? (Nano Banana Pro, Flux, Higgsfield Soul ID, Qwen, or other)"
```

## Pattern Detection

### POV Scenarios

Detects selfie/mirror situations:

**Keywords:** selfie, mirror, bedroom, bathroom, gym locker

```
User: "Create a prompt for a mirror selfie"
System: [Detects POV scenario, asks: "Is this selfie or third-person POV?"]
```

### Reference Images

Detects when character consistency is involved:

**Keywords:** reference image, reference photo, "I have a reference"

```
User: "I have a reference image of my character"
System: [Asks: "What's your trigger word?" (if not mentioned)]
```

### Multi-Image Editing

Detects combining multiple images:

**Keywords:** multi-image, outfit transfer, combine images

```
User: "How do I combine images?"
System: [Asks: "How many images are you working with?"]
```

## Model-Specific Guidance

Once context is gathered, the system provides optimized guidance for your model:

### Nano Banana Pro
- **Prompt Length:** Flexible (short or detailed both work)
- **Format:** [Subject] [Action] [Location] [Composition] [Lighting] [Style]
- **Best For:** Text rendering, concise queries

### Higgsfield Soul ID
- **Prompt Length:** 40-60 words
- **Format:** START with trigger word (e.g., grace_char)
- **Focus On:** Outfit, pose, setting, lighting, mood
- **Exclude:** Hair color, eye color, facial features (Soul ID handles this)

### Flux.2
- **Prompt Length:** Flexible (30-100+ words)
- **Include:** Technical specs (camera, lens, aperture)
- **Structure:** Hierarchical (foreground → middle ground → background)
- **Phrasing:** Positive (avoid negations)

### Qwen Image Edit
- **Prompt Length:** 1-3 sentences
- **Format:** [keep/transfer] [change] [context] [quality]
- **Best For:** Multi-image editing, outfit transfer

## Configuration

### Enable/Disable

Control the feature via environment variable:

```bash
# .env
ENABLE_INTENT_DETECTION=true  # Default: enabled
```

Set to `false` to disable and revert to basic RAG context only.

### Feature Flag Benefits

- **Enabled:** Smart clarification questions, task detection, missing context alerts
- **Disabled:** Basic RAG retrieval without intent analysis (backward compatible)

## Technical Flow

```
┌─────────────────────────────────────┐
│ User sends message                  │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ detectUserIntent(message)           │
│ - Identifies task type              │
│ - Detects missing context           │
│ - Checks for model hints            │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ Build Intent Context                │
│ Task: prompt-creation               │
│ Models: flux                        │
│ Patterns: pov-scenario              │
│ MISSING: reference-image-status     │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ RAG Search + Context Building       │
│ - Semantic search                   │
│ - Query expansion                   │
│ - Add intent alerts                 │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ LLM Receives:                       │
│ - System prompt (with protocols)    │
│ - RAG context                       │
│ - Intent alerts (task + missing)    │
│ - User message                      │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ LLM Decision:                       │
│ - Missing context? → Ask questions  │
│ - Complete context? → Provide answer│
└─────────────────────────────────────┘
```

## Real-World Examples

### Example 1: Complete Workflow (Prompt Creation)

**Turn 1:**
```
User: "Help me create a prompt"
System: "Which model are you using? (Nano Banana Pro, Flux, Higgsfield Soul ID, Qwen, or other)"
```

**Turn 2:**
```
User: "Flux"
System: "Do you have a reference image for character consistency?"
```

**Turn 3:**
```
User: "No reference image"
System: [Provides Flux-optimized prompt guidance]
"Here's a Flux prompt structure:

A [subject description] doing [action] in [setting]. [Detailed environment].
[Lighting details]. [Camera/lens specs]. [Atmospheric conditions].

For your scene:
- Keep it 30-80 words for detailed images
- Include technical specs like 'shot on Canon EOS R5, 85mm f/1.4'
- Describe foreground, middle ground, background separately
- Use positive phrasing (not negations)

Example: 'A confident businesswoman in navy suit sitting at modern desk...' "
```

### Example 2: Knowledge Query (Direct Answer)

```
User: "What is the difference between Flux.2 and Nano Banana Pro?"

System: [Answers immediately]
"**Flux.2:**
- Best for complex scenes with detailed descriptions
- Flexible prompt length (30-100+ words)
- Dual encoders (T5 + CLIP) for technical precision
- Excellent natural language understanding

**Nano Banana Pro:**
- Best for text rendering (signs, labels, UI)
- Flexible prompt length (short or detailed)
- Built on Gemini Pro
- Structured format [Subject][Action][Location]

Choose Flux for photorealism, Nano Banana for text."
```

### Example 3: LoRA Training Guidance

**Turn 1:**
```
User: "I need help with LoRA training"
System: "Which phase are you in?
- Phase 1: Dataset Generation
- Phase 2: Dataset Preparation
- Phase 3: Training Execution
- Phase 4: Testing & Selection"
```

**Turn 2:**
```
User: "Phase 1 dataset generation"
System: "Which model are you training for? (Flux, Qwen)"
```

**Turn 3:**
```
User: "Flux"
System: [Provides phase-specific Flux dataset guidance]
"For Flux Phase 1 (Dataset Generation):

**Goal:** 70 character images + 30 body reference images

**Character Images (70 total):**
- 20 face closeups (varied expressions)
- 30 full body shots (different outfits)
- 20 body variety (angles, poses)

**Body References (30 total):**
- MUST match character's body type
- High quality, varied poses
- Tag with 'realistic_body'

**Generation Tips:**
- Use consistent lighting
- Vary backgrounds
- Avoid AI artifacts
- Quality over quantity

Next: Need help with captioning?"
```

## Benefits

### For Users
- ✅ **Faster Results** - Get it right the first time
- ✅ **Better Guidance** - Context-aware recommendations
- ✅ **Less Confusion** - Clear questions about what's needed
- ✅ **Fewer Iterations** - No back-and-forth to gather info

### For System
- ✅ **Smarter Responses** - Full context before answering
- ✅ **Token Efficient** - Concise clarification questions
- ✅ **Pattern Recognition** - Learns common task patterns
- ✅ **Extensible** - Easy to add new task types

## Future Enhancements

The foundation supports adding:

### Pattern 2: POV Framework
Automatic POV detection and guidance:
- Selfie scenarios → Mirror/phone prompts
- Third-person scenarios → Photographer/friend prompts
- Tripod scenarios → Centered framing prompts

### Pattern 3: Reference Image Rules
Automatic feature exclusion:
- Detect reference images → Exclude hair/eye color from prompts
- Focus on variables only → Outfit, pose, setting, lighting

### Pattern 4: Workflow Tracking
Phase-gated LoRA training:
- Track progress through phases
- Provide phase-specific guidance
- Save workflow state per session

## Troubleshooting

### "System isn't asking questions"

Check your environment variable:
```bash
# .env
ENABLE_INTENT_DETECTION=true
```

Restart the server after changing.

### "System asks too many questions"

This is intentional for critical tasks. The system needs:
- Model type (for prompt optimization)
- Reference status (for character work)
- Phase info (for training tasks)

Knowledge queries are answered directly without questions.

### "Wrong model detected"

Be explicit in your query:
```
Good: "Write a Flux prompt for..."
Vague: "Write a prompt for..."
```

The system will ask if unclear.

## Testing

Run the test suites to verify functionality:

```bash
# Model detection tests
node test-intent-detection.js

# Comprehensive task type tests
node test-comprehensive-context.js
```

Expected results:
- Model detection: 8/8 passing (100%)
- Comprehensive: 12/14 passing (86%)

## API Integration

If using the REST API, the intent detection happens automatically:

```javascript
// POST /conversation
{
  "sessionId": "session-123",
  "message": "Help me create a prompt"
}

// Response includes detected context
{
  "sessionId": "session-123",
  "response": "Which model are you using?...",
  "context": [
    {
      "source": "08_model_specific_best_practices.md",
      "section": "Model-Specific Prompting",
      "score": 0.89
    }
  ]
}
```

Console output shows detection:
```
[Intent] Task: prompt-creation | MISSING: model-type, reference-image-status
```

## Summary

The Intelligent Context Gathering System (v0.6.0) ensures:

1. **Complete Information** - Gathers all necessary context before answering
2. **Smart Routing** - Asks questions for critical tasks, answers directly for knowledge
3. **Model Optimization** - Detects and provides model-specific guidance
4. **User-Friendly** - Clear, concise clarification questions
5. **Token Efficient** - Maintains cost optimization while improving quality

**Result:** Better responses with fewer iterations and less confusion.
