import { render, screen } from "@testing-library/react"
import CategoryCard from "@/components/category-card"

const category = {
  id: "food",
  name: "Food & Groceries",
  allocated: 200,
  colour: "bg-accent",
  icon: "UtensilsCrossed",
}

describe("CategoryCard", () => {
  it("renders compact card values", () => {
    render(<CategoryCard category={category} spent={50} compact />)
    expect(screen.getByText("Food & Groceries")).toBeInTheDocument()
    expect(screen.getByText("£50.00 / £200.00")).toBeInTheDocument()
  })

  it("renders default card with remaining amount", () => {
    render(<CategoryCard category={category} spent={120} />)
    expect(screen.getByText("£120.00 of £200.00")).toBeInTheDocument()
    expect(screen.getByText("£80.00 left")).toBeInTheDocument()
  })

  it("supports overspent state", () => {
    render(<CategoryCard category={category} spent={260} />)
    expect(screen.getByText("£-60.00 left")).toBeInTheDocument()
  })
})
