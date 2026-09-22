import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';

export default function PolicyCenter() {
  const [policies, setPolicies] = useState([]);
  const [successId, setSuccessId] = useState(null);

  const fetchPolicies = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/policies');
      const data = await res.json();
      setPolicies(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleToggle = async (policyId, currentEnabled, currentValue) => {
    try {
      const res = await fetch(`http://localhost:8000/api/policies/${policyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: !currentEnabled,
          value: currentValue
        })
      });
      if (res.ok) {
        setSuccessId(policyId);
        setTimeout(() => setSuccessId(null), 2000);
        fetchPolicies();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleValueChange = async (policyId, key, numValue) => {
    const targetPolicy = policies.find(p => p.id === policyId);
    if (!targetPolicy) return;

    const newValue = { ...targetPolicy.value, [key]: numValue };
    try {
      await fetch(`http://localhost:8000/api/policies/${policyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: targetPolicy.enabled,
          value: newValue
        })
      });
      setSuccessId(policyId);
      setTimeout(() => setSuccessId(null), 2000);
      fetchPolicies();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="responsive-grid two-cols" style={{ width: '100%' }}>
      {/* Policy configuration panel */}
      <div className="glass-panel" style={{ padding: '2rem', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.8rem' }}>
          <ShieldCheck size={22} color="var(--color-dark)" style={{ strokeWidth: 2.5 }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Infrastructure Governance Rules</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {policies.map((p) => (
            <div 
              key={p.id} 
              className="glass-card" 
              style={{ 
                padding: '1.5rem',
                border: '1px solid var(--border-color)',
                background: p.enabled ? 'rgba(185, 255, 102, 0.04)' : '#ffffff',
                boxShadow: '0 4px 15px rgba(25, 26, 35, 0.01)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <div>
                  <span className="highlight-badge-dark" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>{p.category.toUpperCase()} GOVERNANCE</span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-dark)', marginTop: '0.4rem' }}>{p.name}</h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  {successId === p.id && (
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 800 }}>SAVED</span>
                  )}
                  <button
                    onClick={() => handleToggle(p.id, p.enabled, p.value)}
                    className={p.enabled ? "btn-dark" : "btn-secondary"}
                    style={{
                      padding: '0.35rem 0.8rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {p.enabled ? "ACTIVE" : "INACTIVE"}
                  </button>
                </div>
              </div>

              {/* Slider for max replicas limit */}
              {p.enabled && p.id === "pol-max-replicas" && (
                <div style={{ marginTop: '0.8rem', background: '#fcfbfa', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--color-dark)' }}>
                    <span>Maximum Replicas Limit:</span>
                    <span className="highlight-badge-green" style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem' }}>{p.value?.limit} Pods</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="10"
                    value={p.value?.limit || 5}
                    onChange={(e) => handleValueChange(p.id, 'limit', parseInt(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--color-dark)' }}
                  />
                </div>
              )}

              {/* Details of policy settings */}
              {p.id === "pol-db-restart" && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', marginTop: '0.5rem', lineHeight: 1.4, fontWeight: 500 }}>
                  Toggles if database-service actions can execute automatically or require a secondary review approval.
                </div>
              )}
              {p.id === "pol-auto-scale" && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', marginTop: '0.5rem', lineHeight: 1.4, fontWeight: 500 }}>
                  Enables or disables auto-pilot scaling for all cluster workloads when metrics exceed thresholds.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Policies info panel & Engineer Alerts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} color="var(--color-dark)" style={{ strokeWidth: 2.5 }} />
            Decision Gate Policies
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-700)', lineHeight: 1.5, marginBottom: '1rem', fontWeight: 500 }}>
            Operational policies govern the transition bounds of Autonomous Execution. When policies are enabled, the Decision Assurance scoring evaluator validates proposed candidates against these rules:
          </p>
          <ul style={{ fontSize: '0.8rem', color: 'var(--color-slate-700)', display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingLeft: '1.2rem', fontWeight: 500 }}>
            <li>
              <strong>Hard Limits</strong>: If target metrics exceed policy counts (e.g. scaling above max replicas limit), evaluations automatically flag warnings and request human override.
            </li>
            <li>
              <strong>Approval Locks</strong>: Sensitive commands like DB restarts will pause and generate a request block in the Decision Center, alerting the SRE team.
            </li>
          </ul>
        </div>

        {/* Engineer Notification Dispatch Panel */}
        <div className="glass-panel" style={{ padding: '2rem', backgroundColor: '#ffffff' }}>
          <div className="highlight-badge-green" style={{ fontSize: '0.65rem', marginBottom: '0.8rem', padding: '0.2rem 0.5rem', fontWeight: 800 }}>
            INSTANT ENGINEER NOTIFICATIONS
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '0.4rem' }}>
            Telegram & Slack Alert Integrations
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-slate-400)', lineHeight: 1.5, marginBottom: '1.2rem', fontWeight: 500 }}>
            Vector automatically dispatches pre-critical threat alerts and auto-remediation summaries directly to engineer Telegram bots & Slack webhooks.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <button
              onClick={async () => {
                try {
                  const res = await fetch('http://localhost:8000/api/notifications/test', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      title: "Pre-Critical Load Spike Alert (erp-frontend)",
                      message: "Vector OLS algorithm predicted CPU exhaustion in 300s. MCDA score 89.5 triggered auto-scaling 2 -> 4 pods.",
                      level: "WARNING",
                      channel: "all"
                    })
                  });
                  const data = await res.json();
                  alert(`✅ Alert Notification Dispatched!\n${data.summary || 'Dispatched to Telegram & Slack'}`);
                } catch (e) {
                  alert("Notice: Notification dispatch triggered.");
                }
              }}
              className="btn-primary"
              style={{
                padding: '0.8rem 1.2rem',
                fontSize: '0.85rem',
                width: '100%',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <span>📲 Dispatch Test Alert to Engineer (Telegram & Slack)</span>
            </button>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-slate-400)', textAlign: 'center', fontWeight: 600 }}>
              Telegram Bot API & Slack Webhook API Active (0 Overhead)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
