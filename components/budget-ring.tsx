"use client"

import { useEffect, useState } from "react"
import { getProgressColour } from "@/lib/budget-utils"

interface BudgetRingProps {
  spent: number
  total: number
  size?: number
}

export default function BudgetRing({ spent, total, size = 100 }: BudgetRingProps) {
  const [animatedPercent, setAnimatedPercent] = useState(0)
  const percentage = total > 0 ? Math.min(100, (spent / total) * 100) : 0

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedPercent(percentage), 100)
    return () => clearTimeout(timeout)
  }, [percentage])

  const radius = 40
  const strokeWidth = 7
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedPercent / 100) * circumference
  const colour = getProgressColour(percentage)

  const strokeColour =
    percentage >= 85
      ? "#ef4444"
      : percentage >= 60
        ? "#f59e0b"
        : "#10b981"

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#262626"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={strokeColour}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-sm font-bold ${colour}`}>
          {percentage.toFixed(0)}%
        </span>
        <span className="text-[10px] text-muted">used</span>
      </div>
    </div>
  )
}
