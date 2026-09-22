import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Zap, CheckSquare, ShieldCheck, History } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const links = [
    { name: 'Mission Control', path: '/', icon: LayoutDashboard },
    { name: 'Incident Simulator', path: '/simulator', icon: Zap },
    { name: 'Decision Center', path: '/decision', icon: CheckSquare },
    { name: 'Policy Center', path: '/policies', icon: ShieldCheck },
    { name: 'Audit Timeline', path: '/timeline', icon: History }
  ];

  return (
    <aside className="glass-panel" style={{
      width: '260px',
      minHeight: 'calc(100vh - 110px)',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.8rem',
      height: 'fit-content'
    }}>
      <div style={{
        fontSize: '0.8rem',
        fontWeight: 900,
        color: 'var(--color-dark)',
        padding: '0 0.5rem 0.5rem 0.5rem',
        letterSpacing: '1.5px',
        borderBottom: '2px solid var(--border-color)',
        marginBottom: '0.8rem'
      }}>
        OPERATIONS HUB
      </div>

      {links.map((link) => {
        const Icon = link.icon;
        const isActive = currentPath === link.path;
        return (
          <Link
            key={link.path}
            to={link.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              padding: '0.8rem 1rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: isActive ? 800 : 600,
              color: 'var(--color-dark)',
              background: isActive ? 'var(--color-green)' : 'transparent',
              border: '2px solid',
              borderColor: isActive ? 'var(--border-color)' : 'transparent',
              boxShadow: isActive ? '2px 2px 0px var(--border-color)' : 'none',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.boxShadow = '2px 2px 0px var(--border-color)';
                e.currentTarget.style.transform = 'translate(-1px, -1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'none';
              }
            }}
          >
            <Icon size={18} color="var(--color-dark)" />
            <span>{link.name}</span>
          </Link>
        );
      })}
    </aside>
  );
}
