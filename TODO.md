# NanoGen Studio - Action Items

Based on the comprehensive audit, this document provides prioritized, actionable tasks to improve the project.

---

## 🚨 Critical Priority (P0) - Do Immediately

### 1. Add Environment Configuration
- [ ] Create `.env.example` with documented variables:
  ```
  API_KEY=your_gemini_api_key_here
  NODE_ENV=development
  ```
- [ ] Add environment validation at app startup
- [ ] Update README with environment setup instructions
- [ ] Add error message if API_KEY is missing

**Estimated Time:** 1 hour  
**Files to Create/Modify:**
- `.env.example` (new)
- `services/ai-core.ts` (add validation)
- `README.md` (update setup section)

### 2. Replace Direct Console Logging
- [ ] Replace all `console.error` with `logger.error`
- [ ] Replace all `console.log` with `logger.info` or `logger.debug`
- [ ] Ensure logger sanitizes sensitive data

**Locations to Fix:**
- `components/MerchStudio.tsx` (2 instances)
- `components/ImageEditor.tsx` (1 instance)
- `hooks/useGenAI.ts` (1 instance)
- `shared/utils/image.ts` (1 instance)
- `features/merch/components/MerchPreview.tsx` (1 instance)
- `features/merch/components/Merch3DViewer.tsx` (1 instance)
- `features/integrations/data/platforms.ts` (1 instance - this is in template code, acceptable)

**Estimated Time:** 2 hours

### 3. Add React Error Boundaries
- [ ] Create `ErrorBoundary` component in `shared/components/`
- [ ] Wrap each feature module (Editor, Merch, Integrations)
- [ ] Add error reporting/logging to boundary
- [ ] Create user-friendly fallback UI

**Estimated Time:** 3 hours  
**Files to Create:**
- `shared/components/ErrorBoundary.tsx`
- `App.tsx` (wrap features)

---

## 🔴 High Priority (P1) - This Week

### 4. Setup Testing Infrastructure
- [ ] Install testing dependencies:
  ```bash
  npm install -D vitest @testing-library/react @testing-library/jest-dom \
    @testing-library/user-event jsdom
  ```
- [ ] Create `vitest.config.ts`
- [ ] Add test scripts to `package.json`:
  - `"test": "vitest"`
  - `"test:ui": "vitest --ui"`
  - `"test:coverage": "vitest --coverage"`
- [ ] Create example test file to verify setup

**Estimated Time:** 2 hours

### 5. Write Critical Path Tests
- [ ] Test `services/ai-core.ts`:
  - [ ] Error normalization
  - [ ] Retry logic
  - [ ] API key validation
- [ ] Test `shared/utils/errors.ts`:
  - [ ] Error class instantiation
  - [ ] Error code mapping
- [ ] Test `features/merch/hooks/useMerchState.ts`:
  - [ ] Asset upload flow
  - [ ] Generate mockup
  - [ ] Variation generation
- [ ] Test `features/editor/hooks/useEditorState.ts`:
  - [ ] Image processing
  - [ ] Model switching
  - [ ] Generate/analyze flows

**Target Coverage:** 60-80% on critical services  
**Estimated Time:** 2 days

### 6. Security - API Key Management
- [ ] Add API key validation function
- [ ] Implement key masking in logs
- [ ] Add key rotation support (prepare for future)
- [ ] Document security best practices

**Files to Modify:**
- `services/ai-core.ts`
- `shared/utils/logger.ts`

**Estimated Time:** 4 hours

### 7. Security - LocalStorage Encryption
- [ ] Install encryption library (e.g., `crypto-js`)
- [ ] Wrap localStorage access with encryption/decryption
- [ ] Add migration for existing unencrypted keys
- [ ] Add warning banner about key storage

**Files to Modify:**
- `features/integrations/hooks/usePlatformKeys.ts`

**Estimated Time:** 4 hours

---

## 🟡 Medium Priority (P2) - This Month

### 8. Create User Documentation
- [ ] Create `docs/` directory
- [ ] Write `docs/USER_GUIDE.md`:
  - [ ] Getting started tutorial
  - [ ] Feature walkthroughs
  - [ ] Common workflows
- [ ] Write `docs/TROUBLESHOOTING.md`:
  - [ ] Common errors and solutions
  - [ ] API key issues
  - [ ] Performance tips
- [ ] Write `docs/FAQ.md`:
  - [ ] What models are supported?
  - [ ] How much does it cost?
  - [ ] Can I use my own images?

**Estimated Time:** 1 day

### 9. Setup CI/CD Pipeline
- [ ] Create `.github/workflows/ci.yml`:
  - [ ] Run tests on push
  - [ ] Build production bundle
  - [ ] Check TypeScript compilation
  - [ ] Lint code (add ESLint)
- [ ] Add status badge to README
- [ ] Configure branch protection rules

**Estimated Time:** 4 hours

### 10. Add Input Validation
- [ ] Server-side file size validation
- [ ] MIME type verification (not just extension)
- [ ] Image dimension validation
- [ ] Rate limiting on API calls
- [ ] Sanitize user inputs in prompts

**Files to Modify:**
- `shared/utils/file.ts`
- `shared/utils/image.ts`
- `services/ai-core.ts`

**Estimated Time:** 6 hours

### 11. Create Development Documentation
- [ ] Create `CONTRIBUTING.md`:
  - [ ] How to set up development environment
  - [ ] Code style guide
  - [ ] How to submit PRs
  - [ ] How to run tests
- [ ] Create `docs/ARCHITECTURE_DECISIONS.md`:
  - [ ] Why React 19?
  - [ ] Why feature-based structure?
  - [ ] Why no Redux?
- [ ] Document all environment variables

**Estimated Time:** 4 hours

