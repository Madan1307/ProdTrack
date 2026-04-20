import React, { useState, useEffect } from 'react';
import './index.css';
import { isOnboardingComplete } from './store/settingsStore';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import QuizPage from './pages/QuizPage';
import AnalyticsPage from './pages/AnalyticsPage';
import KeywordsPage from './pages/KeywordsPage';
import InsightsPage from './pages/InsightsPage';
import SettingsPage from './pages/SettingsPage';
import Sidebar from './components/Sidebar';

export default function App() {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    setIsOnboarded(isOnboardingComplete());
  }, []);

  function handleOnboardingComplete() {
    setIsOnboarded(true);
    setActivePage('dashboard');
  }

  if (!isOnboarded) {
    return <OnboardingPage onComplete={handleOnboardingComplete} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage onNavigate={setActivePage} />;
      case 'quiz':      return <QuizPage onNavigate={setActivePage} />;
      case 'analytics': return <AnalyticsPage />;
      case 'keywords':  return <KeywordsPage />;
      case 'insights':  return <InsightsPage />;
      case 'settings':  return <SettingsPage onNavigate={setActivePage} />;
      default:          return <DashboardPage onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="app-layout">
      {/* Ambient background glows */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '20%',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '10%',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(249,115,22,0.04) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
      </div>

      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="main-content" style={{ position: 'relative', zIndex: 1 }}>
        {renderPage()}
      </main>
    </div>
  );
}
