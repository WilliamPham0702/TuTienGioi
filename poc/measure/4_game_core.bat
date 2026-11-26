@echo off
rem C-002 PoC-3 - chay kich ban mo phong game core (S1-S5) tren may nay
cd /d "%~dp0"
node --no-warnings ..\core\scripts\run-scenarios.ts results\poc3
pause
