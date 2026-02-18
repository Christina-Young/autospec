#!/bin/bash
# Workaround build script - builds components separately to avoid Tauri CLI file scanning

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔧 Setting maximum file descriptor limit..."
# Try to set very high limit
for limit in 262144 131072 65536 32768; do
    if ulimit -n $limit 2>/dev/null; then
        echo "✅ Set file descriptor limit to: $limit"
        break
    fi
done

CURRENT_LIMIT=$(ulimit -n)
echo "Current file descriptor limit: $CURRENT_LIMIT"

# Minimal parallelism
export CARGO_BUILD_JOBS=1

echo "📦 Step 1: Building frontend..."
npm run build

echo "🦀 Step 2: Building Rust backend with Cargo directly..."
cd src-tauri

# Use prlimit to ensure the limit is inherited
if command -v prlimit &> /dev/null; then
    echo "Using prlimit for Cargo..."
    prlimit --nofile=262144:262144 -- cargo build --release --jobs 1
else
    cargo build --release --jobs 1
fi

cd ..

echo "🎯 Step 3: Running Tauri bundle (minimal file operations)..."
# Try to use prlimit with a fresh shell to ensure clean environment
if command -v prlimit &> /dev/null; then
    # Use prlimit with a higher limit and ensure it applies to all children
    prlimit --nofile=262144:262144 -- bash -c "
        export CARGO_BUILD_JOBS=1
        ulimit -n 262144 2>/dev/null || ulimit -n 131072 2>/dev/null || true
        cd '$SCRIPT_DIR'
        npx --no-install tauri build 2>&1 || npx tauri build
    "
else
    # Fallback without prlimit
    bash -c "
        ulimit -n 262144 2>/dev/null || ulimit -n 131072 2>/dev/null || true
        export CARGO_BUILD_JOBS=1
        cd '$SCRIPT_DIR'
        npx tauri build
    "
fi

echo "✅ Build complete!"

