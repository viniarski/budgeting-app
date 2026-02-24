import { fireEvent, render, screen } from "@testing-library/react"
import ExpenseItem from "@/components/expense-item"

const category = {
  id: "food",
  name: "Food & Groceries",
  allocated: 200,
  colour: "bg-accent",
  icon: "UtensilsCrossed",
}

const expense = {
  id: "e1",
  amount: 12.5,
  categoryId: "food",
  description: "Lunch",
  date: "2026-02-12",
}

describe("ExpenseItem", () => {
  it("renders description and amount", () => {
    render(<ExpenseItem expense={expense} category={category} />)
    expect(screen.getByText("Lunch")).toBeInTheDocument()
    expect(screen.getByText("-£12.50")).toBeInTheDocument()
  })

  it("falls back to category name when description is empty", () => {
    render(
      <ExpenseItem
        expense={{ ...expense, description: "" }}
        category={category}
      />
    )

    expect(screen.getByText("Food & Groceries")).toBeInTheDocument()
  })

  it("calls delete callback", () => {
    const onDelete = vi.fn()
    render(<ExpenseItem expense={expense} category={category} onDelete={onDelete} />)

    fireEvent.click(screen.getByRole("button"))
    expect(onDelete).toHaveBeenCalledWith("e1")
  })
})
