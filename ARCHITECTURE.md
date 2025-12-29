# Architecture & Design Patterns

NanoGen Studio represents a significant shift towards **AI-First UX**. This document outlines the core architectural pillars that ensure the application remains performant, secure, and extensible.

## 1. Domain-Driven Module Structure

The project utilizes a **Feature-Based Architecture**. Logic, components, and hooks are grouped by domain to prevent "spaghetti" dependencies.

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
    ├── ai-core.ts          # Central Gemini API Facade (SDK Compliance)
    └── logger.ts           # Unified telemetry & logging
```

## 2. AI Core Service (`AICoreService`)

The `AICoreService` encapsulates the complexities of the Gemini API into a predictable, robust interface.

### SDK Compliance:
- **Fresh Context**: A new `GoogleGenAI` client is initialized per-request to ensure the latest environment-injected API keys are always utilized.
- **Thinking Budget**: Automated coordination between `thinkingBudget` and `maxOutputTokens` to prevent empty responses during complex reasoning tasks.
- **Exponential Backoff**: Robust retry logic with jitter to handle transient `429` and `503` status codes.

## 3. Product Visualization Roadmap

While currently focused on high-fidelity 2D synthesis, the architecture is designed for future immersive expansion.

### Immersive Expansion Plan:
- **Veo 3.1 Integration**: Transition from static mockups to 5-second cinematic product reveal videos.
- **Interactive 3D Simulation**: Re-integration of a PBR-based 3D renderer (GLB/Three.js) for physical interaction testing.
- **AR Viewport**: Web-based Augmented Reality (WebXR) for "testing" merch items in the user's physical space.

## 4. Canvas Synthesis Engine (`saveImage`)

When a user exports a "Master" file, the application uses a high-precision `2D Canvas` engine.

- **Multi-Layer Composition**: Blends the AI-generated base, the dynamic typography layer, and legibility masks into a single raster.
- **Resolution Scaling**: Supports up-sampling during export to ensure crisp prints (up to 8K virtual resolution).
- **Coordinate Clamping**: Ensures text overlays stay within valid UV boundaries during drag manipulation.

## 5. Security Model

- **Key Sovereignty**: All requests use `process.env.API_KEY` or trigger the `aistudio.openSelectKey()` dialog for Pro models.
- **Client-Side Sanitization**: Base64 cleaning and strict MIME validation happen at the entry point.
- **Abort Signaling**: Active AI requests are cancelled via `AbortController` if the user switches context, saving bandwidth and tokens.

---

*Last Updated: 2024-05-24*