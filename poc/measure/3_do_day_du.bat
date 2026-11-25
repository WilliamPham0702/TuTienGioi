@echo off
rem C-002 PoC - bai do nhanh: Phaser (Web), 80 nhan vat, 3 phut. Khoang 4 phut ke ca khoi dong.
cd /d "%~dp0"
echo Dang do. Khong dung may trong luc do. Cam sac neu la laptop.
node run.mjs --config A --n 80 --minutes 3
pause
