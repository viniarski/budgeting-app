"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Plus, Calculator, Tag } from "lucide-react"

const tabs = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/add", label: "Add", icon: Plus },
  { href: "/calculator", label: "Calculator", icon: Calculator },
  { href: "/marketplace", label: "Offers", icon: Tag },
]

export default function BottomNav() {
  const pathname = usePathname()
  const budgetRoutes = [
    "/add",
    "/categories",
    "/history",
    "/goals",
    "/settings",
    "/setup",
  ]

  function matchesRoute(baseRoute: string): boolean {
    return pathname === baseRoute || pathname.startsWith(`${baseRoute}/`)
  }

  function isTabActive(href: string): boolean {
    if (href === "/add") {
      return budgetRoutes.some((route) => matchesRoute(route))
    }
    return matchesRoute(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card safe-bottom">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around">
        {tabs.map((tab) => {
          const isActive = isTabActive(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors ${
                isActive ? "text-accent" : "text-muted hover:text-foreground"
              }`}
            >
              {tab.href === "/add" ? (
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                    isActive
                      ? "border-accent text-accent"
                      : "border-muted text-muted"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                </span>
              ) : (
                <tab.icon className="h-5 w-5" />
              )}
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
