# Workaround for "Too Many Open Files" Error

## The Problem

The Tauri CLI (`npx tauri build`) opens too many files when scanning your project, even after Rust is built. This is a known issue when:
- System has many processes running (Firefox, QEMU, etc.)
- Tauri CLI scans the entire project directory
- File descriptor limit is reached

## Solution: Build Rust Only (Recommended)

Since the Tauri CLI is the problem, build just the Rust backend:

```bash
cd /home/christina/.cursor/autospec
./build-rust-only.sh
```

This will:
1. Build the frontend
2. Build the Rust backend
3. Skip Tauri CLI bundling (which causes the error)

## Running the Application

After building, you can run the app directly:

```bash
cd /home/christina/.cursor/autospec
./src-tauri/target/release/autospec
```

The binary is fully functional - it just doesn't have an installer/bundle.

## Creating a Bundle (Optional)

If you need a distributable bundle/installer:

### Option 1: Close Other Applications

Close Firefox, QEMU, and other heavy applications, then:

```bash
cd /home/christina/.cursor/autospec
ulimit -n 524288
npx tauri build
```

### Option 2: Use a Clean Environment

Run the build in a clean terminal session with minimal processes:

```bash
# In a fresh terminal
cd /home/christina/.cursor/autospec
ulimit -n 524288
./build-final.sh
```

### Option 3: Build on a Different Machine

If you have access to another machine with fewer processes running, build there.

## Why This Happens

1. **Tauri CLI file scanning**: The CLI scans your entire project directory
2. **System file descriptor usage**: Other processes (Firefox, QEMU) are using many file descriptors
3. **Rust compilation**: Even though we build Rust separately, Tauri CLI still does its own scanning

## Current Status

✅ **Rust binary builds successfully** - You can run the app  
❌ **Tauri CLI bundling fails** - Due to file descriptor limit  
💡 **Workaround**: Run the binary directly, or close other apps to bundle

## Quick Start

```bash
# Build and run (no bundling needed for development)
cd /home/christina/.cursor/autospec
./build-rust-only.sh
./src-tauri/target/release/autospec
```

The app will work perfectly - you just won't have an installer until you can successfully run `tauri build`.

