# URGENT: Too Many Files Already Open

## The Real Problem

Your system currently has **2.6 million files open**. Even with high limits, Tauri can't get enough file descriptors because they're all being used by other processes (QEMU, Firefox, etc.).

## Immediate Solution: Close Heavy Applications

**Before running dev mode, close these:**

1. **QEMU** (using many file descriptors):
   ```bash
   # Check if QEMU is running
   ps aux | grep qemu
   
   # If you can stop it (may require sudo):
   sudo systemctl stop qemu  # or however you manage it
   ```

2. **Firefox** (if running):
   - Close all Firefox windows
   - Or: `pkill firefox`

3. **Other heavy applications**

**Then try:**
```bash
cd /home/christina/.cursor/autospec
ulimit -n 1048576
npm run tauri:dev
```

## Alternative: Run Frontend Only

If you can't close QEMU, test the frontend without Tauri:

```bash
cd /home/christina/.cursor/autospec
./dev-vite-only.sh
```

Open: http://localhost:1420

**Note**: Tauri features won't work, but you can test the React UI.

## Check File Usage

See what's using files:

```bash
# See processes using most files
lsof 2>/dev/null | awk '{print $1, $2}' | sort | uniq -c | sort -rn | head -20
```

## Why This Happens

- QEMU virtual machine is running and using many file descriptors
- Firefox with many tabs uses many file descriptors  
- System has 2.6M files open total
- Tauri CLI needs additional files to scan/build
- No room left even with high limits

## Best Solution

**Close QEMU temporarily** while developing:

```bash
# If QEMU is managed by systemd or a service
sudo systemctl stop qemu
# or find the process and stop it

# Then run dev mode
cd /home/christina/.cursor/autospec
ulimit -n 1048576
npm run tauri:dev
```

This should free up enough file descriptors for Tauri to work.

