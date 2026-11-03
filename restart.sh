#!/bin/bash

echo "🔄 Restarting World Clock Server..."
echo ""

# Find and kill all processes running on port 8000
echo "📍 Finding processes on port 8000..."
PIDS=$(lsof -ti:8000)

if [ -z "$PIDS" ]; then
    echo "ℹ️  No process found on port 8000"
else
    echo "🔪 Killing processes: $PIDS"
    kill -9 $PIDS
    sleep 1
    echo "✅ Processes killed"
fi

echo ""
echo "🚀 Starting Python HTTP server on port 8000..."
echo "📂 Serving from: $(pwd)"
echo ""
echo "🌐 Open in browser: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 -m http.server 8000
