import React, { useState, useEffect } from 'react';
import { getSettings } from '../store/settingsStore';
import { getTodayLog } from '../store/dailyLogStore';
import { getScoreColor } from '../engine/scoringEngine';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'quiz', label: 'Daily Quiz', icon: '🧠' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'keywords', label: 'Keywords', icon: '🔑' },
  { id: 'insights', label: 'Insights', icon: '💡' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar({ activePage, onNavigate }) {
  const [settings, setSettings] = useState(getSettings());
  const [todayScore, setTodayScore] = useState(null);
  const [scoreInfo, setScoreInfo] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const s = getSettings();
    setSettings(s);
    const log = getTodayLog();
    if (log) {
      const pct = log.productivityPct;
      setTodayScore(pct);
      setScoreInfo(getScoreColor(pct));
    }
  }, [activePage]);

  const initial = settings.name ? settings.name[0].toUpperCase() : 'U';

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="mobile-menu-btn"
        style={{
          display: 'none',
          position: 'fixed', top: 16, left: 16, zIndex: 200,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', padding: '10px 12px',
          cursor: 'pointer', fontSize: 20,
        }}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        ☰
      </button>

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">⚡</div>
          <span className="logo-text">ProdTrack</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Card */}
        <div className="sidebar-user">
          <div className="user-card">
            <div className="user-avatar">{initial}</div>
            <div className="user-name">{settings.name || 'User'}</div>
            {todayScore !== null && scoreInfo ? (
              <div className={`user-score-pill ${scoreInfo.class.replace('score-', '')}`}>
                {scoreInfo.emoji} {todayScore}% today
              </div>
            ) : (
              <div className="user-score-pill average">📋 No quiz yet</div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
