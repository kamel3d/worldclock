#!/bin/bash

echo "🧪 Testing World Clock App"
echo ""

# Test 1: Check if HTTP server is running
echo "1️⃣  Testing HTTP server..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000 | grep -q "200"; then
    echo "✅ HTTP server is running on port 8000"
else
    echo "❌ HTTP server is NOT running"
    echo "   Start with: python3 -m http.server 8000"
    exit 1
fi

echo ""

# Test 2: Check if cities.json is accessible
echo "2️⃣  Testing cities.json..."
CITY_COUNT=$(curl -s http://localhost:8000/cities.json | grep -o '"name"' | wc -l)
if [ "$CITY_COUNT" -gt 10000 ]; then
    echo "✅ cities.json loaded successfully ($CITY_COUNT cities)"
else
    echo "❌ cities.json not accessible or incomplete"
    exit 1
fi

echo ""

# Test 3: Check if index.html is accessible
echo "3️⃣  Testing index.html..."
if curl -s http://localhost:8000/index.html | grep -q "World Clock"; then
    echo "✅ index.html is accessible"
else
    echo "❌ index.html is NOT accessible"
    exit 1
fi

echo ""

# Test 4: Check if ClientDatabaseService exists
echo "4️⃣  Testing ClientDatabaseService..."
if curl -s http://localhost:8000/index.html | grep -q "ClientDatabaseService"; then
    echo "✅ ClientDatabaseService found in HTML"
else
    echo "❌ ClientDatabaseService NOT found"
    exit 1
fi

echo ""
echo "✅ All tests passed!"
echo ""
echo "🌐 Open in browser: http://localhost:8000"
echo ""
