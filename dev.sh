#!/bin/bash
# Development script that works around "too many open files" error

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔧 Setting environment for development..."
# Set maximum file descriptor limit
for limit in 524288 262144 131072 65536; do
    if ulimit -n $limit 2>/dev/null; then
        echo "✅ File descriptor limit set to: $limit"
        break
    fi
done

CURRENT_LIMIT=$(ulimit -n)
echo "Current limit: $CURRENT_LIMIT"

# Set minimal parallelism
export CARGO_BUILD_JOBS=1

echo ""
echo "🚀 Starting Tauri dev server..."
echo "   (This may take a moment on first run)"
echo ""

# Use prlimit if available to ensure child processes inherit the limit
if command -v prlimit &> /dev/null; then
    prlimit --nofile=524288:524288 -- npm run tauri:dev
else
    # Fallback: use bash wrapper
    bash -c "
        ulimit -n 524288 2>/dev/null || ulimit -n 262144 2>/dev/null || true
        export CARGO_BUILD_JOBS=1
        cd '$SCRIPT_DIR'
        npm run tauri:dev
    "
fi

