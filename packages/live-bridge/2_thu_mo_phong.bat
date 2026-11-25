@echo off
cd /d "%~dp0"
echo Chay thu bang DU LIEU GIA (khong can LIVE, khong ket noi TikTok).
echo Trinh duyet se mo man hinh game va trang operator sau vai giay.
echo Bam Ctrl + C de dung.
start "" cmd /c "timeout /t 4 >nul & start http://127.0.0.1:8787/ & start http://127.0.0.1:8787/operator"
call npm run sim -- --db none
pause
