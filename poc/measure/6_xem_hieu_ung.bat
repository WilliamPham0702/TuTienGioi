@echo off
rem Xem thu thu vien hieu ung (VFX lab) trong trinh duyet. Dong cua so nay de tat.
cd /d "%~dp0"
start "" "http://localhost:8787/phaser/vfx.html?ui=1&hud=1"
node run.mjs --serve
