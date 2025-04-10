#!/bin/bash

echo "Starting Railway build script..."

# Ensure we're in the backend directory
cd "$(dirname "$0")/.."

# Use specific Node version
echo "Setting up Node environment..."
if command -v nvm &> /dev/null; then
  nvm use 18
fi

# Install dependencies
echo "Installing dependencies..."
npm ci || npm install

# Run the build
echo "Building project..."
npm run build

# Check if build succeeded
if [ ! -d "dist" ] || [ ! -f "dist/main.js" ]; then
  echo "Build failed! dist/main.js is missing."
  exit 1
fi

echo "Build completed successfully!"
exit 0 