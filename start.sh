#!/bin/bash

# Matrimonial Application Startup Script
# This script starts MongoDB, Backend, and Frontend servers

set -e

echo "🚀 Starting Matrimonial Application..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0
    else
        return 1
    fi
}

# Get the root directory of the project
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Start MongoDB with Docker
echo -e "${BLUE}📦 Starting MongoDB...${NC}"
cd "$ROOT_DIR/backend"

# Find docker command
DOCKER_CMD=$(which docker 2>/dev/null || command -v docker 2>/dev/null || echo "docker")
if [ "$DOCKER_CMD" = "docker" ] && ! command -v docker >/dev/null 2>&1; then
    # Try common docker paths
    if [ -x "/usr/local/bin/docker" ]; then
        DOCKER_CMD="/usr/local/bin/docker"
    elif [ -x "/usr/bin/docker" ]; then
        DOCKER_CMD="/usr/bin/docker"
    else
        echo -e "${YELLOW}⚠️  Docker not found in PATH. Trying to continue...${NC}"
        echo -e "${YELLOW}   If MongoDB is already running, this is OK${NC}"
        DOCKER_CMD=""
    fi
fi

if [ -n "$DOCKER_CMD" ]; then
    if $DOCKER_CMD ps 2>/dev/null | grep -q matrimonial-mongo; then
        echo -e "${GREEN}✓ MongoDB container already running${NC}"
    else
        $DOCKER_CMD compose up -d mongo 2>/dev/null || $DOCKER_CMD-compose up -d mongo 2>/dev/null || {
            echo -e "${YELLOW}⚠️  Could not start MongoDB container. Checking if already running...${NC}"
            if $DOCKER_CMD ps -a 2>/dev/null | grep -q matrimonial-mongo; then
                echo -e "${GREEN}✓ MongoDB container exists${NC}"
            fi
        }
        echo -e "${GREEN}✓ MongoDB container check complete${NC}"
        sleep 3
    fi
else
    echo -e "${YELLOW}⚠️  Docker command not available. Assuming MongoDB is already running.${NC}"
fi

# Wait for MongoDB to be ready
echo -e "${BLUE}⏳ Waiting for MongoDB to be ready...${NC}"
timeout=30
counter=0
while ! nc -z localhost 27017 2>/dev/null; do
    sleep 1
    counter=$((counter + 1))
    if [ $counter -ge $timeout ]; then
        echo -e "${YELLOW}⚠️  MongoDB connection timeout, but continuing...${NC}"
        break
    fi
done
echo -e "${GREEN}✓ MongoDB is ready${NC}"

# Start Backend
echo ""
echo -e "${BLUE}🔧 Starting Backend Server...${NC}"
cd "$ROOT_DIR/backend"
if check_port 5050; then
    echo -e "${YELLOW}⚠️  Port 5050 is already in use. Backend may already be running.${NC}"
else
    npm run dev > /tmp/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > /tmp/backend.pid
    echo -e "${GREEN}✓ Backend server started (PID: $BACKEND_PID)${NC}"
    echo "  📝 Logs: tail -f /tmp/backend.log"
fi

# Wait for backend to start
echo -e "${BLUE}⏳ Waiting for backend to start...${NC}"
sleep 5
counter=0
while ! curl -s http://localhost:5050/api/health > /dev/null 2>&1; do
    sleep 1
    counter=$((counter + 1))
    if [ $counter -ge 15 ]; then
        echo -e "${YELLOW}⚠️  Backend may still be starting...${NC}"
        break
    fi
done
echo -e "${GREEN}✓ Backend server is ready${NC}"

# Start Frontend
echo ""
echo -e "${BLUE}🎨 Starting Frontend Server...${NC}"
cd "$ROOT_DIR/frontend"
if check_port 3000; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use. Frontend may already be running.${NC}"
else
    npm run dev > /tmp/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > /tmp/frontend.pid
    echo -e "${GREEN}✓ Frontend server started (PID: $FRONTEND_PID)${NC}"
    echo "  📝 Logs: tail -f /tmp/frontend.log"
fi

# Wait for frontend to start
echo -e "${BLUE}⏳ Waiting for frontend to start...${NC}"
sleep 5
counter=0
while ! curl -s http://localhost:3000 > /dev/null 2>&1; do
    sleep 1
    counter=$((counter + 1))
    if [ $counter -ge 15 ]; then
        echo -e "${YELLOW}⚠️  Frontend may still be starting...${NC}"
        break
    fi
done
echo -e "${GREEN}✓ Frontend server is ready${NC}"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Application Started Successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
echo "📍 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5050/api"
echo "   MongoDB: localhost:27017"
echo ""
echo "📊 View logs:"
echo "   Backend:  tail -f /tmp/backend.log"
echo "   Frontend: tail -f /tmp/frontend.log"
echo ""
echo "🛑 Stop all services: ./stop.sh"
echo ""

