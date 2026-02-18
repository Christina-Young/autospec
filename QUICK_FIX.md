# Quick Fix for "Too Many Open Files" Error

## Immediate Solution

Run this command in your terminal:

```bash
cd /home/christina/.cursor/autospec
ulimit -n 65536
npm run tauri:build
```

Or use the build script:

```bash
cd /home/christina/.cursor/autospec
./build.sh
```

## Permanent Fix

Add this to your `~/.bashrc` or `~/.zshrc`:

```bash
# Increase file descriptor limit for development
ulimit -n 65536
```

Then reload your shell:
```bash
source ~/.bashrc  # or source ~/.zshrc
```

## Why This Happens

Rust/Cargo compilation opens many files simultaneously. The default limit on some systems (often 1024) is too low for large Rust projects. Setting it to 65536 provides enough headroom.

## Alternative: Use the Safe Build Script

The `build.sh` script automatically handles this:

```bash
./build.sh
```

