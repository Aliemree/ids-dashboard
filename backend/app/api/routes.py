from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timedelta
from app.db.session import get_db
from app.db.models import AnomalyEvent, SystemStats
from app.services.inference import InferenceService
from app.core.config import get_settings
import json

router = APIRouter()
settings = get_settings()

# Initialize inference service (singleton)
inference_service = InferenceService(settings.model_path)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()


# Pydantic models
class IngestRequest(BaseModel):
    features: List[float] = Field(..., min_length=1, max_length=100)
    meta: Optional[dict] = None


class IngestResponse(BaseModel):
    id: int
    label: int
    score: Optional[float]
    timestamp: datetime
    meta: Optional[dict]


class EventResponse(BaseModel):
    id: int
    timestamp: datetime
    label: int
    score: Optional[float]
    features: List[float]
    meta: Optional[dict]
    
    class Config:
        from_attributes = True


# Routes
@router.post("/ingest", response_model=IngestResponse)
async def ingest_traffic(
    payload: IngestRequest,
    db: Session = Depends(get_db)
):
    """Ingest traffic data and run anomaly detection."""
    
    # Run inference
    label, score = inference_service.predict(payload.features)
    
    # Store in database
    event = AnomalyEvent(
        label=label,
        score=score,
        features=payload.features,
        meta=payload.meta
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    
    # Broadcast to WebSocket clients
    await manager.broadcast({
        "type": "new_event",
        "data": {
            "id": event.id,
            "timestamp": event.timestamp.isoformat(),
            "label": event.label,
            "score": event.score,
            "meta": event.meta
        }
    })
    
    return IngestResponse(
        id=event.id,
        label=event.label,
        score=event.score,
        timestamp=event.timestamp,
        meta=event.meta
    )


@router.get("/events", response_model=List[EventResponse])
def get_events(
    limit: int = Query(50, ge=1, le=1000),
    min_score: Optional[float] = None,
    from_time: Optional[datetime] = None,
    to_time: Optional[datetime] = None,
    label: Optional[int] = Query(None, ge=0, le=1),
    db: Session = Depends(get_db)
):
    """Get anomaly events with optional filters."""
    
    query = db.query(AnomalyEvent)
    
    if from_time:
        query = query.filter(AnomalyEvent.timestamp >= from_time)
    if to_time:
        query = query.filter(AnomalyEvent.timestamp <= to_time)
    if min_score is not None:
        query = query.filter(AnomalyEvent.score >= min_score)
    if label is not None:
        query = query.filter(AnomalyEvent.label == label)
    
    events = query.order_by(AnomalyEvent.timestamp.desc()).limit(limit).all()
    return events


@router.get("/stats")
def get_stats(
    window: str = Query("5m", regex="^(1m|5m|1h|24h)$"),
    db: Session = Depends(get_db)
):
    """Get aggregated statistics."""
    
    # Calculate time window
    window_mapping = {
        "1m": timedelta(minutes=1),
        "5m": timedelta(minutes=5),
        "1h": timedelta(hours=1),
        "24h": timedelta(hours=24)
    }
    
    delta = window_mapping[window]
    start_time = datetime.utcnow() - delta
    
    # Query events in window
    events = db.query(AnomalyEvent).filter(
        AnomalyEvent.timestamp >= start_time
    ).all()
    
    total = len(events)
    anomalies = sum(1 for e in events if e.label == 1)
    avg_score = sum(e.score for e in events if e.score is not None) / max(total, 1)
    
    return {
        "window": window,
        "window_start": start_time.isoformat(),
        "window_end": datetime.utcnow().isoformat(),
        "total_events": total,
        "anomaly_count": anomalies,
        "anomaly_rate": anomalies / max(total, 1),
        "avg_score": avg_score
    }


@router.websocket("/ws/events")
async def websocket_events(websocket: WebSocket):
    """WebSocket endpoint for real-time event streaming."""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive (client can send ping)
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
