#!/bin/bash

# Compile the Rust code with rustc
echo "Compiling Rust code..."
rustc ./build.rs && ./build

# Check if compilation was successful
if [ $? -eq 0 ]; then
    echo "Compilation successful."
else
    echo "Compilation failed."
    exit 1
fi

# Remove the build directory after compilation
echo "Removing build directory..."
rm -rf ./build
