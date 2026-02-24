import { fireEvent, render, screen } from "@testing-library/react"
import HistoryPage from "@/app/history/page"

const replaceMock = vi.fn()
const dispatchMock = vi.fn()
const useBudgetMock = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}))

vi.mock("@/contexts/budget-context", () => ({
  useBudget: () => useBudgetMock(),
}))

vi.mock("@/components/expense-item", () => ({
  default: ({ expense, onDelete }: { expense: { id: string; description: string }; onDelete?: (id: string) => void }) => (
    <button onClick={() => onDelete?.(expense.id)}>{expense.description}</button>
  ),
}))

describe("HistoryPage", () => {
  it("renders totals and supports deleting expense", () => {
    useBudgetMock.mockReturnValue({
      isHydrated: true,
      dispatch: dispatchMock,
      state: {
        isOnboarded: true,
        budget: {
          categories: [{ id: "food", name: "Food", allocated: 100, colour: "bg-accent", icon: "Home" }],
        },
        expenses: [
          { id: "e1", amount: 20, categoryId: "food", description: "Lunch", date: "2026-02-01" },
          { id: "e2", amount: 10, categoryId: "food", description: "Snack", date: "2026-02-02" },
        ],
      },
    })

    render(<HistoryPage />)

    expect(screen.getByText("Expense History")).toBeInTheDocument()
    expect(screen.getByText("£30.00")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Lunch"))
    expect(dispatchMock).toHaveBeenCalledWith({ type: "DELETE_EXPENSE", payload: "e1" })
  })
})
