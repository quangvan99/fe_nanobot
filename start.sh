#!/bin/bash

# NanoBot Frontend - Start Script
# Serves the frontend application using Python's built-in HTTP server

PORT=${PORT:-8180}
HOST=${HOST:-0.0.0.0}

echo "🚀 Starting NanoBot Frontend..."
echo "📍 URL: http://localhost:$PORT"
echo "🔗 Backend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    python3 -m http.server $PORT --bind $HOST
elif command -v python &> /dev/null; then
    python -m http.server $PORT --bind $HOST
else
    echo "❌ Error: Python is not installed"
    echo "Please install Python 3 to run this server"
    exit 1
fi
