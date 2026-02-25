import { fireEvent, render, screen } from "@testing-library/react"
import GoalsPage from "@/app/goals/page"

const replaceMock = vi.fn()
const pushMock = vi.fn()
const dispatchMock = vi.fn()
const useBudgetMock = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: pushMock }),
}))

vi.mock("@/contexts/budget-context", () => ({
  useBudget: () => useBudgetMock(),
}))

describe("GoalsPage", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("renders set goals page", () => {
    useBudgetMock.mockReturnValue({
      isHydrated: true,
      dispatch: dispatchMock,
      state: {
        isOnboarded: true,
        budget: {
          id: "b1",
          name: "Monthly Budget",
          totalAmount: 1000,
          period: "monthly",
          startDate: "2026-02-01",
          endDate: "2026-02-28",
          categories: [
            { id: "rent", name: "Rent", allocated: 400, colour: "bg-accent", icon: "Home" },
            { id: "food", name: "Food & Groceries", allocated: 200, colour: "bg-accent", icon: "UtensilsCrossed" },
          ],
        },
      },
    })

    render(<GoalsPage />)

    expect(screen.getByText("Set Goals")).toBeInTheDocument()
    expect(screen.getByText("Save Goals")).toBeInTheDocument()
  })

  it("saves goals and dispatches SET_BUDGET", () => {
    useBudgetMock.mockReturnValue({
      isHydrated: true,
      dispatch: dispatchMock,
      state: {
        isOnboarded: true,
        budget: {
          id: "b1",
          name: "Monthly Budget",
          totalAmount: 1000,
          period: "monthly",
          startDate: "2026-02-01",
          endDate: "2026-02-28",
          categories: [
            { id: "rent", name: "Rent", allocated: 400, colour: "bg-accent", icon: "Home" },
            { id: "food", name: "Food & Groceries", allocated: 200, colour: "bg-accent", icon: "UtensilsCrossed" },
          ],
        },
      },
    })

    render(<GoalsPage />)

    fireEvent.click(screen.getByRole("button", { name: "Save Goals" }))

    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "SET_BUDGET",
      })
    )

    vi.advanceTimersByTime(500)
    expect(pushMock).toHaveBeenCalledWith("/dashboard")
  })
})
