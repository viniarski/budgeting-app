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

  const suggestions: string[] = []

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

  const weeklySave = totalRemaining * 0.12
  suggestions.push(
    `AI target: save ${formatCurrency(weeklySave)} this week by keeping daily spend under ${formatCurrency(dailyAllowance * 0.9)}.`
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Save Smart</h1>
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
