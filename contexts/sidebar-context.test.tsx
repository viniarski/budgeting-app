import { fireEvent, render, screen } from "@testing-library/react"
import { SidebarProvider, useSidebar } from "@/contexts/sidebar-context"

function SidebarHarness() {
  const { isSidebarHidden, hideSidebar, showSidebar, toggleSidebar } = useSidebar()

  return (
    <div>
      <p data-testid="sidebar-state">{isSidebarHidden ? "hidden" : "shown"}</p>
      <button onClick={hideSidebar}>hide</button>
      <button onClick={showSidebar}>show</button>
      <button onClick={toggleSidebar}>toggle</button>
    </div>
  )
}

describe("sidebar-context", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute("data-sidebar")
  })

  it("defaults to shown state", () => {
    render(
      <SidebarProvider>
        <SidebarHarness />
      </SidebarProvider>
    )

    expect(screen.getByTestId("sidebar-state")).toHaveTextContent("shown")
    expect(document.documentElement).toHaveAttribute("data-sidebar", "shown")
    expect(localStorage.getItem("uniwallet-sidebar-hidden")).toBe("false")
  })

  it("hydrates hidden state from localStorage", () => {
    localStorage.setItem("uniwallet-sidebar-hidden", "true")

    render(
      <SidebarProvider>
        <SidebarHarness />
      </SidebarProvider>
    )

    expect(screen.getByTestId("sidebar-state")).toHaveTextContent("hidden")
    expect(document.documentElement).toHaveAttribute("data-sidebar", "hidden")
  })

  it("hide/show handlers update context, html attribute, and localStorage", () => {
    render(
      <SidebarProvider>
        <SidebarHarness />
      </SidebarProvider>
    )

    fireEvent.click(screen.getByRole("button", { name: "hide" }))
    expect(screen.getByTestId("sidebar-state")).toHaveTextContent("hidden")
    expect(document.documentElement).toHaveAttribute("data-sidebar", "hidden")
    expect(localStorage.getItem("uniwallet-sidebar-hidden")).toBe("true")

    fireEvent.click(screen.getByRole("button", { name: "show" }))
    expect(screen.getByTestId("sidebar-state")).toHaveTextContent("shown")
    expect(document.documentElement).toHaveAttribute("data-sidebar", "shown")
    expect(localStorage.getItem("uniwallet-sidebar-hidden")).toBe("false")
  })

  it("toggle handler flips state", () => {
    render(
      <SidebarProvider>
        <SidebarHarness />
      </SidebarProvider>
    )

    fireEvent.click(screen.getByRole("button", { name: "toggle" }))
    expect(screen.getByTestId("sidebar-state")).toHaveTextContent("hidden")

    fireEvent.click(screen.getByRole("button", { name: "toggle" }))
    expect(screen.getByTestId("sidebar-state")).toHaveTextContent("shown")
  })
})
