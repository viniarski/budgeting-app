import { POST } from "@/app/api/kpi/event/route"

const queryMock = vi.fn()
const ensureKpiTablesMock = vi.fn()

vi.mock("@/lib/db", () => ({
  query: (...args: unknown[]) => queryMock(...args),
}))

vi.mock("@/lib/kpi-db", () => ({
  ensureKpiTables: () => ensureKpiTablesMock(),
}))

describe("POST /api/kpi/event extra", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ensureKpiTablesMock.mockResolvedValue(undefined)
  })

  it("returns 400 when metadata is invalid type", async () => {
    const request = new Request("http://localhost/api/kpi/event", {
      method: "POST",
      body: JSON.stringify({
        sessionId: "s1",
        anonymousId: "a1",
        eventType: "click",
        pageUrl: "https://x.test",
        pagePath: "/",
        metadata: "bad",
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    expect(queryMock).not.toHaveBeenCalled()
  })

  it("handles db errors with graceful response", async () => {
    queryMock.mockRejectedValue(new Error("db down"))

    const request = new Request("http://localhost/api/kpi/event", {
      method: "POST",
      body: JSON.stringify({
        sessionId: "s1",
        anonymousId: "a1",
        eventType: "view",
        pageUrl: "https://x.test",
        pagePath: "/",
      }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ ok: false, synced: false })
  })
})
