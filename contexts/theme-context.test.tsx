import { fireEvent, render, screen } from "@testing-library/react"
import { ThemeProvider, useTheme } from "@/contexts/theme-context"

function ThemeHarness() {
  const { theme, setTheme, toggleTheme } = useTheme()

  return (
    <div>
      <p data-testid="theme-value">{theme}</p>
      <button onClick={() => setTheme("dark")}>set-dark</button>
      <button onClick={() => setTheme("light")}>set-light</button>
      <button onClick={() => setTheme("fancy")}>set-fancy</button>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  )
}

describe("theme-context", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute("data-theme")
  })

  it("defaults to dark theme", () => {
    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>
    )

    expect(screen.getByTestId("theme-value")).toHaveTextContent("dark")
    expect(document.documentElement).toHaveAttribute("data-theme", "dark")
  })

  it("hydrates initial theme from localStorage when valid", () => {
    localStorage.setItem("uniwallet-theme", "light")

    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>
    )

    expect(screen.getByTestId("theme-value")).toHaveTextContent("light")
    expect(document.documentElement).toHaveAttribute("data-theme", "light")
  })

  it("falls back to dark when stored theme is invalid", () => {
    localStorage.setItem("uniwallet-theme", "neon")

    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>
    )

    expect(screen.getByTestId("theme-value")).toHaveTextContent("dark")
    expect(document.documentElement).toHaveAttribute("data-theme", "dark")
  })

  it("setTheme updates context value, html attribute, and localStorage", () => {
    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>
    )

    fireEvent.click(screen.getByRole("button", { name: "set-fancy" }))

    expect(screen.getByTestId("theme-value")).toHaveTextContent("fancy")
    expect(document.documentElement).toHaveAttribute("data-theme", "fancy")
    expect(localStorage.getItem("uniwallet-theme")).toBe("fancy")
  })

  it("toggle cycles dark -> light -> fancy -> dark", () => {
    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>
    )

    fireEvent.click(screen.getByRole("button", { name: "toggle" }))
    expect(screen.getByTestId("theme-value")).toHaveTextContent("light")

    fireEvent.click(screen.getByRole("button", { name: "toggle" }))
    expect(screen.getByTestId("theme-value")).toHaveTextContent("fancy")

    fireEvent.click(screen.getByRole("button", { name: "toggle" }))
    expect(screen.getByTestId("theme-value")).toHaveTextContent("dark")
  })
})
