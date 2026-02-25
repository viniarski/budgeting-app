import { POST } from "@/app/api/kpi/event/route"

const queryMock = vi.fn()
const ensureKpiTablesMock = vi.fn()

vi.mock("@/lib/db", () => ({
  query: (...args: unknown[]) => queryMock(...args),
}))

vi.mock("@/lib/kpi-db", () => ({
  ensureKpiTables: () => ensureKpiTablesMock(),
}))

describe("POST /api/kpi/event", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ensureKpiTablesMock.mockResolvedValue(undefined)
    queryMock.mockResolvedValue([])
  })

  it("returns 400 for missing required fields", async () => {
    const request = new Request("http://localhost/api/kpi/event", {
      method: "POST",
      body: JSON.stringify({ eventType: "click" }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it("inserts event and click row for click events", async () => {
    const request = new Request("http://localhost/api/kpi/event", {
      method: "POST",
      body: JSON.stringify({
        sessionId: "s1",
        anonymousId: "a1",
        eventType: "click",
        pageUrl: "https://x.test/dashboard",
        pagePath: "/dashboard",
      }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ ok: true })
    expect(queryMock).toHaveBeenCalledTimes(2)
  })
})
