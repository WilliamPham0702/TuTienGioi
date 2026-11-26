@echo off
rem C-002 PoC - chay thu 1 lan (Phaser, 60 nhan vat, 1 phut) de kiem tra moi thu hoat dong
cd /d "%~dp0"
node run.mjs --config A --n 60 --minutes 1
pause
