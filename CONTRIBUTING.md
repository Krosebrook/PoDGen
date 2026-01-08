# Contributing to NanoGen Studio

First off, thank you for considering contributing to NanoGen Studio! It's people like you that make this project a great tool for the community.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [How to Contribute](#how-to-contribute)
5. [Coding Standards](#coding-standards)
6. [Testing Guidelines](#testing-guidelines)
7. [Pull Request Process](#pull-request-process)
8. [Reporting Bugs](#reporting-bugs)
9. [Suggesting Features](#suggesting-features)
10. [Community](#community)

---

## Code of Conduct

This project adheres to a code of conduct adapted from the [Contributor Covenant](https://www.contributor-covenant.org/). By participating, you are expected to uphold this code.

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. We pledge to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or personal attacks
- Trolling, insulting/derogatory comments
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** 20.x or higher
- **Git** for version control
- **A code editor** (VS Code recommended)
- **Basic knowledge** of React, TypeScript, and Tailwind CSS

### Understanding the Codebase

1. Read the [README.md](./README.md) for project overview
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md) to understand design patterns
3. Check [AGENTS.md](./AGENTS.md) for AI integration details
4. Familiarize yourself with [GEMINI.md](./GEMINI.md) for API specifics

---

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/PoDGen.git
cd PoDGen

# Add upstream remote
git remote add upstream https://github.com/Krosebrook/PoDGen.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your Gemini API key
# Get a key from: https://aistudio.google.com/app/apikey
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app running.

### 5. Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

---

## How to Contribute

### Types of Contributions

We welcome many types of contributions:

- **Bug fixes** - Found a bug? Submit a PR with a fix!
- **New features** - Have an idea? Discuss it first, then implement
- **Documentation** - Improve or expand our docs
- **Tests** - Add tests to improve coverage
- **Performance** - Optimize code or bundle size
- **Accessibility** - Enhance a11y features
- **UI/UX** - Improve user interface or experience

### Before You Start

1. **Check existing issues** - Someone might already be working on it
2. **Create an issue** - Discuss your idea before major changes
3. **Get feedback** - Wait for maintainer approval on new features
4. **Small PRs** - Break large changes into smaller, focused PRs

---

## Coding Standards

### TypeScript

```typescript
// ✅ DO: Use explicit types
function processImage(url: string): Promise<string> {
  // ...
}

// ❌ DON'T: Use 'any' without justification
function processImage(url: any): any {
  // ...
}

// ✅ DO: Use interfaces for object shapes
interface ImageConfig {
  url: string;
  width: number;
  height: number;
}

// ✅ DO: Export types
export type { ImageConfig };
```

### React Components

```typescript
// ✅ DO: Function components with explicit props interface
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary' 
}) => {
  return (
    <button onClick={onClick} className={`btn-${variant}`}>
      {children}
    </button>
  );
};

// ❌ DON'T: Use class components
class Button extends React.Component {
  // ...
}
```

### Custom Hooks

```typescript
// ✅ DO: Start hook names with 'use'
export function useImageUpload() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const upload = useCallback(async (file: File) => {
    // ...
  }, []);
  
  return { image, loading, upload };
}
```

### Styling

```typescript
// ✅ DO: Use Tailwind utility classes
<div className="flex items-center gap-4 p-4 bg-slate-800 rounded-lg">
  {/* content */}
</div>

// ✅ DO: Mobile-first responsive design
<div className="text-sm md:text-base lg:text-lg">
  {/* content */}
</div>

// ❌ DON'T: Inline styles unless necessary
<div style={{ margin: '10px', padding: '20px' }}>
  {/* content */}
</div>
```

### File Organization

```
src/
├── features/              # Feature-based modules
│   ├── editor/
│   │   ├── components/   # Feature-specific components
│   │   ├── hooks/        # Feature-specific hooks
│   │   ├── types.ts      # Feature-specific types
│   │   └── index.ts      # Public API
│   └── merch/
│       └── ...
├── shared/               # Cross-feature code
│   ├── components/ui/   # Reusable UI components
│   ├── hooks/           # Shared hooks
│   ├── utils/           # Pure utility functions
│   ├── types/           # Shared TypeScript types
│   └── constants/       # Application constants
└── services/            # Infrastructure layer
    └── ai-core.ts       # AI service
```

### Naming Conventions

- **Files**: PascalCase for components (`Button.tsx`), camelCase for utilities (`formatDate.ts`)
- **Components**: PascalCase (`ImageEditor`, `MerchStudio`)
- **Hooks**: camelCase with 'use' prefix (`useGenAI`, `useImageUpload`)
- **Utilities**: camelCase (`formatBytes`, `validateImage`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`, `DEFAULT_MODEL`)
- **Types/Interfaces**: PascalCase (`ImageData`, `ApiResponse`)

### Error Handling

```typescript
// ✅ DO: Use typed errors
import { AppError, ApiError } from '@/shared/utils/errors';

try {
  await apiCall();
} catch (error) {
  if (error instanceof ApiError) {
    logger.error('API call failed', error);
    throw error;
  }
  throw new AppError('Unexpected error', error);
}

// ✅ DO: Use logger instead of console
import { logger } from '@/shared/utils/logger';

logger.info('Operation started');
logger.error('Operation failed', error);

// ❌ DON'T: Use console.log in production code
console.log('Debug info');  // Only in development/debugging
```

### Accessibility

```typescript
// ✅ DO: Include ARIA attributes
<button
  aria-label="Upload image"
  aria-describedby="upload-help"
>
  Upload
</button>

// ✅ DO: Use semantic HTML
<main role="main">
  <nav role="navigation">
    {/* ... */}
  </nav>
</main>

// ✅ DO: Provide keyboard navigation
<div 
  role="button"
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</div>
```

---

## Testing Guidelines

### Test Framework

NanoGen Studio uses **Vitest** for testing, which provides:
- Fast, Vite-native test execution
- React Testing Library integration
- MSW (Mock Service Worker) for API mocking
- Full TypeScript support
- Coverage reporting with v8

### Test Structure

Tests should be co-located with the source files they test:

```
src/
├── shared/
│   └── utils/
│       ├── errors.ts
│       ├── errors.test.ts  ← Test file
│       ├── image.ts
│       └── image.test.ts   ← Test file
```

#### Example: Unit Test

```typescript
// errors.test.ts
import { describe, it, expect } from 'vitest';
import { ValidationError } from './errors';

describe('ValidationError', () => {
  it('should create error with correct properties', () => {
    const error = new ValidationError('Invalid input');
    
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe('Invalid input');
    expect(error.statusCode).toBe(400);
  });
});
```

#### Example: Component Test

```typescript
// Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button onClick={() => {}}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click</Button>);
    await user.click(screen.getByText('Click'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### Example: API Mocking with MSW

```typescript
// api.test.ts
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/tests/mocks/server';

describe('AI API Integration', () => {
  it('handles successful response', async () => {
    server.use(
      http.post('https://api.example.com/generate', () => {
        return HttpResponse.json({ result: 'success' });
      })
    );
    
    // Test your API call here
  });
  
  it('handles error response', async () => {
    server.use(
      http.post('https://api.example.com/generate', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );
    
    // Test error handling
  });
});
```

### Test Utilities

Use the test utilities from `/tests/utils.tsx`:

```typescript
import { render, createMockImageFile, waitFor } from '@/tests/utils';

// Create mock files for testing
const mockImage = createMockImageFile('test.png', 100, 100);

// Custom render with providers (if needed)
render(<MyComponent />);

// Wait for async conditions
await waitFor(() => someCondition === true);
```

### Coverage Requirements

- **Critical paths**: 80%+ coverage (AI core, error handling, image processing)
- **Utilities**: 90%+ coverage (pure functions, helpers)
- **UI components**: 60%+ coverage (user interactions, rendering)
- **Overall project**: 70%+ coverage (target for v1.0.0)

**Current Coverage:** 41.93% overall (v0.1.0 - Foundation)

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with interactive UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run specific test file
npx vitest shared/utils/errors.test.ts
```

### Best Practices

1. **Write Descriptive Test Names**
   ```typescript
   // ✅ Good
   it('should throw ValidationError when email is invalid', () => {});
   
   // ❌ Bad
   it('test email', () => {});
   ```

2. **Test Behavior, Not Implementation**
   ```typescript
   // ✅ Good - Tests what user sees
   expect(screen.getByText('Loading...')).toBeInTheDocument();
   
   // ❌ Bad - Tests internal state
   expect(component.state.isLoading).toBe(true);
   ```

3. **Use Appropriate Matchers**
   ```typescript
   // ✅ Good
   expect(result).toBe(true);
   expect(array).toHaveLength(3);
   expect(error).toBeInstanceOf(ValidationError);
   
   // ❌ Bad
   expect(result === true).toBe(true);
   ```

4. **Clean Up After Tests**
   ```typescript
   import { afterEach, vi } from 'vitest';
   
   afterEach(() => {
     vi.clearAllMocks();
   });
   ```

5. **Test Edge Cases**
   - Empty strings
   - Null/undefined values
   - Boundary conditions
   - Error states
   - Async operations

---

## Pull Request Process

### 1. Create a Branch

```bash
# Update your fork
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### Branch Naming

- **Features**: `feature/add-video-export`
- **Fixes**: `fix/image-upload-bug`
- **Docs**: `docs/update-readme`
- **Refactor**: `refactor/extract-constants`
- **Tests**: `test/add-editor-tests`

### 2. Make Changes

- Write clean, documented code
- Follow coding standards
- Add tests for new features
- Update documentation

### 3. Commit Your Changes

```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: Add video export functionality

- Implement video generation with Veo 3.1
- Add export controls to UI
- Update documentation"
```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(editor): Add undo/redo functionality
fix(merch): Resolve logo scaling issue
docs(readme): Update installation instructions
refactor(ai-core): Extract retry logic to separate function
test(utils): Add tests for image validation
```

### 4. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 5. Create Pull Request

1. Go to the original repository on GitHub
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill out the PR template:
   - Clear description of changes
   - Link to related issues
   - Screenshots (for UI changes)
   - Test results
5. Submit the PR

### PR Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Related Issues
Fixes #123
Related to #456

## Changes Made
- Specific change 1
- Specific change 2
- Specific change 3

## Testing
- [ ] All existing tests pass
- [ ] New tests added
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

### 6. Code Review

- Address reviewer feedback promptly
- Be open to suggestions
- Update PR as requested
- Keep discussion professional and constructive

### 7. Merge

Once approved:
- Maintainers will merge your PR
- Your branch will be deleted
- Changes will be included in next release

---

## Reporting Bugs

### Before Submitting

1. **Check existing issues** - Bug might already be reported
2. **Update to latest** - Bug might be fixed in newer version
3. **Reproduce reliably** - Ensure bug is consistent

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. macOS 13.0]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 0.1.0]

**Additional context**
Add any other context about the problem here.
```

---

## Suggesting Features

### Before Suggesting

1. **Check roadmap** - Feature might be planned
2. **Search issues** - Someone might have suggested it
3. **Consider scope** - Does it align with project goals?

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
Other approaches you've thought about.

**Additional context**
Add any other context or screenshots about the feature request.

**Would you be willing to implement this?**
[ ] Yes
[ ] No
[ ] Need guidance
```

---

## Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Requests**: Code contributions

### Getting Help

- Check [README.md](./README.md) for basic info
- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Review [GEMINI.md](./GEMINI.md) for API details
- Search existing issues for solutions

### Recognition

Contributors will be:
- Listed in [Contributors](https://github.com/Krosebrook/PoDGen/graphs/contributors)
- Mentioned in release notes (for significant contributions)
- Credited in CHANGELOG.md

---

## License

By contributing to NanoGen Studio, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

---

## Questions?

If you have questions about contributing, feel free to:
- Open a discussion on GitHub
- Comment on relevant issues
- Reach out to maintainers

Thank you for contributing to NanoGen Studio! 🎉

---

**Last Updated:** December 30, 2024  
**Next Review:** After v1.0.0 release
