import { fireEvent, render, screen } from "@testing-library/react"
import CalculatorPage from "@/app/calculator/page"

describe("CalculatorPage", () => {
  it("renders heading", () => {
    render(<CalculatorPage />)
    expect(screen.getByText("Budget Calculator")).toBeInTheDocument()
  })

  it("shows calculated values after entering income", () => {
    render(<CalculatorPage />)

    fireEvent.change(screen.getByPlaceholderText("0.00"), {
      target: { value: "1000" },
    })

    expect(screen.getByText("£500.00")).toBeInTheDocument()
    expect(screen.getByText("£300.00")).toBeInTheDocument()
    expect(screen.getByText("£200.00")).toBeInTheDocument()
  })

  it("opens suggested breakdown", () => {
    render(<CalculatorPage />)

    fireEvent.change(screen.getByPlaceholderText("0.00"), {
      target: { value: "1000" },
    })

    fireEvent.click(screen.getByRole("button", { name: /Suggested Breakdown/i }))
    expect(screen.getByText(/Needs \(/i)).toBeInTheDocument()
  })
})
