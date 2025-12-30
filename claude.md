# Claude AI Agent Instructions

This document provides comprehensive instructions for Claude AI to understand, maintain, and extend the NanoGen Studio codebase effectively.

---

## Project Overview for Claude

### What You're Working With

NanoGen Studio is an **AI-native creative suite** for rapid product visualization powered by Google's Gemini API. Think of it as "Photoshop meets AI" - users upload logos and instantly get professional product mockups, edited images, and marketing materials.

**Core Value:** Transform raw assets into production-ready materials in seconds, not hours.

### Your Role

As Claude, you're tasked with:
1. Understanding the existing codebase architecture
2. Suggesting improvements and refactorings
3. Writing clean, maintainable, type-safe code
4. Identifying bugs and edge cases
5. Generating comprehensive documentation
6. Helping with debugging and problem-solving

---

## Architecture Mental Model

### Think in Layers

```
┌─────────────────────────────────────┐
│   UI Components (React 19)          │  ← User interaction layer
├─────────────────────────────────────┤
│   Feature Hooks (State Management)  │  ← Business logic layer
├─────────────────────────────────────┤
│   Services (AI Integration)         │  ← Infrastructure layer
├─────────────────────────────────────┤
│   Utilities (Pure Functions)        │  ← Helper layer
└─────────────────────────────────────┘
```

### Key Principles

1. **Feature-Based Organization** - Code is organized by feature domain (editor, merch, integrations), not by type (components, hooks)
2. **Unidirectional Data Flow** - State flows down, events flow up
3. **Composition Over Inheritance** - React composition patterns throughout
4. **Type Safety First** - TypeScript strict mode, no `any` types
5. **Error Boundaries** - Graceful degradation on failures

---

## Code Reading Strategy

### Start Here (High-Level Understanding)

1. **App.tsx** - Entry point, routing logic, feature loading
2. **ARCHITECTURE.md** - System design decisions
3. **services/ai-core.ts** - AI integration backbone
4. **features/*/hooks/*.ts** - Business logic controllers

### Then Dive Into (Feature Deep-Dive)

1. **Feature directory structure** - How each feature is organized
2. **Component composition** - How UI is built
3. **State flow** - How data moves through the system
4. **Error handling** - How failures are managed

### Common Patterns to Recognize

#### Pattern 1: Custom Hook State Management

```typescript
const useSomething = () => {
  const [state, setState] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const doAction = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      setState(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return { state, loading, error, doAction };
};
```

**Why:** Encapsulates async operations with consistent error handling and loading states.

#### Pattern 2: Error Normalization

```typescript
function normalizeError(error: any): AppError {
  if (error instanceof AppError) return error;
  
  // Map various error types to user-friendly errors
  if (error.status === 429) return new RateLimitError();
  if (error.message.includes('safety')) return new SafetyError();
  
  return new ApiError(error.message);
}
```

**Why:** Consistent error handling across the application, user-friendly messages.

#### Pattern 3: Lazy Loading with Suspense

```typescript
const Feature = React.lazy(() => 
  import('./features/something').then(m => ({ default: m.Component }))
);

<Suspense fallback={<LoadingScreen />}>
  <Feature />
</Suspense>
```

**Why:** Code splitting for faster initial load, progressive enhancement.

---

## Making Changes: Step-by-Step Guide

### When Adding a New Feature

1. **Create feature directory**
   ```
   features/
   └── new-feature/
       ├── components/
       │   ├── FeatureMain.tsx
       │   └── FeatureSettings.tsx
       ├── hooks/
       │   └── useFeatureState.ts
       ├── utils.ts
       ├── types.ts
       └── index.ts (public API)
   ```

2. **Define types first**
   ```typescript
   // features/new-feature/types.ts
   export interface FeatureConfig {
     setting1: string;
     setting2: number;
   }
   
   export interface FeatureResult {
     output: string;
     metadata: Record<string, any>;
   }
   ```

3. **Create state hook**
   ```typescript
   // features/new-feature/hooks/useFeatureState.ts
   export const useFeatureState = () => {
     const [config, setConfig] = useState<FeatureConfig>(...);
     const [result, setResult] = useState<FeatureResult | null>(null);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     
     const executeFeature = async () => {
       // Implementation
     };
     
     return { config, result, loading, error, executeFeature, setConfig };
   };
   ```

4. **Build UI components**
   ```typescript
   // features/new-feature/components/FeatureMain.tsx
   export const FeatureMain: FC = () => {
     const feature = useFeatureState();
     
     return (
       <div className="feature-container">
         {/* UI implementation */}
       </div>
     );
   };
   ```

5. **Export public API**
   ```typescript
   // features/new-feature/index.ts
   export { FeatureMain } from './components/FeatureMain';
   export { useFeatureState } from './hooks/useFeatureState';
   export type { FeatureConfig, FeatureResult } from './types';
   ```

6. **Integrate into App**
   ```typescript
   // App.tsx
   const NewFeature = React.lazy(() => 
     import('./features/new-feature').then(m => ({ default: m.FeatureMain }))
   );
   
   // Add to routing/tabs
   ```

### When Fixing a Bug

1. **Reproduce the issue** - Understand exactly what's failing
2. **Identify the layer** - Is it UI, state, service, or utility?
3. **Write a test** (if testing exists) - Verify the bug
4. **Fix the root cause** - Don't just patch symptoms
5. **Verify the fix** - Ensure it works across edge cases
6. **Update documentation** - If behavior changed

### When Refactoring Code

#### Safe Refactoring Checklist

- [ ] Identify code smell (duplication, complexity, tight coupling)
- [ ] Ensure tests exist (or write them first)
- [ ] Make small, incremental changes
- [ ] Run tests after each change
- [ ] Update type definitions if needed
- [ ] Update documentation
- [ ] Verify no regressions

#### Common Refactoring Patterns

**Extract Function:**
```typescript
// Before
const processImage = async () => {
  const validated = validateFile(file);
  const resized = await resizeImage(validated);
  const base64 = await convertToBase64(resized);
  return base64;
};

