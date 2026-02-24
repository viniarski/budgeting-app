"use client"

import Link from "next/link"
import { useBudget } from "@/contexts/budget-context"
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
  ArrowRight,
  GraduationCap,
  PiggyBank,
  Target,
  Loader2,
} from "lucide-react"

function WelcomeDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center py-6">
        <div className="relative mb-6 h-[160px] w-[160px]">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="#262626"
              strokeWidth="12"
            />
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="#10b981"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 88}
              strokeDashoffset={2 * Math.PI * 88 * 0.75}
              opacity="0.3"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <GraduationCap className="h-8 w-8 text-accent" />
          </div>
        </div>
        <h2 className="text-lg font-bold">Welcome, Student!</h2>
        <p className="mt-1 max-w-[260px] text-center text-sm text-muted">
          Take control of your maintenance loan. Set up your budget to start
          tracking.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Link
          href="/goals"
          className="rounded-xl border border-border bg-card p-4 text-center transition-colors hover:border-accent/40"
        >
          <Target className="mx-auto mb-2 h-6 w-6 text-accent" />
          <p className="text-xs font-medium">Set Goals</p>
        </Link>
        <Link
          href="/save-smart"
          className="rounded-xl border border-border bg-card p-4 text-center transition-colors hover:border-accent/40"
        >
          <PiggyBank className="mx-auto mb-2 h-6 w-6 text-accent" />
          <p className="text-xs font-medium">Save Smart</p>
        </Link>
        <Link
          href="/track-spend"
          className="rounded-xl border border-border bg-card p-4 text-center transition-colors hover:border-accent/40"
        >
          <TrendingDown className="mx-auto mb-2 h-6 w-6 text-accent" />
          <p className="text-xs font-medium">Track Spend</p>
        </Link>
      </div>

      <Link
        href="/setup"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 font-semibold text-white transition-opacity hover:opacity-90"
      >
        Set Up Your Budget
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

export default function DashboardPage() {
  const { state, isHydrated } = useBudget()
  const { budget, expenses, isOnboarded } = state

  if (!isHydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  if (!isOnboarded || !budget) {
    return <WelcomeDashboard />
  }

  const totalSpent = calculateSpent(expenses)
  const dailyAllowance = calculateDailyAllowance(budget, expenses)
  const daysRemaining = getDaysRemaining(budget.endDate)
  const remaining = budget.totalAmount - totalSpent
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <p className="text-center text-xs text-muted">Good {getGreeting()}</p>
        <h1 className="font-heading text-center text-xl font-bold uppercase tracking-wide">
          {budget.name}
        </h1>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted">Total Remaining</p>
            <p className="mt-1 text-3xl font-bold text-accent">
              {formatCurrency(Math.max(0, remaining))}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              of {formatCurrency(budget.totalAmount)} budget
            </p>
          </div>
          <BudgetRing spent={totalSpent} total={budget.totalAmount} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <Wallet className="mx-auto mb-1 h-4 w-4 text-accent" />
          <p className="text-xs text-muted">Daily</p>
          <p className="text-sm font-bold text-accent">
            {formatCurrency(dailyAllowance)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <CalendarClock className="mx-auto mb-1 h-4 w-4 text-accent" />
          <p className="text-xs text-muted">Days Left</p>
          <p className="text-sm font-bold text-accent">{daysRemaining}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <TrendingDown className="mx-auto mb-1 h-4 w-4 text-accent" />
          <p className="text-xs text-muted">Spent</p>
          <p className="text-sm font-bold text-accent">
            {formatCurrency(totalSpent)}
          </p>
        </div>
      </div>

      <div>
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
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted">Categories</h2>
          <Link href="/goals" className="text-xs text-accent hover:underline">
            Set Goals
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {budget.categories
            .filter((c) => c.allocated > 0)
            .map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                spent={getCategorySpent(expenses, cat.id)}
                compact
              />
            ))}
        </div>
      </div>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "morning"
  if (hour < 18) return "afternoon"
  return "evening"
}
