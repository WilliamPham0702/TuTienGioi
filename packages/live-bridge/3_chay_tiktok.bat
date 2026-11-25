@echo off
cd /d "%~dp0"
echo Doc LIVE TikTok (CHI DOC: khong dang nhap, khong gui gi vao LIVE).
echo Hay bat LIVE tren dien thoai truoc.
set /p TEN=Nhap ten tai khoan TikTok (khong co @): 
if "%TEN%"=="" goto :eof
echo Neu lan truoc bi tat dot ngot giua LIVE, go C de chay tiep phien do. Go Enter de mo phien moi.
set /p TIEP=Chay tiep phien cu? (C/Enter): 
set EXTRA=
if /i "%TIEP%"=="C" set EXTRA=--tiep-tuc
start "" cmd /c "timeout /t 4 >nul & start http://127.0.0.1:8787/operator"
call npm start -- --source tiktok --user %TEN% %EXTRA%
pause
