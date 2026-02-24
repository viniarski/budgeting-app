import { render, screen } from "@testing-library/react"
import TrackSpendPage from "@/app/track-spend/page"

const replaceMock = vi.fn()
const useBudgetMock = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}))

vi.mock("@/contexts/budget-context", () => ({
  useBudget: () => useBudgetMock(),
}))

describe("TrackSpendPage", () => {
  it("shows loader when not hydrated", () => {
    useBudgetMock.mockReturnValue({
      isHydrated: false,
      state: { isOnboarded: false, budget: null, expenses: [] },
    })

    render(<TrackSpendPage />)
    expect(document.querySelector(".animate-spin")).toBeInTheDocument()
  })

  it("renders analytics sections", () => {
    useBudgetMock.mockReturnValue({
      isHydrated: true,
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
            { id: "food", name: "Food", allocated: 200, colour: "bg-accent", icon: "Home" },
          ],
        },
        expenses: [
          { id: "e1", amount: 30, categoryId: "food", description: "Lunch", date: "2026-02-10" },
        ],
      },
    })

    render(<TrackSpendPage />)

    expect(screen.getByText("Track Spend")).toBeInTheDocument()
    expect(screen.getByText("Budget Details")).toBeInTheDocument()
    expect(screen.getByText("Category Allocations")).toBeInTheDocument()
    expect(screen.getByText("Total Spent")).toBeInTheDocument()
  })
})
