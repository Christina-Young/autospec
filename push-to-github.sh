#!/bin/bash

# Script to push AutoSpec to GitHub
# Make sure you've created the repository at: https://github.com/Christina-Young/autospec

echo "🚀 Pushing AutoSpec to GitHub..."
echo ""
echo "If you haven't created the repository yet, please:"
echo "1. Go to https://github.com/new"
echo "2. Repository name: autospec"
echo "3. Description: A cross-platform desktop application for writing detailed requirements documents for AI agents"
echo "4. Make it Public"
echo "5. DON'T initialize with README (we already have one)"
echo "6. Click 'Create repository'"
echo ""
read -p "Press Enter once you've created the repository..."

# Check if GitHub CLI is available
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found. Using it to create and push..."
    gh repo create Christina-Young/autospec --public --source=. --remote=origin --push
else
    echo "📝 GitHub CLI not found. Using git directly..."
    echo ""
    echo "You'll need to authenticate. Options:"
    echo "1. Use a Personal Access Token (recommended)"
    echo "2. Set up SSH keys"
    echo ""
    echo "For Personal Access Token:"
    echo "1. Go to https://github.com/settings/tokens"
    echo "2. Generate new token (classic) with 'repo' scope"
    echo "3. Use it as password when prompted"
    echo ""
    read -p "Press Enter to continue with git push..."
    
    git push -u origin main
fi

echo ""
echo "✅ Done! Your repository should be at:"
echo "   https://github.com/Christina-Young/autospec"

