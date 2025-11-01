#!/bin/bash

echo "🔍 Testing Deployment Status"
echo "============================"
echo ""

# Test Vercel Frontend
echo "📱 Testing Vercel Frontend..."
if curl -s -o /dev/null -w "%{http_code}" https://ekgahoi.vercel.app | grep -q "200"; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend not accessible"
fi

# Test MongoDB
echo ""
echo "📦 Testing Local MongoDB..."
if docker ps | grep -q matrimonial-mongo; then
    echo "✅ MongoDB container running"
else
    echo "❌ MongoDB container not running"
fi

# Check if Railway backend is set (requires manual check)
echo ""
echo "🚂 Railway Backend Status:"
echo "   ⚠️  Check manually in Railway dashboard"
echo "   Required:"
echo "   - Environment variables set"
echo "   - Service exposed publicly"
echo "   - MongoDB tunnel running"
echo ""

