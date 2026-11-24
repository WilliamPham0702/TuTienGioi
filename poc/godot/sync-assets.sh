#!/bin/sh
# Copy the shared PoC assets and scenario files into the Godot project (same files the Phaser PoC uses).
set -e
cd "$(dirname "$0")"
rm -rf assets shared
cp -r ../assets/out assets
mkdir -p shared && cp ../shared/*.json shared/
echo "assets synced"
