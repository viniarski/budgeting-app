import { render, screen } from "@testing-library/react"
import SaveSmartPage from "@/app/save-smart/page"

const replaceMock = vi.fn()
const useBudgetMock = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}))

vi.mock("@/contexts/budget-context", () => ({
  useBudget: () => useBudgetMock(),
}))

describe("SaveSmartPage", () => {
  it("renders loader when not hydrated", () => {
    useBudgetMock.mockReturnValue({
      isHydrated: false,
      state: { isOnboarded: false, budget: null, expenses: [] },
    })

    render(<SaveSmartPage />)
    expect(document.querySelector(".animate-spin")).toBeInTheDocument()
  })

  it("renders snapshot and 3 recommendations when budget exists", () => {
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
          endDate: "2099-12-31",
          categories: [
            { id: "food", name: "Food", allocated: 200, colour: "bg-accent", icon: "Home" },
            { id: "rent", name: "Rent", allocated: 400, colour: "bg-accent", icon: "Home" },
          ],
        },
        expenses: [
          { id: "e1", amount: 50, categoryId: "food", description: "Lunch", date: "2026-02-12" },
        ],
      },
    })

    render(<SaveSmartPage />)

    expect(screen.getByText("Save Smart")).toBeInTheDocument()
    expect(screen.getByText("AI Coach Snapshot")).toBeInTheDocument()
    expect(screen.getByText("Recommended Moves")).toBeInTheDocument()
    expect(screen.getAllByRole("listitem").length).toBe(3)
  })
})
