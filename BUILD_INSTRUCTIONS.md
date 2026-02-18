# Build Instructions for AutoSpec

## The Problem

The "Too many open files" error occurs because:
1. Your system has many processes (Firefox, QEMU) already using file descriptors
2. Tauri CLI scans many files during build
3. Rust/Cargo compilation opens many files simultaneously

## Recommended Solution: Build in Stages

Use the `build-final.sh` script which builds components separately:

```bash
cd /home/christina/.cursor/autospec
./build-final.sh
```

This script:
1. Builds the frontend first
2. Builds Rust backend with Cargo directly (avoids Tauri CLI file scanning)
3. Then uses Tauri to bundle (minimal file operations since Rust is already built)

## Alternative: Manual Step-by-Step Build

If the script still fails, build manually:

```bash
cd /home/christina/.cursor/autospec

# 1. Set file descriptor limit
ulimit -n 262144

# 2. Build frontend
npm run build

# 3. Build Rust backend directly (bypasses Tauri CLI)
cd src-tauri
CARGO_BUILD_JOBS=1 cargo build --release
cd ..

# 4. Now Tauri should just bundle (less file scanning)
CARGO_BUILD_JOBS=1 npx tauri build
```

## If Still Failing: Close Other Applications

The issue might be that other applications (Firefox, QEMU) are using too many file descriptors. Try:

1. Close Firefox and other heavy applications
2. Then run the build script

## Check Current File Descriptor Usage

```bash
# See how many are in use
lsof 2>/dev/null | wc -l

# See your current limit
ulimit -n
```

## Permanent Fix

Add to `~/.bashrc`:

```bash
# Increase file descriptor limit for development
ulimit -n 262144
```

Then reload: `source ~/.bashrc`

