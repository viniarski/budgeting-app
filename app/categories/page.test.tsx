import { fireEvent, render, screen } from "@testing-library/react"
import CategoriesPage from "@/app/categories/page"

const replaceMock = vi.fn()
const dispatchMock = vi.fn()
const useBudgetMock = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}))

vi.mock("@/contexts/budget-context", () => ({
  useBudget: () => useBudgetMock(),
}))

vi.mock("@/components/category-card", () => ({
  default: ({ category }: { category: { name: string } }) => <div>{category.name}</div>,
}))

vi.mock("@/components/expense-item", () => ({
  default: ({ onDelete, expense }: { onDelete?: (id: string) => void; expense: { id: string } }) => (
    <button onClick={() => onDelete?.(expense.id)}>delete-expense</button>
  ),
}))

describe("CategoriesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders categories and allows deleting expense", () => {
    useBudgetMock.mockReturnValue({
      isHydrated: true,
      dispatch: dispatchMock,
      state: {
        isOnboarded: true,
        budget: {
          categories: [
            { id: "food", name: "Food", allocated: 100, colour: "bg-accent", icon: "Home" },
          ],
        },
        expenses: [
          { id: "e1", amount: 10, categoryId: "food", description: "x", date: "2026-02-01" },
        ],
      },
    })

    render(<CategoriesPage />)

    expect(screen.getByText("Categories")).toBeInTheDocument()
    expect(screen.getByText("Food")).toBeInTheDocument()

    fireEvent.click(screen.getByText("delete-expense"))
    expect(dispatchMock).toHaveBeenCalledWith({ type: "DELETE_EXPENSE", payload: "e1" })
  })
})
