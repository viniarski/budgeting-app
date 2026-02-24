import {
  CONDITION_LABELS,
  DEFAULT_LISTINGS,
  LISTING_CATEGORIES,
  LISTINGS_STORAGE_KEY,
} from "@/lib/listings"

describe("listings constants", () => {
  it("uses stable storage key", () => {
    expect(LISTINGS_STORAGE_KEY).toBe("uniwallet_listings")
  })

  it("includes all listing category filters", () => {
    const values = LISTING_CATEGORIES.map((c) => c.value)
    expect(values).toEqual([
      "all",
      "textbooks",
      "furniture",
      "electronics",
      "clothing",
      "kitchen",
      "other",
    ])
  })

  it("contains expected condition labels", () => {
    expect(CONDITION_LABELS).toEqual({
      new: "New",
      "like-new": "Like New",
      good: "Good",
      fair: "Fair",
    })
  })

  it("default listings contain required shape and realistic values", () => {
    expect(DEFAULT_LISTINGS.length).toBeGreaterThan(0)

    for (const listing of DEFAULT_LISTINGS) {
      expect(listing.id.length).toBeGreaterThan(0)
      expect(listing.title.length).toBeGreaterThan(0)
      expect(listing.description.length).toBeGreaterThan(0)
      expect(listing.price).toBeGreaterThan(0)
      expect(typeof listing.isMine).toBe("boolean")
      expect(Number.isNaN(new Date(listing.createdAt).getTime())).toBe(false)
    }
  })
})
