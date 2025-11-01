#!/bin/bash

# Matrimonial Application Stop Script

echo "🛑 Stopping Matrimonial Application..."
echo ""

# Stop Frontend
if [ -f /tmp/frontend.pid ]; then
    FRONTEND_PID=$(cat /tmp/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✓ Frontend stopped (PID: $FRONTEND_PID)"
        rm /tmp/frontend.pid
    fi
fi

# Kill any remaining frontend processes
pkill -f "next dev" 2>/dev/null && echo "✓ Killed remaining frontend processes"

# Stop Backend
if [ -f /tmp/backend.pid ]; then
    BACKEND_PID=$(cat /tmp/backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID 2>/dev/null
        echo "✓ Backend stopped (PID: $BACKEND_PID)"
        rm /tmp/backend.pid
    fi
fi

# Kill any remaining backend processes
pkill -f "node.*server.js" 2>/dev/null && echo "✓ Killed remaining backend processes"

# Stop MongoDB (optional - comment out if you want to keep MongoDB running)
read -p "Stop MongoDB container? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
    cd "$SCRIPT_DIR/backend"
    docker compose stop mongo 2>/dev/null && echo "✓ MongoDB stopped"
fi

echo ""
echo "✅ Application stopped successfully!"

