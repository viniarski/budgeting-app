"use client"

import { useState } from "react"
import { formatCurrency } from "@/lib/budget-utils"
import {
  PoundSterling,
  Home,
  UtensilsCrossed,
  Bus,
  PartyPopper,
  PiggyBank,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

type RuleType = "50/30/20" | "70/20/10" | "custom"

const RULES: {
  value: RuleType
  label: string
  desc: string
  needs: number
  wants: number
  savings: number
}[] = [
  {
    value: "50/30/20",
    label: "50 / 30 / 20",
    desc: "Balanced approach",
    needs: 50,
    wants: 30,
    savings: 20,
  },
  {
    value: "70/20/10",
    label: "70 / 20 / 10",
    desc: "Essentials first",
    needs: 70,
    wants: 20,
    savings: 10,
  },
  {
    value: "custom",
    label: "Custom",
    desc: "Set your own split",
    needs: 50,
    wants: 30,
    savings: 20,
  },
]

const BREAKDOWN_ITEMS = [
  {
    label: "Rent",
    category: "needs" as const,
    percentage: 40,
    icon: Home,
  },
  {
    label: "Groceries",
    category: "needs" as const,
    percentage: 30,
    icon: UtensilsCrossed,
  },
  {
    label: "Transport",
    category: "needs" as const,
    percentage: 15,
    icon: Bus,
  },
  {
    label: "Bills & Subs",
    category: "needs" as const,
    percentage: 15,
    icon: Lightbulb,
  },
  {
    label: "Going Out",
    category: "wants" as const,
    percentage: 50,
    icon: PartyPopper,
  },
  {
    label: "Shopping",
    category: "wants" as const,
    percentage: 30,
    icon: PartyPopper,
  },
  {
    label: "Hobbies",
    category: "wants" as const,
    percentage: 20,
    icon: PartyPopper,
  },
]

export default function CalculatorPage() {
  const [income, setIncome] = useState("")
  const [selectedRule, setSelectedRule] = useState<RuleType>("50/30/20")
  const [customNeeds, setCustomNeeds] = useState(50)
  const [customWants, setCustomWants] = useState(30)
  const [customSavings, setCustomSavings] = useState(20)
  const [period, setPeriod] = useState<"monthly" | "weekly" | "termly">(
    "monthly"
  )
  const [showBreakdown, setShowBreakdown] = useState(false)

  const rule = RULES.find((r) => r.value === selectedRule)!
  const needs =
    selectedRule === "custom" ? customNeeds : rule.needs
  const wants =
    selectedRule === "custom" ? customWants : rule.wants
  const savings =
    selectedRule === "custom" ? customSavings : rule.savings

  const raw = parseFloat(income) || 0
  const monthly =
    period === "weekly" ? raw * 4.33 : period === "termly" ? raw / 4 : raw

  const needsAmount = (monthly * needs) / 100
  const wantsAmount = (monthly * wants) / 100
  const savingsAmount = (monthly * savings) / 100

  const weekly = monthly / 4.33
  const daily = monthly / 30

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-center text-xl font-bold uppercase tracking-wide">
          Budget Calculator
        </h1>
        <p className="text-center text-xs text-muted">
          Plan how to split your money
        </p>
      </div>

      {/* Income input */}
      <div className="rounded-xl border border-border bg-card p-4">
        <label className="mb-2 block text-sm font-medium">Your Income</label>
        <div className="relative mb-3">
          <PoundSterling className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-xl font-bold text-foreground outline-none transition-colors focus:border-accent"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(["weekly", "monthly", "termly"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg border py-1.5 text-xs font-medium capitalize transition-all ${
                period === p
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted hover:border-accent/50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Budget rule selector */}
      <div>
        <label className="mb-2 block text-sm font-medium">Budget Rule</label>
        <div className="grid grid-cols-3 gap-2">
          {RULES.map((r) => (
            <button
              key={r.value}
              onClick={() => setSelectedRule(r.value)}
              className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-all ${
                selectedRule === r.value
                  ? "border-accent bg-accent/10"
                  : "border-border bg-card hover:border-accent/50"
              }`}
            >
              <span className="text-xs font-bold">{r.label}</span>
              <span className="text-[10px] text-muted">{r.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom sliders */}
      {selectedRule === "custom" && (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          {[
            { label: "Needs", value: customNeeds, set: setCustomNeeds },
            { label: "Wants", value: customWants, set: setCustomWants },
            { label: "Savings", value: customSavings, set: setCustomSavings },
          ].map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-muted">{item.label}</span>
                <span className="font-medium">{item.value}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={item.value}
                onChange={(e) => item.set(parseInt(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
          ))}
          {needs + wants + savings !== 100 && (
            <p className="text-xs text-red-500">
              Total must equal 100% (currently {needs + wants + savings}%)
            </p>
          )}
        </div>
      )}

      {/* Results */}
      {raw > 0 && (
        <>
          {/* Monthly breakdown */}
          <div className="space-y-2">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium">Needs</span>
                </div>
                <span className="text-lg font-bold text-emerald-500">
                  {formatCurrency(needsAmount)}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted">
                {needs}% — Rent, food, bills, transport
              </p>
            </div>

            <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium">Wants</span>
                </div>
                <span className="text-lg font-bold text-blue-500">
                  {formatCurrency(wantsAmount)}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted">
                {wants}% — Going out, shopping, hobbies
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="text-sm font-medium">Savings</span>
                </div>
                <span className="text-lg font-bold text-amber-500">
                  {formatCurrency(savingsAmount)}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted">
                {savings}% — Emergency fund, goals
              </p>
            </div>
          </div>

          {/* Stacked bar */}
          <div className="flex h-4 overflow-hidden rounded-full">
            <div
              className="bg-emerald-500 transition-all duration-500"
              style={{ width: `${needs}%` }}
            />
            <div
              className="bg-blue-500 transition-all duration-500"
              style={{ width: `${wants}%` }}
            />
            <div
              className="bg-amber-500 transition-all duration-500"
              style={{ width: `${savings}%` }}
            />
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <p className="text-[10px] text-muted">Monthly</p>
              <p className="text-sm font-bold">{formatCurrency(monthly)}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <p className="text-[10px] text-muted">Weekly</p>
              <p className="text-sm font-bold">{formatCurrency(weekly)}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <p className="text-[10px] text-muted">Daily</p>
              <p className="text-sm font-bold">{formatCurrency(daily)}</p>
            </div>
          </div>

          {/* Detailed breakdown */}
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-accent/50"
          >
            Suggested Breakdown
            {showBreakdown ? (
              <ChevronUp className="h-4 w-4 text-muted" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted" />
            )}
          </button>

          {showBreakdown && (
            <div className="space-y-4">
              {/* Needs breakdown */}
              <div>
                <p className="mb-2 text-xs font-semibold text-muted">
                  Needs ({formatCurrency(needsAmount)}/mo)
                </p>
                <div className="space-y-1.5">
                  {BREAKDOWN_ITEMS.filter((i) => i.category === "needs").map(
                    (item) => {
                      const amt = (needsAmount * item.percentage) / 100
                      const Icon = item.icon
                      return (
                        <div
                          key={item.label}
                          className="flex items-center gap-3 rounded-lg border border-border bg-card p-2.5"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 text-accent">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="flex-1 text-sm">{item.label}</span>
                          <span className="text-sm font-semibold">
                            {formatCurrency(amt)}
                          </span>
                        </div>
                      )
                    }
                  )}
                </div>
              </div>

              {/* Savings tip */}
              <div className="flex items-start gap-3 rounded-xl border border-accent/20 bg-accent/5 p-3">
                <PiggyBank className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                <div>
                  <p className="text-sm font-medium">Saving Tip</p>
                  <p className="mt-0.5 text-xs text-muted">
                    Putting away {formatCurrency(savingsAmount)}/month gives you{" "}
                    {formatCurrency(savingsAmount * 12)} in a year. Even small
                    amounts add up!
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
