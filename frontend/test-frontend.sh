#!/bin/bash

# Frontend Testing Script for Gotify
# This script helps test the refactored frontend with the backend

echo "🎵 Gotify Frontend Testing Script"
echo "=================================="

# Check if backend is running
echo "📡 Checking backend connection..."
if curl -s http://localhost:8080/api/v1/health > /dev/null 2>&1; then
    echo "✅ Backend is running on port 8080"
else
    echo "❌ Backend is not running. Please start the backend first."
    echo "   Run: cd ../.. && go run src/cmd/main.go"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start frontend in development mode
echo "🚀 Starting frontend development server..."
echo "   Frontend will be available at: http://localhost:3000"
echo "   Backend API is at: http://localhost:8080"
echo ""
echo "🔧 Testing checklist:"
echo "   □ Register a new user"
echo "   □ Login with credentials"
echo "   □ Create a song (ensure audio file exists in backend)"
echo "   □ Verify artist relationship displays correctly"
echo "   □ Test music player functionality"
echo "   □ Check responsive design on mobile"
echo ""

npm run dev
