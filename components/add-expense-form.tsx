"use client"

import { useState } from "react"
import { useBudget } from "@/contexts/budget-context"
import { Expense } from "@/lib/types"
import * as Icons from "lucide-react"
import { LucideIcon, Check } from "lucide-react"
import { useRouter } from "next/navigation"

function getIcon(name: string): LucideIcon {
  return (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.CircleDot
}

function isValidAmountInput(value: string): boolean {
  return /^\d*\.?\d*$/.test(value)
}

export default function AddExpenseForm() {
  const router = useRouter()
  const { state, dispatch } = useBudget()
  const [amount, setAmount] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [submitted, setSubmitted] = useState(false)

  const categories = state.budget?.categories ?? []

  function handleSubmit() {
    if (!amount || parseFloat(amount) <= 0 || !categoryId) return

    const expense: Expense = {
      id: crypto.randomUUID(),
      amount: parseFloat(amount),
      categoryId,
      description,
      date,
    }

    dispatch({ type: "ADD_EXPENSE", payload: expense })
    setSubmitted(true)
    setTimeout(() => router.push("/dashboard"), 800)
  }

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success text-white">
          <Check className="h-8 w-8" />
        </div>
        <p className="font-heading mt-4 text-lg">Expense Added!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1.5 block text-sm text-muted">Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-muted">
            £
          </span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              const nextValue = e.target.value
              if (!isValidAmountInput(nextValue)) return
              setAmount(nextValue)
            }}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-"].includes(e.key)) {
                e.preventDefault()
              }
            }}
            className="font-heading w-full rounded-xl border border-border bg-card py-4 pl-12 pr-4 text-4xl text-foreground outline-none transition-colors focus:border-accent"
            autoFocus
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm text-muted">Category</label>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat) => {
            const Icon = getIcon(cat.icon)
            const isSelected = categoryId === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                  isSelected
                    ? "border-accent bg-accent/10"
                    : "border-border bg-card hover:border-accent/50"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${cat.colour} text-white`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">{cat.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-muted">
          Description (optional)
        </label>
        <input
          type="text"
          placeholder="e.g. Weekly shop"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-muted">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!amount || parseFloat(amount) <= 0 || !categoryId}
        className="w-full rounded-xl bg-accent py-3 font-semibold text-white transition-opacity disabled:opacity-40"
      >
        Add Expense
      </button>
    </div>
  )
}
