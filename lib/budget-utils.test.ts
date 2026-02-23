import {
  calculateSpent,
  calculateRemaining,
  calculateDailyAllowance,
  getDaysRemaining,
  getCategorySpent,
  getSpentPercentage,
  getProgressColour,
  getProgressBarColour,
  formatCurrency,
} from "@/lib/budget-utils"
import { Budget, Expense } from "@/lib/types"

const budget: Budget = {
  id: "budget-1",
  name: "Monthly Budget",
  totalAmount: 1000,
  period: "monthly",
  startDate: "2026-02-01",
  endDate: "2026-03-01",
  categories: [],
}

const expenses: Expense[] = [
  {
    id: "exp-1",
    amount: 100,
    categoryId: "food",
    description: "Groceries",
    date: "2026-02-10",
  },
  {
    id: "exp-2",
    amount: 50,
    categoryId: "transport",
    description: "Bus pass",
    date: "2026-02-11",
  },
  {
    id: "exp-3",
    amount: 25,
    categoryId: "food",
    description: "Lunch",
    date: "2026-02-12",
  },
]

describe("budget-utils", () => {
  it("calculates total spent", () => {
    expect(calculateSpent(expenses)).toBe(175)
  })

  it("calculates remaining budget", () => {
    expect(calculateRemaining(budget, expenses)).toBe(825)
  })

  it("calculates daily allowance when days remain", () => {
    const result = calculateDailyAllowance(
      { ...budget, endDate: "2099-12-31" },
      expenses
    )
    expect(result).toBeGreaterThan(0)
  })

  it("returns zero days remaining for past end date", () => {
    expect(getDaysRemaining("2000-01-01")).toBe(0)
  })

  it("calculates category spend by id", () => {
    expect(getCategorySpent(expenses, "food")).toBe(125)
    expect(getCategorySpent(expenses, "rent")).toBe(0)
  })

  it("handles percentages, progress colors, and currency formatting", () => {
    expect(getSpentPercentage(120, 100)).toBe(100)
    expect(getProgressColour(90)).toBe("text-red-500")
    expect(getProgressBarColour(65)).toBe("bg-amber-500")
    expect(formatCurrency(12.5)).toBe("£12.50")
  })
})
