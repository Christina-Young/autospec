#!/bin/bash
# Build ONLY with Cargo - completely bypasses Tauri CLI and npm scripts

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔧 Setting environment..."
ulimit -n 262144 2>/dev/null || ulimit -n 131072 2>/dev/null || true
export CARGO_BUILD_JOBS=1

echo "📦 Step 1: Building frontend with Vite directly (bypassing npm scripts)..."
# Build frontend directly with vite to avoid any npm script hooks
npx vite build

echo ""
echo "🦀 Step 2: Building Rust backend with Cargo (NO Tauri CLI)..."
cd src-tauri

# Build release version directly with cargo - this is what works
if command -v prlimit &> /dev/null; then
    echo "Using prlimit for Cargo..."
    prlimit --nofile=262144:262144 -- cargo build --release --jobs 1
else
    echo "Building with Cargo (no prlimit available)..."
    cargo build --release --jobs 1
fi

cd ..

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 Binary location: src-tauri/target/release/autospec"
echo ""
echo "🚀 To run the application:"
echo "   cd src-tauri/target/release"
echo "   ./autospec"
echo ""
echo "Or from project root:"
echo "   ./src-tauri/target/release/autospec"
echo ""
echo "⚠️  Note: This skips Tauri CLI bundling entirely."
echo "   The binary is fully functional for development/testing."

