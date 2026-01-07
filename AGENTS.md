# AI Agents & Models Documentation

## Overview

NanoGen Studio leverages Google's Gemini AI models to provide state-of-the-art image generation, editing, and analysis capabilities. This document describes the AI agent architecture, model selection strategies, and integration patterns used throughout the application.

## Architecture

### AI Core Service (`services/ai-core.ts`)

The central AI service is implemented as a singleton that manages all interactions with Google's Generative AI SDK.

**Key Responsibilities:**
- Model initialization and configuration
- Request orchestration with retry logic
- Error normalization and handling
- Token budget management
- Response parsing and validation

**Design Principles:**
- **Stateless Initialization**: Fresh client instances are created per request to ensure dynamic API key updates
- **Resilient Retry Logic**: Exponential backoff with jitter for transient failures
- **Comprehensive Error Handling**: Maps API errors to user-friendly messages
- **Budget Coordination**: Automatically manages thinking budgets and output token limits

### Model Selection Strategy

NanoGen Studio supports multiple Gemini models, each optimized for specific use cases:

#### 1. **Gemini 2.5 Flash Image** (Default for Merch Studio)
- **Model ID**: `gemini-2.5-flash-image`
- **Use Case**: Fast, high-quality product mockup generation
- **Strengths**: 
  - Optimized for speed and efficiency
  - Excellent at contextual product placement
  - Supports multiple aspect ratios
- **Limitations**: 
  - Limited deep reasoning capabilities
  - Not optimized for complex artistic instructions

#### 2. **Gemini 3.0 Flash** (Default for Creative Editor)
- **Model ID**: `gemini-3-flash-preview`
- **Use Case**: Rapid image editing and transformations
- **Strengths**: 
  - Fast generation times
  - Good balance of quality and speed
  - Supports complex prompts
- **Limitations**: 
  - Moderate reasoning depth
  - May struggle with multi-step artistic instructions

#### 3. **Gemini 3.0 Pro** (Advanced Reasoning)
- **Model ID**: `gemini-3-pro-preview`
- **Use Case**: Complex image analysis and deep thinking tasks
- **Strengths**: 
  - Advanced reasoning capabilities
  - Supports thinking mode with up to 32K token budget
  - Excellent for contextual analysis
- **Limitations**: 
  - Slower generation times
  - Higher API costs

#### 4. **Gemini 3 Pro Image** (High Resolution)
- **Model ID**: `gemini-3-pro-image-preview`
- **Use Case**: High-resolution image generation (2K, 4K)
- **Strengths**: 
  - Superior output quality
  - Supports 1K, 2K, and 4K resolutions
  - Detailed texture rendering
- **Limitations**: 
  - Significantly slower
  - Higher resource requirements

#### 5. **Veo 3.1 Fast** (Video Generation - Future)
- **Model ID**: `veo-3.1-fast-generate-preview`
- **Use Case**: AI video mockup generation
- **Status**: Planned for v2.0
- **Strengths**: 
  - Video synthesis capabilities
  - Animation and motion generation

## Request Flow

### 1. User Interaction
```
User uploads image + provides prompt
         ↓
Feature Component (ImageEditor, MerchStudio)
         ↓
Custom Hook (useGenAI, useMerchState)
         ↓
Service Layer (geminiService, aiCore)
         ↓
Google Gemini API
         ↓
Response Processing & State Update
```

### 2. Request Configuration

Each AI request includes:

```typescript
interface AIRequestConfig {
  model: AIModelType;           // Which Gemini model to use
  aspectRatio?: AspectRatio;    // 1:1, 3:4, 4:3, 9:16, 16:9
  imageSize?: ImageSize;        // 1K, 2K, 4K (Pro models only)
  thinkingBudget?: number;      // Token budget for reasoning (0-32000)
  maxOutputTokens?: number;     // Maximum response length
  useSearch?: boolean;          // Enable Google Search grounding
  systemInstruction?: string;   // Additional system context
  responseMimeType?: string;    // Expected response format
  maxRetries?: number;          // Override default retry count
  seed?: number;                // For reproducible generation
  temperature?: number;         // Creativity control (0-1)
}
```

### 3. Error Handling Pipeline

The AI core normalizes all errors into typed exceptions:

1. **SafetyError**: Content policy violations
   - Prompt contains blocked content
   - Generated image violates safety filters
   - User Action: Modify prompt or source image

2. **AuthenticationError**: API key issues
   - Invalid or missing API key
   - Billing problems or quota exceeded
   - User Action: Check API key configuration

3. **RateLimitError**: Too many requests
   - Rate limit exceeded (429 status)
   - User Action: Wait before retrying

4. **ApiError**: General API failures
   - Network issues (503 service unavailable)
   - Invalid request parameters (400 bad request)
   - User Action: Retry or contact support

## Feature-Specific Agents

### Creative Editor Agent

**Purpose**: Semantic image editing with natural language instructions

**Capabilities:**
- Background removal
- Style transfer (e.g., "turn into oil painting")
- Object manipulation (e.g., "add neon lights")
- Color grading and filters
- Image analysis and description generation

**Configuration:**
```typescript
{
  model: 'gemini-3-flash-preview',
  aspectRatio: '1:1',
  thinkingBudget: 0,  // Fast mode by default
  useSearch: false,   // Optional grounding
}
```

