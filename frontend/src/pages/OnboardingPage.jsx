import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, GitBranch, Database, Play, CheckCircle, AlertTriangle, ArrowRight, Loader2, Link2, Server
} from 'lucide-react';
import gsap from 'gsap';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Connect accounts, 2: Run verification, 3: Success
  const [projectName, setProjectName] = useState('Inventra ERP');
  const [githubRepo, setGithubRepo] = useState('github.com/sriram-s/Inventra-ERP');
  const [vercelUrl, setVercelUrl] = useState('https://inventra-erp.vercel.app');
  const [clerkUser, setClerkUser] = useState(null);
  
  // Animation refs
  const beamGithubRef = useRef(null);
  const beamVercelRef = useRef(null);
  const progressTextRef = useRef(null);
  const [progressLogs, setProgressLogs] = useState([]);

  useEffect(() => {
    // Load clerk user from localStorage
    const savedUser = localStorage.getItem('clerkUser');
    if (savedUser) {
      setClerkUser(JSON.parse(savedUser));
    } else {
      // Fallback fallback guest
      const guest = { id: 'usr_guest123', username: 'guest_operator', email: 'guest@inventra.com' };
      localStorage.setItem('clerkUser', JSON.stringify(guest));
      setClerkUser(guest);
    }
  }, []);

  const handleLinkIntegration = async (e) => {
    e.preventDefault();
    if (!clerkUser) return;
    setLoading(true);
    setStep(2);
    
    // Animate connection line beams
    if (beamGithubRef.current && beamVercelRef.current) {
      gsap.fromTo([beamGithubRef.current, beamVercelRef.current], 
        { strokeDasharray: 100, strokeDashoffset: 100, opacity: 0 },
        { strokeDashoffset: 0, opacity: 1, duration: 1.5, repeat: -1, ease: 'sine.inOut' }
      );
    }

    // Step-by-step connection console simulation
    const logs = [
      "Establishing Clerk auth session handshake...",
      "Querying GitHub API for repository access metadata...",
      "Initializing webhook listener target at github.com/sriram-s/Inventra-ERP...",
      "Registering Vector SRE middleware payload on Vercel deployment...",
      "Verifying Client telemetry agents: erp-frontend, erp-core, erp-inventory...",
      "Connecting Postgres DB nodes (erp-db) with Prisma schema adapter...",
      "Validating automated scaling assurance policies (CPU limit: 80%)...",
      "Connection handshakes established. Provisioning dashboard workspace..."
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setProgressLogs(prev => [...prev, logs[i]]);
    }

    try {
      // Call backend to connect project
      const response = await fetch('http://localhost:8000/api/projects/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: clerkUser.id,
          project_slug: 'inventraerp',
          project_name: projectName,
          github_repo: githubRepo,
          vercel_url: vercelUrl
        })
      });

      if (response.ok) {
        localStorage.setItem('dashboardMode', 'inventraerp');
        setStep(3);
        // Give user 6s to read the API key panel before redirecting
        setTimeout(() => {
          navigate('/dashboard');
        }, 6000);
      } else {
        alert("Failed to connect workspace to Vector API.");
        setStep(1);
        setLoading(false);
        setProgressLogs([]);
      }
    } catch (err) {
      console.error(err);
      alert("Vector API server offline.");
      setStep(1);
      setLoading(false);
      setProgressLogs([]);
    }
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#0a0b0d',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '720px',
        width: '100%',
        backgroundColor: '#111318',
        borderRadius: '32px',
        padding: '3rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background Vector Matrix Gradients */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          left: '-15%',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(185, 255, 102, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-15%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {step === 1 && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b9ff66', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '1rem' }}>
              <Link2 size={14} /> Link Workspace Repository
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', letterSpacing: '-0.75px', margin: 0 }}>
              Connect with Vector
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', textAlign: 'center', marginTop: '0.5rem', maxWidth: '480px', lineHeight: 1.5 }}>
              Link your Vercel deployment and GitHub repository to distribute Vector's SRE assurance engines to your client.
            </p>

            {/* Connection Visual diagram */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2.5rem',
              margin: '2.5rem 0',
              position: 'relative',
              width: '100%',
              maxWidth: '440px'
            }}>
              {/* GitHub Logo Node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 5 }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#18181b', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justify_content: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                  <GitBranch size={30} color="#ffffff" />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>GitHub</span>
              </div>

              {/* Connecting Connector Beam */}
              <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.03)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="100%" height="8" style={{ position: 'absolute', top: -2 }}>
                  <line x1="0" y1="4" x2="100%" y2="4" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeDasharray="4,4" />
                </svg>
              </div>

              {/* Vector Logo Node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 5 }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#0a0b0d', border: '2px solid #b9ff66', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(185, 255, 102, 0.15)' }}>
                  <img src="/Final_Logo-removebg-preview.png" alt="Vector Logo" style={{ height: '48px', width: 'auto' }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#b9ff66', fontWeight: 800 }}>Vector Engine</span>
              </div>

              {/* Connecting Connector Beam */}
              <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.03)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="100%" height="8" style={{ position: 'absolute', top: -2 }}>
                  <line x1="0" y1="4" x2="100%" y2="4" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeDasharray="4,4" />
                </svg>
              </div>

              {/* Vercel Node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 5 }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#ffffff', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                  <svg width="28" height="28" viewBox="0 0 76 65" fill="#000000">
                    <path d="M37.5 0L75 65H0L37.5 0Z" />
                  </svg>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Vercel</span>
              </div>
            </div>

            {/* Config inputs */}
            <form onSubmit={handleLinkIntegration} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.5px' }}>CLIENT / PROJECT NAME</label>
                <input 
                  type="text" 
                  value={projectName} 
                  onChange={(e) => setProjectName(e.target.value)} 
                  required
                  style={{ width: '100%', background: '#161920', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.85rem 1.1rem', fontSize: '0.88rem', color: '#ffffff', outline: 'none', fontWeight: 600 }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.5px' }}>GITHUB REPOSITORY SOURCE</label>
                <input 
                  type="text" 
                  value={githubRepo} 
                  onChange={(e) => setGithubRepo(e.target.value)} 
                  placeholder="github.com/org/repo"
                  required
                  style={{ width: '100%', background: '#161920', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.85rem 1.1rem', fontSize: '0.88rem', color: '#ffffff', outline: 'none', fontWeight: 600 }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.5px' }}>VERCEL DEPLOYMENT DOMAIN URL</label>
                <input 
                  type="text" 
                  value={vercelUrl} 
                  onChange={(e) => setVercelUrl(e.target.value)} 
                  placeholder="https://project.vercel.app"
                  required
                  style={{ width: '100%', background: '#161920', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.85rem 1.1rem', fontSize: '0.88rem', color: '#ffffff', outline: 'none', fontWeight: 600 }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  backgroundColor: '#b9ff66',
                  color: '#0d0e12',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '1.1rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '1.2rem',
                  boxShadow: '0 10px 25px rgba(185, 255, 102, 0.15)',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>Authorize & Connect with Vector</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('clerkUser');
                  localStorage.removeItem('dashboardMode');
                  navigate('/login');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = '#94a3b8'}
                onMouseLeave={(e) => e.target.style.color = '#64748b'}
              >
                ← Back to Login / Switch Account
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Loader2 className="animate-spin" size={48} color="#b9ff66" style={{ marginBottom: '1.5rem', animation: 'spin 2s linear infinite' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Deploying SRE Agents</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.4rem 0 2rem 0' }}>Provisioning isolated control deck for {projectName}...</p>
            
            {/* Simulation console output logs */}
            <div style={{
              width: '100%',
              backgroundColor: '#0a0b0d',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              padding: '1.5rem',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.78rem',
              color: '#34d399',
              minHeight: '220px',
              maxHeight: '260px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              textAlign: 'left'
            }}>
              {progressLogs.map((log, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: '#64748b' }}>[~]</span>
                  <span>{log}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.5rem', color: '#60a5fa' }}>
                <span style={{ color: '#64748b' }}>[*]</span>
                <span className="animate-pulse">Loading daemon loops...</span>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            {/* Success icon */}
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(52,211,153,0.1)', border: '2px solid #34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(52,211,153,0.2)' }}>
              <CheckCircle size={32} color="#34d399" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Integration Active!</h3>
              <p style={{ fontSize: '0.83rem', color: '#94a3b8', marginTop: '0.35rem' }}>Your Vector SRE workspace is provisioned. Use the key below to start pushing real metrics.</p>
            </div>

            {/* API Key block */}
            <div style={{ width: '100%', background: '#0a0b0d', border: '1px solid rgba(185,255,102,0.2)', borderRadius: '14px', padding: '1.1rem 1.3rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#b9ff66', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>🔑 Your Vector API Key</div>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.78rem', color: '#e2e8f0', letterSpacing: '0.5px', wordBreak: 'break-all' }}>
                vect_inventraerp_sk_live_abc123xyz
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: '#64748b' }}>Keep this secret. Pass it as the <code style={{ color: '#94a3b8' }}>X-Vector-Key</code> header.</div>
            </div>

            {/* Setup steps */}
            <div style={{ width: '100%', background: '#0f1014', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1.1rem 1.3rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.75rem' }}>⚡ Start the Vector Agent in your project</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem' }}>
                <div style={{ color: '#64748b' }}># 1. Install dependencies</div>
                <div style={{ background: '#1a1d24', borderRadius: '8px', padding: '0.5rem 0.8rem', color: '#b9ff66' }}>pip install psutil requests</div>
                <div style={{ color: '#64748b', marginTop: '0.25rem' }}># 2. Run the agent (already placed at your project root)</div>
                <div style={{ background: '#1a1d24', borderRadius: '8px', padding: '0.5rem 0.8rem', color: '#b9ff66' }}>python vector_agent.py</div>
                <div style={{ color: '#64748b', marginTop: '0.25rem' }}># 3. Real metrics now flow into Vector — check Dashboard</div>
              </div>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#475569', margin: 0 }}>Redirecting to dashboard in 6 seconds…</p>
          </div>
        )}
      </div>
    </div>
  );
}
