from pathlib import Path

source_path = Path('.github/scripts/apply_dark_mode.py')
source = source_path.read_text(encoding='utf-8')

start = source.index('THEME_PATH.write_text(')
end_marker = '\n\n# ---------------------------------------------------------------------------\n# Inicialización PrimeVue y tema antes del montaje.'
end = source.index(end_marker, start)

composable = r'''import { computed, ref } from 'vue'

const STORAGE_KEY = 'fm-theme'
const DARK_CLASS = 'fm-dark'
const currentTheme = ref('light')
let initialized = false

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined'

const getStoredTheme = () => {
  if (!isBrowser()) return null
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === 'dark' || value === 'light' ? value : null
  } catch {
    return null
  }
}

const getSystemTheme = () => {
  if (!isBrowser() || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const updateThemeColor = (theme) => {
  if (!isBrowser()) return
  const meta = document.querySelector('meta[name="theme-color"]')
  meta?.setAttribute('content', theme === 'dark' ? '#0b1419' : '#f4f7f8')
}

const applyTheme = (theme, persist = false) => {
  const normalized = theme === 'dark' ? 'dark' : 'light'
  currentTheme.value = normalized
  if (!isBrowser()) return

  document.documentElement.classList.toggle(DARK_CLASS, normalized === 'dark')
  document.documentElement.dataset.theme = normalized
  document.documentElement.style.colorScheme = normalized
  updateThemeColor(normalized)

  if (persist) {
    try {
      window.localStorage.setItem(STORAGE_KEY, normalized)
    } catch {
      // El tema continúa funcionando aunque el almacenamiento esté bloqueado.
    }
  }
}

export const initializeTheme = () => {
  if (!isBrowser()) return 'light'
  if (initialized) return currentTheme.value
  initialized = true

  const initialTheme = getStoredTheme() ?? getSystemTheme()
  applyTheme(initialTheme)

  const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)')
  mediaQuery?.addEventListener?.('change', (event) => {
    if (!getStoredTheme()) applyTheme(event.matches ? 'dark' : 'light')
  })

  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return
    if (event.newValue === 'dark' || event.newValue === 'light') {
      applyTheme(event.newValue)
    }
  })

  return initialTheme
}

export const useTheme = () => {
  if (!initialized) initializeTheme()

  const isDark = computed(() => currentTheme.value === 'dark')
  const setTheme = (theme) => applyTheme(theme, true)
  const toggleTheme = () => setTheme(isDark.value ? 'light' : 'dark')

  return {
    theme: computed(() => currentTheme.value),
    isDark,
    setTheme,
    toggleTheme
  }
}
'''

replacement = "THEME_PATH.write_text(" + repr(composable) + ", encoding='utf-8')"
patched = source[:start] + replacement + source[end:]

compile(patched, str(source_path), 'exec')
exec(compile(patched, str(source_path), 'exec'), {'__name__': '__main__'})
