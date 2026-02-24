"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useBudget } from "@/contexts/budget-context"
import { formatCurrency } from "@/lib/budget-utils"
import { Loader2 } from "lucide-react"

function parseLocalDate(date: string): Date {
  return new Date(`${date}T12:00:00`)
}

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
        <h1 className="font-heading text-xl font-bold">Track Spend</h1>
        <p className="text-sm text-muted">
          Charts and spending patterns from your budget
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs text-muted">Total Spent</p>
        <p className="mt-1 text-2xl font-bold text-accent">
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
                    <span className="text-muted">
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
        <div className="mt-3 space-y-1">
          {dailyTrend.map((day) => (
            <div key={`${day.label}-value`} className="flex justify-between text-xs">
              <span className="text-muted">{day.label}</span>
              <span>{formatCurrency(day.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
