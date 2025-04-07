#!/bin/bash
set -e

echo "Starting server..."

# Verify we're in the root directory
if [ ! -d "nionfar" ]; then
  echo "Error: nionfar directory not found. Are you in the project root?"
  exit 1
fi

# Navigate to backend directory
cd nionfar/backend
npm run start:prod 