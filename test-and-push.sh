#!/bin/bash

# Test SSH connection and push to GitHub

echo "🔐 Testing SSH connection to GitHub..."
echo ""

# Test SSH connection
if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
    echo "✅ SSH authentication successful!"
    echo ""
    
    # Check if repository exists
    echo "📦 Checking if repository exists..."
    if git ls-remote --exit-code origin &>/dev/null; then
        echo "✅ Repository found!"
        echo ""
        echo "🚀 Pushing code to GitHub..."
        git push -u origin main
        echo ""
        echo "✅ Done! Your code is now on GitHub:"
        echo "   https://github.com/Christina-Young/autospec"
    else
        echo "⚠️  Repository not found. Please create it first:"
        echo "   1. Go to https://github.com/new"
        echo "   2. Repository name: autospec"
        echo "   3. Make it Public"
        echo "   4. Don't initialize with README"
        echo "   5. Click 'Create repository'"
        echo ""
        echo "Then run this script again."
    fi
else
    echo "❌ SSH authentication failed!"
    echo ""
    echo "Please make sure you've added your SSH key to GitHub:"
    echo "1. Go to https://github.com/settings/keys"
    echo "2. Click 'New SSH key'"
    echo "3. Paste this key:"
    echo ""
    cat ~/.ssh/id_ed25519_github.pub
    echo ""
    echo "4. Click 'Add SSH key'"
    echo "5. Run this script again"
fi

