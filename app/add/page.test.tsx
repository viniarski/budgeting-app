import { render, screen } from "@testing-library/react"
import AddExpensePage from "@/app/add/page"

const replaceMock = vi.fn()
const useBudgetMock = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}))

vi.mock("@/contexts/budget-context", () => ({
  useBudget: () => useBudgetMock(),
}))

vi.mock("@/components/add-expense-form", () => ({
  default: () => <div>Mock Add Form</div>,
}))

describe("AddExpensePage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows loader when not hydrated", () => {
    useBudgetMock.mockReturnValue({
      isHydrated: false,
      state: { isOnboarded: false, budget: null },
    })

    render(<AddExpensePage />)
    expect(document.querySelector(".animate-spin")).toBeInTheDocument()
  })

  it("renders add expense page when onboarded", () => {
    useBudgetMock.mockReturnValue({
      isHydrated: true,
      state: { isOnboarded: true, budget: { id: "b1" } },
    })

    render(<AddExpensePage />)
    expect(screen.getByText("Add Expense")).toBeInTheDocument()
    expect(screen.getByText("Mock Add Form")).toBeInTheDocument()
  })
})
