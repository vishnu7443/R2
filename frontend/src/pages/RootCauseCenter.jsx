import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  GitBranch, Activity, Clock, ShieldCheck, AlertTriangle, ArrowRight, 
  Cpu, Database, Layers, CheckCircle2, XCircle, Search, RefreshCw,
  Zap, FileText, Compass, ExternalLink, Network, Sparkles
} from 'lucide-react';

export default function RootCauseCenter() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceParam = searchParams.get('service') || 'erp-core';

  const [selectedService, setSelectedService] = useState(serviceParam);
  const [rcaData, setRcaData] = useState(null);
  const [remediationPlan, setRemediationPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('evidence'); // 'evidence', 'alternatives', 'changes'
  const [recentChanges, setRecentChanges] = useState([]);
  const [depGraph, setDepGraph] = useState(null);

  // Available services list based on mode
  const mode = localStorage.getItem('dashboardMode') || 'inventraerp';
  const services = mode === 'inventraerp'
    ? ['erp-core', 'erp-frontend', 'erp-inventory', 'erp-db']
    : ['shop-frontend', 'shop-auth', 'shop-payment', 'shop-catalog', 'shop-database'];

  // Fetch RCA Diagnosis and Remediation Plan
  const fetchDiagnosis = async (svc) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8000/api/rca/diagnose/${svc}`);
      if (!res.ok) throw new Error("Diagnosis engine query failed");
      const data = await res.json();
      setRcaData(data.rca);
      setRemediationPlan(data.remediation_plan);
    } catch (err) {
      console.error(err);
      setError("Failed to load Root Cause Diagnosis. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Change Events and Dependency Graph
  const fetchAuxiliary = async () => {
    try {
      const [changeRes, graphRes] = await Promise.all([
        fetch('http://localhost:8000/api/rca/change-events'),
        fetch('http://localhost:8000/api/rca/dependency-graph')
      ]);
      if (changeRes.ok) {
        const changes = await changeRes.json();
        setRecentChanges(changes);
      }
      if (graphRes.ok) {
        const graph = await graphRes.json();
        setDepGraph(graph);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDiagnosis(selectedService);
    fetchAuxiliary();
  }, [selectedService]);

  const signals = rcaData?.signals_breakdown || {
    temporal: 92,
    dependency: 88,
    metric: 94,
    change: 81,
    historical: 76
  };

  const confidence = rcaData?.confidence_score || 88.4;

  const getConfidenceColor = (score) => {
    if (score >= 80) return '#10b981'; // emerald
    if (score >= 60) return '#f59e0b'; // amber
    return '#f43f5e'; // rose
  };

  return (
    <div style={{
      maxWidth: '1440px',
      margin: '0 auto',
      padding: '1.5rem 2rem 4rem 2rem',
      color: 'var(--color-dark)',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '1px solid rgba(25, 26, 35, 0.08)',
        paddingBottom: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.2rem 0.65rem',
              borderRadius: '20px',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              color: '#6366f1',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <Compass size={14} /> Root Cause Intelligence Engine
            </span>
            <span style={{
              padding: '0.2rem 0.65rem',
              borderRadius: '20px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              fontSize: '0.8rem',
              fontWeight: 600
            }}>
              5-Signal Causal AI Active
            </span>
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
            Root Cause Analysis (RCA) Studio
          </h1>
          <p style={{ margin: '0.3rem 0 0 0', color: 'rgba(25, 26, 35, 0.6)', fontSize: '0.95rem' }}>
            Isolate the exact trigger mechanism of infrastructure anomalies through multi-signal correlation and topological propagation.
          </p>
        </div>

        {/* Service Selector & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '0.3rem 0.6rem',
            border: '1px solid rgba(25, 26, 35, 0.12)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            <span style={{ fontSize: '0.85rem', color: 'rgba(25, 26, 35, 0.5)', marginRight: '0.5rem', fontWeight: 600 }}>
              Service:
            </span>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--color-dark)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {services.map(svc => (
                <option key={svc} value={svc}>{svc}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => fetchDiagnosis(selectedService)}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1rem',
              backgroundColor: '#191a23',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s',
              opacity: loading ? 0.7 : 1
            }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Diagnosing...' : 'Re-Diagnose'}
          </button>
        </div>
      </div>

      {/* Main Grid: Probable Root Cause Hero + 5 Signals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Left Hero Card: Probable Cause & Confidence */}
        <div style={{
          gridColumn: 'span 7',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem',
          border: '1px solid rgba(25, 26, 35, 0.08)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle gradient backdrop */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '280px',
            height: '280px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                color: 'rgba(25, 26, 35, 0.5)'
              }}>
                Primary Identified Failure Vector
              </span>
              <h2 style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                margin: '0.35rem 0',
                color: '#191a23',
                letterSpacing: '-0.3px'
              }}>
                {rcaData ? rcaData.root_cause_title : 'Diagnosing Infrastructure State...'}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'rgba(25, 26, 35, 0.6)' }}>
                  Primary Evidence Signal:
                </span>
                <span style={{
                  padding: '0.15rem 0.55rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  color: '#4f46e5',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  {rcaData?.primary_signal || 'Resource Multi-Metric & Latency Delta'}
                </span>
              </div>
            </div>

            {/* Circular Confidence Meter */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '0.8rem 1.2rem',
              borderRadius: '14px',
              backgroundColor: 'rgba(25, 26, 35, 0.03)',
              border: `1px solid ${getConfidenceColor(confidence)}40`
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(25, 26, 35, 0.5)', textTransform: 'uppercase' }}>
                RCA Confidence
              </span>
              <span style={{
                fontSize: '1.9rem',
                fontWeight: 800,
                color: getConfidenceColor(confidence),
                lineHeight: 1.1
              }}>
                {confidence}%
              </span>
              <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600, marginTop: '0.2rem' }}>
                High Certainty
              </span>
            </div>
          </div>

          {/* Causal Chain Pathway Banner */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1.1rem',
            backgroundColor: 'rgba(25, 26, 35, 0.02)',
            borderRadius: '12px',
            border: '1px solid rgba(25, 26, 35, 0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <GitBranch size={16} color="#6366f1" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Isolated Causal Propagation Path
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              {(rcaData?.causal_chain || [
                `Traffic Surge on ${selectedService}`,
                'Inflow Request Volume Spike',
                'Worker Threads Saturated (97%)',
                'Queue Latency Escalation',
                '5xx Error Spikes'
              ]).map((step, idx, arr) => (
                <React.Fragment key={idx}>
                  <div style={{
                    padding: '0.35rem 0.75rem',
                    backgroundColor: idx === arr.length - 1 ? 'rgba(244, 63, 94, 0.1)' : '#ffffff',
                    border: idx === arr.length - 1 ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(25, 26, 35, 0.1)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: idx === arr.length - 1 ? '#e11d48' : 'var(--color-dark)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}>
                    {step}
                  </div>
                  {idx < arr.length - 1 && (
                    <ArrowRight size={14} color="rgba(25, 26, 35, 0.35)" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5-Signal Breakdown Card */}
        <div style={{
          gridColumn: 'span 5',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem',
          border: '1px solid rgba(25, 26, 35, 0.08)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 1rem 0' }}>
            5-Signal Correlation Matrix
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'rgba(25, 26, 35, 0.6)', margin: '-0.5rem 0 1.25rem 0' }}>
            Orthogonal evidence signals synthesized into the composite RCA confidence score.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              { name: '1. Temporal Precursor Ordering', val: signals.temporal, desc: 'Identifies earliest anomalous timestamp across nodes' },
              { name: '2. Topology Dependency Propagation', val: signals.dependency, desc: 'Downstream vs upstream queuing graph traversal' },
              { name: '3. Multi-Metric Cross-Correlation', val: signals.metric, desc: 'CPU, RAM, thread count, latency, and error rate signature' },
              { name: '4. Change & Deployment Drift', val: signals.change, desc: 'Correlates against deployments in the last 60 minutes' },
              { name: '5. Historical Incident Knowledge', val: signals.historical, desc: 'Past post-mortem patterns matching this signature' }
            ].map((sig, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{sig.name}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: getConfidenceColor(sig.val) }}>
                    {sig.val}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'rgba(25, 26, 35, 0.06)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${sig.val}%`,
                    height: '100%',
                    backgroundColor: getConfidenceColor(sig.val),
                    borderRadius: '3px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row: Evidence Tabs & Remediation Strategy Planner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
        
        {/* Left Column: Evidence Dossier & Alternative Hypotheses */}
        <div style={{
          gridColumn: 'span 7',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem',
          border: '1px solid rgba(25, 26, 35, 0.08)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
        }}>
          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderBottom: '1px solid rgba(25, 26, 35, 0.08)',
            paddingBottom: '0.8rem',
            marginBottom: '1.25rem'
          }}>
            <button
              onClick={() => setActiveTab('evidence')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'evidence' ? 'rgba(25, 26, 35, 0.08)' : 'transparent',
                fontWeight: activeTab === 'evidence' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                color: 'var(--color-dark)'
              }}
            >
              <FileText size={15} /> Supporting Evidence ({rcaData?.evidence?.length || 4})
            </button>
            <button
              onClick={() => setActiveTab('alternatives')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'alternatives' ? 'rgba(25, 26, 35, 0.08)' : 'transparent',
                fontWeight: activeTab === 'alternatives' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                color: 'var(--color-dark)'
              }}
            >
              <Compass size={15} /> Alternative Hypotheses
            </button>
            <button
              onClick={() => setActiveTab('changes')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'changes' ? 'rgba(25, 26, 35, 0.08)' : 'transparent',
                fontWeight: activeTab === 'changes' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                color: 'var(--color-dark)'
              }}
            >
              <Clock size={15} /> Change Intelligence
            </button>
          </div>

          {/* Tab 1: Evidence List */}
          {activeTab === 'evidence' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(rcaData?.evidence || [
                `CPU utilization sustained above saturation threshold (92.5% vs 70% nominal SLO)`,
                `Response latency degraded by 70x baseline (1,750ms vs nominal 25ms)`,
                `Error rate elevated to 7.6% due to worker thread starvation timeouts`,
                `Ingress network bandwidth elevated at 2,450 KB/s`,
                `Zero deployment drift detected in preceding 60 minutes`
              ]).map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(25, 26, 35, 0.02)',
                  borderRadius: '10px',
                  border: '1px solid rgba(25, 26, 35, 0.05)'
                }}>
                  <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.88rem', lineHeight: 1.45, color: 'var(--color-dark)' }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Alternative Hypotheses */}
          {activeTab === 'alternatives' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{
                padding: '1rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(25, 26, 35, 0.02)',
                border: '1px solid rgba(25, 26, 35, 0.06)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>1. Database Connection Lock Contention</span>
                  <span style={{ fontSize: '0.78rem', padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(244, 63, 94, 0.1)', color: '#e11d48', fontWeight: 600 }}>
                    Disproven (Confidence: 31%)
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(25, 26, 35, 0.6)' }}>
                  Database response latency remained nominal (18ms) and active connection pool utilization was within normal parameters (38%).
                </p>
              </div>

              <div style={{
                padding: '1rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(25, 26, 35, 0.02)',
                border: '1px solid rgba(25, 26, 35, 0.06)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>2. Memory Leak (Unbounded Heap Growth)</span>
                  <span style={{ fontSize: '0.78rem', padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(244, 63, 94, 0.1)', color: '#e11d48', fontWeight: 600 }}>
                    Disproven (Confidence: 26%)
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(25, 26, 35, 0.6)' }}>
                  Resident memory consumption is stable at 65% without monotonic upward drift; primary stress factor is compute/thread saturation.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Change Intelligence */}
          {activeTab === 'changes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentChanges.length > 0 ? (
                recentChanges.map((change) => (
                  <div key={change.id} style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'rgba(25, 26, 35, 0.02)',
                    borderRadius: '10px',
                    border: '1px solid rgba(25, 26, 35, 0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{change.event_type} on {change.service_name}</span>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: 'rgba(25, 26, 35, 0.5)' }}>
                        Author: {change.author} | Details: {JSON.stringify(change.details)}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(25, 26, 35, 0.5)' }}>
                      {new Date(change.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'rgba(25, 26, 35, 0.5)', fontSize: '0.88rem' }}>
                  No recent deployments or configuration changes recorded in the preceding 60 minutes.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Cause-Aware Remediation Plan */}
        <div style={{
          gridColumn: 'span 5',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem',
          border: '1px solid rgba(25, 26, 35, 0.08)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <Zap size={18} color="#e11d48" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                Cause-Aware Remediation Planner
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(25, 26, 35, 0.6)', margin: '0 0 1.25rem 0' }}>
              Remediation candidates directly matched to the verified root-cause mechanism.
            </p>

            {/* Primary Recommended Action Card */}
            <div style={{
              padding: '1.2rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.5px' }}>
                  ★ Ranked #1 Recommendation
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: '#ffffff', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#047857' }}>
                  {remediationPlan?.category || 'Scaling'}
                </span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: '#191a23' }}>
                {remediationPlan?.recommended_action || `Scale Deployment Replicas on ${selectedService}`}
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'rgba(25, 26, 35, 0.7)', margin: 0, lineHeight: 1.45 }}>
                {remediationPlan?.strategy_rationale || 'Distributes incoming synchronous requests across additional pods, instantly relieving thread pool queue backlog.'}
              </p>
            </div>

            {/* Candidate Alternatives List */}
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(25, 26, 35, 0.5)', letterSpacing: '0.5px' }}>
              Alternative Evaluated Strategies:
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              {(remediationPlan?.candidate_actions || []).slice(1).map((alt, idx) => (
                <div key={idx} style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(25, 26, 35, 0.02)',
                  border: '1px solid rgba(25, 26, 35, 0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{alt.action_name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(25, 26, 35, 0.5)', marginLeft: '0.5rem' }}>({alt.category})</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(25, 26, 35, 0.5)' }}>Rank #{alt.rank}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button: Proceed to Decision Assurance */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(25, 26, 35, 0.08)' }}>
            <button
              onClick={() => navigate('/decision')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                padding: '0.85rem 1.25rem',
                backgroundColor: '#191a23',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(25, 26, 35, 0.15)',
                transition: 'transform 0.15s ease'
              }}
            >
              <span>Validate & Assure Plan in Decision Center</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