### 12. Add Performance Monitoring
- [ ] Add performance.now() timing for API calls
- [ ] Log slow operations (>5s)
- [ ] Track bundle size in CI
- [ ] Add Web Vitals monitoring
- [ ] Create performance dashboard

**Estimated Time:** 6 hours

---

## 🟢 Low Priority (P3) - This Quarter

### 13. Optimize Bundle Size
- [ ] Analyze bundle with `vite-bundle-visualizer`
- [ ] Code split Three.js imports (only load in 3D viewer)
- [ ] Lazy load lucide-react icons
- [ ] Compress large assets
- [ ] Review file-utils bundle (262 KB)

**Target:** Reduce main bundle by 20%  
**Estimated Time:** 1 day

### 14. Create Deployment Documentation
- [ ] Write `docs/DEPLOYMENT.md`:
  - [ ] Vercel deployment guide
  - [ ] Netlify deployment guide
  - [ ] Self-hosted options
  - [ ] Environment configuration
  - [ ] Production checklist
- [ ] Create deployment scripts
- [ ] Add Docker support

**Estimated Time:** 6 hours

### 15. Add CHANGELOG
- [ ] Create `CHANGELOG.md`
- [ ] Document all past changes (from git history)
- [ ] Establish versioning strategy (Semantic Versioning)
- [ ] Add release process documentation

**Estimated Time:** 2 hours

### 16. Accessibility Testing
- [ ] Install axe-core for automated testing
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Test keyboard-only navigation
- [ ] Test high contrast mode
- [ ] Fix any issues found

**Estimated Time:** 1 day

### 17. Add E2E Tests
- [ ] Install Playwright
- [ ] Write E2E test for Editor flow:
  - [ ] Upload image
  - [ ] Generate edited version
  - [ ] Export result
- [ ] Write E2E test for Merch flow:
  - [ ] Upload logo
  - [ ] Select product
  - [ ] Generate mockup
  - [ ] Generate variations
- [ ] Run in CI pipeline

**Estimated Time:** 2 days

### 18. Implement Roadmap Features
- [ ] AI Video Mockups (Veo 3.1)
- [ ] Auto SEO Copywriting
- [ ] Direct Merchant Bridge
- [ ] TikTok Shop Live

**Estimated Time:** 4-6 weeks (each feature)

---

## 🎨 Code Quality Improvements

### 19. Add ESLint Configuration
- [ ] Install ESLint with React plugins
- [ ] Configure rules for TypeScript
- [ ] Add pre-commit hook with husky
- [ ] Fix all existing linting issues
- [ ] Add ESLint to CI

**Estimated Time:** 3 hours

### 20. Extract Magic Numbers
- [ ] Create `shared/constants/`:
  - [ ] `api.ts` - API timeouts, retry counts
  - [ ] `canvas.ts` - Max dimensions, export quality
  - [ ] `validation.ts` - File size limits, allowed types
- [ ] Replace hardcoded values throughout codebase

**Estimated Time:** 3 hours

### 21. Reduce Code Duplication
- [ ] Create shared upload handler utility
- [ ] Extract common error handling patterns
- [ ] Create reusable loading state component
- [ ] Share prompt construction logic

**Estimated Time:** 4 hours

### 22. Add JSDoc Comments
- [ ] Document all public hook methods
- [ ] Document all service methods
- [ ] Document complex utility functions
- [ ] Generate API documentation with TypeDoc

**Estimated Time:** 1 day

---

## 📊 Tracking Progress

### Completion Checklist

#### Foundation (Required for v1.0)
- [ ] P0-1: Environment configuration
- [ ] P0-2: Console logging cleanup
- [ ] P0-3: Error boundaries
- [ ] P1-4: Testing infrastructure
- [ ] P1-5: Critical path tests
- [ ] P1-6: API key security
- [ ] P1-7: LocalStorage encryption

#### Documentation (Required for v1.0)
- [ ] P2-8: User documentation
- [ ] P2-11: Development documentation
- [ ] P3-14: Deployment documentation
- [ ] P3-15: CHANGELOG

#### Quality & Security (Required for v1.0)
- [ ] P2-9: CI/CD pipeline
- [ ] P2-10: Input validation
- [ ] P3-19: ESLint configuration

#### Nice to Have (v1.1+)
- [ ] P2-12: Performance monitoring
- [ ] P3-13: Bundle optimization
- [ ] P3-16: Accessibility testing
- [ ] P3-17: E2E tests
- [ ] P3-20: Extract magic numbers
- [ ] P3-21: Reduce duplication
- [ ] P3-22: JSDoc comments

#### Roadmap Features (v2.0+)
- [ ] P3-18: Video mockups
- [ ] P3-18: SEO copywriting
- [ ] P3-18: Merchant bridge
- [ ] P3-18: TikTok integration

---

## Time Estimates

| Priority | Items | Total Time | Target Completion |
|----------|-------|------------|-------------------|
| P0 (Critical) | 3 | 6 hours | This week |
| P1 (High) | 4 | 4 days | This week |
| P2 (Medium) | 5 | 3 days | This month |
| P3 (Low) | 10 | 8 days | This quarter |

**Total Estimated Time to v1.0:** ~2-3 weeks (with focused effort)

---

## Success Metrics

### v1.0 Release Criteria
- [ ] All P0 and P1 items completed
- [ ] Test coverage > 60% on critical paths
- [ ] Zero high-severity security issues
- [ ] All documentation complete
- [ ] CI/CD pipeline operational
- [ ] Successful deployment to staging

### v1.1 Release Criteria
- [ ] All P2 items completed
- [ ] Test coverage > 80%
- [ ] Performance monitoring active
- [ ] Accessibility audit passed

---

**Last Updated:** December 21, 2025  
**Next Review:** After P0 items are completed
