from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Database (SQLite for local development, PostgreSQL for production)
    database_url: str = "sqlite:///./ids_dashboard.db"
    
    # Model
    model_path: str = "model/pipeline.joblib"
    
    # App
    app_name: str = "IDS Dashboard Backend"
    debug: bool = True
    
    # CORS
    allowed_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
