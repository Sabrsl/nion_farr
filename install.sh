#!/bin/bash
set -e

echo "Starting installation process..."

# Verify we're in the root directory
if [ ! -d "nionfar" ]; then
  echo "Error: nionfar directory not found. Are you in the project root?"
  exit 1
fi

# Navigate to backend directory
echo "Installing backend dependencies..."
cd nionfar/backend
npm install

echo "Backend dependencies installed successfully!" 