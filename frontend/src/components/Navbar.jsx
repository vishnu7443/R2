import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, Cpu, Activity, Settings, Bell, User, Lock, LogOut } from 'lucide-react';

export default function Navbar({ healthScore, healthStatus, alertsCount }) {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusColor = () => {
    if (healthStatus === "Healthy") return "#10b981"; // emerald
    if (healthStatus === "Warning") return "#f59e0b"; // amber
    return "#f43f5e"; // rose
  };

  const getStatusBgColor = () => {
    if (healthStatus === "Healthy") return "rgba(16, 185, 129, 0.08)";
    if (healthStatus === "Warning") return "rgba(245, 158, 11, 0.08)";
    return "rgba(244, 63, 94, 0.08)";
  };

  const links = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Root Cause (RCA)', path: '/rca' },
    { name: 'Decision Center', path: '/decision' },
    { name: 'Digital Twin', path: '/digital-twin' },
    { name: 'Simulator', path: '/simulator' },
    { name: 'Policy Center', path: '/policies' },
    { name: 'Timeline', path: '/timeline' }
  ];

  const isLanding = currentPath === '/';

  return (
    <header className="navbar-header" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isLanding ? '1.2rem 2.5rem' : '0.8rem 1.5rem',
      backgroundColor: 'transparent',
      maxWidth: isLanding ? '100%' : '1440px',
      width: '100%',
      margin: '0 auto',
      height: '76px',
      borderBottom: isLanding ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
      gap: '0.75rem',
      boxSizing: 'border-box'
    }}>
      {/* Brand Logo Pill */}
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit', flexShrink: 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.45rem 1.1rem',
          borderRadius: '30px',
          border: isLanding ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(25, 26, 35, 0.08)',
          backgroundColor: isLanding ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
          color: isLanding ? '#ffffff' : 'var(--color-dark)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          fontWeight: 800,
          fontSize: '1.12rem',
          letterSpacing: '-0.2px',
          transition: 'transform 0.2s ease',
          whiteSpace: 'nowrap'
        }}>
          <img 
            src="/Final_Logo-removebg-preview.png" 
            alt="Vector Logo" 
            style={{ 
              height: '34px', 
              width: 'auto', 
              objectFit: 'contain',
              display: 'block'
            }} 
          />
          <span>Vector</span>
        </div>
      </Link>

      {/* Horizontal Nav Links */}
      {!isLanding && (
        <nav className="navbar-links" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.2rem',
          padding: '0.25rem 0.35rem',
          backgroundColor: 'rgba(25, 26, 35, 0.04)',
          borderRadius: '30px',
          border: '1px solid rgba(25, 26, 35, 0.04)',
          whiteSpace: 'nowrap',
          flexShrink: 0
        }}>
          {links.map((link) => {
            const isActive = currentPath === link.path || 
              (link.path === '/decision' && currentPath === '/decision-center') || 
              (link.path === '/policies' && currentPath === '/policy-center') || 
              (link.path === '/rca' && currentPath === '/root-cause');
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.42rem 0.85rem',
                  borderRadius: '24px',
                  textDecoration: 'none',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? '#ffffff' : 'var(--color-slate-700)',
                  background: isActive ? 'var(--color-dark)' : 'transparent',
                  boxShadow: isActive ? '0 2px 8px rgba(25, 26, 35, 0.12)' : 'none',
                  transition: 'all 0.18s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  lineHeight: '1.2'
                }}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      )}

      {/* Right Side Status Panel / Login CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0, whiteSpace: 'nowrap' }}>
        {currentPath === '/' ? (
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '0.5rem 1.4rem',
              borderRadius: '30px',
              border: 'none',
              backgroundColor: 'var(--color-dark)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(25, 26, 35, 0.1)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <span>Operator Login</span>
            <Lock size={12} color="#b9ff66" />
          </button>
        ) : (
          <>
            {/* Status Indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: getStatusBgColor(),
              border: `1px solid ${getStatusColor()}25`,
              padding: '0.42rem 0.85rem',
              borderRadius: '30px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: getStatusColor(),
                boxShadow: `0 0 6px ${getStatusColor()}`,
                flexShrink: 0
              }} />
              <span className="navbar-status-text" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-dark)', whiteSpace: 'nowrap' }}>
                Cluster: {healthStatus} ({healthScore}%)
              </span>
            </div>

            {/* Alerts count badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid rgba(25, 26, 35, 0.08)',
              backgroundColor: alertsCount > 0 ? 'var(--color-rose)' : '#ffffff',
              color: alertsCount > 0 ? '#ffffff' : 'var(--color-dark)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              flexShrink: 0
            }} title={`${alertsCount} Active Alerts`}>
              <ShieldAlert size={16} />
            </div>

            {/* Profile/System settings placeholder */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid rgba(25, 26, 35, 0.08)',
              backgroundColor: '#ffffff',
              color: 'var(--color-dark)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              flexShrink: 0
            }}>
              <User size={16} />
            </div>

            {/* Global Sign Out Action */}
            <button
              onClick={() => {
                localStorage.removeItem('clerkUser');
                localStorage.removeItem('dashboardMode');
                navigate('/login');
              }}
              title="Sign Out of Vector"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.42rem 0.85rem',
                borderRadius: '30px',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                backgroundColor: '#ffffff',
                color: '#f43f5e',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(244, 63, 94, 0.06)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fff1f2';
                e.currentTarget.style.borderColor = '#f43f5e';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.25)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
