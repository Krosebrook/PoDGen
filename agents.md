# Agents & Modules Documentation

This document provides comprehensive documentation for all agents, modules, and intelligent components within NanoGen Studio. Each section describes purpose, inputs, outputs, decision logic, and implementation details.

---

## Table of Contents

1. [AI Core Service](#ai-core-service)
2. [Editor State Agent](#editor-state-agent)
3. [Merch Controller Agent](#merch-controller-agent)
4. [Integration Manager Agent](#integration-manager-agent)
5. [File Processing Agent](#file-processing-agent)
6. [Error Handling Agent](#error-handling-agent)
7. [Logger Agent](#logger-agent)
8. [Canvas Synthesis Agent](#canvas-synthesis-agent)

---

## AI Core Service

**Location:** `services/ai-core.ts`  
**Type:** Singleton Service  
**Role:** Central orchestrator for all AI operations

### Purpose

The AI Core Service is the primary interface between NanoGen Studio and Google's Gemini API. It abstracts away API complexity, handles errors gracefully, implements retry logic, and normalizes responses for consistent consumption across the application.

### Architecture

```typescript
Singleton Pattern
├── Private constructor (prevents multiple instances)
├── getInstance() - Returns singleton instance
└── Stateless client creation - Fresh API client per request
```

### Key Responsibilities

1. **API Key Management** - Retrieves and validates environment API keys
2. **Request Orchestration** - Coordinates content generation with retry logic
3. **Error Normalization** - Converts API errors to user-friendly messages
4. **Token Budget Management** - Coordinates thinking and output tokens
5. **Response Parsing** - Extracts text, images, and metadata from responses

### Input Interface

```typescript
interface AIRequestConfig {
  model: AIModelType;              // Target Gemini model
  aspectRatio?: AspectRatio;       // For image generation
  imageSize?: ImageSize;           // For pro models (1K/2K/4K)
  thinkingBudget?: number;         // Deep reasoning token budget
  maxOutputTokens?: number;        // Max response size
  useSearch?: boolean;             // Enable Google Search grounding
  systemInstruction?: string;      // Contextual instructions
  responseMimeType?: string;       // Response format
  maxRetries?: number;             // Retry attempts (default: 2)
  seed?: number;                   // Reproducible generation
  temperature?: number;            // Creativity level (default: 0.7)
}

// Main method signature
async generate(
  prompt: string,
  images: string[] = [],
  config: AIRequestConfig
): Promise<AIResponse>
```

### Output Interface

```typescript
interface AIResponse {
  text?: string;                   // Generated or analyzed text
  image?: string;                  // Base64 image data URL
  groundingSources?: any[];        // Search result references
  finishReason?: string;           // Completion status
}
```

### Decision Logic

#### Retry Strategy

```typescript
for (attempt = 0; attempt <= retries; attempt++) {
  try {
    return executeRequest()
  } catch (error) {
    if (isNonRetriable(error)) throw immediately
    if (attempt < retries) {
      delay = exponentialBackoff(attempt) + jitter
      await sleep(delay)
      continue
    }
  }
}
```

**Non-retriable errors:**
- Safety blocks (content filtering)
- Authentication errors (invalid API key)
- Bad request errors (malformed input)

**Retriable errors:**
- Rate limit errors (429)
- System overload (503)
- Network timeouts
- Transient failures

#### Token Budget Coordination

When thinking mode is enabled:

```typescript
if (thinkingBudget) {
  config.thinkingBudget = budget
  config.maxOutputTokens = Math.max(
    userSpecifiedTokens || (budget + 2048),
    budget + 1024  // Ensure room for both thinking and output
  )
}
```

This prevents the model from running out of tokens mid-response.

#### Error Normalization Flow

```
Raw Error
  ↓
Check status code (429, 401, 403, 503)
  ↓
Check message content (safety, billing, capacity)
  ↓
Map to custom error class
  ↓
Return user-friendly message
```

### Error Handling

**Error Classes:**
- `AuthenticationError` - API key missing or invalid
- `RateLimitError` - Too many requests (429)
- `SafetyError` - Content blocked by safety filters
- `ApiError` - General API failures

**Example Error Messages:**
```
"API_KEY_MISSING: Environment key unavailable."
"SAFETY_BLOCK: Content violated safety policies."
"SYSTEM_OVERLOAD: API temporarily unavailable."
```

### Usage Example

```typescript
import { aiCore } from '@/services/ai-core';

try {
  const response = await aiCore.generate(
    "Transform this logo into a vintage poster style",
    [logoBase64, backgroundBase64],
    {
      model: 'gemini-2.5-flash-image',
      aspectRatio: '16:9',
      useSearch: true,
      thinkingBudget: 32768,
      systemInstruction: "You are a professional graphic designer"
    }
  );
  
  if (response.image) {
    displayImage(response.image);
  }
} catch (error) {
  showUserFriendlyError(error.message);
}
```

### Performance Characteristics

- **Average latency:** 3-8 seconds (model dependent)
- **Retry overhead:** 2^attempt * 1000ms + random(0-500ms)
- **Memory footprint:** ~5MB per request (base64 images)

---

## Editor State Agent

**Location:** `features/editor/hooks/useEditorState.ts`  
**Type:** React Hook (State Management)  
**Role:** Orchestrates image editing workflow

### Purpose

Manages the complete lifecycle of image editing operations, including file upload, model selection, prompt management, AI generation, and image analysis. Acts as the central state coordinator for the Creative Editor feature.

### State Architecture

```typescript
Configuration State
├── model (AIModelType)
├── aspectRatio (AspectRatio)
├── imageSize (ImageSize)
├── useSearch (boolean)
├── useThinking (boolean)
└── isProKeySelected (boolean)

Payload State
├── selectedImage (base64 | null)
├── prompt (string)
├── resultImage (base64 | null)
├── analysisResult (string | null)
└── groundingSources (array)

UI Synchronization State
├── loading (boolean)
└── error (string | null)
```

### Input/Output

**Inputs:**
- `onImageGenerated?: (url: string, prompt: string) => void` - Callback for successful generation

**Outputs:**
```typescript
{
  // Configuration
  model, handleModelChange,
  aspectRatio, setAspectRatio,
  imageSize, setImageSize,
  useSearch, setUseSearch,
  useThinking, setUseThinking,
  isProKeySelected,
  
  // Payload
  selectedImage, prompt, setPrompt,
  resultImage, analysisResult, groundingSources,
  
  // UI State
  loading, error,
  
  // Actions
  processFile,              // Upload and process image file
  handlePromptImageDrop,    // Drag-drop with auto-description
  handleGenerate,           // Generate edited image
  handleAnalyze,            // Analyze image composition
  handleReset,              // Clear all state
  clearAllErrors            // Clear error messages
}
```

### Decision Logic

#### Model Selection Logic

```typescript
if (newModel === 'gemini-3-pro-image-preview' && !isProKeySelected) {
  // Pro models require explicit key selection in AI Studio
  await openSelectKeyDialog()
  setIsProKeySelected(true)
}
setModel(newModel)
```

#### AI Request Routing

```typescript
if (intent === 'generate') {
  // Use user-selected model
  model = currentModel
  systemInstruction = "Context: Creative Image Editor..."
  expectsImage = true
  
} else if (intent === 'analyze') {
  // Force text-only model for analysis
  model = 'gemini-3-pro-preview'
  systemInstruction = "Context: Professional Art Analyst..."
  expectsText = true
}
```

#### Prompt Image Drop Flow

When user drops an image into the prompt area:

1. **Process Image** - Convert to base64
2. **Auto-Describe** - Use Gemini Flash to generate description
3. **Populate Prompt** - Set description as prompt text
4. **Set Source** - Store as selected image

```typescript
const response = await aiCore.generate(
  "Describe this image in detail. Focus on subject, style, and artistic elements. Keep under 60 words.",
  [base64],
  { model: 'gemini-3-flash-preview' }
);
setPrompt(response.text.trim());
```

### Error Recovery

```typescript
catch (error) {
  setError(error.message)
  
  // Handle pro key expiration
  if (error.message?.includes("not found")) {
    setIsProKeySelected(false)
  }
}
```

### Usage Patterns

**Generate Workflow:**
```typescript
const editor = useEditorState((url, prompt) => {
  console.log('Generated:', url, prompt);
});

// User uploads image
await editor.processFile(file);

// User enters prompt
editor.setPrompt("Transform into cyberpunk style");

// User clicks generate
await editor.handleGenerate();

// Result available in editor.resultImage
```

**Analyze Workflow:**
```typescript
// User uploads image
await editor.processFile(file);

// Optional: Add specific analysis prompt
editor.setPrompt("Focus on color palette and composition");

// User clicks analyze
await editor.handleAnalyze();

// Result available in editor.analysisResult
```

---

## Merch Controller Agent

**Location:** `features/merch/hooks/useMerchState.ts`  
**Type:** React Hook (State Management)  
**Role:** Orchestrates product mockup generation pipeline

### Purpose

Manages the end-to-end workflow for creating product mockups, including asset management (logo, background), product selection, style customization, text overlay configuration, and variation generation. Coordinates between user interactions and the Gemini API to synthesize high-fidelity product visualizations.

### State Architecture

```typescript
Asset Management
├── logo (base64 | null)
├── bg (base64 | null)
├── loadingAssets: { logo: boolean, bg: boolean }

Product Configuration
├── selectedProduct (MerchProduct)
└── stylePreference (string)

Text Overlay Configuration
├── text, font, color, size
├── position: { x, y }
├── transforms: { rotation, skewX }
├── effects: { underline, strikethrough, opacity }
└── background: { enabled, color, padding, opacity, rounding }

Results
├── resultImage (base64 | null)
├── variations (base64[])

UI State
├── loading (boolean)
├── isGeneratingVariations (boolean)
└── error (string | null)
```

### Input/Output

**Inputs:**
- `onImageGenerated?: (url: string, prompt: string) => void` - Success callback

**Outputs:**
```typescript
{
  // Assets
  logoImage, bgImage,
  isUploadingLogo, isUploadingBg,
  
  // Configuration
  selectedProduct, stylePreference,
  textOverlay,
  
  // Results
  resultImage, variations,
  loading, isGeneratingVariations,
  
  // Errors
  activeError, errorSuggestion,
  
  // Actions
  handleLogoUpload,        // Upload logo file
  handleBgUpload,          // Upload background file
  setSelectedProduct,      // Select product template
  setStylePreference,      // Set style description
  setTextOverlay,          // Update text overlay config
  handleGenerate,          // Generate main mockup
  handleGenerateVariations,// Generate 3 alternative views
  clearLogo,               // Remove logo and reset
  clearBg,                 // Remove background
  clearActiveError         // Dismiss error message
}
```

### Decision Logic

#### Prompt Construction

```typescript
function constructMerchPrompt(
  product: MerchProduct,
  style: string,
  hasBackground: boolean
): string {
  return `
    Professional product mockup for ${product.name}
    Category: ${product.category}
    Style: ${style || 'clean and modern'}
    ${hasBackground ? 'Integrate with provided background' : ''}
    Requirements:
    - Photorealistic rendering
    - Proper perspective and lighting
    - ${product.name}-appropriate presentation
    - High commercial quality
  `.trim()
}
```

#### Variation Prompt Strategy

Generates 3 distinct prompts with different angles and lighting:

```typescript
function getVariationPrompts(product, style, hasBg): string[] {
  return [
    `${basePrompt} - Camera angle: 45° from top-left, dramatic lighting`,
    `${basePrompt} - Camera angle: eye-level front view, soft diffused light`,
    `${basePrompt} - Camera angle: low angle from bottom-right, rim lighting`
  ]
}
```

#### Error Suggestion Logic

```typescript
function getErrorSuggestion(error: string, hasBg: boolean): string {
  if (error.includes('SAFETY')) {
    return 'Try simplifying your style description or using different imagery'
  }
  if (error.includes('RATE_LIMIT')) {
    return 'Wait 60 seconds before trying again'
  }
  if (error.includes('AUTH')) {
    return 'Check your API key configuration in .env'
  }
  if (!hasBg) {
    return 'Consider adding a background image for better composition'
  }
  return 'Try adjusting the style preference or selecting a different product'
}
```

#### Asset Upload Flow

```typescript
async function handleAssetUpload(file: File, type: 'logo' | 'bg') {
  setLoadingAssets(type, true)
  try {
    // Validate file
    validateImageFile(file)
    
    // Convert to base64
    const base64 = await readImageFile(file)
    
    // Store in state
    setAssets(type, base64)
    
    // Reset results if logo changed
    if (type === 'logo') {
      resetResults()
    }
  } catch (error) {
    setError(error.message)
  } finally {
    setLoadingAssets(type, false)
  }
}
```

### Parallel Variation Generation

Uses `Promise.all` with individual error handling:

```typescript
const results = await Promise.all(
  prompts.map(prompt => 
    geminiService.request(prompt, images, {
      model: 'gemini-2.5-flash-image',
      maxRetries: 1  // Fail fast for variations
    }).catch(() => null)  // Don't fail entire batch
  )
);

// Filter out failures
const successfulImages = results
  .map(r => r?.image)
  .filter(img => img !== null);
```

### Usage Patterns

**Basic Mockup Generation:**
```typescript
const merch = useMerchController();

// 1. Upload logo
await merch.handleLogoUpload(logoFile);

// 2. Select product
merch.setSelectedProduct(MERCH_PRODUCTS[0]); // T-Shirt

// 3. Set style
merch.setStylePreference("vintage 80s aesthetic with neon colors");

// 4. Generate
await merch.handleGenerate();

// Result in merch.resultImage
```

**Advanced Mockup with Text Overlay:**
```typescript
// ... basic setup ...

// Configure text overlay
merch.setTextOverlay({
  text: "LIMITED EDITION",
  font: "Impact, sans-serif",
  color: "#FFD700",
  size: 48,
  x: 50, y: 80,
  rotation: -5,
  bgEnabled: true,
  bgColor: "#000000",
  bgOpacity: 70,
  bgRounding: 8
});

await merch.handleGenerate();
```

**Variation Exploration:**
```typescript
// After generating main mockup
await merch.handleGenerateVariations();

// Access variations
merch.variations.forEach((url, index) => {
  displayVariation(url, index);
});
```

---

## Integration Manager Agent

**Location:** `features/integrations/hooks/usePlatformKeys.ts`  
**Type:** React Hook (State Management)  
**Role:** Manages platform API keys and code generation

### Purpose

Provides secure storage and retrieval of third-party platform API keys, enabling code generation for various e-commerce and content platforms. Coordinates between localStorage persistence and UI state synchronization.

### State Architecture

```typescript
Platform Keys Map
├── shopify: string | null
├── printify: string | null
├── etsy: string | null
├── tiktok: string | null
├── amazonkdp: string | null
└── nodegenai: string | null

UI State
└── (managed by individual components)
```

### Input/Output

**Outputs:**
```typescript
{
  keys: Record<PlatformId, string | null>,
  setKey: (platform: PlatformId, key: string) => void,
  clearKey: (platform: PlatformId) => void,
  hasKey: (platform: PlatformId) => boolean
}
```

### Decision Logic

#### Storage Strategy

```typescript
// Save to localStorage
function setKey(platform: PlatformId, key: string) {
  localStorage.setItem(`platform_key_${platform}`, key)
  updateState(platform, key)
}

// Load from localStorage on mount
useEffect(() => {
  PLATFORMS.forEach(platform => {
    const saved = localStorage.getItem(`platform_key_${platform.id}`)
    if (saved) {
      updateState(platform.id, saved)
    }
  })
}, [])
```

#### Code Template Substitution

```typescript
function generateCode(template: string, keys: Keys, context: Context): string {
  return template
    .replace(/\{\{API_KEY\}\}/g, keys[platform] || 'YOUR_API_KEY')
    .replace(/\{\{IMAGE_URL\}\}/g, context.imageUrl || 'https://example.com/image.png')
    .replace(/\{\{PROMPT\}\}/g, escapeString(context.prompt))
    .replace(/\{\{MIME_TYPE\}\}/g, context.mimeType || 'image/png')
}
```

### Security Considerations

**Current Implementation:**
- Keys stored in plain text in localStorage
- No encryption at rest
- XSS vulnerability if malicious script injected

**Recommended Improvements (v1.0):**
```typescript
import CryptoJS from 'crypto-js';

function encryptKey(key: string): string {
  const passphrase = generatePassphrase();
  return CryptoJS.AES.encrypt(key, passphrase).toString();
}

function decryptKey(encrypted: string): string {
  const passphrase = retrievePassphrase();
  return CryptoJS.AES.decrypt(encrypted, passphrase).toString(CryptoJS.enc.Utf8);
}
```

### Usage Patterns

```typescript
const { keys, setKey, hasKey } = usePlatformKeys();

// Save API key
setKey('shopify', 'shp_abc123def456');

// Check if key exists
if (hasKey('shopify')) {
  generateShopifyCode(keys.shopify);
}

// Clear key
clearKey('shopify');
```

---

## File Processing Agent

**Location:** `shared/utils/file.ts`  
**Type:** Utility Module  
**Role:** File validation and conversion

### Purpose

Provides robust file handling utilities for image upload, validation, and base64 conversion. Ensures only valid image files are processed and converted to formats suitable for AI API transmission.

### Key Functions

#### 1. readImageFile

```typescript
async function readImageFile(file: File): Promise<string>
```

**Purpose:** Convert image File object to base64 string  
**Validation:** File size, MIME type  
**Output:** `data:image/png;base64,iVBORw0KG...`

**Implementation:**
```typescript
function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate file size (e.g., max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('File too large (max 10MB)'));
      return;
    }
    
    // Validate MIME type
    if (!file.type.startsWith('image/')) {
      reject(new Error('File must be an image'));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
```

#### 2. validateImageFile

```typescript
function validateImageFile(file: File): void
```

**Checks:**
- File size limits (10MB default)
- MIME type allowlist (image/png, image/jpeg, image/webp)
- Filename extension validation
- Magic number verification (future enhancement)

**Throws:** `ValidationError` with specific message

#### 3. formatFileSize

```typescript
function formatFileSize(bytes: number): string
```

**Purpose:** Human-readable file size formatting  
**Examples:**
- 1024 → "1.0 KB"
- 1048576 → "1.0 MB"
- 52428800 → "50.0 MB"

### Decision Logic

#### MIME Type Allowlist

```typescript
const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif'  // Note: GIF support model-dependent
];

function isAllowedType(type: string): boolean {
  return ALLOWED_TYPES.includes(type.toLowerCase());
}
```

#### File Size Strategy

```typescript
const SIZE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024,     // 10MB
  WARN_FILE_SIZE: 5 * 1024 * 1024,     // 5MB (show warning)
  MAX_DIMENSION: 4096,                 // Max width/height
  RECOMMENDED_DIMENSION: 2048          // Recommended max
};
```

---

## Error Handling Agent

**Location:** `shared/utils/errors.ts`  
**Type:** Error Class Hierarchy  
**Role:** Structured error management

### Purpose

Provides typed error classes for different failure scenarios, enabling precise error handling, user-friendly messages, and proper error propagation throughout the application.

### Error Hierarchy

```typescript
AppError (base)
├── ApiError (HTTP/API failures)
│   ├── AuthenticationError (401, 403)
│   ├── RateLimitError (429)
│   └── SafetyError (content filtering)
├── ValidationError (input validation)
├── FileError (file processing)
└── NetworkError (connectivity issues)
```

### Error Class Definitions

#### 1. AppError (Base Class)

```typescript
class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;
  
  constructor(message: string, code: ErrorCode) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

#### 2. ApiError

```typescript
class ApiError extends AppError {
  public readonly statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message, ErrorCode.API_ERROR);
    this.statusCode = statusCode;
  }
}
```

**Use cases:**
- General API failures
- Unexpected response formats
- Server errors

#### 3. AuthenticationError

```typescript
class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
    this.code = ErrorCode.AUTH_ERROR;
  }
}
```

**Triggers:**
- Missing API key
- Invalid API key
- Expired credentials
- Insufficient permissions

#### 4. RateLimitError

```typescript
class RateLimitError extends ApiError {
  public readonly retryAfter?: number;
  
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429);
    this.code = ErrorCode.RATE_LIMIT;
    this.retryAfter = retryAfter;
  }
}
```

**Metadata:**
- `retryAfter` - Seconds until retry allowed

#### 5. SafetyError

```typescript
class SafetyError extends ApiError {
  public readonly category: SafetyCategory;
  
  constructor(message: string, category: SafetyCategory = 'GENERAL') {
    super(message, 403);
    this.code = ErrorCode.SAFETY_VIOLATION;
    this.category = category;
  }
}
```

**Categories:**
- `GENERAL` - Generic safety block
- `HATE_SPEECH` - Offensive content
- `VIOLENCE` - Violent imagery
- `SEXUAL` - Adult content
- `COPYRIGHT` - Copyright violation

### Error Code Enumeration

```typescript
enum ErrorCode {
  // API Errors
  API_ERROR = 'API_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  SAFETY_VIOLATION = 'SAFETY_VIOLATION',
  
  // Client Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  FILE_ERROR = 'FILE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  
  // Internal Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
```

### Usage Patterns

#### Throwing Errors

```typescript
// API authentication failure
throw new AuthenticationError('API_KEY_MISSING: No key in environment');

// File validation
if (!isValidImage(file)) {
  throw new ValidationError('File must be PNG, JPEG, or WebP');
}

// Safety block
if (response.blocked) {
  throw new SafetyError('Content violated community guidelines', 'GENERAL');
}
```

#### Catching and Handling

```typescript
try {
  await aiCore.generate(prompt, images, config);
} catch (error) {
  if (error instanceof AuthenticationError) {
    showMessage('Please check your API key configuration');
  } else if (error instanceof RateLimitError) {
    showMessage(`Too many requests. Try again in ${error.retryAfter}s`);
  } else if (error instanceof SafetyError) {
    showMessage('Your content was blocked. Please modify and try again.');
  } else {
    showMessage('An unexpected error occurred. Please try again.');
    logger.error('Unhandled error:', error);
  }
}
```

---

## Logger Agent

**Location:** `shared/utils/logger.ts`  
**Type:** Logging Utility  
**Role:** Structured logging and debugging

### Purpose

Provides consistent, level-based logging throughout the application with automatic sanitization of sensitive data. Supports development debugging and production monitoring.

### Log Levels

```typescript
enum LogLevel {
  DEBUG = 0,    // Detailed debugging information
  INFO = 1,     // General informational messages
  WARN = 2,     // Warning messages (non-critical issues)
  ERROR = 3,    // Error messages (failures)
  FATAL = 4     // Fatal errors (application crashes)
}
```

### API Interface

```typescript
interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  fatal(message: string, ...args: any[]): void;
}
```

### Implementation

```typescript
class Logger {
  private minLevel: LogLevel;
  
  constructor(minLevel: LogLevel = LogLevel.INFO) {
    this.minLevel = minLevel;
  }
  
  private log(level: LogLevel, message: string, ...args: any[]) {
    if (level < this.minLevel) return;
    
    const timestamp = new Date().toISOString();
    const sanitizedArgs = args.map(arg => this.sanitize(arg));
    
    const logData = {
      timestamp,
      level: LogLevel[level],
      message,
      data: sanitizedArgs
    };
    
    if (level >= LogLevel.ERROR) {
      console.error(JSON.stringify(logData));
    } else {
      console.log(JSON.stringify(logData));
    }
  }
  
  private sanitize(data: any): any {
    if (typeof data === 'string') {
      // Redact API keys
      return data.replace(/([a-zA-Z0-9]{20,})/g, '[REDACTED]');
    }
    if (typeof data === 'object') {
      // Recursively sanitize objects
      return Object.entries(data).reduce((acc, [key, value]) => {
        if (key.toLowerCase().includes('key') || 
            key.toLowerCase().includes('token') ||
            key.toLowerCase().includes('password')) {
          acc[key] = '[REDACTED]';
        } else {
          acc[key] = this.sanitize(value);
        }
        return acc;
      }, {});
    }
    return data;
  }
}
```

### Usage Patterns

```typescript
import { logger } from '@/shared/utils/logger';

// Debug (development only)
logger.debug('Image upload initiated', { fileSize, fileName });

// Info (general flow)
logger.info('AI generation started', { model, prompt });

// Warn (non-critical issues)
logger.warn('Large file detected', { size: '8MB', limit: '10MB' });

// Error (failures)
logger.error('API request failed', { error, statusCode });

// Fatal (critical failures)
logger.fatal('Application crash', { error, stack });
```

### Sanitization Examples

**Input:**
```typescript
logger.info('User logged in', {
  username: 'john@example.com',
  apiKey: 'sk_live_abc123def456',
  preferences: { theme: 'dark' }
});
```

**Output:**
```json
{
  "timestamp": "2024-12-29T12:00:00.000Z",
  "level": "INFO",
  "message": "User logged in",
  "data": [{
    "username": "john@example.com",
    "apiKey": "[REDACTED]",
    "preferences": { "theme": "dark" }
  }]
}
```

---

## Canvas Synthesis Agent

**Location:** `features/merch/components/MerchPreview.tsx`  
**Type:** React Component with Canvas Logic  
**Role:** High-resolution image rendering and export

### Purpose

Synthesizes final product mockups by compositing AI-generated images with text overlays using HTML Canvas API. Produces high-resolution exports suitable for print and digital distribution.

### Architecture

```typescript
Component Hierarchy
└── MerchPreview
    ├── Canvas Element (hidden, for rendering)
    ├── Preview Image (visible display)
    └── Export Button
```

### Canvas Pipeline

```
1. Create Canvas Context
   ↓
2. Load AI-Generated Image
   ↓
3. Draw Image at High Resolution
   ↓
4. Apply Text Overlay (if configured)
   ├── Calculate text metrics
   ├── Apply transformations
   ├── Draw background (if enabled)
   └── Draw text with effects
   ↓
5. Export to Data URL or Blob
```

### Text Overlay Rendering

```typescript
function renderTextOverlay(
  ctx: CanvasRenderingContext2D,
  overlay: TextOverlayState,
  canvasWidth: number,
  canvasHeight: number
) {
  // Calculate absolute position
  const x = (overlay.x / 100) * canvasWidth;
  const y = (overlay.y / 100) * canvasHeight;
  
  // Save context state
  ctx.save();
  
  // Apply transformations
  ctx.translate(x, y);
  ctx.rotate((overlay.rotation * Math.PI) / 180);
  ctx.transform(1, 0, Math.tan((overlay.skewX * Math.PI) / 180), 1, 0, 0);
  
  // Configure text
  ctx.font = `${overlay.size}px ${overlay.font}`;
  ctx.textAlign = overlay.align;
  ctx.globalAlpha = overlay.opacity / 100;
  
  // Measure text
  const metrics = ctx.measureText(overlay.text);
  const textWidth = metrics.width;
  const textHeight = overlay.size;
  
  // Draw background box (if enabled)
  if (overlay.bgEnabled) {
    ctx.fillStyle = overlay.bgColor;
    ctx.globalAlpha = overlay.bgOpacity / 100;
    
    const padding = overlay.bgPadding;
    const rounding = overlay.bgRounding;
    
    drawRoundedRect(
      ctx,
      -padding,
      -textHeight - padding,
      textWidth + padding * 2,
      textHeight + padding * 2,
      rounding
    );
  }
  
  // Draw text
  ctx.globalAlpha = overlay.opacity / 100;
  ctx.fillStyle = overlay.color;
  ctx.fillText(overlay.text, 0, 0);
  
  // Draw effects
  if (overlay.underline) {
    ctx.strokeStyle = overlay.color;
    ctx.lineWidth = overlay.size / 20;
    ctx.beginPath();
    ctx.moveTo(0, textHeight * 0.1);
    ctx.lineTo(textWidth, textHeight * 0.1);
    ctx.stroke();
  }
  
  if (overlay.strikethrough) {
    ctx.strokeStyle = overlay.color;
    ctx.lineWidth = overlay.size / 20;
    ctx.beginPath();
    ctx.moveTo(0, -textHeight * 0.5);
    ctx.lineTo(textWidth, -textHeight * 0.5);
    ctx.stroke();
  }
  
  // Restore context state
  ctx.restore();
}
```

### Export Logic

```typescript
async function exportImage(format: 'png' | 'jpeg', quality: number = 0.95): Promise<Blob> {
  const canvas = canvasRef.current;
  if (!canvas) throw new Error('Canvas not initialized');
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      },
      format === 'png' ? 'image/png' : 'image/jpeg',
      quality
    );
  });
}
```

### Performance Considerations

- **Resolution scaling:** 2x or 4x for high-DPI displays
- **Memory management:** Canvas cleared after each render
- **Async image loading:** Prevents UI blocking
- **Worker thread option:** For complex overlays (future)

### Usage Example

```typescript
<MerchPreview
  image={resultImage}
  textOverlay={textOverlay}
  onExport={(blob) => downloadBlob(blob, 'mockup.png')}
/>
```

---

## Summary Table

| Agent | Type | Primary Role | Key Dependencies |
|-------|------|--------------|------------------|
| AI Core Service | Singleton Service | API orchestration | `@google/genai` |
| Editor State | React Hook | Image editing workflow | AI Core Service |
| Merch Controller | React Hook | Mockup generation | Gemini Service |
| Integration Manager | React Hook | Key management | localStorage |
| File Processor | Utility | File validation | File API |
| Error Handler | Class Hierarchy | Error management | None |
| Logger | Utility | Structured logging | Console API |
| Canvas Synthesizer | Component | Image rendering | Canvas API |

---

## Future Enhancements

### Planned Agents (v2.0+)

1. **Video Generation Agent** - Veo 3.1 integration for video mockups
2. **SEO Copywriting Agent** - Automated product descriptions
3. **Analytics Agent** - Usage tracking and insights
4. **Collaboration Agent** - Real-time team features
5. **Caching Agent** - Smart result caching and invalidation

---

**Last Updated:** 2024-12-29  
**Maintainer:** NanoGen Engineering Team  
**Related Documentation:** [ARCHITECTURE.md](./ARCHITECTURE.md), [AUDIT.md](./AUDIT.md)
