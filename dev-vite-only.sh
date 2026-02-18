#!/bin/bash
# Run only Vite dev server - bypasses Tauri CLI entirely
# Use this to test the frontend while Tauri CLI issues are resolved

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "📦 Starting Vite dev server only..."
echo ""
echo "⚠️  Note: This runs only the frontend (React)."
echo "   Tauri backend features won't work, but you can test the UI."
echo ""
echo "🌐 Frontend will be available at: http://localhost:1420"
echo "   Press Ctrl+C to stop"
echo ""

npm run dev

