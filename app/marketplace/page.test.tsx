import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import MarketplacePage from "@/app/marketplace/page"

vi.mock("@/lib/storage", () => ({
  loadListings: () => [],
  saveListings: vi.fn(),
}))

vi.mock("@/components/marketplace/listing-card", () => ({
  default: ({ listing }: { listing: { title: string } }) => <div>{listing.title}</div>,
}))

vi.mock("@/components/marketplace/create-listing-form", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <button onClick={onClose}>close-form</button>
  ),
}))

describe("MarketplacePage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            source: "fallback",
            offers: [
              {
                id: "o1",
                name: "Offer 1",
                desc: "Desc",
                discount: "10%",
                category: "food",
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("loads and renders offers", async () => {
    render(<MarketplacePage />)

    await waitFor(() => expect(screen.getByText("Offer 1")).toBeInTheDocument())
    expect(screen.getByText("Fallback Data")).toBeInTheDocument()
  })

  it("switches to buy/sell tab and opens form", async () => {
    render(<MarketplacePage />)
    await waitFor(() => expect(screen.getByText("Fallback Data")).toBeInTheDocument())

    fireEvent.click(screen.getByRole("button", { name: "Buy & Sell" }))
    fireEvent.click(screen.getByRole("button", { name: /Sell Something/i }))

    expect(screen.getByText("close-form")).toBeInTheDocument()
  })
})
