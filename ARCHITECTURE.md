# Architecture & Design Patterns

**Version:** 0.0.0  
**Last Updated:** 2024-12-29  
**Status:** MVP Complete, Pre-Production

NanoGen Studio is an **AI-First UX** application designed for speed, high-fidelity synthesis, and professional-grade product visualization. This document outlines the current architecture, design decisions, and planned refactorings.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Feature-Driven Structure](#feature-driven-structure)
3. [Layout Strategy](#layout-strategy)
4. [UI/UX Patterns](#uiux-patterns)
5. [AI Service Layer](#ai-service-layer)
6. [State Management](#state-management)
7. [Error Handling](#error-handling)
8. [Security & Privacy](#security--privacy)
9. [Performance Strategy](#performance-strategy)
10. [Refactoring Recommendations](#refactoring-recommendations)

---

## System Overview

### Architecture Paradigm

**Pattern:** Feature-Based Modules with Service Layer  
**Philosophy:** Domain-Driven Design (DDD) principles

```
┌─────────────────────────────────────┐
│   Presentation Layer                │  React components, UI
├─────────────────────────────────────┤
│   Application Layer                 │  Feature hooks, orchestration
├─────────────────────────────────────┤
│   Domain Layer                      │  Business logic, types
├─────────────────────────────────────┤
│   Infrastructure Layer              │  AI services, file handling
└─────────────────────────────────────┘
```

### Technology Stack Rationale

| Technology | Why We Chose It |
|-----------|-----------------|
| React 19 | Concurrent Mode for better UX, latest features |
| TypeScript 5.8 | Strict type safety, better DX |
| Vite 6.2 | Fast builds (3.19s), excellent HMR |
| Tailwind CSS 3.4 | Utility-first, rapid prototyping |
| `@google/genai` | Official SDK, type-safe, well-maintained |
| Three.js | Industry standard for 3D rendering |

## Feature-Driven Structure

The codebase is organized into domain-specific modules to maximize maintainability and reduce cross-feature leakage.

### Current Structure

```
src/
├── features/               # High-level domain logic
│   ├── editor/             # Image manipulation & analysis
│   │   ├── components/     # Editor-specific UI
│   │   ├── hooks/          # useEditorState
│   │   └── types.ts        # Editor types
│   ├── merch/              # Product mockup synthesis
│   │   ├── components/     # Merch UI components
│   │   ├── hooks/          # useMerchController
│   │   ├── data/           # Product templates
│   │   ├── types.ts        # Merch types
│   │   └── utils.ts        # Merch utilities
│   └── integrations/       # External connectivity tools
│       ├── components/     # Integration UI
│       ├── hooks/          # usePlatformKeys
│       └── data/           # Platform templates
├── shared/                 # Core cross-feature primitives
│   ├── components/         # Atomic Design System
│   │   ├── ui/            # Button, Spinner, Alert, etc.
│   │   └── layout/        # Shell, Container, etc.
│   ├── hooks/              # Global state & effects
│   │   └── useGenAI.ts    # Shared AI hook
│   ├── utils/              # Pure functions
│   │   ├── errors.ts      # Error classes
│   │   ├── file.ts        # File handling
│   │   ├── image.ts       # Image utilities
│   │   └── logger.ts      # Logging
│   └── types/              # Shared TypeScript types
│       └── index.ts       # Common types
└── services/               # Infrastructure Layer
    ├── ai-core.ts          # Central Gemini API Service (SDK v1.30+)
    ├── gemini.ts           # Legacy service (to be deprecated)
    └── ai.ts               # (unused, to be removed)
```

### Module Boundaries

**Public API (index.ts in each feature):**
```typescript
// features/editor/index.ts
export { ImageEditor } from './components/ImageEditor';
export { useEditorState } from './hooks/useEditorState';
export type { EditorConfig, EditorResult } from './types';
```

**Benefits:**
- Clear entry points
- Encapsulation
- Easy refactoring
- Type-safe imports

### Dependency Rules

```
Features → Shared → Services
     ↓       ↓          ↓
   None    None      None

(No circular dependencies allowed)
```

**Enforcement:** Consider adding `eslint-plugin-import` rules in v0.1.0

## Layout Strategy

We utilize **CSS Grid** as the primary layout engine to handle complex, multi-pane workspaces.

### Grid Configuration

```css
.app-container {
  display: grid;
  grid-template-columns: 
    minmax(200px, 15%) /* Sidebar */
    1fr;               /* Main content */
  grid-template-rows: 
    auto               /* Header */
    1fr;               /* Content */
  height: 100vh;
}
```

### Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile | < 640px | Stacked, tab-based navigation |
| Tablet | 640px - 1024px | Compact sidebar |
| Desktop | 1024px - 1920px | Full sidebar + content |
| Ultra-wide | > 1920px | Max-width constraints |

### Merch Studio Layout

- **Deterministic Widths**: Sidebar uses `clamp(340px, 30%, 420px)` to ensure:
  - Minimum 340px on small screens
  - Maximum 420px on large screens
  - 30% of viewport width in between
  
- **Fluid Viewports**: Preview area occupies `1fr`, expanding/contracting gracefully

- **Responsive Ordering**: CSS `order` property prioritizes visual viewport on mobile while maintaining semantic HTML

### Accessibility Considerations

- Semantic HTML structure (`<aside>`, `<main>`, `<nav>`)
- ARIA landmarks for screen readers
- Skip links for keyboard navigation (planned for v1.0)
- Focus trap in modals (planned for v1.0)

## UI/UX Patterns

Generating AI content is asynchronous and prone to failures. Our UX addresses this through careful design.

### Loading States

**Philosophy:** Always show progress, never block interaction

```typescript
// Multi-level loading feedback
interface LoadingState {
  isLoading: boolean;
  loadingMessage: string;
  progress?: number;
}

// Examples:
"Uploading image..."           // File upload
"Connecting to Gemini..."      // API init
"Synthesizing masterpiece..."  // Generation
"Exploring variations..."      // Batch operations
```

**Visual Design:**
- Spinner with descriptive text
- Skeleton screens for predictable layouts
- Progress bars for batch operations (planned)
- Optimistic UI updates where safe

### Error Handling UX

**Principle:** Errors should be actionable, not technical

```typescript
// Bad (technical error)
"Error: 429 Too Many Requests"

// Good (actionable error)
"Too many requests. Please wait 60 seconds and try again."

// Better (helpful suggestions)
"Rate limit exceeded. Here's what you can do:
 - Wait 60 seconds before retrying
 - Reduce the number of variations
 - Consider upgrading your API quota"
```

**Error Display:**
- **Alert Component**: Non-blocking, dismissible
- **Inline Errors**: Contextual, near the relevant field
- **Modal Errors**: Critical failures that block workflow
- **Toast Notifications**: Success/info messages

### Async Asset Handling

**Non-Blocking Architecture:**

```typescript
// Logo upload doesn't block background upload
const [logoLoading, setLogoLoading] = useState(false);
const [bgLoading, setBgLoading] = useState(false);

// Parallel uploads
Promise.all([
  uploadLogo().finally(() => setLogoLoading(false)),
  uploadBackground().finally(() => setBgLoading(false))
]);
```

**Benefits:**
- UI never feels "locked"
- Users can multitask
- Better perceived performance

### Empty States

**Designed Empty States:**
- Upload prompts with drag-and-drop targets
- Helpful hints and example use cases
- Clear call-to-action buttons
- Visual interest (illustrations, icons)

### Responsive Behavior

| Viewport | Adaptation |
|----------|------------|
| Mobile (< 640px) | Tab-based navigation, stacked layout |
| Tablet (640-1024px) | Collapsible sidebar, medium controls |
| Desktop (1024px+) | Full sidebar, large controls |
| Ultra-wide (> 1920px) | Max-width constraints, centered layout |

## AI Service Layer

The `AICoreService` is a robust facade for the `@google/genai` SDK, providing reliability and developer experience.

### Design Pattern: Singleton

```typescript
class AICoreService {
  private static instance: AICoreService;
  
  private constructor() {}
  
  public static getInstance(): AICoreService {
    if (!AICoreService.instance) {
      AICoreService.instance = new AICoreService();
    }
    return AICoreService.instance;
  }
}

export const aiCore = AICoreService.getInstance();
```

**Why Singleton?**
- Single point of configuration
- Consistent retry logic
- Centralized error normalization
- Easy to mock in tests

### Stateless Client Initialization

**Critical Decision:** Create fresh `GoogleGenAI` instances per request

```typescript
public async generate(prompt: string, images: string[], config: AIRequestConfig) {
  // ALWAYS get fresh API key from environment
  const apiKey = process.env.API_KEY;
  const client = new GoogleGenAI({ apiKey });
  
  // Make request with fresh client
  return await this.executeRequest(client, prompt, images, config);
}
```

**Rationale:**
- Respects dynamic environment updates (hot reload)
- No stale closure issues
- Clean state per request
- Testability

### Token Budget Coordination

**Problem:** Thinking mode can consume all tokens, leaving none for output

**Solution:** Automatic token budget coordination

```typescript
if (config.thinkingBudget) {
  // Reserve tokens for output
  const minOutputTokens = 1024;
  const recommendedOutputTokens = 2048;
  
  generationConfig.thinkingBudget = config.thinkingBudget;
  generationConfig.maxOutputTokens = Math.max(
    config.maxOutputTokens || (config.thinkingBudget + recommendedOutputTokens),
    config.thinkingBudget + minOutputTokens
  );
}
```

**Result:** Users get complete responses, not truncated output

### Retry Logic

**Strategy:** Exponential backoff with jitter

```typescript
for (let attempt = 0; attempt <= maxRetries; attempt++) {
  try {
    return await makeRequest();
  } catch (error) {
    // Don't retry non-retriable errors
    if (isNonRetriable(error)) throw error;
    
    if (attempt < maxRetries) {
      const baseDelay = Math.pow(2, attempt) * 1000;  // 1s, 2s, 4s
      const jitter = Math.random() * 500;              // 0-500ms
      await sleep(baseDelay + jitter);
      continue;
    }
  }
}
```

**Non-retriable Errors:**
- Authentication failures (401, 403)
- Safety blocks (content filtering)
- Bad requests (400, invalid parameters)

**Retriable Errors:**
- Rate limits (429)
- Server errors (500, 503)
- Network timeouts
- Transient failures

### Error Normalization

**Goal:** Convert API errors to user-friendly messages

```typescript
private normalizeError(error: any): AppError {
  const status = error?.status || error?.response?.status;
  const message = error?.message?.toLowerCase() || '';
  
  // Map to custom error classes
  if (status === 429) return new RateLimitError();
  if (message.includes('safety')) return new SafetyError();
  if (status === 401 || status === 403) return new AuthenticationError();
  if (status >= 500) return new ApiError('Service temporarily unavailable', status);
  
  return new ApiError(error.message, status || 500);
}
```

**Benefits:**
- Consistent error handling
- Type-safe error catching
- User-friendly messages
- Easier debugging

---

## State Management

### Philosophy: Local State First

**Pattern:** Feature-specific custom hooks, no global state library (Redux, MobX)

**Rationale:**
- Simpler mental model
- Less boilerplate
- Easier to understand
- Better performance (no unnecessary re-renders)
- Sufficient for current complexity

### Hook Architecture

```typescript
export const useFeatureState = () => {
  // Configuration state
  const [config, setConfig] = useState<Config>(defaultConfig);
  
  // Data state
  const [data, setData] = useState<Data | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Actions
  const performAction = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall(config);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Return public API
  return {
    config, setConfig,
    data, loading, error,
    performAction
  };
};
```

### State Composition

For complex features, compose multiple hooks:

```typescript
const useMerchStudio = () => {
  const assets = useAssets();          // Logo, background management
  const product = useProductSelect();  // Product template selection
  const text = useTextOverlay();       // Text overlay configuration
  const generation = useGeneration();  // AI generation logic
  
  return { assets, product, text, generation };
};
```

### When to Use Global State (Future)

Consider Redux/Zustand/Jotai when:
- User authentication state (v1.1+)
- Project/asset management (v1.1+)
- Real-time collaboration (v2.0+)
- Complex undo/redo (v1.0+)

**Current Status:** Not needed, local state sufficient

---

## Error Handling

### Error Class Hierarchy

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

### Error Propagation

```
Service Layer → Throw typed errors
      ↓
Hook Layer → Catch and set error state
      ↓
Component Layer → Display user-friendly messages
```

### Best Practices

1. **Throw early**: Validate inputs at service boundaries
2. **Catch late**: Handle errors at presentation layer
3. **Type-safe**: Use custom error classes
4. **User-friendly**: Translate technical errors to actionable messages
5. **Log everything**: Use structured logger for debugging

---

## Security & Privacy

### Current Implementation (v0.0.0)

**What's Secure:**
- ✅ No server-side data collection
- ✅ Client-side file processing only
- ✅ Custom error classes prevent info leakage
- ✅ Base64 sanitization before API calls
- ✅ Gemini API safety filters enabled

**Security Concerns:**
- ⚠️ **LocalStorage Keys**: Platform API keys stored unencrypted
- ⚠️ **No Input Validation**: Server-side validation missing
- ⚠️ **Console Logging**: Some error details in browser console
- ⚠️ **No CSP**: Content Security Policy not configured
- ⚠️ **No Rate Limiting**: Client-side only, no backend protection

### Planned Security Improvements (v0.1.0 - v1.0)

#### 1. Encrypted LocalStorage (v0.1.0)

```typescript
import CryptoJS from 'crypto-js';

class SecureStorage {
  private getKey(): string {
    // Derive key from environment + user session
    return CryptoJS.PBKDF2(
      process.env.ENCRYPTION_KEY + sessionId,
      'nanogen-salt',
      { keySize: 256/32 }
    ).toString();
  }
  
  set(key: string, value: string): void {
    const encrypted = CryptoJS.AES.encrypt(value, this.getKey()).toString();
    localStorage.setItem(key, encrypted);
  }
  
  get(key: string): string | null {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    
    const decrypted = CryptoJS.AES.decrypt(encrypted, this.getKey());
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}
```

#### 2. API Key Validation (v0.1.0)

```typescript
function validateApiKey(key: string): boolean {
  // Check format
  if (!key || key.length < 20) return false;
  
  // Check prefix (Google API keys start with specific patterns)
  if (!key.startsWith('AI') && !key.startsWith('sk_')) return false;
  
  // Optional: Verify with API (test request)
  return true;
}
```

#### 3. Input Sanitization (v0.2.0)

```typescript
// Server-side validation (future backend)
function validateImageUpload(file: File): ValidationResult {
  // Size check
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'File too large (max 10MB)' };
  }
  
  // MIME type check
  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }
  
  // Magic number verification
  const header = await readFileHeader(file);
  if (!isValidImageHeader(header, file.type)) {
    return { valid: false, error: 'File header mismatch' };
  }
  
  return { valid: true };
}
```

#### 4. Content Security Policy (v1.0)

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://generativelanguage.googleapis.com;
  font-src 'self' data:;
">
```

### Data Privacy

**What We Don't Collect:**
- User personal information
- Usage analytics
- Crash reports
- Behavioral tracking

**What Gets Processed by Google:**
- Images uploaded to Creative Editor
- Logos/backgrounds uploaded to Merch Studio
- Text prompts for generation
- Generated results (temporary)

**User Control:**
- All data processing is explicit (user-initiated)
- No background processing
- No data retention by us
- Google's data usage governed by their TOS

---

## Performance Strategy

### Current Performance

| Metric | Current | Target (v1.0) |
|--------|---------|---------------|
| Initial Load | ~4-5s | < 3s |
| Time to Interactive | ~5-6s | < 3s |
| Bundle Size | 603 KB (156 KB gzipped) | < 500 KB |
| Lighthouse Score | ~85 | > 90 |
| API Latency | 3-20s (model dependent) | N/A (can't control) |

### Optimization Strategies

#### 1. Code Splitting

**Current:**
```typescript
// Lazy loaded features
const ImageEditor = React.lazy(() => import('./features/editor/components/ImageEditor'));
const MerchStudio = React.lazy(() => import('./features/merch/components/MerchStudio'));
const IntegrationCode = React.lazy(() => import('./features/integrations/components/IntegrationCode'));
```

**Improvement (v0.1.0):**
```typescript
// Split Three.js imports (large dependency)
const Merch3DViewer = React.lazy(() => import('./features/merch/components/Merch3DViewer'));

// Preload on hover
<Link 
  to="/merch" 
  onMouseEnter={() => import('./features/merch/components/MerchStudio')}
>
  Merch Studio
</Link>
```

#### 2. Image Optimization

**Current:** Base64 encoding (inefficient)

**Improvement (v1.0):**
```typescript
// Compress before upload
async function optimizeImage(file: File): Promise<string> {
  const img = await loadImage(file);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d')!;
  
  // Resize if too large
  let { width, height } = img;
  const maxDim = 2048;
  if (width > maxDim || height > maxDim) {
    const scale = maxDim / Math.max(width, height);
    width *= scale;
    height *= scale;
  }
  
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);
  
  // Export as JPEG with quality 90
  return canvas.toDataURL('image/jpeg', 0.9);
}
```

#### 3. Caching Strategy

**Planned (v1.0):**
```typescript
class ResponseCache {
  private cache = new Map<string, { data: any, timestamp: number }>();
  private TTL = 5 * 60 * 1000; // 5 minutes
  
  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    // Check if expired
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}
```

#### 4. Bundle Analysis

**Tools to add (v0.1.0):**
```bash
npm install -D vite-bundle-visualizer
```

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [
    visualizer({ open: true, gzipSize: true })
  ]
};
```

---

## Refactoring Recommendations

### Priority 1: Critical (v0.1.0)

#### 1.1 Add React Error Boundaries

**Problem:** Single component error crashes entire app

**Solution:**
```typescript
class ErrorBoundary extends React.Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Component error:', error, errorInfo);
    // Report to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// Wrap each feature
<ErrorBoundary>
  <ImageEditor />
</ErrorBoundary>
```

**Impact:** High - Prevents catastrophic failures  
**Effort:** Low - 1 day  
**Files:** `shared/components/ErrorBoundary.tsx`, `App.tsx`

#### 1.2 Replace Console Logging with Structured Logger

**Problem:** Inconsistent logging, potential data leakage

**Current:**
```typescript
console.error('Failed to upload:', error);  // May leak sensitive data
```

**Solution:**
```typescript
logger.error('Failed to upload', { 
  errorCode: error.code,
  // Sensitive data automatically redacted
});
```

**Impact:** High - Security and debugging  
**Effort:** Low - 2-3 hours  
**Files:** All components with console.log/error

#### 1.3 Consolidate AI Services

**Problem:** Multiple service files (ai.ts, ai-core.ts, gemini.ts) causing confusion

**Solution:**
- Keep `ai-core.ts` as primary service
- Deprecate `gemini.ts` (legacy)
- Remove `ai.ts` (unused)
- Update all imports

**Impact:** Medium - Code clarity  
**Effort:** Low - 2-3 hours  
**Files:** `services/`, update all feature imports

### Priority 2: High (v0.1.0 - v1.0)

#### 2.1 Extract Magic Numbers to Constants

**Problem:** Hardcoded values throughout codebase

**Solution:**
```typescript
// shared/constants/api.ts
export const API_TIMEOUTS = {
  DEFAULT: 30000,
  IMAGE_GENERATION: 60000,
  THINKING_MODE: 120000,
} as const;

// shared/constants/limits.ts
export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024,  // 10MB
  MAX_DIMENSION: 4096,
  ALLOWED_TYPES: ['image/png', 'image/jpeg', 'image/webp'],
} as const;
```

**Impact:** Medium - Maintainability  
**Effort:** Low - 4-6 hours  
**Files:** Create `shared/constants/`, update all features

#### 2.2 Implement Request Deduplication

**Problem:** Multiple identical requests can be sent simultaneously

**Solution:**
```typescript
class RequestDeduplicator {
  private pending = new Map<string, Promise<any>>();
  
  async deduplicate<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // Return existing promise if already pending
    if (this.pending.has(key)) {
      return this.pending.get(key) as Promise<T>;
    }
    
    // Create new promise
    const promise = fn().finally(() => {
      this.pending.delete(key);
    });
    
    this.pending.set(key, promise);
    return promise;
  }
}
```

**Impact:** Medium - Performance and cost  
**Effort:** Medium - 1 day  
**Files:** `shared/utils/request.ts`, integrate in `ai-core.ts`

#### 2.3 Add Request Cancellation

**Problem:** No way to cancel in-progress AI requests

**Solution:**
```typescript
const useGeneration = () => {
  const abortControllerRef = useRef<AbortController>();
  
  const generate = async (prompt: string) => {
    // Cancel previous request
    abortControllerRef.current?.abort();
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    try {
      const result = await aiCore.generate(prompt, images, {
        signal: abortControllerRef.current.signal
      });
      return result;
    } catch (error) {
      if (error.name === 'AbortError') {
        // Request was cancelled
        return null;
      }
      throw error;
    }
  };
  
  const cancel = () => {
    abortControllerRef.current?.abort();
  };
  
  return { generate, cancel };
};
```

**Impact:** High - User experience  
**Effort:** Medium - 2 days  
**Files:** All hooks with AI requests, update `ai-core.ts`

### Priority 3: Medium (v1.0+)

#### 3.1 Implement Undo/Redo

**Pattern:** Command pattern with history stack

```typescript
interface Command {
  execute(): void;
  undo(): void;
}

class History {
  private past: Command[] = [];
  private future: Command[] = [];
  
  execute(command: Command) {
    command.execute();
    this.past.push(command);
    this.future = []; // Clear redo stack
  }
  
  undo() {
    const command = this.past.pop();
    if (command) {
      command.undo();
      this.future.push(command);
    }
  }
  
  redo() {
    const command = this.future.pop();
    if (command) {
      command.execute();
      this.past.push(command);
    }
  }
}
```

**Impact:** High - User experience  
**Effort:** High - 1-2 weeks  
**Files:** New `shared/utils/history.ts`, integrate in Editor/Merch hooks

#### 3.2 Add Internationalization (i18n)

**Library:** `react-i18next`

```typescript
// i18n/en.json
{
  "editor": {
    "title": "Creative Editor",
    "upload": "Upload Image",
    "generate": "Generate"
  }
}

// Component usage
import { useTranslation } from 'react-i18next';

const Editor = () => {
  const { t } = useTranslation();
  return <h1>{t('editor.title')}</h1>;
};
```

**Impact:** High - Market expansion  
**Effort:** High - 2-3 weeks  
**Files:** Create `i18n/`, update all components

#### 3.3 Backend API Migration

**Goal:** Move to server-side architecture for better security and features

**Phase 1: Hybrid (v1.1)**
- Backend for key storage
- Backend for rate limiting
- Frontend keeps AI direct calls

**Phase 2: Full (v2.0)**
- All AI calls through backend
- Database for user projects
- WebSocket for real-time features

**Impact:** Critical - Production readiness  
**Effort:** Very High - 3-4 months  
**Technology:** Node.js + Express + PostgreSQL

---

## Decision Log

### Why No Redux?
**Date:** 2024-12-29  
**Decision:** Use local state with custom hooks  
**Rationale:** Current app complexity doesn't justify Redux overhead. Local state is simpler, faster, and easier to understand. Will re-evaluate if we add user authentication or real-time collaboration.

### Why Vite Over Webpack?
**Date:** Project inception  
**Decision:** Use Vite for build tooling  
**Rationale:** Faster builds (3.19s vs ~30s), better DX with HMR, simpler configuration, modern defaults.

### Why Three.js for 3D?
**Date:** Merch Studio development  
**Decision:** Use Three.js + @react-three/fiber  
**Rationale:** Industry standard, excellent documentation, React integration via fiber, large community.

### Why TypeScript Strict Mode?
**Date:** Project inception  
**Decision:** Enable TypeScript strict mode  
**Rationale:** Catch bugs at compile time, better IDE support, self-documenting code, forces thoughtful design.

---

**Last Updated:** 2024-12-29  
**Maintainer:** NanoGen Engineering Team  
**Related Docs:** [README.md](./README.md), [ROADMAP.md](./ROADMAP.md), [agents.md](./agents.md)