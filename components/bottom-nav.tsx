"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Plus,
  Calculator,
  Tag,
  PiggyBank,
  ChartColumn,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useSidebar } from "@/contexts/sidebar-context"

const tabs = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/add", label: "Add", icon: Plus },
  { href: "/calculator", label: "Calculator", icon: Calculator },
  { href: "/marketplace", label: "Offers", icon: Tag },
  { href: "/save-smart", label: "Save Smart", icon: PiggyBank, desktopOnly: true },
  { href: "/track-spend", label: "Track Spend", icon: ChartColumn, desktopOnly: true },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { isSidebarHidden, hideSidebar, showSidebar } = useSidebar()
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
    <>
      <nav className="desktop-sidebar fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card safe-bottom md:top-0 md:right-auto md:w-56 md:border-r md:border-t-0 md:bg-card/95 md:backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around md:mx-0 md:h-full md:max-w-none md:flex-col md:items-stretch md:justify-start md:gap-2 md:px-3 md:pt-20">
        {tabs.map((tab) => {
          const isActive = isTabActive(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`desktop-sidebar-link flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors md:flex-row md:gap-3 md:rounded-xl md:px-4 md:py-3 md:text-sm ${
                tab.desktopOnly ? "hidden md:flex" : ""
              } ${
                isActive
                  ? "text-accent md:bg-accent/10"
                  : "text-muted hover:text-foreground md:hover:bg-background/70"
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
              <span className="desktop-sidebar-label">{tab.label}</span>
            </Link>
          )
        })}

        <div className="hidden md:mt-auto md:flex md:justify-center md:pb-4">
          <button
            onClick={isSidebarHidden ? showSidebar : hideSidebar}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted transition-colors hover:border-accent/40 hover:text-accent"
            aria-label={isSidebarHidden ? "Expand side menu" : "Collapse side menu"}
          >
            {isSidebarHidden ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
        </div>
      </nav>
    </>
  )
}
