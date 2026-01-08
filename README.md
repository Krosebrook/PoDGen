# NanoGen Studio 2.5 ⚡️

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Version](https://img.shields.io/badge/version-0.0.0-green.svg)](./CHANGELOG.md)
[![Status](https://img.shields.io/badge/status-MVP-yellow.svg)](./ROADMAP.md)

A world-class **AI-native creative suite** for rapid product visualization and advanced image synthesis, powered by the **Gemini 2.5 Flash Image** model. NanoGen Studio bridges the gap between raw brand assets and production-ready marketing materials through a seamless, high-fidelity interface.

---

## ✨ Key Features

### 🎨 Creative Editor
Transform images with natural language instructions powered by Gemini AI
- **Semantic Editing**: "Add cyberpunk lighting", "Remove background", "Turn into oil painting"
- **Deep Reasoning Mode**: Complex, multi-step artistic transformations (32K token budget)
- **Google Search Grounding**: Real-world context injection for better results
- **Image Analysis**: Detailed composition and artistic breakdowns

### 👕 Merch Studio  
Generate professional product mockups in seconds
- **31 Product Templates**: T-shirts, hoodies, mugs, phone cases, and more
- **Variation Generation**: 3 alternative angles and lighting setups automatically
- **Text Overlays**: Drag-and-drop typography with advanced controls
- **3D Preview**: Interactive Three.js product viewer
- **Batch Export**: High-resolution (2K/4K) output in PNG/JPG/WebP

### 🔌 Integration Hub
Code generation for platform integrations
- **6 Platform Connectors**: Shopify, Printify, Etsy, TikTok, Amazon, Custom
- **Language Support**: cURL, Node.js, Python
- **API Key Management**: Secure local storage with encryption (coming in v0.1.0)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **Google Gemini API Key** ([Get one free](https://aistudio.google.com/app/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/Krosebrook/PoDGen.git
cd PoDGen

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your API_KEY

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app! 🎉

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

NanoGen Studio uses [Vitest](https://vitest.dev/) for fast, Vite-native testing.

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

**Current Test Coverage:** 41.93% overall, 100% for error classes and core utilities

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed testing guidelines.

## 📜 Compliance & Accessibility

NanoGen Studio is designed with **WCAG 2.1 AA** compliance in mind:

- ♿ **Semantic HTML**: Proper heading hierarchy and landmarks
- ⌨️ **Keyboard Navigation**: Full keyboard support
- 🎯 **Focus Management**: Clear focus indicators
- 📢 **Screen Reader Support**: ARIA labels and descriptions
- 🎨 **Color Contrast**: Meets WCAG contrast ratios
- 📱 **Responsive Design**: Mobile-first approach

---

**Built with ❤️ by the NanoGen Engineering Team**

[⭐ Star us on GitHub](https://github.com/Krosebrook/PoDGen) | [📖 Read the Docs](#-documentation) | [🐛 Report Bug](https://github.com/Krosebrook/PoDGen/issues) | [💡 Request Feature](https://github.com/Krosebrook/PoDGen/issues)