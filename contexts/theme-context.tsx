"use client"

import { createContext, ReactNode, useContext, useEffect, useState } from "react"

type ThemeMode = "dark" | "light"

const THEME_STORAGE_KEY = "uniwallet-theme"

interface ThemeContextValue {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark"
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return stored === "light" || stored === "dark" ? stored : "dark"
  })

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  function setTheme(nextTheme: ThemeMode) {
    setThemeState(nextTheme)
    document.documentElement.setAttribute("data-theme", nextTheme)
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
