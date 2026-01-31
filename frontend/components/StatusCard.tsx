import type { HealthResponse, StatsResponse } from "@/lib/api-client";

interface StatusCardProps {
    healthStatus: HealthResponse | null;
    isConnected: boolean;
    lastEventTime: string | null;
    stats: StatsResponse | null;
}

export default function StatusCard({
    healthStatus,
    isConnected,
    lastEventTime,
    stats,
}: StatusCardProps) {
    const formatTime = (timestamp: string | null) => {
        if (!timestamp) return "N/A";
        return new Date(timestamp).toLocaleTimeString();
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Backend Status */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-purple-200 font-medium">Backend</p>
                        <p className="text-2xl font-bold text-white mt-1">
                            {healthStatus?.status === "ok" ? "✓ Online" : "✗ Offline"}
                        </p>
                    </div>
                    <div className="text-4xl">
                        {healthStatus?.status === "ok" ? "🟢" : "🔴"}
                    </div>
                </div>
            </div>

            {/* WebSocket Status */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-purple-200 font-medium">WebSocket</p>
                        <p className="text-2xl font-bold text-white mt-1">
                            {isConnected ? "✓ Connected" : "✗ Disconnected"}
                        </p>
                    </div>
                    <div className="text-4xl">
                        {isConnected ? "📡" : "📴"}
                    </div>
                </div>
            </div>

            {/* Total Events */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-purple-200 font-medium">Total Events (5m)</p>
                        <p className="text-2xl font-bold text-white mt-1">
                            {stats?.total_events ?? 0}
                        </p>
                    </div>
                    <div className="text-4xl">📊</div>
                </div>
            </div>

            {/* Anomaly Rate */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-purple-200 font-medium">Anomaly Rate</p>
                        <p className="text-2xl font-bold text-white mt-1">
                            {stats ? `${(stats.anomaly_rate * 100).toFixed(1)}%` : "0%"}
                        </p>
                    </div>
                    <div className="text-4xl">
                        {stats && stats.anomaly_rate > 0.5 ? "🚨" : "✅"}
                    </div>
                </div>
            </div>
        </div>
    );
}
