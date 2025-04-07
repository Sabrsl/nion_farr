#!/bin/bash
set -e

echo "Starting production server..."

# Verify we're in the root directory
if [ ! -d "nionfar" ]; then
  echo "Error: nionfar directory not found. Are you in the project root?"
  exit 1
fi

# Show current directory and environment
echo "Current directory: $(pwd)"
echo "Environment: $NODE_ENV"
echo "PORT: $PORT"

# Navigate to backend directory
echo "Navigating to backend directory..."
cd nionfar/backend

# Check available scripts
echo "Available npm scripts:"
npm run --silent | grep -v "^$" || echo "No scripts found"

# Start the server
echo "Starting backend server..."
npm run start:prod 