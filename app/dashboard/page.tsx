"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useBudget } from "@/contexts/budget-context"
import { motion } from "framer-motion"
import {
  calculateSpent,
  calculateDailyAllowance,
  getDaysRemaining,
  getCategorySpent,
  formatCurrency,
} from "@/lib/budget-utils"
import BudgetRing from "@/components/budget-ring"
import CategoryCard from "@/components/category-card"
import ExpenseItem from "@/components/expense-item"
import {
  CalendarClock,
  TrendingDown,
  Wallet,
  PlusCircle,
  Loader2,
  Search,
} from "lucide-react"
import { useIsMobile } from "@/lib/use-is-mobile"

export default function DashboardPage() {
  const router = useRouter()
  const { state, isHydrated } = useBudget()
  const { budget, expenses, isOnboarded } = state
  const [categoryQuery, setCategoryQuery] = useState("")
  const isMobile = useIsMobile()
  const allocatedCategories = budget?.categories.filter((c) => c.allocated > 0) ?? []
  const visibleCategories = useMemo(() => {
    const normalized = categoryQuery.trim().toLowerCase()
    if (!normalized) return allocatedCategories
    return allocatedCategories.filter((c) =>
      c.name.toLowerCase().includes(normalized)
    )
  }, [allocatedCategories, categoryQuery])

  useEffect(() => {
    if (isHydrated && (!isOnboarded || !budget)) {
      router.replace("/")
    }
  }, [isHydrated, isOnboarded, budget, router])

  if (!isHydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  if (!isOnboarded || !budget) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  const introMotion = isMobile
    ? { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2 } }
    : { initial: false, animate: false }

  const sectionMotion = isMobile
    ? { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.24 } }
    : { initial: false, animate: false }

  const totalSpent = calculateSpent(expenses)
  const dailyAllowance = calculateDailyAllowance(budget, expenses)
  const daysRemaining = getDaysRemaining(budget.endDate)
  const remaining = budget.totalAmount - totalSpent
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <motion.div {...introMotion}>
        <p className="text-center text-xs text-muted">Good {getGreeting()}</p>
        <h1 className="font-heading text-center text-xl font-bold uppercase tracking-wide">
          {budget.name}
        </h1>
      </motion.div>

      <motion.div
        {...sectionMotion}
        transition={isMobile ? { duration: 0.24, delay: 0.03 } : undefined}
        className="rounded-2xl border border-border bg-card p-5"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted">Total Remaining</p>
            <p className="font-heading mt-1 text-3xl font-bold text-accent">
              {formatCurrency(Math.max(0, remaining))}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              of <span className="font-heading">{formatCurrency(budget.totalAmount)}</span> budget
            </p>
          </div>
          <BudgetRing spent={totalSpent} total={budget.totalAmount} />
        </div>
      </motion.div>

      <motion.div
        {...sectionMotion}
        transition={isMobile ? { duration: 0.24, delay: 0.06 } : undefined}
        className="grid grid-cols-3 gap-3"
      >
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <Wallet className="mx-auto mb-1 h-4 w-4 text-accent" />
          <p className="text-xs text-muted">Daily</p>
          <p className="font-heading text-sm font-bold text-accent">
            {formatCurrency(dailyAllowance)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <CalendarClock className="mx-auto mb-1 h-4 w-4 text-accent" />
          <p className="text-xs text-muted">Days Left</p>
          <p className="font-heading text-sm font-bold text-accent">{daysRemaining}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <TrendingDown className="mx-auto mb-1 h-4 w-4 text-accent" />
          <p className="text-xs text-muted">Spent</p>
          <p className="font-heading text-sm font-bold text-accent">
            {formatCurrency(totalSpent)}
          </p>
        </div>
      </motion.div>

      <motion.div
        {...sectionMotion}
        transition={isMobile ? { duration: 0.24, delay: 0.09 } : undefined}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted">Recent Expenses</h2>
          {expenses.length > 0 && (
            <Link
              href="/history"
              className="text-xs text-accent hover:underline"
            >
              View All
            </Link>
          )}
        </div>
        {recentExpenses.length > 0 ? (
          <div className="space-y-2">
            {recentExpenses.map((expense) => {
              const category = budget.categories.find(
                (c) => c.id === expense.categoryId
              )
              return (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  category={category}
                />
              )
            })}
          </div>
        ) : (
          <Link
            href="/add"
            className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-8 text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <PlusCircle className="h-8 w-8" />
            <span className="text-sm">Add your first expense</span>
          </Link>
        )}
      </motion.div>

      <motion.div
        {...sectionMotion}
        transition={isMobile ? { duration: 0.24, delay: 0.12 } : undefined}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted">Categories</h2>
          <Link href="/goals" className="text-xs text-accent hover:underline">
            Set Goals
          </Link>
        </div>
        {allocatedCategories.length > 6 && (
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={categoryQuery}
              onChange={(e) => setCategoryQuery(e.target.value)}
              placeholder="Search categories"
              className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-accent"
            />
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          {visibleCategories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                spent={getCategorySpent(expenses, cat.id)}
                compact
              />
            ))}
        </div>
      </motion.div>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "morning"
  if (hour < 18) return "afternoon"
  return "evening"
}
