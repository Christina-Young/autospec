# Final Build Solution

## The Real Problem

Even when we try to build Rust separately, something is still calling `npm run tauri:build`, which triggers the Tauri CLI and causes the "too many open files" error.

## Solution: Pure Cargo Build (No npm, No Tauri CLI)

Use this script that completely bypasses npm scripts and Tauri CLI:

```bash
cd /home/christina/.cursor/autospec
./build-pure-cargo.sh
```

This script:
1. ✅ Uses `tsc` directly (TypeScript compiler)
2. ✅ Uses `vite` directly (frontend builder)
3. ✅ Uses `cargo` directly (Rust compiler)
4. ❌ **NO npm scripts** (avoids any hooks)
5. ❌ **NO Tauri CLI** (avoids file scanning)

## What This Builds

- **Frontend**: `dist/` directory with compiled React app
- **Backend**: `src-tauri/target/release/autospec` binary

## Running the Application

The binary might work, but Tauri apps typically need the full bundle structure. However, you can try:

```bash
cd /home/christina/.cursor/autospec
./src-tauri/target/release/autospec
```

## If You Need Full Tauri Bundle

The only way to get a proper Tauri bundle is to:

1. **Close heavy applications** (Firefox, QEMU, etc.)
2. **Set very high file limit**: `ulimit -n 524288`
3. **Run Tauri build**: `npx tauri build`

Or build on a machine with fewer processes running.

## Why This Works

By using tools directly (tsc, vite, cargo) instead of npm scripts, we avoid:
- npm script hooks that might call Tauri
- Tauri CLI file scanning
- Any build system overhead

The build is "raw" but should at least compile everything.

