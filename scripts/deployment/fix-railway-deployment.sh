#!/bin/bash

# Fix Railway Backend Deployment
# This script helps set up the required environment variables

set -e

echo "🔧 Railway Backend Deployment Fixer"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if MongoDB is running
echo -e "${BLUE}📦 Checking MongoDB...${NC}"
if docker ps | grep -q matrimonial-mongo; then
    echo -e "${GREEN}✅ MongoDB container is running${NC}"
    MONGO_PORT=$(docker ps | grep matrimonial-mongo | awk '{print $NF}' | grep -oP '\d+->27017' | cut -d'>' -f1 || echo "27017")
    echo "   Port: $MONGO_PORT"
else
    echo -e "${RED}❌ MongoDB container not found${NC}"
    echo "   Please start MongoDB first: docker compose up -d mongo"
    exit 1
fi

echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Set up MongoDB tunnel before proceeding!${NC}"
echo ""
echo "Option 1: Using ngrok (if installed)"
echo "  ngrok tcp 27017"
echo ""
echo "Option 2: Using cloudflared (no signup)"
echo "  cloudflared tunnel --url tcp://localhost:27017"
echo ""
echo "After starting tunnel, you'll get a URL like:"
echo "  tcp://0.tcp.ngrok.io:12345"
echo ""
echo "Convert to MongoDB URI:"
echo "  mongodb://0.tcp.ngrok.io:12345/matrimonial"
echo ""

# Generate JWT secret
echo -e "${BLUE}🔐 Generating JWT Secret...${NC}"
if command -v node >/dev/null 2>&1; then
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    echo -e "${GREEN}✅ Generated JWT Secret:${NC}"
    echo "   $JWT_SECRET"
    echo ""
else
    echo -e "${YELLOW}⚠️  Node.js not found. Please generate JWT secret manually.${NC}"
    echo "   Run: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    JWT_SECRET="<generate-manually>"
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}📋 Environment Variables for Railway${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
echo "Add these in Railway Dashboard → Service → Variables:"
echo ""
echo "PORT=5050"
echo "NODE_ENV=production"
echo "MONGODB_URI=mongodb://<TUNNEL_HOST>:<TUNNEL_PORT>/matrimonial"
echo "JWT_SECRET=$JWT_SECRET"
echo "JWT_EXPIRES_IN=7d"
echo "ALLOWED_ORIGINS=https://ekgahoi.vercel.app,https://matrimonial-site-*.vercel.app"
echo ""
echo -e "${YELLOW}⚠️  Replace <TUNNEL_HOST> and <TUNNEL_PORT> with your tunnel URL${NC}"
echo ""

echo -e "${BLUE}📝 Next Steps:${NC}"
echo "1. Set up MongoDB tunnel (see above)"
echo "2. Add environment variables to Railway"
echo "3. Expose service publicly in Railway Settings → Networking"
echo "4. Update Vercel NEXT_PUBLIC_API_URL with Railway backend URL"
echo "5. Restart Railway service"
echo ""
echo -e "${GREEN}✅ Done! Check DEPLOYMENT_TEST_REPORT.md for detailed steps${NC}"
echo ""

