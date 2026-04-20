import { getKeywords, updateKeyword, saveKeywords } from '../store/keywordStore';

export function calculateScore(questionsAndAnswers, behaviorMap, keywords) {
  const streakKeywords = keywords.filter(k => k.type === 'streak');
  const distractionKeywords = keywords.filter(k => k.type === 'distraction');

  let actualScore = 0;
  let maxScore = 0;

  // Q1-6: Streak scoring
  const streakQAs = questionsAndAnswers.filter(qa => qa.type === 'streak');
  for (const qa of streakQAs) {
    for (const kwName of qa.keywords) {
      const kw = streakKeywords.find(k => k.name === kwName);
      if (!kw) continue;
      maxScore += kw.priority;
      const behavior = behaviorMap[kwName];
      if (behavior === 'done') {
        actualScore += kw.priority;
      }
    }
  }

  // Q7-8: Distraction penalty (Day 2+)
  const distractionQAs = questionsAndAnswers.filter(qa => qa.type === 'distraction');
  const allLogs = JSON.parse(localStorage.getItem('prodtrack_logs') || '{}');
  const logCount = Object.keys(allLogs).length;

  for (const qa of distractionQAs) {
    for (const kwName of qa.keywords) {
      const kw = distractionKeywords.find(k => k.name === kwName);
      if (!kw) continue;
      const behavior = behaviorMap[kwName];
      if (behavior === 'done' && logCount >= 1) {
        // They indulged — negative mark
        actualScore -= Math.floor(kw.priority / 2);
      }
    }
  }

  // Ensure no negative scores
  actualScore = Math.max(0, actualScore);
  if (maxScore === 0) maxScore = 1;

  const productivityPct = Math.round((actualScore / maxScore) * 100);

  return {
    actualScore,
    maxScore,
    productivityPct: Math.min(100, productivityPct),
  };
}

export function getScoreColor(pct) {
  if (pct >= 70) return { color: '#22c55e', label: 'Excellent', emoji: '🔥', class: 'score-excellent' };
  if (pct >= 40) return { color: '#f59e0b', label: 'Average', emoji: '⚠️', class: 'score-average' };
  return { color: '#ef4444', label: 'Poor', emoji: '❌', class: 'score-poor' };
}

export function evolveKeywords(behaviorMap) {
  const keywords = getKeywords();
  const updated = keywords.map(kw => {
    const behavior = behaviorMap[kw.name];
    if (!behavior || behavior === 'skipped') {
      return { ...kw, lastSeen: new Date().toISOString().split('T')[0] };
    }

    let { streak, missCount, priority } = kw;

    if (kw.type === 'streak') {
      if (behavior === 'done') {
        streak++;
        missCount = 0;
        // Reward consistency - slight priority normalization
        if (streak > 7 && priority > 5) priority = Math.max(5, priority - 1);
      } else if (behavior === 'missed') {
        streak = 0;
        missCount++;
        // Increase priority for missed habits
        if (missCount >= 3) priority = Math.min(10, priority + 2);
        else if (missCount >= 2) priority = Math.min(10, priority + 1);
      }
    } else if (kw.type === 'distraction') {
      if (behavior === 'done') {
        // Indulged in distraction
        missCount++;
        if (missCount >= 3) priority = Math.min(10, priority + 1);
      } else {
        // Avoided distraction - good!
        streak++;
        missCount = Math.max(0, missCount - 1);
      }
    }

    return {
      ...kw,
      streak,
      missCount,
      priority,
      lastSeen: new Date().toISOString().split('T')[0],
    };
  });

  saveKeywords(updated);
  return updated;
}
