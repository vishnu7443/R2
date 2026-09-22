import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { 
  ArrowRight, Cpu, Activity, ShieldAlert, CheckCircle, Settings, Layers, Play, Zap, Check, Lock, User, RefreshCw, Shield, GitBranch, Loader2
} from 'lucide-react';
import Footer from '../components/Footer';

export default function LandingPage() {
  const navigate = useNavigate();
  
  // Login Modal State (Clerk Mock)
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authTab, setAuthTab] = useState('signin'); // 'signin' or 'signup'
  const [username, setUsername] = useState('operator');
  const [clerkUsername, setClerkUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('••••••••');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');

  // GSAP Animation Refs
  const heroGlowRef = useRef(null);
  const heroBadgeRef = useRef(null);
  const heroHeadlineRef = useRef(null);
  const heroParagraphRef = useRef(null);
  const heroButtonsRef = useRef(null);
  const fingerprintRef = useRef(null);

  const featureHeadingRef = useRef(null);
  const featureListRef = useRef(null);
  const featureCardRef = useRef(null);
  const featureBadgeRef = useRef(null);

  const adventureHeadingRef = useRef(null);
  const adventureParagraphRef = useRef(null);
  const adventureCardsRef = useRef([]);

  const automationHeadingRef = useRef(null);
  const automationParagraphRef = useRef(null);
  const automationCardLeftRef = useRef(null);
  const automationCardRightRef = useRef(null);
  const automationArrowRef = useRef(null);

  const pageContainerRef = useRef(null);
  const modalContainerRef = useRef(null);

  // Trigger login workflow from navbar dispatch event
  useEffect(() => {
    const handleLoginDispatch = () => {
      setIsLoginOpen(true);
    };
    window.addEventListener('trigger-login-modal', handleLoginDispatch);
    return () => window.removeEventListener('trigger-login-modal', handleLoginDispatch);
  }, []);

  // 1. GSAP INTRO & ENHANCED FLOATING ANIMATIONS
  useEffect(() => {
    // A. Hero Intro Timeline
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    gsap.set([heroBadgeRef.current, heroHeadlineRef.current, heroParagraphRef.current, heroButtonsRef.current], {
      opacity: 0,
      y: 50
    });
    gsap.set(fingerprintRef.current, { scale: 0, rotation: -120 });

    tl.to(heroBadgeRef.current, { opacity: 1, y: 0, duration: 0.7 })
      .to(heroHeadlineRef.current, { opacity: 1, y: 0, duration: 0.9 }, '-=0.45')
      .to(fingerprintRef.current, { scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(2)' }, '-=0.65')
      .to(heroParagraphRef.current, { opacity: 1, y: 0, duration: 0.7 }, '-=0.55')
      .to(heroButtonsRef.current, { opacity: 1, y: 0, duration: 0.7 }, '-=0.45');

    // B. Continuous Pulsing & Floating Loops
    gsap.to(heroGlowRef.current, {
      scale: 1.25,
      opacity: 0.9,
      duration: 3.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    // Floating UI Badges
    gsap.to(featureBadgeRef.current, {
      y: -10,
      duration: 3.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.to(automationCardLeftRef.current, {
      y: -6,
      duration: 3.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.to(automationCardRightRef.current, {
      y: 6,
      duration: 3.4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 0.5
    });

    // C. Scroll Reveal Observer
    const observerOptions = { threshold: 0.15 };
    
    // Feature Section Observer
    const featureObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          gsap.fromTo(featureHeadingRef.current, { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.85, ease: 'power4.out' });
          gsap.fromTo(featureListRef.current.children, { opacity: 0, y: 55 }, { opacity: 1, y: 0, duration: 0.75, stagger: 0.18, ease: 'power3.out', delay: 0.2 });
          gsap.fromTo(featureCardRef.current, { opacity: 0, y: 90, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.95, ease: 'back.out(1.4)', delay: 0.25 });
          gsap.fromTo(featureBadgeRef.current, { opacity: 0, y: 70, scale: 0.88 }, { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'back.out(1.6)', delay: 0.5 });
          featureObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const featureSec = document.getElementById('feature-section');
    if (featureSec) featureObserver.observe(featureSec);

    // Adventure Section Observer
    const adventureObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          gsap.fromTo(adventureHeadingRef.current, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power4.out' });
          gsap.fromTo(adventureParagraphRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.75, delay: 0.15, ease: 'power3.out' });
          gsap.fromTo(adventureCardsRef.current, { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 0.95, stagger: 0.22, ease: 'power3.out', delay: 0.3 });
          adventureObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const adventureSec = document.getElementById('adventure-section');
    if (adventureSec) adventureObserver.observe(adventureSec);

    // Automation Section Observer
    const automationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          gsap.fromTo(automationHeadingRef.current, { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.85, ease: 'power4.out' });
          gsap.fromTo(automationParagraphRef.current, { opacity: 0, y: 45 }, { opacity: 1, y: 0, duration: 0.75, delay: 0.2, ease: 'power3.out' });
          
          gsap.fromTo(automationCardLeftRef.current, { opacity: 0, y: 80, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.85, delay: 0.3, ease: 'back.out(1.3)' });
          gsap.fromTo(automationCardRightRef.current, { opacity: 0, y: 100, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.85, delay: 0.45, ease: 'back.out(1.3)' });
          
          if (automationArrowRef.current) {
            const length = automationArrowRef.current.getTotalLength ? automationArrowRef.current.getTotalLength() : 250;
            gsap.fromTo(automationArrowRef.current, 
              { strokeDasharray: length, strokeDashoffset: length, opacity: 0 }, 
              { strokeDashoffset: 0, opacity: 1, duration: 1.4, ease: 'power2.inOut', delay: 0.65 }
            );
          }
          
          automationObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const automationSec = document.getElementById('automation-section');
    if (automationSec) automationObserver.observe(automationSec);

    return () => {
      if (featureSec) featureObserver.disconnect();
      if (adventureSec) adventureObserver.disconnect();
      if (automationSec) automationObserver.disconnect();
    };
  }, []);

  // 2. GSAP LOGIN MODAL ANIMATIONS
  useEffect(() => {
    if (isLoginOpen) {
      gsap.set(modalContainerRef.current, { scale: 0.85, opacity: 0, y: 20 });
      gsap.to(modalContainerRef.current, {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: 'back.out(1.7)'
      });
    }
  }, [isLoginOpen]);

  // 3. CLERK AUTH SUBMIT WORKFLOW
  const handleClerkSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    try {
      const activeUsername = authTab === 'signup' ? clerkUsername : username;
      const activeEmail = authTab === 'signup' ? email : (username.includes('@') ? username : `${username}@inventra.com`);
      
      const response = await fetch('http://localhost:8000/api/projects/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: activeUsername,
          email: activeEmail
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('clerkUser', JSON.stringify({
          id: data.user_id,
          username: data.username,
          email: data.email
        }));
        
        // GSAP exit animation
        gsap.to(modalContainerRef.current, {
          scale: 0.8,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in'
        });

        gsap.to(pageContainerRef.current, {
          opacity: 0,
          scale: 0.97,
          duration: 0.5,
          ease: 'power3.inOut',
          onComplete: () => {
            setIsAuthenticating(false);
            setIsLoginOpen(false);
            navigate('/onboarding');
          }
        });
      } else {
        setIsAuthenticating(false);
        setAuthError('Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      console.error(err);
      setIsAuthenticating(false);
      setAuthError('Clerk authentication server is currently offline.');
    }
  };

  return (
    <div ref={pageContainerRef} style={{ display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden', margin: 0, transition: 'all 0.5s ease' }}>
      
      {/* 1. HERO SECTION (100vh Full Viewport Frame) */}
      <section style={{
        position: 'relative',
        backgroundColor: '#0d0e12',
        color: '#ffffff',
        padding: '4rem 2rem 6rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight: 'calc(100vh - 84px)',
        width: '100%',
        overflow: 'hidden'
      }}>
        {/* Glow Background */}
        <div ref={heroGlowRef} style={{
          position: 'absolute',
          top: '25%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(185, 255, 102, 0.09) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(60px)',
          zIndex: 1,
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '900px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Logo Badge */}
          <div ref={heroBadgeRef} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '30px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            width: 'fit-content',
            marginBottom: '2rem'
          }}>
            <img src="/Final_Logo-removebg-preview.png" alt="Vector Logo" style={{ height: '24px', width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px', color: '#b9ff66' }}>VECTOR DECISION LAYER</span>
          </div>

          {/* Headline */}
          <h1 ref={heroHeadlineRef} style={{
            fontSize: '3.6rem',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-1.5px',
            color: '#ffffff',
            maxWidth: '800px'
          }}>
            The future of <span style={{ color: 'rgba(255,255,255,0.4)' }}>cluster reliability</span> is <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', verticalAlign: 'middle', borderBottom: '3px solid #b9ff66', paddingBottom: '2px' }}>
              <span ref={fingerprintRef} style={{ display: 'inline-block' }}>
                <Activity size={32} color="#b9ff66" style={{ strokeWidth: 3 }} />
              </span> operator
            </span> + <span style={{ color: '#b9ff66' }}>AI</span>
          </h1>

          {/* Subheading */}
          <p ref={heroParagraphRef} style={{
            fontSize: '1.15rem',
            color: 'rgba(255, 255, 255, 0.65)',
            marginTop: '2rem',
            maxWidth: '620px',
            lineHeight: 1.6,
            fontWeight: 400
          }}>
            We help you predict metrics surges, stress-test cluster workloads under load, and enforce policy guardrails with active human-in-the-loop assurance.
          </p>

          {/* CTA Buttons */}
          <div ref={heroButtonsRef} style={{ display: 'flex', gap: '1rem', marginTop: '3rem', alignItems: 'center' }}>
            <button 
              onClick={() => navigate('/login')}
              className="btn-primary"
              style={{
                backgroundColor: '#b9ff66',
                color: '#0d0e12',
                padding: '0.8rem 2rem',
                fontSize: '0.95rem',
                fontWeight: 800,
                borderRadius: '30px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 8px 30px rgba(185, 255, 102, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>Login to Console</span>
              <Lock size={16} />
            </button>

            <button 
              onClick={() => navigate('/simulator')}
              style={{
                backgroundColor: 'transparent',
                color: '#ffffff',
                padding: '0.8rem 2rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                borderRadius: '30px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.borderColor = '#ffffff'}
              onMouseLeave={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
            >
              Simulate Failure
            </button>
          </div>
        </div>
      </section>

      {/* 2. FEATURE SPOTLIGHT (Richly Populated Telemetry Card) */}
      <section id="feature-section" style={{
        width: '100%',
        backgroundColor: '#fbfbf8',
        color: '#191a23',
        padding: '8rem 2rem'
      }}>
        {/* Inner Centered Container */}
        <div style={{
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4rem',
          alignItems: 'center'
        }}>
          {/* Left Side Content */}
          <div>
            <h2 ref={featureHeadingRef} style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.5px' }}>
              AI Core checks metrics <br />
              <span style={{ color: 'var(--color-emerald)' }}>forecasting reliability</span>
            </h2>
            
            <div ref={featureListRef} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2.2rem' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-dark)' }}>Slope projections check continuously.</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-400)', marginTop: '0.4rem', lineHeight: 1.6 }}>
                  Vector runs linear regression analysis on sliding telemetry windows to forecast limits exhaustion 5 minutes in advance.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-dark)' }}>Real-sync cluster metrics.</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-400)', marginTop: '0.4rem', lineHeight: 1.6 }}>
                  Connects directly to your Prometheus queries to fetch actual node, pod, and network performance indicators.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-dark)' }}>Autonomous remediation scale.</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-400)', marginTop: '0.4rem', lineHeight: 1.6 }}>
                  AutoPilot handles trivial load adjustments instantly, allowing platform engineers to delegate operational stress safely.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side Visual (Richly Populated Card) */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div ref={featureCardRef} style={{
              width: '440px',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
              overflow: 'hidden',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              gsap.to(featureCardRef.current, { y: -8, boxShadow: '0 30px 60px rgba(0,0,0,0.05)', duration: 0.3 });
            }}
            onMouseLeave={(e) => {
              gsap.to(featureCardRef.current, { y: 0, boxShadow: '0 20px 40px rgba(0,0,0,0.03)', duration: 0.3 });
            }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="highlight-badge-dark" style={{ backgroundColor: '#10b981', color: '#ffffff', fontSize: '0.65rem' }}>ACTIVE WORKLOAD</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-slate-400)' }}>payment-service</span>
              </div>

              {/* Rich Metrics Population */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', margin: '1.5rem 0' }}>
                
                {/* Metric 1: CPU Pool */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800 }}>
                    <span>CPU Pool Allocation</span>
                    <span style={{ color: 'var(--color-emerald)' }}>45.0%</span>
                  </div>
                  <div style={{ height: '7px', borderRadius: '4px', background: 'var(--color-slate-100)', overflow: 'hidden' }}>
                    <div style={{ width: '45%', height: '100%', background: '#10b981' }} />
                  </div>
                </div>

                {/* Metric 2: Memory Fills */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800 }}>
                    <span>Memory Fills</span>
                    <span>52.4%</span>
                  </div>
                  <div style={{ height: '7px', borderRadius: '4px', background: 'var(--color-slate-100)', overflow: 'hidden' }}>
                    <div style={{ width: '52.4%', height: '100%', background: 'var(--color-dark)' }} />
                  </div>
                </div>

                {/* Metric 3: Active Pod Replicas */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-slate-50)', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-slate-700)' }}>Active Pod Replicas</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: 'var(--color-dark)', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>5 Pods Nominal</span>
                </div>

                {/* Metric 4: Network Throughput */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(185, 255, 102, 0.12)', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid rgba(185, 255, 102, 0.3)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-dark)' }}>Network Rate</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-dark)' }}>1.2 GB/s Optimal</span>
                </div>
              </div>

              {/* Card Footer */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>AutoPilot: Enabled</div>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-emerald)', fontWeight: 800 }}>98% Safe</span>
              </div>
            </div>

            {/* Overlapping Badge Card */}
            <div ref={featureBadgeRef} style={{
              position: 'absolute',
              bottom: '-30px',
              right: '10px',
              width: '280px',
              backgroundColor: '#0d0e12',
              color: '#ffffff',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              zIndex: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.9rem'
                }}>A</div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Ada Engine</div>
                  <div style={{ fontSize: '0.65rem', color: '#b9ff66', fontWeight: 700 }}>AI Assurance Core</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>VERIFICATION BADGES</span>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '0.6rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#b9ff66', color: '#0d0e12', fontWeight: 800 }}>CPU CHECK</span>
                  <span style={{ fontSize: '0.6rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: '#ffffff', fontWeight: 800 }}>POLICY OK</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CHOOSE YOUR ADVENTURE */}
      <section id="adventure-section" style={{
        width: '100%',
        backgroundColor: '#ffffff',
        color: '#191a23',
        padding: '8rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 ref={adventureHeadingRef} style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Choose Your <span style={{ color: 'var(--color-emerald)' }}>Adventure</span>
          </h2>
          <p ref={adventureParagraphRef} style={{ fontSize: '1rem', color: 'var(--color-slate-400)', marginTop: '0.8rem', maxWidth: '600px', fontWeight: 500 }}>
            We build elite automation tools for kubernetes operators and enhance platform reliability and governance controls.
          </p>

          {/* Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2.5rem',
            width: '100%',
            marginTop: '4rem'
          }}>
            {/* Card 1: SREs */}
            <div 
              ref={el => adventureCardsRef.current[0] = el}
              style={{
                backgroundColor: '#0d0e12',
                color: '#ffffff',
                borderRadius: '24px',
                padding: '3rem',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '380px',
                border: '1px solid rgba(255,255,255,0.05)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={() => {
                gsap.to(adventureCardsRef.current[0], { y: -8, borderColor: 'rgba(185, 255, 102, 0.3)', duration: 0.3 });
              }}
              onMouseLeave={() => {
                gsap.to(adventureCardsRef.current[0], { y: 0, borderColor: 'rgba(255,255,255,0.05)', duration: 0.3 });
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>For Operators & SREs</h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.8rem', lineHeight: 1.6 }}>
                  Vector helps you stress-test configurations and keep cluster availability at 100%.
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: '2rem 0 0 0', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                    <CheckCircle size={14} color="#b9ff66" />
                    <span>Track and model metrics trends</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                    <CheckCircle size={14} color="#b9ff66" />
                    <span>Simulate failure disturbances live</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                    <CheckCircle size={14} color="#b9ff66" />
                    <span>Approve scaling recommendations</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => navigate('/simulator')}
                style={{
                  backgroundColor: '#b9ff66',
                  color: '#0d0e12',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '0.8rem 1.6rem',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  width: 'fit-content',
                  marginTop: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <span>Explore Simulator</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Card 2: Business */}
            <div 
              ref={el => adventureCardsRef.current[1] = el}
              style={{
                backgroundColor: '#0d0e12',
                color: '#ffffff',
                borderRadius: '24px',
                padding: '3rem',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '380px',
                border: '1px solid rgba(255,255,255,0.05)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={() => {
                gsap.to(adventureCardsRef.current[1], { y: -8, borderColor: 'rgba(185, 255, 102, 0.3)', duration: 0.3 });
              }}
              onMouseLeave={() => {
                gsap.to(adventureCardsRef.current[1], { y: 0, borderColor: 'rgba(255,255,255,0.05)', duration: 0.3 });
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>For Business & Platform</h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.8rem', lineHeight: 1.6 }}>
                  Enforce strict operational policies and retain automated audit trails across all services.
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: '2rem 0 0 0', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                    <CheckCircle size={14} color="#b9ff66" />
                    <span>Control governance boundaries</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                    <CheckCircle size={14} color="#b9ff66" />
                    <span>Require manual operator approval</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                    <CheckCircle size={14} color="#b9ff66" />
                    <span>Access audit trail execution timeline</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => navigate('/policies')}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '30px',
                  padding: '0.8rem 1.6rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  width: 'fit-content',
                  marginTop: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.12)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
              >
                <span>Configure Policies</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MUNDANE TASKS AUTOMATION (Correct Arrow Trajectory towards Delegated Card) */}
      <section id="automation-section" style={{
        width: '100%',
        backgroundColor: '#0c0d12',
        color: '#ffffff',
        padding: '8rem 2rem'
      }}>
        {/* Inner Centered Container */}
        <div style={{
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: '4rem',
          alignItems: 'center'
        }}>
          {/* Left Side Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <h2 ref={automationHeadingRef} style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.5px' }}>
              Vector AI executes <br />
              <span style={{ color: '#b9ff66' }}>remediation tasks automatically</span>
            </h2>
            <p ref={automationParagraphRef} style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.6, maxWidth: '520px', fontWeight: 400 }}>
              Operators orchestrate cluster scaling and restarts via AI-proposals, allowing the assurance core to handle mundane tasks while focusing on higher-level system engineering.
            </p>
          </div>

          {/* Right Side Cards with Re-aligned Arrow pointing DOWN-RIGHT into AI Delegated card */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', height: '380px', width: '100%' }}>
            
            {/* Card A: "Pending Queue" (Top Left) */}
            <div ref={automationCardLeftRef} style={{
              position: 'absolute',
              left: '0px',
              top: '20px',
              width: '260px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              padding: '1.2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              zIndex: 2
            }}>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>PENDING QUEUE</span>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginTop: '0.5rem' }}>Scale deployment replicas</h4>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>Target: payment-service namespace</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                <span style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 800 }}>PENDING APPROVAL</span>
              </div>
            </div>

            {/* Card B: "AI Delegated" (Bottom Right) */}
            <div ref={automationCardRightRef} style={{
              position: 'absolute',
              right: '0px',
              bottom: '20px',
              width: '270px',
              backgroundColor: '#ffffff',
              color: '#191a23',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)',
              zIndex: 3
            }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-slate-400)', fontWeight: 800 }}>AI DELEGATED</span>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--color-dark)' }}>Increase Replicas (+2 Pods)</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', marginTop: '0.2rem' }}>Action executed successfully</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '1.2rem', backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '0.3rem 0.6rem', borderRadius: '8px', width: 'fit-content' }}>
                <Check size={12} color="#10b981" style={{ strokeWidth: 3 }} />
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 800 }}>COMPLETED & RECOVERED</span>
              </div>
            </div>

            {/* SVG Arrow curving FROM Pending Queue DOWN-RIGHT into AI Delegated Card */}
            <svg style={{
              position: 'absolute',
              left: '130px',
              top: '90px',
              width: '220px',
              height: '200px',
              zIndex: 4,
              pointerEvents: 'none',
              overflow: 'visible'
            }} viewBox="0 0 200 200">
              <defs>
                <marker
                  id="arrowhead-green"
                  markerWidth="6"
                  markerHeight="6"
                  refX="5"
                  refY="3"
                  orient="auto"
                >
                  <path d="M 0 0 L 6 3 L 0 6 Z" fill="#b9ff66" />
                </marker>
              </defs>

              <path 
                ref={automationArrowRef}
                d="M 20 20 Q 90 40 135 110" 
                fill="none" 
                stroke="#b9ff66" 
                strokeWidth="2.5" 
                strokeDasharray="5 5"
                markerEnd="url(#arrowhead-green)"
              />

              {/* Masked Pill Badge for AI DELEGATED Label */}
              <g transform="translate(15, 80)">
                <rect x="-6" y="-13" width="112" height="22" rx="11" fill="#0d0e12" stroke="rgba(185, 255, 102, 0.4)" strokeWidth="1" />
                <text x="2" y="2" fill="#b9ff66" fontSize="9.5" fontWeight="800" letterSpacing="1">
                  AI DELEGATED →
                </text>
              </g>
            </svg>
          </div>
        </div>
      </section>
        {/* 5. MOCK CLERK AUTH MODAL */}
      {isLoginOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(13, 14, 18, 0.82)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          {/* Clerk Box Container */}
          <div ref={modalContainerRef} style={{
            width: '430px',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            color: '#1e293b',
            position: 'relative',
            fontFamily: 'Inter, sans-serif'
          }}>
            {/* Close Button */}
            <button 
              onClick={() => setIsLoginOpen(false)}
              style={{
                position: 'absolute',
                top: '1.2rem',
                right: '1.2rem',
                background: 'transparent',
                border: 'none',
                fontSize: '1.2rem',
                fontWeight: 800,
                cursor: 'pointer',
                color: '#94a3b8',
                transition: 'all 0.2s ease'
              }}
            >
              ✕
            </button>

            {/* Clerk Branded Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', marginBottom: '1.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f8fafc', padding: '0.4rem 1rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <Shield size={16} color="#6366f1" style={{ strokeWidth: 2.5 }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6366f1', letterSpacing: '0.5px' }}>CLERK IDENTITY</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, textAlign: 'center', color: '#0f172a', margin: '0.2rem 0 0 0', letterSpacing: '-0.5px' }}>
                {authTab === 'signin' ? 'Sign in to Vector' : 'Create your account'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', fontWeight: 500, margin: 0 }}>
                {authTab === 'signin' ? 'Welcome back! Choose an access option.' : 'Register operator details in Vector database.'}
              </p>
            </div>

            {/* SSO Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
              <button
                type="button"
                onClick={handleClerkSubmit}
                style={{
                  width: '100%',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={handleClerkSubmit}
                style={{
                  width: '100%',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <GitBranch size={16} />
                <span>Continue with GitHub</span>
              </button>
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', margin: '1.4rem 0', gap: '0.8rem' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.5px' }}>OR</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
            </div>

            {/* Clerk Form */}
            <form onSubmit={handleClerkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {authTab === 'signup' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontWeight: 800, color: '#475569', fontSize: '0.68rem', letterSpacing: '0.5px' }}>EMAIL ADDRESS</label>
                  <input 
                    type="email" 
                    placeholder="sriram@inventra.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '10px', outline: 'none', fontWeight: 600, color: '#0f172a' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontWeight: 800, color: '#475569', fontSize: '0.68rem', letterSpacing: '0.5px' }}>
                  {authTab === 'signup' ? 'DESIRED USERNAME' : 'USERNAME OR EMAIL ADDRESS'}
                </label>
                <input 
                  type="text" 
                  placeholder={authTab === 'signup' ? 'srirams' : 'operator or srirams'}
                  value={authTab === 'signup' ? clerkUsername : username}
                  onChange={(e) => authTab === 'signup' ? setClerkUsername(e.target.value) : setUsername(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '10px', outline: 'none', fontWeight: 600, color: '#0f172a' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontWeight: 800, color: '#475569', fontSize: '0.68rem', letterSpacing: '0.5px' }}>SECURE CLERK PASSWORD</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '10px', outline: 'none', fontWeight: 600, color: '#0f172a' }}
                />
              </div>

              {authError && (
                <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                  <ShieldAlert size={14} />
                  <span>{authError}</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={isAuthenticating}
                style={{
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.85rem',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '0.5rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)'
                }}
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="animate-spin" size={16} style={{ animation: 'spin 2.5s linear infinite' }} />
                    <span>Verifying session...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Clerk Switch Tab */}
            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: '#64748b' }}>
              {authTab === 'signin' ? (
                <span>
                  Don't have an account?{' '}
                  <button 
                    onClick={() => { setAuthTab('signup'); setAuthError(''); }}
                    style={{ background: 'transparent', border: 'none', color: '#6366f1', fontWeight: 800, cursor: 'pointer', padding: 0 }}
                  >
                    Sign Up
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button 
                    onClick={() => { setAuthTab('signin'); setAuthError(''); }}
                    style={{ background: 'transparent', border: 'none', color: '#6366f1', fontWeight: 800, cursor: 'pointer', padding: 0 }}
                  >
                    Sign In
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. FLOATING WHITE CARD FOOTER WITH WATERMARK */}
      <Footer />

    </div>
  );
}
