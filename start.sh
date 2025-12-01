#!/bin/bash

echo "🚀 Starting Resume Generator..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Run ./setup.sh first to create it."
    exit 1
fi

# Check if API keys are configured
if grep -q "your_.*_api_key_here" .env; then
    echo "⚠️  Warning: Default API keys detected in .env"
    echo "Please update .env with your actual API keys"
    echo ""
fi

echo "Starting servers..."
echo "Main server will run on http://localhost:3000"
echo "Formatter service will run on http://localhost:3002"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers in background
npm run dev &
MAIN_PID=$!

cd formatter-service
npm run dev &
FORMATTER_PID=$!
cd ..

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $MAIN_PID 2>/dev/null
    kill $FORMATTER_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C
trap cleanup INT TERM

# Wait for both processes
wait
