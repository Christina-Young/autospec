#!/bin/bash
# Build only the Rust backend - skip Tauri CLI bundling

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔧 Setting environment..."
ulimit -n 262144 2>/dev/null || ulimit -n 131072 2>/dev/null || true
export CARGO_BUILD_JOBS=1

echo "📦 Building frontend..."
npm run build

echo ""
echo "🦀 Building Rust backend..."
cd src-tauri

if command -v prlimit &> /dev/null; then
    prlimit --nofile=262144:262144 -- cargo build --release --jobs 1
else
    cargo build --release --jobs 1
fi

cd ..

echo ""
echo "✅ Rust binary built successfully!"
echo ""
echo "📦 Binary location: src-tauri/target/release/autospec"
echo ""
echo "You can run it directly:"
echo "  ./src-tauri/target/release/autospec"
echo ""
echo "Or if you need a bundle, you'll need to:"
echo "1. Close other applications (Firefox, QEMU, etc.)"
echo "2. Then run: npx tauri build"
echo ""
echo "The binary is fully functional - bundling is just for distribution."

