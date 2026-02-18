# Quick Start Guide - AutoSpec

## Prerequisites

- **Node.js** 18+ and npm
- **Rust** (latest stable) - [Install Rust](https://rustup.rs/)
- **System dependencies** for Tauri:
  - **Linux**: `libwebkit2gtk-4.0-dev`, `libssl-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`
  - **macOS**: Xcode Command Line Tools
  - **Windows**: Microsoft Visual Studio C++ Build Tools

## Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/Christina-Young/autospec.git
   cd autospec
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Install MCP server dependencies** (optional, for Cursor integration):
   ```bash
   cd mcp-server
   npm install
   cd ..
   ```

## Running the Application

### Development Mode (Recommended)

**If you get "too many open files" error**, see [DEV_MODE_FIX.md](./DEV_MODE_FIX.md) for workarounds.

Run the app in development mode with hot reload:

```bash
# Option 1: Use the dev script (handles file limits automatically)
./dev.sh

# Option 2: Set limit manually, then run
ulimit -n 524288
npm run tauri:dev

# Option 3: Use safe dev script
npm run dev:safe
```

This will:
- Start the Vite dev server
- Build and run the Tauri app
- Enable hot reload for React components

### Building for Production

**Note**: If you encounter "too many open files" errors, see the troubleshooting section below.

#### Option 1: Use the Pure Cargo Build (Recommended)

This bypasses npm scripts and Tauri CLI to avoid file descriptor issues:

```bash
./build-pure-cargo.sh
```

Then run the binary:
```bash
./src-tauri/target/release/autospec
```

#### Option 2: Standard Build

```bash
npm run tauri:build
```

This creates platform-specific installers in `src-tauri/target/release/bundle/`.

## New Features in This Version

### ✨ What's New

1. **Toast Notifications**
   - Success, error, info, and warning messages
   - Auto-dismiss after 3 seconds
   - Manual dismiss option

2. **Auto-Save**
   - Documents automatically save to localStorage
   - Data persists across app restarts
   - No need to manually save

3. **Better Error Handling**
   - User-friendly error messages
   - Specific instructions for troubleshooting
   - Visual feedback for all actions

4. **Browser Compatibility**
   - Works in all modern browsers
   - Fallback ID generation for older environments

## First Run

1. **Start the app**: `npm run tauri:dev`

2. **Create your first document**:
   - Click "New Document" in the sidebar
   - Enter a name (e.g., "My Project Requirements")
   - Optionally select a template
   - Click "Create"

3. **Start writing**:
   - Type your requirements in the editor
   - Use the "Preview" button to see formatted markdown
   - Documents auto-save as you work

4. **Use AI Assistant** (optional):
   - Click "AI Assistant" button
   - Set your API key: `export OPENAI_API_KEY=your_key_here`
   - Ask questions or get suggestions

5. **Review requirements**:
   - Click "Review" button
   - Change requirement status: Draft → Review → Approved → Implemented
   - Track progress visually

6. **Export to Markdown**:
   - Click "Export MD" button
   - Save as `.md` file
   - GitHub-compatible format

## Configuration

### AI API Key (Optional)

For the AI chat feature, set one of these environment variables:

```bash
export OPENAI_API_KEY=your_key_here
# or
export ANTHROPIC_API_KEY=your_key_here
```

Or add to `~/.bashrc` or `~/.zshrc`:
```bash
echo 'export OPENAI_API_KEY="your_key_here"' >> ~/.bashrc
source ~/.bashrc
```

## Troubleshooting

### "Too Many Open Files" Error

If you get this error during build:

1. **Quick fix**: Use the pure Cargo build script:
   ```bash
   ./build-pure-cargo.sh
   ```

2. **Increase file descriptor limit**:
   ```bash
   ulimit -n 65536
   npm run tauri:build
   ```

3. **Close other applications** (Firefox, QEMU, etc.) that use many file descriptors

4. **See detailed troubleshooting**: Check `TROUBLESHOOTING.md` or `FIX_BUILD_ERROR.md`

### App Won't Start

- Check that all dependencies are installed: `npm install`
- Verify Rust is installed: `rustc --version`
- Check system dependencies (see Prerequisites above)
- Try cleaning and rebuilding: `rm -rf node_modules src-tauri/target && npm install`

### AI Chat Not Working

- Verify API key is set: `echo $OPENAI_API_KEY`
- Check error notifications in the app
- Ensure you have API credits/quota
- See error message in the chat for specific issues

### Documents Not Persisting

- Check browser console for localStorage errors
- Verify localStorage is enabled in your browser
- Documents are stored in browser localStorage (not file system)

## Project Structure

```
autospec/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── utils/              # Utilities (id, notifications, persistence)
│   └── store.ts            # Zustand state management
├── src-tauri/              # Rust backend
│   ├── src/main.rs         # Tauri commands
│   └── Cargo.toml          # Rust dependencies
├── mcp-server/             # MCP server for Cursor integration
└── templates/              # Requirement templates
```

## Development Tips

- **Hot Reload**: Changes to React components reload automatically
- **Rust Changes**: Require app restart (stop and run `npm run tauri:dev` again)
- **State Persistence**: Documents are saved to localStorage automatically
- **Notifications**: Use `notify.success()`, `notify.error()`, etc. in components

## Next Steps

- Read `CODE_REVIEW.md` for code quality notes
- Check `IMPROVEMENTS.md` for feature details
- See `SETUP.md` for advanced setup
- Review `MCP_SERVER_README.md` for Cursor integration

## Getting Help

- Check the troubleshooting files in the repo
- Review error messages in the app (toast notifications)
- Check browser console for detailed errors
- See GitHub issues for known problems

