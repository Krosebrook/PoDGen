# Contributing to NanoGen Studio

Thank you for your interest in contributing to NanoGen Studio! This document provides guidelines and instructions for contributing to the project.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Contributing Workflow](#contributing-workflow)
5. [Coding Standards](#coding-standards)
6. [Testing Guidelines](#testing-guidelines)
7. [Documentation](#documentation)
8. [Pull Request Process](#pull-request-process)
9. [Community](#community)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for everyone. We expect all participants to:

- Be respectful and inclusive
- Exercise empathy and kindness
- Give and receive constructive feedback gracefully
- Focus on what's best for the community
- Show courtesy and respect to others

### Unacceptable Behavior

- Harassment, discrimination, or intimidation
- Offensive comments or personal attacks
- Trolling or insulting/derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Violations of the Code of Conduct may result in temporary or permanent ban from the community. Report violations to the maintainers via GitHub Issues or private message.

---

## Getting Started

### What Can You Contribute?

1. **Code** - Bug fixes, new features, optimizations
2. **Documentation** - Guides, tutorials, API docs, translations
3. **Design** - UI/UX improvements, icons, graphics
4. **Testing** - Bug reports, edge cases, QA
5. **Templates** - Product templates, style presets
6. **Community** - Answer questions, help new users

### Good First Issues

Look for issues labeled:
- `good first issue` - Easy for newcomers
- `help wanted` - Community input needed
- `documentation` - Doc improvements
- `bug` - Confirmed bugs to fix

### Project Structure

```
nanogen-studio/
├── features/           # Feature modules
│   ├── editor/        # Creative Editor
│   ├── merch/         # Merch Studio
│   └── integrations/  # Integration Hub
├── shared/            # Shared utilities
│   ├── components/    # UI components
│   ├── hooks/         # Custom hooks
│   ├── utils/         # Helper functions
│   └── types/         # TypeScript types
├── services/          # External integrations
├── docs/              # Documentation
└── public/            # Static assets
```

---

## Development Setup

### Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher
- **Git** 2.x or higher
- **Google Gemini API Key** (get from https://aistudio.google.com/app/apikey)

### Installation Steps

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/PoDGen.git
   cd PoDGen
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Krosebrook/PoDGen.git
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your Gemini API key
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Verify setup**
   - Open http://localhost:5173
   - Try uploading an image
   - Generate a mockup

### Development Tools

**Recommended VS Code Extensions:**
- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)
- Tailwind CSS IntelliSense
- GitLens

**Optional but Helpful:**
- Error Lens (inline error display)
- Import Cost (bundle size awareness)
- Pretty TypeScript Errors

---

## Contributing Workflow

### 1. Create an Issue (Optional but Recommended)

Before starting work, create or comment on an issue to:
- Discuss your approach
- Get feedback from maintainers
- Avoid duplicate work
- Coordinate with others

### 2. Create a Branch

```bash
# Fetch latest changes
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch Naming:**
- `feature/` - New features (e.g., `feature/batch-processing`)
- `fix/` - Bug fixes (e.g., `fix/upload-validation`)
- `docs/` - Documentation (e.g., `docs/api-reference`)
- `refactor/` - Code refactoring (e.g., `refactor/error-handling`)
- `test/` - Test additions (e.g., `test/editor-hooks`)

### 3. Make Your Changes

**Follow these guidelines:**
- Write clean, readable code
- Follow existing patterns and conventions
- Add/update tests as needed
- Update documentation if behavior changes
- Keep commits focused and atomic

### 4. Test Your Changes

```bash
# Run type checking
npm run build

# Run tests (when available)
npm test

# Run linting (when available)
npm run lint

# Test in browser
npm run dev
```

### 5. Commit Your Changes

**Commit Message Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style (formatting, semicolons, etc.)
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Maintenance tasks

**Examples:**
```bash
git commit -m "feat(editor): add undo/redo functionality"
git commit -m "fix(merch): resolve text overlay positioning bug"
git commit -m "docs(readme): update installation instructions"
```

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 7. Create Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill out the PR template
4. Submit the PR

---

## Coding Standards

### TypeScript

#### Type Safety

```typescript
// ✅ DO: Use explicit types
function processImage(file: File): Promise<string> {
  // ...
}

// ❌ DON'T: Use any
function processImage(file: any): any {
  // ...
}
```

#### Interfaces vs Types

```typescript
// ✅ DO: Use interfaces for objects (extendable)
interface UserConfig {
  name: string;
  email: string;
}

// ✅ DO: Use type aliases for unions
type Status = 'idle' | 'loading' | 'success' | 'error';
```

#### Null Checks

```typescript
// ✅ DO: Handle null/undefined explicitly
if (user?.profile?.avatar) {
  displayAvatar(user.profile.avatar);
}

// ❌ DON'T: Assume values exist
displayAvatar(user.profile.avatar);  // May crash!
```

### React

#### Function Components

```typescript
// ✅ DO: Use function components with TypeScript
interface ButtonProps {
  onClick: () => void;
  label: string;
  disabled?: boolean;
}

export const Button: FC<ButtonProps> = ({ onClick, label, disabled = false }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};
```

#### Hooks

```typescript
// ✅ DO: Include all dependencies
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ❌ DON'T: Omit dependencies
useEffect(() => {
  fetchData(userId);
}, []);  // Missing userId!
```

#### State Management

```typescript
// ✅ DO: Use functional updates when depending on previous state
const [count, setCount] = useState(0);
setCount(prev => prev + 1);

// ❌ DON'T: Use direct updates with stale closures
setCount(count + 1);  // May use stale value
```

### File Organization

```typescript
// Component file structure
1. Imports (React, third-party, local)
2. Type definitions
3. Constants
4. Component definition
5. Exports

// Example:
import { FC, useState } from 'react';
import { Button } from '@/shared/components/ui';
import { processData } from './utils';

interface ComponentProps {
  title: string;
}

const DEFAULT_TITLE = 'Untitled';

export const Component: FC<ComponentProps> = ({ title = DEFAULT_TITLE }) => {
  const [state, setState] = useState(null);
  
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={() => setState(processData())}>
        Process
      </Button>
    </div>
  );
};
```

### Naming Conventions

- **Files:** PascalCase for components (`Button.tsx`), camelCase for utilities (`file.ts`)
- **Components:** PascalCase (`ImageEditor`)
- **Functions/Variables:** camelCase (`handleClick`, `userName`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Types/Interfaces:** PascalCase (`UserProfile`)
- **Hooks:** camelCase with `use` prefix (`useEditorState`)

### Comments

```typescript
// ✅ DO: Comment WHY, not WHAT
// Retry failed requests to handle transient API errors
const result = await retryWithBackoff(apiCall);

// ❌ DON'T: State the obvious
// Call the API
const result = await apiCall();
```

```typescript
// ✅ DO: Use JSDoc for public APIs
/**
 * Generates a product mockup using AI.
 * 
 * @param logo - Base64-encoded logo image
 * @param product - Product template configuration
 * @param style - Optional style description
 * @returns Promise resolving to generated mockup image
 * @throws {AuthenticationError} If API key is invalid
 */
export async function generateMockup(
  logo: string,
  product: MerchProduct,
  style?: string
): Promise<string> {
  // Implementation
}
```

---

## Testing Guidelines

### Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('Feature', () => {
  beforeEach(() => {
    // Setup
  });

  describe('when condition X', () => {
    it('should do Y', () => {
      // Arrange
      const input = setupTestData();
      
      // Act
      const result = performAction(input);
      
      // Assert
      expect(result).toBe(expectedOutput);
    });
  });
});
```

### What to Test

✅ **DO test:**
- Pure functions
- Business logic
- Error handling
- Edge cases
- State transitions

❌ **DON'T test:**
- Implementation details
- Third-party libraries
- Trivial code (getters/setters)

### Test Coverage

- Aim for 80%+ coverage on new code
- 100% coverage on critical paths (error handling, security)
- Don't sacrifice quality for coverage numbers

---

## Documentation

### Code Documentation

```typescript
/**
 * Brief description of the function.
 * 
 * Longer description if needed. Explain complex logic,
 * edge cases, or important considerations.
 * 
 * @param param1 - Description of param1
 * @param param2 - Description of param2
 * @returns Description of return value
 * @throws {ErrorType} When this error occurs
 * 
 * @example
 * const result = myFunction('value', 42);
 */
```

### User Documentation

When adding features, update:
- README.md (if user-facing)
- Feature-specific docs in /docs
- CHANGELOG.md
- Inline help text/tooltips

### Documentation Standards

- Write for humans, not robots
- Use examples liberally
- Keep it concise but complete
- Update when behavior changes
- Include screenshots for UI features

---

## Pull Request Process

### Before Submitting

- [ ] Code follows project conventions
- [ ] Tests pass (if they exist)
- [ ] TypeScript compiles without errors
- [ ] Documentation updated
- [ ] Commits are clean and descriptive
- [ ] Branch is up to date with main

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Fixes #123

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
How did you test this? Include:
- Manual testing steps
- Automated tests added/updated
- Edge cases considered

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review performed
- [ ] Comments added where needed
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
- [ ] All tests passing
```

### Review Process

1. **Automated Checks** - CI runs tests, linting, build
2. **Maintainer Review** - Code review by maintainers
3. **Feedback** - Address review comments
4. **Approval** - At least one maintainer approval required
5. **Merge** - Maintainer merges PR

### After Merge

- Delete your feature branch
- Update your local main branch
- Celebrate! 🎉

---

## Community

### Communication Channels

- **GitHub Issues** - Bug reports, feature requests
- **GitHub Discussions** - Questions, ideas, feedback
- **Pull Requests** - Code contributions

### Getting Help

**Before asking:**
- Check existing issues and discussions
- Read the documentation (README, ARCHITECTURE, etc.)
- Try to reproduce the issue
- Gather relevant information (error messages, screenshots, etc.)

**When asking:**
- Be clear and specific
- Provide context
- Include error messages and logs
- Share what you've tried
- Be patient and respectful

### Recognition

Contributors are recognized in:
- CHANGELOG.md (for each release)
- Contributors page (coming soon)
- Social media shoutouts

---

## License

By contributing to NanoGen Studio, you agree that your contributions will be licensed under the same license as the project.

---

## Questions?

- **General questions:** [GitHub Discussions](https://github.com/Krosebrook/PoDGen/discussions)
- **Bug reports:** [GitHub Issues](https://github.com/Krosebrook/PoDGen/issues)
- **Security issues:** See [SECURITY.md](./SECURITY.md)

---

Thank you for contributing to NanoGen Studio! 🚀

**Last Updated:** 2024-12-29  
**Maintainers:** NanoGen Engineering Team
