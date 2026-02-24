"use client"

import { BudgetPeriod } from "@/lib/types"
import { getAutoEndDate } from "@/lib/date-utils"
import DateField from "@/components/setup/date-field"
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
  const amountLabel =
    period === "weekly"
      ? "Weekly Budget"
      : period === "monthly"
        ? "Monthly Budget"
        : "Total Loan Amount"
  const isValid =
    amount &&
    parseFloat(amount) > 0 &&
    startDate &&
    effectiveEndDate &&
    effectiveEndDate > startDate

  return (
    <div className="w-full min-w-0 space-y-6 overflow-x-hidden">
      <div>
        <h2 className="font-heading text-2xl font-bold">Set up your budget</h2>
        <p className="mt-1 text-sm text-muted">
          Choose how you want to budget and set your amount.
        </p>
      </div>

      {/* Period selector */}
      <fieldset className="min-w-0">
        <legend id="budget-period-label" className="mb-2 block text-sm text-muted">
          Budget Period
        </legend>
        <div
          role="radiogroup"
          aria-labelledby="budget-period-label"
          className="grid grid-cols-3 gap-2"
        >
          {periods.map((p) => {
            const isSelected = period === p.value
            const Icon = p.icon
            return (
              <button
                key={p.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${p.label}: ${p.desc}`}
                onClick={() => onPeriodChange(p.value)}
                className={`flex min-w-0 flex-col items-center gap-1.5 rounded-xl border p-2 transition-all sm:p-3 ${
                  isSelected
                    ? "border-accent bg-accent/10"
                    : "border-border bg-card hover:border-accent/50"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${isSelected ? "text-accent" : "text-muted"}`}
                />
                <span className="truncate text-xs font-semibold">{p.label}</span>
                <span className="truncate text-[10px] leading-tight text-muted">
                  {p.desc}
                </span>
              </button>
            )
          })}
        </div>
      </fieldset>

      {/* Amount */}
      <div>
        <label htmlFor="setup-budget-amount" className="mb-1.5 block text-sm text-muted">
          {amountLabel}
        </label>
        <div className="relative">
          <PoundSterling
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
          />
          <input
            id="setup-budget-amount"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            required
            placeholder={period === "termly" ? "4,500" : period === "monthly" ? "1,200" : "300"}
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            aria-invalid={!!amount && parseFloat(amount) <= 0}
            className="font-heading w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-lg text-foreground outline-none transition-colors focus:border-accent"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="min-w-0">
          <label id="setup-start-date-label" className="mb-1.5 block text-sm text-muted">
            <CalendarDays className="mr-1 inline h-3.5 w-3.5" />
            Start Date
          </label>
          <DateField
            id="setup-start-date"
            value={startDate}
            onChange={onStartDateChange}
            ariaLabel="Start Date"
            labelId="setup-start-date-label"
            required
          />
        </div>
        <div className="min-w-0">
          <label id="setup-end-date-label" className="mb-1.5 block text-sm text-muted">
            <CalendarDays className="mr-1 inline h-3.5 w-3.5" />
            End Date {isTermly ? "" : "(auto)"}
          </label>
          <DateField
            id="setup-end-date"
            value={effectiveEndDate}
            onChange={onEndDateChange}
            disabled={!isTermly}
            ariaLabel="End Date"
            labelId="setup-end-date-label"
            describedBy={!isTermly ? "setup-end-date-help" : undefined}
            required
          />
          {!isTermly && (
            <p id="setup-end-date-help" className="mt-1 text-[11px] text-muted">
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
