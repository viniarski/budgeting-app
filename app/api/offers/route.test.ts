import { afterEach, describe, expect, it, vi } from "vitest"
import { GET } from "@/app/api/offers/route"
import { DEFAULT_OFFERS } from "@/lib/offers"

describe("GET /api/offers", () => {
  const originalOffersApi = process.env.OFFERS_API_URL

  afterEach(() => {
    process.env.OFFERS_API_URL = originalOffersApi
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("returns fallback offers when OFFERS_API_URL is missing", async () => {
    delete process.env.OFFERS_API_URL

    const response = await GET()
    const payload = (await response.json()) as {
      offers: unknown[]
      source: string
    }

    expect(payload.source).toBe("fallback")
    expect(payload.offers).toEqual(DEFAULT_OFFERS)
  })

  it("returns fallback when upstream request is not ok", async () => {
    process.env.OFFERS_API_URL = "https://example.com/offers"

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("error", { status: 500 }))
    )

    const response = await GET()
    const payload = (await response.json()) as {
      offers: unknown[]
      source: string
    }

    expect(payload.source).toBe("fallback")
    expect(payload.offers).toEqual(DEFAULT_OFFERS)
  })

  it("returns normalized live offers from { offers: [] } payload", async () => {
    process.env.OFFERS_API_URL = "https://example.com/offers"

    const livePayload = {
      offers: [
        {
          id: "live-1",
          name: "Live Offer",
          desc: "From API",
          discount: "10%",
          category: "food",
        },
        {
          id: 123,
          name: "Invalid",
          desc: "Invalid",
          discount: "5%",
          category: "food",
        },
      ],
    }

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify(livePayload), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    )

    const response = await GET()
    const payload = (await response.json()) as {
      offers: Array<{ id: string; name: string }>
      source: string
    }

    expect(payload.source).toBe("live")
    expect(payload.offers).toHaveLength(1)
    expect(payload.offers[0].id).toBe("live-1")
  })

  it("returns live offers when payload itself is an array", async () => {
    process.env.OFFERS_API_URL = "https://example.com/offers"

    const livePayload = [
      {
        id: "live-2",
        name: "Array Offer",
        desc: "Direct array payload",
        discount: "15%",
        category: "tech",
      },
    ]

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify(livePayload), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    )

    const response = await GET()
    const payload = (await response.json()) as {
      offers: Array<{ id: string; category: string }>
      source: string
    }

    expect(payload.source).toBe("live")
    expect(payload.offers).toHaveLength(1)
    expect(payload.offers[0]).toMatchObject({ id: "live-2", category: "tech" })
  })

  it("returns fallback when live payload has no valid offer items", async () => {
    process.env.OFFERS_API_URL = "https://example.com/offers"

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ offers: [{ bad: true }] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    )

    const response = await GET()
    const payload = (await response.json()) as {
      offers: unknown[]
      source: string
    }

    expect(payload.source).toBe("fallback")
    expect(payload.offers).toEqual(DEFAULT_OFFERS)
  })

  it("returns fallback when response.json throws", async () => {
    process.env.OFFERS_API_URL = "https://example.com/offers"

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => {
          throw new Error("bad json")
        },
      }))
    )

    const response = await GET()
    const payload = (await response.json()) as {
      offers: unknown[]
      source: string
    }

    expect(payload.source).toBe("fallback")
    expect(payload.offers).toEqual(DEFAULT_OFFERS)
  })

  it("returns fallback when payload object has no offers array", async () => {
    process.env.OFFERS_API_URL = "https://example.com/offers"

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ data: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    )

    const response = await GET()
    const payload = (await response.json()) as {
      offers: unknown[]
      source: string
    }

    expect(payload.source).toBe("fallback")
    expect(payload.offers).toEqual(DEFAULT_OFFERS)
  })

  it("returns fallback on fetch/network throw", async () => {
    process.env.OFFERS_API_URL = "https://example.com/offers"

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down")
      })
    )

    const response = await GET()
    const payload = (await response.json()) as {
      offers: unknown[]
      source: string
    }

    expect(payload.source).toBe("fallback")
    expect(payload.offers).toEqual(DEFAULT_OFFERS)
  })
})
