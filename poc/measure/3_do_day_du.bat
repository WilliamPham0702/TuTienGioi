@echo off
rem C-002 PoC - bai do nhanh: 3 engine (Phaser, Godot Web, Godot exe), 60 nhan vat, moi cai 1 phut. Khoang 4,6 phut.
cd /d "%~dp0"
echo Dang do. Khong dung may trong luc do. Cam sac neu la laptop.
node run.mjs --config A --n 60 --minutes 1
node run.mjs --config B --n 60 --minutes 1
node run.mjs --config C --n 60 --minutes 1
pause
