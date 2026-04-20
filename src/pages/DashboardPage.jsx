import React, { useState, useEffect } from 'react';
import ScoreRing from '../components/ScoreRing';
import { getSettings } from '../store/settingsStore';
import { getTodayLog, getLast7Days, isQuizDoneToday, getAverageProductivity, getTotalDaysTracked, getCurrentStreak } from '../store/dailyLogStore';
import { getKeywords, getWeakAreas } from '../store/keywordStore';
import { getScoreColor } from '../engine/scoringEngine';

export default function DashboardPage({ onNavigate }) {
  const [settings] = useState(getSettings());
  const [todayLog, setTodayLog] = useState(getTodayLog());
  const [last7, setLast7] = useState(getLast7Days());
  const [keywords, setKeywords] = useState(getKeywords());
  const [weakAreas, setWeakAreas] = useState(getWeakAreas());
  const [quizDone] = useState(isQuizDoneToday());
  const [avgProductivity] = useState(getAverageProductivity());
  const [totalDays] = useState(getTotalDaysTracked());
  const [currentStreak] = useState(getCurrentStreak());
  const greeting = getGreeting();

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  const pct = todayLog?.productivityPct ?? 0;
  const scoreInfo = getScoreColor(pct);

  // Compute max streak from keywords
  const topStreak = keywords.filter(k => k.type === 'streak').sort((a, b) => b.streak - a.streak)[0];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 4 }}>
              {greeting}, {settings.name}! 👋
            </p>
            <h1 className="page-title">Your Dashboard</h1>
            <p className="page-subtitle">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {!quizDone && (
            <button className="btn btn-orange animate-pulse-glow" onClick={() => onNavigate('quiz')}>
              🧠 Start Today's Quiz
            </button>
          )}
        </div>
      </div>

      {/* Warning Banner */}
      {weakAreas.length > 0 && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 'var(--radius-md)', padding: '14px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#f87171' }}>Weak Areas Detected</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              You're falling behind in: {weakAreas.map(k => k.name).join(', ')}. The AI will focus more on these today.
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, marginBottom: 24 }}>
        {/* Score Ring Card */}
        <div className="card card-glow-purple" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          {todayLog ? (
            <>
              <ScoreRing percentage={pct} />
              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>Today's Score</div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {todayLog.score?.actualScore ?? 0} / {todayLog.score?.maxScore ?? 0} pts
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }} className="animate-float">🎯</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Quiz Not Done Yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                Complete your daily quiz to see today's score
              </div>
              <button className="btn btn-primary" onClick={() => onNavigate('quiz')}>
                Start Quiz 🧠
              </button>
            </div>
          )}
        </div>

        {/* Stats + Trend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Stat Cards */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>{currentStreak}</div>
              <div className="stat-label">Day Streak</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-value" style={{ color: 'var(--accent-purple-light)' }}>{avgProductivity}%</div>
              <div className="stat-label">Avg Score</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>{totalDays}</div>
              <div className="stat-label">Days Tracked</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-value" style={{ color: 'var(--accent-green)' }}>
                {topStreak ? topStreak.streak : 0}
              </div>
              <div className="stat-label">Best Streak</div>
            </div>
          </div>

          {/* 7-day trend */}
          <div className="card">
            <div className="section-header">
              <div className="section-title">📈 Last 7 Days</div>
            </div>
            <div className="trend-bars">
              {last7.map((day) => {
                const pct = day.log?.productivityPct ?? 0;
                const color = pct >= 70 ? 'var(--accent-green)' : pct >= 40 ? 'var(--accent-yellow)' : pct > 0 ? 'var(--accent-red)' : 'rgba(255,255,255,0.08)';
                return (
                  <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div
                      className="trend-bar"
                      style={{
                        background: color,
                        height: pct > 0 ? `${Math.max(8, (pct / 100) * 48)}px` : '4px',
                        width: '100%',
                        boxShadow: pct > 0 ? `0 0 8px ${color}66` : 'none',
                      }}
                    />
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      {new Date(day.date + 'T00:00:00').toLocaleDateString('en', { weekday: 'short' })[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Active Keywords */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-header">
          <div className="section-title">🔑 Active Keywords</div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('keywords')}>Manage</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {keywords.map(kw => (
            <div key={kw.name} className={`keyword-chip ${kw.type}`} style={{ cursor: 'default' }}>
              <span>{kw.type === 'streak' ? '🔥' : kw.type === 'distraction' ? '⚠️' : '💡'}</span>
              {kw.name.replace(/_/g, ' ')}
              {kw.streak > 0 && <span style={{ fontWeight: 800, marginLeft: 2 }}>×{kw.streak}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom action row */}
      <div style={{ display: 'flex', gap: 16 }}>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => onNavigate('analytics')}>
          📊 View Analytics
        </button>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => onNavigate('insights')}>
          💡 View Insights
        </button>
        {quizDone && (
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onNavigate('quiz')}>
            🔄 Redo Quiz
          </button>
        )}
      </div>
    </div>
  );
}
