// API Client for IDS Dashboard Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface IngestRequest {
  features: number[];
  meta?: Record<string, any>;
}

export interface IngestResponse {
  id: number;
  label: number;
  score: number | null;
  timestamp: string;
  meta?: Record<string, any>;
}

export interface AnomalyEvent {
  id: number;
  timestamp: string;
  label: number;
  score: number | null;
  features: number[];
  meta?: Record<string, any>;
}

export interface StatsResponse {
  window: string;
  window_start: string;
  window_end: string;
  total_events: number;
  anomaly_count: number;
  anomaly_rate: number;
  avg_score: number;
}

export interface HealthResponse {
  status: string;
  service: string;
  model_loaded: boolean;
}

/**
 * Ingest traffic data for anomaly detection
 */
export async function ingest(
  features: number[],
  meta?: Record<string, any>
): Promise<IngestResponse> {
  const response = await fetch(`${API_BASE_URL}/api/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ features, meta }),
  });

  if (!response.ok) {
    throw new Error(`Ingest failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get anomaly events with optional filters
 */
export async function getEvents(params?: {
  limit?: number;
  min_score?: number;
  from_time?: string;
  to_time?: string;
  label?: number;
}): Promise<AnomalyEvent[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.limit) queryParams.set("limit", params.limit.toString());
  if (params?.min_score !== undefined) queryParams.set("min_score", params.min_score.toString());
  if (params?.from_time) queryParams.set("from_time", params.from_time);
  if (params?.to_time) queryParams.set("to_time", params.to_time);
  if (params?.label !== undefined) queryParams.set("label", params.label.toString());

  const url = `${API_BASE_URL}/api/events?${queryParams.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Get events failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get aggregated statistics
 */
export async function getStats(window: "1m" | "5m" | "1h" | "24h" = "5m"): Promise<StatsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/stats?window=${window}`);

  if (!response.ok) {
    throw new Error(`Get stats failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Check backend health
 */
export async function health(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * WebSocket connection for real-time events
 */
export function connectWebSocket(
  onMessage: (event: any) => void,
  onError?: (error: Event) => void
): WebSocket {
  const wsUrl = API_BASE_URL.replace("http://", "ws://").replace("https://", "wss://");
  const ws = new WebSocket(`${wsUrl}/api/ws/events`);

  ws.onopen = () => {
    console.log("✓ WebSocket connected");
    // Send periodic ping to keep connection alive
    setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send("ping");
      }
    }, 30000);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (e) {
      // Ignore pong messages
      if (event.data !== "pong") {
        console.error("WebSocket message parse error:", e);
      }
    }
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    onError?.(error);
  };

  ws.onclose = () => {
    console.log("WebSocket disconnected");
  };

  return ws;
}
