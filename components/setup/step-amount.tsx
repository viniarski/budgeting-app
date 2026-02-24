"use client"

import { BudgetPeriod } from "@/lib/types"
import { getAutoEndDate } from "@/lib/date-utils"
import {
  CalendarDays,
  PoundSterling,
  CalendarRange,
  CalendarCheck,
  Clock,
} from "lucide-react"

interface StepAmountProps {
  amount: string
  period: BudgetPeriod
  startDate: string
  endDate: string
  onAmountChange: (value: string) => void
  onPeriodChange: (value: BudgetPeriod) => void
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onNext: () => void
}

const periods: { value: BudgetPeriod; label: string; desc: string; icon: typeof Clock }[] = [
  {
    value: "weekly",
    label: "Weekly",
    desc: "Reset every week",
    icon: Clock,
  },
  {
    value: "monthly",
    label: "Monthly",
    desc: "Reset every month",
    icon: CalendarCheck,
  },
  {
    value: "termly",
    label: "Termly",
    desc: "Full term budget",
    icon: CalendarRange,
  },
]

export default function StepAmount({
  amount,
  period,
  startDate,
  endDate,
  onAmountChange,
  onPeriodChange,
  onStartDateChange,
  onEndDateChange,
  onNext,
}: StepAmountProps) {
  const isTermly = period === "termly"
  const effectiveEndDate = isTermly ? endDate : getAutoEndDate(period, startDate)
  const isValid =
    amount &&
    parseFloat(amount) > 0 &&
    startDate &&
    effectiveEndDate &&
    effectiveEndDate > startDate

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Set up your budget</h2>
        <p className="mt-1 text-sm text-muted">
          Choose how you want to budget and set your amount.
        </p>
      </div>

      {/* Period selector */}
      <div>
        <label className="mb-2 block text-sm text-muted">Budget Period</label>
        <div className="grid grid-cols-3 gap-2">
          {periods.map((p) => {
            const isSelected = period === p.value
            const Icon = p.icon
            return (
              <button
                key={p.value}
                onClick={() => onPeriodChange(p.value)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                  isSelected
                    ? "border-accent bg-accent/10"
                    : "border-border bg-card hover:border-accent/50"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${isSelected ? "text-accent" : "text-muted"}`}
                />
                <span className="text-xs font-semibold">{p.label}</span>
                <span className="text-[10px] leading-tight text-muted">
                  {p.desc}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="mb-1.5 block text-sm text-muted">
          {period === "weekly"
            ? "Weekly Budget"
            : period === "monthly"
              ? "Monthly Budget"
              : "Total Loan Amount"}
        </label>
        <div className="relative">
          <PoundSterling className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            type="number"
            inputMode="decimal"
            placeholder={period === "termly" ? "4,500" : period === "monthly" ? "1,200" : "300"}
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-lg font-semibold text-foreground outline-none transition-colors focus:border-accent"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm text-muted">
            <CalendarDays className="mr-1 inline h-3.5 w-3.5" />
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-3 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-muted">
            <CalendarDays className="mr-1 inline h-3.5 w-3.5" />
            End Date {isTermly ? "" : "(auto)"}
          </label>
          <input
            type="date"
            value={effectiveEndDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            disabled={!isTermly}
            className="w-full rounded-xl border border-border bg-card px-3 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent disabled:cursor-not-allowed disabled:opacity-70"
          />
          {!isTermly && (
            <p className="mt-1 text-[11px] text-muted">
              Calculated automatically from your start date.
            </p>
          )}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        className="w-full rounded-xl bg-accent py-3 font-semibold text-white transition-opacity disabled:opacity-40"
      >
        Next
      </button>
    </div>
  )
}
