#!/bin/bash

# Development startup script with proper error handling

echo "🚀 Starting Datacentrix Cloud Frontend Development Server..."

# Kill any existing processes on port 3000
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Clear cache and build files if there are issues
if [ "$1" == "--clean" ]; then
    echo "🗑️  Clearing cache and build files..."
    rm -rf .next
    rm -rf node_modules/.cache
fi

# Export development environment
export NODE_ENV=development
export PORT=3000

# Start the development server
echo "🎯 Starting Next.js on port $PORT..."
npm run dev

# If npm run dev fails, provide helpful error message
if [ $? -ne 0 ]; then
    echo "❌ Failed to start development server!"
    echo "Try running: ./start-dev.sh --clean"
    exit 1
fi