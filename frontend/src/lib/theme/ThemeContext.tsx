import { createContext, useCallback, useContext, useState, type ReactNode } from "react"

type Theme = "light" | "dark"

const STORAGE_KEY = "rmp_theme"

type ThemeContextValue = {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

// Temporarily disabled (2026-08-16): too many visual bugs across the
// unaudited 42+ files to ship yet (see docs/specs/phase-7-preferences-dark-mode.md).
// Mechanism kept intact - flip this back to true (and the matching flag in
// index.html's pre-mount script) once the coverage sweep lands. While off,
// theme is pinned to "light" and toggleTheme is a no-op, regardless of any
// "dark" value already sitting in localStorage from before this was disabled.
const DARK_MODE_ENABLED = false

// Simple on/off, matching the Figma source's Dark Mode toggle - not a
// light/dark/system 3-way picker. "System" only applies once, as the
// fallback the pre-React inline script in index.html uses when no explicit
// choice has ever been saved; once the user toggles, that choice persists
// and wins from then on, in this browser, device-wide (no backend field -
// dark mode isn't an account setting, matching every other Preferences row
// on RegularSettingsPage.tsx staying client-side only).
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() =>
    DARK_MODE_ENABLED && document.documentElement.classList.contains("dark") ? "dark" : "light",
  )

  const applyTheme = useCallback((next: Theme) => {
    if (!DARK_MODE_ENABLED) return
    document.documentElement.classList.toggle("dark", next === "dark")
    localStorage.setItem(STORAGE_KEY, next)
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    applyTheme(theme === "dark" ? "light" : "dark")
  }, [theme, applyTheme])

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return ctx
}
