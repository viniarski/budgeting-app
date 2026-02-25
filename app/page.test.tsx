import { render, screen } from "@testing-library/react"
import WelcomePage from "@/app/page"

const replaceMock = vi.fn()
const useBudgetMock = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}))

vi.mock("@/contexts/budget-context", () => ({
  useBudget: () => useBudgetMock(),
}))

describe("WelcomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows loading state while hydration is pending", () => {
    useBudgetMock.mockReturnValue({
      isHydrated: false,
      state: { isOnboarded: false, budget: null },
    })

    render(<WelcomePage />)

    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  it("renders onboarding welcome content for new users", () => {
    useBudgetMock.mockReturnValue({
      isHydrated: true,
      state: { isOnboarded: false, budget: null },
    })

    render(<WelcomePage />)

    expect(screen.getByText("Welcome to UniWallet")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /set up your budget/i })).toBeInTheDocument()
    expect(replaceMock).not.toHaveBeenCalled()
  })

  it("redirects onboarded users to dashboard", () => {
    useBudgetMock.mockReturnValue({
      isHydrated: true,
      state: { isOnboarded: true, budget: { id: "b1" } },
    })

    render(<WelcomePage />)

    expect(replaceMock).toHaveBeenCalledWith("/dashboard")
    expect(screen.queryByText("Welcome to UniWallet")).not.toBeInTheDocument()
  })
})
