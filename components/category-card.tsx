"use client"

import { Category } from "@/lib/types"
import {
  formatCurrency,
  getSpentPercentage,
  getProgressBarColour,
} from "@/lib/budget-utils"
import * as Icons from "lucide-react"
import { LucideIcon } from "lucide-react"

interface CategoryCardProps {
  category: Category
  spent: number
  compact?: boolean
}

function getIcon(name: string): LucideIcon {
  return (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.CircleDot
}

export default function CategoryCard({
  category,
  spent,
  compact = false,
}: CategoryCardProps) {
  const percentage = getSpentPercentage(spent, category.allocated)
  const barColour = getProgressBarColour(percentage)
  const Icon = getIcon(category.icon)
  const remaining = category.allocated - spent

  if (compact) {
    return (
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="mb-2 flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-md ${category.colour} text-white`}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-medium">{category.name}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-border">
          <div
            className={`h-full rounded-full ${barColour} transition-all duration-500`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-muted">
          {formatCurrency(spent)} / {formatCurrency(category.allocated)}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${category.colour} text-white`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">{category.name}</p>
            <p className="text-xs text-muted">
              {formatCurrency(spent)} of {formatCurrency(category.allocated)}
            </p>
          </div>
        </div>
        <span
          className={`text-sm font-semibold ${
            remaining < 0 ? "text-red-500" : "text-foreground"
          }`}
        >
          {formatCurrency(remaining)} left
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full ${barColour} transition-all duration-500`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    </div>
  )
}
