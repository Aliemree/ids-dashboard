import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-white tracking-tight">
            IDS Dashboard
          </h1>
          <p className="text-xl text-purple-200">
            Network Intrusion Detection System
          </p>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Real-time anomaly detection using machine learning. Monitor network traffic,
            detect threats, and visualize security events.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/50"
          >
            Open Dashboard
          </Link>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            API Docs
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-4xl mb-3">🛡️</div>
            <h3 className="text-xl font-bold text-white mb-2">Real-time Detection</h3>
            <p className="text-slate-300">
              Continuous monitoring with instant anomaly alerts
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="text-xl font-bold text-white mb-2">ML-Powered</h3>
            <p className="text-slate-300">
              Isolation Forest algorithm for accurate threat detection
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">Analytics</h3>
            <p className="text-slate-300">
              Time-series visualization and statistical insights
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
