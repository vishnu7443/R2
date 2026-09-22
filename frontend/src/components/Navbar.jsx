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
    { name: 'Digital Twin', path: '/digital-twin' },
    { name: 'Simulator', path: '/simulator' },
    { name: 'Decision Center', path: '/decision' },
    { name: 'Policy Center', path: '/policies' },
    { name: 'Timeline', path: '/timeline' }
  ];

  const isLanding = currentPath === '/';

  return (
    <header className="navbar-header" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.2rem 2.5rem',
      backgroundColor: 'transparent',
      maxWidth: isLanding ? '100%' : '1440px',
      width: '100%',
      margin: '0 auto',
      height: '84px',
      borderBottom: isLanding ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'
    }}>
      {/* Brand Logo Pill */}
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1.2rem',
          borderRadius: '30px',
          border: isLanding ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(25, 26, 35, 0.08)',
          backgroundColor: isLanding ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
          color: isLanding ? '#ffffff' : 'var(--color-dark)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.01)',
          fontWeight: 800,
          fontSize: '1.15rem',
          letterSpacing: '0.5px'
        }}>
          <img 
            src="/Final_Logo-removebg-preview.png" 
            alt="Vector Logo" 
            style={{ 
              height: '38px', 
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
          gap: '0.4rem',
          padding: '0.3rem',
          backgroundColor: 'rgba(25, 26, 35, 0.03)',
          borderRadius: '30px',
          border: '1px solid rgba(25, 26, 35, 0.02)'
        }}>
          {links.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  padding: '0.5rem 1.2rem',
                  borderRadius: '30px',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#ffffff' : 'var(--color-slate-700)',
                  background: isActive ? 'var(--color-dark)' : 'transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      )}

      {/* Right Side Status Panel / Login CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
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
              fontSize: '0.8rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(25, 26, 35, 0.1)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
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
              gap: '0.5rem',
              background: getStatusBgColor(),
              border: `1px solid ${getStatusColor()}20`,
              padding: '0.5rem 1rem',
              borderRadius: '30px',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: getStatusColor()
              }} />
              <span className="navbar-status-text" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-dark)' }}>
                Cluster: {healthStatus} ({healthScore}%)
              </span>
            </div>

            {/* Alerts count badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1px solid rgba(25, 26, 35, 0.08)',
              backgroundColor: alertsCount > 0 ? 'var(--color-rose)' : '#ffffff',
              color: alertsCount > 0 ? '#ffffff' : 'var(--color-dark)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
            }} title={`${alertsCount} Active Alerts`}>
              <ShieldAlert size={16} />
            </div>

            {/* Profile/System settings placeholder */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1px solid rgba(25, 26, 35, 0.08)',
              backgroundColor: '#ffffff',
              color: 'var(--color-dark)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
            }}>
              <User size={16} />
            </div>

            {/* Quick Sign Out Action */}
            <button
              onClick={() => {
                localStorage.removeItem('clerkUser');
                localStorage.removeItem('dashboardMode');
                navigate('/login');
              }}
              title="Sign Out"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '30px',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                backgroundColor: '#ffffff',
                color: '#f43f5e',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fff1f2';
                e.currentTarget.style.borderColor = '#f43f5e';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.2)';
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
