"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useBudget } from "@/contexts/budget-context"
import { ALL_CATEGORIES, CategoryTemplate } from "@/lib/constants"
import { formatCurrency } from "@/lib/budget-utils"
import { Budget, BudgetPeriod, Category } from "@/lib/types"
import StepAmount from "@/components/setup/step-amount"
import StepCategories from "@/components/setup/step-categories"
import { Loader2, RotateCcw, Pencil, Wallet } from "lucide-react"

const PERIOD_LABELS: Record<BudgetPeriod, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  termly: "Termly",
}

export default function SettingsPage() {
  const router = useRouter()
  const { state, dispatch, isHydrated } = useBudget()
  const [isEditing, setIsEditing] = useState(false)
  const [editStep, setEditStep] = useState(1)

  const [amount, setAmount] = useState("")
  const [period, setPeriod] = useState<BudgetPeriod>("monthly")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [allocations, setAllocations] = useState<Record<string, number>>({})
  const [customCategories, setCustomCategories] = useState<CategoryTemplate[]>(
    []
  )

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

  const budget = state.budget

  function startEditing() {
    setAmount(String(budget.totalAmount))
    setPeriod(budget.period ?? "monthly")
    setStartDate(budget.startDate)
    setEndDate(budget.endDate)

    const knownIds = ALL_CATEGORIES.map((c) => c.id)
    const ids: string[] = []
    const map: Record<string, number> = {}
    const custom: CategoryTemplate[] = []

    budget.categories.forEach((c) => {
      ids.push(c.id)
      if (c.allocated > 0) map[c.id] = c.allocated
      if (!knownIds.includes(c.id)) {
        custom.push({
          id: c.id,
          name: c.name,
          colour: c.colour,
          icon: c.icon,
        })
      }
    })

    setSelectedIds(ids)
    setAllocations(map)
    setCustomCategories(custom)
    setEditStep(1)
    setIsEditing(true)
  }

  function handleReset() {
    dispatch({ type: "RESET" })
    router.replace("/")
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

  function handleSave() {
    const allAvailable = [...ALL_CATEGORIES, ...customCategories]
    const categories: Category[] = selectedIds
      .map((id) => {
        const template = allAvailable.find((c) => c.id === id)
        if (!template) return null
        return { ...template, allocated: allocations[id] || 0 }
      })
      .filter((c): c is Category => c !== null)

    const updated: Budget = {
      id: budget.id,
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

    dispatch({ type: "SET_BUDGET", payload: updated })
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex min-h-[80vh] flex-col justify-center">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Edit Budget</h1>
            <p className="text-xs text-muted">Step {editStep} of 2</p>
          </div>
          <button
            onClick={() => setIsEditing(false)}
            className="ml-auto text-xs text-muted hover:text-foreground"
          >
            Cancel
          </button>
        </div>

        {editStep === 1 ? (
          <StepAmount
            amount={amount}
            period={period}
            startDate={startDate}
            endDate={endDate}
            onAmountChange={setAmount}
            onPeriodChange={setPeriod}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onNext={() => setEditStep(2)}
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
            onComplete={handleSave}
            onBack={() => setEditStep(1)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Settings</h1>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Budget Details</h2>
          <button
            onClick={startEditing}
            className="flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Period</span>
            <span className="font-medium">
              {PERIOD_LABELS[budget.period ?? "termly"]}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Budget Amount</span>
            <span className="font-medium">
              {formatCurrency(budget.totalAmount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Start Date</span>
            <span className="font-medium">
              {new Date(budget.startDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">End Date</span>
            <span className="font-medium">
              {new Date(budget.endDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 font-semibold">Category Allocations</h2>
        <div className="space-y-2 text-sm">
          {budget.categories
            .filter((c) => c.allocated > 0)
            .map((cat) => (
              <div key={cat.id} className="flex justify-between">
                <span className="text-muted">{cat.name}</span>
                <span className="font-medium">
                  {formatCurrency(cat.allocated)}
                </span>
              </div>
            ))}
        </div>
      </div>

      <button
        onClick={handleReset}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent/30 py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent/10"
      >
        <RotateCcw className="h-4 w-4" />
        Reset Budget
      </button>
    </div>
  )
}
