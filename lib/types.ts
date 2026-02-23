export type BudgetPeriod = "weekly" | "monthly" | "termly"

export interface Budget {
  id: string
  name: string
  totalAmount: number
  period: BudgetPeriod
  startDate: string
  endDate: string
  categories: Category[]
}

export interface Category {
  id: string
  name: string
  allocated: number
  colour: string
  icon: string
}

export interface Expense {
  id: string
  amount: number
  categoryId: string
  description: string
  date: string
}

export interface BudgetState {
  budget: Budget | null
  expenses: Expense[]
  isOnboarded: boolean
}
