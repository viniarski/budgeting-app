import { fireEvent, render, screen } from "@testing-library/react"
import BottomNav from "@/components/bottom-nav"

const pathnameMock = vi.fn()
const hideSidebarMock = vi.fn()
const showSidebarMock = vi.fn()

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock(),
}))

vi.mock("@/contexts/sidebar-context", () => ({
  useSidebar: () => ({
    isSidebarHidden: false,
    hideSidebar: hideSidebarMock,
    showSidebar: showSidebarMock,
  }),
}))

describe("BottomNav", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    pathnameMock.mockReturnValue("/goals")
  })

  it("renders primary tabs", () => {
    render(<BottomNav />)

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Add" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Calculator" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Offers" })).toBeInTheDocument()
  })

  it("maps budget-related routes to Add tab active style", () => {
    render(<BottomNav />)

    const addLink = screen.getByRole("link", { name: "Add" })
    expect(addLink.className).toContain("text-accent")
  })

  it("calls hideSidebar when collapse button is clicked", () => {
    render(<BottomNav />)

    const button = screen.getByRole("button", { name: "Collapse side menu" })
    fireEvent.click(button)
    expect(hideSidebarMock).toHaveBeenCalledTimes(1)
  })
})
