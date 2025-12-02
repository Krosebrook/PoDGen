# Architecture Documentation

## Overview

NanoGen Studio is designed as a client-side heavy application that leverages the Gemini API directly. This decision allows for rapid prototyping and zero-backend deployment, though production usage would typically require a proxy server for key management.

## Module Structure

We utilize a **Feature-Based** directory structure to ensure scalability and maintainability.

```
src/
├── features/           # Domain-specific modules
│   ├── editor/         # Image Editor feature
│   ├── merch/          # Merch Studio feature
│   └── integrations/   # Integration tools
├── shared/             # Shared resources
│   ├── components/     # UI Library (Atomic design)
│   ├── hooks/          # Custom hooks (useGenAI)
│   ├── utils/          # Pure functions
│   └── types/          # Global types
└── services/           # External API Clients
```

## Design Decisions

### 1. Direct API Calls
- **Decision**: Call Google GenAI SDK directly from the browser.
- **Reasoning**: Reduces infrastructure complexity for the prototype phase.
- **Trade-off**: API Key is exposed in client bundle (acceptable for internal tools/prototypes, requires proxy for public prod).

### 2. Custom Hooks for Logic
- **Decision**: Encapsulate AI logic in `useGenAI` and state in `useMerchState`.
- **Reasoning**: Decouples UI from business logic, making components purely presentational and easier to test.

### 3. Shared UI Library
- **Decision**: Build small, atomic components (`Button`, `Input`, `Card`) in `shared/ui`.
- **Reasoning**: Ensures visual consistency and reduces Tailwind class duplication across features.

## Data Flow

1. **User Action**: User uploads file / enters prompt.
2. **State Update**: React State (via Hooks) updates local variables.
3. **Service Call**: `useGenAI` calls `services/gemini.ts`.
4. **API Interaction**: `GoogleGenAI` SDK contacts Gemini 2.5 Flash.
5. **Response**: Base64 image returned and stored in state.
6. **Render**: UI updates to show result or error.

## Security Model

- **Input Validation**: All files are validated for size (5MB limit) and MIME type before processing.
- **Sanitization**: Error messages are sanitized to prevent leaking stack traces to the user.
- **Type Safety**: Strict TypeScript interfaces prevents runtime errors.
