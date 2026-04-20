const SETTINGS_KEY = 'prodtrack_settings';

const DEFAULT_SETTINGS = {
  name: '',
  apiKey: '',
  onboardingComplete: false,
  createdAt: null,
};

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(updates) {
  const current = getSettings();
  const next = { ...current, ...updates };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  return next;
}

export function isOnboardingComplete() {
  return getSettings().onboardingComplete;
}

export function completeOnboarding(name, apiKey) {
  return saveSettings({
    name,
    apiKey,
    onboardingComplete: true,
    createdAt: new Date().toISOString(),
  });
}

export function resetApp() {
  localStorage.clear();
}
