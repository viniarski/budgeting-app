"use client"

import { createContext, ReactNode, useContext, useEffect, useState } from "react"

interface SidebarContextValue {
  isSidebarHidden: boolean
  hideSidebar: () => void
  showSidebar: () => void
  toggleSidebar: () => void
}

const SIDEBAR_STORAGE_KEY = "uniwallet-sidebar-hidden"

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isSidebarHidden, setIsSidebarHidden] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  })

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-sidebar",
      isSidebarHidden ? "hidden" : "shown"
    )
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isSidebarHidden))
  }, [isSidebarHidden])

  function hideSidebar() {
    setIsSidebarHidden(true)
  }

  function showSidebar() {
    setIsSidebarHidden(false)
  }

  function toggleSidebar() {
    setIsSidebarHidden((prev) => !prev)
  }

  return (
    <SidebarContext.Provider
      value={{ isSidebarHidden, hideSidebar, showSidebar, toggleSidebar }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
