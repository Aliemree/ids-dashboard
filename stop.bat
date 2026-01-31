@echo off
REM IDS Dashboard - Windows Durdurma

echo.
echo IDS Dashboard durduruluyor...
echo.

REM Port 8000'i temizle (Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    taskkill /PID %%a /F >nul 2>&1
)

REM Port 3000'i temizle (Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo Tum servisler durduruldu.
echo.
pause
