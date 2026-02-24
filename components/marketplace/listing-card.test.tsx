import { render, screen } from "@testing-library/react"
import ListingCard from "@/components/marketplace/listing-card"

describe("ListingCard", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-02-24T12:00:00.000Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("renders listing title, price, condition, and mine badge", () => {
    render(
      <ListingCard
        listing={{
          id: "l1",
          title: "Desk Lamp",
          description: "Used once",
          price: 9,
          category: "furniture",
          condition: "good",
          createdAt: "2026-02-24T12:00:00.000Z",
          isMine: true,
        }}
      />
    )

    expect(screen.getByText("Desk Lamp")).toBeInTheDocument()
    expect(screen.getByText("£9")).toBeInTheDocument()
    expect(screen.getByText("Good")).toBeInTheDocument()
    expect(screen.getByText("You")).toBeInTheDocument()
    expect(screen.getByText("Just now")).toBeInTheDocument()
  })

  it("shows relative day text", () => {
    render(
      <ListingCard
        listing={{
          id: "l2",
          title: "Headphones",
          description: "Great condition",
          price: 40,
          category: "electronics",
          condition: "like-new",
          createdAt: "2026-02-22T12:00:00.000Z",
          isMine: false,
        }}
      />
    )

    expect(screen.getByText("2d ago")).toBeInTheDocument()
  })
})
