"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Menu,
  X,
  User,
  Settings,
  PiggyBank,
  ChartColumn,
  LogOut,
  ChevronRight,
} from "lucide-react"
import { useBudget } from "@/contexts/budget-context"
import { useTheme } from "@/contexts/theme-context"
import LogoMark from "@/components/logo-mark"

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const { state, dispatch, isHydrated } = useBudget()
  const { theme } = useTheme()

  function handleReset() {
    dispatch({ type: "RESET" })
    setMenuOpen(false)
  }

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark
              className={`h-6 w-6 ${theme === "light" ? "text-black" : "text-accent"}`}
              aria-hidden
            />
            <span className="text-base font-bold">UniWallet</span>
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-card"
          >
            {menuOpen ? (
              <X className="h-5 w-5 text-foreground" />
            ) : (
              <Menu className="h-5 w-5 text-foreground" />
            )}
          </button>
        </div>
      </header>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Slide-out menu */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-72 border-l border-border bg-background transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <span className="text-sm font-semibold">Menu</span>
          <button
            onClick={() => setMenuOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-card"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Profile section */}
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Student</p>
              <p className="text-xs text-muted">
                {isHydrated && state.budget
                  ? state.budget.name
                  : "Not set up yet"}
              </p>
            </div>
          </div>

          {/* Menu items */}
          <nav className="space-y-1">
            <Link
              href="/save-smart"
              onClick={() => setMenuOpen(false)}
              className={`flex items-center justify-between rounded-xl px-3 py-3 text-sm transition-colors ${
                pathname === "/save-smart"
                  ? "bg-accent/10 text-accent"
                  : "text-foreground hover:bg-card"
              }`}
            >
              <div className="flex items-center gap-3">
                <PiggyBank className="h-4 w-4 text-muted" />
                <span>Save Smart</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted" />
            </Link>

            <Link
              href="/track-spend"
              onClick={() => setMenuOpen(false)}
              className={`flex items-center justify-between rounded-xl px-3 py-3 text-sm transition-colors ${
                pathname === "/track-spend"
                  ? "bg-accent/10 text-accent"
                  : "text-foreground hover:bg-card"
              }`}
            >
              <div className="flex items-center gap-3">
                <ChartColumn className="h-4 w-4 text-muted" />
                <span>Track Spend</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted" />
            </Link>

            <Link
              href="/settings"
              onClick={() => setMenuOpen(false)}
              className={`flex items-center justify-between rounded-xl px-3 py-3 text-sm transition-colors ${
                pathname === "/settings"
                  ? "bg-accent/10 text-accent"
                  : "text-foreground hover:bg-card"
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4 text-muted" />
                <span>Settings</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted" />
            </Link>

            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className={`flex items-center justify-between rounded-xl px-3 py-3 text-sm transition-colors ${
                pathname === "/"
                  ? "bg-accent/10 text-accent"
                  : "text-foreground hover:bg-card"
              }`}
            >
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted" />
                <span>Profile</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted" />
            </Link>
          </nav>

          {/* Reset at the bottom */}
          {isHydrated && state.isOnboarded && (
            <div className="mt-8 border-t border-border pt-4">
              <button
                onClick={handleReset}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted transition-colors hover:bg-card hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span>Reset Budget</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
