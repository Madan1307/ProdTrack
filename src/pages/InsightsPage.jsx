import React, { useState } from 'react';
import { generateInsights } from '../ai/geminiEngine';
import { getKeywords } from '../store/keywordStore';
import { getLast30Days, getTodayLog } from '../store/dailyLogStore';

const TONE_CONFIG = {
  excellent: { color: 'var(--accent-green)', bg: 'rgba(34,197,94,0.08)', icon: '🔥', label: 'You\'re crushing it!' },
  average: { color: 'var(--accent-yellow)', bg: 'rgba(245,158,11,0.08)', icon: '⚠️', label: 'Room to improve' },
  warning: { color: 'var(--accent-orange)', bg: 'rgba(249,115,22,0.08)', icon: '🚨', label: 'Falling behind' },
  critical: { color: 'var(--accent-red)', bg: 'rgba(239,68,68,0.08)', icon: '❌', label: 'Needs urgent attention' },
};

export default function InsightsPage() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const keywords = getKeywords();
  const last30 = getLast30Days();
  const todayLog = getTodayLog();
  const pct = todayLog?.productivityPct ?? 0;

  async function loadInsights() {
    setLoading(true);
    setError('');
    try {
      const result = await generateInsights(keywords, last30, pct);
      setInsights(result);
    } catch (e) {
      setError('Failed to generate insights: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  const toneInfo = insights ? (TONE_CONFIG[insights.overallTone] || TONE_CONFIG.average) : null;

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">💡 Insights</h1>
          <p className="page-subtitle">AI-generated analysis of your behavior patterns</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={loadInsights}
          disabled={loading}
        >
          {loading ? '⟳ Generating...' : insights ? '🔄 Regenerate' : '✨ Generate Insights'}
        </button>
      </div>

      {!todayLog && !insights && (
        <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>💡</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Complete today's quiz first</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Insights are most accurate after completing your daily check-in
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '14px 20px', marginBottom: 20, color: 'var(--accent-red)', fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: 64 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🧠</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>AI is analyzing your data...</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>This takes a few seconds</p>
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360, margin: '24px auto 0' }}>
            {['Reading keyword history...', 'Detecting patterns...', 'Crafting honest feedback...'].map((t, i) => (
              <div key={i} className="skeleton" style={{ height: 14, borderRadius: 8, animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}

      {!insights && !loading && (
        <div className="card card-gradient" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 80, marginBottom: 24 }} className="animate-float">🔍</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Get Your AI Insights</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 400, margin: '0 auto 28px' }}>
            The AI will analyze your keyword history, detect patterns in your behavior, and give you honest — sometimes harsh — feedback to help you grow.
          </p>
          <button className="btn btn-orange btn-lg" onClick={loadInsights}>
            ✨ Generate Insights
          </button>
        </div>
      )}

      {insights && !loading && (
        <div>
          {/* Overall Tone Banner */}
          <div style={{
            background: toneInfo.bg,
            border: `1px solid ${toneInfo.color}44`,
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}>
            <span style={{ fontSize: 40 }}>{toneInfo.icon}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: toneInfo.color }}>{toneInfo.label}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                Based on your recent behavior across {keywords.length} tracked keywords
              </div>
            </div>
          </div>

          {/* Motivation Message */}
          {insights.motivation && (
            <div className="insight-card motivation" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <span style={{ fontSize: 28 }}>💬</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent-purple-light)', marginBottom: 6 }}>MOTIVATION</div>
                  <div style={{ fontSize: 15, fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    "{insights.motivation}"
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Strict Warnings */}
          {insights.warnings && insights.warnings.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f87171', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>
                🚨 Strict Warnings — Read Carefully
              </div>
              {insights.warnings.map((w, i) => (
                <div key={i} className="insight-card critical">
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 20, marginTop: 2 }}>⚠️</span>
                    <div style={{ fontSize: 14, color: '#fca5a5', lineHeight: 1.6, fontWeight: 500 }}>{w}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Insights */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>
              🔍 Behavior Insights
            </div>
            {insights.insights?.map((ins, i) => (
              <div key={i} className="insight-card info">
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 18, color: 'var(--accent-blue)' }}>◎</span>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>{ins}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Suggestions */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-green)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>
              🌱 Actionable Suggestions
            </div>
            {insights.suggestions?.map((sug, i) => (
              <div key={i} className="insight-card success">
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 18, color: 'var(--accent-green)' }}>→</span>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>{sug}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <button className="btn btn-ghost" onClick={loadInsights}>
              🔄 Regenerate Insights
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
