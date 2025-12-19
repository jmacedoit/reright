#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: ./scripts/bump-version.sh <version>"
  echo "Example: ./scripts/bump-version.sh 0.2.0"
  exit 1
fi

# Strip 'v' prefix if provided (so both "0.2.0" and "v0.2.0" work)
VERSION="${1#v}"
BRANCH="release/v$VERSION"

echo "Bumping version to $VERSION..."

# Create a new branch
git checkout -b "$BRANCH"

# Update tauri.conf.json
sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" src-tauri/tauri.conf.json

# Update package.json
sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" package.json

# Show changes
echo ""
echo "Updated files:"
git diff src-tauri/tauri.conf.json package.json

echo ""
read -p "Commit and push branch $BRANCH? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  git add src-tauri/tauri.conf.json package.json
  git commit -m "Bump version to $VERSION"
  git push -u origin "$BRANCH"

  echo ""
  echo "✅ Version bumped to $VERSION"
  echo ""
  echo "Next steps:"
  echo "1. Create and merge PR from $BRANCH to main"
  echo "2. After merge: git checkout main && git pull && git tag v$VERSION && git push --tags"
else
  echo "Cancelled."
  git checkout main
  git branch -D "$BRANCH"
fi

