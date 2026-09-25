import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import Dashboard from './pages/Dashboard';
import DigitalTwin from './pages/DigitalTwin';
import Simulator from './pages/Simulator';
import DecisionCenter from './pages/DecisionCenter';
import RootCauseCenter from './pages/RootCauseCenter';
import PolicyCenter from './pages/PolicyCenter';
import Timeline from './pages/Timeline';
import Footer from './components/Footer';

function AppContent() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';
  const isOnboardingPage = location.pathname === '/onboarding';
  const isFullBleedPage = isLandingPage || isLoginPage || isOnboardingPage;

  const [dashboardData, setDashboardData] = useState({
    health_score: 100,
    health_status: 'Healthy',
    alerts_count: 0
  });

  // Poll global cluster stats at root level to synchronize Top Navbar metrics across all routes
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const mode = localStorage.getItem('dashboardMode') || 'inventraerp';
        const res = await fetch(`http://localhost:8000/api/dashboard?mode=${mode}`);
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
        }
      } catch (err) {
        console.error("Error polling global dashboard statistics:", err);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Dynamically set body background
  useEffect(() => {
    if (isLandingPage) {
      document.body.style.backgroundColor = '#08090c';
      document.body.style.backgroundImage = 'none';
    } else {
      document.body.style.backgroundColor = 'var(--bg-page)';
      document.body.style.backgroundImage = 'radial-gradient(at 0% 0%, rgba(254, 252, 243, 0.5) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(247, 244, 235, 0.8) 0px, transparent 50%)';
    }
  }, [isLandingPage]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: isLandingPage ? '#08090c' : 'var(--bg-page)' 
    }}>
      {/* Show Navbar on all pages except dedicated Login and Onboarding pages */}
      {!isLoginPage && !isOnboardingPage && (
        <Navbar 
          healthScore={dashboardData.health_score} 
          healthStatus={dashboardData.health_status} 
          alertsCount={dashboardData.alerts_count} 
        />
      )}

      {isFullBleedPage ? (
        /* Full-Bleed Layout for Landing & Login Pages */
        <main style={{ flex: 1, width: '100%' }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
          </Routes>
        </main>
      ) : (
        /* Padded Responsive Container for Internal App Pages */
        <div className="app-container">
          <main style={{ flex: 1, width: '100%' }}>
            <Routes>
              <Route 
                path="/dashboard" 
                element={<Dashboard dashboardData={dashboardData} setDashboardData={setDashboardData} />} 
              />
              <Route path="/rca" element={<RootCauseCenter />} />
              <Route path="/root-cause" element={<RootCauseCenter />} />
              <Route path="/digital-twin" element={<DigitalTwin />} />
              <Route path="/simulator" element={<Simulator />} />
              <Route path="/decision" element={<DecisionCenter />} />
              <Route path="/decision-center" element={<DecisionCenter />} />
              <Route path="/policies" element={<PolicyCenter />} />
              <Route path="/policy-center" element={<PolicyCenter />} />
              <Route path="/timeline" element={<Timeline />} />
            </Routes>
          </main>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
