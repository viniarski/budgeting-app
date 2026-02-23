"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useBudget } from "@/contexts/budget-context"
import { getCategorySpent } from "@/lib/budget-utils"
import CategoryCard from "@/components/category-card"
import ExpenseItem from "@/components/expense-item"
import { Loader2 } from "lucide-react"

export default function CategoriesPage() {
  const router = useRouter()
  const { state, dispatch, isHydrated } = useBudget()
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

  function handleDeleteExpense(id: string) {
    dispatch({ type: "DELETE_EXPENSE", payload: id })
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Categories</h1>

      {budget.categories
        .filter((c) => c.allocated > 0)
        .map((cat) => {
          const spent = getCategorySpent(expenses, cat.id)
          const categoryExpenses = expenses
            .filter((e) => e.categoryId === cat.id)
            .sort(
              (a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            )

          return (
            <div key={cat.id}>
              <CategoryCard category={cat} spent={spent} />
              {categoryExpenses.length > 0 && (
                <div className="mt-2 space-y-1.5 pl-2">
                  {categoryExpenses.map((expense) => (
                    <ExpenseItem
                      key={expense.id}
                      expense={expense}
                      category={cat}
                      onDelete={handleDeleteExpense}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}

      {budget.categories.filter((c) => c.allocated > 0).length === 0 && (
        <p className="py-12 text-center text-sm text-muted">
          No categories allocated yet.
        </p>
      )}
    </div>
  )
}
