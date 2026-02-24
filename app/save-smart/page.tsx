"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useBudget } from "@/contexts/budget-context"
import {
  calculateDailyAllowance,
  calculateRemaining,
  calculateSpent,
  formatCurrency,
  getDaysRemaining,
} from "@/lib/budget-utils"
import {
  Loader2,
  Sparkles,
  ShieldCheck,
  PiggyBank,
  AlertTriangle,
  ArrowRightLeft,
  Target,
} from "lucide-react"

type TipCandidate = {
  id: string
  text: string
  score: number
}

function getTipTier(score: number): "High" | "Medium" | "Low" {
  if (score >= 85) return "High"
  if (score >= 60) return "Medium"
  return "Low"
}

function getTipTierStyles(_score: number): string {
  return "border-success/25 bg-success/10 text-success"
}

function getTipIcon(id: string, score: number) {
  if (id.includes("overspent") || id.includes("critical") || score >= 85) {
    return AlertTriangle
  }
  if (id.includes("reallocate") || id.includes("savings") || id.includes("fund")) {
    return ArrowRightLeft
  }
  return Target
}

export default function SaveSmartPage() {
  const router = useRouter()
  const { state, isHydrated } = useBudget()
  const { budget, expenses, isOnboarded } = state

  useEffect(() => {
    if (isHydrated && (!isOnboarded || !budget)) {
      router.replace("/setup")
    }
  }, [isHydrated, isOnboarded, budget, router])

  if (!isHydrated || !isOnboarded || !budget) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  const totalSpent = calculateSpent(expenses)
  const totalRemaining = Math.max(0, calculateRemaining(budget, expenses))
  const daysRemaining = getDaysRemaining(budget.endDate)
  const dailyAllowance = Math.max(0, calculateDailyAllowance(budget, expenses))

  const byCategory = budget.categories
    .filter((c) => c.allocated > 0)
    .map((category) => {
      const spent = expenses
        .filter((e) => e.categoryId === category.id)
        .reduce((sum, e) => sum + e.amount, 0)

      return { category, spent }
    })

  const overspent = byCategory
    .filter((item) => item.spent > item.category.allocated)
    .sort((a, b) => b.spent - a.spent)

  const lowUsage = byCategory
    .filter((item) => item.spent < item.category.allocated * 0.35)
    .sort((a, b) => a.spent - b.spent)

  // --- helpers for new tips ---
  const now = new Date()
  const startMs = new Date(budget.startDate).getTime()
  const endMs = new Date(budget.endDate).getTime()
  const totalDuration = Math.max(1, endMs - startMs)
  const elapsed = (now.getTime() - startMs) / totalDuration // 0→1
  const dayOfWeek = now.getDay() // 0=Sun … 6=Sat
  const todayStr = now.toISOString().slice(0, 10)
  const todayExpenses = expenses.filter((e) => e.date.slice(0, 10) === todayStr)

  const candidates: TipCandidate[] = []
  const addTip = (id: string, text: string, score: number) => {
    if (!text || candidates.some((tip) => tip.id === id)) return
    candidates.push({ id, text, score })
  }

  if (overspent.length > 0) {
    const top = overspent[0]
    addTip(
      `overspent-${top.category.id}`,
      `${top.category.name} is over plan by ${formatCurrency(top.spent - top.category.allocated)}. Cap this category for the next 7 days.`,
      100
    )
  }

  if (lowUsage.length > 0) {
    const from = lowUsage[0]
    const reallocate = Math.max(0, from.category.allocated - from.spent) * 0.3
    addTip(
      `reallocate-${from.category.id}`,
      `Move about ${formatCurrency(reallocate)} from ${from.category.name} into Savings or Emergency to protect your remaining budget.`,
      85
    )
  }

  const weeklySave = totalRemaining * 0.12
  addTip(
    "ai-target",
    `AI target: save ${formatCurrency(weeklySave)} this week by keeping daily spend under ${formatCurrency(dailyAllowance * 0.9)}.`,
    75
  )

  const expectedSpent = budget.totalAmount * Math.min(1, elapsed)
  if (totalSpent > expectedSpent && expectedSpent > 0) {
    addTip(
      "spend-velocity-high",
      "You're spending faster than planned. Slow down to stay on track.",
      90
    )
  } else if (expectedSpent > 0 && totalSpent < expectedSpent * 0.7) {
    addTip(
      "spend-velocity-low",
      "You're under your spending pace. Keep this pace to build extra buffer.",
      40
    )
  }

  if (daysRemaining <= 3 && daysRemaining > 0) {
    addTip(
      "days-left-critical",
      `Only ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left. Stick to essentials only.`,
      88
    )
  } else if (daysRemaining >= 4 && daysRemaining <= 10) {
    addTip(
      "days-left-warning",
      "You're in the home stretch. Review subscriptions and non-essential spending.",
      60
    )
  } else if (daysRemaining > 14) {
    addTip(
      "days-left-early",
      `Still early in the period. Set a daily cap of ${formatCurrency(dailyAllowance)} to stay safe.`,
      35
    )
  }

  const largestExpense = expenses.length > 0
    ? expenses.reduce((max, e) => (e.amount > max.amount ? e : max), expenses[0])
    : null
  if (
    largestExpense &&
    budget.totalAmount > 0 &&
    largestExpense.amount > budget.totalAmount * 0.25
  ) {
    const pct = Math.round((largestExpense.amount / budget.totalAmount) * 100)
    addTip(
      "largest-expense",
      `Largest expense (${largestExpense.description || "item"}: ${formatCurrency(largestExpense.amount)}) is ${pct}% of your full budget. Avoid similar spikes this period.`,
      72
    )
  }

  if (todayExpenses.length >= 3) {
    addTip(
      "many-expenses-today",
      `You've logged ${todayExpenses.length} expenses today. Batch purchases to reduce impulse buys.`,
      66
    )
  }

  if (dayOfWeek === 5 || dayOfWeek === 6) {
    const weekendLimit = formatCurrency(dailyAllowance * 1.5)
    addTip(
      "weekend-limit",
      `Weekends are peak spending time. Set a weekend limit of ${weekendLimit}.`,
      58
    )
  }

  const savingsCategory = budget.categories.find(
    (c) => c.name.toLowerCase().includes("saving") || c.name.toLowerCase().includes("emergency")
  )
  if (!savingsCategory) {
    addTip(
      "add-savings-category",
      "Add a Savings category. Even 5% of budget creates a safety net.",
      62
    )
  } else {
    const savingsSpent = expenses
      .filter((e) => e.categoryId === savingsCategory.id)
      .reduce((sum, e) => sum + e.amount, 0)
    if (savingsSpent === 0 && savingsCategory.allocated > 0) {
      const nudge = formatCurrency(savingsCategory.allocated * 0.3)
      addTip(
        "fund-savings-category",
        `Your ${savingsCategory.name} category has room. Move ${nudge} into it this week.`,
        64
      )
    }
  }

  if (overspent.length >= 2) {
    addTip(
      "multi-overspent",
      `${overspent.length} categories are over budget. Prioritize the biggest overspend first.`,
      94
    )
  }

  if (todayExpenses.length === 0) {
    addTip(
      "no-spend-day",
      `No spending yet today. A no-spend day protects ${formatCurrency(dailyAllowance)} of your allowance.`,
      45
    )
  }

  if (candidates.length === 0) {
    addTip(
      "fallback",
      "You are on track. Keep logging expenses daily and avoid unplanned purchases.",
      10
    )
  }
  const topSuggestions = useMemo(
    () => [...candidates].sort((a, b) => b.score - a.score).slice(0, 3),
    [candidates]
  )
  const [selectedTipId, setSelectedTipId] = useState(topSuggestions[0]?.id ?? "")
  const [activeGoals, setActiveGoals] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!topSuggestions.some((tip) => tip.id === selectedTipId)) {
      setSelectedTipId(topSuggestions[0]?.id ?? "")
    }
  }, [topSuggestions, selectedTipId])

  const selectedTip =
    topSuggestions.find((tip) => tip.id === selectedTipId) ?? topSuggestions[0]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-center text-xl font-bold uppercase tracking-wide">
          Save Smart
        </h1>
        <p className="text-center text-sm text-muted">
          AI-powered savings guidance based on your spending
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <p className="text-sm font-semibold">AI Coach Snapshot</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs text-muted">Remaining</p>
            <p className="font-heading mt-1 text-base font-semibold text-accent">
              {formatCurrency(totalRemaining)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs text-muted">Daily target</p>
            <p className="font-heading mt-1 text-base font-semibold">{formatCurrency(dailyAllowance)}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs text-muted">Spent so far</p>
            <p className="font-heading mt-1 text-base font-semibold">{formatCurrency(totalSpent)}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs text-muted">Days left</p>
            <p className="font-heading mt-1 text-base font-semibold">{daysRemaining}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="rounded-xl border border-accent/20 bg-gradient-to-r from-accent/12 via-accent/8 to-transparent px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-accent/30 bg-accent/15">
              <PiggyBank className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h2 className="font-heading text-sm uppercase tracking-wide">Recommended Moves</h2>
              <p className="text-xs text-muted">AI-prioritized actions you can take now</p>
            </div>
          </div>
        </div>
        <ul className="mt-5 grid grid-cols-3 gap-2">
          {topSuggestions.map((tip, index) => {
            const TipIcon = getTipIcon(tip.id, tip.score)
            const isSelected = selectedTip?.id === tip.id
            const isCompleted = Boolean(activeGoals[tip.id])
            return (
              <li key={tip.id} className="text-center">
                <button
                  type="button"
                  onClick={() => setSelectedTipId(tip.id)}
                  aria-label={`Show move ${index + 1}`}
                  aria-pressed={isSelected}
                  className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full border transition-all ${
                    isSelected || isCompleted
                      ? `${getTipTierStyles(tip.score)} ${isSelected ? "scale-105 shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent)_18%,transparent)]" : ""}`
                      : "border-border bg-background/40 text-muted hover:border-accent/40 hover:text-accent"
                  }`}
                >
                  <TipIcon className="h-5 w-5" />
                </button>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  Goal {index + 1}
                </p>
              </li>
            )
          })}
        </ul>
        {selectedTip && (
          <div className="rounded-xl border border-border bg-background/60 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-success">
                {getTipTier(selectedTip.score)} Priority Goal
              </p>
              <button
                type="button"
                onClick={() =>
                  setActiveGoals((current) => ({
                    ...current,
                    [selectedTip.id]: !current[selectedTip.id],
                  }))
                }
                className="rounded-md border border-success/35 bg-success/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-success transition-opacity hover:opacity-90"
              >
                {activeGoals[selectedTip.id] ? "Clear Goal" : "Complete Goal"}
              </button>
            </div>
            <p className="text-sm leading-5 text-foreground">{selectedTip.text}</p>
            <p className="mt-2 text-[11px] text-muted">
              {activeGoals[selectedTip.id]
                ? "This goal is completed for this period."
                : "Complete this goal to keep it highlighted."}
            </p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4 text-sm">
        <div className="mb-1.5 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-accent" />
          <p className="font-semibold">Safety Rule</p>
        </div>
        <p className="text-muted">
          Keep at least 10% of your total budget for emergency and unexpected
          costs.
        </p>
      </div>
    </div>
  )
}
