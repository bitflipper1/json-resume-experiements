#!/bin/bash

echo "🚀 Resume Generator Setup Script"
echo "================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating template..."
    cat > .env << 'EOF'
ANTHROPIC_API_KEY=your_claude_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
BING_SEARCH_API_KEY=your_bing_api_key_here
EOF
    echo "✅ Created .env file - please add your API keys!"
    echo ""
fi

# Install main dependencies
echo "📦 Installing main server dependencies..."
npm install
echo ""

# Install formatter service dependencies
echo "📦 Installing formatter service dependencies..."
cd formatter-service
npm install
cd ..
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your API keys to the .env file"
echo "2. Run: npm run dev (in one terminal)"
echo "3. Run: cd formatter-service && npm run dev (in another terminal)"
echo "4. Open: http://localhost:3000"
echo ""
echo "🌐 Live demo: https://bitflipper1.github.io/json-resume-experiements/"
