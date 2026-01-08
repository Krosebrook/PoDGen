# Changelog

All notable changes to NanoGen Studio will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Testing infrastructure with Vitest, React Testing Library, and MSW
  - Vitest test runner with TypeScript and React support
  - React Testing Library for component testing
  - Mock Service Worker (MSW) for API mocking
  - Test utilities and helper functions in `/tests/utils.tsx`
  - Coverage reporting with v8 provider
  - Test scripts: `npm test`, `npm run test:watch`, `npm run test:ui`, `npm run test:coverage`
- Example tests for error classes (18 tests, 100% coverage)
- Example tests for image utilities (20 tests)
- MSW handlers for Gemini API mocking
- Test setup file with automatic MSW server lifecycle management
- ErrorBoundary component for graceful error handling in React
- Comprehensive constants system for API, Canvas, and Validation configurations
- Structured logging system with logger utility replacing console.log/console.error
- Documentation: CHANGELOG.md for version tracking
- Documentation: Enhanced code documentation and JSDoc comments
- Documentation: Updated README.md with testing commands
- Documentation: Updated CONTRIBUTING.md with comprehensive testing guidelines

### Changed
- Refactored codebase to use centralized logger instead of direct console calls
- Extracted magic numbers to shared constants for better maintainability
- Improved error handling across all features with ErrorBoundary wrappers
- Updated `.gitignore` to exclude coverage directory and test artifacts

### Fixed
- Improved error logging consistency across the application

## [0.0.0] - 2024-12-29

### Added
- Initial release of NanoGen Studio
- Creative Editor feature with multi-model AI image editing
  - Gemini 2.5 Flash Image, Gemini 3.0 Flash, and Gemini 3 Pro support
  - Aspect ratio selection (1:1, 3:4, 4:3, 9:16, 16:9)
  - Image size control (1K, 2K, 4K)
  - Google Search grounding integration
  - Deep thinking mode with 32K token budget
  - Image analysis capabilities
  - Canvas with zoom/pan controls
  - High-resolution export functionality
- Merch Studio feature for product visualization
  - 31 product templates (T-shirts, hoodies, mugs, tote bags, phone cases, etc.)
  - Logo upload and management
  - Optional background image integration
  - Style preference customization
  - Variation generation (3 alternative camera angles and lighting)
  - Advanced text overlay system with:
    - Drag-and-drop positioning
    - Font customization
    - Color and opacity controls
    - Text effects (underline, strikethrough, rotation, skew)
    - Background shapes with customizable padding and opacity
  - 3D product viewer with Three.js
  - Batch export functionality
- Integration Hub feature
  - Code generation for cURL, Node.js, and Python
  - Platform connectors for 6 platforms:
    - Shopify
    - Printify
    - Etsy
    - TikTok Shop
    - Amazon Merch
    - Custom API
  - API key management in localStorage
- AI Core Service
  - Stateless client initialization
  - Exponential backoff retry logic (2 retries default)
  - Comprehensive error normalization (Safety, Auth, Rate Limit)
  - Token budget coordination
  - Support for multiple Gemini models
- Feature-based architecture
  - Clear separation between features, shared components, and services
  - Lazy loading for performance optimization
  - Custom hooks for state management
- Styling system
  - Tailwind CSS 3.4 for utility-first styling
  - Responsive design with mobile-first approach
  - Dark mode optimized color palette
- Documentation
  - README.md with getting started guide
  - ARCHITECTURE.md explaining design patterns
  - SECURITY.md with security policy
  - TODO.md with prioritized action items
  - AUDIT.md with comprehensive audit report
  - .env.example for environment configuration

### Technical Stack
- React 19 with Concurrent Mode
- TypeScript 5.8+ with strict mode
- Vite 6.2+ for fast development and builds
- @google/genai SDK v1.30+ for AI integration
- Three.js with @react-three/fiber for 3D rendering
- Lucide React for icon system

---

## Version History

### Versioning Strategy

NanoGen Studio follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version (X.0.0): Incompatible API changes or major feature overhauls
- **MINOR** version (0.X.0): New features added in a backward-compatible manner
- **PATCH** version (0.0.X): Backward-compatible bug fixes

### Upcoming Milestones

#### v0.1.0 (Q1 2025) - Foundation Release
- Testing infrastructure (Vitest + React Testing Library)
- CI/CD pipeline with GitHub Actions
- LocalStorage encryption for API keys
- Input validation improvements
- ESLint configuration
- Complete user and developer documentation

#### v0.2.0 (Q2 2025) - Quality Release
- 60%+ test coverage on critical paths
- Performance monitoring implementation
- Bundle size optimization
- Accessibility testing and improvements
- E2E tests with Playwright

#### v1.0.0 (Q3 2025) - Production Release
- 80%+ test coverage
- All P0 and P1 items from TODO.md completed
- Zero high-severity security issues
- Full documentation suite
- Production deployment guide
- Community contribution guidelines

#### v2.0.0 (Q4 2025) - Advanced Features
- AI Video Mockups with Veo 3.1
- Auto SEO Copywriting generation
- Direct Merchant Bridge integrations
- TikTok Shop Live integration
- Team collaboration features
- Backend API service for key management

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for information on how to contribute to this project.

## Security

For security vulnerability reports, please see [SECURITY.md](./SECURITY.md).

---

[Unreleased]: https://github.com/Krosebrook/PoDGen/compare/v0.0.0...HEAD
[0.0.0]: https://github.com/Krosebrook/PoDGen/releases/tag/v0.0.0
