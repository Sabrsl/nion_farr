#!/bin/bash
set -e

echo "Starting installation process..."

# Verify we're in the root directory
if [ ! -d "nionfar" ]; then
  echo "Error: nionfar directory not found. Are you in the project root?"
  exit 1
fi

# Install global dependencies
echo "Installing global dependencies..."
npm install -g rimraf @nestjs/cli

# Navigate to backend directory
echo "Installing backend dependencies..."
cd nionfar/backend
npm install

# Double-check NestJS CLI is installed
echo "Ensuring NestJS CLI is available..."
npm list @nestjs/cli || npm install @nestjs/cli

echo "Backend dependencies installed successfully!" 