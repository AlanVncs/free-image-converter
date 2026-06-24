import { useEffect, useState } from 'react'
import {
  applyTheme,
  getStoredTheme,
  setThemePreference,
  type ThemePreference,
} from '../lib/theme'

export function useTheme() {
  const [theme, setTheme] = useState<ThemePreference>(() => getStoredTheme())

  useEffect(() => {
    setThemePreference(theme)
  }, [theme])

  useEffect(() => {
    if (theme !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('system')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [theme])

  return { theme, setTheme }
}
