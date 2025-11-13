#!/bin/bash

# MongoDB Tunnel Setup Script
# This script helps you expose your local MongoDB to Railway

echo "🔧 MongoDB Tunnel Setup"
echo "======================"
echo ""

# Check if MongoDB Docker container is running
if ! docker ps | grep -q "matrimonial-mongo"; then
    echo "❌ MongoDB container 'matrimonial-mongo' is not running!"
    echo "   Start it with: cd backend && docker-compose up -d mongo"
    exit 1
fi

echo "✅ MongoDB container is running"
echo ""

# Check for tunneling tools
if command -v ngrok &> /dev/null; then
    echo "✅ ngrok found!"
    echo ""
    echo "Starting ngrok tunnel..."
    echo "📝 Copy the 'Forwarding' URL (e.g., tcp://0.tcp.ngrok.io:12345)"
    echo "📝 Convert it to MongoDB URI: mongodb://0.tcp.ngrok.io:12345/matrimonial"
    echo ""
    echo "Press Ctrl+C to stop the tunnel"
    echo ""
    ngrok tcp 27017

elif command -v cloudflared &> /dev/null; then
    echo "✅ cloudflared found!"
    echo ""
    echo "Starting cloudflared tunnel..."
    echo "📝 Copy the URL from the output"
    echo "📝 Use it in MongoDB URI format: mongodb://tunnel-url/matrimonial"
    echo ""
    echo "Press Ctrl+C to stop the tunnel"
    echo ""
    cloudflared tunnel --url tcp://localhost:27017

else
    echo "❌ No tunneling tool found!"
    echo ""
    echo "Install one of the following:"
    echo ""
    echo "Option 1: ngrok (Free, requires signup)"
    echo "  - Download: https://ngrok.com/download"
    echo "  - Or: brew install ngrok/ngrok/ngrok"
    echo ""
    echo "Option 2: cloudflared (Free, no signup)"
    echo "  - Install: brew install cloudflared"
    echo "  - Or download: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
    echo ""
    echo "After installation, run this script again."
    exit 1
fi

