import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { getLast30Days, getLast7Days } from '../store/dailyLogStore';
import { getKeywords } from '../store/keywordStore';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const CHART_DEFAULTS = {
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: '#334155', borderWidth: 1, padding: 10 } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 11 } } },
    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 11 } } },
  },
  responsive: true,
  maintainAspectRatio: false,
};

export default function AnalyticsPage() {
  const [last30] = useState(getLast30Days());
  const [keywords] = useState(getKeywords());

  const daysWithData = last30.filter(d => d.log !== null);
  const hasData = daysWithData.length > 0;

  // Line chart data: daily productivity
  const lineLabels = last30.map(d => {
    const date = new Date(d.date + 'T00:00:00');
    return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  });
  const lineData = last30.map(d => d.log?.productivityPct ?? null);

  // Bar chart: keyword streaks
  const streakKeywords = keywords.filter(k => k.type === 'streak').slice(0, 8);
  const barLabels = streakKeywords.map(k => k.name.replace(/_/g, ' '));
  const barStreaks = streakKeywords.map(k => k.streak);
  const barMisses = streakKeywords.map(k => k.missCount);

  // Doughnut: type distribution
  const streakCount = keywords.filter(k => k.type === 'streak').length;
  const distractCount = keywords.filter(k => k.type === 'distraction').length;
  const suggCount = keywords.filter(k => k.type === 'suggestion').length;

  // Calculate avg score for last 7 days
  const last7 = getLast7Days();
  const last7Avg = Math.round(last7.filter(d => d.log).reduce((s, d) => s + d.log.productivityPct, 0) / Math.max(1, last7.filter(d => d.log).length));
  const bestDay = daysWithData.reduce((best, d) => (!best || d.log.productivityPct > best.log.productivityPct) ? d : best, null);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">📊 Analytics</h1>
        <p className="page-subtitle">Your productivity trends over time</p>
      </div>

      {!hasData && (
        <div className="card" style={{ textAlign: 'center', padding: 64 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📈</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No data yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Complete your daily quiz to see analytics here. Data appears after your first session.
          </p>
        </div>
      )}

      {hasData && (
        <>
          {/* Summary Stats */}
          <div className="stat-grid" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>{daysWithData.length}</div>
              <div className="stat-label">Days Tracked</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-value" style={{ color: 'var(--accent-purple-light)' }}>{last7Avg}%</div>
              <div className="stat-label">7-Day Avg</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-value" style={{ color: 'var(--accent-green)' }}>
                {bestDay?.log?.productivityPct ?? 0}%
              </div>
              <div className="stat-label">Best Day</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔑</div>
              <div className="stat-value" style={{ color: 'var(--accent-yellow)' }}>{keywords.length}</div>
              <div className="stat-label">Active Keywords</div>
            </div>
          </div>

          {/* Line Chart */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-header">
              <div className="section-title">📈 Daily Productivity (30 Days)</div>
              <div className="section-badge">{daysWithData.length} sessions</div>
            </div>
            <div className="chart-container">
              <Line
                data={{
                  labels: lineLabels,
                  datasets: [{
                    data: lineData,
                    borderColor: '#7c3aed',
                    backgroundColor: 'rgba(124,58,237,0.08)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: lineData.map(v => v === null ? 'transparent' : v >= 70 ? '#22c55e' : v >= 40 ? '#f59e0b' : '#ef4444'),
                    pointRadius: lineData.map(v => v === null ? 0 : 4),
                    pointHoverRadius: 6,
                    spanGaps: true,
                  }],
                }}
                options={{
                  ...CHART_DEFAULTS,
                  scales: {
                    ...CHART_DEFAULTS.scales,
                    y: { ...CHART_DEFAULTS.scales.y, min: 0, max: 100, ticks: { ...CHART_DEFAULTS.scales.y.ticks, callback: v => v + '%' } },
                  },
                  plugins: {
                    ...CHART_DEFAULTS.plugins,
                    tooltip: {
                      ...CHART_DEFAULTS.plugins.tooltip,
                      callbacks: { label: ctx => ` ${ctx.raw !== null ? ctx.raw + '%' : 'No data'}` },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Bar + Doughnut row */}
          <div className="grid-2">
            {/* Streak Bar Chart */}
            <div className="card">
              <div className="section-header">
                <div className="section-title">🔥 Keyword Streaks</div>
              </div>
              <div className="chart-container" style={{ height: 240 }}>
                <Bar
                  data={{
                    labels: barLabels,
                    datasets: [
                      {
                        label: 'Current Streak',
                        data: barStreaks,
                        backgroundColor: barStreaks.map(s => s > 5 ? 'rgba(34,197,94,0.7)' : s > 2 ? 'rgba(124,58,237,0.7)' : 'rgba(249,115,22,0.7)'),
                        borderRadius: 6,
                        borderSkipped: false,
                      },
                    ],
                  }}
                  options={{
                    ...CHART_DEFAULTS,
                    plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } },
                    scales: {
                      x: { ...CHART_DEFAULTS.scales.x, ticks: { ...CHART_DEFAULTS.scales.x.ticks, maxRotation: 30 } },
                      y: { ...CHART_DEFAULTS.scales.y, min: 0, ticks: { stepSize: 1 } },
                    },
                  }}
                />
              </div>
            </div>

            {/* Category Doughnut */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="section-header" style={{ width: '100%' }}>
                <div className="section-title">🥧 Keyword Mix</div>
              </div>
              <div style={{ width: 200, height: 200, position: 'relative' }}>
                <Doughnut
                  data={{
                    labels: ['Streak', 'Distraction', 'Suggestion'],
                    datasets: [{
                      data: [streakCount, distractCount, suggCount],
                      backgroundColor: ['rgba(124,58,237,0.8)', 'rgba(239,68,68,0.8)', 'rgba(6,182,212,0.8)'],
                      borderColor: ['#7c3aed', '#ef4444', '#06b6d4'],
                      borderWidth: 2,
                      hoverOffset: 4,
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                      legend: { display: true, position: 'bottom', labels: { color: '#94a3b8', font: { size: 12 }, padding: 16 } },
                      tooltip: CHART_DEFAULTS.plugins.tooltip,
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Miss count warning */}
          {streakKeywords.some(k => k.missCount >= 2) && (
            <div className="card" style={{ marginTop: 24, borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
              <div className="section-title" style={{ color: '#f87171', marginBottom: 12 }}>⚠️ At-Risk Habits</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {streakKeywords.filter(k => k.missCount >= 2).map(k => (
                  <div key={k.name} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                    background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(239,68,68,0.25)',
                  }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{k.name.replace(/_/g, ' ')}</span>
                    <span style={{ fontSize: 12, color: '#f87171' }}>missed {k.missCount}× in a row</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
