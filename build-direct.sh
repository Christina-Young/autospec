#!/bin/bash
# Build script that builds Rust directly first, then uses Tauri

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔧 Setting up environment..."
# Set very high file descriptor limit
ulimit -n 131072 2>/dev/null || ulimit -n 65536 2>/dev/null || ulimit -n 32768 2>/dev/null || true
CURRENT_LIMIT=$(ulimit -n)
echo "File descriptor limit: $CURRENT_LIMIT"

# Set minimal parallelism
export CARGO_BUILD_JOBS=1
export RUSTFLAGS="-C link-arg=-fuse-ld=lld" 2>/dev/null || true

echo "📦 Building frontend..."
npm run build

echo "🦀 Building Rust backend (this may take a while)..."
cd src-tauri

# Build in release mode directly with cargo
if command -v prlimit &> /dev/null; then
    echo "Using prlimit for Cargo build..."
    prlimit --nofile=131072:131072 -- cargo build --release
else
    cargo build --release
fi

cd ..

echo "🎯 Running Tauri build (should be quick now)..."
# Now run tauri build - it should be much faster since Rust is already built
if command -v prlimit &> /dev/null; then
    prlimit --nofile=131072:131072 -- npx tauri build
else
    npx tauri build
fi

echo "✅ Build complete!"

