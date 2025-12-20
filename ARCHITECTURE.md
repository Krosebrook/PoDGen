# Architecture & Design Patterns

NanoGen Studio represents a significant shift towards **AI-First UX**. This document outlines the core architectural pillars that ensure the application remains performant, secure, and extensible.

## 1. Domain-Driven Module Structure

The project utilizes a **Feature-Based Architecture**. Unlike standard flat structures, this groups logic, components, and hooks by domain to prevent "spaghetti" dependencies.

```
src/
├── features/               # High-level domain logic
│   ├── editor/             # Image manipulation & analysis
│   ├── merch/              # Product mockup synthesis
│   └── integrations/       # External connectivity tools
├── shared/                 # Universal primitives
│   ├── components/ui/      # Atomic UI Library (Design System)
│   ├── hooks/              # Global state & side-effect managers
│   └── utils/              # Pure utility functions (Canvas, Image, File)
└── services/               # Core Infrastructure
    ├── ai-core.ts          # Central Gemini API Facade
    └── logger.ts           # Unified telemetry & logging
```

## 2. AI Core Service (`AICoreService`)

The `AICoreService` is the heartbeat of the application. It encapsulates the complexities of the Gemini API into a predictable, robust interface.

### Key Capabilities:
- **Lazy Initialisation**: Client instances are created only when an active request is initiated.
- **Exponential Backoff**: Robust retry logic (default 2 retries) with jitter to handle `429 Rate Limit` and `503 Service Unavailable` errors.
- **Safety Normalization**: Intercepts and formats "Safety Blocks" into user-friendly diagnostic messages.
- **Coordinate Clamping**: Ensures that prompt parameters (like image dimensions) adhere to model constraints (e.g., 1K/2K/4K limits).

## 3. Mockup Synthesis Pipeline

The mockup pipeline leverages **Gemini 2.5 Flash Image** for context-aware texture mapping and environmental integration.

### Technical Flow:
- **Logo Integration**: Dynamically projects 2D brand assets onto surfaces while respecting curvature, lighting, and material properties.
- **Scene Analysis**: Analyzes environmental lighting vectors to match shadows and color grading between mockup and background.

## 4. Canvas Synthesis Engine (`saveImage`)

When a user exports a "Master" file, the application bypasses the standard DOM and uses a high-precision `2D Canvas` engine.

- **Multi-Layer Composition**: Blends the AI-generated base, the dynamic typography layer, and any legibility masks into a single raster.
- **Resolution Scaling**: Supports up-sampling during export to ensure crisp prints even if the viewport preview is low-res.
- **Edge-Case Protection**: Implements dimension clamping (8192px limit) to prevent browser memory exhaustion on high-scale exports.

## 5. State Management & Lifecycle

We strictly avoid global state stores (Redux/MobX) in favor of **Feature-Specific Controllers** (e.g., `useMerchController`).

- **Single Source of Truth**: Assets (Logo, Background) are managed at the feature root and passed down via props.
- **Cancellation Pattern**: Uses `AbortController` to cancel stale AI requests when a user rapidly changes settings or switches tabs.
- **UI Synchronization**: `loading` and `error` states are granular, allowing parts of the UI to remain interactive while the AI pipeline is running.

## 6. UX & Accessibility Principles

- **Functional Tooltips**: Every button has a tooltip that describes the *function* ("Execute Synthesis") rather than just the *label* ("Generate").
- **Contrast Ratios**: All text elements adhere to WCAG 2.1 contrast standards (min 4.5:1).
- **Reduced Motion**: Respects browser `prefers-reduced-motion` settings for all transition animations.

## 7. Security Model

- **Key Management**: All requests use `process.env.API_KEY`.
- **Sanitization**: All base64 data is cleaned of header junk before transmission.
- **Validation**: Strict file size (5MB) and MIME type (PNG/JPG/WEBP) checks are enforced at the browser boundary.

---

*This architecture is designed to evolve. As the Gemini model capabilities expand, the modular nature of the Studio ensures we can integrate new modalities (Video, Audio) with minimal friction.*