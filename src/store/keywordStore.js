const KEYWORDS_KEY = 'prodtrack_keywords';
const MAX_KEYWORDS = 25;

export const KEYWORD_TYPES = {
  STREAK: 'streak',
  DISTRACTION: 'distraction',
  SUGGESTION: 'suggestion',
  FOLLOWUP: 'followup',
};

export const DEFAULT_KEYWORDS = [
  { name: 'leetcode', type: 'streak', priority: 8, streak: 0, missCount: 0, lastSeen: null },
  { name: 'gym', type: 'streak', priority: 7, streak: 0, missCount: 0, lastSeen: null },
  { name: 'study', type: 'streak', priority: 9, streak: 0, missCount: 0, lastSeen: null },
  { name: 'project', type: 'streak', priority: 8, streak: 0, missCount: 0, lastSeen: null },
  { name: 'sleep_schedule', type: 'streak', priority: 6, streak: 0, missCount: 0, lastSeen: null },
  { name: 'scrolling', type: 'distraction', priority: 7, streak: 0, missCount: 0, lastSeen: null },
  { name: 'junk_food', type: 'distraction', priority: 5, streak: 0, missCount: 0, lastSeen: null },
  { name: 'procrastination', type: 'distraction', priority: 8, streak: 0, missCount: 0, lastSeen: null },
  { name: 'revision', type: 'suggestion', priority: 5, streak: 0, missCount: 0, lastSeen: null },
  { name: 'consistency', type: 'suggestion', priority: 6, streak: 0, missCount: 0, lastSeen: null },
];

export function getKeywords() {
  try {
    const raw = localStorage.getItem(KEYWORDS_KEY);
    if (!raw) return [...DEFAULT_KEYWORDS];
    return JSON.parse(raw);
  } catch {
    return [...DEFAULT_KEYWORDS];
  }
}

export function saveKeywords(keywords) {
  // Sort by priority desc, trim to max
  const sorted = [...keywords].sort((a, b) => b.priority - a.priority).slice(0, MAX_KEYWORDS);
  localStorage.setItem(KEYWORDS_KEY, JSON.stringify(sorted));
  return sorted;
}

export function addKeyword(kw) {
  const keywords = getKeywords();
  if (keywords.find(k => k.name.toLowerCase() === kw.name.toLowerCase())) {
    throw new Error('Keyword already exists');
  }
  const newKw = {
    name: kw.name.toLowerCase().replace(/\s+/g, '_'),
    type: kw.type || 'streak',
    priority: kw.priority || 5,
    streak: 0,
    missCount: 0,
    lastSeen: null,
  };
  return saveKeywords([...keywords, newKw]);
}

export function updateKeyword(name, updates) {
  const keywords = getKeywords();
  const idx = keywords.findIndex(k => k.name === name);
  if (idx === -1) throw new Error('Keyword not found');
  keywords[idx] = { ...keywords[idx], ...updates };
  return saveKeywords(keywords);
}

export function deleteKeyword(name) {
  const keywords = getKeywords();
  return saveKeywords(keywords.filter(k => k.name !== name));
}

export function getStreakKeywords() {
  return getKeywords().filter(k => k.type === 'streak');
}

export function getDistractionKeywords() {
  return getKeywords().filter(k => k.type === 'distraction');
}

export function getSuggestionKeywords() {
  return getKeywords().filter(k => k.type === 'suggestion');
}

export function getTopKeywords(n = 6) {
  return getStreakKeywords().sort((a, b) => b.priority - a.priority).slice(0, n);
}

export function getWeakAreas() {
  return getKeywords().filter(k => k.type === 'streak' && (k.streak === 0 || k.missCount >= 2));
}

export function initializeKeywords(customKeywords) {
  if (customKeywords && customKeywords.length > 0) {
    saveKeywords(customKeywords);
  } else {
    saveKeywords(DEFAULT_KEYWORDS);
  }
}
