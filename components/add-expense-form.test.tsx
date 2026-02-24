import { fireEvent, render, screen } from "@testing-library/react"
import AddExpenseForm from "@/components/add-expense-form"

const pushMock = vi.fn()
const dispatchMock = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}))

vi.mock("@/contexts/budget-context", () => ({
  useBudget: () => ({
    state: {
      budget: {
        categories: [
          {
            id: "rent",
            name: "Rent",
            allocated: 500,
            colour: "bg-accent",
            icon: "Home",
          },
        ],
      },
    },
    dispatch: dispatchMock,
  }),
}))

describe("AddExpenseForm", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    vi.stubGlobal("crypto", { randomUUID: () => "exp-123" })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it("keeps submit disabled until amount and category are selected", () => {
    render(<AddExpenseForm />)
    const submit = screen.getByRole("button", { name: "Add Expense" })
    expect(submit).toBeDisabled()

    fireEvent.change(screen.getByPlaceholderText("0.00"), {
      target: { value: "20" },
    })
    expect(submit).toBeDisabled()

    fireEvent.click(screen.getByRole("button", { name: "Rent" }))
    expect(submit).not.toBeDisabled()
  })

  it("dispatches ADD_EXPENSE and redirects after submit", () => {
    render(<AddExpenseForm />)

    fireEvent.change(screen.getByPlaceholderText("0.00"), {
      target: { value: "20.5" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Rent" }))
    fireEvent.change(screen.getByPlaceholderText("e.g. Weekly shop"), {
      target: { value: "Test" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Add Expense" }))

    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "ADD_EXPENSE",
        payload: expect.objectContaining({
          id: "exp-123",
          amount: 20.5,
          categoryId: "rent",
          description: "Test",
        }),
      })
    )

    expect(screen.getByText("Expense Added!")).toBeInTheDocument()

    vi.advanceTimersByTime(800)
    expect(pushMock).toHaveBeenCalledWith("/")
  })
})