**Thinking Mode:**
When enabled (32K token budget), the model performs deep reasoning:
- Analyzes composition and lighting
- Plans multi-step transformations
- Considers artistic coherence
- Generates detailed explanations

**Example Workflow:**
1. User uploads portrait photo
2. User prompts: "Add cyberpunk aesthetic with neon highlights"
3. Agent analyzes:
   - Subject positioning
   - Current lighting
   - Color palette
   - Available space for effects
4. Agent generates edited image with:
   - Neon accent colors
   - Futuristic elements
   - Maintained subject integrity

### Merch Studio Agent

**Purpose**: Product mockup synthesis with brand asset integration

**Capabilities:**
- Logo placement and scaling
- Product template matching
- Style-aware composition
- Multi-angle variation generation
- Background integration

**Configuration:**
```typescript
{
  model: 'gemini-2.5-flash-image',
  aspectRatio: '1:1',  // Product-optimized
  maxRetries: 3,       // Higher retry for quality
}
```

**Prompt Construction:**
The agent constructs specialized prompts:

```typescript
const prompt = `
Product: ${productName}
Style: ${stylePreference || 'Photorealistic'}
Lighting: Professional studio with soft shadows
Requirements:
- Place logo on ${product.type}
- Maintain logo integrity and visibility
- ${backgroundImage ? 'Integrate with provided background' : 'Clean studio background'}
- High contrast for product visibility
- Realistic material rendering
Output: Single high-quality product mockup
`;
```

**Variation Generation:**
For the "Generate Variations" feature:

```typescript
const variationPrompt = `
Based on the master mockup, generate 3 alternative views:
1. Different camera angle (slight rotation)
2. Alternative lighting setup (warmer/cooler tones)
3. Different composition (closer/wider framing)
Maintain: Same product, logo placement, and style consistency
`;
```

### Integration Agent

**Purpose**: Code generation for API integration workflows

**Status**: Template-based (not AI-powered in v0.0.0)

**Future Enhancement (v1.1):**
- AI-generated integration code
- Platform-specific optimizations
- Error handling patterns
- Automated testing code

## Performance Optimization

### 1. Request Debouncing
- Prevents excessive API calls during rapid user interactions
- Implements 300ms delay before triggering generation

### 2. AbortController Integration
- Allows users to cancel in-progress requests
- Prevents wasted API quota on abandoned operations
- Cleans up resources properly

### 3. Caching Strategy (Future)
- Cache identical prompts + images
- LRU eviction policy
- Configurable cache size

### 4. Batch Processing (Future)
- Queue multiple requests
- Optimize for API rate limits
- Progressive result delivery

## Safety & Content Policy

### Built-in Safety Filters

Google Gemini API includes automatic safety filtering:

**Categories:**
- Hate speech
- Dangerous content
- Harassment
- Sexually explicit content

**Handling:**
```typescript
if (error.message.includes('safety') || error.message.includes('blocked')) {
  throw new SafetyError('Content blocked by safety filters');
}
```

**User Guidance:**
- Clear error messages
- Suggestions for prompt modification
- Link to content policy documentation

### Best Practices

1. **Prompt Engineering**
   - Use descriptive, specific language
   - Avoid ambiguous requests
   - Reference specific visual elements

2. **Quality Control**
   - Validate source images before upload
   - Provide high-resolution inputs when possible
   - Test prompts with similar examples

3. **Error Recovery**
   - Implement graceful fallbacks
   - Offer alternative suggestions
   - Log errors for analysis

## Token Budget Management

### Thinking Budget

Controls the depth of reasoning for complex tasks:

```typescript
// Fast mode (no thinking)
thinkingBudget: 0

// Light reasoning (simple edits)
thinkingBudget: 8000

// Deep reasoning (complex compositions)
thinkingBudget: 32000
```

### Output Token Coordination

Automatically reserves tokens for final response:

```typescript
if (thinkingBudget > 0) {
  maxOutputTokens = Math.max(
    configuredMaxTokens,
    thinkingBudget + 2048  // Reserve for output
  );
}
```

## Monitoring & Observability

### Logging Strategy

All AI operations are logged with structured data:

```typescript
logger.info('AI request initiated', {
  model,
  promptLength,
  imageCount,
  config,
});

logger.warn('AI retry attempt', {
  attempt,
  maxRetries,
  error: normalized.message,
});

logger.error('AI request failed', {
  error,
  model,
  finalAttempt: true,
});
```

### Metrics to Track (Future)

- Request latency (p50, p95, p99)
- Success rate by model
- Error distribution
- Token usage per request
- Cost per feature

## Future Enhancements

### v0.2.0
- [ ] Implement request caching
- [ ] Add performance metrics tracking
- [ ] Optimize batch processing

### v1.0.0
- [ ] Multi-modal inputs (text + image + audio)
- [ ] Fine-tuned custom models
- [ ] Advanced prompt templates

### v2.0.0
- [ ] Video generation with Veo 3.1
- [ ] Real-time streaming generation
- [ ] Collaborative AI editing

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Overall system architecture
- [GEMINI.md](./GEMINI.md) - Detailed Gemini API integration guide
- [SECURITY.md](./SECURITY.md) - Security considerations for AI features

---

**Last Updated:** December 30, 2024  
**Next Review:** After v0.1.0 release
