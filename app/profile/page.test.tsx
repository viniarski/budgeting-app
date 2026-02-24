import { render, screen } from "@testing-library/react"
import ProfilePage from "@/app/profile/page"

const useBudgetMock = vi.fn()

vi.mock("@/contexts/budget-context", () => ({
  useBudget: () => useBudgetMock(),
}))

describe("ProfilePage", () => {
  it("renders profile metrics when onboarded", () => {
    useBudgetMock.mockReturnValue({
      isHydrated: true,
      state: {
        isOnboarded: true,
        budget: {
          name: "Monthly Budget",
          totalAmount: 1000,
          categories: [
            { id: "rent", name: "Rent", allocated: 500, colour: "bg-accent", icon: "Home" },
          ],
        },
        expenses: [
          { id: "e1", amount: 120, categoryId: "rent", description: "Rent", date: "2026-02-01" },
        ],
      },
    })

    render(<ProfilePage />)

    expect(screen.getByText("Profile")).toBeInTheDocument()
    expect(screen.getByText("£1000.00")).toBeInTheDocument()
    expect(screen.getByText("£120.00")).toBeInTheDocument()
  })

  it("shows setup prompt when not onboarded", () => {
    useBudgetMock.mockReturnValue({
      isHydrated: true,
      state: {
        isOnboarded: false,
        budget: null,
        expenses: [],
      },
    })

    render(<ProfilePage />)
    expect(screen.getByText(/You have not set up a budget yet/i)).toBeInTheDocument()
  })
})
