from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean, JSON, Index
from sqlalchemy.sql import func
from app.db.session import Base


class AnomalyEvent(Base):
    """Store individual anomaly detection events."""
    __tablename__ = "anomaly_events"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    # Prediction results
    label = Column(Integer, nullable=False)  # 0 = normal, 1 = anomaly
    score = Column(Float, nullable=True)  # anomaly score (model-dependent)
    
    # Feature vector
    features = Column(JSON, nullable=False)
    
    # Metadata (IP, port, protocol, etc.)
    meta = Column(JSON, nullable=True)
    
    # Index for time-based queries
    __table_args__ = (
        Index('ix_anomaly_events_timestamp_label', 'timestamp', 'label'),
    )


class SystemStats(Base):
    """Aggregated statistics by time window."""
    __tablename__ = "system_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    window_start = Column(DateTime(timezone=True), nullable=False, index=True)
    window_end = Column(DateTime(timezone=True), nullable=False)
    window_size = Column(String(10), nullable=False)  # "1m", "5m", "1h"
    
    total_events = Column(Integer, default=0)
    anomaly_count = Column(Integer, default=0)
    anomaly_rate = Column(Float, default=0.0)
    avg_score = Column(Float, nullable=True)
    
    __table_args__ = (
        Index('ix_system_stats_window', 'window_start', 'window_size'),
    )
