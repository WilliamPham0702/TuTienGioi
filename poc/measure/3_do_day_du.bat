@echo off
rem C-002 PoC - do day du: 3 cau hinh x 40/60/80 nhan vat (3 phut/lan) + bao dot pha + 3 video 60 giay. Khoang 45 phut.
cd /d "%~dp0"
echo Dang do. Khong dung may trong luc do. Cam sac neu la laptop.
node run.mjs --minutes 3 --all
pause
