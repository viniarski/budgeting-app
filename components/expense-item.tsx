"use client"

import { Expense, Category } from "@/lib/types"
import { formatCurrency } from "@/lib/budget-utils"
import * as Icons from "lucide-react"
import { LucideIcon, Trash2 } from "lucide-react"

interface ExpenseItemProps {
  expense: Expense
  category: Category | undefined
  onDelete?: (id: string) => void
}

function getIcon(name: string): LucideIcon {
  return (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.CircleDot
}

export default function ExpenseItem({
  expense,
  category,
  onDelete,
}: ExpenseItemProps) {
  const Icon = category ? getIcon(category.icon) : Icons.CircleDot

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
          category?.colour ?? "bg-gray-500"
        } text-white`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">
          {expense.description || category?.name || "Expense"}
        </p>
        <p className="text-xs text-muted">
          {new Date(expense.date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
          })}
        </p>
      </div>
      <span className="text-sm font-semibold text-accent">
        -{formatCurrency(expense.amount)}
      </span>
      {onDelete && (
        <button
          onClick={() => onDelete(expense.id)}
          className="ml-1 text-muted transition-colors hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
