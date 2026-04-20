const LOGS_KEY = 'prodtrack_logs';
const QUIZ_STATUS_KEY = 'prodtrack_quiz_status';

export function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

export function getAllLogs() {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function getTodayLog() {
  const logs = getAllLogs();
  return logs[getTodayDate()] || null;
}

export function getLogForDate(date) {
  const logs = getAllLogs();
  return logs[date] || null;
}

export function saveLog(date, behaviorMap, score, productivityPct) {
  const logs = getAllLogs();
  logs[date] = {
    date,
    behavior: behaviorMap,
    score,
    productivityPct,
    completedAt: new Date().toISOString(),
  };
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  return logs[date];
}

export function getLast30Days() {
  const logs = getAllLogs();
  const result = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      log: logs[dateStr] || null,
    });
  }
  return result;
}

export function getLast7Days() {
  const logs = getAllLogs();
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      log: logs[dateStr] || null,
    });
  }
  return result;
}

export function isQuizDoneToday() {
  try {
    const raw = localStorage.getItem(QUIZ_STATUS_KEY);
    if (!raw) return false;
    const status = JSON.parse(raw);
    return status.date === getTodayDate() && status.done === true;
  } catch {
    return false;
  }
}

export function markQuizDoneToday() {
  localStorage.setItem(QUIZ_STATUS_KEY, JSON.stringify({ date: getTodayDate(), done: true }));
}

export function getAverageProductivity() {
  const logs = Object.values(getAllLogs());
  if (logs.length === 0) return 0;
  const sum = logs.reduce((acc, l) => acc + (l.productivityPct || 0), 0);
  return Math.round(sum / logs.length);
}

export function getTotalDaysTracked() {
  return Object.keys(getAllLogs()).length;
}

export function getCurrentStreak() {
  let streak = 0;
  const d = new Date();
  while (true) {
    const dateStr = d.toISOString().split('T')[0];
    const log = getLogForDate(dateStr);
    if (!log) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
