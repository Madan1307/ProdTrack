import React, { useState } from 'react';
import { completeOnboarding } from '../store/settingsStore';
import { initializeKeywords, DEFAULT_KEYWORDS, KEYWORD_TYPES } from '../store/keywordStore';

const SUGGESTED_STREAK = ['leetcode', 'gym', 'study', 'project', 'meditation', 'reading', 'coding'];
const SUGGESTED_DISTRACTION = ['scrolling', 'junk_food', 'procrastination', 'gaming_excess', 'binge_watching'];

export default function OnboardingPage({ onComplete }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [streakKws, setStreakKws] = useState(['leetcode', 'gym', 'study', 'project']);
  const [distractKws, setDistrActKws] = useState(['scrolling', 'procrastination']);
  const [customInput, setCustomInput] = useState('');
  const [customType, setCustomType] = useState('streak');
  const [error, setError] = useState('');

  const toggleKw = (kw, list, setList) => {
    if (list.includes(kw)) {
      setList(list.filter(k => k !== kw));
    } else {
      if (list.length < 8) setList([...list, kw]);
    }
  };

  const addCustomKw = () => {
    const kw = customInput.trim().toLowerCase().replace(/\s+/g, '_');
    if (!kw) return;
    if (customType === 'streak' && !streakKws.includes(kw)) {
      setStreakKws([...streakKws, kw]);
    } else if (customType === 'distraction' && !distractKws.includes(kw)) {
      setDistrActKws([...distractKws, kw]);
    }
    setCustomInput('');
  };

  const handleFinish = () => {
    if (!name.trim()) { setError('Please enter your name'); return; }
    if (!apiKey.trim()) { setError('Please enter your Groq API key'); return; }

    const keywords = [
      ...streakKws.map((name, i) => ({
        name, type: 'streak', priority: 7 + Math.floor(i % 3), streak: 0, missCount: 0, lastSeen: null,
      })),
      ...distractKws.map((name) => ({
        name, type: 'distraction', priority: 6, streak: 0, missCount: 0, lastSeen: null,
      })),
      { name: 'revision', type: 'suggestion', priority: 5, streak: 0, missCount: 0, lastSeen: null },
      { name: 'consistency', type: 'suggestion', priority: 6, streak: 0, missCount: 0, lastSeen: null },
    ];

    initializeKeywords(keywords);
    completeOnboarding(name.trim(), apiKey.trim());
    onComplete();
  };

  return (
    <div className="onboarding-bg">
      <div className="onboarding-card">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-orange))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 20px',
            boxShadow: 'var(--shadow-glow-purple)',
          }}>⚡</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
            Welcome to <span style={{
              background: 'linear-gradient(135deg, var(--accent-purple-light), var(--accent-orange))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>ProdTrack</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Your AI-powered adaptive productivity system
          </p>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: s <= step ? 'var(--accent-purple)' : 'rgba(255,255,255,0.08)',
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 'var(--radius-md)', padding: '12px 16px',
            color: 'var(--accent-red)', fontSize: 13, marginBottom: 20,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="animate-slide-up">
            <h2 style={{ fontSize: 18, marginBottom: 6 }}>👤 Who are you?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
              Let's personalize your productivity journey
            </p>
            <div className="input-group" style={{ marginBottom: 20 }}>
              <label className="input-label">Your Name</label>
              <div className="input-icon-wrapper">
                <span className="input-icon">👤</span>
                <input
                  className="input"
                  type="text"
                  placeholder="e.g. Rahul Kumar"
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && name.trim() && setStep(2)}
                />
              </div>
            </div>
            <div className="input-group" style={{ marginBottom: 24 }}>
              <label className="input-label">Groq API Key (Llama 3)</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showKey ? 'text' : 'password'}
                  placeholder="gsk_..."
                  value={apiKey}
                  onChange={e => { setApiKey(e.target.value); setError(''); }}
                  style={{ paddingRight: 48 }}
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)',
                  }}
                >{showKey ? '🙈' : '👁️'}</button>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Get free key at <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer"
                  style={{ color: 'var(--accent-purple-light)' }}>console.groq.com</a>
              </span>
            </div>
            <button
              className="btn btn-primary w-full"
              disabled={!name.trim() || !apiKey.trim()}
              onClick={() => { setError(''); setStep(2); }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2: Streak Keywords */}
        {step === 2 && (
          <div className="animate-slide-up">
            <h2 style={{ fontSize: 18, marginBottom: 6 }}>🔥 Your Habits to Track</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
              Select habits you want to build streaks for (max 8)
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {SUGGESTED_STREAK.map(kw => (
                <button
                  key={kw}
                  className={`keyword-chip ${streakKws.includes(kw) ? 'streak' : ''}`}
                  style={{ cursor: 'pointer', background: streakKws.includes(kw) ? undefined : 'rgba(255,255,255,0.04)', color: streakKws.includes(kw) ? undefined : 'var(--text-muted)' }}
                  onClick={() => toggleKw(kw, streakKws, setStreakKws)}
                >
                  {streakKws.includes(kw) ? '✓' : '+'} {kw}
                </button>
              ))}
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12 }}>
              🚫 Distractions to monitor (max 5)
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {SUGGESTED_DISTRACTION.map(kw => (
                <button
                  key={kw}
                  className={`keyword-chip ${distractKws.includes(kw) ? 'distraction' : ''}`}
                  style={{ cursor: 'pointer', background: distractKws.includes(kw) ? undefined : 'rgba(255,255,255,0.04)', color: distractKws.includes(kw) ? undefined : 'var(--text-muted)' }}
                  onClick={() => toggleKw(kw, distractKws, setDistrActKws)}
                >
                  {distractKws.includes(kw) ? '✓' : '+'} {kw}
                </button>
              ))}
            </div>

            {/* Custom keyword input */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              <input
                className="input"
                type="text"
                placeholder="Add custom keyword..."
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomKw()}
                style={{ flex: 1 }}
              />
              <select
                className="input"
                value={customType}
                onChange={e => setCustomType(e.target.value)}
                style={{ width: 140 }}
              >
                <option value="streak">Streak</option>
                <option value="distraction">Distraction</option>
              </select>
              <button className="btn btn-ghost" onClick={addCustomKw}>Add</button>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button
                className="btn btn-primary w-full"
                disabled={streakKws.length === 0}
                onClick={() => setStep(3)}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="animate-slide-up">
            <h2 style={{ fontSize: 18, marginBottom: 6 }}>🚀 You're all set!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
              Here's a summary of your setup
            </p>

            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>👤 User</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{name}</div>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>🔥 Streak Keywords ({streakKws.length})</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {streakKws.map(k => <span key={k} className="keyword-chip streak">{k}</span>)}
              </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>🚫 Distraction Keywords ({distractKws.length})</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {distractKws.map(k => <span key={k} className="keyword-chip distraction">{k}</span>)}
              </div>
            </div>

            <div style={{
              background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 24,
              fontSize: 13, color: 'var(--text-secondary)',
            }}>
              💡 The AI will generate <strong style={{ color: 'var(--text-primary)' }}>10 personalized questions</strong> every day based on these keywords. Your behavior is analyzed and your productivity score updates daily.
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn-orange w-full btn-lg" onClick={handleFinish}>
                Start Tracking 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
