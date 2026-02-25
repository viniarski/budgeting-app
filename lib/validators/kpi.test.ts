import { describe, expect, it } from "vitest"
import {
  KpiEventBodySchema,
  KpiPageViewEndBodySchema,
  KpiPageViewStartBodySchema,
  KpiSessionEndBodySchema,
  KpiSessionStartBodySchema,
} from "@/lib/validators/kpi"

describe("kpi validators", () => {
  it("accepts valid event payload", () => {
    const result = KpiEventBodySchema.safeParse({
      sessionId: "s1",
      anonymousId: "a1",
      eventType: "click",
      pageUrl: "https://example.com/dashboard",
      pagePath: "/dashboard",
      metadata: { tag: "button" },
    })

    expect(result.success).toBe(true)
  })

  it("rejects event payload with missing required fields", () => {
    const result = KpiEventBodySchema.safeParse({
      sessionId: "s1",
    })

    expect(result.success).toBe(false)
  })

  it("rejects session start when anonymousId is empty", () => {
    const result = KpiSessionStartBodySchema.safeParse({ anonymousId: "" })
    expect(result.success).toBe(false)
  })

  it("rejects session end when sessionId is missing", () => {
    const result = KpiSessionEndBodySchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("accepts page-view start payload", () => {
    const result = KpiPageViewStartBodySchema.safeParse({
      sessionId: "s1",
      anonymousId: "a1",
      pageUrl: "https://example.com",
      pagePath: "/",
    })
    expect(result.success).toBe(true)
  })

  it("rejects non-numeric scroll depth", () => {
    const result = KpiPageViewEndBodySchema.safeParse({
      pageViewId: "pv1",
      scrollDepthPct: "90",
    })
    expect(result.success).toBe(false)
  })
})
