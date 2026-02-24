import { fireEvent, render, screen } from "@testing-library/react"
import StepAmount from "@/components/setup/step-amount"

describe("StepAmount", () => {
  it("shows auto end date for monthly period and disables end-date input", () => {
    render(
      <StepAmount
        amount="1200"
        period="monthly"
        startDate="2026-02-01"
        endDate=""
        onAmountChange={vi.fn()}
        onPeriodChange={vi.fn()}
        onStartDateChange={vi.fn()}
        onEndDateChange={vi.fn()}
        onNext={vi.fn()}
      />
    )

    const allDateInputs = document.querySelectorAll('input[type="date"]')
    expect((allDateInputs[1] as HTMLInputElement).disabled).toBe(true)
    expect((allDateInputs[1] as HTMLInputElement).value).toBe("2026-02-28")
  })

  it("calls onPeriodChange when period button is clicked", () => {
    const onPeriodChange = vi.fn()

    render(
      <StepAmount
        amount="1200"
        period="monthly"
        startDate="2026-02-01"
        endDate=""
        onAmountChange={vi.fn()}
        onPeriodChange={onPeriodChange}
        onStartDateChange={vi.fn()}
        onEndDateChange={vi.fn()}
        onNext={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: /weekly/i }))
    expect(onPeriodChange).toHaveBeenCalledWith("weekly")
  })

  it("disables Next when form is invalid", () => {
    render(
      <StepAmount
        amount=""
        period="monthly"
        startDate=""
        endDate=""
        onAmountChange={vi.fn()}
        onPeriodChange={vi.fn()}
        onStartDateChange={vi.fn()}
        onEndDateChange={vi.fn()}
        onNext={vi.fn()}
      />
    )

    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled()
  })
})
