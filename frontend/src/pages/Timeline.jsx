import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  History, Clock, ChevronDown, ChevronUp, Terminal, Shield, Zap, 
  AlertTriangle, TrendingUp, Search, Copy, Check, Server, RefreshCw, 
  Activity, User, CheckCircle2, RotateCcw
} from 'lucide-react';

export default function Timeline() {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Filters & Search
  const [incidentFilter, setIncidentFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'RESOLVED'
  const [incidentSearch, setIncidentSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL'); // 'ALL' | 'PREDICTION' | 'ASSURANCE' | 'EXECUTION' | 'RECOVERY'
  const [groupTelemetry, setGroupTelemetry] = useState(true);

  const mode = localStorage.getItem('dashboardMode') || 'inventraerp';
  const selectedIncidentIdRef = useRef(selectedIncidentId);

  useEffect(() => {
    selectedIncidentIdRef.current = selectedIncidentId;
  }, [selectedIncidentId]);

  // Fetch incidents list on mount & polling
  const fetchIncidents = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/timeline?mode=${mode}`);
      if (res.ok) {
        const data = await res.json();
        setIncidents(data);
        if (!selectedIncidentIdRef.current && data.length > 0) {
          setSelectedIncidentId(data[0].timeline_id);
        }
      }
    } catch (err) {
      console.error("Error fetching incident timelines:", err);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 3000);
    return () => clearInterval(interval);
  }, [mode]);

  // Fetch audit trail events for selected incident
  useEffect(() => {
    if (!selectedIncidentId) return;

    let isFirstCall = true;
    const fetchEvents = async () => {
      if (isFirstCall) setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/timeline/${selectedIncidentId}`);
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (err) {
        console.error("Error fetching timeline events:", err);
      } finally {
        if (isFirstCall) {
          setLoading(false);
          isFirstCall = false;
        }
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 2500);
    return () => clearInterval(interval);
  }, [selectedIncidentId]);

  const toggleExpandEvent = (eventId) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered incidents list
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const matchesStatus = 
        incidentFilter === 'ALL' ||
        (incidentFilter === 'ACTIVE' && !inc.resolved) ||
        (incidentFilter === 'RESOLVED' && inc.resolved);

      const query = incidentSearch.toLowerCase().trim();
      const matchesSearch = 
        !query ||
        inc.incident_type?.toLowerCase().includes(query) ||
        inc.service_name?.toLowerCase().includes(query) ||
        inc.timeline_id?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [incidents, incidentFilter, incidentSearch]);

  const selectedIncident = incidents.find(i => i.timeline_id === selectedIncidentId) || incidents[0] || null;

  // Visual milestone life-cycle tracker
  const incidentStages = useMemo(() => {
    if (!events || events.length === 0) return [];
    const types = new Set(events.map(e => e.event_type));
    return [
      { key: 'DETECTION', label: '1. Detection', active: types.has('DETECTION') || types.has('PREDICTION'), completed: types.has('PREDICTION') || types.has('ASSURANCE') },
      { key: 'PREDICTION', label: '2. Forecasting', active: types.has('PREDICTION'), completed: types.has('ASSURANCE') || types.has('EXECUTION') },
      { key: 'ASSURANCE', label: '3. Decision Assurance', active: types.has('ASSURANCE') || types.has('CANDIDATE_PROPOSAL'), completed: types.has('EXECUTION') || types.has('APPROVAL') },
      { key: 'EXECUTION', label: '4. Remediation', active: types.has('EXECUTION') || types.has('APPROVAL'), completed: types.has('RECOVERY') || selectedIncident?.resolved },
      { key: 'RECOVERY', label: '5. Resolved', active: selectedIncident?.resolved || types.has('RECOVERY'), completed: selectedIncident?.resolved }
    ];
  }, [events, selectedIncident]);

  // Event badge styling helper
  const getEventMeta = (type) => {
    switch (type) {
      case 'DETECTION':
        return { color: '#e11d48', bg: '#ffe4e6', border: '#fecdd3', icon: AlertTriangle, label: 'Detection' };
      case 'PREDICTION':
        return { color: '#d97706', bg: '#fef3c7', border: '#fde68a', icon: TrendingUp, label: 'AI Forecast' };
      case 'CANDIDATE_PROPOSAL':
        return { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: Zap, label: 'Candidate Action' };
      case 'ASSURANCE':
        return { color: '#0284c7', bg: '#e0f2fe', border: '#bae6fd', icon: Shield, label: 'Assurance Validation' };
      case 'APPROVAL':
        return { color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', icon: User, label: 'Human Approval' };
      case 'EXECUTION':
        return { color: '#9333ea', bg: '#faf5ff', border: '#e9d5ff', icon: Server, label: 'Cluster Execution' };
      case 'RECOVERY':
        return { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: CheckCircle2, label: 'Nominal Recovery' };
      case 'ROLLBACK':
        return { color: '#b45309', bg: '#fffbeb', border: '#fde68a', icon: RotateCcw, label: 'Rollback Action' };
      default:
        return { color: '#475569', bg: '#f1f5f9', border: '#e2e8f0', icon: Activity, label: type ? type.replace('_', ' ') : 'Event' };
    }
  };

  // Group consecutive identical predictions if toggle is ON
  const processedEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    
    // First apply event category filter
    let filtered = events;
    if (eventTypeFilter !== 'ALL') {
      filtered = events.filter(e => {
        if (eventTypeFilter === 'PREDICTION') return e.event_type === 'PREDICTION' || e.event_type === 'DETECTION';
        if (eventTypeFilter === 'ASSURANCE') return e.event_type === 'ASSURANCE' || e.event_type === 'CANDIDATE_PROPOSAL';
        if (eventTypeFilter === 'EXECUTION') return e.event_type === 'EXECUTION' || e.event_type === 'APPROVAL';
        if (eventTypeFilter === 'RECOVERY') return e.event_type === 'RECOVERY';
        return e.event_type === eventTypeFilter;
      });
    }

    if (!groupTelemetry) return filtered.map(e => ({ isGroup: false, ...e }));

    // Group contiguous prediction events
    const grouped = [];
    let currentPredictionGroup = null;

    filtered.forEach((ev) => {
      if (ev.event_type === 'PREDICTION') {
        if (!currentPredictionGroup) {
          currentPredictionGroup = {
            isGroup: true,
            id: `group-${ev.id}`,
            event_type: 'PREDICTION',
            service_name: ev.service_name,
            firstTimestamp: ev.timestamp,
            lastTimestamp: ev.timestamp,
            events: [ev]
          };
        } else {
          currentPredictionGroup.events.push(ev);
          currentPredictionGroup.lastTimestamp = ev.timestamp;
        }
      } else {
        if (currentPredictionGroup) {
          grouped.push(currentPredictionGroup);
          currentPredictionGroup = null;
        }
        grouped.push({ isGroup: false, ...ev });
      }
    });

    if (currentPredictionGroup) {
      grouped.push(currentPredictionGroup);
    }

    return grouped;
  }, [events, eventTypeFilter, groupTelemetry]);

  // Compute time offsets from incident start
  const incidentStartTime = events.length > 0 ? new Date(events[0].timestamp).getTime() : 0;
  const formatOffset = (ts) => {
    if (!incidentStartTime || !ts) return '+00:00';
    const deltaMs = Math.max(0, new Date(ts).getTime() - incidentStartTime);
    const totalSec = Math.floor(deltaMs / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `+${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', paddingBottom: '3rem' }}>
      
      {/* Page Title & Breadcrumb Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-dark)', letterSpacing: '-0.5px', margin: 0 }}>
              Audit & Decision Timeline
            </h1>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '0.2rem 0.6rem',
              borderRadius: '20px',
              backgroundColor: 'rgba(25, 26, 35, 0.05)',
              color: 'var(--color-dark)',
              border: '1px solid var(--border-color)',
              textTransform: 'uppercase'
            }}>
              Chronological Forensics
            </span>
          </div>
          <p style={{ color: 'var(--color-slate-400)', fontSize: '0.88rem', marginTop: '0.3rem', fontWeight: 500 }}>
            Trace AI failure predictions, 5D assurance assessments, and autonomous execution records.
          </p>
        </div>

        {/* Live Refresh Trigger */}
        <button
          onClick={fetchIncidents}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.9rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            background: '#ffffff',
            color: 'var(--color-dark)',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
            transition: 'all 0.2s ease'
          }}
        >
          <RefreshCw size={13} />
          <span>Refresh Incidents</span>
        </button>
      </div>

      {/* Main Grid: Left Navigator & Right Timeline Spine */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1fr) minmax(0, 2.3fr)',
        gap: '1.5rem',
        alignItems: 'start'
      }}>

        {/* LEFT COLUMN: Incidents Directory Navigator */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 8px 30px rgba(25, 26, 35, 0.02)',
          padding: '1.4rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.1rem',
          maxHeight: 'calc(100vh - 130px)',
          position: 'sticky',
          top: '1.5rem'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={17} color="var(--color-dark)" />
              <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-dark)', margin: 0 }}>
                Incident Timelines ({incidents.length})
              </h2>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>
              {incidents.filter(i => !i.resolved).length} Active
            </span>
          </div>

          {/* Search Box */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '0.8rem', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search by target or fault..."
              value={incidentSearch}
              onChange={(e) => setIncidentSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.8rem 0.55rem 2.2rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                fontSize: '0.8rem',
                outline: 'none',
                fontWeight: 600,
                color: 'var(--color-dark)',
                backgroundColor: '#fafaf9'
              }}
            />
          </div>

          {/* Status Filter Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.35rem',
            padding: '0.2rem',
            backgroundColor: '#f1f5f9',
            borderRadius: '10px'
          }}>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'ACTIVE', label: 'Active' },
              { id: 'RESOLVED', label: 'Resolved' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setIncidentFilter(tab.id)}
                style={{
                  padding: '0.35rem',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: incidentFilter === tab.id ? '#ffffff' : 'transparent',
                  color: incidentFilter === tab.id ? 'var(--color-dark)' : '#64748b',
                  boxShadow: incidentFilter === tab.id ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Scrollable Incident Cards List */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.7rem',
            overflowY: 'auto',
            paddingRight: '0.2rem',
            flexGrow: 1
          }}>
            {filteredIncidents.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2.5rem 1rem',
                color: '#94a3b8',
                fontSize: '0.82rem',
                fontWeight: 600
              }}>
                No matching incident timelines found.
              </div>
            ) : (
              filteredIncidents.map((inc) => {
                const isSelected = selectedIncidentId === inc.timeline_id;
                const isResolved = inc.resolved;

                return (
                  <div
                    key={inc.timeline_id}
                    onClick={() => setSelectedIncidentId(inc.timeline_id)}
                    style={{
                      padding: '0.9rem 1rem',
                      borderRadius: '14px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--color-dark)' : 'var(--border-color)',
                      borderLeft: isSelected 
                        ? `5px solid ${isResolved ? '#10b981' : '#f43f5e'}` 
                        : '1px solid var(--border-color)',
                      boxShadow: isSelected ? '0 4px 14px rgba(25, 26, 35, 0.05)' : '0 2px 6px rgba(0,0,0,0.01)',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.45rem'
                    }}
                  >
                    {/* Top Row: Status Tag & Time */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '6px',
                        backgroundColor: isResolved ? '#ecfdf5' : '#fee2e2',
                        color: isResolved ? '#065f46' : '#b91c1c',
                        border: isResolved ? '1px solid #a7f3d0' : '1px solid #fecaca',
                        letterSpacing: '0.5px'
                      }}>
                        {isResolved ? 'RESOLVED' : 'ACTIVE'}
                      </span>

                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>
                        {inc.start_time ? inc.start_time.slice(11, 19) : ''} UTC
                      </span>
                    </div>

                    {/* Incident Title */}
                    <h3 style={{
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      color: 'var(--color-dark)',
                      margin: 0,
                      lineHeight: 1.3
                    }}>
                      {inc.incident_type ? inc.incident_type.replace('_', ' ') : 'System Incident'}
                    </h3>

                    {/* Bottom Metadata Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.15rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '6px'
                        }}>
                          {inc.service_name}
                        </span>
                      </div>

                      <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>
                        {inc.event_count || 1} events
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Professional Chronological Timeline Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

          {/* Hero Banner for Selected Incident */}
          {selectedIncident && (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 8px 30px rgba(25, 26, 35, 0.02)',
              padding: '1.4rem 1.6rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.2rem'
            }}>
              {/* Header Title & Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      backgroundColor: selectedIncident.resolved ? '#10b981' : '#f43f5e',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      letterSpacing: '0.5px'
                    }}>
                      {selectedIncident.resolved ? 'RESOLVED AUDIT LOG' : 'CRITICAL INCIDENT IN PROGRESS'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'JetBrains Mono' }}>
                      ID: {selectedIncident.timeline_id}
                    </span>
                  </div>

                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-dark)', margin: '0.4rem 0 0.2rem 0' }}>
                    {selectedIncident.incident_type ? selectedIncident.incident_type.replace('_', ' ') : 'Infrastructure Anomaly'}
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, fontWeight: 500 }}>
                    Target Workload: <b style={{ color: 'var(--color-dark)' }}>{selectedIncident.service_name}</b> • Logged {selectedIncident.start_time ? selectedIncident.start_time.slice(11, 19) : ''} UTC
                  </p>
                </div>

                {/* Quick Event Summary Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--color-dark)'
                }}>
                  <Clock size={14} color="#64748b" />
                  <span>{events.length} Timeline Audit Records</span>
                </div>
              </div>

              {/* Visual 5-Stage Life-Cycle Stepper */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '0.5rem',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '1rem'
              }}>
                {incidentStages.map((stg) => (
                  <div
                    key={stg.key}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      opacity: stg.active ? 1 : 0.45
                    }}
                  >
                    <div style={{
                      height: '4px',
                      borderRadius: '4px',
                      backgroundColor: stg.completed ? '#10b981' : stg.active ? '#f59e0b' : '#e2e8f0',
                      transition: 'all 0.3s ease'
                    }} />
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: stg.completed ? '#059669' : stg.active ? '#b45309' : '#64748b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {stg.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline Stream Card & Controls */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 8px 30px rgba(25, 26, 35, 0.02)',
            padding: '1.4rem 1.6rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
            minHeight: '480px'
          }}>

            {/* Timeline Filter Controls Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.8rem',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '1rem'
            }}>
              {/* Event Type Filter Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', marginRight: '0.2rem', textTransform: 'uppercase' }}>
                  Filter:
                </span>
                {[
                  { id: 'ALL', label: 'All Events' },
                  { id: 'PREDICTION', label: 'Forecasts' },
                  { id: 'ASSURANCE', label: 'Assurance' },
                  { id: 'EXECUTION', label: 'Actions' },
                  { id: 'RECOVERY', label: 'Recovery' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setEventTypeFilter(f.id)}
                    style={{
                      padding: '0.3rem 0.65rem',
                      borderRadius: '8px',
                      border: eventTypeFilter === f.id ? '1px solid var(--color-dark)' : '1px solid var(--border-color)',
                      backgroundColor: eventTypeFilter === f.id ? 'var(--color-dark)' : '#ffffff',
                      color: eventTypeFilter === f.id ? '#ffffff' : '#64748b',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Grouping Toggle (Eliminates repeated noisy telemetry rows!) */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
                userSelect: 'none'
              }}>
                <input
                  type="checkbox"
                  checked={groupTelemetry}
                  onChange={(e) => setGroupTelemetry(e.target.checked)}
                  style={{ accentColor: '#191a23', cursor: 'pointer' }}
                />
                <span>Group repetitive telemetry forecasts</span>
              </label>
            </div>

            {/* True Vertical Timeline Rendering */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b', fontWeight: 700 }}>
                Loading incident forensics...
              </div>
            ) : processedEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8', fontWeight: 600 }}>
                No events recorded matching this filter.
              </div>
            ) : (
              <div style={{
                position: 'relative',
                paddingLeft: '3rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.4rem'
              }}>
                {/* Continuous Vertical Timeline Spine */}
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  top: '12px',
                  bottom: '12px',
                  width: '2px',
                  backgroundColor: '#e2e8f0'
                }} />

                {processedEvents.map((item, idx) => {
                  // Case A: Grouped repetitive telemetry forecasts
                  if (item.isGroup) {
                    const groupCount = item.events.length;
                    const firstEv = item.events[0];
                    const lastEv = item.events[item.events.length - 1];
                    const isExpanded = expandedEventId === item.id;
                    const meta = getEventMeta('PREDICTION');

                    return (
                      <div key={item.id} style={{ position: 'relative' }}>
                        {/* Timeline Node Icon Pin */}
                        <div style={{
                          position: 'absolute',
                          left: '-44px',
                          top: '10px',
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          backgroundColor: meta.bg,
                          border: `2px solid ${meta.color}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                        }}>
                          <TrendingUp size={13} color={meta.color} />
                        </div>

                        {/* Grouped Telemetry Card */}
                        <div style={{
                          backgroundColor: '#fefce8',
                          border: '1px solid #fef08a',
                          borderRadius: '16px',
                          padding: '1rem 1.2rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.6rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <span style={{
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                color: '#854d0e',
                                backgroundColor: '#fef08a',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '6px',
                                textTransform: 'uppercase'
                              }}>
                                Telemetry Forecast Stream ({groupCount} Readings)
                              </span>
                              <span style={{ fontSize: '0.72rem', color: '#a16207', fontWeight: 700 }}>
                                Active Exhaustion Trend Monitored
                              </span>
                            </div>

                            <span style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono', fontWeight: 600, color: '#713f12' }}>
                              {firstEv.timestamp?.slice(11, 19)} – {lastEv.timestamp?.slice(11, 19)} UTC
                            </span>
                          </div>

                          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#713f12', margin: 0 }}>
                            {lastEv.payload?.message || `AI Engine continuous telemetry forecast for ${item.service_name}`}
                          </p>

                          {/* Accordion toggle to inspect individual telemetry spikes */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                            <button
                              onClick={() => toggleExpandEvent(item.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#854d0e',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: 0
                              }}
                            >
                              <span>{isExpanded ? 'Collapse Telemetry Stream' : `Inspect all ${groupCount} Telemetry Forecasts`}</span>
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>

                            <span style={{ fontSize: '0.7rem', color: '#a16207', fontWeight: 600 }}>
                              Sampled every 3.0s (Autonomously Grouped)
                            </span>
                          </div>

                          {/* Expanded list of readings */}
                          {isExpanded && (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.4rem',
                              marginTop: '0.6rem',
                              paddingTop: '0.6rem',
                              borderTop: '1px solid #fef08a'
                            }}>
                              {item.events.map((subEv, subI) => (
                                <div
                                  key={subEv.id || subI}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.35rem 0.6rem',
                                    backgroundColor: '#ffffff',
                                    borderRadius: '8px',
                                    fontSize: '0.74rem',
                                    border: '1px solid rgba(0,0,0,0.04)'
                                  }}
                                >
                                  <span style={{ color: '#451a03', fontWeight: 600 }}>
                                    #{subI + 1}: {subEv.payload?.message || 'Predicted resource exhaustion'}
                                  </span>
                                  <span style={{ fontFamily: 'JetBrains Mono', color: '#78350f', fontWeight: 700 }}>
                                    {subEv.timestamp?.slice(11, 19)} UTC
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Case B: Individual Key Milestone Event
                  const ev = item;
                  const meta = getEventMeta(ev.event_type);
                  const Icon = meta.icon;
                  const isExpanded = expandedEventId === ev.id;
                  const offset = formatOffset(ev.timestamp);

                  return (
                    <div key={ev.id || idx} style={{ position: 'relative' }}>
                      {/* Timeline Node Icon Pin */}
                      <div style={{
                        position: 'absolute',
                        left: '-44px',
                        top: '10px',
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: meta.bg,
                        border: `2px solid ${meta.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                      }}>
                        <Icon size={13} color={meta.color} />
                      </div>

                      {/* Event Detail Card */}
                      <div style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '1.1rem 1.3rem',
                        boxShadow: '0 3px 12px rgba(25, 26, 35, 0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.65rem'
                      }}>
                        {/* Event Header: Type Badge, Offset, Timestamp */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span style={{
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              color: meta.color,
                              backgroundColor: meta.bg,
                              border: `1px solid ${meta.border}`,
                              padding: '0.15rem 0.55rem',
                              borderRadius: '6px',
                              letterSpacing: '0.5px',
                              textTransform: 'uppercase'
                            }}>
                              {meta.label}
                            </span>

                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              color: '#64748b',
                              fontFamily: 'JetBrains Mono',
                              backgroundColor: '#f1f5f9',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '6px'
                            }}>
                              {offset}
                            </span>
                          </div>

                          <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>
                            {ev.timestamp ? ev.timestamp.slice(11, 19) : ''} UTC
                          </span>
                        </div>

                        {/* Event Narrative Message */}
                        <p style={{
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          color: 'var(--color-dark)',
                          margin: 0,
                          lineHeight: 1.4
                        }}>
                          {ev.payload?.message || ev.payload?.explanation || `System action recorded on workload ${ev.service_name}.`}
                        </p>

                        {/* Structured Quick Stats Pills */}
                        {ev.payload && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.1rem' }}>
                            {ev.payload.incident_type && (
                              <span style={{ fontSize: '0.72rem', backgroundColor: '#fafaf9', border: '1px solid var(--border-color)', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: 700 }}>
                                Vector: <b>{ev.payload.incident_type}</b>
                              </span>
                            )}
                            {ev.payload.severity && (
                              <span style={{ fontSize: '0.72rem', backgroundColor: '#fafaf9', border: '1px solid var(--border-color)', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: 700, color: ev.payload.severity === 'HIGH' ? '#e11d48' : '#059669' }}>
                                Severity: <b>{ev.payload.severity}</b>
                              </span>
                            )}
                            {ev.payload.metric && (
                              <span style={{ fontSize: '0.72rem', backgroundColor: '#fafaf9', border: '1px solid var(--border-color)', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: 700 }}>
                                Metric: <b>{ev.payload.metric.toUpperCase()}</b>
                              </span>
                            )}
                            {ev.payload.action && (
                              <span style={{ fontSize: '0.72rem', backgroundColor: '#fafaf9', border: '1px solid var(--border-color)', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: 700, color: '#4f46e5' }}>
                                Action: <b>{ev.payload.action}</b>
                              </span>
                            )}
                          </div>
                        )}

                        {/* Expandable Forensic Payload Accordion */}
                        <div style={{ marginTop: '0.3rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem' }}>
                          <button
                            onClick={() => toggleExpandEvent(ev.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#64748b',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: 0
                            }}
                          >
                            <Terminal size={13} />
                            <span>{isExpanded ? 'Hide Forensic Payload' : 'Inspect Forensic Payload'}</span>
                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>

                          {isExpanded && (
                            <div style={{ marginTop: '0.6rem', position: 'relative' }}>
                              <button
                                onClick={() => copyToClipboard(JSON.stringify(ev.payload, null, 2), ev.id)}
                                style={{
                                  position: 'absolute',
                                  top: '0.6rem',
                                  right: '0.6rem',
                                  backgroundColor: '#ffffff',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: '6px',
                                  padding: '0.2rem 0.5rem',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  color: '#334155'
                                }}
                              >
                                {copiedId === ev.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                                <span>{copiedId === ev.id ? 'Copied' : 'Copy JSON'}</span>
                              </button>

                              <pre style={{
                                backgroundColor: '#0f172a',
                                color: '#e2e8f0',
                                padding: '1rem',
                                borderRadius: '12px',
                                fontSize: '0.74rem',
                                fontFamily: 'JetBrains Mono',
                                overflowX: 'auto',
                                lineHeight: 1.5,
                                margin: 0
                              }}>
                                {JSON.stringify(ev.payload, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
