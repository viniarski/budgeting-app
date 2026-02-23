"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useBudget } from "@/contexts/budget-context"
import { ALL_CATEGORIES } from "@/lib/constants"
import { formatCurrency } from "@/lib/budget-utils"
import { Budget } from "@/lib/types"
import { Check, Loader2, Plus, X } from "lucide-react"

const DEFAULT_GOAL_IDS = ["rent", "food", "subscriptions", "media", "transport"]

export default function GoalsPage() {
  const router = useRouter()
  const { state, dispatch, isHydrated } = useBudget()
  const { budget, isOnboarded } = state

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

  return (
    <GoalsEditor
      key={budget.id}
      budget={budget}
      onSave={(categories) =>
        dispatch({ type: "SET_BUDGET", payload: { ...budget, categories } })
      }
    />
  )
}

function GoalsEditor({
  budget,
  onSave,
}: {
  budget: Budget
  onSave: (categories: Budget["categories"]) => void
}) {
  const existing = budget.categories.filter((c) => c.allocated > 0).map((c) => c.id)
  const initialIds = Array.from(new Set([...DEFAULT_GOAL_IDS, ...existing]))

  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds)
  const [allocations, setAllocations] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    initialIds.forEach((id) => {
      const current = budget.categories.find((c) => c.id === id)
      initial[id] = current?.allocated ?? 0
    })
    return initial
  })
  const [addId, setAddId] = useState("")
  const [saved, setSaved] = useState(false)

  const selectedCategories = selectedIds
    .map(
      (id) =>
        ALL_CATEGORIES.find((c) => c.id === id) ??
        budget.categories.find((c) => c.id === id)
    )
    .filter(
      (c): c is { id: string; name: string; colour: string; icon: string } =>
        Boolean(c)
    )

  const totalAllocated = selectedIds.reduce(
    (sum, id) => sum + (allocations[id] || 0),
    0
  )
  const remaining = budget.totalAmount - totalAllocated
  const canSave = totalAllocated > 0 && remaining >= 0

  const addableCategories = useMemo(
    () => ALL_CATEGORIES.filter((c) => !selectedIds.includes(c.id)),
    [selectedIds]
  )

  function handleAmountChange(id: string, value: string) {
    const amount = Math.max(0, parseFloat(value) || 0)
    setAllocations((prev) => ({ ...prev, [id]: amount }))
    setSaved(false)
  }

  function handleRemove(id: string) {
    setSelectedIds((prev) => prev.filter((x) => x !== id))
    setSaved(false)
  }

  function handleAddCategory() {
    if (!addId || selectedIds.includes(addId)) return
    setSelectedIds((prev) => [...prev, addId])
    setAllocations((prev) => ({ ...prev, [addId]: prev[addId] || 0 }))
    setAddId("")
    setSaved(false)
  }

  function handleSave() {
    if (!canSave) return

    const categoryById = new Map(budget.categories.map((c) => [c.id, c]))
    const templateById = new Map(ALL_CATEGORIES.map((c) => [c.id, c]))

    const nextCategories = budget.categories.map((cat) =>
      selectedIds.includes(cat.id)
        ? { ...cat, allocated: allocations[cat.id] || 0 }
        : cat
    )

    selectedIds.forEach((id) => {
      if (categoryById.has(id)) return
      const template = templateById.get(id)
      if (!template) return
      nextCategories.push({
        ...template,
        allocated: allocations[id] || 0,
      })
    })

    onSave(nextCategories)
    setSaved(true)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Set Goals</h1>
        <p className="text-sm text-muted">
          Spread {formatCurrency(budget.totalAmount)} across categories
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Allocated</span>
          <span className="font-semibold">{formatCurrency(totalAllocated)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted">Remaining</span>
          <span
            className={`font-semibold ${
              remaining < 0
                ? "text-red-500"
                : remaining === 0
                  ? "text-accent"
                  : "text-foreground"
            }`}
          >
            {formatCurrency(remaining)}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {selectedCategories.map((category) => (
          <div
            key={category.id}
            className="flex items-center gap-2 rounded-xl border border-border bg-card p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{category.name}</p>
            </div>
            <div className="relative w-28">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted">
                £
              </span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={allocations[category.id] || ""}
                onChange={(e) => handleAmountChange(category.id, e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2 pl-6 pr-2 text-right text-sm font-medium outline-none transition-colors focus:border-accent"
              />
            </div>
            <button
              onClick={() => handleRemove(category.id)}
              className="rounded p-1 text-muted transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {addableCategories.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
          <select
            value={addId}
            onChange={(e) => setAddId(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          >
            <option value="">Add category...</option>
            {addableCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddCategory}
            disabled={!addId}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-white transition-opacity disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}

      {remaining < 0 && (
        <p className="text-xs text-red-500">
          You have allocated more than your budget total.
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={!canSave}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 font-semibold text-white transition-opacity disabled:opacity-40"
      >
        {saved ? <Check className="h-4 w-4" /> : null}
        {saved ? "Goals Saved" : "Save Goals"}
      </button>
    </div>
  )
}
