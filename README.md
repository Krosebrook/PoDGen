# NanoGen Studio 2.5 ⚡️

A world-class AI-native creative suite for rapid product visualization and advanced image synthesis, powered by the **Gemini 2.5 Flash Image** model. NanoGen Studio bridges the gap between raw brand assets and production-ready marketing materials through a seamless, high-fidelity interface.

## 🚀 Key Value Propositions

- **Zero-Latency Visualization**: Transform flat logos into cinematic product mockups in seconds.
- **Creative Intelligence**: Leverage deep reasoning for complex image editing and contextual analysis.
- **Production-Ready Exports**: High-precision canvas engine for generating high-resolution master files.
- **Developer-First API**: Integrated code generation for cURL, Node.js, and Python workflows.

## 🛠 Feature Deep-Dive

### 1. Creative Editor (Gemini 2.5/3.0 Hybrid)
The Creative Editor is a state-of-the-art canvas for non-destructive image manipulation.
- **Semantic Editing**: "Add a sci-fi HUD," "Convert to oil painting," or "Remove background" via natural language.
- **Deep Reasoning**: Enable "Thinking Mode" for complex, multi-step artistic instructions.
- **Search Grounding**: Inject real-world context into generated images using Google Search integration.
- **Contextual Analysis**: Generate detailed artistic reports and composition breakdowns of your source assets.

### 2. Merch Studio (AI Pipeline)
A dedicated environment for brand expansion and physical product previewing.
- **Variation Synthesis**: Generate 3 alternative camera angles and lighting setups simultaneously.
- **Dynamic Typography**: Add, drag, and style high-resolution text overlays with legibility masks.
- **Contextual Styles**: AI-generated style presets tailored to specific product categories (e.g., "Streetwear Grunge" for hoodies).

### 3. Integration Hub
Standardize your AI pipeline for downstream systems.
- **Instant Code Snippets**: Pre-configured templates for cURL, Node.js, and Python.
- **Platform Connectors**: Ready-to-use logic for Discord Webhooks, AWS S3, and generic REST backends.

## 🏗 Technical Architecture

NanoGen Studio follows a **Feature-Based Module Pattern** to ensure strict separation of concerns and extreme performance.

- **Frontend**: React 19 (Concurrent Mode) + TypeScript
- **Styling**: Tailwind CSS 3.4 (Design System Utility approach)
- **AI Integration**: `@google/genai` (Google Generative AI SDK)
- **State Management**: Domain-specific custom hooks with AbortController synchronization

## 🚦 Getting Started

### Prerequisites
- Node.js 20.x or higher
- A valid Google Gemini API Key

### Installation

1. **Clone & Install**:
   ```bash
   git clone https://github.com/your-repo/nanogen-studio.git
   cd nanogen-studio
   npm install
   ```

2. **Environment Setup**:
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your Gemini API key
   # Get your key from: https://aistudio.google.com/app/apikey
   ```

3. **Development Mode**:
   ```bash
   npm run dev
   ```

## 📚 Documentation

- **[AUDIT.md](./AUDIT.md)** - Comprehensive project audit (high & low level)
- **[TODO.md](./TODO.md)** - Prioritized action items and roadmap
- **[SECURITY.md](./SECURITY.md)** - Security policy and best practices
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture deep-dive

## 📜 Compliance & Accessibility
NanoGen Studio is built with **WCAG 2.1 AA** compliance in mind:
- **ARIA-Landmarks**: Distinct regions for Sidebar, Viewport, and Navigation.
- **Focus Management**: Controlled focus loops in configuration panels.
- **Semantic Tooltips**: Every interactive element includes a functional explanation.
- **Responsive Layout**: Fluid grid system that adapts from mobile inspection to desktop editing.

---

*Built with ❤️ by the NanoGen Engineering Team.*