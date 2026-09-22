import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, ArrowRight, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('sriram@inventra.com');
  const [password, setPassword] = useState('inventra123');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      // Inventra ERP client login → onboarding flow
      if ((email === 'sriram@inventra.com' || email.endsWith('@inventra.com')) && password === 'inventra123') {
        localStorage.setItem('dashboardMode', 'inventraerp');
        localStorage.setItem('clerkUser', JSON.stringify({ id: 'usr_8c8a5ba8065b', username: 'sriram', email }));
        navigate('/onboarding');
      } else if (email === 'ecommerce' && password === 'admin') {
        localStorage.setItem('dashboardMode', 'ecommerce');
        navigate('/dashboard');
      } else if (email === 'operator@vector.ai' && password === 'vector123') {
        localStorage.setItem('dashboardMode', 'standard');
        navigate('/dashboard');
      } else {
        setLoading(false);
        alert('Invalid credentials. Use:\n• sriram@inventra.com / inventra123 (Inventra ERP)\n• operator@vector.ai / vector123 (Standard)');
      }
    }, 1000);
  };

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      backgroundColor: '#fbfbf8',
      color: 'var(--color-dark)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Centered Minimalist Login Card */}
      <div style={{
        maxWidth: '440px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        padding: '3rem 2.5rem',
        boxShadow: '0 20px 60px rgba(25, 26, 35, 0.05)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Brand Header */}
        <div style={{
          padding: '0.6rem 1.2rem',
          borderRadius: '20px',
          backgroundColor: 'rgba(185, 255, 102, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.4rem'
        }}>
          <img src="/Final_Logo-removebg-preview.png" alt="Vector Logo" style={{ height: '58px', width: 'auto', objectFit: 'contain' }} />
        </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, textAlign: 'center', letterSpacing: '-0.5px' }}>
          Sign In to Vector
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-400)', textAlign: 'center', marginTop: '0.4rem', fontWeight: 500, lineHeight: 1.5 }}>
          Enter your credentials or choose a single sign-on provider to access the console.
        </p>

        {/* SSO Buttons Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%', marginTop: '2rem' }}>
          {/* Google SSO Button */}
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            style={{
              width: '100%',
              backgroundColor: '#ffffff',
              color: 'var(--color-dark)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '0.85rem',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.7rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-slate-50)';
              e.currentTarget.style.borderColor = 'var(--color-slate-300)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* GitHub SSO Button */}
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            style={{
              width: '100%',
              backgroundColor: '#18181b',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              padding: '0.85rem',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.7rem',
              boxShadow: '0 4px 12px rgba(24, 24, 27, 0.15)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#27272a'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#18181b'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span>Continue with GitHub</span>
          </button>
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          margin: '1.6rem 0',
          gap: '1rem'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
          <span style={{ fontSize: '0.72rem', color: 'var(--color-slate-400)', fontWeight: 700, letterSpacing: '1px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-slate-700)', letterSpacing: '0.5px' }}>OPERATOR EMAIL</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-slate-400)' }} />
              <input 
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@vector.ai or ecommerce"
                required
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem 0.8rem 2.8rem',
                  fontSize: '0.85rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  outline: 'none',
                  fontWeight: 600,
                  background: 'rgba(25, 26, 35, 0.02)'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-slate-700)', letterSpacing: '0.5px' }}>CONSOLE PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-slate-400)' }} />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem 0.8rem 2.8rem',
                  fontSize: '0.85rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  outline: 'none',
                  fontWeight: 600,
                  background: 'rgba(25, 26, 35, 0.02)'
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: 'var(--color-dark)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              padding: '0.9rem',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem',
              boxShadow: '0 10px 30px rgba(25, 26, 35, 0.15)',
              transition: 'all 0.2s ease'
            }}
          >
            <span>Sign In to Console</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Credential hint — inline within card */}
        <div style={{
          marginTop: '1.2rem',
          width: '100%',
          backgroundColor: 'rgba(185,255,102,0.07)',
          border: '1px solid rgba(185,255,102,0.25)',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          fontSize: '0.75rem',
          color: '#64748b',
        }}>
          <div style={{ fontWeight: 700, marginBottom: '0.3rem', color: '#1a202c', fontSize: '0.72rem', letterSpacing: '0.3px', textTransform: 'uppercase' }}>🔑 Test Access</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div><span style={{ fontWeight: 600, color: '#334155' }}>Inventra ERP:</span> sriram@inventra.com / <code style={{ background: 'rgba(0,0,0,0.05)', padding: '1px 5px', borderRadius: '4px', fontSize: '0.72rem' }}>inventra123</code></div>
            <div><span style={{ fontWeight: 600, color: '#334155' }}>Standard:</span> operator@vector.ai / <code style={{ background: 'rgba(0,0,0,0.05)', padding: '1px 5px', borderRadius: '4px', fontSize: '0.72rem' }}>vector123</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}
