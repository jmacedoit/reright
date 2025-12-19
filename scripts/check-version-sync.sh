#!/bin/bash

# Extract versions from all files
PACKAGE_VERSION=$(grep '"version":' package.json | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')
TAURI_VERSION=$(grep '"version":' src-tauri/tauri.conf.json | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')
CARGO_VERSION=$(grep '^version = ' src-tauri/Cargo.toml | head -1 | sed 's/version = "\([^"]*\)".*/\1/')

if [ "$PACKAGE_VERSION" != "$TAURI_VERSION" ] || [ "$PACKAGE_VERSION" != "$CARGO_VERSION" ]; then
  echo "❌ Version mismatch!"
  echo "   package.json:      $PACKAGE_VERSION"
  echo "   tauri.conf.json:   $TAURI_VERSION"
  echo "   Cargo.toml:        $CARGO_VERSION"
  echo ""
  echo "Run ./scripts/bump-version.sh <version> to sync versions."
  exit 1
fi

echo "✓ Versions in sync: $PACKAGE_VERSION"

