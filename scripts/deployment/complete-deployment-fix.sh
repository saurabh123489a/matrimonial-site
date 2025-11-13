#!/bin/bash

# Complete Deployment Fix Script
# This script uses Railway CLI to configure everything

set -e

echo "🔧 Complete Deployment Fix"
echo "=========================="
echo ""

JWT_SECRET="ba666562a115c1bf60e4ee484dcc3afbb5e9dfff6bd27487ab41e32134b69689"

echo "📋 Variables to Add:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "PORT=5050"
echo "NODE_ENV=production"
echo "MONGODB_URI=<TUNNEL_URL>"
echo "JWT_SECRET=$JWT_SECRET"
echo "JWT_EXPIRES_IN=7d"
echo "ALLOWED_ORIGINS=https://ekgahoi.vercel.app,https://matrimonial-site-*.vercel.app"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔍 Current Status:"
echo "  • MongoDB: $(docker ps | grep -q matrimonial-mongo && echo '✅ Running' || echo '❌ Not running')"
echo "  • Tunnel: $(ps aux | grep -q 'cloudflared tunnel' && echo '✅ Running' || echo '❌ Not running')"
echo ""

echo "📝 Steps to Complete:"
echo ""
echo "1. Get Tunnel URL:"
echo "   Check cloudflared output or run:"
echo "   cloudflared tunnel --url tcp://localhost:27017"
echo "   Look for line: 'tcp://<host>:<port>'"
echo "   Convert to: mongodb://<host>:<port>/matrimonial"
echo ""
echo "2. Add all variables in Railway (page is open)"
echo ""
echo "3. Expose service: Settings → Networking → Generate Domain"
echo ""
echo "4. Update Vercel: NEXT_PUBLIC_API_URL = <railway-url>/api"
echo ""

