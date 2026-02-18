#!/bin/bash
# Clean build script - cleans cache first to reduce file operations

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "🧹 Cleaning build cache..."
rm -rf src-tauri/target/debug
rm -rf src-tauri/target/release
rm -rf node_modules/.vite
rm -rf dist

echo "📦 Setting file descriptor limit..."
ulimit -n 65536 2>/dev/null || ulimit -n 32768 2>/dev/null || true
CURRENT_LIMIT=$(ulimit -n)
echo "File descriptor limit: $CURRENT_LIMIT"

echo "🔨 Building with minimal parallelism..."
export CARGO_BUILD_JOBS=1

if command -v prlimit &> /dev/null; then
    echo "Using prlimit to ensure child processes inherit limit"
    prlimit --nofile=65536:65536 -- npx tauri build
else
    bash -c "ulimit -n 65536 2>/dev/null || ulimit -n 32768 2>/dev/null || true; export CARGO_BUILD_JOBS=1; exec npx tauri build"
fi

