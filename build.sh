#!/bin/bash
# Build script with file descriptor limit handling

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Increase file descriptor limit - try multiple methods
ulimit -n 65536 2>/dev/null || ulimit -n 32768 2>/dev/null || ulimit -n 16384 2>/dev/null || true

# Verify the limit was set
CURRENT_LIMIT=$(ulimit -n)
echo "File descriptor limit: $CURRENT_LIMIT"

# Set Cargo to use minimal parallelism to reduce file descriptor usage
export CARGO_BUILD_JOBS=1
export RUSTFLAGS="-C link-arg=-fuse-ld=lld" 2>/dev/null || true

# Also set in Cargo config via environment
export __CARGO_TEST_CHANNEL_OVERRIDE_DO_NOT_USE_THIS=""

# Use prlimit if available to ensure child processes inherit the limit
if command -v prlimit &> /dev/null; then
    echo "Using prlimit to set file descriptor limit for child processes"
    exec prlimit --nofile=65536:65536 -- npx tauri build
else
    # Fallback: use bash -c to ensure ulimit is in the same shell
    echo "Using bash wrapper to maintain ulimit"
    bash -c "ulimit -n 65536 2>/dev/null || ulimit -n 32768 2>/dev/null || true; export CARGO_BUILD_JOBS=1; exec npx tauri build"
fi

