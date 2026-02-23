import { Budget, Expense } from "./types"

export function calculateSpent(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0)
}

export function calculateRemaining(budget: Budget, expenses: Expense[]): number {
  return budget.totalAmount - calculateSpent(expenses)
}

export function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function calculateDailyAllowance(budget: Budget, expenses: Expense[]): number {
  const remaining = calculateRemaining(budget, expenses)
  const days = getDaysRemaining(budget.endDate)
  if (days <= 0) return 0
  return remaining / days
}

export function getCategorySpent(expenses: Expense[], categoryId: string): number {
  return expenses
    .filter((e) => e.categoryId === categoryId)
    .reduce((sum, e) => sum + e.amount, 0)
}

export function getSpentPercentage(spent: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, (spent / total) * 100)
}

export function getProgressColour(percentage: number): string {
  if (percentage >= 85) return "text-red-500"
  if (percentage >= 60) return "text-amber-500"
  return "text-emerald-500"
}

export function getProgressBarColour(percentage: number): string {
  if (percentage >= 85) return "bg-red-500"
  if (percentage >= 60) return "bg-amber-500"
  return "bg-emerald-500"
}

export function formatCurrency(amount: number): string {
  return `£${amount.toFixed(2)}`
}
