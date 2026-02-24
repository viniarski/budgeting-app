import { fireEvent, render, screen } from "@testing-library/react"
import StepCategories from "@/components/setup/step-categories"

const baseProps = {
  totalAmount: 1000,
  selectedIds: ["rent", "food"],
  allocations: { rent: 600, food: 200 },
  customCategories: [],
  onToggleCategory: vi.fn(),
  onAddCustom: vi.fn(),
  onRemoveCustom: vi.fn(),
  onAllocationChange: vi.fn(),
  onComplete: vi.fn(),
  onBack: vi.fn(),
}

describe("StepCategories", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders allocation summary", () => {
    render(<StepCategories {...baseProps} />)
    expect(screen.getByText("Assign your money")).toBeInTheDocument()
    expect(screen.getByText("£200.00")).toBeInTheDocument()
  })

  it("shows picker when Add Category is clicked", () => {
    render(<StepCategories {...baseProps} />)

    fireEvent.click(screen.getByRole("button", { name: "Add Category" }))
    expect(screen.getByText("Add Categories")).toBeInTheDocument()
  })

  it("calls onAddCustom when creating custom category", () => {
    vi.spyOn(Date, "now").mockReturnValue(12345)

    render(<StepCategories {...baseProps} />)
    fireEvent.click(screen.getByRole("button", { name: "Add Category" }))

    fireEvent.change(screen.getByPlaceholderText("Custom category name..."), {
      target: { value: "Books" },
    })

    const addCustomButton = screen.getAllByRole("button").find((btn) =>
      btn.className.includes("h-10 w-10")
    )
    expect(addCustomButton).toBeDefined()
    fireEvent.click(addCustomButton as HTMLButtonElement)

    expect(baseProps.onAddCustom).toHaveBeenCalledWith({
      id: "custom-books-12345",
      name: "Books",
      colour: "bg-accent",
      icon: "Tag",
    })
  })
})