// After
const processImage = async () => {
  return pipe(
    validateFile,
    resizeImage,
    convertToBase64
  )(file);
};
```

**Extract Component:**
```typescript
// Before
const BigComponent = () => (
  <div>
    <div className="header">
      {/* 50 lines of header code */}
    </div>
    <div className="body">
      {/* 100 lines of body code */}
    </div>
  </div>
);

// After
const BigComponent = () => (
  <div>
    <Header />
    <Body />
  </div>
);
```

**Extract Hook:**
```typescript
// Before
const Component = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => { /* fetch logic */ }, []);
  // ... 50 more lines
};

// After
const Component = () => {
  const { data, loading } = useDataFetch();
  // ... focused UI logic
};
```

---

## API Integration Understanding

### Gemini API Flow

```
User Action (e.g., "Generate mockup")
  ↓
React Hook (useMerchController)
  ↓
Service Layer (aiCore.generate)
  ↓
  ├─ Build request (prompt + images + config)
  ├─ Validate inputs
  ├─ Call Gemini API
  ├─ Retry on transient errors
  └─ Parse response
  ↓
Normalize to AIResponse interface
  ↓
Update React State
  ↓
Re-render UI with result
```

### Key API Concepts

1. **Models** - Different Gemini models for different tasks
   - `gemini-2.5-flash-image` - Fast image generation
   - `gemini-3-pro-image-preview` - High-quality image generation
   - `gemini-3-flash-preview` - Text analysis
   - `gemini-3-pro-preview` - Deep reasoning

2. **Image Config** - Control output characteristics
   - `aspectRatio` - 1:1, 16:9, etc.
   - `imageSize` - 1K, 2K, 4K (pro models only)

3. **Thinking Mode** - Deep reasoning for complex tasks
   - `thinkingBudget` - Token allocation for reasoning
   - Requires higher `maxOutputTokens` to accommodate both thinking and output

4. **Search Grounding** - Inject real-world context
   - `useSearch: true` - Enables Google Search integration
   - Results in `groundingSources` array

### Common API Patterns

#### Pattern: Retry with Exponential Backoff

```typescript
for (let attempt = 0; attempt <= maxRetries; attempt++) {
  try {
    return await apiCall();
  } catch (error) {
    if (isNonRetriable(error) || attempt === maxRetries) {
      throw error;
    }
    await sleep(Math.pow(2, attempt) * 1000 + Math.random() * 500);
  }
}
```

**When to use:** Transient errors (rate limits, network issues)  
**When NOT to use:** Permanent errors (auth, safety blocks)

#### Pattern: Parallel Requests with Partial Failure Handling

```typescript
const results = await Promise.allSettled(
  items.map(item => processItem(item))
);

