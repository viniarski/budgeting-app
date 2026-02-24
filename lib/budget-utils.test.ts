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
import { vi } from "vitest"

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
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-02-10T12:00:00.000Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("calculates total spent", () => {
    expect(calculateSpent(expenses)).toBe(175)
  })

  it("calculates remaining budget", () => {
    expect(calculateRemaining(budget, expenses)).toBe(825)
  })

  it("calculates daily allowance with deterministic days remaining", () => {
    const result = calculateDailyAllowance(
      { ...budget, endDate: "2026-02-20" },
      expenses
    )
    expect(result).toBeCloseTo(82.5, 3)
  })

  it("returns zero days remaining for past end date", () => {
    expect(getDaysRemaining("2000-01-01")).toBe(0)
  })

  it("returns zero daily allowance when budget period is over", () => {
    const result = calculateDailyAllowance(
      { ...budget, endDate: "2026-01-01" },
      expenses
    )
    expect(result).toBe(0)
  })

  it("calculates category spend by id", () => {
    expect(getCategorySpent(expenses, "food")).toBe(125)
    expect(getCategorySpent(expenses, "rent")).toBe(0)
  })

  it("handles percentages, progress colors, and currency formatting", () => {
    expect(getSpentPercentage(120, 100)).toBe(100)
    expect(getSpentPercentage(10, 0)).toBe(0)
    expect(getProgressColour(90)).toBe("text-danger")
    expect(getProgressColour(60)).toBe("text-warning")
    expect(getProgressColour(59.9)).toBe("text-success")
    expect(getProgressBarColour(65)).toBe("bg-warning")
    expect(getProgressBarColour(85)).toBe("bg-danger")
    expect(getProgressBarColour(20)).toBe("bg-success")
    expect(formatCurrency(12.5)).toBe("£12.50")
    expect(formatCurrency(0)).toBe("£0.00")
  })
})
