#!/bin/bash

echo "========================================="
echo "AUTOMATIC FIX AND RESTART SCRIPT"
echo "========================================="
echo ""

# Get to the right directory
cd /Users/mattmcglothlin/Projects/json-resume-experiments

# Pull latest code
echo "1. Pulling latest code from GitHub..."
git pull origin main
echo ""

# Kill existing servers
echo "2. Stopping old servers..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No server on port 3000"
lsof -ti:3002 | xargs kill -9 2>/dev/null || echo "No server on port 3002"
sleep 2
echo ""

# Start main server in background
echo "3. Starting main server on port 3000..."
node server.js > /tmp/main-server.log 2>&1 &
MAIN_PID=$!
sleep 3

# Check if main server started
if lsof -ti:3000 > /dev/null; then
    echo "✅ Main server started (PID: $MAIN_PID)"
else
    echo "❌ Main server failed to start. Check /tmp/main-server.log"
    tail -20 /tmp/main-server.log
    exit 1
fi
echo ""

# Start formatter service in background
echo "4. Starting formatter service on port 3002..."
cd formatter-service
node src/server.js > /tmp/formatter-service.log 2>&1 &
FORMATTER_PID=$!
cd ..
sleep 3

# Check if formatter started
if lsof -ti:3002 > /dev/null; then
    echo "✅ Formatter service started (PID: $FORMATTER_PID)"
else
    echo "❌ Formatter service failed to start. Check /tmp/formatter-service.log"
    tail -20 /tmp/formatter-service.log
    exit 1
fi
echo ""

# Test the servers
echo "5. Testing servers..."
echo ""

# Test main server
echo "Testing main server (GET /)..."
if curl -s -f http://localhost:3000 > /dev/null; then
    echo "✅ Main server responding"
else
    echo "❌ Main server not responding"
fi

# Test parse endpoint
echo "Testing parse endpoint..."
PARSE_RESULT=$(curl -s -X POST http://localhost:3000/api/parse \
  -H "Content-Type: application/json" \
  -d '{"resumeText":"Test User\nEngineer\ntest@email.com"}' | grep -o '"success":true')

if [ "$PARSE_RESULT" = '"success":true' ]; then
    echo "✅ Parse endpoint working"
else
    echo "❌ Parse endpoint failed"
fi

# Test formatter service
echo "Testing formatter service..."
FORMATTER_RESULT=$(curl -s -X POST http://localhost:3002/api/render/html \
  -H "Content-Type: application/json" \
  -d '{"basics":{"name":"Test"}}' | grep -o "<title>")

if [ "$FORMATTER_RESULT" = "<title>" ]; then
    echo "✅ Formatter service working"
else
    echo "❌ Formatter service failed"
fi

# Test format proxy
echo "Testing format proxy endpoint..."
FORMAT_RESULT=$(curl -s -X POST http://localhost:3000/api/format \
  -H "Content-Type: application/json" \
  -d '{"basics":{"name":"Test User","label":"Engineer","email":"test@email.com"},"sections":{}}' | grep -o "<title>")

if [ "$FORMAT_RESULT" = "<title>" ]; then
    echo "✅ Format proxy working"
else
    echo "❌ Format proxy failed"
fi

echo ""
echo "========================================="
echo "SETUP COMPLETE!"
echo "========================================="
echo ""
echo "Servers running:"
echo "  Main server:      http://localhost:3000 (PID: $MAIN_PID)"
echo "  Formatter service: http://localhost:3002 (PID: $FORMATTER_PID)"
echo ""
echo "Server logs:"
echo "  Main: /tmp/main-server.log"
echo "  Formatter: /tmp/formatter-service.log"
echo ""
echo "To stop servers:"
echo "  kill $MAIN_PID $FORMATTER_PID"
echo ""
echo "Open your browser to: http://localhost:3000"
echo ""
echo "To view logs in real-time:"
echo "  tail -f /tmp/main-server.log"
echo "  tail -f /tmp/formatter-service.log"
echo ""
