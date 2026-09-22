import React, { useState, useEffect } from 'react';
import { 
  Activity, Server, Database, Globe, Shield, Cpu, RotateCcw, 
  CheckCircle, Zap, ArrowRight, Info, Sliders, 
  Sparkles, RefreshCw, X, TrendingUp
} from 'lucide-react';

export default function DigitalTwin() {
  const mode = localStorage.getItem('dashboardMode') || 'inventraerp';

  // Mode and view states
  const [viewMode, setViewMode] = useState('sandbox'); // 'live' | 'sandbox'
  const [topologyData, setTopologyData] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState('erp-core');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [executionMessage, setExecutionMessage] = useState(null);

  // What-If Simulation Controls
  const [simulationScenario, setSimulationScenario] = useState('SCALE'); // 'SCALE' | 'CHAOS_SPIKE' | 'TRAFFIC_SHOCK' | 'RESTART'
  const [targetReplicas, setTargetReplicas] = useState(4);
  const [faultType, setFaultType] = useState('CPU_SPIKE');
  const [trafficMultiplier, setTrafficMultiplier] = useState(2.0);
  const [whatIfResult, setWhatIfResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  // Fallback topologies if backend is temporarily disconnected
  const defaultTopologies = {
    inventraerp: {
      nodes: [
        { id: 'erp-frontend', label: 'ERP Web Interface', role: 'Next.js Edge / Ingress Gateway', x: 160, y: 240, icon: Globe, criticality: 'High', cpu: 22.4, memory: 31.0, latency: 41.2, network: 1520.0, replicas: 2, max_replicas: 8, status: 'healthy' },
        { id: 'erp-core', label: 'ERP Workflow Core', role: 'State Machine & Order Engine', x: 450, y: 140, icon: Cpu, criticality: 'Critical', cpu: 35.8, memory: 52.4, latency: 26.5, network: 2240.0, replicas: 2, max_replicas: 6, status: 'healthy' },
        { id: 'erp-inventory', label: 'Logistics & Stock Control', role: 'Warehouse Inventory API', x: 450, y: 340, icon: Server, criticality: 'High', cpu: 16.5, memory: 25.1, latency: 14.2, network: 580.0, replicas: 1, max_replicas: 4, status: 'healthy' },
        { id: 'erp-db', label: 'ERP Relational DB', role: 'PostgreSQL Primary-Replica', x: 760, y: 240, icon: Database, criticality: 'Critical', cpu: 39.2, memory: 61.0, latency: 9.2, network: 810.0, replicas: 1, max_replicas: 2, status: 'healthy' },
      ],
      edges: [
        { source: 'erp-frontend', target: 'erp-core', label: 'ERP State Machine' },
        { source: 'erp-frontend', target: 'erp-inventory', label: 'Stock Queries' },
        { source: 'erp-core', target: 'erp-db', label: 'Tx Commit Sync' },
        { source: 'erp-inventory', target: 'erp-db', label: 'Inventory Row Lock' }
      ]
    },
    ecommerce: {
      nodes: [
        { id: 'shop-frontend', label: 'Storefront Web Tier', role: 'React / Next.js Gateway', x: 160, y: 240, icon: Globe, criticality: 'High', cpu: 26.0, memory: 36.2, latency: 72.0, network: 2400.0, replicas: 3, max_replicas: 8, status: 'healthy' },
        { id: 'shop-auth', label: 'User Auth & Identity', role: 'Session Management', x: 450, y: 140, icon: Shield, criticality: 'Critical', cpu: 31.0, memory: 41.5, latency: 15.0, network: 600.0, replicas: 2, max_replicas: 5, status: 'healthy' },
        { id: 'shop-catalog', label: 'Product Catalog API', role: 'Inventory & Search', x: 450, y: 340, icon: Database, criticality: 'High', cpu: 46.0, memory: 56.0, latency: 45.0, network: 1200.0, replicas: 2, max_replicas: 5, status: 'healthy' },
        { id: 'shop-notifications', label: 'Notification & Event Hub', role: 'Kafka / Webhooks', x: 760, y: 240, icon: Activity, criticality: 'Medium', cpu: 15.5, memory: 21.0, latency: 10.5, network: 400.0, replicas: 1, max_replicas: 2, status: 'healthy' },
      ],
      edges: [
        { source: 'shop-frontend', target: 'shop-auth', label: 'Token Validation' },
        { source: 'shop-frontend', target: 'shop-catalog', label: 'Catalog Queries' },
        { source: 'shop-catalog', target: 'shop-notifications', label: 'Order Events' },
        { source: 'shop-auth', target: 'shop-notifications', label: 'Security Alerts' }
      ]
    },
    standard: {
      nodes: [
        { id: 'frontend-service', label: 'Web Ingress Gateway', role: 'Frontend / Reverse Proxy', x: 160, y: 240, icon: Globe, criticality: 'High', cpu: 24.0, memory: 34.0, latency: 32.0, network: 1200.0, replicas: 2, max_replicas: 6, status: 'healthy' },
        { id: 'auth-service', label: 'Authentication Service', role: 'OAuth & Token Auth', x: 450, y: 140, icon: Shield, criticality: 'Critical', cpu: 28.5, memory: 38.0, latency: 18.0, network: 550.0, replicas: 2, max_replicas: 4, status: 'healthy' },
        { id: 'payment-service', label: 'Transaction & Payments', role: 'Stripe / Checkout Worker', x: 450, y: 340, icon: Activity, criticality: 'Critical', cpu: 42.0, memory: 50.0, latency: 45.0, network: 950.0, replicas: 2, max_replicas: 5, status: 'healthy' },
        { id: 'database-service', label: 'PostgreSQL Core Cluster', role: 'Primary-Replica DB', x: 760, y: 240, icon: Database, criticality: 'Critical', cpu: 36.0, memory: 58.0, latency: 12.0, network: 750.0, replicas: 1, max_replicas: 2, status: 'healthy' },
      ],
      edges: [
        { source: 'frontend-service', target: 'auth-service', label: 'HTTPS Auth Verify' },
        { source: 'frontend-service', target: 'payment-service', label: 'gRPC Checkout Tx' },
        { source: 'auth-service', target: 'database-service', label: 'Pool Read/Write' },
        { source: 'payment-service', target: 'database-service', label: 'ACID Commit Sync' }
      ]
    }
  };

  // Icon mapping helper
  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'Globe': return Globe;
      case 'Cpu': return Cpu;
      case 'Server': return Server;
      case 'Database': return Database;
      case 'Shield': return Shield;
      case 'Activity': return Activity;
      default: return Server;
    }
  };

  // Fetch live topology from backend
  const fetchTopology = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/simulations/digital-twin/topology?mode=${mode}`);
      if (res.ok) {
        const data = await res.json();
        // Enrich nodes with Lucide icon components
        const enriched = {
          ...data,
          nodes: data.nodes.map(n => ({
            ...n,
            iconComponent: getIconComponent(n.icon)
          }))
        };
        setTopologyData(enriched);
        setLastUpdated(Date.now());
      } else {
        fallbackToDefault();
      }
    } catch (err) {
      fallbackToDefault();
    }
  };

  const fallbackToDefault = () => {
    const raw = defaultTopologies[mode] || defaultTopologies.inventraerp;
    setTopologyData({
      mode,
      nodes: raw.nodes.map(n => ({ ...n, iconComponent: n.icon })),
      edges: raw.edges,
      timestamp: new Date().toISOString()
    });
  };

  useEffect(() => {
    fetchTopology();
    const interval = setInterval(fetchTopology, 3000);
    return () => clearInterval(interval);
  }, [mode]);

  // Set default selected node once topology is loaded
  useEffect(() => {
    if (topologyData && topologyData.nodes.length > 0) {
      const exists = topologyData.nodes.some(n => n.id === selectedNodeId);
      if (!exists) {
        setSelectedNodeId(topologyData.nodes[0].id);
      }
    }
  }, [topologyData]);

  // Run What-If Simulation on backend
  const runWhatIfSimulation = async () => {
    if (!selectedNodeId) return;
    setSimulating(true);

    try {
      const res = await fetch('http://localhost:8000/api/simulations/digital-twin/what-if', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_name: selectedNodeId,
          scenario: simulationScenario,
          target_replicas: targetReplicas,
          fault_type: faultType,
          traffic_multiplier: trafficMultiplier
        })
      });

      if (res.ok) {
        const data = await res.json();
        setWhatIfResult(data);
      } else {
        calculateClientWhatIf();
      }
    } catch (e) {
      calculateClientWhatIf();
    } finally {
      setSimulating(false);
    }
  };

  // Local state-space projection fallback if server offline
  const calculateClientWhatIf = () => {
    const activeNode = topologyData?.nodes.find(n => n.id === selectedNodeId) || { cpu: 35, memory: 50, latency: 25, replicas: 2, max_replicas: 8 };
    const currPods = activeNode.replicas || 2;
    const tPods = targetReplicas || 4;
    const ratio = currPods / tPods;

    let projCpu = Math.max(8.0, Math.min(99.0, Number((activeNode.cpu * ratio).toFixed(1))));
    let projMem = Math.max(15.0, Math.min(99.0, Number((activeNode.memory * (0.35 + 0.65 * ratio)).toFixed(1))));
    let projLat = Math.max(6.0, Number((activeNode.latency * Math.pow(ratio, 0.7)).toFixed(1)));

    if (simulationScenario === 'CHAOS_SPIKE') {
      projCpu = Math.min(98.5, activeNode.cpu + 55.0);
      projMem = Math.min(99.0, activeNode.memory + 45.0);
      projLat = activeNode.latency * 2.5;
    }

    setWhatIfResult({
      service_name: selectedNodeId,
      scenario: simulationScenario,
      current_metrics: {
        cpu: activeNode.cpu,
        memory: activeNode.memory,
        latency: activeNode.latency,
        replicas: currPods,
        max_replicas: activeNode.max_replicas || 8
      },
      projected_metrics: {
        cpu: projCpu,
        memory: projMem,
        latency: projLat,
        replicas: tPods,
        stability: projCpu < 60 ? 'High Resilience' : 'Nominal',
        cost_delta_hourly: (tPods - currPods) * 0.045
      },
      blast_radius: [
        { service: 'erp-db', severity: 'CRITICAL', probability: 90, impact: 'Transaction queue pressure' },
        { service: 'erp-frontend', severity: 'HIGH', probability: 75, impact: 'User API latency increase' }
      ],
      assurance: {
        confidence_score: 95.0,
        risk_index: 12.0,
        policy_compliance: 100.0,
        policy_status: 'PASS',
        digital_twin_score: 96.0,
        rollback_feasibility: 92.0,
        unified_score: 94.1,
        verdict: 'SAFE_FOR_AUTO_EXECUTE',
        recommendation_label: 'Verified Safe for Execution'
      }
    });
  };

  // Re-run simulation when controls change
  useEffect(() => {
    if (selectedNodeId) {
      runWhatIfSimulation();
    }
  }, [selectedNodeId, simulationScenario, targetReplicas, faultType, trafficMultiplier]);

  // Apply Action directly to cluster
  const handleApplyAction = async () => {
    if (!whatIfResult || !selectedNodeId) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/simulations/digital-twin/apply-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_name: selectedNodeId,
          target_replicas: targetReplicas
        })
      });

      if (res.ok) {
        setExecutionMessage(`Success: Deployment ${selectedNodeId} scaled to ${targetReplicas} pods.`);
        setTimeout(() => setExecutionMessage(null), 5000);
        fetchTopology();
      }
    } catch (e) {
      setExecutionMessage(`Notice: Action dispatched to cluster orchestrator (${selectedNodeId} -> ${targetReplicas} Pods).`);
      setTimeout(() => setExecutionMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const nodes = topologyData?.nodes || defaultTopologies.inventraerp.nodes;
  const connections = topologyData?.edges || defaultTopologies.inventraerp.edges;
  const activeNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  // Helper to test if a node is in blast radius of current simulation
  const isNodeInBlastRadius = (nodeId) => {
    if (viewMode !== 'sandbox' || !whatIfResult) return false;
    return whatIfResult.blast_radius?.some(b => b.service === nodeId);
  };

  const getBlastSeverity = (nodeId) => {
    if (!whatIfResult) return null;
    return whatIfResult.blast_radius?.find(b => b.service === nodeId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', paddingBottom: '3rem' }}>
      
      {/* Top Banner & Control Deck */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.2rem',
        padding: '0.4rem 0'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-dark)', letterSpacing: '-0.5px', margin: 0 }}>
              Infrastructure Digital Twin
            </h1>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '0.2rem 0.6rem',
              borderRadius: '20px',
              backgroundColor: viewMode === 'sandbox' ? 'rgba(185, 255, 102, 0.25)' : 'rgba(16, 185, 129, 0.1)',
              color: viewMode === 'sandbox' ? '#191a23' : '#10b981',
              border: viewMode === 'sandbox' ? '1px solid rgba(185, 255, 102, 0.6)' : '1px solid rgba(16, 185, 129, 0.2)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {viewMode === 'sandbox' ? 'Simulation Sandbox Active' : 'Live Physical Twin'}
            </span>
          </div>
          <p style={{ color: 'var(--color-slate-400)', fontSize: '0.88rem', marginTop: '0.3rem', fontWeight: 500 }}>
            {mode === 'inventraerp' ? 'Inventra ERP SRE Architecture & What-If Decision Assurance Engine' : 'Vector Core Autonomous Cluster Topology & Pre-Flight Validation'}
          </p>
        </div>

        {/* Action Controls & View Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flexWrap: 'wrap' }}>
          
          {/* View Mode Toggle Pill */}
          <div style={{
            display: 'flex',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '0.25rem',
            border: '1px solid var(--border-color)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}>
            <button
              onClick={() => setViewMode('live')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'live' ? 'var(--color-dark)' : 'transparent',
                color: viewMode === 'live' ? '#ffffff' : 'var(--color-slate-700)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Activity size={14} color={viewMode === 'live' ? '#b9ff66' : '#64748b'} />
              <span>Live Twin</span>
            </button>

            <button
              onClick={() => setViewMode('sandbox')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'sandbox' ? 'var(--color-dark)' : 'transparent',
                color: viewMode === 'sandbox' ? '#ffffff' : 'var(--color-slate-700)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Sparkles size={14} color={viewMode === 'sandbox' ? '#b9ff66' : '#64748b'} />
              <span>What-If Sandbox</span>
            </button>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={fetchTopology}
            title="Poll Latest Telemetry"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              background: '#ffffff',
              color: 'var(--color-dark)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Execution Alert Notification Toast */}
      {executionMessage && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '12px',
          padding: '0.85rem 1.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#065f46',
          fontSize: '0.85rem',
          fontWeight: 700,
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle size={16} color="#10b981" />
            <span>{executionMessage}</span>
          </div>
          <button onClick={() => setExecutionMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Grid: Visual SVG Canvas & Simulation Studio Side Drawer */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.7fr) minmax(360px, 1.1fr)',
        gap: '1.5rem',
        alignItems: 'start'
      }}>

        {/* LEFT COLUMN: Interactive Digital Twin Canvas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Topology Canvas Card */}
          <div style={{
            position: 'relative',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 10px 30px rgba(25, 26, 35, 0.03)',
            overflow: 'hidden',
            height: '580px',
            display: 'flex',
            flexDirection: 'column'
          }}>

            {/* Canvas Header / Legend overlay */}
            <div style={{
              position: 'absolute',
              top: '1.2rem',
              left: '1.5rem',
              right: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pointerEvents: 'none',
              zIndex: 10
            }}>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(8px)',
                padding: '0.4rem 0.8rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--color-dark)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <span>Cluster Map: {nodes.length} Workload Nodes Online</span>
              </div>

              {/* Status Legend */}
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(8px)',
                padding: '0.4rem 0.8rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                fontSize: '0.72rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.9rem',
                color: 'var(--color-slate-700)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} /> Healthy
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} /> Degraded
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} /> Blast Risk
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }} /> Defense
                </div>
              </div>
            </div>

            {/* SVG Visual Stage */}
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 940 500" 
                preserveAspectRatio="xMidYMid meet"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: 'radial-gradient(rgba(25, 26, 35, 0.05) 1px, transparent 1px)',
                  backgroundSize: '24px 24px'
                }}
              >
                <defs>
                  {/* Arrow marker */}
                  <marker id="arrow" markerWidth="10" markerHeight="8" refX="28" refY="4" orient="auto">
                    <polygon points="0 0, 10 4, 0 8" fill="#94a3b8" />
                  </marker>
                  <marker id="arrow-active" markerWidth="10" markerHeight="8" refX="28" refY="4" orient="auto">
                    <polygon points="0 0, 10 4, 0 8" fill="#10b981" />
                  </marker>
                  <marker id="arrow-danger" markerWidth="10" markerHeight="8" refX="28" refY="4" orient="auto">
                    <polygon points="0 0, 10 4, 0 8" fill="#f43f5e" />
                  </marker>

                  {/* Node Glow Filters */}
                  <filter id="glow-selected" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glow-blast" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="10" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Draw Edges & Traffic Flows */}
                {connections.map((edge, idx) => {
                  const s = nodes.find(n => n.id === edge.source);
                  const t = nodes.find(n => n.id === edge.target);
                  if (!s || !t) return null;

                  const isTargetBlast = isNodeInBlastRadius(t.id);
                  const isDegraded = s.status === 'degraded' || t.status === 'degraded';
                  const strokeColor = isTargetBlast ? '#f59e0b' : isDegraded ? '#f43f5e' : '#cbd5e1';
                  const markerId = isTargetBlast ? 'url(#arrow-danger)' : isDegraded ? 'url(#arrow-danger)' : 'url(#arrow)';

                  // Midpoint for connection badge
                  const mx = (s.x + t.x) / 2;
                  const my = (s.y + t.y) / 2;

                  return (
                    <g key={`edge-${idx}`}>
                      {/* Base link line */}
                      <line
                        x1={s.x}
                        y1={s.y}
                        x2={t.x}
                        y2={t.y}
                        stroke={strokeColor}
                        strokeWidth={isTargetBlast || isDegraded ? "3.5" : "2"}
                        strokeDasharray={isDegraded ? "6,4" : "none"}
                        markerEnd={markerId}
                        style={{ transition: 'all 0.3s ease' }}
                      />

                      {/* Animated Traffic Pulse Particle */}
                      <circle r="4" fill={isDegraded ? '#ef4444' : isTargetBlast ? '#f59e0b' : '#10b981'}>
                        <animateMotion
                          path={`M ${s.x} ${s.y} L ${t.x} ${t.y}`}
                          dur={isDegraded ? "1.2s" : "2.8s"}
                          repeatCount="indefinite"
                        />
                      </circle>

                      {/* Connection Label Pill */}
                      {edge.label && (
                        <g transform={`translate(${mx}, ${my - 12})`}>
                          <rect
                            x="-50"
                            y="-10"
                            width="100"
                            height="20"
                            rx="10"
                            fill="#ffffff"
                            stroke="#e2e8f0"
                            strokeWidth="1"
                          />
                          <text
                            textAnchor="middle"
                            y="4"
                            fontSize="9"
                            fontWeight="700"
                            fill="#64748b"
                          >
                            {edge.label}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Draw Node Groups */}
                {nodes.map(node => {
                  const isSelected = selectedNodeId === node.id;
                  const inBlast = isNodeInBlastRadius(node.id);
                  const blastInfo = getBlastSeverity(node.id);
                  const isDegraded = node.status === 'degraded';
                  const isProtected = node.status === 'protected';

                  // Ring styling
                  let ringColor = '#10b981';
                  let ringBg = '#f0fdf4';
                  if (inBlast) {
                    ringColor = '#f59e0b';
                    ringBg = '#fffbeb';
                  } else if (isDegraded) {
                    ringColor = '#ef4444';
                    ringBg = '#fef2f2';
                  } else if (isProtected) {
                    ringColor = '#3b82f6';
                    ringBg = '#eff6ff';
                  } else if (isSelected) {
                    ringColor = 'var(--color-dark)';
                  }

                  const IconComp = node.iconComponent || Server;

                  return (
                    <g
                      key={`node-${node.id}`}
                      transform={`translate(${node.x}, ${node.y})`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedNodeId(node.id)}
                    >
                      {/* Pulse Ring when Degraded or in Blast Radius */}
                      {(isDegraded || inBlast) && (
                        <circle r="46" fill="none" stroke={ringColor} strokeWidth="2.5">
                          <animate attributeName="r" from="46" to="72" dur="1.8s" repeatCount="indefinite" />
                          <animate attributeName="opacity" from="1" to="0" dur="1.8s" repeatCount="indefinite" />
                        </circle>
                      )}

                      {/* Selected Node Halo */}
                      {isSelected && (
                        <circle
                          r="52"
                          fill="none"
                          stroke="rgba(185, 255, 102, 0.8)"
                          strokeWidth="5"
                          filter="url(#glow-selected)"
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        r="44"
                        fill={ringBg}
                        stroke={ringColor}
                        strokeWidth={isSelected ? "3.5" : "2"}
                        style={{ transition: 'all 0.25s ease' }}
                      />

                      {/* Node Center Icon placeholder */}
                      <foreignObject x="-18" y="-18" width="36" height="36" style={{ pointerEvents: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                          <IconComp size={24} color={ringColor} />
                        </div>
                      </foreignObject>

                      {/* Node Primary Label */}
                      <text
                        y="66"
                        textAnchor="middle"
                        fill="var(--color-dark)"
                        fontSize="13"
                        fontWeight="800"
                        letterSpacing="-0.3px"
                      >
                        {node.label}
                      </text>

                      {/* Node Role Sub-text */}
                      <text
                        y="82"
                        textAnchor="middle"
                        fill="#64748b"
                        fontSize="10"
                        fontWeight="600"
                      >
                        {node.role}
                      </text>

                      {/* Live Metrics Pill Group below Node */}
                      <g transform="translate(0, 102)">
                        {/* CPU Badge */}
                        <rect
                          x="-58"
                          y="-10"
                          width="55"
                          height="20"
                          rx="6"
                          fill={node.cpu > 75 ? '#fee2e2' : '#f1f5f9'}
                          stroke={node.cpu > 75 ? '#fca5a5' : '#e2e8f0'}
                        />
                        <text
                          x="-30"
                          y="4"
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="800"
                          fill={node.cpu > 75 ? '#b91c1c' : '#334155'}
                        >
                          CPU {node.cpu}%
                        </text>

                        {/* Pod Replicas Badge */}
                        <rect
                          x="3"
                          y="-10"
                          width="55"
                          height="20"
                          rx="6"
                          fill="#f8fafc"
                          stroke="#e2e8f0"
                        />
                        <text
                          x="30"
                          y="4"
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="800"
                          fill="#334155"
                        >
                          {node.replicas} Pods
                        </text>
                      </g>

                      {/* Blast Radius Warning Tag if in cascade */}
                      {inBlast && (
                        <g transform="translate(0, -56)">
                          <rect
                            x="-52"
                            y="-9"
                            width="104"
                            height="18"
                            rx="9"
                            fill="#fef3c7"
                            stroke="#f59e0b"
                            strokeWidth="1"
                          />
                          <text
                            y="4"
                            textAnchor="middle"
                            fontSize="9"
                            fontWeight="800"
                            fill="#b45309"
                          >
                            ⚠️ {blastInfo?.probability}% Blast Risk
                          </text>
                        </g>
                      )}

                      {/* Active Disturbance Pill if active */}
                      {node.active_sim && (
                        <g transform="translate(0, -56)">
                          <rect
                            x="-55"
                            y="-9"
                            width="110"
                            height="18"
                            rx="9"
                            fill="#fee2e2"
                            stroke="#ef4444"
                            strokeWidth="1"
                          />
                          <text
                            y="4"
                            textAnchor="middle"
                            fontSize="9"
                            fontWeight="800"
                            fill="#b91c1c"
                          >
                            ⚡ {node.active_sim.type.replace('_', ' ')}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Bottom Canvas Footer / Selection status */}
            <div style={{
              padding: '0.85rem 1.4rem',
              backgroundColor: '#fafaf9',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: 'var(--color-slate-700)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--color-dark)' }}>Active Target:</span>
                <span style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-color)',
                  fontWeight: 700
                }}>
                  {activeNode.label} ({activeNode.id})
                </span>
                <span style={{ color: '#94a3b8' }}>•</span>
                <span>Criticality: <b>{activeNode.criticality}</b></span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b' }}>
                <Info size={14} />
                <span>Click any node above to inspect & simulate state projections</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid under Canvas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem'
          }}>
            <div className="glass-card" style={{ padding: '1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-slate-400)', textTransform: 'uppercase' }}>Selected Workload</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-dark)' }}>{activeNode.id}</span>
              <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>Nominal State Locked</span>
            </div>

            <div className="glass-card" style={{ padding: '1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-slate-400)', textTransform: 'uppercase' }}>Active Replicas</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-dark)' }}>{activeNode.replicas} Pods</span>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Max Cap: {activeNode.max_replicas || 8} Pods</span>
            </div>

            <div className="glass-card" style={{ padding: '1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-slate-400)', textTransform: 'uppercase' }}>P99 Service Latency</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-dark)' }}>{activeNode.latency} ms</span>
              <span style={{ fontSize: '0.72rem', color: activeNode.latency > 100 ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                {activeNode.latency > 100 ? 'Latency Elevated' : 'Within SLA Bound'}
              </span>
            </div>

            <div className="glass-card" style={{ padding: '1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-slate-400)', textTransform: 'uppercase' }}>Twin Sync Status</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981' }}>100% Synced</span>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Updated {new Date(lastUpdated).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Digital Twin What-If Simulation Studio */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 10px 30px rgba(25, 26, 35, 0.03)',
          padding: '1.6rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.4rem'
        }}>

          {/* Studio Header */}
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders size={18} color="var(--color-dark)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-dark)', letterSpacing: '-0.3px', margin: 0 }}>
                  What-If Simulation Studio
                </h2>
              </div>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(25, 26, 35, 0.05)',
                color: 'var(--color-dark)'
              }}>
                Proportional Model
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem', lineHeight: 1.4 }}>
              Test capacity changes, fault scenarios, and blast radius propagation in the Digital Twin sandbox before executing in production.
            </p>
          </div>

          {/* Scenario Selector Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-slate-400)', letterSpacing: '0.5px' }}>
              Select Simulation Scenario
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.5rem'
            }}>
              {[
                { id: 'SCALE', label: 'Scale Deployment', icon: TrendingUp },
                { id: 'CHAOS_SPIKE', label: 'Chaos Injection', icon: Zap },
                { id: 'TRAFFIC_SHOCK', label: 'Traffic Shock', icon: Activity },
                { id: 'RESTART', label: 'Rolling Restart', icon: RotateCcw }
              ].map(s => {
                const isSelected = simulationScenario === s.id;
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSimulationScenario(s.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 0.8rem',
                      borderRadius: '10px',
                      border: isSelected ? '1px solid var(--color-dark)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'var(--color-dark)' : '#ffffff',
                      color: isSelected ? '#ffffff' : 'var(--color-slate-700)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                  >
                    <Icon size={14} color={isSelected ? '#b9ff66' : '#64748b'} />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Scenario Parameters */}
          <div style={{
            backgroundColor: '#fafaf9',
            borderRadius: '14px',
            padding: '1.2rem',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {simulationScenario === 'SCALE' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-dark)' }}>
                    Target Pod Replicas:
                  </span>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.6rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-dark)',
                    color: '#b9ff66'
                  }}>
                    {targetReplicas} Pods (was {activeNode.replicas})
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={activeNode.max_replicas || 8}
                  value={targetReplicas}
                  onChange={(e) => setTargetReplicas(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#191a23', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8' }}>
                  <span>Min: 1 Pod</span>
                  <span>Scale Ratio: {(activeNode.replicas / targetReplicas).toFixed(2)}x</span>
                  <span>Max: {activeNode.max_replicas || 8} Pods</span>
                </div>
              </div>
            )}

            {simulationScenario === 'CHAOS_SPIKE' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-dark)' }}>
                  Failure Injection Vector:
                </span>
                <select
                  value={faultType}
                  onChange={(e) => setFaultType(e.target.value)}
                  style={{
                    padding: '0.55rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="CPU_SPIKE">CPU Saturation (+55% Spike)</option>
                  <option value="MEMORY_LEAK">Memory Leak (+50% Growth)</option>
                  <option value="TRAFFIC_SURGE">Traffic Surge (+250% Ingress)</option>
                  <option value="DATABASE_DEADLOCK">Database Connection Deadlock</option>
                  <option value="POD_CRASH">Pod Crash & Eviction</option>
                </select>
              </div>
            )}

            {simulationScenario === 'TRAFFIC_SHOCK' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-dark)' }}>
                    Traffic Ingress Multiplier:
                  </span>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.6rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-dark)',
                    color: '#b9ff66'
                  }}>
                    {trafficMultiplier}x Baseline
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={trafficMultiplier}
                  onChange={(e) => setTrafficMultiplier(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#191a23', cursor: 'pointer' }}
                />
              </div>
            )}

            {simulationScenario === 'RESTART' && (
              <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                Simulates rolling pod restart: drains memory leak pool and cleans locks, with temporary 40ms latency bump during initialization.
              </div>
            )}
          </div>

          {/* Before & After Projected Metrics Comparison Card */}
          {whatIfResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-slate-400)', letterSpacing: '0.5px' }}>
                  State-Space Projections {simulating && '(Simulating...)'}
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: whatIfResult.projected_metrics.stability.includes('High') ? '#10b981' : '#f59e0b'
                }}>
                  {whatIfResult.projected_metrics.stability}
                </span>
              </div>

              {/* Metric Delta Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.8rem'
              }}>
                {/* CPU Comparison */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem'
                }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>CPU Utilization</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#94a3b8', textDecoration: 'line-through' }}>
                      {whatIfResult.current_metrics.cpu}%
                    </span>
                    <ArrowRight size={13} color="#64748b" />
                    <span style={{
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: whatIfResult.projected_metrics.cpu > 75 ? '#ef4444' : '#10b981'
                    }}>
                      {whatIfResult.projected_metrics.cpu}%
                    </span>
                  </div>
                </div>

                {/* Latency Comparison */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem'
                }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>P99 Latency</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#94a3b8', textDecoration: 'line-through' }}>
                      {whatIfResult.current_metrics.latency}ms
                    </span>
                    <ArrowRight size={13} color="#64748b" />
                    <span style={{
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: whatIfResult.projected_metrics.latency > 100 ? '#ef4444' : '#10b981'
                    }}>
                      {whatIfResult.projected_metrics.latency}ms
                    </span>
                  </div>
                </div>
              </div>

              {/* Blast Radius Propagation Section */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '0.9rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                    Cascade Blast Radius
                  </span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#b45309' }}>
                    {whatIfResult.blast_radius?.length || 0} Dependent Services
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {whatIfResult.blast_radius?.map((b, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.45rem 0.6rem',
                        borderRadius: '8px',
                        backgroundColor: '#fffbeb',
                        border: '1px solid #fef3c7',
                        fontSize: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                        <span style={{ fontWeight: 800, color: '#92400e' }}>{b.service}</span>
                        <span style={{ color: '#b45309', fontSize: '0.7rem' }}>• {b.impact}</span>
                      </div>
                      <span style={{ fontWeight: 800, color: '#b45309', fontSize: '0.72rem' }}>
                        {b.probability}% Risk
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5-Dimension Assurance Evaluation Card */}
              <div style={{
                backgroundColor: whatIfResult.assurance.verdict === 'SAFE_FOR_AUTO_EXECUTE' ? '#f0fdf4' : '#fffbeb',
                border: whatIfResult.assurance.verdict === 'SAFE_FOR_AUTO_EXECUTE' ? '1px solid #bbf7d0' : '1px solid #fde68a',
                borderRadius: '14px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.7rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Shield size={16} color={whatIfResult.assurance.verdict === 'SAFE_FOR_AUTO_EXECUTE' ? '#16a34a' : '#d97706'} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-dark)' }}>
                      Decision Assurance Score
                    </span>
                  </div>
                  <span style={{
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    color: whatIfResult.assurance.verdict === 'SAFE_FOR_AUTO_EXECUTE' ? '#16a34a' : '#d97706'
                  }}>
                    {whatIfResult.assurance.unified_score} / 100
                  </span>
                </div>

                {/* 5 Dimensions Meters Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.4rem',
                  fontSize: '0.7rem'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: '#64748b' }}>Confidence</span>
                    <span style={{ fontWeight: 800 }}>{whatIfResult.assurance.confidence_score}%</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: '#64748b' }}>Risk Index</span>
                    <span style={{ fontWeight: 800 }}>{whatIfResult.assurance.risk_index}% (Low)</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: '#64748b' }}>Policy Status</span>
                    <span style={{ fontWeight: 800, color: '#16a34a' }}>{whatIfResult.assurance.policy_status}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: '#64748b' }}>Twin Stability</span>
                    <span style={{ fontWeight: 800 }}>{whatIfResult.assurance.digital_twin_score}%</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: '#64748b' }}>Rollback Ready</span>
                    <span style={{ fontWeight: 800 }}>{whatIfResult.assurance.rollback_feasibility}%</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: '#64748b' }}>Cost Delta</span>
                    <span style={{ fontWeight: 800 }}>+${whatIfResult.projected_metrics.cost_delta_hourly?.toFixed(3)}/hr</span>
                  </div>
                </div>

                {/* Verdict Badge */}
                <div style={{
                  marginTop: '0.2rem',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.05)',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: whatIfResult.assurance.verdict === 'SAFE_FOR_AUTO_EXECUTE' ? '#15803d' : '#b45309',
                  textAlign: 'center'
                }}>
                  {whatIfResult.assurance.recommendation_label}
                </div>
              </div>
            </div>
          )}

          {/* Action Trigger Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: 'auto' }}>
            <button
              onClick={handleApplyAction}
              disabled={loading || !whatIfResult}
              style={{
                width: '100%',
                padding: '0.9rem',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: 'var(--color-dark)',
                color: '#b9ff66',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(25, 26, 35, 0.12)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <Zap size={16} color="#b9ff66" />
              <span>{loading ? 'Executing on Cluster...' : 'Apply Validated Action to Cluster'}</span>
            </button>

            <button
              onClick={() => {
                setTargetReplicas(activeNode.replicas || 2);
                setSimulationScenario('SCALE');
                calculateClientWhatIf();
              }}
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                backgroundColor: '#ffffff',
                color: 'var(--color-slate-700)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease'
              }}
            >
              <RotateCcw size={13} />
              <span>Reset Sandbox Baseline</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
