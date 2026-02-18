#!/bin/bash
# Final build script - builds Rust first, then bundles with minimal file operations

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔧 Setting environment..."
# Set maximum possible limit
for limit in 262144 131072 65536 32768 16384; do
    if ulimit -n $limit 2>/dev/null; then
        echo "✅ File descriptor limit set to: $limit"
        break
    fi
done

export CARGO_BUILD_JOBS=1

echo ""
echo "📦 Step 1: Building frontend..."
npm run build

echo ""
echo "🦀 Step 2: Building Rust backend (this may take several minutes)..."
cd src-tauri

# Build release version directly with cargo
if command -v prlimit &> /dev/null; then
    prlimit --nofile=262144:262144 -- cargo build --release --jobs 1
else
    cargo build --release --jobs 1
fi

cd ..

echo ""
echo "🎯 Step 3: Creating Tauri bundle..."
echo "⚠️  Note: If this step fails with 'too many open files', the Rust binary"
echo "    is already built at: src-tauri/target/release/autospec"
echo "    You can run the app directly or manually create the bundle."
echo ""

# Try to use tauri bundle command if available (does less file scanning)
BUNDLE_CMD=""
if npx tauri bundle --help &>/dev/null; then
    BUNDLE_CMD="bundle"
elif npx tauri --help 2>/dev/null | grep -q "bundle"; then
    BUNDLE_CMD="bundle"
else
    BUNDLE_CMD="build"
fi

# Use prlimit with maximum settings
if command -v prlimit &> /dev/null; then
    echo "Using prlimit with $BUNDLE_CMD command..."
    # Try with very high limit and ensure it propagates
    prlimit --nofile=524288:524288 -- bash -c "
        ulimit -n 524288 2>/dev/null || ulimit -n 262144 2>/dev/null || true
        export CARGO_BUILD_JOBS=1
        cd '$SCRIPT_DIR'
        npx tauri $BUNDLE_CMD
    " || {
        echo ""
        echo "❌ Tauri CLI still hitting file limit. The Rust binary is built at:"
        echo "   src-tauri/target/release/autospec"
        echo ""
        echo "You can:"
        echo "1. Close other applications (Firefox, etc.) and try again"
        echo "2. Run the binary directly: ./src-tauri/target/release/autospec"
        echo "3. Manually create bundle (see BUILD_INSTRUCTIONS.md)"
        exit 1
    }
else
    # Fallback without prlimit
    bash -c "
        ulimit -n 524288 2>/dev/null || ulimit -n 262144 2>/dev/null || true
        export CARGO_BUILD_JOBS=1
        cd '$SCRIPT_DIR'
        npx tauri $BUNDLE_CMD
    " || {
        echo ""
        echo "❌ Build failed. Rust binary is at: src-tauri/target/release/autospec"
        exit 1
    }
fi

echo ""
echo "✅ Build complete! Check src-tauri/target/release/bundle/ for installers"

