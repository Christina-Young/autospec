# Running in Development Mode - Workarounds

## The Problem

Even `npm run tauri:dev` hits the "too many open files" error because the Tauri CLI scans files during startup.

## Solutions

### Option 1: Use the Dev Script (Recommended)

I've created a dev script that sets the file limit before running:

```bash
./dev.sh
```

This script:
- Sets a very high file descriptor limit
- Uses `prlimit` if available to ensure child processes inherit it
- Runs `npm run tauri:dev` with proper limits

### Option 2: Use the Safe Dev Script

```bash
npm run dev:safe
```

This is a npm script version that sets the limit.

### Option 3: Manual Setup

Set the limit manually before running:

```bash
ulimit -n 524288
npm run tauri:dev
```

### Option 4: Separate Vite and Cargo (Alternative)

If Tauri CLI still fails, run components separately:

```bash
./dev-direct.sh
```

This runs:
- Vite dev server (frontend) at http://localhost:1420
- Cargo build (backend) separately

**Note**: This won't have full Tauri integration, but you can test the frontend.

### Option 5: Permanent Fix

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# Increase file descriptor limit for development
ulimit -n 524288
```

Then reload:
```bash
source ~/.bashrc
```

After this, `npm run tauri:dev` should work normally.

## Recommended Approach

1. **First, try the permanent fix** (Option 5) - add to `~/.bashrc`
2. **If that doesn't work**, use `./dev.sh` script
3. **For testing frontend only**, use `./dev-direct.sh`

## Why This Happens

The Tauri CLI opens many files when:
- Scanning the project directory
- Reading configuration files
- Checking dependencies
- Building the Rust backend

With many processes running (Firefox, QEMU, etc.), the system runs out of file descriptors.

## Quick Test

Try this first:

```bash
ulimit -n 524288
npm run tauri:dev
```

If it works, add `ulimit -n 524288` to your `~/.bashrc` for a permanent fix.

