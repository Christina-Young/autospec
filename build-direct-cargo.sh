#!/bin/bash
# Build script that uses Cargo and Vite directly - NO npm scripts, NO Tauri CLI

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔧 Setting environment..."
ulimit -n 262144 2>/dev/null || ulimit -n 131072 2>/dev/null || true
export CARGO_BUILD_JOBS=1

echo ""
echo "📦 Step 1: Building frontend with Vite directly..."
echo "   (Bypassing npm scripts to avoid any hooks)"
# Use vite directly via npx, not through npm scripts
npx --yes vite build

echo ""
echo "🦀 Step 2: Building Rust backend with Cargo directly..."
echo "   (NO Tauri CLI - just pure Cargo)"
cd src-tauri

# Build with Cargo only - this should work
if command -v prlimit &> /dev/null; then
    echo "   Using prlimit..."
    prlimit --nofile=262144:262144 -- cargo build --release --jobs 1
else
    echo "   Building with Cargo..."
    cargo build --release --jobs 1
fi

cd ..

echo ""
echo "✅ Build complete - NO Tauri CLI was used!"
echo ""
echo "📦 Files created:"
echo "   - Frontend: dist/"
echo "   - Binary: src-tauri/target/release/autospec"
echo ""
echo "🚀 To test the binary:"
echo "   cd src-tauri/target/release"
echo "   ./autospec"
echo ""
echo "⚠️  Note: This binary may not work perfectly without Tauri's bundling,"
echo "   but it should at least compile and run. For full functionality,"
echo "   you'll need to successfully run 'tauri build' (which requires"
echo "   closing other applications first)."

