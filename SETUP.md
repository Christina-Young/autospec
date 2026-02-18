# Setup Instructions

## Initial Setup

1. **Install Prerequisites:**
   ```bash
   # Install Node.js 18+ (if not already installed)
   # Install Rust (if not already installed)
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   cd mcp-server && npm install && cd ..
   ```

3. **Set up Git (if not already configured):**
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

4. **Create GitHub Repository:**
   - Go to https://github.com/new
   - Repository name: `agent-requirements-builder`
   - Description: "A cross-platform desktop application for writing detailed requirements documents for AI agents"
   - Make it public
   - Don't initialize with README (we already have one)

5. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/Christina-Young/agent-requirements-builder.git
   git add -A
   git commit -m "Initial commit: Agent Requirements Builder"
   git push -u origin main
   ```

## Development

1. **Run in development mode:**
   ```bash
   npm run tauri:dev
   ```

2. **Set up AI API Key (optional):**
   ```bash
   export OPENAI_API_KEY=your_key_here
   # or
   export ANTHROPIC_API_KEY=your_key_here
   ```

## Building

```bash
npm run tauri:build
```

This will create platform-specific installers in `src-tauri/target/release/bundle/`.

## MCP Server Setup for Cursor

1. **Build the MCP server:**
   ```bash
   cd mcp-server
   npm install
   npm run build
   ```

2. **Configure Cursor:**
   Add to your Cursor MCP configuration:
   ```json
   {
     "mcpServers": {
       "agent-requirements-builder": {
         "command": "node",
         "args": ["/absolute/path/to/agent-requirements-builder/mcp-server/dist/index.js"]
       }
     }
   }
   ```

3. **Restart Cursor** to load the MCP server

## Troubleshooting

- **Tauri build errors:** Make sure you have all system dependencies installed. See [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites)
- **MCP server not working:** Check that the path in Cursor config is absolute and the server is built
- **AI chat not working:** Verify your API key is set correctly

