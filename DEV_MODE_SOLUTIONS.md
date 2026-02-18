# Development Mode - Complete Solutions

## The Problem

The Tauri CLI (`tauri dev`) opens too many files during startup, hitting your system's file descriptor limit. This happens even with high limits because:
1. Tauri CLI scans the entire project directory
2. Other processes (Firefox, QEMU) are using many file descriptors
3. The limit might not be propagating to child processes

## Solution 1: Close Other Applications (Easiest)

**Before running the dev server, close heavy applications:**

```bash
# Close Firefox, QEMU, and other heavy applications
# Then try:
cd /home/christina/.cursor/autospec
ulimit -n 524288
npm run tauri:dev
```

This is often the quickest fix.

## Solution 2: Use Aggressive Dev Script

```bash
cd /home/christina/.cursor/autospec
./dev-aggressive.sh
```

This script:
- Sets maximum possible file limit
- Uses prlimit to ensure child processes inherit it
- Shows how many files are currently open

## Solution 3: Run Frontend Only (For UI Testing)

If you just want to test the React UI without Tauri:

```bash
cd /home/christina/.cursor/autospec
./dev-vite-only.sh
```

Then open: http://localhost:1420

**Note**: Tauri features (file save, AI chat) won't work, but you can test the UI.

## Solution 4: System-Wide Configuration

If you have sudo access, increase system limits:

1. **Edit limits.conf**:
   ```bash
   sudo nano /etc/security/limits.conf
   ```

2. **Add these lines**:
   ```
   * soft nofile 1048576
   * hard nofile 1048576
   ```

3. **Log out and back in**, or run:
   ```bash
   ulimit -n 1048576
   ```

## Solution 5: Check What's Using Files

See what's consuming file descriptors:

```bash
# See top processes by open files
lsof 2>/dev/null | awk '{print $2}' | sort | uniq -c | sort -rn | head -10

# Or by process name
ps aux | while read line; do
    pid=$(echo $line | awk '{print $2}')
    count=$(lsof -p $pid 2>/dev/null | wc -l)
    if [ "$count" -gt 1000 ]; then
        echo "$count files: $line"
    fi
done
```

Close processes that are using too many files.

## Solution 6: Build Rust First, Then Run

Build the Rust backend separately, then the Tauri CLI has less to do:

```bash
cd /home/christina/.cursor/autospec
ulimit -n 524288

# Build Rust backend first
cd src-tauri
CARGO_BUILD_JOBS=1 cargo build
cd ..

# Now run dev (should be faster)
npm run tauri:dev
```

## Recommended Approach

1. **First**: Close Firefox, QEMU, and other heavy apps
2. **Then**: Try `./dev-aggressive.sh`
3. **If still failing**: Use `./dev-vite-only.sh` to test frontend
4. **For permanent fix**: Configure system limits (Solution 4)

## Quick Test

Try this sequence:

```bash
# 1. Close heavy applications
# 2. Set very high limit
ulimit -n 1048576

# 3. Check current usage
echo "Open files: $(lsof 2>/dev/null | wc -l)"

# 4. Try dev mode
cd /home/christina/.cursor/autospec
npm run tauri:dev
```

## Why This Is Happening

Your system shows ~2.6 million open file descriptors, which is very high. The Tauri CLI needs to open additional files to:
- Scan project structure
- Read configuration files
- Check dependencies
- Build Rust code

Even with high limits, if the system is already using most of them, there's no room for Tauri.

## Alternative: Use a Clean Terminal Session

Start a completely fresh terminal with minimal processes:

1. Close all applications
2. Open a new terminal
3. Run: `ulimit -n 1048576 && cd /home/christina/.cursor/autospec && npm run tauri:dev`

This gives Tauri the maximum available file descriptors.

