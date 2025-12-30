# Google Gemini API Integration Guide

## Overview

NanoGen Studio is built on Google's Gemini API, leveraging cutting-edge multimodal AI capabilities for image generation, editing, and analysis. This guide provides comprehensive documentation on how we integrate with Gemini, best practices, and troubleshooting tips.

## Table of Contents

1. [Getting Started](#getting-started)
2. [API Key Setup](#api-key-setup)
3. [Supported Models](#supported-models)
4. [Image Generation](#image-generation)
5. [Image Editing](#image-editing)
6. [Image Analysis](#image-analysis)
7. [Advanced Features](#advanced-features)
8. [Error Handling](#error-handling)
9. [Best Practices](#best-practices)
10. [Rate Limits & Quotas](#rate-limits--quotas)
11. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- A Google Cloud account
- A valid Gemini API key

### API Key Setup

#### 1. Create an API Key

Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to create your API key:

1. Sign in with your Google account
2. Click "Create API Key"
3. Select a Google Cloud project (or create a new one)
4. Copy the generated API key

#### 2. Configure Environment

Create a `.env` file in the project root:

```bash
# Required: Your Gemini API key
API_KEY=your_actual_api_key_here

# Optional: Environment mode
NODE_ENV=development
```

**Security Warning:**
- Never commit your `.env` file to version control
- Add `.env` to `.gitignore`
- Use different keys for dev/staging/production
- Enable API restrictions in Google Cloud Console

#### 3. Enable API Restrictions (Recommended)

In [Google Cloud Console](https://console.cloud.google.com/):

1. Navigate to APIs & Services → Credentials
2. Find your API key
3. Click "Edit"
4. Set "Application restrictions":
   - **HTTP referrers**: Restrict to your domain(s)
   - **IP addresses**: Restrict to deployment IPs (server-side)
5. Set "API restrictions":
   - Select "Restrict key"
   - Enable only "Generative Language API"

---

## Supported Models

### Image Generation Models

#### Gemini 2.5 Flash Image
```typescript
model: 'gemini-2.5-flash-image'
```

**Best For:**
- Fast product mockup generation
- Real-time preview updates
- High-volume batch processing

**Capabilities:**
- Multiple aspect ratios (1:1, 3:4, 4:3, 9:16, 16:9)
- Fast inference (2-5 seconds)
- Good quality-to-speed ratio

**Limitations:**
- Fixed resolution output
- Limited deep reasoning
- No high-res mode

**Typical Use Case:**
```typescript
await aiCore.generate(
  "Professional t-shirt mockup with minimal branding",
  [logoBase64, backgroundBase64],
  {
    model: 'gemini-2.5-flash-image',
    aspectRatio: '1:1',
  }
);
```

#### Gemini 3.0 Flash Preview
```typescript
model: 'gemini-3-flash-preview'
```

**Best For:**
- Creative image editing
- Style transfers
- Quick iterations

**Capabilities:**
- Multimodal understanding (text + image)
- Context-aware editing
- Natural language instructions

**Typical Use Case:**
```typescript
await aiCore.generate(
  "Add cyberpunk neon lighting effects to this portrait",
  [sourceImageBase64],
  {
    model: 'gemini-3-flash-preview',
    aspectRatio: '16:9',
  }
);
```

#### Gemini 3.0 Pro Preview
```typescript
model: 'gemini-3-pro-preview'
```

**Best For:**
- Complex reasoning tasks
- Detailed image analysis
- Multi-step transformations

**Capabilities:**
- Deep thinking mode (up to 32K tokens)
- Advanced composition understanding
- Contextual search grounding

**Typical Use Case:**
```typescript
await aiCore.generate(
  "Analyze this artwork and suggest improvements for composition and color harmony",
  [artworkBase64],
  {
    model: 'gemini-3-pro-preview',
    thinkingBudget: 16000,
    useSearch: true,
  }
);
```

#### Gemini 3 Pro Image Preview
```typescript
model: 'gemini-3-pro-image-preview'
```

**Best For:**
- High-resolution outputs (2K, 4K)
- Print-quality mockups
- Detailed textures

**Capabilities:**
- Resolution control (1K, 2K, 4K)
- Superior detail rendering
- Professional-grade outputs

**Typical Use Case:**
```typescript
await aiCore.generate(
  "Create a high-resolution product photograph",
  [productBase64],
  {
    model: 'gemini-3-pro-image-preview',
    aspectRatio: '3:4',
    imageSize: '4K',
  }
);
```

---

## Image Generation

### Basic Generation

```typescript
import { aiCore } from './services/ai-core';

const response = await aiCore.generate(
  "A minimalist logo on a white t-shirt",
  [logoImageBase64],
  {
    model: 'gemini-2.5-flash-image',
    aspectRatio: '1:1',
  }
);

console.log(response.image); // data:image/png;base64,...
```

### With Multiple Images

```typescript
const response = await aiCore.generate(
  "Combine the logo with this background",
  [logoBase64, backgroundBase64],
  {
    model: 'gemini-2.5-flash-image',
    aspectRatio: '16:9',
  }
);
```

### Aspect Ratio Options

```typescript
type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

// Square (Instagram, profile pics)
aspectRatio: '1:1'

// Portrait (Stories, mobile)
aspectRatio: '9:16'

// Landscape (Desktop, YouTube)
aspectRatio: '16:9'

// Print (Standard photo)
aspectRatio: '3:4' or '4:3'
```

---

## Image Editing

### Semantic Editing

Natural language instructions for image modifications:

```typescript
// Remove background
await aiCore.generate(
  "Remove the background, keep only the subject",
  [photoBase64],
  { model: 'gemini-3-flash-preview' }
);

// Style transfer
await aiCore.generate(
  "Transform into an oil painting style",
  [photoBase64],
  { model: 'gemini-3-flash-preview' }
);

// Object manipulation
await aiCore.generate(
  "Add sunglasses to the person",
  [portraitBase64],
  { model: 'gemini-3-flash-preview' }
);
```

### Advanced Editing Prompts

**Color Grading:**
```typescript
"Adjust colors to give a warm, golden hour atmosphere with increased contrast"
```

**Lighting:**
```typescript
"Add dramatic side lighting with soft shadows"
```

**Composition:**
```typescript
"Reframe the subject using rule of thirds, focus on the eyes"
```

**Effects:**
```typescript
"Apply a vintage film grain effect with slight vignetting"
```

---

## Image Analysis

### Contextual Analysis

```typescript
const response = await aiCore.generate(
  "Describe this image in detail, including composition, colors, mood, and artistic techniques used",
  [imageBase64],
  {
    model: 'gemini-3-pro-preview',
    responseMimeType: 'text/plain',
  }
);

console.log(response.text);
// "This image features a minimalist composition with..."
```

### Deep Thinking Analysis

For complex analysis tasks:

```typescript
const response = await aiCore.generate(
  `Analyze this artwork and provide:
  1. Technical composition analysis
  2. Color theory evaluation
  3. Emotional impact assessment
  4. Suggestions for improvement`,
  [artworkBase64],
  {
    model: 'gemini-3-pro-preview',
    thinkingBudget: 32000,  // Maximum reasoning depth
    maxOutputTokens: 4096,
  }
);
```

---

## Advanced Features

### Google Search Grounding

Inject real-world context into generated images:

```typescript
const response = await aiCore.generate(
  "Create a t-shirt mockup with trending streetwear aesthetics from 2024",
  [logoBase64],
  {
    model: 'gemini-3-flash-preview',
    useSearch: true,  // Enables Google Search integration
  }
);

// Access grounding sources
console.log(response.groundingSources);
```

**Use Cases:**
- Current trend incorporation
- Real-world reference validation
- Context-aware generation

### Thinking Mode

Enable deep reasoning for complex tasks:

```typescript
{
  thinkingBudget: 8000,   // Light reasoning (simple tasks)
  thinkingBudget: 16000,  // Moderate reasoning (medium complexity)
  thinkingBudget: 32000,  // Deep reasoning (complex analysis)
}
```

**When to Use:**
- Multi-step transformations
- Complex composition analysis
- Artistic style matching
- Context-dependent generation

**Performance Impact:**
- Increased generation time (2-3x)
- Higher token usage
- Better output quality
- More coherent results

### Temperature Control

Adjust creativity vs. consistency:

```typescript
{
  temperature: 0.3,  // Conservative, consistent
  temperature: 0.7,  // Balanced (default)
  temperature: 1.0,  // Creative, varied
}
```

### Seed for Reproducibility

Generate identical outputs with same inputs:

```typescript
{
  seed: 12345,  // Any integer
}
```

---

## Error Handling

### Error Types

#### 1. Safety Errors

```typescript
try {
  await aiCore.generate(prompt, images, config);
} catch (error) {
  if (error instanceof SafetyError) {
    // Content blocked by safety filters
    console.error('Content policy violation');
    // Show user-friendly message
    // Suggest prompt modifications
  }
}
```

**Common Causes:**
- Inappropriate content in prompt
- Blocked keywords or phrases
- Sensitive image content

**Solutions:**
- Rephrase prompt with neutral language
- Remove specific restricted terms
- Use alternative source images

#### 2. Authentication Errors

```typescript
if (error instanceof AuthenticationError) {
  // API key invalid or billing issue
  console.error('Authentication failed');
  // Check API key configuration
  // Verify billing status
}
```

**Common Causes:**
- Invalid API key
- Expired key
- Billing disabled
- Quota exceeded

**Solutions:**
- Verify API key in `.env`
- Check Google Cloud Console billing
- Enable Generative Language API
- Check quota limits

#### 3. Rate Limit Errors

```typescript
if (error instanceof RateLimitError) {
  // Too many requests
  console.error('Rate limit exceeded');
  // Wait before retrying
  // Implement exponential backoff
}
```

**Common Causes:**
- Exceeded requests per minute (RPM)
- Exceeded requests per day (RPD)
- Concurrent request limit hit

**Solutions:**
- Implement request queuing
- Add delay between requests
- Upgrade quota limits
- Use batch processing

#### 4. General API Errors

```typescript
if (error instanceof ApiError) {
  console.error(`API Error: ${error.statusCode}`);
  // 500: Server error (transient)
  // 400: Bad request (check parameters)
  // 503: Service unavailable (retry)
}
```

### Automatic Retry Logic

The AI Core implements automatic retries:

```typescript
{
  maxRetries: 2,  // Default: 2 attempts
}
```

**Retry Strategy:**
1. Initial request fails
2. Wait: `2^attempt × 1000ms + random(0-500ms)`
3. Retry up to `maxRetries` times
4. Skip retries for: Safety, Auth errors (non-transient)

---

## Best Practices

### 1. Prompt Engineering

**Good Prompts:**
```typescript
✅ "Professional product photo of a white t-shirt with minimal logo, studio lighting, clean background"
✅ "Remove background while preserving subject details and edge sharpness"
✅ "Add warm golden hour lighting with soft shadows and increased contrast"
```

**Bad Prompts:**
```typescript
❌ "Make it look good"
❌ "Fix this"
❌ "Do something creative"
```

**Tips:**
- Be specific and descriptive
- Include technical details (lighting, composition, style)
- Reference specific visual elements
- Use professional terminology
- Avoid ambiguous language

### 2. Image Preparation

**Optimal Input:**
- Resolution: 512px - 2048px per dimension
- Format: PNG or JPEG
- Size: Under 10MB
- Quality: High (minimal compression)

**Pre-processing:**
```typescript
// Validate before upload
if (file.size > 10 * 1024 * 1024) {
  throw new Error('File too large (max 10MB)');
}

if (!['image/png', 'image/jpeg'].includes(file.type)) {
  throw new Error('Unsupported format');
}
```

### 3. Performance Optimization

**Choose the Right Model:**
```typescript
// Fast iteration → Flash models
model: 'gemini-3-flash-preview'

// High quality → Pro models
model: 'gemini-3-pro-image-preview'

// Batch processing → Flash Image
model: 'gemini-2.5-flash-image'
```

**Implement Debouncing:**
```typescript
const debouncedGenerate = debounce(
  () => aiCore.generate(prompt, images, config),
  300  // Wait 300ms after last change
);
```

**Use AbortController:**
```typescript
const abortController = new AbortController();

// Cancel previous request
if (currentRequest) {
  currentRequest.abort();
}

// Make new request
currentRequest = abortController;
```

### 4. Cost Management

**Monitor Usage:**
- Track requests per day
- Set up billing alerts in Google Cloud
- Monitor token consumption
- Use appropriate models for tasks

**Optimization Strategies:**
- Cache identical requests
- Use lower-cost models when possible
- Implement request queuing
- Batch similar operations

---

## Rate Limits & Quotas

### Default Limits (Free Tier)

| Limit Type | Value |
|------------|-------|
| Requests per minute (RPM) | 15 |
| Requests per day (RPD) | 1,500 |
| Tokens per minute (TPM) | 1,000,000 |

### Paid Tier

Check [Google Cloud Pricing](https://cloud.google.com/ai-platform/pricing) for current rates.

**Typical Costs:**
- Text generation: $0.00025 per 1K characters
- Image generation: $0.002 per image (Flash models)
- Image generation: $0.01 per image (Pro models)

### Handling Rate Limits

```typescript
try {
  await aiCore.generate(prompt, images, config);
} catch (error) {
  if (error instanceof RateLimitError) {
    // Wait and retry
    await new Promise(r => setTimeout(r, 60000)); // 1 minute
    return await aiCore.generate(prompt, images, config);
  }
}
```

---

## Troubleshooting

### Common Issues

#### Issue: "API_KEY_MISSING" Error

**Cause:** API key not found in environment variables

**Solution:**
```bash
# Check .env file exists
ls -la .env

# Verify API_KEY is set
cat .env | grep API_KEY

# Ensure it's loaded (restart dev server)
npm run dev
```

#### Issue: Images Not Generating

**Checklist:**
- [ ] API key is valid
- [ ] Billing is enabled in Google Cloud
- [ ] Generative Language API is enabled
- [ ] Request parameters are correct
- [ ] Image format is supported (PNG, JPEG)
- [ ] File size is under 10MB
- [ ] Prompt is not blocked by safety filters

#### Issue: Slow Generation Times

**Solutions:**
1. Switch to faster model:
   ```typescript
   model: 'gemini-3-flash-preview'  // Instead of Pro
   ```

2. Reduce thinking budget:
   ```typescript
   thinkingBudget: 0  // Disable deep reasoning
   ```

3. Lower resolution:
   ```typescript
   imageSize: '1K'  // Instead of 2K or 4K
   ```

4. Check network connection
5. Verify not hitting rate limits

#### Issue: "Safety Error" Frequently

**Solutions:**
- Review and sanitize prompts
- Remove sensitive keywords
- Use neutral, descriptive language
- Avoid controversial topics
- Check source images for policy violations

### Debug Mode

Enable detailed logging:

```typescript
// Set environment
NODE_ENV=development

// Logger will output debug info
logger.debug('AI request details', {
  model,
  promptLength,
  imageCount,
});
```

### Support Resources

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Community Forum](https://discuss.ai.google.dev/)

---

## SDK Reference

### Installation

```bash
npm install @google/genai
```

### Basic Usage

```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ 
  apiKey: process.env.API_KEY 
});

const response = await ai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: { 
    parts: [
      { text: 'Your prompt here' },
      { inlineData: { data: base64Image, mimeType: 'image/png' } }
    ]
  },
  config: {
    temperature: 0.7,
    maxOutputTokens: 2048,
  }
});

console.log(response.text);
```

### Type Definitions

```typescript
interface GenerateContentResponse {
  text?: string;
  candidates?: Array<{
    content: {
      parts: Array<{
        text?: string;
        inlineData?: {
          data: string;
          mimeType: string;
        };
      }>;
    };
    finishReason?: string;
    groundingMetadata?: {
      groundingChunks: any[];
    };
  }>;
}
```

---

## Related Documentation

- [AGENTS.md](./AGENTS.md) - AI agent architecture
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design patterns
- [SECURITY.md](./SECURITY.md) - Security best practices
- [API.md](./API.md) - Complete API reference

---

**Last Updated:** December 30, 2024  
**SDK Version:** @google/genai v1.30.0  
**Next Review:** After v0.1.0 release
