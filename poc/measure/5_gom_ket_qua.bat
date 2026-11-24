@echo off
rem C-002 PoC - gom ket qua thanh 1 file zip tren Desktop (khong gom video vi qua nang)
cd /d "%~dp0"
powershell -NoProfile -Command "$d=[Environment]::GetFolderPath('Desktop'); Compress-Archive -Path 'results\*' -DestinationPath (Join-Path $d 'TuTienGioi_PoC_ketqua.zip') -Force"
echo Da tao file TuTienGioi_PoC_ketqua.zip tren Desktop. Gui file nay cho Claude.
echo Video 60 giay nam trong thu muc ghi hinh cua OBS (Settings ^> Output ^> Recording Path).
pause
