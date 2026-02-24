"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { DayPicker } from "react-day-picker"
import { CalendarDays } from "lucide-react"

interface DateFieldProps {
  id: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  ariaLabel: string
  labelId?: string
  describedBy?: string
  required?: boolean
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
  id,
  value,
  onChange,
  disabled = false,
  ariaLabel,
  labelId,
  describedBy,
  required = false,
}: DateFieldProps) {
  const [open, setOpen] = useState(false)
  const selected = useMemo(() => parseIsoDate(value), [value])
  const calendarId = `${id}-calendar`
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      if (!wrapperRef.current) return
      if (wrapperRef.current.contains(event.target as Node)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", onDocumentClick)
    return () => document.removeEventListener("mousedown", onDocumentClick)
  }, [])

  return (
    <div ref={wrapperRef} className="w-full max-w-full min-w-0 overflow-hidden">
      <button
        id={id}
        type="button"
        aria-label={ariaLabel}
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        aria-required={required}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={calendarId}
        data-value={value}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false)
        }}
        className="flex w-full max-w-full min-w-0 items-center justify-between overflow-hidden rounded-xl border border-border bg-card px-3 py-3 text-left text-sm text-foreground outline-none transition-colors focus:border-accent disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span className="truncate">{formatLabel(value)}</span>
        <CalendarDays className="ml-2 h-4 w-4 shrink-0 text-muted" />
      </button>

      {open && !disabled && (
        <div
          id={calendarId}
          role="dialog"
          aria-modal="false"
          aria-label={`${ariaLabel} calendar`}
          className="mt-2 overflow-x-auto rounded-xl border border-border bg-card p-2"
        >
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
