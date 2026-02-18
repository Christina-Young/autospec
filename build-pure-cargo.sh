#!/bin/bash
# Pure Cargo build - absolutely NO Tauri CLI, NO npm scripts

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔧 Setting environment..."
ulimit -n 262144 2>/dev/null || ulimit -n 131072 2>/dev/null || true
export CARGO_BUILD_JOBS=1

echo ""
echo "📦 Step 1: Type checking TypeScript..."
npx --yes tsc --noEmit

echo ""
echo "📦 Step 2: Building frontend with Vite (direct, no npm scripts)..."
# Call vite directly, not through npm
npx --yes vite build --outDir dist

echo ""
echo "🦀 Step 3: Building Rust with Cargo ONLY..."
cd src-tauri

if command -v prlimit &> /dev/null; then
    prlimit --nofile=262144:262144 -- cargo build --release --jobs 1
else
    cargo build --release --jobs 1
fi

cd ..

echo ""
echo "✅ Pure Cargo build complete!"
echo ""
echo "📦 Output:"
echo "   - Frontend: dist/"
echo "   - Binary: src-tauri/target/release/autospec"
echo ""
echo "🚀 Run with:"
echo "   ./src-tauri/target/release/autospec"
echo ""
echo "This build used:"
echo "   ✅ TypeScript compiler (tsc)"
echo "   ✅ Vite (direct)"
echo "   ✅ Cargo (direct)"
echo "   ❌ NO npm scripts"
echo "   ❌ NO Tauri CLI"

