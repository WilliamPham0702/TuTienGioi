#!/bin/sh
# Build everything and assemble the measurement kit zip for the Product Owner (C-002 PoC).
# Requires: node, python3 + rsvg-convert (assets), Godot 4.7.2 + export templates ($GODOT).
set -e
cd "$(dirname "$0")"
GODOT=${GODOT:-godot}
python3 assets/src/build_assets.py
python3 shared/gen_scenario.py
(cd phaser && npm ci && npm run build)
(cd godot && ./sync-assets.sh && "$GODOT" --headless --path . --import >/dev/null 2>&1 || true)
(cd godot && mkdir -p build/web build/windows \
  && "$GODOT" --headless --path . --export-release "Web" build/web/index.html \
  && "$GODOT" --headless --path . --export-release "Windows Desktop" build/windows/TuTienGioiPoC_Godot.exe)
mkdir -p builds dist-kit/TuTienGioi_PoC/measure dist-kit/TuTienGioi_PoC/core
cp -r phaser/dist/. builds/phaser/ 2>/dev/null || cp -r phaser/dist builds/phaser
cp -r godot/build/web/. builds/godot-web/ 2>/dev/null || cp -r godot/build/web builds/godot-web
cp -r godot/build/windows/. builds/godot-windows/ 2>/dev/null || cp -r godot/build/windows builds/godot-windows
K=dist-kit/TuTienGioi_PoC
cp -r builds "$K/"
cp measure/run.mjs measure/*.bat measure/HUONG_DAN.md "$K/measure/"
cp -r core/src core/scripts core/package.json "$K/core/"
(cd dist-kit && zip -qr TuTienGioi_PoC_C002.zip TuTienGioi_PoC)
ls -la dist-kit
