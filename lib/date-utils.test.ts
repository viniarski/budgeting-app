import { getAutoEndDate } from "@/lib/date-utils"

describe("date-utils", () => {
  it("returns empty string for termly period", () => {
    expect(getAutoEndDate("termly", "2026-02-01")).toBe("")
  })

  it("returns empty string when start date is missing", () => {
    expect(getAutoEndDate("weekly", "")).toBe("")
    expect(getAutoEndDate("monthly", "")).toBe("")
  })

  it("calculates weekly end date as start + 6 days", () => {
    expect(getAutoEndDate("weekly", "2026-02-01")).toBe("2026-02-07")
  })

  it("calculates monthly end date as one month minus one day", () => {
    expect(getAutoEndDate("monthly", "2026-02-01")).toBe("2026-02-28")
  })

  it("handles month boundaries correctly", () => {
    expect(getAutoEndDate("monthly", "2026-01-31")).toBe("2026-03-02")
  })

  it("handles leap-year monthly calculation", () => {
    expect(getAutoEndDate("monthly", "2024-02-29")).toBe("2024-03-28")
  })

  it("handles weekly period across year boundary", () => {
    expect(getAutoEndDate("weekly", "2026-12-28")).toBe("2027-01-03")
  })
})
