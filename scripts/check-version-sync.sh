#!/bin/bash

# Extract versions from both files
PACKAGE_VERSION=$(grep '"version":' package.json | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')
TAURI_VERSION=$(grep '"version":' src-tauri/tauri.conf.json | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')

if [ "$PACKAGE_VERSION" != "$TAURI_VERSION" ]; then
  echo "❌ Version mismatch!"
  echo "   package.json:      $PACKAGE_VERSION"
  echo "   tauri.conf.json:   $TAURI_VERSION"
  echo ""
  echo "Run ./bump-version.sh <version> to sync versions."
  exit 1
fi

echo "✓ Versions in sync: $PACKAGE_VERSION"

