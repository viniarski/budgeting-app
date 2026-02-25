import { describe, expect, it } from "vitest"
import { BudgetStateSchema, ListingSchema, OfferItemSchema } from "@/lib/validators/domain"

describe("domain validators", () => {
  it("accepts a valid budget state", () => {
    const result = BudgetStateSchema.safeParse({
      budget: {
        id: "b1",
        name: "Monthly Budget",
        totalAmount: 1200,
        period: "monthly",
        startDate: "2026-02-01",
        endDate: "2026-02-28",
        categories: [
          { id: "rent", name: "Rent", allocated: 500, colour: "bg-accent", icon: "Home" },
        ],
      },
      expenses: [
        { id: "e1", amount: 24, categoryId: "rent", description: "Test", date: "2026-02-02" },
      ],
      isOnboarded: true,
    })

    expect(result.success).toBe(true)
  })

  it("rejects budget state with invalid period", () => {
    const result = BudgetStateSchema.safeParse({
      budget: {
        id: "b1",
        name: "Budget",
        totalAmount: 1000,
        period: "yearly",
        startDate: "2026-02-01",
        endDate: "2026-02-28",
        categories: [],
      },
      expenses: [],
      isOnboarded: true,
    })

    expect(result.success).toBe(false)
  })

  it("rejects invalid listing category", () => {
    const result = ListingSchema.safeParse({
      id: "l1",
      title: "Lamp",
      description: "desc",
      price: 10,
      category: "invalid",
      condition: "good",
      createdAt: "2026-02-01T00:00:00.000Z",
      isMine: true,
    })

    expect(result.success).toBe(false)
  })

  it("rejects invalid offer category", () => {
    const result = OfferItemSchema.safeParse({
      id: "o1",
      name: "Offer",
      desc: "desc",
      discount: "10%",
      category: "finance",
    })

    expect(result.success).toBe(false)
  })
})
