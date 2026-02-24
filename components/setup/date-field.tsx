"use client"

import { useMemo, useState } from "react"
import { DayPicker } from "react-day-picker"
import { CalendarDays } from "lucide-react"

interface DateFieldProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  ariaLabel: string
}

function parseIsoDate(value: string): Date | undefined {
  if (!value) return undefined
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatLabel(value: string): string {
  const parsed = parseIsoDate(value)
  if (!parsed) return "Select date"
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default function DateField({
  value,
  onChange,
  disabled = false,
  ariaLabel,
}: DateFieldProps) {
  const [open, setOpen] = useState(false)
  const selected = useMemo(() => parseIsoDate(value), [value])

  return (
    <div className="w-full min-w-0">
      <button
        type="button"
        aria-label={ariaLabel}
        data-value={value}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full min-w-0 items-center justify-between rounded-xl border border-border bg-card px-3 py-3 text-left text-sm text-foreground outline-none transition-colors focus:border-accent disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span className="truncate">{formatLabel(value)}</span>
        <CalendarDays className="ml-2 h-4 w-4 shrink-0 text-muted" />
      </button>

      {open && !disabled && (
        <div className="mt-2 overflow-x-auto rounded-xl border border-border bg-card p-2">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(day) => {
              if (!day) return
              onChange(toIsoDate(day))
              setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
