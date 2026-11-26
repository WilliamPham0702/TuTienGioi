@echo off
rem MO GAME: bam dup file nay de mo sanh game tren Chrome
cd /d "%~dp0"
start "" cmd /c "timeout /t 3 >nul & start http://localhost:8787/phaser/index.html?n=60^&hud=1"
node run.mjs --serve
pause
