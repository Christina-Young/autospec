# AutoSpec

A cross-platform desktop application for writing detailed requirements documents for AI agents to build software products. Built with Tauri, React, and TypeScript.

## Features

- 📝 **Rich Markdown Editor** - Write requirements with live preview
- 🤖 **AI-Powered Brainstorming** - Interactive chat assistant to refine requirements
- 📋 **Template System** - Start with pre-built templates for common project types
- ✅ **Review Workflow** - Track requirements through draft → review → approved → implemented
- 🔢 **Auto-Numbering** - Automatic requirement numbering by category
- 📤 **Export to Markdown** - Generate GitHub-compatible .md files
- 🔗 **GitHub Integration** - Compatible with GitHub workflows and PRs
- 🖥️ **Cross-Platform** - Works on Windows, macOS, and Linux

## Installation

### Prerequisites

- Node.js 18+ and npm
- Rust (latest stable)
- System dependencies for Tauri (see [Tauri docs](https://tauri.app/v1/guides/getting-started/prerequisites))

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Christina-Young/autospec.git
cd autospec
```

2. Install dependencies:
```bash
npm install
```

3. Set up AI API key (optional, for AI chat feature):
```bash
export OPENAI_API_KEY=your_api_key_here
# or
export ANTHROPIC_API_KEY=your_api_key_here
```

4. Run in development mode:
```bash
npm run tauri:dev
```

5. Build for production:
```bash
npm run tauri:build
```

## Quick Start

### Running the Application

**Development mode** (recommended):
```bash
npm install
npm run tauri:dev
```

**Production build**:
```bash
npm run tauri:build
```

### Troubleshooting

- **"Too many open files"** (Linux): Increase the limit with `ulimit -n 65536` before building, or close other heavy applications. You can also build the frontend first (`npm run build`), then build the Rust backend in `src-tauri` with `cargo build --release`, then run `npx tauri build`.
- **Rust or system deps**: See [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites) for your platform (e.g. on Ubuntu: `libwebkit2gtk-4.0-dev`, `libssl-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`).
- **AI chat**: Set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` in your environment.

## Usage

### Creating a Requirements Document

1. Click "New Document" in the sidebar
2. Enter a document name
3. Optionally select a template
4. Start writing your requirements
5. **Documents auto-save** to localStorage as you work

### Using AI Assistant

1. Set your API key: `export OPENAI_API_KEY=your_key_here`
2. Click "AI Assistant" button in the header
3. Chat with the AI to brainstorm requirements
4. Get suggestions for improving your document
5. **See notifications** for success/error feedback

### Review Workflow

1. Click "Review" button to open the review panel
2. Change requirement status: Draft → Review → Approved → Implemented
3. Track progress visually
4. Filter by status to see what needs attention

### Exporting

1. Click "Export MD" to save as markdown
2. The exported file is GitHub-compatible
3. Use in GitHub workflows, issues, or PRs
4. **Success notification** confirms export

## New Features

✨ **Auto-Save**: Documents automatically save to localStorage  
🔔 **Notifications**: Toast notifications for all actions  
💾 **Persistence**: Data persists across app restarts  
🛡️ **Error Handling**: User-friendly error messages  
🌐 **Browser Compatible**: Works in all modern browsers

## MCP Server Integration

This application includes an MCP (Model Context Protocol) server for integration with Cursor and other AI development tools.

### Setting up MCP Server

The MCP server is located in `mcp-server/` directory. To use it with Cursor:

1. Install the MCP server dependencies:
```bash
cd mcp-server
npm install
```

2. Configure Cursor to use the MCP server (see Cursor MCP documentation)

3. The MCP server provides tools for:
   - Reading requirements documents
   - Creating new requirements
   - Updating requirements
   - Exporting documents

## Project Structure

```
autospec/
├── src/                 # React frontend
│   ├── components/     # UI components
│   ├── store.ts        # State management
│   └── App.tsx         # Main app component
├── src-tauri/          # Rust backend
│   └── src/main.rs     # Tauri commands
├── mcp-server/         # MCP server for tooling integration
└── templates/          # Requirement templates
```

## Development

### Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Tauri 2.0 (Rust)
- **State Management**: Zustand
- **Markdown**: react-markdown + remark-gfm
- **AI Integration**: OpenAI API / Anthropic API

### Available Scripts

- `npm run dev` - Run Vite dev server
- `npm run tauri:dev` - Run Tauri app in dev mode
- `npm run tauri:build` - Build production app
- `npm run build` - Build frontend only

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Roadmap

- [ ] More templates for different project types
- [ ] Requirement dependency visualization
- [ ] Collaborative editing
- [ ] GitHub Actions integration
- [ ] Local AI model support (Ollama)
- [ ] PDF export
- [ ] Requirement validation rules

