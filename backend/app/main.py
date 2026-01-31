from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.db.session import engine, Base
from app.core.config import get_settings

settings = get_settings()

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="Backend API for Network Intrusion Detection System",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router, prefix="/api", tags=["api"])


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": settings.app_name,
        "model_loaded": True
    }


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "IDS Dashboard Backend API",
        "docs": "/docs",
        "health": "/health"
    }
