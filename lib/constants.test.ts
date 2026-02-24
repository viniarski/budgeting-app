import { ALL_CATEGORIES, DEFAULT_CATEGORY_IDS, STORAGE_KEY } from "@/lib/constants"

describe("constants", () => {
  it("uses stable storage key", () => {
    expect(STORAGE_KEY).toBe("uniwallet-state")
  })

  it("has unique category ids", () => {
    const ids = ALL_CATEGORIES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("default category ids exist in all categories", () => {
    const available = new Set(ALL_CATEGORIES.map((c) => c.id))
    for (const id of DEFAULT_CATEGORY_IDS) {
      expect(available.has(id)).toBe(true)
    }
  })

  it("all category templates have required visual fields", () => {
    for (const category of ALL_CATEGORIES) {
      expect(category.name.length).toBeGreaterThan(0)
      expect(category.colour).toBe("bg-accent")
      expect(category.icon.length).toBeGreaterThan(0)
    }
  })
})
