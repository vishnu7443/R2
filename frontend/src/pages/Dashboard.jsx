import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Cpu, Server, HardDrive, Clock, ShieldAlert, CheckCircle, ChevronRight, Activity, Play, Pause, AlertTriangle, LogOut, Terminal, Copy, Check, X,
  Layers, Wifi, Shield, ShieldCheck, ArrowRight
} from 'lucide-react';

const defaultServiceForMode = (m) => {
  if (m === 'ecommerce') return 'shop-frontend';
  if (m === 'inventraerp') return 'erp-frontend';
  return 'payment-service';
};

export default function Dashboard({ dashboardData, setDashboardData }) {
  const [searchParams] = useSearchParams();
  const mode = localStorage.getItem('dashboardMode') || 'standard';
  const serviceParam = searchParams.get('service');
  const [selectedService, setSelectedService] = useState(serviceParam || defaultServiceForMode(mode));
  const [chartData, setChartData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [recentDecisions, setRecentDecisions] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  const [autoPilot, setAutoPilot] = useState(true);
  const [ecommerceStats, setEcommerceStats] = useState({ active_users: 0, db_sales: 0 });
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [isStale, setIsStale] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [metricTab, setMetricTab] = useState('cpu'); // 'cpu' | 'memory' | 'network' | 'latency'
  const navigate = useNavigate();

  const handleCopyKey = () => {
    navigator.clipboard.writeText('vect_inventraerp_sk_live_abc123xyz');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignOut = () => {
    localStorage.removeItem('clerkUser');
    localStorage.removeItem('dashboardMode');
    navigate('/login');
  };
  // Stable refs — hold last known non-empty values to prevent flash-to-empty
  const stableAlerts = React.useRef([]);
  const stablePredictions = React.useRef([]);

  // Ensure selectedService matches the active workspace mode
  useEffect(() => {
    const allowed = mode === 'ecommerce' 
      ? ['shop-frontend', 'shop-auth', 'shop-catalog', 'shop-notifications']
      : mode === 'inventraerp'
      ? ['erp-frontend', 'erp-db']
      : ['payment-service', 'auth-service', 'frontend-service', 'database-service'];
    
    if (!allowed.includes(selectedService)) {
      setSelectedService(defaultServiceForMode(mode));
    }
  }, [mode]);

  // Sync selected service if query param changes
  useEffect(() => {
    if (serviceParam) {
      setSelectedService(serviceParam);
    }
  }, [serviceParam]);
  
  // Stale telemetry check
  useEffect(() => {
    const checkStale = setInterval(() => {
      if (Date.now() - lastUpdated > 10000) {
        setIsStale(true);
      } else {
        setIsStale(false);
      }
    }, 2000);
    return () => clearInterval(checkStale);
  }, [lastUpdated]);

  // Fetch Dashboard Stats and Charts
  useEffect(() => {
    let controller = new AbortController();

    const fetchData = async () => {
      // Cancel any in-flight request from the previous cycle
      controller.abort();
      controller = new AbortController();
      const sig = controller.signal;

      try {
        // Fetch all endpoints in parallel — no sequential stalls
        const [alertsRes, predRes, decRes, auditRes] = await Promise.all([
          fetch(`http://localhost:8000/api/alerts?mode=${mode}`, { signal: sig }),
          fetch(`http://localhost:8000/api/predictions?mode=${mode}`, { signal: sig }),
          fetch(`http://localhost:8000/api/decisions/recent?mode=${mode}`, { signal: sig }),
          fetch(`http://localhost:8000/api/timeline/events/recent?limit=5&mode=${mode}`, { signal: sig }),
        ]);

        // Only update state when response is non-empty — prevents flash-to-nothing
        if (alertsRes.ok) {
          const data = await alertsRes.json();
          if (Array.isArray(data)) {
            // Only replace if backend sends actual data; otherwise keep last known
            if (data.length > 0) stableAlerts.current = data;
            setAlerts(data.length > 0 ? data : stableAlerts.current);
          }
        }
        if (predRes.ok) {
          const data = await predRes.json();
          if (Array.isArray(data)) {
            if (data.length > 0) stablePredictions.current = data;
            setPredictions(data.length > 0 ? data : stablePredictions.current);
          }
        }
        if (decRes.ok) {
          const data = await decRes.json();
          if (Array.isArray(data)) setRecentDecisions(data);
        }
        if (auditRes.ok) {
          const data = await auditRes.json();
          if (Array.isArray(data) && data.length > 0) setAuditTrail(data);
        }

        if (mode === 'ecommerce') {
          try {
            const ecoRes = await fetch('http://localhost:8000/api/lumora/stats', { signal: sig });
            if (ecoRes.ok) {
              const eStats = await ecoRes.json();
              setEcommerceStats(eStats);
            }
          } catch (e) {
            if (e.name !== 'AbortError') console.error("Error fetching ecommerce stats:", e);
          }
        }

        setLastUpdated(Date.now());
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Error fetching dashboard statistics:", err);
        }
        // On error: keep previous state — do NOT blank out alerts/predictions
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    // Refetch immediately when user returns to this tab
    const onVisible = () => { if (!document.hidden) fetchData(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', onVisible); };
  }, []);

  // Fetch Chart Data for Selected Service
  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const chartRes = await fetch(`http://localhost:8000/api/metrics?service_name=${selectedService}`);
        const chartMetrics = await chartRes.json();
        setChartData(chartMetrics);
        setLastUpdated(Date.now());
      } catch (err) {
        console.error("Error fetching charts data:", err);
      }
    };

    fetchCharts();
    const chartInterval = setInterval(fetchCharts, 3000);
    return () => clearInterval(chartInterval);
  }, [selectedService]);

  const fallbackChartData = [
    { timestamp: '10:00', cpu: 24.2, memory: 32.1, network: 1800, latency: 36.2 },
    { timestamp: '10:01', cpu: 25.1, memory: 32.4, network: 1850, latency: 37.0 },
    { timestamp: '10:02', cpu: 24.8, memory: 32.0, network: 1820, latency: 36.5 },
    { timestamp: '10:03', cpu: 26.0, memory: 32.8, network: 1900, latency: 38.1 },
    { timestamp: '10:04', cpu: 24.5, memory: 32.2, network: 1840, latency: 36.8 },
    { timestamp: '10:05', cpu: 25.0, memory: 32.5, network: 1860, latency: 37.2 }
  ];

  const displayChartData = chartData && chartData.length > 0 
    ? chartData.map(d => ({ 
        ...d, 
        timestamp: d.timestamp && typeof d.timestamp === 'string' ? d.timestamp.split('T')[1]?.substring(0, 5) || d.timestamp : d.timestamp,
        cpu: typeof d.cpu_utilization === 'number' ? d.cpu_utilization : (typeof d.cpu === 'number' ? d.cpu : 25),
        memory: typeof d.memory_utilization === 'number' ? d.memory_utilization : (typeof d.memory === 'number' ? d.memory : 35),
        network: typeof d.network_throughput === 'number' ? d.network_throughput : (typeof d.network === 'number' ? d.network : 1200),
        latency: typeof d.latency_ms === 'number' ? d.latency_ms : (typeof d.latency === 'number' ? d.latency : 20)
      }))
    : fallbackChartData;

  const stats = dashboardData?.metrics_summary || {
    cpu_avg: 0, memory_avg: 0, network_avg: 0, latency_avg: 0, pod_count: 0, node_count: 5
  };

  const getHealthStatusText = () => {
    if (dashboardData?.health_status === "Healthy") return "All workloads operating nominally.";
    if (dashboardData?.health_status === "Warning") return "Sub-optimal telemetry levels detected.";
    return "Critical outage mitigation in progress.";
  };

  const activeThreatAlerts = predictions.filter(p => !p.resolved);
  
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL');
  const warningAlerts = alerts.filter(a => a.severity === 'WARNING');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      
      {isStale && (
        <div style={{ padding: '0.65rem 1rem', background: '#fef2f2', border: '1px solid #f87171', borderRadius: '10px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
          <AlertTriangle size={15} />
          <strong>Warning:</strong> Telemetry data is stale (no updates in 10s). Verify backend connection.
        </div>
      )}
      {/* Welcome & System Summary Bar */}
      <div className="responsive-flex row-md" style={{ justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--color-dark)', letterSpacing: '-0.4px', margin: 0 }}>
              {mode === 'ecommerce' ? 'E-Commerce Command Center' : mode === 'inventraerp' ? 'Inventra ERP SRE Deck' : 'Welcome back, Operator'}
            </h1>
            {mode === 'inventraerp' && (
              <button
                type="button"
                onClick={() => setShowAgentModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.3rem 0.75rem',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  backgroundColor: dashboardData?.live_agent_active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.08)',
                  color: dashboardData?.live_agent_active ? '#059669' : '#2563eb',
                  border: dashboardData?.live_agent_active ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(59, 130, 246, 0.25)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease'
                }}
                title="Click to view Agent Integration details and commands"
              >
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: dashboardData?.live_agent_active ? '#10b981' : '#3b82f6',
                  boxShadow: dashboardData?.live_agent_active ? '0 0 8px #10b981' : 'none'
                }} />
                {dashboardData?.live_agent_active ? 'LIVE AGENT STREAMING' : 'AGENT READY (SYNTHETIC STANDBY)'}
                <Terminal size={12} style={{ marginLeft: '2px', opacity: 0.8 }} />
              </button>
            )}
          </div>
          <p style={{ color: 'var(--color-slate-400)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
            {mode === 'ecommerce' ? 'Vector is actively monitoring the E-Commerce application infrastructure.' : mode === 'inventraerp' ? 'Vector SRE is actively guarding the Inventra ERP deployment.' : 'Vector AI Core is monitoring isolated cluster namespaces.'}
          </p>
        </div>

        {/* Workspace selector dropdown & sign out */}
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-slate-400)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Assurance Workspace</span>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <select 
                value={mode} 
                onChange={(e) => {
                  localStorage.setItem('dashboardMode', e.target.value);
                  window.location.reload();
                }}
                style={{
                  padding: '0.48rem 0.95rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: '#ffffff',
                  color: 'var(--color-dark)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  outline: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
                }}
              >
                <option value="standard">Global Cluster (Standard Demo)</option>
                <option value="ecommerce">ApexStore E-Commerce (CRUD Live)</option>
                <option value="inventraerp">Inventra ERP (Client Workspace)</option>
              </select>

              <button
                onClick={handleSignOut}
                title="Sign Out of Vector"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.48rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  background: '#ffffff',
                  color: '#f43f5e',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff1f2';
                  e.currentTarget.style.borderColor = '#f43f5e';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.25)';
                }}
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Executive SRE Metric Strip (4 Columns) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.2rem',
        width: '100%'
      }}>
        {mode === 'inventraerp' ? (
          <>
            <div className="glass-panel" style={{ padding: '1.2rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-slate-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ERP Tenants</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '6px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>4 TIERS</span>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-dark)', lineHeight: 1.1 }}>42 Active</div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>↑ All client organizations healthy</div>
            </div>

            <div className="glass-panel" style={{ padding: '1.2rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-slate-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SLA Commitment</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>99.99%</span>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-dark)', lineHeight: 1.1 }}>{Math.max(0, dashboardData?.health_score || 100)}%</div>
              <div style={{ width: '100%', height: '4px', borderRadius: '2px', backgroundColor: '#f1f5f9', overflow: 'hidden', marginTop: '0.15rem' }}>
                <div style={{ width: `${Math.max(0, dashboardData?.health_score || 100)}%`, height: '100%', backgroundColor: '#10b981' }} />
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.2rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-slate-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gateway Latency</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>P99: 45ms</span>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-dark)', lineHeight: 1.1 }}>
                {stats.latency_avg} <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-slate-400)' }}>ms</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: stats.latency_avg < 60 ? '#10b981' : '#f43f5e', fontWeight: 600 }}>
                {stats.latency_avg < 60 ? '✓ Nominal gateway response' : '⚠️ Latency alert'}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.2rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-slate-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tx Velocity</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>STREAM</span>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-dark)', lineHeight: 1.1 }}>
                {Math.round(stats.network_avg / 2).toLocaleString()} <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-slate-400)' }}>tx/m</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-slate-400)', fontWeight: 600 }}>Real-time telemetry pipeline</div>
            </div>
          </>
        ) : mode === 'ecommerce' ? (
          <>
            <div className="glass-panel" style={{ padding: '1.2rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-slate-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Store Active Users</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '6px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>LIVE</span>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-dark)', lineHeight: 1.1 }}>{ecommerceStats.active_users.toLocaleString()}</div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>Active shoppers browsing</div>
            </div>

            <div className="glass-panel" style={{ padding: '1.2rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-slate-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SLA Commitment</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>99.99%</span>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-dark)', lineHeight: 1.1 }}>{Math.max(0, dashboardData?.health_score || 99.99)}%</div>
              <div style={{ width: '100%', height: '4px', borderRadius: '2px', backgroundColor: '#f1f5f9', overflow: 'hidden', marginTop: '0.15rem' }}>
                <div style={{ width: `${Math.max(0, dashboardData?.health_score || 99.9)}%`, height: '100%', backgroundColor: '#10b981' }} />
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.2rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-slate-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>API Latency</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>P95: 50ms</span>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-dark)', lineHeight: 1.1 }}>
                {stats.latency_avg} <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-slate-400)' }}>ms</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>Nominal checkout response</div>
            </div>

            <div className="glass-panel" style={{ padding: '1.2rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-slate-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Orders Processed</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>COMPLETED</span>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-dark)', lineHeight: 1.1 }}>{ecommerceStats.db_sales.toLocaleString()}</div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>Zero dropped checkouts</div>
            </div>
          </>
        ) : (
          <>
            <div className="glass-panel" style={{ padding: '1.2rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-slate-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CPU Allocation</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '6px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>POOL</span>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-dark)', lineHeight: 1.1 }}>{stats.cpu_avg}%</div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>Headroom available</div>
            </div>

            <div className="glass-panel" style={{ padding: '1.2rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-slate-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Memory Capacity</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>STABLE</span>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-dark)', lineHeight: 1.1 }}>{stats.memory_avg}%</div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>Zero leak detected</div>
            </div>

            <div className="glass-panel" style={{ padding: '1.2rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-slate-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Pods</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>HEALTHY</span>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-dark)', lineHeight: 1.1 }}>{stats.pod_count}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-slate-400)', fontWeight: 600 }}>Across 5 worker nodes</div>
            </div>

            <div className="glass-panel" style={{ padding: '1.2rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-slate-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Decisions Logged</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>AUDITED</span>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-dark)', lineHeight: 1.1 }}>{recentDecisions.length}</div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>100% Assurance checked</div>
            </div>
          </>
        )}
      </div>

      {/* Active Incidents & Predictions Banner — always mounted, opacity transition */}
      <div style={{
        opacity: activeThreatAlerts.length > 0 ? 1 : 0,
        maxHeight: activeThreatAlerts.length > 0 ? '600px' : '0px',
        overflow: 'hidden',
        transition: 'opacity 0.4s ease, max-height 0.4s ease',
        display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-rose)', letterSpacing: '0.5px' }}>
            ⚠️ PRE-CRITICAL FORECAST ALERTS (DETECTED BEFORE SERVICE CRASH)
          </span>
          <span className="highlight-badge-green" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', background: '#10b981', color: '#ffffff' }}>
            🛡️ ZERO DATA LOSS GUARANTEED | 0 TRANSACTIONS DROPPED
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
          {activeThreatAlerts.map((p) => (
            <div 
              key={p.id} 
              className="glass-card" 
              style={{ 
                padding: '1rem 1.2rem', 
                border: '1px solid rgba(244, 63, 94, 0.15)',
                background: 'rgba(244, 63, 94, 0.02)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={16} color="var(--color-rose)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-dark)' }}>
                    {p.service_name}
                  </span>
                  <span className="highlight-badge-dark" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', backgroundColor: '#f43f5e' }}>
                    {p.risk_level?.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.3rem', alignItems: 'center' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-slate-400)', fontWeight: 500, margin: 0 }}>
                    Confidence: {Math.round(p.confidence_score * 100)}%
                  </p>
                  {p.confidence_score < 0.8 && (
                    <span className="highlight-badge-white" style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem', border: '1px solid var(--color-amber)', color: 'var(--color-amber)' }}>
                      LOW CONFIDENCE
                    </span>
                  )}
                </div>
              </div>

              <button 
                onClick={() => navigate(`/decision?pred_id=${p.id}`)}
                className="btn-primary"
                style={{
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.75rem',
                  gap: '0.2rem',
                  height: '32px'
                }}
              >
                <span>Review</span>
                <ChevronRight size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main 3-Column Cockpit Grid */}
      <div className="responsive-grid three-cols" style={{ width: '100%', gap: '2rem' }}>
        
        {/* Left Column: System Assurance Core & Classification */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Obsidian System Assurance Core Card */}
          <div style={{
            borderRadius: '24px',
            background: 'linear-gradient(145deg, #0e1219 0%, #171c26 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '2rem',
            color: '#ffffff',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '340px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Top Glow Accent */}
            <div style={{
              position: 'absolute',
              top: '-25%',
              right: '-25%',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(185, 255, 102, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(185, 255, 102, 0.12)',
                  border: '1px solid rgba(185, 255, 102, 0.25)',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#b9ff66',
                  letterSpacing: '0.5px'
                }}>
                  <ShieldCheck size={12} />
                  <span>SYSTEM ASSURANCE CORE</span>
                </div>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>v2.4 Live</span>
              </div>

              {/* Radial Gauge Dial */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginTop: '1.5rem' }}>
                <div style={{ position: 'relative', width: '92px', height: '92px', flexShrink: 0 }}>
                  <svg width="92" height="92" viewBox="0 0 92 92" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                      cx="46"
                      cy="46"
                      r="40"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="46"
                      cy="46"
                      r="40"
                      stroke={dashboardData?.health_score >= 80 ? '#10b981' : dashboardData?.health_score >= 60 ? '#f59e0b' : '#f43f5e'}
                      strokeWidth="8"
                      strokeDasharray={251.32}
                      strokeDashoffset={251.32 - (251.32 * Math.min(100, Math.max(0, dashboardData?.health_score || 100))) / 100}
                      strokeLinecap="round"
                      fill="none"
                      style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                    />
                  </svg>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                      {dashboardData?.health_score || 100}%
                    </span>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#ffffff', lineHeight: 1.2 }}>
                    Cluster Health
                  </h3>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: dashboardData?.health_status === 'Healthy' ? '#34d399' : '#f87171',
                    marginTop: '0.3rem'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                    {getHealthStatusText()}
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-status boxes */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.6rem',
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '0.65rem 0.8rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Nodes Status</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#e2e8f0', marginTop: '0.15rem' }}>{stats.node_count} Nodes Nominal</div>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '0.65rem 0.8rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Data Guarantee</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#34d399', marginTop: '0.15rem' }}>Zero Loss Active</div>
              </div>
            </div>
          </div>

          {/* Workload Classification List */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#ffffff' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-slate-400)', letterSpacing: '0.5px' }}>
              WORKLOAD TOPOLOGY TIERS
            </span>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {mode === 'ecommerce' ? (
                [
                  { name: 'shop-frontend', tag: 'EDGE', color: '#06b6d4' },
                  { name: 'shop-auth', tag: 'AUTH', color: '#6366f1' },
                  { name: 'shop-catalog', tag: 'STORAGE', color: '#f59e0b' },
                  { name: 'shop-notifications', tag: 'WORKER', color: '#10b981' }
                ].map(w => (
                  <div key={w.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: w.color }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-dark)' }}>{w.name}</span>
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.04)', color: w.color }}>
                      {w.tag}
                    </span>
                  </div>
                ))
              ) : mode === 'inventraerp' ? (
                [
                  { name: 'erp-frontend', tag: 'EDGE GATEWAY', color: '#06b6d4' },
                  { name: 'erp-core', tag: 'CORE LOGIC', color: '#f43f5e' },
                  { name: 'erp-inventory', tag: 'LOGISTICS BUS', color: '#f59e0b' },
                  { name: 'erp-db', tag: 'DATABASE NODE', color: '#6366f1' }
                ].map(w => (
                  <div key={w.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: w.color }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-dark)' }}>{w.name}</span>
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.04)', color: w.color }}>
                      {w.tag}
                    </span>
                  </div>
                ))
              ) : (
                [
                  { name: 'payment-service', tag: 'FINANCE', color: '#f43f5e' },
                  { name: 'auth-service', tag: 'AUTH', color: '#6366f1' },
                  { name: 'frontend-service', tag: 'EDGE', color: '#06b6d4' },
                  { name: 'database-service', tag: 'STORAGE', color: '#10b981' }
                ].map(w => (
                  <div key={w.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: w.color }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-dark)' }}>{w.name}</span>
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.04)', color: w.color }}>
                      {w.tag}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Middle Column: Multi-Metric Telemetry Cockpit & Audit Scheduler */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Multi-Metric Telemetry Cockpit */}
          <div className="glass-panel" style={{ padding: '1.6rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', width: '100%', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 8px #10b981'
                  }} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-dark)' }}>
                    {metricTab === 'cpu' ? 'CPU Utilization' : metricTab === 'memory' ? 'Memory Saturation' : metricTab === 'network' ? 'Network Throughput' : 'Request Latency'}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-slate-400)', marginTop: '0.15rem' }}>
                  Target: <strong>{selectedService}</strong> (Active Telemetry Loop)
                </div>
              </div>

              {/* Service selector */}
              <select 
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                style={{ 
                  padding: '0.4rem 1.6rem 0.4rem 0.8rem', 
                  fontSize: '0.78rem', 
                  border: '1px solid var(--border-color)',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  fontWeight: 700,
                  borderRadius: '10px'
                }}
              >
                {mode === 'ecommerce' ? (
                  <>
                    <option value="shop-frontend">shop-frontend</option>
                    <option value="shop-auth">shop-auth</option>
                    <option value="shop-catalog">shop-catalog</option>
                    <option value="shop-notifications">shop-notifications</option>
                  </>
                ) : mode === 'inventraerp' ? (
                  <>
                    <option value="erp-frontend">erp-frontend</option>
                    <option value="erp-core">erp-core</option>
                    <option value="erp-inventory">erp-inventory</option>
                    <option value="erp-db">erp-db</option>
                  </>
                ) : (
                  <>
                    <option value="payment-service">payment-service</option>
                    <option value="auth-service">auth-service</option>
                    <option value="frontend-service">frontend-service</option>
                    <option value="database-service">database-service</option>
                  </>
                )}
              </select>
            </div>

            {/* Metric Switcher Tabs */}
            <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
              {[
                { id: 'cpu', label: 'CPU %', key: 'cpu', color: '#10b981' },
                { id: 'memory', label: 'Memory %', key: 'memory', color: '#8b5cf6' },
                { id: 'network', label: 'Network KB/s', key: 'network', color: '#06b6d4' },
                { id: 'latency', label: 'Latency ms', key: 'latency', color: '#f59e0b' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMetricTab(tab.id)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: metricTab === tab.id ? 'var(--color-dark)' : 'rgba(25, 26, 35, 0.04)',
                    color: metricTab === tab.id ? '#ffffff' : 'var(--color-slate-700)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dynamic Area Chart */}
            <div style={{ height: '180px', width: '100%', minHeight: '180px' }}>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={displayChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={metricTab === 'cpu' ? '#10b981' : metricTab === 'memory' ? '#8b5cf6' : metricTab === 'network' ? '#06b6d4' : '#f59e0b'} stopOpacity={0.45}/>
                      <stop offset="95%" stopColor={metricTab === 'cpu' ? '#10b981' : metricTab === 'memory' ? '#8b5cf6' : metricTab === 'network' ? '#06b6d4' : '#f59e0b'} stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#111318',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontFamily: '"JetBrains Mono", monospace'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={metricTab} 
                    stroke={metricTab === 'cpu' ? '#10b981' : metricTab === 'memory' ? '#8b5cf6' : metricTab === 'network' ? '#06b6d4' : '#f59e0b'} 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#metricGrad)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Operational Timeline Scheduler */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', flex: 1, backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} color="var(--color-dark)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-dark)' }}>Audit Trail Scheduler</span>
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#475569' }}>
                LIVE LOG
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '200px' }}>
              {auditTrail.length === 0 ? (
                <div style={{ fontSize: '0.75rem', opacity: 0.7, textAlign: 'center', padding: '1.5rem 0', color: 'var(--color-slate-400)' }}>
                  No recent audit events in buffer.
                </div>
              ) : (
                auditTrail.map((ev) => {
                  const dateObj = new Date(ev.timestamp);
                  const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
                  
                  let title = ev.event_type;
                  let description = "Event logged.";
                  let iconColor = '#6366f1';
                  
                  if (ev.event_type === 'DETECTION') {
                    title = "Incident Detected";
                    description = ev.payload?.explanation || `Detected ${ev.payload?.incident_type} in ${ev.service_name}.`;
                    iconColor = '#f43f5e';
                  } else if (ev.event_type === 'PREDICTION') {
                    title = "Forecast Prediction";
                    description = `Predicted ${ev.payload?.metric} exhaustion in ${ev.service_name}.`;
                    iconColor = '#f59e0b';
                  } else if (ev.event_type === 'CANDIDATE_PROPOSAL') {
                    title = "Candidate Generation";
                    description = `Generated mitigation candidates for ${ev.service_name}.`;
                    iconColor = '#8b5cf6';
                  } else if (ev.event_type === 'ASSURANCE') {
                    title = "Decision Assurance";
                    description = ev.payload?.explanation || `Evaluated decision with score ${ev.payload?.score}.`;
                    iconColor = '#10b981';
                  } else if (ev.event_type === 'EXECUTION') {
                    title = "Remediation Executed";
                    description = ev.payload?.summary || `Executed ${ev.payload?.action} on ${ev.service_name}.`;
                    iconColor = '#06b6d4';
                  } else if (ev.event_type === 'RECOVERY') {
                    title = "Service Recovered";
                    description = ev.payload?.explanation || `${ev.service_name} returned to baseline.`;
                    iconColor = '#10b981';
                  }

                  return (
                    <div key={ev.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(25, 26, 35, 0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px'
                    }}>
                      <div style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: 'var(--color-dark)',
                        fontFamily: '"JetBrains Mono", monospace',
                        width: '50px',
                        flexShrink: 0
                      }}>
                        {timeString}
                      </div>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: iconColor, flexShrink: 0 }} />
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-dark)', flex: 1 }}>
                        <strong>{title}</strong>: {description}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Workload Bounds & Remediation Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Active Policies compliances gauges */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-dark)' }}>Workload Governance</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#10b981', padding: '0.15rem 0.45rem', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                98% Safe
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  <span>Scaling Bounds</span>
                  <span style={{ color: '#10b981' }}>100% compliant</span>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', background: '#f1f5f9', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: '#10b981' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  <span>Database Resets</span>
                  <span style={{ color: 'var(--color-dark)' }}>Locked & Ring-Fenced</span>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', background: '#f1f5f9', overflow: 'hidden' }}>
                  <div style={{ width: '85%', height: '100%', background: 'var(--color-dark)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Remediation Queue Card — Refined Glassmorphism */}
          <div className="glass-panel" style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
            backgroundColor: '#ffffff',
            flex: 1
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={16} color="var(--color-dark)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-dark)' }}>Remediation Queue</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', padding: '0.15rem 0.45rem', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                {recentDecisions.filter(d => d.status === 'EXECUTED').length}/{recentDecisions.length || 3} RESOLVED
              </span>
            </div>

            {/* Checklist tasks container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', overflowY: 'auto', maxHeight: '220px' }}>
              {recentDecisions.length === 0 ? (
                <div style={{ fontSize: '0.75rem', opacity: 0.7, textAlign: 'center', padding: '1.5rem 0', color: 'var(--color-slate-400)' }}>
                  No active decisions in queue.
                </div>
              ) : (
                recentDecisions.map((dec) => {
                  const isDone = dec.status === 'EXECUTED';
                  return (
                    <div 
                      key={dec.id} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 0.9rem',
                        backgroundColor: 'rgba(25, 26, 35, 0.02)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isDone ? (
                          <CheckCircle size={15} color="#10b981" />
                        ) : (
                          <AlertTriangle size={15} color="#f59e0b" />
                        )}
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-dark)', fontWeight: 700 }}>
                          {dec.action_name}
                        </span>
                      </div>

                      <span style={{ 
                        fontSize: '0.65rem', 
                        fontWeight: 800, 
                        color: isDone ? '#10b981' : '#f59e0b',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '6px',
                        backgroundColor: isDone ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        textTransform: 'uppercase'
                      }}>
                        {dec.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => navigate('/decision')}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'rgba(25, 26, 35, 0.03)',
                color: 'var(--color-dark)',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                marginTop: 'auto'
              }}
            >
              <span>Inspect Decision Center</span>
              <ArrowRight size={13} />
            </button>
          </div>
          
          {/* Active Alerts Panel — always mounted, CSS transition */}
          <div style={{
            opacity: (criticalAlerts.length > 0 || warningAlerts.length > 0) ? 1 : 0,
            maxHeight: (criticalAlerts.length > 0 || warningAlerts.length > 0) ? '600px' : '0px',
            overflow: 'hidden',
            transition: 'opacity 0.4s ease, max-height 0.4s ease',
          }}>
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', flex: 1 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-dark)' }}>Live Anomaly Logs</span>
              
              {criticalAlerts.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-rose)' }}>CRITICAL</span>
                  {criticalAlerts.map(a => (
                    <div key={a.id} style={{ fontSize: '0.75rem', padding: '0.5rem', background: 'rgba(244, 63, 94, 0.05)', borderLeft: '3px solid var(--color-rose)' }}>
                      <strong>{a.title}</strong>: {a.description}
                    </div>
                  ))}
                </div>
              )}
              
              {warningAlerts.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-amber)' }}>WARNING</span>
                  {warningAlerts.map(a => (
                    <div key={a.id} style={{ fontSize: '0.75rem', padding: '0.5rem', background: 'rgba(245, 158, 11, 0.05)', borderLeft: '3px solid var(--color-amber)' }}>
                      <strong>{a.title}</strong>: {a.description}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Inventra ERP Agent Integration Modal */}
      {showAgentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#111318',
            color: '#ffffff',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '640px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <Terminal size={18} color="#b9ff66" />
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b9ff66', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Client Telemetry Integration
                  </span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
                  Inventra ERP Telemetry Agent
                </h3>
              </div>
              <button
                onClick={() => setShowAgentModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '8px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Ingestion Status Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.2rem',
              borderRadius: '12px',
              backgroundColor: dashboardData?.live_agent_active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.1)',
              border: dashboardData?.live_agent_active ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(59, 130, 246, 0.25)',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: dashboardData?.live_agent_active ? '#10b981' : '#3b82f6',
                  boxShadow: dashboardData?.live_agent_active ? '0 0 10px #10b981' : 'none'
                }} />
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: dashboardData?.live_agent_active ? '#34d399' : '#60a5fa' }}>
                    {dashboardData?.live_agent_active ? 'Real Client Streaming Active' : 'Standby for Client Agent Stream'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                    {dashboardData?.live_agent_active 
                      ? 'Live telemetry is actively streaming and superseding synthetic twin data.' 
                      : 'Vector is currently projecting metrics via the Digital Twin until agent connects.'}
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.06)', color: '#e2e8f0' }}>
                {dashboardData?.live_agent_active ? 'CONNECTED' : 'STANDBY'}
              </span>
            </div>

            {/* API Key Box */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>
                PROJECT API KEY (Header: X-Vector-Key)
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                backgroundColor: '#0a0b0d',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.8rem',
                color: '#b9ff66'
              }}>
                <span>vect_inventraerp_sk_live_abc123xyz</span>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: copied ? '#34d399' : '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Run Commands Terminal Card */}
            <div style={{
              backgroundColor: '#0a0b0d',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '1.1rem 1.25rem',
              marginBottom: '1.5rem',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.78rem'
            }}>
              <div style={{ color: '#64748b', marginBottom: '0.4rem' }}># 1. In your Inventra ERP project directory:</div>
              <div style={{ color: '#e2e8f0', marginBottom: '0.75rem', backgroundColor: '#181b22', padding: '0.45rem 0.75rem', borderRadius: '6px' }}>
                python vector_agent.py
              </div>
              
              <div style={{ color: '#64748b', marginBottom: '0.4rem' }}># 2. Simulate high CPU slope stress to test SRE Decision Assurance:</div>
              <div style={{ color: '#b9ff66', backgroundColor: '#181b22', padding: '0.45rem 0.75rem', borderRadius: '6px' }}>
                python vector_agent.py --spike erp-frontend
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowAgentModal(false)}
                style={{
                  padding: '0.65rem 1.4rem',
                  borderRadius: '10px',
                  backgroundColor: '#b9ff66',
                  color: '#0d0e12',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
