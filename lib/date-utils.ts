import { BudgetPeriod } from "@/lib/types"

function toLocalDate(date: string): Date {
  return new Date(`${date}T12:00:00`)
}

function formatAsDateInput(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function getAutoEndDate(
  period: BudgetPeriod,
  startDate: string
): string {
  if (!startDate || period === "termly") return ""

  const start = toLocalDate(startDate)

  if (period === "weekly") {
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return formatAsDateInput(end)
  }

  const end = new Date(start)
  end.setMonth(end.getMonth() + 1)
  end.setDate(end.getDate() - 1)
  return formatAsDateInput(end)
}
