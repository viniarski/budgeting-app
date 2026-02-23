"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useBudget } from "@/contexts/budget-context"
import ExpenseItem from "@/components/expense-item"
import { calculateSpent, formatCurrency } from "@/lib/budget-utils"
import { Loader2, Search, SlidersHorizontal } from "lucide-react"

type DateFilter = "all" | "7" | "30"

function parseLocalDate(date: string): Date {
  return new Date(`${date}T12:00:00`)
}

export default function HistoryPage() {
  const router = useRouter()
  const { state, dispatch, isHydrated } = useBudget()
  const { budget, expenses, isOnboarded } = state

  const [search, setSearch] = useState("")
  const [categoryId, setCategoryId] = useState("all")
  const [dateFilter, setDateFilter] = useState<DateFilter>("all")

  useEffect(() => {
    if (isHydrated && (!isOnboarded || !budget)) {
      router.replace("/setup")
    }
  }, [isHydrated, isOnboarded, budget, router])

  const filteredExpenses = useMemo(() => {
    const now = new Date()
    const searchTerm = search.trim().toLowerCase()

    return [...expenses]
      .filter((expense) => {
        const matchesSearch =
          searchTerm.length === 0 ||
          expense.description.toLowerCase().includes(searchTerm)
        const matchesCategory =
          categoryId === "all" || expense.categoryId === categoryId

        let matchesDate = true
        if (dateFilter !== "all") {
          const days = Number(dateFilter)
          const start = new Date(now)
          start.setHours(0, 0, 0, 0)
          start.setDate(start.getDate() - days + 1)
          matchesDate = parseLocalDate(expense.date) >= start
        }

        return matchesSearch && matchesCategory && matchesDate
      })
      .sort((a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime())
  }, [expenses, search, categoryId, dateFilter])

  if (!isHydrated || !isOnboarded || !budget) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  const total = calculateSpent(filteredExpenses)
  const largest = filteredExpenses.reduce(
    (max, expense) => Math.max(max, expense.amount),
    0
  )
  const average = filteredExpenses.length > 0 ? total / filteredExpenses.length : 0

  function handleDeleteExpense(id: string) {
    dispatch({ type: "DELETE_EXPENSE", payload: id })
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Expense History</h1>
        <p className="text-sm text-muted">Search, filter, and manage spending</p>
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-card p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search description"
            className="w-full rounded-lg border border-border bg-background px-9 py-2.5 text-sm outline-none transition-colors focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2.5 pr-9 text-sm outline-none transition-colors focus:border-accent"
            >
              <option value="all">All categories</option>
              {budget.categories
                .filter((c) => c.allocated > 0)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
            <SlidersHorizontal className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          </div>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilter)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent"
          >
            <option value="all">All time</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs text-muted">Transactions</p>
          <p className="mt-1 text-sm font-bold">{filteredExpenses.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs text-muted">Total</p>
          <p className="mt-1 text-sm font-bold text-accent">{formatCurrency(total)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs text-muted">Avg / Tx</p>
          <p className="mt-1 text-sm font-bold">{formatCurrency(average)}</p>
        </div>
      </div>

      {largest > 0 && (
        <p className="text-xs text-muted">
          Largest transaction:{" "}
          <span className="font-semibold text-foreground">
            {formatCurrency(largest)}
          </span>
        </p>
      )}

      {filteredExpenses.length > 0 ? (
        <div className="space-y-2">
          {filteredExpenses.map((expense) => {
            const category = budget.categories.find((c) => c.id === expense.categoryId)
            return (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                category={category}
                onDelete={handleDeleteExpense}
              />
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted">
          No expenses match these filters.
        </div>
      )}
    </div>
  )
}