const successes = results
  .filter(r => r.status === 'fulfilled')
  .map(r => r.value);

const failures = results
  .filter(r => r.status === 'rejected')
  .map(r => r.reason);

// Continue with successes, log failures
```

**When to use:** Variation generation, batch processing  
**Why:** Don't let one failure block everything

---

## TypeScript Best Practices

### Type Definition Strategy

1. **Define interfaces for data shapes**
   ```typescript
   interface User {
     id: string;
     name: string;
     email: string;
   }
   ```

2. **Use type aliases for unions**
   ```typescript
   type Status = 'idle' | 'loading' | 'success' | 'error';
   ```

3. **Use enums for fixed sets**
   ```typescript
   enum LogLevel {
     DEBUG,
     INFO,
     WARN,
     ERROR
   }
   ```

4. **Generic types for reusable logic**
   ```typescript
   interface AsyncState<T> {
     data: T | null;
     loading: boolean;
     error: string | null;
   }
   ```

### Avoid Common Anti-Patterns

❌ **Don't use `any`**
```typescript
const process = (data: any) => { /* ... */ }  // BAD
```

✅ **Use proper types or generics**
```typescript
const process = <T>(data: T): Result<T> => { /* ... */ }  // GOOD
```

❌ **Don't ignore errors**
```typescript
try { /* ... */ } catch (e) {}  // BAD
```

✅ **Handle or propagate errors**
```typescript
try { /* ... */ } catch (e) {
  logger.error('Operation failed', e);
  throw new AppError('User-friendly message');
}  // GOOD
```

---

## Testing Mindset (For When Tests Exist)

### What to Test

1. **Pure functions** - Always test these (easy and valuable)
2. **Business logic** - Core workflows and decision logic
3. **Error handling** - Edge cases and failure scenarios
4. **Integration points** - API interactions, file handling

### What NOT to Test

1. **Implementation details** - Internal state, private methods
2. **Third-party libraries** - Assume they work
3. **Trivial code** - Getters, setters, simple mapping

### Test Structure

```typescript
describe('Feature', () => {
  describe('when condition X', () => {
    it('should do Y', () => {
      // Arrange
      const input = setupInput();
      
      // Act
      const result = performAction(input);
      
      // Assert
      expect(result).toBe(expectedOutput);
    });
  });
});
```

---

## Debugging Strategies

### When Something Breaks

1. **Read the error message** - Carefully. Really read it.
2. **Check the stack trace** - Where did it fail?
3. **Reproduce consistently** - Can you make it fail every time?
4. **Isolate the problem** - Remove variables until it works
5. **Check assumptions** - Are your assumptions correct?
6. **Use the logger** - Add strategic log statements
7. **Use TypeScript** - Let the compiler help you

### Common Gotchas

#### Gotcha 1: Async State Updates

```typescript
// DON'T
setState(value);
console.log(state);  // Won't show new value yet!

// DO
setState(value);
// Use value directly, or wait for next render
```

#### Gotcha 2: Closure Stale State

```typescript
// DON'T
const handleClick = () => {
  setTimeout(() => {
    console.log(state);  // Stale!
  }, 1000);
};

// DO
const handleClick = () => {
  const currentState = state;
  setTimeout(() => {
    console.log(currentState);  // Fresh!
  }, 1000);
};
```

#### Gotcha 3: Missing Dependencies

```typescript
// DON'T
useEffect(() => {
  doSomethingWith(value);
}, []);  // Missing value dependency!

