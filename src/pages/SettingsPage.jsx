import React, { useState } from 'react';
import { getSettings, saveSettings, resetApp } from '../store/settingsStore';

export default function SettingsPage({ onNavigate }) {
  const [settings, setSettings] = useState(getSettings());
  const [name, setName] = useState(settings.name);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    saveSettings({ name, apiKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    if (confirm('⚠️ This will erase ALL your data (logs, keywords, settings). Are you sure?')) {
      resetApp();
      window.location.reload();
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">⚙️ Settings</h1>
        <p className="page-subtitle">Manage your profile and API configuration</p>
      </div>

      {saved && (
        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius-md)', padding: '12px 18px', marginBottom: 20, color: 'var(--accent-green)', fontSize: 14 }}>
          ✅ Settings saved successfully!
        </div>
      )}

      {/* Profile */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>👤 Profile</div>
        <div className="input-group">
          <label className="input-label">Your Name</label>
          <input className="input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
        </div>
      </div>

      {/* API Key */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title" style={{ marginBottom: 8 }}>🔑 Groq API Key (Llama 3)</div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Update your key to connect to Groq's high-speed Llama 3 models.
          Get a free key at{' '}
          <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-purple-light)' }}>
            console.groq.com
          </a>
        </p>
        <div style={{ position: 'relative' }}>
          <input
            className="input"
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="gsk_..."
            style={{ paddingRight: 48 }}
          />
          <button
            onClick={() => setShowKey(!showKey)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)' }}
          >{showKey ? '🙈' : '👁️'}</button>
        </div>

        {/* Model info */}
        <div style={{ marginTop: 14, padding: '12px 16px', background: 'rgba(124,58,237,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            🤖 <strong style={{ color: 'var(--text-primary)' }}>Model used:</strong> Llama 3.3 70B (llama-3.3-70b-versatile) via Groq
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            Groq provides lightning-fast inference for open source models.
          </div>
        </div>
      </div>

      {/* Save button */}
      <button className="btn btn-primary w-full" style={{ marginBottom: 32 }} onClick={handleSave}>
        💾 Save Settings
      </button>

      {/* Danger Zone */}
      <div style={{ borderTop: '1px solid rgba(239,68,68,0.2)', paddingTop: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent-red)', marginBottom: 12 }}>
          ⚠️ Danger Zone
        </div>
        <div className="card" style={{ borderColor: 'rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.04)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Reset All Data</div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
            Permanently delete all your logs, keywords, and settings. This cannot be undone.
          </p>
          <button className="btn btn-danger" onClick={handleReset}>🗑️ Reset Everything</button>
        </div>
      </div>
    </div>
  );
}
