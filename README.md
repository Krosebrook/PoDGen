# NanoGen Studio

NanoGen Studio is a powerful AI creative suite powered by **Gemini 2.5 Flash Image**. It allows users to edit images with natural language prompts and generate professional merch mockups on demand.

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google GenAI SDK (`@google/genai`)
- **Icons**: Lucide React
- **Build**: Vite

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm or npm
- A Google Gemini API Key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Add your API Key to the `.env` file.

### Running the App

```bash
npm run dev
```

## Features

### 1. AI Image Editor
- Drag & Drop interface
- Natural language editing (e.g., "Add a retro filter")
- Real-time feedback

### 2. Merch Studio
- Upload brand assets (Logo, Background)
- Select from 15+ premium products (T-Shirts, Mugs, etc.)
- Customizable style preferences
- High-resolution generation

### 3. API Integration
- Generate code snippets for cURL, Node.js, Python
- Webhook integration support
- Cloud storage templates (S3)

## Architecture

The project follows a **Feature-Based Architecture**:

- `features/`: Contains domain-specific logic (Editor, Merch, Integrations).
- `shared/`: Contains reusable primitives (UI, Hooks, Utils).
- `services/`: Encapsulates external API logic (Gemini).

See [ARCHITECTURE.md](ARCHITECTURE.md) for deeper details.
