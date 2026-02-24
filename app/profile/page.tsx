"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useBudget } from "@/contexts/budget-context"
import { calculateSpent, formatCurrency } from "@/lib/budget-utils"
import { Loader2, UserRound, Wallet, ListChecks, Receipt } from "lucide-react"

export default function ProfilePage() {
  const { state, isHydrated } = useBudget()
  const { budget, expenses, isOnboarded } = state

  const totalSpent = useMemo(() => calculateSpent(expenses), [expenses])
  const allocatedCount = useMemo(
    () => (budget ? budget.categories.filter((c) => c.allocated > 0).length : 0),
    [budget]
  )

  if (!isHydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-center text-xl font-bold uppercase tracking-wide">
          Profile
        </h1>
        <p className="text-center text-sm text-muted">
          Your account and budgeting overview
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">Student</p>
            <p className="text-xs text-muted">
              {budget?.name ?? "No budget configured"}
            </p>
          </div>
        </div>
      </div>

      {isOnboarded && budget ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="mb-1 flex items-center gap-1.5 text-muted">
                <Wallet className="h-3.5 w-3.5" />
                <span className="text-xs">Budget</span>
              </div>
              <p className="font-heading text-sm">{formatCurrency(budget.totalAmount)}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="mb-1 flex items-center gap-1.5 text-muted">
                <Receipt className="h-3.5 w-3.5" />
                <span className="text-xs">Spent</span>
              </div>
              <p className="font-heading text-sm text-accent">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="mb-1 flex items-center gap-1.5 text-muted">
                <ListChecks className="h-3.5 w-3.5" />
                <span className="text-xs">Categories</span>
              </div>
              <p className="font-heading text-sm">{allocatedCount}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="mb-1 flex items-center gap-1.5 text-muted">
                <Receipt className="h-3.5 w-3.5" />
                <span className="text-xs">Expenses</span>
              </div>
              <p className="font-heading text-sm">{expenses.length}</p>
            </div>
          </div>

          <Link
            href="/track-spend"
            className="flex w-full items-center justify-center rounded-xl bg-accent py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Open Spending Insights
          </Link>
        </>
      ) : (
        <div className="rounded-xl border border-border bg-card p-4 text-sm">
          <p className="text-muted">
            You have not set up a budget yet. Start onboarding to unlock full
            profile insights.
          </p>
          <Link
            href="/setup"
            className="mt-3 inline-flex rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
          >
            Set Up Budget
          </Link>
        </div>
      )}
    </div>
  )
}
