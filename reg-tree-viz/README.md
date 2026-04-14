# Regulatory Document Visualizer

An interactive web application that transforms regulatory and legal texts into visual tree diagrams using AI-powered document analysis.

**Paste any regulatory text → Claude AI extracts the hierarchy → D3.js renders an interactive tree**

![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular)
![D3.js](https://img.shields.io/badge/D3.js-7-F9A03C?logo=d3dotjs)
![Claude AI](https://img.shields.io/badge/Claude_AI-Sonnet_4-CC785C)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)

## Features

- **AI-Powered Parsing** — Claude AI analyzes regulatory text and extracts the document hierarchy automatically
- **Interactive Tree Visualization** — Collapsible/expandable D3.js tree with zoom and pan
- **Multi-Language Support** — Works with regulatory documents in any language
- **Hover Tooltips** — Hover truncated nodes to see full clause text
- **Export JSON** — Download the extracted document structure as JSON
- **Responsive Layout** — Works on desktop and tablet screens

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 21, TypeScript, SCSS |
| Visualization | D3.js 7 (tree layout, zoom, transitions) |
| UI Components | Angular Material (Azure/Blue theme) |
| AI Backend | Claude API (Sonnet 4) via Express.js proxy |
| Deployment | GitHub Pages (frontend) |

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Angular App    │────▶│ Express.js   │────▶│ Claude API  │
│  (D3.js Tree)   │◀────│ Proxy Server │◀────│ (Sonnet 4)  │
└─────────────────┘     └──────────────┘     └─────────────┘
     Port 4200              Port 3000          api.anthropic.com
```

- **Angular frontend** handles UI, text input, and D3 tree rendering
- **Express proxy** keeps the API key server-side (never exposed to browser)
- **Claude API** parses regulatory text and returns structured JSON

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A [Claude API key](https://console.anthropic.com/)

### Installation

```bash
cd reg-tree-viz
npm install
```

### Running Locally

**1. Start the API proxy server:**

```bash
# Set your Claude API key
# Windows PowerShell:
$env:CLAUDE_API_KEY="sk-ant-api03-your-key-here"

# macOS/Linux:
export CLAUDE_API_KEY="sk-ant-api03-your-key-here"

# Start the proxy
node server.js
```

**2. Start the Angular dev server (in a new terminal):**

```bash
ng serve
```

**3. Open http://localhost:4200**

### Using a .env File (Optional)

To avoid setting the API key every time:

```bash
npm install dotenv
```

Create a `.env` file in the project root:

```
CLAUDE_API_KEY=sk-ant-api03-your-key-here
```

Add `require('dotenv').config();` to the top of `server.js`.

## Usage

1. Paste any regulatory or legal text into the input panel
2. Click **Generate Tree**
3. AI analyzes the document and extracts the hierarchy
4. Explore the interactive tree:
   - **Click** nodes to expand/collapse branches
   - **Scroll** to zoom in/out
   - **Drag** to pan the view
   - **Hover** truncated labels to see full text
5. Click **Export JSON** to download the structure

## Project Structure

```
reg-tree-viz/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── home/                  # Main layout orchestrator
│   │   │   ├── text-input/            # Text input panel with Material UI
│   │   │   └── tree-visualization/    # D3.js tree rendering
│   │   ├── models/
│   │   │   └── tree-node.model.ts     # TreeNode interface
│   │   ├── services/
│   │   │   └── claude-api.service.ts  # Claude API integration + prompt
│   │   └── shared/
│   │       └── mock-data.ts           # Sample data for development
│   └── environments/
├── server.js                          # Express proxy for Claude API
├── angular.json
└── package.json
```

## Deployment

### GitHub Pages (Frontend Only)

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically builds and deploys the Angular app on push to `main`.

> **Note:** GitHub Pages serves static files only. The Express proxy server must be hosted separately (e.g., Render, Railway, AWS Elastic Beanstalk) for the AI features to work in production.

### Full Deployment (AWS)

| Component | AWS Service |
|-----------|------------|
| Angular frontend | S3 + CloudFront |
| Express proxy | Elastic Beanstalk (Node.js) |
| API key storage | SSM Parameter Store or Secrets Manager |

## License

MIT
