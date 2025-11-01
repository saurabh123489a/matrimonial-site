#!/bin/bash

# Automated script to create GitHub repository and push code
# This script will guide you through the process

set -e

GITHUB_EMAIL="guptasaurabhbpl@gmail.com"
REPO_NAME="matrimonial-site"
REPO_DESC="Complete Matrimonial Site application with user profiles, messaging, horoscope matching, and admin panel"

echo "🚀 GitHub Repository Setup"
echo "=========================="
echo ""
echo "Repository Name: $REPO_NAME"
echo "Description: $REPO_DESC"
echo ""

# Check if already has remote
if git remote get-url origin > /dev/null 2>&1; then
    CURRENT_REMOTE=$(git remote get-url origin)
    echo "⚠️  Remote 'origin' already exists: $CURRENT_REMOTE"
    read -p "Do you want to update it? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote remove origin
    else
        echo "Keeping existing remote."
        echo "If you want to push, run: git push -u origin main"
        exit 0
    fi
fi

echo "📝 Step 1: Get your GitHub username"
echo "-----------------------------------"
echo "We need your GitHub username (not email) to set up the repository."
echo ""
read -p "Enter your GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ Username cannot be empty. Exiting."
    exit 1
fi

echo ""
echo "📝 Step 2: Create Repository on GitHub"
echo "---------------------------------------"
echo "Please follow these steps:"
echo ""
echo "1. Open this URL in your browser:"
echo "   https://github.com/new"
echo ""
echo "2. Login with: $GITHUB_EMAIL"
echo ""
echo "3. Fill in the form:"
echo "   - Repository name: $REPO_NAME"
echo "   - Description: $REPO_DESC"
echo "   - Visibility: Choose Public or Private"
echo "   - DO NOT initialize with README, .gitignore, or license"
echo ""
echo "4. Click 'Create repository'"
echo ""
read -p "Press Enter after you've created the repository on GitHub..."

echo ""
echo "📤 Step 3: Push Code to GitHub"
echo "--------------------------------"
echo "Setting up remote and pushing code..."
echo ""

# Set branch to main if not already
git branch -M main 2>/dev/null || true

# Add remote
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git" 2>/dev/null || {
    echo "Remote already exists, updating..."
    git remote set-url origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
}

echo "✅ Remote configured: https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
echo ""
echo "Pushing code to GitHub..."
echo "You may be prompted for your GitHub password or token."
echo ""

# Try to push
if git push -u origin main; then
    echo ""
    echo "✅ SUCCESS! Code pushed to GitHub!"
    echo ""
    echo "🔗 Repository URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo ""
    echo "📊 Summary:"
    echo "  - Repository: $REPO_NAME"
    echo "  - Files committed: $(git ls-files | wc -l | xargs)"
    echo "  - Branch: main"
    echo ""
else
    echo ""
    echo "❌ Push failed. This might be because:"
    echo "  1. Repository doesn't exist yet (make sure you created it)"
    echo "  2. Authentication failed (GitHub may require a Personal Access Token)"
    echo "  3. Network issues"
    echo ""
    echo "To push manually, run:"
    echo "  git push -u origin main"
    echo ""
    echo "If authentication fails, you can:"
    echo "  1. Use a Personal Access Token instead of password"
    echo "  2. Or use SSH: git remote set-url origin git@github.com:$GITHUB_USERNAME/$REPO_NAME.git"
    exit 1
fi

