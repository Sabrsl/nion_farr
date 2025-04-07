#!/bin/bash
set -e

echo "Starting build process..."

# Verify we're in the root directory
if [ ! -d "nionfar" ]; then
  echo "Error: nionfar directory not found. Are you in the project root?"
  exit 1
fi

# Navigate to backend directory
echo "Building backend..."
cd nionfar/backend
npm run build

echo "Backend built successfully!" 