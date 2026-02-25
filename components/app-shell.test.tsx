import { render, screen } from "@testing-library/react"
import AppShell from "@/components/app-shell"

const usePathnameMock = vi.fn()

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}))

vi.mock("@/components/header", () => ({
  default: () => <header>Mock Header</header>,
}))

vi.mock("@/components/bottom-nav", () => ({
  default: () => <nav>Mock BottomNav</nav>,
}))

describe("AppShell", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("hides header and bottom nav on welcome route", () => {
    usePathnameMock.mockReturnValue("/")

    const { container } = render(
      <AppShell>
        <div>Welcome Content</div>
      </AppShell>
    )

    expect(screen.queryByText("Mock Header")).not.toBeInTheDocument()
    expect(screen.queryByText("Mock BottomNav")).not.toBeInTheDocument()
    expect(screen.getByText("Welcome Content")).toBeInTheDocument()
    expect(container.querySelector("main")?.className).toContain("min-h-screen")
  })

  it("renders header and bottom nav on app routes", () => {
    usePathnameMock.mockReturnValue("/dashboard")

    const { container } = render(
      <AppShell>
        <div>Dashboard Content</div>
      </AppShell>
    )

    expect(screen.getByText("Mock Header")).toBeInTheDocument()
    expect(screen.getByText("Mock BottomNav")).toBeInTheDocument()
    expect(screen.getByText("Dashboard Content")).toBeInTheDocument()
    expect(container.querySelector("main")?.className).toContain("desktop-main")
  })
})
