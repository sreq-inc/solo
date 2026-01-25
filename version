#!/bin/bash

# Script to run the version manager

echo "🚀 Compiling version manager..."
cargo build --release --bin version_manager 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Compilation complete!"
    echo ""
    ./target/release/version_manager
else
    echo "❌ Compilation error. Trying with cargo run..."
    cargo run --bin version_manager
fi
