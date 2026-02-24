import { render, screen } from "@testing-library/react"
import BudgetRing from "@/components/budget-ring"

describe("BudgetRing", () => {
  it("renders percentage label", () => {
    render(<BudgetRing spent={50} total={100} />)
    expect(screen.getByText("50%")).toBeInTheDocument()
    expect(screen.getByText("used")).toBeInTheDocument()
  })

  it("clamps percentage to 100", () => {
    render(<BudgetRing spent={250} total={100} />)
    expect(screen.getByText("100%")).toBeInTheDocument()
  })

  it("uses zero percent when total is zero", () => {
    render(<BudgetRing spent={100} total={0} />)
    expect(screen.getByText("0%")).toBeInTheDocument()
  })
})
