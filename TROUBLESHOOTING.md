# Troubleshooting Build Issues

## "Too Many Open Files" Error

This error occurs when the system runs out of file descriptors during compilation. Here are solutions in order of effectiveness:

### Solution 1: Clean Build (Try This First)

Sometimes accumulated build artifacts cause issues:

```bash
cd /home/christina/.cursor/autospec
./build-clean.sh
```

This script:
- Cleans build caches
- Sets file descriptor limits
- Builds with minimal parallelism

### Solution 2: Use prlimit (Most Reliable)

If `prlimit` is available (it is on your system), it ensures child processes inherit limits:

```bash
cd /home/christina/.cursor/autospec
ulimit -n 65536
prlimit --nofile=65536:65536 -- npm run tauri:build
```

### Solution 3: Set System-Wide Limits

Edit `/etc/security/limits.conf` (requires sudo):

```bash
sudo nano /etc/security/limits.conf
```

Add:
```
* soft nofile 65536
* hard nofile 65536
```

Then log out and back in.

### Solution 4: Build in Stages

Build the frontend first, then the Rust backend:

```bash
cd /home/christina/.cursor/autospec
ulimit -n 65536
npm run build  # Build frontend only
cd src-tauri
CARGO_BUILD_JOBS=1 cargo build --release  # Build Rust only
```

### Solution 5: Check Current Limits

See what's actually set:

```bash
ulimit -a
cat /proc/sys/fs/file-max
```

### Why This Happens

- Rust/Cargo opens many files during compilation
- Tauri CLI also opens many files when scanning the project
- Default limits (often 1024) are too low for large projects
- Child processes may not inherit parent ulimit settings

### Current Configuration

- Cargo config: `jobs = 1` (minimal parallelism)
- Build script: Uses `prlimit` when available
- Fallback: Sets ulimit in bash wrapper

