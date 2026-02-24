"use client"

import { useState } from "react"
import { ALL_CATEGORIES, CategoryTemplate } from "@/lib/constants"
import { formatCurrency } from "@/lib/budget-utils"
import * as Icons from "lucide-react"
import { LucideIcon, Plus, X, Check } from "lucide-react"

interface StepCategoriesProps {
  totalAmount: number
  selectedIds: string[]
  allocations: Record<string, number>
  customCategories: CategoryTemplate[]
  onToggleCategory: (id: string) => void
  onAddCustom: (cat: CategoryTemplate) => void
  onRemoveCustom: (id: string) => void
  onAllocationChange: (categoryId: string, value: number) => void
  onComplete: () => void
  onBack: () => void
}

function getIcon(name: string): LucideIcon {
  return (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.CircleDot
}

export default function StepCategories({
  totalAmount,
  selectedIds,
  allocations,
  customCategories,
  onToggleCategory,
  onAddCustom,
  onRemoveCustom,
  onAllocationChange,
  onComplete,
  onBack,
}: StepCategoriesProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [customName, setCustomName] = useState("")

  const allAvailable = [...ALL_CATEGORIES, ...customCategories]
  const selectedCats = allAvailable.filter((c) => selectedIds.includes(c.id))
  const unselectedCats = ALL_CATEGORIES.filter((c) => !selectedIds.includes(c.id))

  const totalAllocated = selectedIds.reduce(
    (sum, id) => sum + (allocations[id] || 0),
    0
  )
  const remaining = totalAmount - totalAllocated
  const isValid = totalAllocated > 0 && totalAllocated <= totalAmount

  function handleAddCustom() {
    const name = customName.trim()
    if (!name) return
    const id = `custom-${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`
    onAddCustom({ id, name, colour: "bg-accent", icon: "Tag" })
    setCustomName("")
  }

  if (showPicker) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold">Add Categories</h2>
            <p className="mt-1 text-sm text-muted">
              Tap to add or remove categories
            </p>
          </div>
          <button
            onClick={() => setShowPicker(false)}
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white"
          >
            Done
          </button>
        </div>

        {/* Add custom */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Custom category name..."
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
            className="flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent"
          />
          <button
            onClick={handleAddCustom}
            disabled={!customName.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Custom categories */}
        {customCategories.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold text-muted">Your Categories</p>
            <div className="flex flex-wrap gap-2">
              {customCategories.map((cat) => {
                const isSelected = selectedIds.includes(cat.id)
                return (
                  <div key={cat.id} className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleCategory(cat.id)}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                        isSelected
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border text-muted"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                      {cat.name}
                    </button>
                    <button
                      onClick={() => onRemoveCustom(cat.id)}
                      className="text-muted hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Available categories */}
        <div>
          <p className="mb-2 text-xs font-semibold text-muted">Available</p>
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map((cat) => {
              const isSelected = selectedIds.includes(cat.id)
              const Icon = getIcon(cat.icon)
              return (
                <button
                  key={cat.id}
                  onClick={() => onToggleCategory(cat.id)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                    isSelected
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted hover:border-accent/50"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.name}
                  {isSelected && <Check className="h-3 w-3" />}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading text-2xl font-bold">Assign your money</h2>
        <p className="mt-1 text-sm text-muted">
          Split {formatCurrency(totalAmount)} across your spending categories.
        </p>
      </div>

      {/* Unallocated bar */}
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Unallocated</span>
          <span
            className={`font-bold ${
              remaining < 0
                ? "text-danger"
                : remaining === 0
                  ? "text-accent"
                  : "text-foreground"
            }`}
          >
            {formatCurrency(remaining)}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{
              width: `${Math.min(100, (totalAllocated / totalAmount) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Selected categories with amounts */}
      <div className="space-y-2">
        {selectedCats.map((cat) => {
          const Icon = getIcon(cat.icon)
          const value = allocations[cat.id] || 0
          return (
            <div
              key={cat.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                <Icon className="h-4 w-4 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{cat.name}</p>
              </div>
              <div className="relative w-24">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted">
                  £
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={value || ""}
                  onChange={(e) =>
                    onAllocationChange(cat.id, parseFloat(e.target.value) || 0)
                  }
                  className="w-full rounded-lg border border-border bg-background py-2 pl-6 pr-2 text-right text-sm font-medium text-foreground outline-none focus:border-accent"
                />
              </div>
              <button
                onClick={() => onToggleCategory(cat.id)}
                className="text-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>

      {/* Add more button */}
      <button
        onClick={() => setShowPicker(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-accent"
      >
        <Plus className="h-4 w-4" />
        Add Category
      </button>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-xl border border-border py-3 font-semibold text-foreground transition-colors hover:bg-card"
        >
          Back
        </button>
        <button
          onClick={onComplete}
          disabled={!isValid}
          className="flex-1 rounded-xl bg-accent py-3 font-semibold text-white transition-opacity disabled:opacity-40"
        >
          Start Budgeting
        </button>
      </div>
    </div>
  )
}
