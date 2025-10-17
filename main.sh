#!/bin/bash

set -e  # Exit on any error

echo "🚀 Starting Solo release build..."
echo ""

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
bun install
echo "✅ Dependencies installed"
echo ""

# Step 2: Run tests (optional but recommended)
echo "🧪 Running tests..."
if bun run test 2>/dev/null; then
    echo "✅ Tests passed"
else
    echo "⚠️  Tests skipped or failed (continuing anyway)"
fi
echo ""

# Step 3: Build frontend
echo "🏗️  Building frontend..."
bun run build
echo "✅ Frontend built"
echo ""

# Step 4: Build Tauri app
echo "📱 Building Tauri application..."
bun tauri build
echo "✅ Tauri app built"
echo ""

# Step 5: Show build artifacts location
echo "✨ Build complete!"
echo ""
echo "📦 Build artifacts are located in:"
echo "   - macOS: src-tauri/target/release/bundle/dmg/"
echo "   - Linux: src-tauri/target/release/bundle/appimage/"
echo "   - Windows: src-tauri/target/release/bundle/msi/"
echo ""
echo "🎉 Release build finished successfully!"
