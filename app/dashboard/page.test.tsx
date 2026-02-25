import { render, screen } from "@testing-library/react"
import DashboardPage from "@/app/dashboard/page"

const replaceMock = vi.fn()
const useBudgetMock = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}))

vi.mock("@/contexts/budget-context", () => ({
  useBudget: () => useBudgetMock(),
}))

vi.mock("@/lib/use-is-mobile", () => ({
  useIsMobile: () => false,
}))

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
}))

vi.mock("@/components/budget-ring", () => ({
  default: () => <div>Mock Budget Ring</div>,
}))

vi.mock("@/components/category-card", () => ({
  default: ({ category }: { category: { name: string } }) => <div>{category.name}</div>,
}))

vi.mock("@/components/expense-item", () => ({
  default: () => <div>Mock Expense Item</div>,
}))

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows loader while hydration is pending", () => {
    useBudgetMock.mockReturnValue({
      isHydrated: false,
      state: { isOnboarded: false, budget: null, expenses: [] },
    })

    render(<DashboardPage />)

    expect(document.querySelector(".animate-spin")).toBeInTheDocument()
  })

  it("redirects non-onboarded users to welcome page", () => {
    useBudgetMock.mockReturnValue({
      isHydrated: true,
      state: { isOnboarded: false, budget: null, expenses: [] },
    })

    render(<DashboardPage />)

    expect(replaceMock).toHaveBeenCalledWith("/")
  })

  it("renders dashboard data for onboarded users", () => {
    useBudgetMock.mockReturnValue({
      isHydrated: true,
      state: {
        isOnboarded: true,
        budget: {
          id: "b1",
          name: "Monthly Budget",
          totalAmount: 1200,
          period: "monthly",
          startDate: "2026-02-01",
          endDate: "2026-02-28",
          categories: [{ id: "rent", name: "Rent", allocated: 600, colour: "bg-accent", icon: "Home" }],
        },
        expenses: [],
      },
    })

    render(<DashboardPage />)

    expect(screen.getByRole("heading", { name: /monthly budget/i })).toBeInTheDocument()
    expect(screen.getByText("Total Remaining")).toBeInTheDocument()
    expect(screen.getByText("Categories")).toBeInTheDocument()
  })
})
