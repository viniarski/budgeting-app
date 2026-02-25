"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useBudget } from "@/contexts/budget-context"
import {
  ArrowRight,
  BadgePercent,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Tag,
  TrendingUp,
} from "lucide-react"

const FEATURE_POINTS = [
  { title: "Plan your budget", icon: ShieldCheck },
  { title: "Track spend live", icon: TrendingUp },
  { title: "Save smarter", icon: PiggyBank },
  { title: "Explore marketplace deals", icon: Tag },
  { title: "Find student offers fast", icon: BadgePercent },
]

export default function WelcomePage() {
  const router = useRouter()
  const { state, isHydrated } = useBudget()

  useEffect(() => {
    if (isHydrated && state.isOnboarded && state.budget) {
      router.replace("/dashboard")
    }
  }, [isHydrated, state.isOnboarded, state.budget, router])

  if (!isHydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="text-sm text-muted">Loading...</span>
      </div>
    )
  }

  if (state.isOnboarded && state.budget) {
    return null
  }

  return (
    <div className="relative isolate min-h-screen w-full overflow-hidden bg-card/40 px-8 pb-10 pt-20 md:px-16 md:pt-28 lg:px-24">
      <div className="pointer-events-none absolute -right-32 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />

      <section className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          <Sparkles className="h-3.5 w-3.5" />
          Welcome to UniWallet
        </div>

        <h1 className="font-heading mt-5 text-4xl font-bold leading-tight md:text-6xl">
          Student money, organized from day one.
        </h1>

        <p className="mt-4 max-w-2xl text-sm text-muted md:text-base">
          Build a realistic budget for your maintenance loan, track every pound, and stay in control
          across the semester.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/setup"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Set Up Your Budget
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-16 w-full max-w-6xl md:mt-20">
        <ul className="space-y-3">
          {FEATURE_POINTS.map((point) => {
            const Icon = point.icon
          return (
            <li key={point.title} className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-background/45 text-accent backdrop-blur-sm">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium">{point.title}</span>
            </li>
          )
        })}
        </ul>
      </section>
    </div>
  )
}
