"use client";

import { useEffect, useState } from "react";
import { health, ingest, getEvents, getStats, connectWebSocket, type AnomalyEvent, type StatsResponse, type HealthResponse } from "@/lib/api-client";
import EventTable from "@/components/EventTable";
import StatusCard from "@/components/StatusCard";
import AnomalyChart from "@/components/charts/AnomalyChart";

export default function DashboardPage() {
    const [healthStatus, setHealthStatus] = useState<HealthResponse | null>(null);
    const [events, setEvents] = useState<AnomalyEvent[]>([]);
    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastEventTime, setLastEventTime] = useState<string | null>(null);

    // Initialize: check health, load events, connect WebSocket
    useEffect(() => {
        // Check backend health
        health()
            .then((data) => {
                setHealthStatus(data);
                console.log("✓ Backend healthy:", data);
            })
            .catch((err) => {
                console.error("Backend health check failed:", err);
            });

        // Load initial events
        loadEvents();

        // Load stats
        loadStats();

        // Connect WebSocket for real-time updates
        const ws = connectWebSocket(
            (message) => {
                if (message.type === "new_event") {
                    const newEvent: AnomalyEvent = {
                        id: message.data.id,
                        timestamp: message.data.timestamp,
                        label: message.data.label,
                        score: message.data.score,
                        features: [],
                        meta: message.data.meta,
                    };
                    setEvents((prev) => [newEvent, ...prev].slice(0, 50));
                    setLastEventTime(newEvent.timestamp);
                    // Refresh stats
                    loadStats();
                }
            },
            (error) => {
                console.error("WebSocket error:", error);
                setIsConnected(false);
            }
        );

        ws.addEventListener("open", () => setIsConnected(true));
        ws.addEventListener("close", () => setIsConnected(false));

        // Cleanup
        return () => {
            ws.close();
        };
    }, []);

    const loadEvents = async () => {
        try {
            const data = await getEvents({ limit: 50 });
            setEvents(data);
            if (data.length > 0) {
                setLastEventTime(data[0].timestamp);
            }
        } catch (err) {
            console.error("Failed to load events:", err);
        }
    };

    const loadStats = async () => {
        try {
            const data = await getStats("5m");
            setStats(data);
        } catch (err) {
            console.error("Failed to load stats:", err);
        }
    };

    const handleDemoIngest = async () => {
        try {
            // Generate random 20-feature vector (normal traffic)
            const features = Array.from({ length: 20 }, () => Math.random() * 2 - 1);
            const result = await ingest(features, { source: "demo", type: "normal" });
            console.log("Demo ingest result:", result);

            // Refresh events and stats
            await loadEvents();
            await loadStats();
        } catch (err) {
            console.error("Demo ingest failed:", err);
            alert("Demo ingest failed. Is the backend running?");
        }
    };

    const handleDemoAnomaly = async () => {
        try {
            // Generate anomalous feature vector with extreme values
            const features = Array.from({ length: 20 }, () => {
                // Mix of very high and very low values (anomalous pattern)
                return Math.random() > 0.5 ? Math.random() * 5 + 3 : -(Math.random() * 5 + 3);
            });
            const result = await ingest(features, { source: "demo", type: "anomaly_test", severity: "high" });
            console.log("Demo anomaly result:", result);

            // Refresh events and stats
            await loadEvents();
            await loadStats();
        } catch (err) {
            console.error("Demo anomaly failed:", err);
            alert("Demo anomaly failed. Is the backend running?");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-white">IDS Dashboard</h1>
                        <p className="text-purple-200 mt-1">Real-time Network Anomaly Detection</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleDemoIngest}
                            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                        >
                            ✅ Normal Traffic
                        </button>
                        <button
                            onClick={handleDemoAnomaly}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg animate-pulse"
                        >
                            🚨 Anomaly Traffic
                        </button>
                    </div>
                </div>

                {/* Status Cards */}
                <StatusCard
                    healthStatus={healthStatus}
                    isConnected={isConnected}
                    lastEventTime={lastEventTime}
                    stats={stats}
                />

                {/* Chart */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-4">📊 Anomaly Rate (Last 5 Minutes)</h2>
                    <AnomalyChart events={events} />
                </div>

                {/* Events Table */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-white">🔍 Recent Events</h2>
                        <button
                            onClick={loadEvents}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-all"
                        >
                            ↻ Refresh
                        </button>
                    </div>
                    <EventTable events={events} />
                </div>
            </div>
        </div>
    );
}
