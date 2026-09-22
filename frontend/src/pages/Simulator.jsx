import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Play, Square, Info, ShieldAlert, CheckCircle, Activity, 
  Flame, Cpu, Database, Server, WifiOff, HardDrive, ShieldCheck, 
  ArrowRight, RefreshCw, AlertTriangle, Clock, Layers
} from 'lucide-react';

export default function Simulator() {
  const [incidentType, setIncidentType] = useState('CPU_SPIKE');
  const [targetService, setTargetService] = useState('erp-frontend');
  const [severity, setSeverity] = useState('MEDIUM');
  const [duration, setDuration] = useState(60);
  const [proactiveDefense, setProactiveDefense] = useState(true);
  const [activeSims, setActiveSims] = useState([]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeCategory, setActiveCategory] = useState('scale');
  const mode = localStorage.getItem('dashboardMode') || 'inventraerp';
  const navigate = useNavigate();

  useEffect(() => {
    if (mode === 'ecommerce') {
      setTargetService('shop-frontend');
    } else if (mode === 'inventraerp') {
      setTargetService('erp-frontend');
    } else {
      setTargetService('payment-service');
    }
  }, [mode]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/simulations/status');
      const data = await res.json();
      const filtered = data.filter(s => 
        mode === 'ecommerce' ? s.service.startsWith('shop-') : 
        mode === 'inventraerp' ? s.service.startsWith('erp-') : 
        (!s.service.startsWith('shop-') && !s.service.startsWith('erp-'))
      );
      setActiveSims(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        incident_type: incidentType,
        target_service: targetService,
        severity,
        duration_seconds: duration,
        proactive_defense: proactiveDefense
      };

      const res = await fetch('http://localhost:8000/api/simulations/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        let errMsg = "Simulation already active on target.";
        if (errData && errData.detail) {
          if (typeof errData.detail === 'string') {
            errMsg = errData.detail;
          } else if (Array.isArray(errData.detail)) {
            errMsg = errData.detail.map(e => e.msg).join(', ');
          }
        }
        throw new Error(errMsg);
      }

      setSuccessMsg(`Disturbance injected: ${incidentType.replace(/_/g, ' ')} on ${targetService}. Vector AI SRE defense active.`);
      
      const newSim = {
        id: Math.random().toString(),
        type: incidentType,
        service: targetService,
        severity: severity,
        duration: duration,
        prevented: proactiveDefense,
        elapsed: 0
      };
      setActiveSims(prev => {
        const filtered = prev.filter(s => s.service !== targetService);
        return [...filtered, newSim];
      });

      // Auto redirect to Dashboard after 3s so user sees the live response
      setTimeout(() => {
        navigate(`/dashboard?service=${targetService}`);
      }, 3000);

    } catch (err) {
      setError(err.message);
    }
  };

  const handleStop = async (serviceName) => {
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch(`http://localhost:8000/api/simulations/stop/${serviceName}`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error("Failed to stop simulation.");
      setSuccessMsg(`Restored baseline telemetry for ${serviceName}.`);
      fetchStatus();
    } catch (err) {
      setError(err.message);
    }
  };

  const incidentCatalog = [
    {
      id: 'CPU_SPIKE',
      category: 'scale',
      name: 'CPU Utilization Spike',
      icon: Cpu,
      badge: 'Compute Overload',
      description: 'Spikes CPU limits dynamically towards ~95% utilization. Drives latency surge & triggers autonomous auto-scaling.',
      expectedCurve: 'Sharp exponential ascent to 95% over 15s',
      color: '#f59e0b'
    },
    {
      id: 'TRAFFIC_SURGE',
      category: 'scale',
      name: 'High Traffic API Surge',
      icon: Flame,
      badge: 'Throughput Shock',
      description: 'Simulates 5x incoming HTTP request surge, escalating network throughput and overall request queue latency.',
      expectedCurve: 'Network reaches 4,500 KB/s; latency 2.5x',
      color: '#ec4899'
    },
    {
      id: 'MEMORY_LEAK',
      category: 'resources',
      name: 'Process Memory Leak (OOM)',
      icon: Layers,
      badge: 'OOM Warning',
      description: 'Gradually leaks process memory towards 98% to simulate Linux OOMKilled risk. Proposes hot-restart mitigation.',
      expectedCurve: 'Linear climb (+4% / step) until 98%',
      color: '#8b5cf6'
    },
    {
      id: 'STORAGE_EXHAUSTION',
      category: 'resources',
      name: 'Persistent Volume Exhaustion',
      icon: HardDrive,
      badge: 'Disk Full',
      description: 'Simulates persistent volume capacity reaching 99%. Triggers immediate write timeouts and transaction lockouts.',
      expectedCurve: 'IOPS queue latency escalates 4.0x',
      color: '#ef4444'
    },
    {
      id: 'POD_CRASH',
      category: 'resilience',
      name: 'Replica Pod CrashLoop',
      icon: Server,
      badge: 'Node Degradation',
      description: 'Simulates sudden termination of active worker pods, reducing serving capacity and increasing load on surviving nodes.',
      expectedCurve: 'Serving pods drop 50%; remaining CPU spikes',
      color: '#f97316'
    },
    {
      id: 'NODE_FAILURE',
      category: 'resilience',
      name: 'Worker Node Outage',
      icon: AlertTriangle,
      badge: 'Host Down',
      description: 'Simulates an entire Kubernetes node entering NotReady state, testing automated pod rescheduling and workload migration.',
      expectedCurve: 'Node capacity drop; pod reschedule delay',
      color: '#dc2626'
    },
    {
      id: 'NETWORK_PARTITION',
      category: 'resilience',
      name: 'Inter-Service Packet Loss',
      icon: WifiOff,
      badge: 'Network Fault',
      description: 'Injects simulated 45% packet drop between microservices to trigger client timeout retries and circuit breaking.',
      expectedCurve: '5xx error rate spikes; response latency 3x',
      color: '#06b6d4'
    },
    {
      id: 'DATABASE_DEADLOCK',
      category: 'database',
      name: 'Database Transaction Deadlock',
      icon: Database,
      badge: 'Lock Contention',
      description: 'Simulates circular row locks in PostgreSQL/Prisma, stalling pending transactions and cascading upstream latency.',
      expectedCurve: 'Connection pool saturation; DB latency 5x',
      color: '#6366f1'
    }
  ];

  const currentIncident = incidentCatalog.find(i => i.id === incidentType) || incidentCatalog[0];

  const quickPresets = [
    { label: 'Black Friday Surge', type: 'TRAFFIC_SURGE', sev: 'HIGH', dur: 120 },
    { label: 'OOM Memory Leak', type: 'MEMORY_LEAK', sev: 'HIGH', dur: 60 },
    { label: 'Database Lockout', type: 'DATABASE_DEADLOCK', sev: 'MEDIUM', dur: 60 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      {/* Top Banner & Quick Presets Header */}
      <div className="glass-panel" style={{
        padding: '1.6rem 2rem',
        backgroundColor: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 10px #10b981'
            }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Fault Injection & Chaos Sandbox
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--color-dark)', letterSpacing: '-0.3px' }}>
            Incident Simulation Studio
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--color-slate-400)', marginTop: '0.2rem' }}>
            Inject controlled telemetry perturbations into {mode === 'inventraerp' ? 'Inventra ERP' : mode === 'ecommerce' ? 'ApexStore' : 'Global Cluster'} to test Vector's automated prediction and assurance response.
          </p>
        </div>

        {/* Quick Launch Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-slate-400)', textTransform: 'uppercase' }}>
            Quick Battles:
          </span>
          {quickPresets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setIncidentType(p.type);
                setSeverity(p.sev);
                setDuration(p.dur);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: '1px solid var(--border-color)',
                backgroundColor: incidentType === p.type ? 'var(--color-dark)' : 'rgba(25, 26, 35, 0.03)',
                color: incidentType === p.type ? '#ffffff' : 'var(--color-slate-700)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Zap size={12} color={incidentType === p.type ? '#b9ff66' : 'currentColor'} />
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Split Cockpit */}
      <div className="responsive-grid two-cols" style={{ width: '100%', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: Fault Generator Deck */}
        <div className="glass-panel" style={{ padding: '2rem', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={20} color="#f59e0b" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--color-dark)' }}>Configure Disturbance</h2>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-slate-400)' }}>Select failure mode, blast scope & severity</div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {[
                { id: 'scale', label: 'Scale' },
                { id: 'resources', label: 'Memory' },
                { id: 'resilience', label: 'Nodes' },
                { id: 'database', label: 'Data' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: '8px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeCategory === cat.id ? 'var(--color-dark)' : 'rgba(25, 26, 35, 0.05)',
                    color: activeCategory === cat.id ? '#ffffff' : 'var(--color-slate-700)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleStart} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Scenario Selector Cards */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-slate-700)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Incident Failure Mode
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {incidentCatalog
                  .filter(item => activeCategory === 'all' || item.category === activeCategory)
                  .map(item => {
                    const ItemIcon = item.icon;
                    const isSelected = incidentType === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setIncidentType(item.id)}
                        style={{
                          padding: '0.9rem 1rem',
                          borderRadius: '14px',
                          border: isSelected ? '2px solid var(--color-dark)' : '1px solid var(--border-color)',
                          backgroundColor: isSelected ? 'rgba(25, 26, 35, 0.03)' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem',
                          boxShadow: isSelected ? '0 4px 14px rgba(0,0,0,0.06)' : 'none',
                          transition: 'all 0.18s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: isSelected ? 'var(--color-dark)' : 'rgba(25, 26, 35, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ItemIcon size={14} color={isSelected ? '#b9ff66' : 'var(--color-dark)'} />
                          </div>
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.05)', color: item.color }}>
                            {item.badge}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-dark)', marginTop: '0.2rem' }}>
                          {item.name}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Selected Scenario Diagnostic Card */}
              <div style={{
                marginTop: '0.85rem',
                padding: '0.9rem 1.1rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(25, 26, 35, 0.02)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                gap: '0.8rem',
                alignItems: 'flex-start'
              }}>
                <Info size={16} color="#6366f1" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-700)', lineHeight: 1.45 }}>
                  <strong>Dynamic SRE Impact:</strong> {currentIncident.description}
                  <div style={{ marginTop: '0.3rem', color: 'var(--color-slate-400)', fontSize: '0.72rem', fontFamily: '"JetBrains Mono", monospace' }}>
                    Profile Curve: {currentIncident.expectedCurve}
                  </div>
                </div>
              </div>
            </div>

            {/* Target Microservice & Blast Radius */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-slate-700)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Target Workload Tier
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem' }}>
                {(mode === 'ecommerce' ? [
                  { name: 'shop-frontend', tag: 'EDGE' },
                  { name: 'shop-auth', tag: 'AUTH' },
                  { name: 'shop-catalog', tag: 'CATALOG' },
                  { name: 'shop-notifications', tag: 'QUEUE' }
                ] : mode === 'inventraerp' ? [
                  { name: 'erp-frontend', tag: 'EDGE' },
                  { name: 'erp-core', tag: 'CRITICAL' },
                  { name: 'erp-inventory', tag: 'LOGISTICS' },
                  { name: 'erp-db', tag: 'STORAGE' }
                ] : [
                  { name: 'payment-service', tag: 'FINANCE' },
                  { name: 'auth-service', tag: 'AUTH' },
                  { name: 'frontend-service', tag: 'EDGE' },
                  { name: 'database-service', tag: 'DB' }
                ]).map(svc => {
                  const isSvcSelected = targetService === svc.name;
                  return (
                    <button
                      key={svc.name}
                      type="button"
                      onClick={() => setTargetService(svc.name)}
                      style={{
                        padding: '0.75rem 0.6rem',
                        borderRadius: '12px',
                        border: isSvcSelected ? '2px solid var(--color-dark)' : '1px solid var(--border-color)',
                        backgroundColor: isSvcSelected ? 'var(--color-dark)' : '#ffffff',
                        color: isSvcSelected ? '#ffffff' : 'var(--color-dark)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.3rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: isSvcSelected ? '#b9ff66' : '#64748b' }}>
                          {svc.tag}
                        </span>
                        {isSvcSelected && <CheckCircle size={12} color="#b9ff66" />}
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {svc.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Severity & Duration Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
              {/* Severity Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-slate-700)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Disturbance Severity
                </label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {[
                    { id: 'LOW', label: 'Low', sub: '1.2x' },
                    { id: 'MEDIUM', label: 'Med', sub: '1.5x' },
                    { id: 'HIGH', label: 'High', sub: '2.0x' }
                  ].map(sev => (
                    <button
                      key={sev.id}
                      type="button"
                      onClick={() => setSeverity(sev.id)}
                      style={{
                        flex: 1,
                        padding: '0.65rem 0.2rem',
                        borderRadius: '10px',
                        border: '1px solid',
                        borderColor: severity === sev.id ? 'var(--color-dark)' : 'var(--border-color)',
                        backgroundColor: severity === sev.id ? 'var(--color-dark)' : 'rgba(25, 26, 35, 0.02)',
                        color: severity === sev.id ? '#ffffff' : 'var(--color-slate-700)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.1rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: '0.78rem', fontWeight: 800 }}>{sev.label}</span>
                      <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>{sev.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-slate-700)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Auto-Recovery Timer
                </label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {[30, 60, 120, 180].map(dur => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setDuration(dur)}
                      style={{
                        flex: 1,
                        padding: '0.75rem 0.2rem',
                        borderRadius: '10px',
                        border: '1px solid',
                        borderColor: duration === dur ? 'var(--color-dark)' : 'var(--border-color)',
                        backgroundColor: duration === dur ? 'var(--color-dark)' : 'rgba(25, 26, 35, 0.02)',
                        color: duration === dur ? '#ffffff' : 'var(--color-slate-700)',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {dur}s
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Proactive Defense Modern Toggle */}
            <div 
              onClick={() => setProactiveDefense(!proactiveDefense)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.9rem',
                padding: '1rem 1.25rem',
                borderRadius: '14px',
                backgroundColor: proactiveDefense ? 'rgba(16, 185, 129, 0.06)' : 'rgba(25, 26, 35, 0.02)',
                border: proactiveDefense ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                width: '42px',
                height: '24px',
                borderRadius: '12px',
                backgroundColor: proactiveDefense ? '#10b981' : '#cbd5e1',
                position: 'relative',
                transition: 'background-color 0.2s ease'
              }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  position: 'absolute',
                  top: '3px',
                  left: proactiveDefense ? '21px' : '3px',
                  transition: 'left 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={16} color={proactiveDefense ? '#10b981' : '#64748b'} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-dark)' }}>
                    Vector AI Proactive Defense & Zero Data Loss
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-slate-400)', marginTop: '0.15rem' }}>
                  Vector OLS forecast model will detect the slope prior to 300s exhaustion and trigger MCDA assurance recommendations.
                </div>
              </div>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div style={{
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#e11d48',
                padding: '0.85rem 1.2rem',
                borderRadius: '12px',
                fontSize: '0.82rem',
                fontWeight: 700
              }}>
                {error}
              </div>
            )}
            {successMsg && (
              <div style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#047857',
                padding: '0.85rem 1.2rem',
                borderRadius: '12px',
                fontSize: '0.82rem',
                fontWeight: 700
              }}>
                {successMsg}
              </div>
            )}

            {/* Injection CTA Button */}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '1.1rem',
                borderRadius: '14px',
                border: 'none',
                backgroundColor: 'var(--color-dark)',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                boxShadow: '0 10px 25px rgba(25, 26, 35, 0.15)',
                transition: 'all 0.2s ease'
              }}
            >
              <Play size={16} fill="#b9ff66" stroke="#b9ff66" />
              <span>Inject Operational Disturbance ({targetService})</span>
              <ArrowRight size={16} color="#b9ff66" />
            </button>
          </form>
        </div>

        {/* Right Column: Active Disturbance Registry & Safety Guard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Active Disturbances Cockpit */}
          <div className="glass-panel" style={{
            padding: '2rem',
            backgroundColor: '#ffffff',
            minHeight: '380px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Activity size={20} color="var(--color-dark)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--color-dark)' }}>
                  Active Disturbance Registry
                </h3>
              </div>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '0.2rem 0.6rem',
                borderRadius: '20px',
                backgroundColor: activeSims.length > 0 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                color: activeSims.length > 0 ? '#f43f5e' : '#10b981'
              }}>
                {activeSims.length > 0 ? `${activeSims.length} FAULT ACTIVE` : 'HEALTHY (0 FAULTS)'}
              </span>
            </div>

            {activeSims.length === 0 ? (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '2rem',
                backgroundColor: 'rgba(25, 26, 35, 0.015)',
                border: '1px dashed var(--border-color)',
                borderRadius: '16px'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <CheckCircle size={28} color="#10b981" />
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-dark)', margin: 0 }}>
                  Cluster Telemetry Nominal
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-slate-400)', maxWidth: '300px', marginTop: '0.35rem' }}>
                  No synthetic fault disturbances are active. Baseline microservices are streaming nominal telemetry.
                </p>

                {/* Status Chips */}
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {['erp-frontend: 24% CPU', 'erp-core: 38% CPU', 'erp-db: 42% CPU'].map((chip, idx) => (
                    <span key={idx} style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#475569' }}>
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                {activeSims.map(sim => (
                  <div
                    key={sim.id}
                    style={{
                      padding: '1.3rem',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(244, 63, 94, 0.03)',
                      border: '1px solid rgba(244, 63, 94, 0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.9rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '6px', backgroundColor: '#f43f5e', color: '#ffffff' }}>
                            {sim.type.replace(/_/g, ' ')}
                          </span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '6px', backgroundColor: 'rgba(25, 26, 35, 0.06)', color: 'var(--color-dark)' }}>
                            {sim.severity} SEVERITY
                          </span>
                        </div>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.45rem', color: 'var(--color-dark)' }}>
                          {sim.service}
                        </h4>
                      </div>

                      <button
                        onClick={() => handleStop(sim.service)}
                        style={{
                          padding: '0.45rem 0.9rem',
                          borderRadius: '10px',
                          border: '1px solid rgba(244, 63, 94, 0.3)',
                          backgroundColor: '#ffffff',
                          color: '#f43f5e',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          boxShadow: '0 2px 6px rgba(244, 63, 94, 0.1)'
                        }}
                      >
                        <Square size={12} fill="#f43f5e" />
                        <span>Safe Recovery</span>
                      </button>
                    </div>

                    {/* Progress Bar & Countdown */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-slate-400)', marginBottom: '0.35rem' }}>
                        <span>Disturbance Window</span>
                        <span>{Math.round(sim.elapsed)}s / {sim.duration}s</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', borderRadius: '3px', backgroundColor: '#fee2e2', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(100, (sim.elapsed / sim.duration) * 100)}%`,
                          height: '100%',
                          backgroundColor: '#f43f5e',
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem', borderTop: '1px solid rgba(244, 63, 94, 0.1)', fontSize: '0.75rem' }}>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>
                        ✓ Vector SRE Proactive Prediction Active
                      </span>
                      <button
                        onClick={() => navigate(`/dashboard?service=${sim.service}`)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6366f1',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem'
                        }}
                      >
                        <span>Dashboard Telemetry</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Safety Enclosure Guard — Premium Obsidian Card */}
          <div style={{
            padding: '1.75rem',
            borderRadius: '20px',
            backgroundColor: '#101318',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-30%',
              right: '-20%',
              width: '180px',
              height: '180px',
              background: 'radial-gradient(circle, rgba(185, 255, 102, 0.12) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                backgroundColor: 'rgba(185, 255, 102, 0.15)',
                border: '1px solid rgba(185, 255, 102, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldAlert size={20} color="#b9ff66" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Sandbox Safety Enclosure
                </h4>
                <span style={{ fontSize: '0.7rem', color: '#b9ff66', fontWeight: 700 }}>
                  Isolated Telemetry Mock Plane
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
              The Incident Simulator operates exclusively within Vector's simulated telemetry namespace. Destructive actions and load cascades are strictly ring-fenced from modifying bare-metal host workloads.
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.4rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              {['Non-Destructive Sandbox', 'Auto-Rollback Ready', 'Safe for Demo'].map((badge, idx) => (
                <span key={idx} style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '6px', backgroundColor: 'rgba(255, 255, 255, 0.06)', color: '#cbd5e1' }}>
                  ✓ {badge}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
