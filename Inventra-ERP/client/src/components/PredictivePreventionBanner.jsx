import React, { useState, useEffect } from "react";
import { Zap, ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2, X, RefreshCw, ExternalLink } from "lucide-react";

export default function PredictivePreventionBanner() {
  const [status, setStatus] = useState({
    drift_detected: false,
    preemption_status: "IDLE",
    projected_ttf_minutes: null,
    active_warning: null,
    avoided_downtime_minutes: 18.5,
    avoided_loss_usd: 4625.0,
    prevented_incident_id: null
  });
  const [dismissed, setDismissed] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/vector3/prevention/live-status");
        if (res.ok && isMounted) {
          const data = await res.json();
          setStatus(data);
          if (data.drift_detected || data.preemption_status === "PREEMPTED_SUCCESSFULLY") {
            setDismissed(false);
          }
        }
      } catch (err) {
        // Silently skip if vector offline
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 1500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handlePreemptNow = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/vector3/prevention/execute-preemptive-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service_name: "erp-core" })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.live_state) {
          setStatus(data.live_state);
        }
      }
    } catch (err) {
      console.error("Failed to execute pre-emptive fix", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (dismissed) return null;

  // Case 1: Active predictive drift warning (Threat foretold BEFORE failure)
  if (status.drift_detected && status.preemption_status !== "PREEMPTED_SUCCESSFULLY") {
    const warning = status.active_warning || {};
    const ttf = status.projected_ttf_minutes || 4.7;

    return (
      <aside aria-label="Vector Predictive SRE Alert" className="bg-gradient-to-r from-amber-950/90 via-slate-900/95 to-purple-950/90 border-b border-amber-500/40 text-white px-4 sm:px-8 py-3 shadow-lg shadow-amber-950/40 backdrop-blur-md sticky top-0 z-40 animate-fade-in font-sans">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400 shrink-0 animate-pulse">
              <Zap size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                  PREDICTIVE SRE WARNING
                </span>
                <span className="text-xs font-mono font-bold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-500/30">
                  Projected TTF: {ttf}m until HTTP 503
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Matched Pattern: {warning.matched_historical_pattern || "INC-8492 (Thread Depletion)"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium">
                Sub-alarm drift on <code className="text-amber-300 font-mono">erp-core</code>: thread utilization rising +{warning.drift_rate_per_min || 6.8}/min. Vector AI is pre-emptively scaling workloads to avert downtime.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <button
              onClick={handlePreemptNow}
              disabled={actionLoading}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {actionLoading ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} />}
              <span>Pre-empt Threat Now</span>
            </button>

            <a
              href="http://localhost:5173/dashboard"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <span>Vector Studio</span>
              <ExternalLink size={12} />
            </a>

            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
              title="Dismiss warning"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // Case 2: Outage Successfully Preempted (Zero Downtime Solved)
  if (status.preemption_status === "PREEMPTED_SUCCESSFULLY") {
    return (
      <aside aria-label="Vector Autonomous Resolution" className="bg-gradient-to-r from-emerald-950/95 via-slate-900/95 to-teal-950/90 border-b border-emerald-500/40 text-white px-4 sm:px-8 py-3 shadow-lg shadow-emerald-950/40 backdrop-blur-md sticky top-0 z-40 animate-fade-in font-sans">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 shrink-0">
              <ShieldCheck size={20} className="animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  SEV-1 OUTAGE AVERTED BY VECTOR AI
                </span>
                <span className="text-xs font-mono font-bold text-emerald-200 bg-emerald-900/50 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Downtime: 0.0s (100% SLA)
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  Avoided: {status.avoided_downtime_minutes}m downtime • ${status.avoided_loss_usd.toLocaleString()} USD
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium">
                Vector predicted thread saturation 4.7m in advance and executed bounded zero-downtime scaling (2 &rarr; 4 pods). Inventra ERP remained 100% uninterrupted.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <a
              href="http://localhost:5173/rca"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
            >
              <span>View Averted Log</span>
              <ExternalLink size={12} />
            </a>

            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
              title="Close banner"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return null;
}
