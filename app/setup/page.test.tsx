import { fireEvent, render, screen } from "@testing-library/react"
import SetupPage from "@/app/setup/page"

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

vi.mock("@/components/setup/step-amount", () => ({
  default: ({ onAmountChange, onStartDateChange, onNext }: {
    onAmountChange: (value: string) => void
    onStartDateChange: (value: string) => void
    onNext: () => void
  }) => (
    <button
      onClick={() => {
        onAmountChange("1200")
        onStartDateChange("2026-02-01")
        onNext()
      }}
    >
      Mock Step Amount
    </button>
  ),
}))

vi.mock("@/components/setup/step-categories", () => ({
  default: ({ onComplete }: { onComplete: () => void }) => (
    <button onClick={onComplete}>Mock Start Budgeting</button>
  ),
}))

describe("SetupPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(crypto, "randomUUID").mockReturnValue("budget-123")
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("shows loader while hydration is pending", () => {
    useBudgetMock.mockReturnValue({
      isHydrated: false,
      dispatch: dispatchMock,
      state: { isOnboarded: false },
    })

    render(<SetupPage />)

    expect(document.querySelector(".animate-spin")).toBeInTheDocument()
  })

  it("redirects onboarded users to dashboard", () => {
    useBudgetMock.mockReturnValue({
      isHydrated: true,
      dispatch: dispatchMock,
      state: { isOnboarded: true },
    })

    render(<SetupPage />)

    expect(replaceMock).toHaveBeenCalledWith("/dashboard")
  })

  it("completes setup and dispatches SET_BUDGET", () => {
    useBudgetMock.mockReturnValue({
      isHydrated: true,
      dispatch: dispatchMock,
      state: { isOnboarded: false },
    })

    render(<SetupPage />)

    fireEvent.click(screen.getByRole("button", { name: "Mock Step Amount" }))
    fireEvent.click(screen.getByRole("button", { name: "Mock Start Budgeting" }))

    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "SET_BUDGET",
        payload: expect.objectContaining({ id: "budget-123", totalAmount: 1200 }),
      })
    )
    expect(pushMock).toHaveBeenCalledWith("/dashboard")
  })
})
