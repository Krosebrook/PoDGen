# GitHub Copilot Instructions for NanoGen Studio

## Project Context

NanoGen Studio is an AI-native creative suite for rapid product visualization and image synthesis. 
It's a single-page application built with modern web technologies to provide a professional-grade 
editing experience powered by Google's Gemini 2.5 Flash Image model.

## Tech Stack

- **Frontend Framework:** React 19 (with Concurrent Mode features)
- **Language:** TypeScript 5.8+ (strict mode enabled)
- **Build Tool:** Vite 6.2+
- **Styling:** Tailwind CSS 3.4 (utility-first approach)
- **AI Integration:** @google/genai SDK v1.30+ (Google Gemini API)
- **State Management:** Custom hooks with AbortController synchronization
- **3D Rendering:** Three.js with @react-three/fiber (for advanced visualizations)

## Architecture Patterns

### Feature-Based Module Structure
Organize all feature code in `/features/[feature-name]` with:
- Components specific to that feature
- Feature-specific hooks
- Feature-specific types and utilities
- Clear public API (index.ts exports)

### Shared Code Organization
Place reusable code in `/shared/`:
- `/shared/components/ui/` - Atomic design system components
- `/shared/hooks/` - Cross-feature hooks
- `/shared/utils/` - Pure utility functions
- `/shared/types/` - Shared TypeScript types

### Services Layer
Infrastructure and external integrations in `/services/`:
- Stateless service initialization (don't cache clients)
- Comprehensive error handling with user-friendly messages
- AbortController support for long-running operations

## Coding Standards

### TypeScript Guidelines
1. **Strict Types:** Always use explicit types, avoid `any`
2. **Interfaces over Types:** Prefer `interface` for object shapes (extendable)
3. **Generics:** Use for reusable components and utilities
4. **Type Guards:** Create runtime validation for external data
5. **Branded Types:** Use for distinct ID types (e.g., `type ImageId = string & { __brand: 'ImageId' }`)

### React Patterns
1. **Function Components:** Always use function components (no class components)
2. **Custom Hooks:** Extract reusable logic into hooks with clear naming (use*)
3. **Error Boundaries:** Wrap feature modules in error boundaries
4. **Suspense:** Use React.Suspense for code splitting and loading states
5. **Refs:** Use useRef for DOM access, avoid string refs
6. **Memoization:** Use useMemo/useCallback only when measurable performance benefit

### Component Design
1. **Atomic Design:** Follow atomic design principles (atoms → molecules → organisms)
2. **Props Interface:** Always define explicit TypeScript interface for props
3. **Composition:** Prefer composition over prop drilling (use Context/children patterns)
4. **Accessibility:** Include ARIA attributes, keyboard navigation, semantic HTML
5. **Testing:** Co-locate tests with components (ComponentName.test.tsx)

### Styling Conventions
1. **Tailwind First:** Use Tailwind utility classes for styling
2. **Custom CSS:** Only when Tailwind utilities insufficient (use CSS modules)
3. **Responsive:** Mobile-first responsive design (sm: md: lg: xl: breakpoints)
4. **Dark Mode:** Consider dark mode color variants (dark:)
5. **Animations:** Use Tailwind transitions, CSS animations for complex effects

### AI Integration Best Practices
1. **API Keys:** Never hardcode keys, always use process.env.VITE_GEMINI_API_KEY
2. **Error Handling:** Graceful degradation when AI calls fail
3. **Loading States:** Show progress for long-running AI operations
4. **Abort Support:** Allow users to cancel in-progress generations
5. **Token Budgets:** Respect model token limits and thinking budgets
6. **Safety Filtering:** Handle content safety blocks gracefully

### Naming Conventions
- **Files:** PascalCase for components (Button.tsx), camelCase for utilities (file.ts)
- **Components:** PascalCase (ImageEditor, MerchStudio)
- **Hooks:** camelCase with 'use' prefix (useGenAI, useImageUpload)
- **Utilities:** camelCase (formatBytes, validateImage)
- **Constants:** UPPER_SNAKE_CASE (MAX_FILE_SIZE, DEFAULT_MODEL)
- **Types/Interfaces:** PascalCase (ImageData, ApiResponse)

### Performance Considerations
1. **Code Splitting:** Lazy load feature modules (React.lazy)
2. **Image Optimization:** Compress images, use appropriate formats
3. **Bundle Size:** Monitor and minimize bundle size (use vite-bundle-visualizer)
4. **Virtualization:** Use virtualization for long lists
5. **Debouncing:** Debounce expensive operations (search, API calls)

### Security Practices
1. **Input Validation:** Validate all user inputs (file size, type, content)
2. **XSS Prevention:** Sanitize user-generated content before display
3. **CSRF Protection:** Use tokens for state-changing operations
4. **API Security:** Store credentials in localStorage only, never in code
5. **Content Policy:** Respect Google AI content policies

### Testing Requirements
- **Unit Tests:** Test pure functions and isolated components
- **Integration Tests:** Test feature workflows
- **E2E Tests:** Test critical user journeys
- **Accessibility Tests:** Use jest-axe for automated a11y testing
- **Coverage:** Aim for 80%+ code coverage
- **Mocking:** Mock AI API calls in tests (use MSW)

## Common Patterns

### Custom Hook Template
\`\`\`typescript
import { useState, useEffect } from 'react';

export function useFeature() {
  const [state, setState] = useState<Type>(initialValue);
  
  useEffect(() => {
    // Setup logic with cleanup
    return () => {
      // Cleanup logic
    };
  }, []);
  
  return { state, actions };
}
\`\`\`

### Component Template
\`\`\`typescript
import { type FC } from 'react';

interface ComponentNameProps {
  // Props with JSDoc
  /** Description */
  propName: string;
}

export const ComponentName: FC<ComponentNameProps> = ({ propName }) => {
  // Component logic
  
  return (
    <div className="tailwind-classes">
      {/* JSX */}
    </div>
  );
};
\`\`\`

### Service Template
\`\`\`typescript
interface ServiceConfig {
  apiKey: string;
  // Other config
}

export class ServiceName {
  private config: ServiceConfig;
  
  constructor(config: ServiceConfig) {
    this.config = config;
  }
  
  async operation(): Promise<Result> {
    try {
      // Implementation
    } catch (error) {
      // Error handling
      throw new ServiceError('User-friendly message', error);
    }
  }
}
\`\`\`

## When to Ask for Clarification
- Business logic decisions (feature behavior)
- UX/UI design choices not specified
- External API integration details
- Security-sensitive implementations
- Breaking changes to public APIs

## Priorities
1. **Correctness:** Code must work correctly first
2. **Type Safety:** Leverage TypeScript for compile-time safety
3. **Accessibility:** WCAG 2.1 AA compliance is mandatory
4. **Performance:** Optimize for perceived performance (loading states)
5. **Maintainability:** Write clear, documented code
6. **Security:** Never compromise on security

## Project-Specific Context
- This is a creative tool, so visual feedback is critical
- AI operations can be slow - always show progress
- Users may upload sensitive images - respect privacy
- The canvas is the primary UX - optimize for it
- Errors should be actionable, not technical

## Getting Help
- Check ARCHITECTURE.md for system design decisions
- Refer to feature-specific README files
- Review existing patterns in similar components
- Consult TypeScript types for API contracts
