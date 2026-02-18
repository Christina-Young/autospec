# Fixing "Too Many Open Files" Build Error

If you encounter the "Too many open files" error when building, try these solutions:

## Solution 0: Use the Build Script (Easiest)

I've created a build script that handles this automatically:
```bash
cd /home/christina/.cursor/autospec
./build.sh
```

This script will:
- Increase the file descriptor limit
- Limit Cargo parallel jobs
- Run the build

## Solution 1: Increase File Descriptor Limit (Recommended)

### Temporary (for current session):
```bash
ulimit -n 65536
cd /home/christina/.cursor/autospec
npm run tauri:build
```

### Permanent (add to ~/.bashrc or ~/.zshrc):
```bash
echo "ulimit -n 65536" >> ~/.bashrc
source ~/.bashrc
```

## Solution 2: Limit Cargo Parallel Jobs

I've created a `.cargo/config.toml` file that limits parallel compilation. This should help reduce file descriptor usage.

If it still fails, you can further reduce parallelism:
```bash
cd /home/christina/.cursor/autospec/src-tauri
# Edit .cargo/config.toml and set jobs = 1
```

## Solution 3: Clean Build Cache

Sometimes a corrupted build cache causes issues:
```bash
cd /home/christina/.cursor/autospec
rm -rf src-tauri/target
npm run tauri:build
```

## Solution 4: Build with Limited Parallelism

Set environment variable before building:
```bash
cd /home/christina/.cursor/autospec
CARGO_BUILD_JOBS=1 npm run tauri:build
```

## Solution 5: System-Wide Configuration

If you have sudo access, you can increase system limits:

1. Edit `/etc/security/limits.conf`:
```bash
sudo nano /etc/security/limits.conf
```

Add these lines:
```
* soft nofile 65536
* hard nofile 65536
```

2. Log out and log back in, or run:
```bash
ulimit -n 65536
```

## Quick Fix Command

Run this before building:
```bash
ulimit -n 65536 && cd /home/christina/.cursor/autospec && npm run tauri:build
```

