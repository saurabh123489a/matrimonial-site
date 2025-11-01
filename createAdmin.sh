#!/bin/bash

# Quick script to create admin user
# Usage: ./createAdmin.sh

echo "🔐 Creating Admin User for ekGahoi"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Default values (you can modify these)
DEFAULT_NAME="Admin User"
DEFAULT_EMAIL="admin@ekgahoi.com"
DEFAULT_PHONE="9999999999"
DEFAULT_PASSWORD="admin123"
DEFAULT_GENDER="male"

# You can override by passing arguments
NAME=${1:-$DEFAULT_NAME}
EMAIL=${2:-$DEFAULT_EMAIL}
PHONE=${3:-$DEFAULT_PHONE}
PASSWORD=${4:-$DEFAULT_PASSWORD}
GENDER=${5:-$DEFAULT_GENDER}

echo "📋 Creating admin with:"
echo "   Name: $NAME"
echo "   Email: $EMAIL"
echo "   Phone: $PHONE"
echo "   Gender: $GENDER"
echo ""

cd "$(dirname "$0")"

node backend/scripts/createAdmin.js "$NAME" "$EMAIL" "$PHONE" "$PASSWORD" "$GENDER"

