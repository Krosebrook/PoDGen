# Gemini API Integration Documentation

This document provides comprehensive documentation for Google Gemini API integration within NanoGen Studio, including model capabilities, usage patterns, configuration options, and best practices.

---

## Table of Contents

1. [Overview](#overview)
2. [Model Catalog](#model-catalog)
3. [API Integration Architecture](#api-integration-architecture)
4. [Request Configuration](#request-configuration)
5. [Response Handling](#response-handling)
6. [Error Handling](#error-handling)
7. [Advanced Features](#advanced-features)
8. [Performance Optimization](#performance-optimization)
9. [Cost Management](#cost-management)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### What is Gemini?

Google Gemini is a family of multimodal AI models capable of understanding and generating text, images, audio, video, and code. NanoGen Studio leverages Gemini's image generation and vision capabilities for creative content production.

### Integration Approach

NanoGen Studio uses the official **`@google/genai`** SDK (v1.30+) for type-safe, modern API interactions. All Gemini operations are centralized through the `AICoreService` singleton for consistent error handling, retry logic, and response normalization.

### Key Capabilities Used

1. **Image Generation** - Create new images from text prompts
2. **Image Editing** - Transform existing images with instructions
3. **Vision Analysis** - Understand and describe image content
4. **Multimodal Understanding** - Process text + image inputs simultaneously
5. **Search Grounding** - Inject real-world context from Google Search

---

## Model Catalog

### Current Models (2024-12)

#### 1. gemini-2.5-flash-image

**Best For:** Fast image generation and editing  
**Speed:** ⚡⚡⚡⚡ (3-5 seconds)  
**Quality:** ⭐⭐⭐  
**Cost:** $ (Low)

**Capabilities:**
- Text-to-image generation
- Image-to-image editing
- Aspect ratio control (1:1, 3:4, 4:3, 9:16, 16:9)
- Search grounding support
- Thinking mode support

**Use Cases:**
- Product mockup generation
- Quick image edits
- Variation generation
- Prototyping and iteration

**Configuration:**
```typescript
{
  model: 'gemini-2.5-flash-image',
  aspectRatio: '16:9',
  useSearch: true,
  thinkingBudget: 8192,
  temperature: 0.7
}
```

#### 2. gemini-3-pro-image-preview

**Best For:** High-quality, production-grade images  
**Speed:** ⚡⚡ (10-20 seconds)  
**Quality:** ⭐⭐⭐⭐⭐  
**Cost:** $$$ (High)

**Capabilities:**
- High-resolution generation (1K, 2K, 4K)
- Enhanced detail and realism
- Better prompt adherence
- Advanced composition understanding
- Deep thinking mode (32K tokens)

**Use Cases:**
- Final production assets
- Print-quality mockups
- Complex composition requests
- Marketing hero images

**Configuration:**
```typescript
{
  model: 'gemini-3-pro-image-preview',
  aspectRatio: '16:9',
  imageSize: '4K',
  useSearch: true,
  thinkingBudget: 32768,
  temperature: 0.8
}
```

**Important:** Requires Pro API key selection in Google AI Studio.

#### 3. gemini-3-flash-preview

**Best For:** Text analysis and understanding  
**Speed:** ⚡⚡⚡⚡⚡ (1-2 seconds)  
**Quality:** ⭐⭐⭐⭐  
**Cost:** $ (Low)

**Capabilities:**
- Vision understanding
- Image description
- Content analysis
- Text generation
- Fast reasoning

**Use Cases:**
- Auto-generating image descriptions
- Content moderation
- Metadata extraction
- Quick analysis tasks

**Configuration:**
```typescript
{
  model: 'gemini-3-flash-preview',
  maxOutputTokens: 2048,
  temperature: 0.5
}
```

#### 4. gemini-3-pro-preview

**Best For:** Deep reasoning and analysis  
**Speed:** ⚡⚡⚡ (5-10 seconds)  
**Quality:** ⭐⭐⭐⭐⭐  
**Cost:** $$ (Medium)

**Capabilities:**
- Advanced vision analysis
- Detailed composition breakdown
- Artistic critique
- Technical analysis
- Deep thinking (32K tokens)

**Use Cases:**
- Professional image analysis
- Style identification
- Quality assessment
- Detailed reporting

**Configuration:**
```typescript
{
  model: 'gemini-3-pro-preview',
  thinkingBudget: 32768,
  maxOutputTokens: 8192,
  systemInstruction: "You are a professional art critic..."
}
```

#### 5. veo-3.1-fast-generate-preview (Future)

**Best For:** AI video generation  
**Status:** Planned for v2.0  
**Speed:** ⚡⚡ (30-60 seconds)  
**Quality:** ⭐⭐⭐⭐  
**Cost:** $$$$ (Very High)

**Planned Capabilities:**
- Text-to-video generation
- Video mockups
- Animated product demos
- Motion graphics

---

## API Integration Architecture

### Service Layer Design

```typescript
┌─────────────────────────────────┐
│     React Components            │
│  (UI, User Interaction)         │
└───────────┬─────────────────────┘
            │
            ↓
┌─────────────────────────────────┐
│   Feature Hooks                 │
│  (useEditorState,               │
│   useMerchController)           │
└───────────┬─────────────────────┘
            │
            ↓
┌─────────────────────────────────┐
│   AI Core Service               │
│  (Singleton, Request            │
│   Orchestration)                │
└───────────┬─────────────────────┘
            │
            ↓
┌─────────────────────────────────┐
│   @google/genai SDK             │
│  (Official Gemini Client)       │
└───────────┬─────────────────────┘
            │
            ↓
┌─────────────────────────────────┐
│   Google Gemini API             │
│  (https://generativelanguage.   │
│   googleapis.com/v1beta/...)    │
└─────────────────────────────────┘
```

### Request Flow

1. **User Action** - User clicks "Generate" or "Analyze"
2. **State Hook** - Validates inputs, sets loading state
3. **AI Core Service** - Builds request, applies configuration
4. **SDK Call** - Sends request to Gemini API
5. **Retry Logic** - Handles transient failures
6. **Response Parse** - Extracts text/image/metadata
7. **State Update** - Updates React state with results
8. **UI Render** - Displays results to user

### Key Classes

#### GoogleGenAI Client

```typescript
import { GoogleGenAI } from '@google/genai';

const client = new GoogleGenAI({
  apiKey: process.env.API_KEY
});
```

**Important:** Client is stateless. We create a new instance per request to always use the latest API key from environment.

#### GenerateContentResponse

```typescript
interface GenerateContentResponse {
  text?: string;                    // Generated text content
  candidates: Candidate[];          // All response candidates
  promptFeedback?: PromptFeedback;  // Safety feedback
  usageMetadata?: UsageMetadata;    // Token usage stats
}

interface Candidate {
  content: {
    parts: Part[];                  // Text or image parts
    role: string;
  };
  finishReason: string;             // "STOP", "SAFETY", etc.
  safetyRatings?: SafetyRating[];
  citationMetadata?: CitationMetadata;
  groundingMetadata?: GroundingMetadata;
}

interface Part {
  text?: string;                    // Text content
  inlineData?: {
    data: string;                   // Base64 image data
    mimeType: string;               // "image/png", etc.
  };
}
```

---

## Request Configuration

### Basic Configuration

```typescript
interface AIRequestConfig {
  model: AIModelType;              // Required: Model identifier
  aspectRatio?: AspectRatio;       // For image models
  imageSize?: ImageSize;           // For pro models
  temperature?: number;            // 0.0 to 1.0 (default: 0.7)
  maxOutputTokens?: number;        // Max response length
  seed?: number;                   // For reproducibility
  responseMimeType?: string;       // Response format
  systemInstruction?: string;      // Model behavior context
}
```

### Image Generation Config

```typescript
const imageConfig = {
  model: 'gemini-2.5-flash-image',
  aspectRatio: '16:9',           // 1:1, 3:4, 4:3, 9:16, 16:9
  temperature: 0.7,              // Creativity (0=deterministic, 1=creative)
  seed: 12345,                   // Optional: reproducible generation
  systemInstruction: `
    Context: You are a professional product photographer.
    Requirements: Photorealistic, commercial quality, proper lighting.
    Style: Clean, modern, minimalist aesthetic.
  `
};
```

### Vision Analysis Config

```typescript
const visionConfig = {
  model: 'gemini-3-pro-preview',
  maxOutputTokens: 8192,
  temperature: 0.3,              // Lower for more factual analysis
  systemInstruction: `
    Context: You are an expert art critic and visual analyst.
    Task: Provide detailed analysis of composition, technique, and aesthetics.
    Format: Structured breakdown with specific observations.
  `
};
```

### Deep Thinking Config

```typescript
const thinkingConfig = {
  model: 'gemini-3-pro-image-preview',
  thinkingBudget: 32768,         // Tokens for internal reasoning
  maxOutputTokens: 40960,        // Must be >= thinkingBudget + output
  temperature: 0.8,
  systemInstruction: `
    Use extended reasoning to:
    1. Analyze the request deeply
    2. Consider multiple approaches
    3. Evaluate trade-offs
    4. Generate optimal result
  `
};
```

**Token Budget Rules:**
- `maxOutputTokens` must be at least `thinkingBudget + 1024`
- Thinking tokens are not visible in output
- Used for complex multi-step reasoning
- Significantly slower but higher quality

### Search Grounding Config

```typescript
const searchConfig = {
  model: 'gemini-2.5-flash-image',
  useSearch: true,               // Enable Google Search
  aspectRatio: '16:9',
  systemInstruction: `
    Use real-world information to:
    - Ensure accuracy of product details
    - Reference current design trends
    - Incorporate authentic brand styles
  `
};
```

**Search Benefits:**
- Access to current information
- Real-world context and accuracy
- Reduced hallucination
- Citation sources provided

**Search Limitations:**
- Slightly slower (adds 1-2 seconds)
- Requires internet connectivity
- May not always find relevant results

---

## Response Handling

### Standard Response Flow

```typescript
try {
  const response = await aiCore.generate(prompt, images, config);
  
  // Check for image result
  if (response.image) {
    displayImage(response.image);  // data:image/png;base64,...
  }
  
  // Check for text result
  if (response.text) {
    displayText(response.text);
  }
  
  // Check for search sources
  if (response.groundingSources?.length > 0) {
    displaySources(response.groundingSources);
  }
  
  // Check finish reason
  if (response.finishReason === 'SAFETY') {
    handleSafetyBlock();
  }
  
} catch (error) {
  handleError(error);
}
```

### Response Fields

#### AIResponse Interface

```typescript
interface AIResponse {
  text?: string;                   // Generated text content
  image?: string;                  // Base64 data URL
  groundingSources?: GroundingSource[];  // Search results
  finishReason?: string;           // Completion status
}
```

#### Finish Reasons

| Reason | Meaning | Action |
|--------|---------|--------|
| `STOP` | Normal completion | Process result |
| `MAX_TOKENS` | Hit token limit | Increase maxOutputTokens |
| `SAFETY` | Safety filter triggered | Modify prompt |
| `RECITATION` | Copyright concern | Rephrase prompt |
| `OTHER` | Unknown issue | Retry or log |

#### Grounding Sources

```typescript
interface GroundingSource {
  uri?: string;                    // Source URL
  title?: string;                  // Page title
  snippet?: string;                // Relevant excerpt
}

// Example usage
response.groundingSources?.forEach(source => {
  console.log(`Source: ${source.title}`);
  console.log(`URL: ${source.uri}`);
  console.log(`Excerpt: ${source.snippet}`);
});
```

### Image Response Processing

```typescript
function processImageResponse(response: AIResponse): HTMLImageElement {
  if (!response.image) {
    throw new Error('No image in response');
  }
  
  // Response.image is already a data URL
  const img = new Image();
  img.src = response.image;  // data:image/png;base64,...
  
  img.onload = () => {
    console.log(`Image loaded: ${img.width}x${img.height}`);
  };
  
  return img;
}
```

### Text Response Processing

```typescript
function processTextResponse(response: AIResponse): string {
  if (!response.text) {
    throw new Error('No text in response');
  }
  
  // Clean and format text
  return response.text
    .trim()
    .replace(/\n\n+/g, '\n\n')     // Normalize line breaks
    .replace(/\s+/g, ' ');          // Normalize spaces
}
```

---

## Error Handling

### Error Types

#### 1. Authentication Errors (401, 403)

**Causes:**
- Missing API key
- Invalid API key
- Expired API key
- Insufficient permissions
- Billing issues

**Error Message Examples:**
```
"API_KEY_MISSING: Environment key unavailable."
"ACCOUNT_ERROR: Billing not enabled for this project."
"ACCOUNT_ERROR: API key not found."
```

**Resolution:**
```typescript
catch (error) {
  if (error instanceof AuthenticationError) {
    // Guide user to API key setup
    showMessage('Please configure your Gemini API key in .env');
    openAPIKeyGuide();
  }
}
```

#### 2. Rate Limit Errors (429)

**Causes:**
- Exceeded requests per minute (RPM)
- Exceeded requests per day (RPD)
- Exceeded tokens per minute (TPM)

**Error Message:**
```
"Rate limit exceeded. Please try again later."
```

**Resolution:**
```typescript
catch (error) {
  if (error instanceof RateLimitError) {
    const retryAfter = error.retryAfter || 60;
    showMessage(`Too many requests. Please wait ${retryAfter}s`);
    
    // Schedule automatic retry
    setTimeout(() => retryRequest(), retryAfter * 1000);
  }
}
```

**Best Practices:**
- Implement exponential backoff
- Show user-friendly countdown
- Cache responses when possible
- Batch requests when appropriate

#### 3. Safety Errors (Content Filtering)

**Causes:**
- Prompt violates content policies
- Generated content blocked by safety filters
- Image content inappropriate

**Error Message Examples:**
```
"SAFETY_BLOCK: Content violated safety policies."
"Generated content was blocked due to safety concerns."
```

**Resolution:**
```typescript
catch (error) {
  if (error instanceof SafetyError) {
    showMessage(
      'Your content was blocked by safety filters. ' +
      'Please try a different prompt or image.'
    );
    
    // Suggest modifications
    showSuggestions([
      'Remove sensitive keywords',
      'Use more general descriptions',
      'Try a different style or approach'
    ]);
  }
}
```

#### 4. Service Errors (500, 503)

**Causes:**
- API temporarily unavailable
- Model overloaded
- Internal server error

**Error Message:**
```
"SYSTEM_OVERLOAD: API temporarily unavailable."
```

**Resolution:**
```typescript
catch (error) {
  if (error instanceof ApiError && error.statusCode >= 500) {
    // Automatic retry with backoff
    await retryWithBackoff(request, {
      maxRetries: 3,
      baseDelay: 2000
    });
  }
}
```

### Retry Strategy

```typescript
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries: number;
    baseDelay: number;
    maxDelay?: number;
  }
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry non-retriable errors
      if (isNonRetriable(error) || attempt === options.maxRetries) {
        throw error;
      }
      
      // Exponential backoff with jitter
      const delay = Math.min(
        options.baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        options.maxDelay || 60000
      );
      
      logger.warn(`Retry ${attempt + 1}/${options.maxRetries} after ${delay}ms`);
      await sleep(delay);
    }
  }
  
  throw lastError!;
}

function isNonRetriable(error: Error): boolean {
  return (
    error instanceof AuthenticationError ||
    error instanceof SafetyError ||
    error instanceof ValidationError
  );
}
```

---

## Advanced Features

### 1. Thinking Mode

**Purpose:** Enable deep reasoning for complex tasks

**When to Use:**
- Complex composition requests
- Multi-step editing instructions
- Stylistic transformations
- Quality enhancement

**Configuration:**
```typescript
const thinkingConfig = {
  model: 'gemini-3-pro-image-preview',
  thinkingBudget: 32768,          // 32K tokens for reasoning
  maxOutputTokens: 40960,         // Must accommodate thinking + output
  temperature: 0.8
};
```

**Example Use Case:**
```typescript
const prompt = `
  Transform this simple logo into a luxury brand identity:
  1. Analyze the current design elements
  2. Identify premium design patterns
  3. Consider color psychology for luxury
  4. Apply elegant typography principles
  5. Add sophisticated visual hierarchy
  6. Ensure timeless, high-end aesthetic
`;

const response = await aiCore.generate(prompt, [logo], thinkingConfig);
```

**Performance Impact:**
- Adds 5-10 seconds to generation time
- Uses significantly more tokens
- Provides higher quality results
- Better handles complex instructions

### 2. Search Grounding

**Purpose:** Inject real-world context into generations

**When to Use:**
- Current events or trends
- Brand-specific styles
- Product accuracy
- Cultural references

**Configuration:**
```typescript
const searchConfig = {
  model: 'gemini-2.5-flash-image',
  useSearch: true,
  aspectRatio: '16:9'
};
```

**Example Use Case:**
```typescript
const prompt = `
  Create a product mockup for a Nike basketball shoe in the style
  of their latest 2024 marketing campaign. Use current color trends
  and authentic Nike design language.
`;

const response = await aiCore.generate(prompt, [logo], searchConfig);

// Access grounding sources
response.groundingSources?.forEach(source => {
  console.log(`Referenced: ${source.title} (${source.uri})`);
});
```

**Citations:**
- Provided in `response.groundingSources`
- Include title, URL, and snippet
- Can be displayed to user for transparency

### 3. Multimodal Input

**Purpose:** Process multiple images with text instructions

**When to Use:**
- Logo + background combination
- Style transfer between images
- Multi-asset composition
- Comparison tasks

**Example:**
```typescript
const prompt = `
  Create a product mockup using:
  - First image: Brand logo
  - Second image: Product photograph
  - Third image: Lifestyle background
  
  Composite these elements with professional lighting and perspective.
`;

const response = await aiCore.generate(
  prompt,
  [logoBase64, productBase64, backgroundBase64],
  { model: 'gemini-2.5-flash-image' }
);
```

**Limitations:**
- Max 4 images per request
- Total size limit: 20MB
- All images must be base64 encoded

### 4. Seed-Based Generation

**Purpose:** Reproducible image generation

**When to Use:**
- A/B testing variations
- Consistent branding
- Debugging generation issues
- Version control

**Example:**
```typescript
const config = {
  model: 'gemini-2.5-flash-image',
  seed: 42,                      // Same seed = same result
  temperature: 0.7
};

// First generation
const result1 = await aiCore.generate(prompt, images, config);

// Second generation (identical to first)
const result2 = await aiCore.generate(prompt, images, config);

// result1.image === result2.image  // True (mostly)
```

**Notes:**
- Not 100% deterministic due to backend changes
- Helps with consistency across generations
- Useful for iterative refinement

---

## Performance Optimization

### 1. Request Batching

**Strategy:** Group independent operations

```typescript
// DON'T: Sequential requests
const result1 = await generate(prompt1);
const result2 = await generate(prompt2);
const result3 = await generate(prompt3);
// Total time: 15-25 seconds

// DO: Parallel requests
const [result1, result2, result3] = await Promise.all([
  generate(prompt1),
  generate(prompt2),
  generate(prompt3)
]);
// Total time: 5-10 seconds
```

### 2. Image Optimization

**Before Sending:**
- Compress images (JPEG quality 85-90%)
- Resize to reasonable dimensions (2048x2048 max)
- Convert to optimal format (WebP or PNG)

```typescript
async function optimizeImage(file: File): Promise<string> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  
  // Resize if too large
  const maxDim = 2048;
  let { width, height } = img;
  
  if (width > maxDim || height > maxDim) {
    const scale = maxDim / Math.max(width, height);
    width *= scale;
    height *= scale;
  }
  
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, width, height);
  
  // Export as JPEG with quality 90
  return canvas.toDataURL('image/jpeg', 0.9);
}
```

### 3. Response Caching

**Strategy:** Cache common or expensive operations

```typescript
class CachedAIService {
  private cache = new Map<string, AIResponse>();
  
  async generate(
    prompt: string,
    images: string[],
    config: AIRequestConfig
  ): Promise<AIResponse> {
    // Generate cache key
    const cacheKey = this.getCacheKey(prompt, images, config);
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    // Generate and cache
    const response = await aiCore.generate(prompt, images, config);
    this.cache.set(cacheKey, response);
    
    return response;
  }
  
  private getCacheKey(
    prompt: string,
    images: string[],
    config: AIRequestConfig
  ): string {
    return `${prompt}:${images.join(',')}:${JSON.stringify(config)}`;
  }
}
```

**When to Cache:**
- Repeated identical requests
- Static content generation
- Analysis results
- Template-based operations

**When NOT to Cache:**
- Creative variations (expect different results)
- Time-sensitive content
- User-specific operations

### 4. Model Selection

**Choose the Right Model for the Task:**

| Task | Recommended Model | Rationale |
|------|-------------------|-----------|
| Quick mockup | gemini-2.5-flash-image | Fast, good quality |
| Final asset | gemini-3-pro-image-preview | Highest quality |
| Auto-description | gemini-3-flash-preview | Fast text generation |
| Deep analysis | gemini-3-pro-preview | Best understanding |
| Variations | gemini-2.5-flash-image | Fast, acceptable quality |

---

## Cost Management

### Pricing Tiers (Approximate)

| Model | Cost per 1000 requests | Notes |
|-------|----------------------|-------|
| Flash | $ | Most cost-effective |
| Flash Image | $$ | Moderate cost |
| Pro | $$$ | Higher cost |
| Pro Image | $$$$ | Premium pricing |

### Cost Optimization Strategies

#### 1. Use Appropriate Models

```typescript
// DON'T: Use Pro for everything
const quickPreview = await aiCore.generate(prompt, images, {
  model: 'gemini-3-pro-image-preview'  // Expensive!
});

// DO: Use Flash for previews, Pro for finals
const preview = await aiCore.generate(prompt, images, {
  model: 'gemini-2.5-flash-image'      // Cheap!
});

// User approves, now use Pro
const final = await aiCore.generate(prompt, images, {
  model: 'gemini-3-pro-image-preview'  // Worth it!
});
```

#### 2. Reduce Token Usage

```typescript
// DON'T: Excessive tokens
const config = {
  thinkingBudget: 32768,
  maxOutputTokens: 65536
};

// DO: Minimal necessary tokens
const config = {
  thinkingBudget: 8192,   // Enough for most tasks
  maxOutputTokens: 16384
};
```

#### 3. Implement Request Limits

```typescript
class RateLimiter {
  private requests: number = 0;
  private resetTime: number = Date.now();
  
  async checkLimit(limit: number, periodMs: number): Promise<void> {
    // Reset counter if period elapsed
    if (Date.now() - this.resetTime > periodMs) {
      this.requests = 0;
      this.resetTime = Date.now();
    }
    
    // Check limit
    if (this.requests >= limit) {
      const waitTime = periodMs - (Date.now() - this.resetTime);
      throw new Error(`Rate limit exceeded. Wait ${waitTime}ms`);
    }
    
    this.requests++;
  }
}

// Usage
const limiter = new RateLimiter();
await limiter.checkLimit(100, 60000);  // 100 requests per minute
```

#### 4. Monitor Usage

```typescript
class UsageTracker {
  private usage = {
    requests: 0,
    tokens: 0,
    cost: 0
  };
  
  track(model: string, tokens: number) {
    this.usage.requests++;
    this.usage.tokens += tokens;
    this.usage.cost += this.calculateCost(model, tokens);
  }
  
  getUsage() {
    return { ...this.usage };
  }
  
  private calculateCost(model: string, tokens: number): number {
    // Cost calculation based on model and tokens
    const rates = {
      'gemini-2.5-flash-image': 0.0001,
      'gemini-3-pro-image-preview': 0.001
    };
    return (rates[model] || 0.0005) * tokens;
  }
}
```

---

## Troubleshooting

### Common Issues

#### Issue 1: "API key not found"

**Symptoms:**
- AuthenticationError on all requests
- "API_KEY_MISSING" or "not found" messages

**Diagnosis:**
```typescript
console.log('API Key exists:', !!process.env.API_KEY);
console.log('API Key length:', process.env.API_KEY?.length);
```

**Solutions:**
1. Check `.env` file exists and has `API_KEY=your_key`
2. Restart development server after changing `.env`
3. Verify API key is valid in Google AI Studio
4. Check for typos or extra spaces in key

#### Issue 2: "Rate limit exceeded"

**Symptoms:**
- 429 errors
- "Too many requests" messages
- Requests failing intermittently

**Diagnosis:**
```typescript
// Check current rate
const requestCount = await aiCore.getRequestCount();
console.log('Requests in last minute:', requestCount);
```

**Solutions:**
1. Implement request throttling
2. Cache responses
3. Use exponential backoff
4. Upgrade API quota if needed

#### Issue 3: "Safety block"

**Symptoms:**
- SAFETY finish reason
- Content blocked messages
- Empty results

**Diagnosis:**
```typescript
console.log('Finish reason:', response.finishReason);
console.log('Prompt:', prompt);
console.log('Image content:', analyzeImageContent(image));
```

**Solutions:**
1. Review and modify prompt
2. Check input images for inappropriate content
3. Simplify requests
4. Use different phrasing

#### Issue 4: Slow responses

**Symptoms:**
- Requests taking >30 seconds
- Timeout errors
- Poor user experience

**Diagnosis:**
```typescript
const start = performance.now();
const response = await aiCore.generate(...);
const duration = performance.now() - start;
console.log('Request duration:', duration, 'ms');
```

**Solutions:**
1. Use Flash models for speed
2. Optimize image sizes
3. Reduce token budgets
4. Disable unnecessary features (search, thinking)
5. Show progress indicators to users

#### Issue 5: Empty or truncated results

**Symptoms:**
- No image or text in response
- Incomplete generations
- Unexpected finishReason

**Diagnosis:**
```typescript
console.log('Response:', {
  hasImage: !!response.image,
  hasText: !!response.text,
  textLength: response.text?.length,
  finishReason: response.finishReason
});
```

**Solutions:**
1. Increase `maxOutputTokens`
2. Simplify prompt complexity
3. Check for safety blocks
4. Verify model supports requested features

---

## Best Practices Summary

### DO ✅

- Use Flash models for speed, Pro models for quality
- Implement retry logic with exponential backoff
- Cache responses when appropriate
- Optimize images before sending
- Monitor API usage and costs
- Handle errors gracefully with user-friendly messages
- Use thinking mode for complex tasks
- Enable search grounding for accuracy
- Validate inputs before sending
- Log errors for debugging

### DON'T ❌

- Don't use Pro models unnecessarily
- Don't send huge unoptimized images
- Don't ignore rate limits
- Don't expose API keys in client code
- Don't retry non-retriable errors
- Don't use excessive token budgets
- Don't block UI during generation
- Don't ignore safety blocks
- Don't cache creative generation results
- Don't forget to sanitize error messages

---

## Additional Resources

### Official Documentation
- **Gemini API Docs:** https://ai.google.dev/docs
- **Model Catalog:** https://ai.google.dev/models/gemini
- **Pricing:** https://ai.google.dev/pricing
- **API Reference:** https://ai.google.dev/api

### NanoGen Studio Resources
- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Agents:** [agents.md](./agents.md)
- **Security:** [SECURITY.md](./SECURITY.md)
- **Troubleshooting:** [README.md](./README.md)

### Community
- **GitHub Issues:** [Report bugs](https://github.com/Krosebrook/PoDGen/issues)
- **Discussions:** [Ask questions](https://github.com/Krosebrook/PoDGen/discussions)

---

**Last Updated:** 2024-12-29  
**SDK Version:** @google/genai v1.30.0  
**API Version:** v1beta  
**Maintainer:** NanoGen Engineering Team
