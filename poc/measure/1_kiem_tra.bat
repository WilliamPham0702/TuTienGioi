@echo off
rem C-002 PoC - kiem tra moi truong (chi kiem tra, khong cai gi)
cd /d "%~dp0"
echo === Kiem tra Node.js ===
where node >nul 2>nul
if errorlevel 1 (
  echo [THIEU] Chua co Node.js. Mo trang tai Node.js LTS ^(mien phi^)...
  start https://nodejs.org/
  goto obs
)
node -e "const [a,b]=process.versions.node.split(\".\").map(Number);process.exit(a>22||(a===22&&b>=18)?0:1)"
if errorlevel 1 (echo [CAN NANG CAP] Node.js qua cu, can ban 22.18 tro len. Tai ban LTS tai https://nodejs.org/ & start https://nodejs.org/) else (echo [OK] Node.js da co.)
:obs
echo === Kiem tra OBS Studio ===
if exist "%ProgramFiles%\obs-studio\bin\64bit\obs64.exe" (echo [OK] OBS Studio da co.) else (echo [THIEU] Chua thay OBS Studio. Mo trang tai OBS ^(mien phi^)... & start https://obsproject.com/)
echo.
echo Buoc tiep theo: mo OBS, vao Tools ^> WebSocket Server Settings, bat "Enable WebSocket server",
echo bo chon "Enable Authentication", bam OK. Sau do chay 2_thu_nhanh.bat
pause
