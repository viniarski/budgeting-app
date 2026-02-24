import { fireEvent, render, screen } from "@testing-library/react"
import CreateListingForm from "@/components/marketplace/create-listing-form"

describe("CreateListingForm", () => {
  beforeEach(() => {
    vi.stubGlobal("crypto", { randomUUID: () => "listing-1" })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn()

    render(<CreateListingForm onSubmit={vi.fn()} onClose={onClose} />)

    fireEvent.click(screen.getAllByRole("button")[0])
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("submits valid listing", () => {
    const onSubmit = vi.fn()

    render(<CreateListingForm onSubmit={onSubmit} onClose={vi.fn()} />)

    fireEvent.change(screen.getByPlaceholderText("What are you selling?"), {
      target: { value: "Desk Lamp" },
    })
    fireEvent.change(screen.getByPlaceholderText("0"), {
      target: { value: "12" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Furniture" }))
    fireEvent.click(screen.getByRole("button", { name: "Good" }))
    fireEvent.change(screen.getByPlaceholderText("Add some details..."), {
      target: { value: "Used once" },
    })

    fireEvent.click(screen.getByRole("button", { name: "List Item" }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "listing-1",
        title: "Desk Lamp",
        price: 12,
        category: "furniture",
        condition: "good",
        description: "Used once",
        isMine: true,
      })
    )
  })
})
