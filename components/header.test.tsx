import { fireEvent, render, screen } from "@testing-library/react"
import Header from "@/components/header"

const pathnameMock = vi.fn()
const dispatchMock = vi.fn()

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock(),
}))

vi.mock("@/contexts/budget-context", () => ({
  useBudget: () => ({
    state: {
      isOnboarded: true,
      budget: { name: "Monthly Budget" },
    },
    dispatch: dispatchMock,
    isHydrated: true,
  }),
}))

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    pathnameMock.mockReturnValue("/settings")
  })

  it("renders app title", () => {
    render(<Header />)
    expect(screen.getByText("UniWallet")).toBeInTheDocument()
  })

  it("opens mobile menu and shows links", () => {
    render(<Header />)

    fireEvent.click(screen.getAllByRole("button")[0])
    expect(screen.getByText("Save Smart")).toBeInTheDocument()
    expect(screen.getByText("Track Spend")).toBeInTheDocument()
    expect(screen.getByText("Settings")).toBeInTheDocument()
    expect(screen.getByText("Profile")).toBeInTheDocument()
  })

  it("dispatches RESET from menu action", () => {
    render(<Header />)

    fireEvent.click(screen.getAllByRole("button")[0])
    fireEvent.click(screen.getByRole("button", { name: /reset budget/i }))

    expect(dispatchMock).toHaveBeenCalledWith({ type: "RESET" })
  })
})
