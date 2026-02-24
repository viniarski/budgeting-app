"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useBudget } from "@/contexts/budget-context"
import { formatCurrency } from "@/lib/budget-utils"
import { Loader2 } from "lucide-react"

function parseLocalDate(date: string): Date {
  return new Date(`${date}T12:00:00`)
}

const PERIOD_LABELS = {
  weekly: "Weekly",
  monthly: "Monthly",
  termly: "Termly",
} as const

export default function TrackSpendPage() {
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

  const categoryTotals = budget.categories
    .map((category) => {
      const spent = expenses
        .filter((e) => e.categoryId === category.id)
        .reduce((sum, e) => sum + e.amount, 0)

      return { id: category.id, name: category.name, spent }
    })
    .filter((item) => item.spent > 0)
    .sort((a, b) => b.spent - a.spent)

  const totalSpent = categoryTotals.reduce((sum, item) => sum + item.spent, 0)
  const topCategories = categoryTotals.slice(0, 5)
  const pieTotal = topCategories.reduce((sum, item) => sum + item.spent, 0)

  const PIE_COLORS = ["#10b981", "#22d3ee", "#f59e0b", "#f97316", "#ef4444"]

  let pieGradient = "conic-gradient(#262626 0deg 360deg)"
  if (pieTotal > 0) {
    let angle = 0
    const stops: string[] = []

    topCategories.forEach((item, index) => {
      const slice = (item.spent / pieTotal) * 360
      const start = angle
      angle += slice
      const end = angle
      stops.push(`${PIE_COLORS[index % PIE_COLORS.length]} ${start}deg ${end}deg`)
    })

    pieGradient = `conic-gradient(${stops.join(", ")})`
  }

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const dailyTrend = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(now)
    day.setDate(now.getDate() - (6 - index))
    const label = day.toLocaleDateString("en-GB", { weekday: "short" })

    const amount = expenses
      .filter((expense) => {
        const expenseDate = parseLocalDate(expense.date)
        expenseDate.setHours(0, 0, 0, 0)
        return expenseDate.getTime() === day.getTime()
      })
      .reduce((sum, e) => sum + e.amount, 0)

    return { label, amount }
  })

  const maxDaily = Math.max(...dailyTrend.map((d) => d.amount), 1)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-center text-xl font-bold uppercase tracking-wide">
          Track Spend
        </h1>
        <p className="text-center text-sm text-muted">
          Charts and spending patterns from your budget
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 font-semibold">Budget Details</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Period</span>
            <span className="font-heading">
              {PERIOD_LABELS[budget.period ?? "termly"]}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Budget Amount</span>
            <span className="font-heading">{formatCurrency(budget.totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Start Date</span>
            <span className="font-heading">
              {new Date(budget.startDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">End Date</span>
            <span className="font-heading">
              {new Date(budget.endDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 font-semibold">Category Allocations</h2>
        <div className="space-y-2 text-sm">
          {budget.categories
            .filter((c) => c.allocated > 0)
            .map((cat) => (
              <div key={cat.id} className="flex justify-between">
                <span className="text-muted">{cat.name}</span>
                <span className="font-heading">{formatCurrency(cat.allocated)}</span>
              </div>
            ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs text-muted">Total Spent</p>
        <p className="font-heading mt-1 text-2xl font-bold text-accent">
          {formatCurrency(totalSpent)}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Top Category Split</h2>
        {topCategories.length > 0 ? (
          <>
            <div className="mb-4 flex justify-center">
              <div
                className="h-36 w-36 rounded-full"
                style={{ background: pieGradient }}
                aria-label="Category split chart"
              />
            </div>
            <div className="space-y-2">
              {topCategories.map((category, index) => {
                const pct = pieTotal > 0 ? (category.spent / pieTotal) * 100 : 0
                return (
                  <div
                    key={category.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                        }}
                      />
                    <span>{category.name}</span>
                  </div>
                    <span className="font-heading text-muted">
                      {formatCurrency(category.spent)} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">No spending data yet.</p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Last 7 Days</h2>
        <div className="grid grid-cols-7 items-end gap-2">
          {dailyTrend.map((day) => (
            <div key={day.label} className="flex flex-col items-center gap-1">
              <div className="flex h-28 items-end">
                <div
                  className="w-6 rounded-t-md bg-accent/80"
                  style={{
                    height: `${Math.max(4, (day.amount / maxDaily) * 100)}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-muted">{day.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 border-t border-border pt-3">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted">
            Daily Totals
          </p>
          <div className="mx-auto max-w-xs space-y-1.5">
          {dailyTrend.map((day) => (
            <div
              key={`${day.label}-value`}
              className="grid grid-cols-[32px_1fr_auto] items-center gap-2 text-xs"
            >
              <span className="text-muted">{day.label}</span>
              <span className="h-px bg-border" />
              <span className="font-heading text-foreground">
                {formatCurrency(day.amount)}
              </span>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  )
}