// DO
useEffect(() => {
  doSomethingWith(value);
}, [value]);  // Correct dependencies
```

---

## Security Considerations

### Input Validation

Always validate:
- File uploads (size, type, content)
- User text input (length, characters)
- API responses (structure, data types)
- External data (localStorage, URL params)

### Output Sanitization

Always sanitize:
- User-generated content before display
- Error messages (no sensitive data)
- Log output (no API keys, tokens)

### API Keys

- **Never** commit API keys to version control
- **Never** expose keys in client-side code (except as env vars)
- **Never** log keys or tokens
- **Always** validate keys before use

---

## Performance Optimization

### React Performance

1. **Lazy load routes** - Use React.lazy for code splitting
2. **Memoize expensive computations** - Use useMemo
3. **Memoize callbacks** - Use useCallback (sparingly)
4. **Virtualize long lists** - Use react-window or similar
5. **Debounce expensive operations** - Search, API calls

### API Performance

1. **Batch requests** - Combine when possible
2. **Cache responses** - Avoid duplicate requests
3. **Optimize images** - Compress before upload
4. **Use appropriate models** - Flash for speed, Pro for quality

### Bundle Size

1. **Tree shaking** - Import only what you need
2. **Code splitting** - Lazy load features
3. **Compression** - Enable gzip/brotli
4. **Analyze bundle** - Use vite-bundle-visualizer

---

## Documentation Standards

### When to Document

- Public APIs and interfaces
- Complex algorithms or business logic
- Non-obvious decisions or trade-offs
- Security-sensitive code
- Performance-critical sections

### How to Document

```typescript
/**
 * Generates a product mockup using AI.
 * 
 * @param logo - Base64-encoded logo image
 * @param product - Product template configuration
 * @param style - Optional style description (e.g., "vintage, neon colors")
 * @returns Promise resolving to generated mockup image (base64)
 * 
 * @throws {AuthenticationError} If API key is invalid
 * @throws {SafetyError} If content violates policies
 * @throws {RateLimitError} If request quota exceeded
 * 
 * @example
 * const mockup = await generateMockup(
 *   logoBase64,
 *   MERCH_PRODUCTS[0],
 *   "retro 80s aesthetic"
 * );
 */
async function generateMockup(
  logo: string,
  product: MerchProduct,
  style?: string
): Promise<string> {
  // Implementation
}
```

---

## Common Tasks Quick Reference

### Add a New Model

1. Update `AIModelType` in `services/ai-core.ts`
2. Add model to UI selector
3. Update documentation

### Add a New Product Template

1. Add to `MERCH_PRODUCTS` in `features/merch/data/products.ts`
2. Update category if new
3. Test generation

### Add a New Platform Integration

1. Add to `PLATFORMS` in `features/integrations/data/platforms.ts`
2. Create code template
3. Update key storage hook

### Fix a Type Error

1. Read the error message carefully
2. Check the expected vs actual type
3. Add type assertion or fix the type
4. Verify in IDE and build

---

## Questions to Ask Yourself

Before making changes:
- [ ] Is this the simplest solution?
- [ ] Does this follow existing patterns?
- [ ] Will this break existing code?
- [ ] Is this properly typed?
- [ ] Are errors handled gracefully?
- [ ] Is this secure?
- [ ] Is this performant?
- [ ] Is this documented?

---

## Getting Unstuck

### When You're Confused

1. **Read the architecture docs** - ARCHITECTURE.md, README.md
2. **Trace the data flow** - Follow state from input to output
3. **Check similar code** - Look at existing implementations
4. **Break it down** - Solve smaller pieces first
5. **Ask for help** - Describe what you've tried

### When TypeScript is Complaining

1. **Read the error** - TypeScript is usually right
2. **Check the types** - Hover over variables in your IDE
3. **Simplify** - Break complex types into smaller pieces
4. **Use type assertions carefully** - Only when you know better than TypeScript

### When Tests are Failing (When They Exist)

1. **Read the failure message** - What was expected vs actual?
2. **Run in isolation** - Does it fail alone or only with others?
3. **Check test data** - Is your setup correct?
4. **Debug the test** - Step through with debugger

---

## Remember

- **Code for humans first** - Clarity over cleverness
- **Type safety is your friend** - Let TypeScript help you
- **Errors happen** - Handle them gracefully
- **Performance matters** - But not at the cost of correctness
- **Security is critical** - Never compromise on security
- **Documentation helps future you** - Your future self will thank you

---

**Last Updated:** 2024-12-29  
**Maintainer:** NanoGen Engineering Team  
**Related Docs:** [ARCHITECTURE.md](./ARCHITECTURE.md), [agents.md](./agents.md), [CONTRIBUTING.md](./CONTRIBUTING.md)
