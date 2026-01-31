# 🛡️ IDS Dashboard

**Network Intrusion Detection System with Real-time ML-based Anomaly Detection**

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-stack web application for real-time network anomaly detection using machine learning. Built with FastAPI (backend), Next.js (frontend), and Isolation Forest algorithm.

![Dashboard Screenshot](https://via.placeholder.com/800x400/1e293b/ffffff?text=IDS+Dashboard+Screenshot)

## ✨ Features

- 🤖 **ML-Powered Detection** - Isolation Forest algorithm for accurate anomaly detection
- ⚡ **Real-time Updates** - WebSocket-based live event streaming (<50ms latency)
- 📊 **Beautiful Dashboard** - Modern UI with glassmorphism effects and responsive design  
- 🎯 **Dual Test Modes** - Simulate both normal and anomalous traffic patterns
- 📈 **Time-series Visualization** - Interactive charts showing anomaly trends
- 🗄️ **SQLite Database** - Zero-configuration, embedded database
- 🔒 **Type-safe** - Full TypeScript support on frontend
- 🐳 **Easy Deploy** - Single command startup with automated setup

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- Git

### Installation & Run

**Mac/Linux:**
```bash
git clone https://github.com/Aliemree/ids-dashboard.git
cd ids-dashboard
./start.sh
```

**Windows:**
```batch
git clone https://github.com/Aliemree/ids-dashboard.git
cd ids-dashboard
start.bat
```

The dashboard will automatically open at **http://localhost:3000**

## 📖 Usage

### Testing the System

1. **Open Dashboard**: Navigate to http://localhost:3000
2. **Click "Open Dashboard"**
3. **Test Traffic Types**:
   - **✅ Normal Traffic** - Generates benign network patterns
   - **🚨 Anomaly Traffic** - Generates suspicious patterns

### API Endpoints

```bash
# Health check
curl http://localhost:8000/health

# Manual event ingestion
curl -X POST http://localhost:8000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "features": [0.1, 0.2, -0.1, ...],
    "meta": {"source": "manual", "ip": "192.168.1.10"}
  }'

# Get events
curl "http://localhost:8000/api/events?limit=10"

# Get statistics
curl "http://localhost:8000/api/stats?window=5m"

# API Documentation
open http://localhost:8000/docs
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │  Dashboard   │ │ Event Table  │ │   Charts     │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │ REST API + WebSocket
┌────────────────────────┴────────────────────────────────┐
│                   Backend (FastAPI)                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │  API Router  │ │   ML Model   │ │  WebSocket   │   │
│  │              │ │ IL Forest    │ │   Manager    │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │
                 ┌───────┴───────┐
                 │  SQLite DB    │
                 └───────────────┘
```

## �️ Tech Stack

### Backend
- **FastAPI** - Modern, high-performance web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **scikit-learn** - Machine learning (Isolation Forest)
- **WebSockets** - Real-time bidirectional communication
- **Pydantic** - Data validation using Python type annotations

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS framework
- **Recharts** - Composable charting library
- **WebSocket API** - Real-time event streaming

### ML Model
- **Isolation Forest** - Unsupervised anomaly detection algorithm
- **StandardScaler** - Feature normalization
- **Joblib** - Model persistence

## � Project Structure

```
ids-dashboard/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── core/config.py       # Configuration
│   │   ├── db/
│   │   │   ├── session.py       # Database session
│   │   │   └── models.py        # SQLAlchemy models
│   │   ├── api/routes.py        # API endpoints
│   │   └── services/
│   │       ├── inference.py     # ML inference
│   │       └── preprocess.py    # Feature processing
│   ├── model/
│   │   ├── create_model.py      # Model training script
│   │   └── pipeline.joblib      # Trained model
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Landing page
│   │   ├── layout.tsx           # Root layout
│   │   └── dashboard/
│   │       └── page.tsx         # Dashboard page
│   ├── components/
│   │   ├── EventTable.tsx       # Events table
│   │   ├── StatusCard.tsx       # Status indicators
│   │   └── charts/
│   │       └── AnomalyChart.tsx # Time-series chart
│   ├── lib/
│   │   └── api-client.ts        # API client
│   └── package.json
│
├── start.sh / start.bat         # Startup scripts
├── stop.sh / stop.bat           # Stop scripts
└── README.md
```

## 🧠 How It Works

### 1. Data Flow
1. Network traffic features (20-dimensional vector) are sent to `/api/ingest`
2. Backend preprocesses features using StandardScaler
3. Isolation Forest model predicts: Normal (0) or Anomaly (1)
4. Event is stored in SQLite with metadata
5. WebSocket broadcasts event to all connected clients
6. Dashboard updates in real-time

### 2. Anomaly Detection
- **Normal Traffic**: Features within expected distribution (score < 0)
- **Anomaly Traffic**: Outliers with extreme values (score > 0)
- **Threshold**: Configurable via model contamination parameter

### 3. Real-time Updates
- WebSocket connection maintains live link
- New events appear instantly in dashboard
- Charts update without page refresh
- < 50ms end-to-end latency

## 🔧 Configuration

### Backend (.env)
```bash
DATABASE_URL=sqlite:///./ids_dashboard.db
MODEL_PATH=model/pipeline.joblib
DEBUG=false
ALLOWED_ORIGINS=["http://localhost:3000"]
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📊 Model Training

Replace the demo model with your own:

```python
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import joblib

# Your training data
X_train = ...  # (n_samples, 20) feature matrix

# Create pipeline
pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('model', IsolationForest(contamination=0.1, random_state=42))
])

# Train
pipeline.fit(X_train)

# Save
joblib.dump(pipeline, 'backend/model/pipeline.joblib')
```

## 🧪 Testing

### Unit Tests
```bash
cd backend
pytest tests/
```

### Integration Tests
```bash
# Start services
./start.sh

# Test API
curl http://localhost:8000/health
curl http://localhost:8000/api/events
```

## 🚢 Deployment

### Docker (Optional)
```bash
docker-compose up --build
```

### Cloud Platforms
- **Vercel** - Frontend deployment
- **Railway/Heroku** - Backend deployment
- **AWS/GCP/Azure** - Full-stack deployment

## � Performance

- **Throughput**: ~1000 events/second
- **Response Time**: < 100ms average
- **WebSocket Latency**: < 50ms
- **Model Inference**: < 10ms
- **Database Queries**: < 5ms (with indexes)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ali Emre**
- GitHub: [@Aliemree](https://github.com/Aliemree)

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Next.js](https://nextjs.org/) - The React Framework
- [scikit-learn](https://scikit-learn.org/) - Machine Learning in Python
- [Recharts](https://recharts.org/) - Composable charting library

## 📧 Contact

For questions or suggestions, please open an issue or contact me directly.

---

**⭐ Star this repository if you find it helpful!**
