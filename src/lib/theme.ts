export const THEME_STORAGE_KEY = 'theme'

export type ThemePreference = 'light' | 'dark' | 'system'

export const THEME_OPTIONS: ThemePreference[] = ['light', 'dark', 'system']

export function getStoredTheme(): ThemePreference {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'light'
}

export function isDarkMode(preference: ThemePreference): boolean {
  if (preference === 'dark') return true
  if (preference === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function applyTheme(preference: ThemePreference): void {
  document.documentElement.classList.toggle('dark', isDarkMode(preference))
}

export function initTheme(): ThemePreference {
  const preference = getStoredTheme()
  applyTheme(preference)
  return preference
}

export function setThemePreference(preference: ThemePreference): void {
  localStorage.setItem(THEME_STORAGE_KEY, preference)
  applyTheme(preference)
}
