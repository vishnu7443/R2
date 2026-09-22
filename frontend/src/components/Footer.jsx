import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      position: 'relative',
      width: '100%',
      padding: '4rem 2rem 2rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      {/* Floating White Footer Card */}
      <div style={{
        maxWidth: '1240px',
        width: '100%',
        backgroundColor: '#ffffff',
        color: '#191a23',
        borderRadius: '28px',
        padding: '3.5rem 4rem 2.5rem 4rem',
        boxShadow: '0 30px 70px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(25, 26, 35, 0.06)',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Main Top Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
          gap: '3.5rem',
          paddingBottom: '3rem',
          borderBottom: '1px solid var(--border-color)'
        }}>
          {/* Brand & Description Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800, fontSize: '1.2rem' }}>
              <img src="/Final_Logo-removebg-preview.png" alt="Vector Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
              <span>Vector</span>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-400)', lineHeight: 1.6, maxWidth: '340px', fontWeight: 500 }}>
              Vector empowers site reliability engineering and platform teams to transform raw telemetry into clear, automated AI-proposals — maintaining full human-in-the-loop assurance.
            </p>

            {/* Social Icons Row */}
            <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', marginTop: '0.5rem' }}>
              {/* X / Twitter */}
              <a href="https://x.com" target="_blank" rel="noreferrer" style={{ color: 'var(--color-dark)', opacity: 0.7, transition: 'all 0.2s', display: 'flex', alignItems: 'center' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ color: 'var(--color-dark)', opacity: 0.7, transition: 'all 0.2s', display: 'flex', alignItems: 'center' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>

              {/* LinkedIn */}
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ color: 'var(--color-dark)', opacity: 0.7, transition: 'all 0.2s', display: 'flex', alignItems: 'center' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>

              {/* GitHub */}
              <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: 'var(--color-dark)', opacity: 0.7, transition: 'all 0.2s', display: 'flex', alignItems: 'center' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 1: Product */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-dark)' }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.82rem', fontWeight: 500 }}>
              <Link to="/dashboard" style={{ color: 'var(--color-slate-400)', textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--color-dark)'} onMouseLeave={(e) => e.target.style.color = 'var(--color-slate-400)'}>Console Dashboard</Link>
              <Link to="/simulator" style={{ color: 'var(--color-slate-400)', textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--color-dark)'} onMouseLeave={(e) => e.target.style.color = 'var(--color-slate-400)'}>Metrics Simulator</Link>
              <Link to="/decision" style={{ color: 'var(--color-slate-400)', textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--color-dark)'} onMouseLeave={(e) => e.target.style.color = 'var(--color-slate-400)'}>Decision Center</Link>
              <Link to="/policies" style={{ color: 'var(--color-slate-400)', textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--color-dark)'} onMouseLeave={(e) => e.target.style.color = 'var(--color-slate-400)'}>Governance Policies</Link>
              <Link to="/timeline" style={{ color: 'var(--color-slate-400)', textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--color-dark)'} onMouseLeave={(e) => e.target.style.color = 'var(--color-slate-400)'}>Audit Timeline</Link>
            </div>
          </div>

          {/* Column 2: Resources */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-dark)' }}>Resources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-slate-400)' }}>
              <span style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'var(--color-dark)'} onMouseLeave={(e) => e.target.style.color = 'var(--color-slate-400)'}>Prometheus Adapter</span>
              <span style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'var(--color-dark)'} onMouseLeave={(e) => e.target.style.color = 'var(--color-slate-400)'}>Kubernetes Integration</span>
              <span style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'var(--color-dark)'} onMouseLeave={(e) => e.target.style.color = 'var(--color-slate-400)'}>Telemetry Collector</span>
              <span style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'var(--color-dark)'} onMouseLeave={(e) => e.target.style.color = 'var(--color-slate-400)'}>Documentation</span>
              <span style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'var(--color-dark)'} onMouseLeave={(e) => e.target.style.color = 'var(--color-slate-400)'}>System Changelog</span>
            </div>
          </div>

          {/* Column 3: Company */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-dark)' }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-slate-400)' }}>
              <span style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'var(--color-dark)'} onMouseLeave={(e) => e.target.style.color = 'var(--color-slate-400)'}>About Vector AI</span>
              <span style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'var(--color-dark)'} onMouseLeave={(e) => e.target.style.color = 'var(--color-slate-400)'}>SRE Careers</span>
              <span style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'var(--color-dark)'} onMouseLeave={(e) => e.target.style.color = 'var(--color-slate-400)'}>Contact Operator</span>
              <span style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'var(--color-dark)'} onMouseLeave={(e) => e.target.style.color = 'var(--color-slate-400)'}>System Partners</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '1.8rem',
          fontSize: '0.8rem',
          color: 'var(--color-slate-400)',
          fontWeight: 500
        }}>
          <span>© 2026 Vector. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Terms of Service</span>
            <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Cookies Settings</span>
          </div>
        </div>
      </div>

      {/* Giant Subtle Watermark Typography Floating Below/Behind Card */}
      <div style={{
        position: 'relative',
        marginTop: '-5rem',
        fontSize: '14rem',
        fontWeight: 900,
        letterSpacing: '-6px',
        color: '#ffffff',
        opacity: 0.12,
        userSelect: 'none',
        pointerEvents: 'none',
        textAlign: 'center',
        width: '100%',
        lineHeight: 1,
        zIndex: 1
      }}>
        Vector
      </div>
    </footer>
  );
}
