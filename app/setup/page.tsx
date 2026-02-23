"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useBudget } from "@/contexts/budget-context"
import {
  ALL_CATEGORIES,
  DEFAULT_CATEGORY_IDS,
  CategoryTemplate,
} from "@/lib/constants"
import { Budget, BudgetPeriod, Category } from "@/lib/types"
import StepAmount from "@/components/setup/step-amount"
import StepCategories from "@/components/setup/step-categories"
import { Wallet, Loader2 } from "lucide-react"

export default function SetupPage() {
  const router = useRouter()
  const { state, dispatch, isHydrated } = useBudget()
  const [step, setStep] = useState(1)

  const [amount, setAmount] = useState("")
  const [period, setPeriod] = useState<BudgetPeriod>("monthly")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>(DEFAULT_CATEGORY_IDS)
  const [allocations, setAllocations] = useState<Record<string, number>>({})
  const [customCategories, setCustomCategories] = useState<CategoryTemplate[]>(
    []
  )

  useEffect(() => {
    if (isHydrated && state.isOnboarded) {
      router.replace("/")
    }
  }, [isHydrated, state.isOnboarded, router])

  if (!isHydrated || state.isOnboarded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  function handleToggleCategory(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function handleAddCustom(cat: CategoryTemplate) {
    setCustomCategories((prev) => [...prev, cat])
    setSelectedIds((prev) => [...prev, cat.id])
  }

  function handleRemoveCustom(id: string) {
    setCustomCategories((prev) => prev.filter((c) => c.id !== id))
    setSelectedIds((prev) => prev.filter((x) => x !== id))
    setAllocations((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function handleAllocationChange(categoryId: string, value: number) {
    setAllocations((prev) => ({ ...prev, [categoryId]: value }))
  }

  function handleComplete() {
    const allAvailable = [...ALL_CATEGORIES, ...customCategories]
    const categories: Category[] = selectedIds
      .map((id) => {
        const template = allAvailable.find((c) => c.id === id)
        if (!template) return null
        return { ...template, allocated: allocations[id] || 0 }
      })
      .filter((c): c is Category => c !== null)

    const budget: Budget = {
      id: crypto.randomUUID(),
      name:
        period === "weekly"
          ? "Weekly Budget"
          : period === "monthly"
            ? "Monthly Budget"
            : "Term Budget",
      totalAmount: parseFloat(amount),
      period,
      startDate,
      endDate,
      categories,
    }

    dispatch({ type: "SET_BUDGET", payload: budget })
    router.push("/")
  }

  return (
    <div className="flex min-h-[80vh] flex-col justify-center">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white">
          <Wallet className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold">UniWallet</h1>
          <p className="text-xs text-muted">Step {step} of 2</p>
        </div>
      </div>

      {step === 1 ? (
        <StepAmount
          amount={amount}
          period={period}
          startDate={startDate}
          endDate={endDate}
          onAmountChange={setAmount}
          onPeriodChange={setPeriod}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onNext={() => setStep(2)}
        />
      ) : (
        <StepCategories
          totalAmount={parseFloat(amount)}
          selectedIds={selectedIds}
          allocations={allocations}
          customCategories={customCategories}
          onToggleCategory={handleToggleCategory}
          onAddCustom={handleAddCustom}
          onRemoveCustom={handleRemoveCustom}
          onAllocationChange={handleAllocationChange}
          onComplete={handleComplete}
          onBack={() => setStep(1)}
        />
      )}
    </div>
  )
}
