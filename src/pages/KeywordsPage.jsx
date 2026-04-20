import React, { useState } from 'react';
import { getKeywords, addKeyword, updateKeyword, deleteKeyword, KEYWORD_TYPES } from '../store/keywordStore';

const TYPE_CONFIG = {
  streak: { label: 'Streak', icon: '🔥', color: 'streak', desc: 'Habits you want to build' },
  distraction: { label: 'Distraction', icon: '⚠️', color: 'distraction', desc: 'Things to avoid' },
  suggestion: { label: 'Suggestion', icon: '💡', color: 'suggestion', desc: 'Growth areas' },
};

const MAX_KEYWORDS = 25;

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState(getKeywords());
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('streak');
  const [newPriority, setNewPriority] = useState(6);
  const [filterType, setFilterType] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function reload() { setKeywords(getKeywords()); }

  function handleAdd() {
    if (!newName.trim()) { setError('Enter a keyword name'); return; }
    if (keywords.length >= MAX_KEYWORDS) { setError(`Max ${MAX_KEYWORDS} keywords allowed`); return; }
    try {
      addKeyword({ name: newName.trim(), type: newType, priority: newPriority });
      reload();
      setNewName('');
      setNewPriority(6);
      setError('');
      setSuccess('Keyword added! It will appear in tomorrow\'s quiz.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.message);
    }
  }

  function handleDelete(name) {
    if (confirm(`Remove keyword "${name}"?`)) {
      deleteKeyword(name);
      reload();
    }
  }

  function handlePriorityChange(name, priority) {
    updateKeyword(name, { priority });
    reload();
  }

  function handleTypeChange(name, type) {
    updateKeyword(name, { type });
    reload();
  }

  const filtered = filterType === 'all' ? keywords : keywords.filter(k => k.type === filterType);
  const capacityPct = Math.round((keywords.length / MAX_KEYWORDS) * 100);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🔑 Keywords</h1>
        <p className="page-subtitle">Manage the habits, distractions, and growth areas the AI tracks</p>
      </div>

      {/* Capacity bar */}
      <div className="card" style={{ marginBottom: 24, padding: '16px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Keyword Capacity</span>
          <span style={{ fontSize: 13, color: keywords.length === MAX_KEYWORDS ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
            {keywords.length} / {MAX_KEYWORDS}
          </span>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 3,
            width: `${capacityPct}%`,
            background: capacityPct >= 90 ? 'var(--accent-red)' : capacityPct >= 70 ? 'var(--accent-yellow)' : 'var(--accent-purple)',
            transition: 'width 0.4s ease',
          }} />
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
            <span key={type} style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {cfg.icon} {keywords.filter(k => k.type === type).length} {cfg.label}
            </span>
          ))}
        </div>
      </div>

      {/* Add Keyword */}
      <div className="card card-glow-purple" style={{ marginBottom: 24 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>➕ Add New Keyword</div>
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--accent-red)', fontSize: 13, marginBottom: 12 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--accent-green)', fontSize: 13, marginBottom: 12 }}>
            ✅ {success}
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            className="input"
            style={{ flex: '2 1 200px' }}
            type="text"
            placeholder="e.g. morning_walk"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <select
            className="input"
            style={{ flex: '1 1 140px' }}
            value={newType}
            onChange={e => setNewType(e.target.value)}
          >
            {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
              <option key={type} value={type}>{cfg.icon} {cfg.label}</option>
            ))}
          </select>
          <div style={{ flex: '1 1 140px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Priority: {newPriority}/10</span>
            <input
              type="range" min={1} max={10} value={newPriority}
              onChange={e => setNewPriority(Number(e.target.value))}
              style={{ accentColor: 'var(--accent-purple)', width: '100%' }}
            />
          </div>
          <button className="btn btn-primary" onClick={handleAdd} disabled={keywords.length >= MAX_KEYWORDS}>
            Add Keyword
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all', 'streak', 'distraction', 'suggestion'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            style={{
              padding: '7px 16px', borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border)',
              background: filterType === type ? 'var(--accent-purple)' : 'var(--bg-card)',
              color: filterType === type ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif',
              transition: 'all 0.2s ease',
            }}
          >
            {type === 'all' ? '🔍 All' : TYPE_CONFIG[type].icon + ' ' + TYPE_CONFIG[type].label}
          </button>
        ))}
      </div>

      {/* Keyword List */}
      <div className="keyword-list">
        {filtered.map(kw => (
          <div key={kw.name} className="keyword-row">
            {/* Name + type */}
            <span className={`keyword-chip ${kw.type}`} style={{ minWidth: 'auto' }}>
              {TYPE_CONFIG[kw.type]?.icon}
            </span>
            <div className="keyword-row-name">
              {kw.name.replace(/_/g, ' ')}
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  🔥 Streak: {kw.streak}
                </span>
                <span style={{ fontSize: 11, color: kw.missCount >= 3 ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                  ❌ Missed: {kw.missCount}
                </span>
              </div>
            </div>

            {/* Priority bar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, minWidth: 80 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>P:{kw.priority}/10</span>
              <div className="keyword-priority-bar">
                <div className="keyword-priority-fill" style={{
                  width: `${kw.priority * 10}%`,
                  background: kw.priority >= 8 ? 'var(--accent-orange)' : kw.priority >= 5 ? 'var(--accent-purple)' : 'var(--accent-cyan)',
                }} />
              </div>
            </div>

            {/* Type select */}
            <select
              className="input"
              style={{ width: 130, padding: '6px 10px', fontSize: 12 }}
              value={kw.type}
              onChange={e => handleTypeChange(kw.name, e.target.value)}
            >
              {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
                <option key={type} value={type}>{cfg.icon} {cfg.label}</option>
              ))}
            </select>

            {/* Priority knob */}
            <input
              type="range" min={1} max={10} value={kw.priority}
              onChange={e => handlePriorityChange(kw.name, Number(e.target.value))}
              style={{ accentColor: 'var(--accent-purple)', width: 80 }}
              title={`Priority: ${kw.priority}`}
            />

            {/* Delete */}
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleDelete(kw.name)}
              title="Remove keyword"
            >
              🗑
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 14 }}>
            No keywords of this type yet. Add some above!
          </div>
        )}
      </div>
    </div>
  );
}
