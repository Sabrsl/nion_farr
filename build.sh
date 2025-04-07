#!/usr/bin/env bash
# Exit on error
set -e

echo "Navigating to backend directory..."
cd nionfar/backend

echo "Installing dependencies..."
npm install

echo "Building application..."
npm run build

echo "Build completed successfully!" 