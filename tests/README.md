# Test Infrastructure

This directory contains the testing infrastructure for NanoGen Studio.

## Structure

```
tests/
├── setup.ts           # Global test setup (MSW, environment)
├── utils.tsx          # Test utilities and helpers
└── mocks/
    ├── handlers.ts    # MSW request handlers
    └── server.ts      # MSW server configuration
```

## Files

### `setup.ts`
Global test setup that runs before all tests:
- Initializes Mock Service Worker (MSW)
- Sets up test environment variables
- Configures @testing-library/jest-dom matchers

### `utils.tsx`
Reusable test utilities:
- `customRender()` - Render with providers
- `waitFor()` - Wait for async conditions
- `createMockFile()` - Create mock File objects
- `createMockImageFile()` - Create mock image files
- `suppressConsole()` - Suppress console output in tests

### `mocks/handlers.ts`
MSW request handlers for mocking API calls:
- Gemini API successful responses
- Gemini API error responses (rate limit, auth, safety)
- Image generation responses

### `mocks/server.ts`
MSW server setup for Node.js test environment

## Usage

### Writing Tests

Tests should be co-located with source files:

```
src/
├── shared/
│   └── utils/
│       ├── errors.ts
│       └── errors.test.ts  ← Test file here
```

### Import Test Utilities

```typescript
import { render, screen, waitFor } from '@/tests/utils';
import { createMockImageFile } from '@/tests/utils';
```

### Mock API Calls

MSW automatically intercepts network requests. Add custom handlers:

```typescript
import { http, HttpResponse } from 'msw';
import { server } from '@/tests/mocks/server';

test('custom API behavior', () => {
  server.use(
    http.post('https://api.example.com/*', () => {
      return HttpResponse.json({ custom: 'response' });
    })
  );
  
  // Your test code
});
```

## Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With UI
npm run test:ui

# With coverage
npm run test:coverage
```

## Best Practices

1. **Co-locate tests** with source files
2. **Use descriptive test names** that explain expected behavior
3. **Test behavior, not implementation** details
4. **Clean up** after tests with `afterEach()`
5. **Mock external dependencies** using MSW
6. **Use test utilities** from this directory for consistency

## Coverage Goals

- **Critical paths:** 80%+ (AI core, error handling)
- **Utilities:** 90%+ (pure functions)
- **UI components:** 60%+ (user interactions)
- **Overall project:** 70%+ (target for v1.0.0)

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [MSW Documentation](https://mswjs.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
