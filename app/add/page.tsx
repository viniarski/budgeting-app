"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useBudget } from "@/contexts/budget-context"
import AddExpenseForm from "@/components/add-expense-form"
import { Loader2 } from "lucide-react"

export default function AddExpensePage() {
  const router = useRouter()
  const { state, isHydrated } = useBudget()

  useEffect(() => {
    if (isHydrated && (!state.isOnboarded || !state.budget)) {
      router.replace("/setup")
    }
  }, [isHydrated, state.isOnboarded, state.budget, router])

  if (!isHydrated || !state.isOnboarded || !state.budget) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">Add Expense</h1>
      <AddExpenseForm />
    </div>
  )
}
