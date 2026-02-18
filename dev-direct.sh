#!/bin/bash
# Alternative dev script - runs Vite and Cargo separately to avoid Tauri CLI

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔧 Setting environment..."
ulimit -n 262144 2>/dev/null || ulimit -n 131072 2>/dev/null || true
export CARGO_BUILD_JOBS=1

echo ""
echo "📦 Starting Vite dev server (frontend)..."
echo "   Frontend will be available at: http://localhost:1420"
echo ""

# Start Vite in background
npm run dev &
VITE_PID=$!

# Wait a moment for Vite to start
sleep 3

echo ""
echo "🦀 Building Rust backend (this may take a while on first run)..."
cd src-tauri

# Build in debug mode (faster than release)
if command -v prlimit &> /dev/null; then
    prlimit --nofile=262144:262144 -- cargo build
else
    cargo build
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Note: This runs Vite and Cargo separately."
echo "   For full Tauri integration, you'll need to resolve the file descriptor issue."
echo ""
echo "   Frontend: http://localhost:1420"
echo "   To stop: Press Ctrl+C or kill $VITE_PID"
echo ""

# Keep script running
wait $VITE_PID

