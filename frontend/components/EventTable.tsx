import type { AnomalyEvent } from "@/lib/api-client";

interface EventTableProps {
    events: AnomalyEvent[];
}

export default function EventTable({ events }: EventTableProps) {
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    const getLabelBadge = (label: number) => {
        if (label === 1) {
            return (
                <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm font-semibold border border-red-500/30">
                    🚨 Anomaly
                </span>
            );
        }
        return (
            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-semibold border border-green-500/30">
                ✓ Normal
            </span>
        );
    };

    const getScoreBadge = (score: number | null) => {
        if (score === null) return <span className="text-slate-400">N/A</span>;

        const absScore = Math.abs(score);
        let colorClass = "text-green-300";
        if (absScore > 1) colorClass = "text-yellow-300";
        if (absScore > 2) colorClass = "text-orange-300";
        if (absScore > 3) colorClass = "text-red-300";

        return <span className={`font-mono ${colorClass}`}>{score.toFixed(3)}</span>;
    };

    if (events.length === 0) {
        return (
            <div className="text-center py-12 text-slate-400">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-lg">No events yet</p>
                <p className="text-sm mt-2">Click "Demo Ingest" to generate test data</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-purple-200 font-semibold">ID</th>
                        <th className="text-left py-3 px-4 text-purple-200 font-semibold">Timestamp</th>
                        <th className="text-left py-3 px-4 text-purple-200 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 text-purple-200 font-semibold">Score</th>
                        <th className="text-left py-3 px-4 text-purple-200 font-semibold">Metadata</th>
                    </tr>
                </thead>
                <tbody>
                    {events.map((event, idx) => (
                        <tr
                            key={event.id}
                            className={`border-b border-white/5 hover:bg-white/5 transition-colors ${idx === 0 ? "bg-purple-500/10" : ""
                                }`}
                        >
                            <td className="py-3 px-4 text-white font-mono text-sm">
                                #{event.id}
                            </td>
                            <td className="py-3 px-4 text-slate-300 text-sm">
                                {formatTimestamp(event.timestamp)}
                            </td>
                            <td className="py-3 px-4">
                                {getLabelBadge(event.label)}
                            </td>
                            <td className="py-3 px-4 text-sm">
                                {getScoreBadge(event.score)}
                            </td>
                            <td className="py-3 px-4 text-slate-400 text-sm">
                                {event.meta ? (
                                    <code className="text-xs bg-slate-800/50 px-2 py-1 rounded">
                                        {JSON.stringify(event.meta, null, 0)}
                                    </code>
                                ) : (
                                    <span>-</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
