@echo off
REM IDS Dashboard - Windows Başlatıcı
REM Kullanım: start.bat

echo.
echo =======================================
echo    IDS Dashboard - Baslatiliyor...
echo =======================================
echo.

REM Python kontrolü
python --version >nul 2>&1
if errorlevel 1 (
    echo [HATA] Python 3 bulunamadi! Python 3.11+ yukleyin.
    pause
    exit /b 1
)
echo [OK] Python bulundu

REM Node.js kontrolü
node --version >nul 2>&1
if errorlevel 1 (
    echo [HATA] Node.js bulunamadi! Node.js 20+ yukleyin.
    pause
    exit /b 1
)
echo [OK] Node.js bulundu

echo.
echo Backend hazirlaniyor...

REM Backend dizinine git
cd backend

REM Virtual environment oluştur
if not exist "venv\" (
    echo Virtual environment olusturuluyor...
    python -m venv venv
)

REM Virtual environment'i aktive et
call venv\Scripts\activate.bat

REM Bağımlılıkları yükle
echo Bagimliliklari kontrol ediliyor...
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo Backend bagimliliklari yukleniyor...
    pip install -q -r requirements.txt
)

REM Model kontrolü
if not exist "model\pipeline.joblib" (
    echo ML modeli olusturuluyor...
    python model\create_model.py
)

cd ..

echo.
echo Frontend hazirlaniyor...

REM Frontend dizinine git
cd frontend

REM npm bağımlılıklarını yükle
if not exist "node_modules\" (
    echo Frontend bagimliliklari yukleniyor...
    call npm install
)

cd ..

echo.
echo Servisler baslatiliyor...

REM Backend'i yeni pencerede başlat
start "IDS Backend" cmd /k "cd backend && venv\Scripts\activate.bat && uvicorn app.main:app --host 0.0.0.0 --port 8000"

REM 3 saniye bekle
timeout /t 3 /nobreak >nul

REM Frontend'i yeni pencerede başlat
start "IDS Frontend" cmd /k "cd frontend && npm run dev"

REM 3 saniye bekle
timeout /t 3 /nobreak >nul

echo.
echo =======================================
echo      IDS Dashboard Calisiyor!
echo =======================================
echo.
echo Dashboard:  http://localhost:3000
echo Backend:    http://localhost:8000
echo API Docs:   http://localhost:8000/docs
echo.
echo Durdurmak icin: stop.bat
echo.

REM Browser'ı aç
start http://localhost:3000

pause
