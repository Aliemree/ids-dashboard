#!/bin/bash

# IDS Dashboard - Otomatik Başlatıcı
# Kullanım: ./start.sh

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║   IDS Dashboard - Başlatılıyor...    ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# Renkler
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonksiyonlar
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Gerekli programları kontrol et
print_info "Gereksinimler kontrol ediliyor..."

if ! command -v python3 &> /dev/null; then
    print_error "Python 3 bulunamadı! Lütfen Python 3.11+ yükleyin."
    exit 1
fi
print_success "Python: $(python3 --version)"

if ! command -v node &> /dev/null; then
    print_error "Node.js bulunamadı! Lütfen Node.js 20+ yükleyin."
    exit 1
fi
print_success "Node.js: $(node --version)"

echo ""
print_info "Backend hazırlanıyor..."

# Backend kurulum
cd backend || exit

if [ ! -d "venv" ]; then
    print_info "Virtual environment oluşturuluyor..."
    python3 -m venv venv
fi

source venv/bin/activate

# Bağımlılıkları kontrol et
if ! pip show fastapi &> /dev/null; then
    print_info "Backend bağımlılıkları yükleniyor..."
    pip install -q -r requirements.txt
    print_success "Bağımlılıklar yüklendi"
else
    print_success "Bağımlılıklar hazır"
fi

# Model kontrolü
if [ ! -f "model/pipeline.joblib" ]; then
    print_warning "ML modeli bulunamadı, oluşturuluyor..."
    python model/create_model.py
    print_success "Model oluşturuldu"
else
    print_success "ML modeli hazır"
fi

cd ..

echo ""
print_info "Frontend hazırlanıyor..."

# Frontend kurulum
cd frontend || exit

if [ ! -d "node_modules" ]; then
    print_info "Frontend bağımlılıkları yükleniyor..."
    npm install --silent
    print_success "Bağımlılıklar yüklendi"
else
    print_success "Bağımlılıklar hazır"
fi

cd ..

echo ""
print_info "Servisler başlatılıyor..."

# Eski processları temizle
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 1

# Backend'i başlat
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

print_success "Backend başlatıldı (PID: $BACKEND_PID)"

sleep 2

# Frontend'i başlat
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

print_success "Frontend başlatıldı (PID: $FRONTEND_PID)"

# PID'leri kaydet
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

sleep 3

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║     ✅ IDS Dashboard Çalışıyor!      ║"
echo "╚═══════════════════════════════════════╝"
echo ""
echo -e "${BLUE}📊 Dashboard:${NC}  http://localhost:3000"
echo -e "${BLUE}🔧 Backend:${NC}    http://localhost:8000"
echo -e "${BLUE}📖 API Docs:${NC}   http://localhost:8000/docs"
echo ""
echo -e "${GREEN}Backend PID:${NC}  $BACKEND_PID"
echo -e "${GREEN}Frontend PID:${NC} $FRONTEND_PID"
echo ""
echo "Loglar:"
echo "  Backend:  tail -f backend.log"
echo "  Frontend: tail -f frontend.log"
echo ""
echo "Durdurmak için: ./stop.sh"
echo ""

# Browser'ı aç
sleep 2
if command -v open &> /dev/null; then
    open http://localhost:3000
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
fi
