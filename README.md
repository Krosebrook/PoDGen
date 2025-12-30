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

See [DEPLOYMENT.md](./DEPLOYMENT.md) for hosting options (Vercel, Netlify, AWS, Docker).

---

## 📖 Documentation

### Getting Started
- **[Installation Guide](#installation)** - Set up your development environment
- **[User Guide](#)** - Learn how to use features (coming soon)
- **[FAQ](#)** - Frequently asked questions (coming soon)

### Architecture & Development
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design patterns and technical overview
- **[AGENTS.md](./AGENTS.md)** - AI agent architecture and model selection
- **[GEMINI.md](./GEMINI.md)** - Comprehensive Gemini API integration guide
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute to the project

### Project Management
- **[ROADMAP.md](./ROADMAP.md)** - Product roadmap from MVP to v2.0+
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and release notes
- **[TODO.md](./TODO.md)** - Prioritized action items and tasks
- **[AUDIT.md](./AUDIT.md)** - Comprehensive project audit report

### Security & Deployment
- **[SECURITY.md](./SECURITY.md)** - Security policy and best practices
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide for various platforms

---

## 🏗️ Technical Stack

- **Frontend**: React 19 with Concurrent Mode features
- **Language**: TypeScript 5.8+ (strict mode)
- **Build Tool**: Vite 6.2+ for lightning-fast HMR
- **Styling**: Tailwind CSS 3.4 (utility-first)
- **AI Integration**: `@google/genai` SDK v1.30+
- **3D Rendering**: Three.js with @react-three/fiber
- **Icons**: Lucide React
- **State**: Custom hooks with AbortController

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

---

## 🎯 Project Status

### Current Version: v0.0.0 (MVP)

**What's Working:**
- ✅ All three feature modules (Editor, Merch, Integrations)
- ✅ Multi-model AI support (Gemini 2.5/3.0/3 Pro)
- ✅ 31 product templates with variation generation
- ✅ Advanced text overlay system with drag-and-drop
- ✅ High-resolution export (up to 4K)
- ✅ 3D product preview
- ✅ Platform integration code generation

**What's Next (v0.1.0 - March 2025):**
- ⏳ Testing infrastructure (Vitest + React Testing Library)
- ⏳ CI/CD pipeline with GitHub Actions
- ⏳ LocalStorage encryption for API keys
- ⏳ ESLint configuration
- ⏳ Enhanced documentation

See [ROADMAP.md](./ROADMAP.md) for the complete product roadmap.

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** (follow our [coding standards](./CONTRIBUTING.md#coding-standards))
4. **Add tests** if applicable
5. **Commit your changes** (`git commit -m 'feat: add amazing feature'`)
6. **Push to branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

### Priority Areas for Contributors
- 🧪 Testing (high priority!)
- 📝 Documentation improvements
- 🔌 New platform integrations
- ♿ Accessibility enhancements
- 🎨 UI/UX improvements

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🔒 Security

We take security seriously. If you discover a security vulnerability, please:

1. **DO NOT** open a public issue
2. Email the maintainers directly (see [SECURITY.md](./SECURITY.md))
3. Include detailed steps to reproduce

See [SECURITY.md](./SECURITY.md) for our full security policy.

---

## 🌟 Acknowledgments

- **Google Gemini API** for powering our AI features
- **React Team** for React 19 and amazing developer experience
- **Vite Team** for blazing-fast build tooling
- **Tailwind CSS** for the utility-first CSS framework
- **Three.js** for 3D visualization capabilities
- **All Contributors** who help make this project better

---

## 📊 Stats

- **Lines of Code**: ~6,200
- **Components**: 27
- **Features**: 3 major modules
- **AI Models**: 5 supported
- **Product Templates**: 31
- **Platform Integrations**: 6

---

## 💬 Support & Community

- **Issues**: [GitHub Issues](https://github.com/Krosebrook/PoDGen/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Krosebrook/PoDGen/discussions)
- **Documentation**: [Full Docs](#-documentation)

---

## 🗺️ Roadmap Highlights

### v0.1.0 (Q1 2025) - Foundation
- Testing infrastructure
- CI/CD pipeline
- Security enhancements

### v0.2.0 (Q2 2025) - Quality
- Performance optimization
- 80%+ test coverage
- Accessibility improvements

### v1.0.0 (Q3 2025) - Production
- Backend API service
- User authentication
- Feature completeness

### v2.0.0+ (Q4 2025) - Advanced
- AI Video Mockups (Veo 3.1)
- Auto SEO Copywriting
- Direct Merchant Bridge
- TikTok Shop Live

See [ROADMAP.md](./ROADMAP.md) for complete details.

---

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