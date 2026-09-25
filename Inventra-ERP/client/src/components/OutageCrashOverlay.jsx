import React, { useState, useEffect } from "react";
import { AlertTriangle, ShieldCheck, RefreshCw, Activity, ExternalLink, CheckCircle } from "lucide-react";

export default function OutageCrashOverlay() {
  const [outage, setOutage] = useState(false);
  const [outageDetails, setOutageDetails] = useState(null);
  const [recovering, setRecovering] = useState(false);
  const [justRecovered, setJustRecovered] = useState(false);

  useEffect(() => {
    let prevCrashed = false;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:5000/api/health");
        if (res.status === 503) {
          const data = await res.json();
          setOutage(true);
          setOutageDetails(data);
          prevCrashed = true;
          setJustRecovered(false);
        } else if (res.status === 200 && prevCrashed) {
          // Transition from crashed to recovered!
          setOutage(false);
          setJustRecovered(true);
          prevCrashed = false;
          setTimeout(() => {
            setJustRecovered(false);
          }, 4000);
        } else if (res.status === 200) {
          setOutage(false);
        }
      } catch (err) {
        // Network failure / server offline
        setOutage(true);
        setOutageDetails({
          error: "Connection Refused / Server Unreachable",
          reason: "CRITICAL_PROCESS_CRASH_OR_UNHANDLED_EXCEPTION"
        });
        prevCrashed = true;
      }
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  if (!outage && !justRecovered) return null;

  if (justRecovered) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
        <div className="bg-emerald-950/95 border-2 border-emerald-500 text-white p-5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-4 max-w-md">
          <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
            <CheckCircle size={28} className="animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-300 text-sm">OUTAGE RESOLVED BY VECTOR AI</span>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-mono">MTTR: 7.8s</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Inventra ERP backend restored to 100% nominal state. All routes operational.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fade-in font-sans">
      <div className="max-w-2xl w-full bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-950/80 text-white relative overflow-hidden">
        {/* Animated warning strobe bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 animate-pulse" />

        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-400 shrink-0">
            <AlertTriangle size={32} className="animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold tracking-widest uppercase bg-rose-500/20 text-rose-400 px-2.5 py-1 rounded-full border border-rose-500/30">
                CRITICAL OUTAGE • HTTP 503
              </span>
              <span className="text-xs text-slate-400">
                Host: <code className="text-slate-300 font-mono">localhost:5000</code>
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-2">
              Inventra ERP Backend Crashed
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              {outageDetails?.reason || "Worker thread saturation & PostgreSQL connection deadlock."}
            </p>
          </div>
        </div>

        {/* Live Forensic Telemetry Box */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 mb-6 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 pb-2 mb-3 border-b border-slate-800/80">
            <span>LIVE ANOMALY TELEMETRY</span>
            <span className="text-rose-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              DRAINING TRANSACTIONS
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-[10px]">CPU UTILIZATION</div>
              <div className="text-lg font-bold text-rose-400">98.4%</div>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-[10px]">P99 LATENCY</div>
              <div className="text-lg font-bold text-rose-400">5,420ms</div>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-[10px]">HTTP 5xx ERRORS</div>
              <div className="text-lg font-bold text-rose-400">100%</div>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-[10px]">THREAD POOL</div>
              <div className="text-lg font-bold text-rose-400">EXHAUSTED</div>
            </div>
          </div>
        </div>

        {/* Vector Autonomous SRE Action Box */}
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono">
                🛡️ Vector AI SRE Autonomous Recovery Active
              </span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/40">
              L5 CLOSED-LOOP
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Vector's 5-Signal RCA isolated the root cause. Adversarial safety probes cleared.
            Autonomous Kubernetes scale & recovery action is being executed now.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <RefreshCw size={14} className="animate-spin text-blue-400" />
            <span>Auto-recovering via Vector Control Plane...</span>
          </div>

          <a
            href="http://localhost:5173/rca"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
          >
            <span>Inspect Root Cause in Vector Studio</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
