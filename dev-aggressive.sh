#!/bin/bash
# Aggressive dev script - tries multiple approaches to avoid file limit

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔧 Setting maximum file descriptor limit..."
# Try to set the absolute maximum
for limit in 1048576 524288 262144 131072 65536; do
    if ulimit -n $limit 2>/dev/null; then
        echo "✅ Set file descriptor limit to: $limit"
        break
    fi
done

CURRENT_LIMIT=$(ulimit -n)
echo "Current limit: $CURRENT_LIMIT"

# Check how many files are currently open
OPEN_FILES=$(lsof 2>/dev/null | wc -l)
echo "Currently open files: $OPEN_FILES"

if [ "$OPEN_FILES" -gt 100000 ]; then
    echo "⚠️  Warning: Many files are already open. Consider closing other applications."
fi

export CARGO_BUILD_JOBS=1

echo ""
echo "🚀 Starting Tauri dev with prlimit..."
echo ""

# Use prlimit with maximum settings and ensure it applies to all children
if command -v prlimit &> /dev/null; then
    # Try with very high limit and ensure it propagates to all children
    prlimit --nofile=1048576:1048576 -- bash -c "
        ulimit -n 1048576 2>/dev/null || ulimit -n 524288 2>/dev/null || ulimit -n 262144 2>/dev/null || true
        export CARGO_BUILD_JOBS=1
        cd '$SCRIPT_DIR'
        exec npm run tauri:dev
    "
else
    echo "❌ prlimit not available. Trying with bash wrapper..."
    bash -c "
        ulimit -n 1048576 2>/dev/null || ulimit -n 524288 2>/dev/null || ulimit -n 262144 2>/dev/null || true
        export CARGO_BUILD_JOBS=1
        cd '$SCRIPT_DIR'
        exec npm run tauri:dev
    "
fi

