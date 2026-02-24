import { DEFAULT_OFFERS, OFFER_FILTERS } from "@/lib/offers"

describe("offers constants", () => {
  it("contains expected filter values", () => {
    const values = OFFER_FILTERS.map((f) => f.value)
    expect(values).toEqual([
      "all",
      "food",
      "shopping",
      "tech",
      "travel",
      "entertainment",
      "health",
    ])
  })

  it("keeps Aviva offers pinned at the top", () => {
    expect(DEFAULT_OFFERS[0].id).toBe("aviva-student-contents")
    expect(DEFAULT_OFFERS[1].id).toBe("aviva-student-travel")
    expect(DEFAULT_OFFERS[2].id).toBe("aviva-gadget-cover")
  })

  it("ensures Aviva offers use aviva logo path", () => {
    const aviva = DEFAULT_OFFERS.filter((o) => o.id.startsWith("aviva-"))
    expect(aviva.length).toBeGreaterThan(0)
    for (const offer of aviva) {
      expect(offer.logoPath).toBe("/aviva-logo.svg")
    }
  })

  it("ensures default offers use unique ids", () => {
    const ids = DEFAULT_OFFERS.map((o) => o.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("ensures all default offer categories are valid non-all categories", () => {
    const allowed = new Set([
      "food",
      "shopping",
      "tech",
      "travel",
      "entertainment",
      "health",
    ])

    for (const offer of DEFAULT_OFFERS) {
      expect(allowed.has(offer.category)).toBe(true)
    }
  })
})
