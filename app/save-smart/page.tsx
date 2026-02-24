"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useBudget } from "@/contexts/budget-context"
import {
  calculateDailyAllowance,
  calculateRemaining,
  calculateSpent,
  formatCurrency,
  getDaysRemaining,
} from "@/lib/budget-utils"
import { Loader2, Sparkles, ShieldCheck, PiggyBank } from "lucide-react"

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

  const suggestions: string[] = []

  // --- Slot 1: overspent / on-track ---
  if (overspent.length > 0) {
    const top = overspent[0]
    suggestions.push(
      `${top.category.name} is over plan by ${formatCurrency(top.spent - top.category.allocated)}. Cap this category for the next 7 days.`
    )
  } else {
    suggestions.push(
      "No category is over budget right now. Keep the same spend pace this week."
    )
  }

  // --- Slot 2: low usage reallocation ---
  if (lowUsage.length > 0) {
    const from = lowUsage[0]
    const reallocate = Math.max(0, from.category.allocated - from.spent) * 0.3
    suggestions.push(
      `Move about ${formatCurrency(reallocate)} from ${from.category.name} into Savings or Emergency to protect your remaining budget.`
    )
  } else {
    suggestions.push(
      "Your allocations are being used evenly. Keep tracking daily to avoid last-minute overspend."
    )
  }

  // --- Slot 3: AI save target (always shown) ---
  const weeklySave = totalRemaining * 0.12
  suggestions.push(
    `AI target: save ${formatCurrency(weeklySave)} this week by keeping daily spend under ${formatCurrency(dailyAllowance * 0.9)}.`
  )

  // --- Slot 4: spending velocity ---
  const expectedSpent = budget.totalAmount * Math.min(1, elapsed)
  if (totalSpent > expectedSpent && expectedSpent > 0) {
    suggestions.push(
      "You're spending faster than planned. Slow down to stay on track."
    )
  } else if (expectedSpent > 0 && totalSpent < expectedSpent * 0.7) {
    suggestions.push(
      "You're under your spending pace — great discipline!"
    )
  }

  // --- Slot 5: time-based urgency ---
  if (daysRemaining <= 3 && daysRemaining > 0) {
    suggestions.push(
      `Only ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left! Stick to essentials only.`
    )
  } else if (daysRemaining >= 4 && daysRemaining <= 10) {
    suggestions.push(
      "You're in the home stretch — review subscriptions or upcoming bills."
    )
  } else if (daysRemaining > 14) {
    suggestions.push(
      `Still early in the period. Set a daily cap of ${formatCurrency(dailyAllowance)} to stay safe.`
    )
  }

  // --- Contextual tips (0-3 shown depending on data) ---

  // Large expense alert
  const largestExpense = expenses.length > 0
    ? expenses.reduce((max, e) => (e.amount > max.amount ? e : max), expenses[0])
    : null
  if (
    largestExpense &&
    budget.totalAmount > 0 &&
    largestExpense.amount > budget.totalAmount * 0.25
  ) {
    const pct = Math.round((largestExpense.amount / budget.totalAmount) * 100)
    suggestions.push(
      `Your largest expense (${largestExpense.description || "item"}: ${formatCurrency(largestExpense.amount)}) is ${pct}% of your whole budget. Watch for similar spikes.`
    )
  }

  // Expense frequency today
  if (todayExpenses.length >= 3) {
    suggestions.push(
      `You've logged ${todayExpenses.length} expenses today. Batch purchases can help reduce impulse buys.`
    )
  }

  // Weekend awareness
  if (dayOfWeek === 5 || dayOfWeek === 6) {
    const weekendLimit = formatCurrency(dailyAllowance * 1.5)
    suggestions.push(
      `Weekends are peak spending time for students. Set a weekend-only limit of ${weekendLimit}.`
    )
  }

  // Savings nudge
  const savingsCategory = budget.categories.find(
    (c) => c.name.toLowerCase().includes("saving") || c.name.toLowerCase().includes("emergency")
  )
  if (!savingsCategory) {
    suggestions.push(
      "Consider adding a Savings category — even 5% of your budget builds a safety net."
    )
  } else {
    const savingsSpent = expenses
      .filter((e) => e.categoryId === savingsCategory.id)
      .reduce((sum, e) => sum + e.amount, 0)
    if (savingsSpent === 0 && savingsCategory.allocated > 0) {
      const nudge = formatCurrency(savingsCategory.allocated * 0.3)
      suggestions.push(
        `Your ${savingsCategory.name} category has room. Try moving ${nudge} into it this week.`
      )
    }
  }

  // Multiple overspent warning
  if (overspent.length >= 2) {
    suggestions.push(
      `${overspent.length} categories are over budget. Prioritise the biggest overspend first.`
    )
  }

  // No-spend encouragement
  if (todayExpenses.length === 0) {
    suggestions.push(
      `No spending yet today — a no-spend day saves your daily allowance of ${formatCurrency(dailyAllowance)}!`
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-xl font-bold">Save Smart</h1>
        <p className="text-sm text-muted">
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
            <p className="mt-1 font-semibold text-accent">
              {formatCurrency(totalRemaining)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs text-muted">Daily target</p>
            <p className="mt-1 font-semibold">{formatCurrency(dailyAllowance)}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs text-muted">Spent so far</p>
            <p className="mt-1 font-semibold">{formatCurrency(totalSpent)}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs text-muted">Days left</p>
            <p className="mt-1 font-semibold">{daysRemaining}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <PiggyBank className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold">Recommended Moves</h2>
        </div>
        <ul className="space-y-2">
          {suggestions.map((tip) => (
            <li
              key={tip}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              {tip}
            </li>
          ))}
        </ul>
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
