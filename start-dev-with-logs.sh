#!/bin/bash

# Development startup script with comprehensive logging

echo "🚀 Starting Datacentrix Cloud Frontend with Enhanced Logging..."

# Kill any existing processes on port 3000
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Clear Next.js cache
echo "🗑️  Clearing Next.js cache..."
rm -rf .next

# Export development environment with debug logging
export NODE_ENV=development
export PORT=3000
export DEBUG=* # Enable all debug logs
export NODE_OPTIONS="--trace-warnings" # Show warning stack traces

# Create logs directory
mkdir -p logs

# Start the development server with logging
echo "🎯 Starting Next.js on port $PORT with full logging..."
echo "📋 Logs will be saved to logs/dev-server.log"

# Run with verbose logging
npm run dev 2>&1 | tee logs/dev-server.log

# If npm run dev fails, provide helpful error message
if [ $? -ne 0 ]; then
    echo "❌ Failed to start development server!"
    echo "📋 Check logs/dev-server.log for details"
    tail -50 logs/dev-server.log
    exit 1
fi