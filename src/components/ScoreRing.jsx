import React, { useEffect, useState } from 'react';
import { getScoreColor } from '../engine/scoringEngine';

export default function ScoreRing({ percentage = 0, size = 180 }) {
  const [displayPct, setDisplayPct] = useState(0);
  const scoreInfo = getScoreColor(percentage);

  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayPct / 100) * circumference;
  const center = size / 2;

  useEffect(() => {
    // Animate the percentage
    let start = 0;
    const end = percentage;
    const duration = 1200;
    const step = (end / duration) * 16;
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setDisplayPct(Math.round(start));
      if (start >= end) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [percentage]);

  return (
    <div className="score-ring-container">
      <div className="score-ring-wrapper" style={{ width: size, height: size }}>
        <svg
          className="score-ring-svg"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background ring */}
          <circle
            className="score-ring-bg"
            cx={center}
            cy={center}
            r={radius}
          />
          {/* Progress ring */}
          <circle
            className="score-ring-fill"
            cx={center}
            cy={center}
            r={radius}
            style={{
              stroke: scoreInfo.color,
              strokeDasharray: circumference,
              strokeDashoffset: offset,
              filter: `drop-shadow(0 0 8px ${scoreInfo.color}88)`,
            }}
          />
        </svg>
        <div className="score-ring-center">
          <div className="score-ring-pct" style={{ color: scoreInfo.color }}>
            {displayPct}%
          </div>
          <div className="score-ring-label">Productivity</div>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <span style={{
          fontSize: 24,
          display: 'block',
          marginBottom: 4,
          filter: `drop-shadow(0 0 8px ${scoreInfo.color})`,
        }}>
          {scoreInfo.emoji}
        </span>
        <span style={{
          fontSize: 14,
          fontWeight: 700,
          color: scoreInfo.color,
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}>
          {scoreInfo.label}
        </span>
      </div>
    </div>
  );
}
