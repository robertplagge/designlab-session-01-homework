export type Theme = 'dark' | 'light'
const KEY = 'seen-theme'

export function getTheme(): Theme {
  try {
    return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
  }
}

export function applyTheme(theme: Theme) {
  if (theme === 'light') document.documentElement.dataset.theme = 'light'
  else delete document.documentElement.dataset.theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f6f5f1' : '#0b0d10')
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* private mode: theme just won't persist */
  }
}
