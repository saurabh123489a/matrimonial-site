#!/bin/bash

# Script to push code to GitHub
# Usage: ./push-to-github.sh

set -e

REPO_NAME="matrimonial-site"
GITHUB_USER="guptasaurabhbpl@gmail.com"

echo "🚀 Setting up GitHub repository..."
echo ""

# Check if remote already exists
if git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  Remote 'origin' already exists."
    read -p "Do you want to update it? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote remove origin
    else
        echo "Exiting. Please update remote manually."
        exit 1
    fi
fi

echo "📝 Choose an option:"
echo "1. Create repository via GitHub website (recommended)"
echo "2. Push to existing repository"
echo ""
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "📋 Steps to create repository:"
    echo "1. Go to: https://github.com/new"
    echo "2. Login with: $GITHUB_USER"
    echo "3. Repository name: $REPO_NAME"
    echo "4. Description: Complete Matrimonial Site application"
    echo "5. Choose Public or Private"
    echo "6. Click 'Create repository'"
    echo ""
    read -p "Press Enter after creating the repository..."
    echo ""
    read -p "Enter your GitHub username: " GITHUB_USERNAME
    echo ""
    echo "Adding remote and pushing..."
    git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    git branch -M main
    git push -u origin main
    echo ""
    echo "✅ Code pushed successfully!"
    echo "🔗 Repository: https://github.com/$GITHUB_USERNAME/$REPO_NAME"

elif [ "$choice" = "2" ]; then
    echo ""
    read -p "Enter GitHub username: " GITHUB_USERNAME
    read -p "Enter repository name (default: $REPO_NAME): " REPO_NAME_INPUT
    REPO_NAME_FINAL=${REPO_NAME_INPUT:-$REPO_NAME}
    
    echo ""
    echo "Adding remote and pushing..."
    git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME_FINAL.git"
    git branch -M main
    git push -u origin main
    echo ""
    echo "✅ Code pushed successfully!"
    echo "🔗 Repository: https://github.com/$GITHUB_USERNAME/$REPO_NAME_FINAL"
else
    echo "Invalid choice. Exiting."
    exit 1
fi

