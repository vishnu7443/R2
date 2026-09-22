import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  CheckSquare, Play, RefreshCw, ShieldCheck, AlertTriangle, ArrowRight, Terminal, CheckCircle 
} from 'lucide-react';

export default function DecisionCenter() {
  const [searchParams] = useSearchParams();
  const predIdParam = searchParams.get('pred_id');
  const [predictions, setPredictions] = useState([]);
  const [selectedPredId, setSelectedPredId] = useState(predIdParam || '');
  const [evaluations, setEvaluations] = useState([]);
  const [selectedEval, setSelectedEval] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const selectedPredIdRef = React.useRef(selectedPredId);
  useEffect(() => {
    selectedPredIdRef.current = selectedPredId;
  }, [selectedPredId]);

  // Fetch threat predictions on mount and polling
  const fetchThreats = async () => {
    try {
      const mode = localStorage.getItem('dashboardMode') || 'standard';
      const res = await fetch(`http://localhost:8000/api/predictions?mode=${mode}`);
      const data = await res.json();
      setPredictions(data);
      if (!selectedPredIdRef.current && data.length > 0) {
        const activeThreat = data.find(p => !p.resolved && (p.risk_level === 'High' || p.risk_level === 'Critical')) || data[0];
        if (activeThreat) {
          setSelectedPredId(activeThreat.id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchThreats();
    const interval = setInterval(fetchThreats, 1500);
    return () => clearInterval(interval);
  }, []);

  // Sync selected prediction ID when URL search parameter updates
  useEffect(() => {
    if (predIdParam) {
      setSelectedPredId(predIdParam);
    }
  }, [predIdParam]);

  // Fetch evaluations when prediction selection changes, polling silently in real-time
  useEffect(() => {
    const activePredId = selectedPredId || (predictions.length > 0 ? predictions[0].id : '');
    if (!activePredId) return;

    let mounted = true;

    const fetchEvaluations = async (showLoading = false) => {
      if (showLoading) setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/decision-assurance/evaluate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prediction_id: activePredId })
        });
        if (!res.ok) throw new Error("Evaluation failed.");
        const data = await res.json();
        if (!mounted) return;
        const evals = data.evaluations || [];
        setEvaluations(evals);

        if (evals.length > 0) {
          setSelectedEval(prev => {
            if (!prev) return evals[0];
            const match = evals.find(e => e.candidate_id === prev.candidate_id);
            return match || evals[0];
          });
        } else {
          setSelectedEval(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (showLoading && mounted) setLoading(false);
      }
    };

    fetchEvaluations(true);
    const interval = setInterval(() => {
      fetchEvaluations(false);
    }, 2500);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [selectedPredId]);

  const handleManualAction = async (decisionId, action) => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      let endpoint = '';
      let bodyData = {};

      if (action === 'APPROVE' || action === 'REJECT') {
        endpoint = `http://localhost:8000/api/approvals/${decisionId}`;
        bodyData = { action };
      } else {
        endpoint = `http://localhost:8000/api/execution/run`;
        bodyData = { decision_id: decisionId };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || "Action execution failed.");
      }

      const resolvedService = selectedEval?.service_name || 'targeted service';
      const resolvedAction = selectedEval?.action_name || 'remediation action';
      setSuccessMsg(`✓ Solved issue for ${resolvedService} by executing '${resolvedAction}' successfully!`);
      
      // Refresh evaluations state
      if (selectedPredId) {
        const res = await fetch('http://localhost:8000/api/decision-assurance/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prediction_id: selectedPredId })
        });
        const evalData = await res.json();
        setEvaluations(evalData.evaluations || []);
        if (selectedEval) {
          const match = evalData.evaluations?.find(e => e.candidate_id === selectedEval.candidate_id);
          if (match) setSelectedEval(match);
        }
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRollback = async (decisionId) => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`http://localhost:8000/api/execution/rollback/${decisionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error("Failed to execute 1-Click Rollback.");
      const data = await res.json();
      setSuccessMsg(`✓ 1-Click Rollback Complete! ${data.result_summary || 'Deployment spec restored to baseline.'}`);
      
      setSelectedEval(prev => prev ? ({ ...prev, status: 'ROLLED_BACK' }) : null);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'var(--color-emerald)';
    if (score >= 65) return 'var(--color-amber)';
    return 'var(--color-rose)';
  };

  const currentPred = predictions.find(p => p.id === selectedPredId);
  const isHighRisk = currentPred && (currentPred.risk_level?.toLowerCase() === 'high' || currentPred.risk_level?.toLowerCase() === 'critical');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      {/* Dropdown selector */}
      <div className="glass-panel responsive-flex row-md" style={{ padding: '1.2rem 2rem', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CheckSquare size={20} color="var(--color-dark)" style={{ strokeWidth: 2.5 }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Decision Assurance Registry</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-dark)' }}>INSPECT PREDICTION THREAT:</label>
          <select
            value={selectedPredId}
            onChange={(e) => setSelectedPredId(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.85rem'
            }}
          >
            {predictions.length === 0 ? (
              <option value="">No Active Threats Detected</option>
            ) : (
              predictions.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.risk_level.toUpperCase()}{p.resolved ? ' - SOLVED' : ''}] {p.service_name} - {p.metric_name} ({p.current_value}%)
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-dark)', backgroundColor: '#ffffff' }}>
          <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 1.2rem auto', animation: 'spin 2s linear infinite' }} />
          <p style={{ fontWeight: 600 }}>Running multi-dimensional trust evaluations on proposed candidate actions...</p>
        </div>
      ) : evaluations.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-dark)', backgroundColor: '#ffffff' }}>
          <p style={{ fontWeight: 600 }}>No active prediction context loaded. Go to Simulator to trigger an incident.</p>
        </div>
      ) : (
        <div className="responsive-grid two-cols-4-8" style={{ gap: '2rem' }}>
          {/* Candidate Action list (Left) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-slate-400)', letterSpacing: '1px' }}>
              {isHighRisk ? "RECOMMENDED REMEDIATION SOLUTION" : "PROPOSED REMEDIATION CANDIDATES"}
            </h3>
            
            {(isHighRisk ? evaluations.slice(0, 1) : evaluations).map((ev) => {
              const isSelected = selectedEval?.candidate_id === ev.candidate_id;
              return (
                <div
                  key={ev.candidate_id}
                  onClick={() => setSelectedEval(ev)}
                  className="glass-card"
                  style={{
                    padding: '1.5rem',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--color-green)' : '#ffffff',
                    border: '1px solid',
                    borderColor: isSelected ? 'rgba(25, 26, 35, 0.1)' : 'var(--border-color)',
                    boxShadow: isSelected ? '0 8px 24px rgba(185, 255, 102, 0.2)' : '0 4px 15px rgba(25, 26, 35, 0.015)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-dark)' }}>{ev.action_name}</h4>
                    <span style={{
                      fontSize: '1.2rem',
                      fontWeight: 900,
                      color: 'var(--color-dark)'
                    }}>
                      {ev.decision_score}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-dark)', display: 'flex', justifyContent: 'space-between', opacity: 0.8, fontWeight: 600 }}>
                    <span>Impact: <span style={{ fontWeight: 800 }}>{ev.estimated_impact}</span></span>
                    <span>Cost: <span style={{ fontWeight: 800 }}>{ev.resource_cost}</span></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Assurance Report (Right) */}
          {selectedEval && (
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: '#ffffff' }}>
              {/* Header block */}
              <div className="responsive-flex row-md" style={{ justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.2rem' }}>
                <div style={{ flex: 1 }}>
                  <span className="highlight-badge-dark" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
                    DECISION ID: {selectedEval.decision_id}
                  </span>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--color-dark)' }}>{selectedEval.action_name}</h3>
                  
                  {/* Outlined Score Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.8rem', width: '90%' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-slate-700)' }}>MATCH SCORE:</span>
                    <div style={{ flex: 1, height: '12px', borderRadius: '10px', background: 'var(--color-slate-100)', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ width: `${selectedEval.decision_score}%`, height: '100%', background: 'var(--color-dark)' }} />
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', minWidth: '90px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-slate-400)', marginBottom: '0.2rem' }}>DECISION SCORE</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: getScoreColor(selectedEval.decision_score), lineHeight: 1 }}>
                    {selectedEval.decision_score}
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-slate-400)', fontWeight: 600 }}>/100</span>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div style={{
                background: selectedEval.status === 'EXECUTED' ? 'rgba(16,185,129,0.06)' : (selectedEval.final_decision === 'AUTO_EXECUTE' ? 'rgba(185,255,102,0.15)' : 'rgba(245,158,11,0.06)'),
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  {selectedEval.final_decision === 'AUTO_EXECUTE' ? (
                    <ShieldCheck size={24} color="var(--color-dark)" style={{ strokeWidth: 2.5 }} />
                  ) : (
                    <AlertTriangle size={24} color="var(--color-dark)" style={{ strokeWidth: 2.5 }} />
                  )}
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-dark)' }}>
                      Recommendation: {selectedEval.final_decision.replace('_', ' ')}
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', marginTop: '0.1rem', fontWeight: 500 }}>
                      {selectedEval.final_decision === 'AUTO_EXECUTE' 
                        ? "Meets all confidence & policy thresholds. Safe for automated execution."
                        : "Requires manual operator override and policy verification."}
                    </p>
                  </div>
                </div>

                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--color-dark)',
                  background: selectedEval.status === 'EXECUTED' ? 'var(--color-green)' : '#ffffff',
                  border: '1px solid var(--border-color)',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '12px'
                }}>
                  {selectedEval.status.replace('_', ' ')}
                </span>
              </div>

              {/* 5-Dimensional Trust Grid */}
              <div className="responsive-grid two-cols-sm" style={{ gap: '1.2rem' }}>
                {/* Confidence & Risk */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {/* Confidence */}
                  <div className="glass-card" style={{ padding: '1.2rem', backgroundColor: '#ffffff' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '0.5rem' }}>1. DECISION CONFIDENCE</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-dark)' }}>{selectedEval.breakdown.confidence}%</span>
                      <span className="highlight-badge-green" style={{ fontSize: '0.7rem', padding: '0.1rem 0.35rem' }}>High Trust</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', lineHeight: 1.4, fontWeight: 500 }}>
                      Based on 91% historical validation success and high telemetry data completeness signals.
                    </p>
                  </div>

                  {/* Risk */}
                  <div className="glass-card" style={{ padding: '1.2rem', backgroundColor: '#ffffff' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '0.5rem' }}>2. OPERATIONAL RISK INDEX</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: selectedEval.breakdown.risk > 50 ? '#f43f5e' : '#10b981' }}>
                        {selectedEval.breakdown.risk}
                      </span>
                      <span className="highlight-badge-dark" style={{ 
                        fontSize: '0.7rem', 
                        padding: '0.1rem 0.35rem', 
                        backgroundColor: selectedEval.breakdown.risk > 50 ? '#f43f5e' : '#10b981'
                      }}>
                        {selectedEval.breakdown.risk > 50 ? 'High Risk' : 'Low Risk'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', lineHeight: 1.4, fontWeight: 500 }}>
                      {selectedEval.breakdown.risk > 50 
                        ? "Action carries severe potential downtime or performance degradation risk."
                        : "Minimal cluster performance impact or service downtime potential."}
                    </p>
                  </div>
                </div>

                {/* Policies & Rollback */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {/* Policies */}
                  <div className="glass-card" style={{ padding: '1.2rem', backgroundColor: '#ffffff' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '0.5rem' }}>3. GOVERNANCE COMPLIANCE</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <span style={{ 
                        fontSize: '1rem', 
                        fontWeight: 800, 
                        color: selectedEval.breakdown.policy === 'PASS' ? '#10b981' : (selectedEval.breakdown.policy === 'FAIL' ? '#f43f5e' : '#f59e0b') 
                      }}>
                        {selectedEval.breakdown.policy}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', lineHeight: 1.4, fontWeight: 500 }}>
                      {selectedEval.breakdown.policy === 'PASS' && "Complies with resource thresholds and automated scaling rules."}
                      {selectedEval.breakdown.policy === 'REQUIRES_APPROVAL' && "Requires approval: action matches restricted operations configuration."}
                      {selectedEval.breakdown.policy === 'FAIL' && "Fails compliance policy limits (e.g. maximum replicas boundary reached)."}
                    </p>
                  </div>

                  {/* Rollback */}
                  <div className="glass-card" style={{ padding: '1.2rem', backgroundColor: '#ffffff' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '0.5rem' }}>4. ROLLBACK FEASIBILITY</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: selectedEval.breakdown.rollback ? '#10b981' : '#f43f5e' }}>
                        {selectedEval.breakdown.rollback ? "FULLY REVERSIBLE" : "IRREVERSIBLE ACTION"}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', lineHeight: 1.4, fontWeight: 500 }}>
                      {selectedEval.breakdown.rollback 
                        ? "Action can be automated back to baseline in ~15 seconds using kubectl patch."
                        : "Process terminates immediately. Reversing requires pod restarts."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Digital Twin (Simulation outcomes) */}
              <div className="glass-card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '1rem' }}>5. DIGITAL TWIN: PROJECTION SIMULATION</h4>
                
                {selectedEval.breakdown.simulation?.pre_action && selectedEval.breakdown.simulation?.post_action && (
                  <div className="responsive-flex row-md" style={{ alignItems: 'center', justifyContent: 'space-around' }}>
                    {/* Pre-action (White card) */}
                    <div className="glass-card" style={{ padding: '1rem 1.5rem', textAlign: 'center', flex: 1, backgroundColor: '#ffffff' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', fontWeight: 700, marginBottom: '0.3rem' }}>PRE-ACTION STATE</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f43f5e' }}>
                        {Object.entries(selectedEval.breakdown.simulation.pre_action)[0]?.[1]}%
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--color-dark)', fontWeight: 600 }}>
                        {Object.entries(selectedEval.breakdown.simulation.pre_action)[0]?.[0].toUpperCase()} util
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 1.5rem' }}>
                      <ArrowRight size={24} color="var(--color-slate-300)" style={{ strokeWidth: 2.5 }} />
                    </div>

                    {/* Post-action (Lime-green card) */}
                    <div className="accent-card-green" style={{ padding: '1rem 1.5rem', textAlign: 'center', flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-dark)', fontWeight: 700, marginBottom: '0.3rem' }}>PROJECTED OUTCOME</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-dark)' }}>
                        {Object.entries(selectedEval.breakdown.simulation.post_action)[0]?.[1]}%
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--color-dark)', fontWeight: 600 }}>
                        {Object.entries(selectedEval.breakdown.simulation.post_action)[0]?.[0].toUpperCase()} util
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Console */}
              <div className="flex-wrap" style={{ gap: '1rem', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                {errorMsg && (
                  <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid #f43f5e', padding: '0.8rem 1.2rem', borderRadius: '12px', fontSize: '0.85rem', color: '#f43f5e', width: '100%', fontWeight: 600 }}>
                    {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid #10b981', padding: '0.8rem 1.2rem', borderRadius: '12px', fontSize: '0.85rem', color: '#10b981', width: '100%', fontWeight: 600 }}>
                    {successMsg}
                  </div>
                )}

                {!errorMsg && !successMsg && (
                  <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                    {selectedEval.status === 'PENDING_APPROVAL' ? (
                      <>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleManualAction(selectedEval.decision_id, 'APPROVE')}
                          className="btn-primary"
                          style={{
                            flex: 1,
                            padding: '0.9rem',
                            fontSize: '0.9rem',
                            gap: '0.4rem'
                          }}
                        >
                          <Play size={16} fill="#ffffff" stroke="#ffffff" />
                          {actionLoading ? "Processing..." : "Approve & Execute"}
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleManualAction(selectedEval.decision_id, 'REJECT')}
                          className="btn-secondary"
                          style={{
                            padding: '0.9rem 1.5rem',
                            color: '#f43f5e',
                            borderColor: '#f43f5e'
                          }}
                        >
                          Reject
                        </button>
                      </>
                    ) : selectedEval.status === 'APPROVED' || selectedEval.status === 'PENDING' ? (
                      <button
                        disabled={actionLoading}
                        onClick={() => handleManualAction(selectedEval.decision_id, 'RUN')}
                        className="btn-primary"
                        style={{
                          width: '100%',
                          padding: '0.9rem',
                          fontSize: '0.9rem',
                          gap: '0.4rem'
                        }}
                      >
                        <Play size={16} fill="#ffffff" stroke="#ffffff" />
                        {actionLoading ? "Initiating Workload Changes..." : "Manually Trigger Execution"}
                      </button>
                    ) : selectedEval.status === 'EXECUTED' || selectedEval.status === 'SUCCEEDED' ? (
                      <button
                        disabled={actionLoading}
                        onClick={() => handleRollback(selectedEval.decision_id)}
                        style={{
                          width: '100%',
                          backgroundColor: '#f59e0b',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '30px',
                          padding: '0.9rem',
                          fontSize: '0.9rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          boxShadow: '0 8px 20px rgba(245, 158, 11, 0.25)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <RefreshCw size={16} className={actionLoading ? "animate-spin" : ""} />
                        <span>{actionLoading ? "Restoring Previous Spec..." : "🔄 Trigger 1-Click Spec Rollback"}</span>
                      </button>
                    ) : selectedEval.status === 'FAILED' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%' }}>
                        <div style={{
                          width: '100%',
                          backgroundColor: 'rgba(244, 63, 94, 0.08)',
                          border: '1px solid #f43f5e',
                          borderRadius: '12px',
                          padding: '0.85rem 1.2rem',
                          fontSize: '0.85rem',
                          color: '#f43f5e',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem'
                        }}>
                          <AlertTriangle size={18} color="#f43f5e" />
                          <span>Previous Execution Attempt Failed. Click below to retry remediation.</span>
                        </div>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleManualAction(selectedEval.decision_id, 'RUN')}
                          className="btn-primary"
                          style={{
                            width: '100%',
                            padding: '0.9rem',
                            fontSize: '0.9rem',
                            gap: '0.4rem',
                            backgroundColor: '#f43f5e'
                          }}
                        >
                          <Play size={16} fill="#ffffff" stroke="#ffffff" />
                          {actionLoading ? "Retrying Execution..." : "🔄 Retry Remediation Execution"}
                        </button>
                      </div>
                    ) : selectedEval.status === 'REJECTED' ? (
                      <div style={{
                        width: '100%',
                        backgroundColor: 'rgba(244, 63, 94, 0.08)',
                        border: '1px solid #f43f5e',
                        borderRadius: '16px',
                        padding: '0.85rem 1.2rem',
                        fontSize: '0.85rem',
                        color: '#f43f5e',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem'
                      }}>
                        <AlertTriangle size={18} color="#f43f5e" />
                        <span>Action Rejected: Declined due to policy compliance checks or insufficient assurance score.</span>
                      </div>
                    ) : (
                      <div style={{
                        width: '100%',
                        backgroundColor: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid #f59e0b',
                        borderRadius: '16px',
                        padding: '0.85rem 1.2rem',
                        fontSize: '0.85rem',
                        color: '#d97706',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem'
                      }}>
                        <CheckCircle size={18} color="#f59e0b" />
                        <span>1-Click Rollback Executed: Workload deployment spec restored to previous baseline.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
