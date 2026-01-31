"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { AnomalyEvent } from "@/lib/api-client";

interface AnomalyChartProps {
    events: AnomalyEvent[];
}

export default function AnomalyChart({ events }: AnomalyChartProps) {
    const chartData = useMemo(() => {
        // Group events by minute
        const grouped = new Map<string, { normal: number; anomaly: number }>();

        events.forEach((event) => {
            const timestamp = new Date(event.timestamp);
            const minute = new Date(
                timestamp.getFullYear(),
                timestamp.getMonth(),
                timestamp.getDate(),
                timestamp.getHours(),
                timestamp.getMinutes()
            );
            const key = minute.toISOString();

            if (!grouped.has(key)) {
                grouped.set(key, { normal: 0, anomaly: 0 });
            }

            const counts = grouped.get(key)!;
            if (event.label === 1) {
                counts.anomaly += 1;
            } else {
                counts.normal += 1;
            }
        });

        // Convert to array and sort by time
        return Array.from(grouped.entries())
            .map(([time, counts]) => ({
                time: new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                normal: counts.normal,
                anomaly: counts.anomaly,
                total: counts.normal + counts.anomaly,
            }))
            .sort((a, b) => a.time.localeCompare(b.time))
            .slice(-20); // Last 20 minutes
    }, [events]);

    if (chartData.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-400">
                <div className="text-center">
                    <div className="text-4xl mb-2">📈</div>
                    <p>No data to display</p>
                </div>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis
                    dataKey="time"
                    stroke="#cbd5e1"
                    style={{ fontSize: "12px" }}
                />
                <YAxis
                    stroke="#cbd5e1"
                    style={{ fontSize: "12px" }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#cbd5e1" }}
                />
                <Legend wrapperStyle={{ color: "#cbd5e1" }} />
                <Line
                    type="monotone"
                    dataKey="normal"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", r: 3 }}
                    name="Normal"
                />
                <Line
                    type="monotone"
                    dataKey="anomaly"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: "#ef4444", r: 3 }}
                    name="Anomaly"
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
