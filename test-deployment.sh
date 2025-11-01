#!/bin/bash

# Comprehensive Deployment Test Script
# Tests: Frontend (Vercel) + Backend (Railway) + DB (Local Docker)

echo "🔍 COMPREHENSIVE DEPLOYMENT TEST"
echo "================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
}

check_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Test 1: Local MongoDB Docker
echo "1️⃣  Testing Local MongoDB Docker"
echo "─────────────────────────────────"
if docker ps | grep -q "matrimonial-mongo"; then
    check_pass "MongoDB container is running"
    
    # Test connection
    cd backend
    if node check-db.js > /dev/null 2>&1; then
        check_pass "Database connection successful"
        DB_STATUS=$(cd backend && node check-db.js 2>&1 | grep "Collections found" | awk '{print $3}')
        echo "   📊 Collections: $DB_STATUS"
    else
        check_fail "Database connection failed"
    fi
    cd ..
else
    check_fail "MongoDB container is not running"
    echo "   💡 Start with: cd backend && docker-compose up -d mongo"
fi
echo ""

# Test 2: Backend on Railway
echo "2️⃣  Testing Backend on Railway"
echo "──────────────────────────────"
read -p "Enter your Railway backend URL (e.g., https://your-app.up.railway.app): " RAILWAY_URL

if [ -z "$RAILWAY_URL" ]; then
    check_info "Skipping Railway test (URL not provided)"
    echo "   💡 Get URL from Railway dashboard → Your Service → Settings → Domains"
else
    # Test health endpoint
    HEALTH_URL="${RAILWAY_URL%/}/api/health"
    echo "   Testing: $HEALTH_URL"
    
    if curl -s -f "$HEALTH_URL" > /dev/null 2>&1; then
        check_pass "Backend is accessible"
        
        # Get health data
        HEALTH_RESPONSE=$(curl -s "$HEALTH_URL")
        if echo "$HEALTH_RESPONSE" | grep -q "status"; then
            echo "   📊 Health check response received"
        fi
    else
        check_fail "Backend is not accessible"
        echo "   💡 Check:"
        echo "      - Railway service is deployed"
        echo "      - Environment variables are set"
        echo "      - MongoDB tunnel is running (if using local DB)"
    fi
fi
echo ""

# Test 3: Frontend on Vercel
echo "3️⃣  Testing Frontend on Vercel"
echo "───────────────────────────────"
read -p "Enter your Vercel frontend URL (e.g., https://ekgahoi.vercel.app): " VERCEL_URL

if [ -z "$VERCEL_URL" ]; then
    check_info "Skipping Vercel test (URL not provided)"
    echo "   💡 Get URL from Vercel dashboard → Your Project → Domains"
else
    echo "   Testing: $VERCEL_URL"
    
    if curl -s -f "$VERCEL_URL" > /dev/null 2>&1; then
        check_pass "Frontend is accessible"
        
        # Check if it's loading properly
        if curl -s "$VERCEL_URL" | grep -q "<!DOCTYPE html\|<html"; then
            check_pass "Frontend HTML is loading"
        fi
    else
        check_fail "Frontend is not accessible"
    fi
fi
echo ""

# Test 4: Frontend → Backend Connection
echo "4️⃣  Testing Frontend → Backend Connection"
echo "──────────────────────────────────────────"
if [ ! -z "$VERCEL_URL" ] && [ ! -z "$RAILWAY_URL" ]; then
    # Check if frontend has correct API URL configured
    FRONTEND_HTML=$(curl -s "$VERCEL_URL" 2>/dev/null)
    
    # Try to access a backend endpoint from frontend perspective
    API_TEST="${RAILWAY_URL%/}/api"
    if curl -s -f "$API_TEST" > /dev/null 2>&1; then
        API_RESPONSE=$(curl -s "$API_TEST")
        if echo "$API_RESPONSE" | grep -q "Matrimonial API\|status"; then
            check_pass "Backend API endpoint is accessible"
            echo "   📊 API Response: OK"
        else
            check_fail "Backend API returned unexpected response"
        fi
    else
        check_fail "Cannot reach backend API"
    fi
else
    check_info "Skipping connection test (URLs not provided)"
fi
echo ""

# Test 5: Backend → Database Connection (if tunnel is set up)
echo "5️⃣  Testing Backend → Database Connection"
echo "──────────────────────────────────────────"
if [ ! -z "$RAILWAY_URL" ]; then
    # Test database status via health endpoint
    DB_HEALTH_URL="${RAILWAY_URL%/}/api/health"
    DB_RESPONSE=$(curl -s "$DB_HEALTH_URL" 2>/dev/null)
    
    if echo "$DB_RESPONSE" | grep -q '"database"'; then
        DB_NAME=$(echo "$DB_RESPONSE" | grep -o '"database":"[^"]*"' | cut -d'"' -f4)
        if [ ! -z "$DB_NAME" ]; then
            check_pass "Backend can connect to database"
            echo "   📊 Database: $DB_NAME"
        else
            check_fail "Database connection status unclear"
        fi
    else
        check_info "Cannot verify database connection via health endpoint"
        echo "   💡 Check Railway logs to verify DB connection"
    fi
else
    check_info "Skipping DB connection test (Railway URL not provided)"
fi
echo ""

# Test 6: Environment Configuration Check
echo "6️⃣  Environment Configuration"
echo "──────────────────────────────"
echo "Frontend Configuration:"
if [ ! -z "$VERCEL_URL" ]; then
    echo "   ✅ Frontend URL: $VERCEL_URL"
    echo "   📝 Should have NEXT_PUBLIC_API_URL pointing to Railway backend"
else
    echo "   ⚠️  Frontend URL not provided"
fi

echo ""
echo "Backend Configuration:"
if [ ! -z "$RAILWAY_URL" ]; then
    echo "   ✅ Backend URL: $RAILWAY_URL"
    echo "   📝 Should have MONGODB_URI pointing to local Docker (via tunnel)"
    echo "   📝 Should have ALLOWED_ORIGINS including Vercel URL"
else
    echo "   ⚠️  Backend URL not provided"
fi

echo ""
echo "Database Configuration:"
if docker ps | grep -q "matrimonial-mongo"; then
    echo "   ✅ Local MongoDB running"
    echo "   📝 Should be exposed via tunnel (ngrok/cloudflared)"
    echo "   📝 Tunnel URL should be in Railway MONGODB_URI"
else
    echo "   ❌ MongoDB not running"
fi
echo ""

# Summary
echo "📋 SUMMARY"
echo "──────────"
echo ""
echo "Configuration Checklist:"
echo "  □ Frontend deployed on Vercel"
echo "  □ Backend deployed on Railway"
echo "  □ MongoDB running locally in Docker"
echo "  □ Tunnel exposing MongoDB to Railway"
echo "  □ Railway MONGODB_URI points to tunnel"
echo "  □ Vercel NEXT_PUBLIC_API_URL points to Railway"
echo "  □ Railway ALLOWED_ORIGINS includes Vercel URL"
echo ""

echo "🔗 Quick Links:"
echo "  • Railway Dashboard: https://railway.app/dashboard"
echo "  • Vercel Dashboard: https://vercel.com/dashboard"
echo "  • Deployment Guide: ./RAILWAY_BACKEND_DEPLOYMENT.md"
echo ""

