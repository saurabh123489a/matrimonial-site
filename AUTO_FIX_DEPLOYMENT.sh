#!/bin/bash

# Auto-fix Deployment Script
# This script automates the deployment fixes

set -e

echo "🔧 Auto-Fixing Deployment Issues"
echo "================================="
echo ""

JWT_SECRET="ba666562a115c1bf60e4ee484dcc3afbb5e9dfff6bd27487ab41e32134b69689"

echo "✅ Generated Values:"
echo "   JWT_SECRET: $JWT_SECRET"
echo ""

echo "📋 Railway Environment Variables to Add:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "PORT=5050"
echo "NODE_ENV=production"
echo "MONGODB_URI=<SETUP_TUNNEL_FIRST>"
echo "JWT_SECRET=$JWT_SECRET"
echo "JWT_EXPIRES_IN=7d"
echo "ALLOWED_ORIGINS=https://ekgahoi.vercel.app,https://matrimonial-site-*.vercel.app"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🚀 Steps to Complete:"
echo ""
echo "1. Set up MongoDB tunnel in a separate terminal:"
echo "   cloudflared tunnel --url tcp://localhost:27017"
echo "   (Copy the URL and update MONGODB_URI above)"
echo ""
echo "2. Go to Railway Variables page:"
echo "   https://railway.com/project/372faae2-7198-4d68-ae0d-4477ea089be7/service/a0788881-31a2-4d7d-96f7-70b334466840/variables"
echo ""
echo "3. Click 'New Variable' and add each variable above"
echo ""
echo "4. Go to Settings → Networking → Generate Domain"
echo ""
echo "5. Update Vercel NEXT_PUBLIC_API_URL with Railway URL"
echo ""
echo "✅ Script ready! Follow steps above."

