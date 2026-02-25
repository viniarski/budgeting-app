import { POST } from "@/app/api/kpi/page-view/start/route"

const queryMock = vi.fn()
const ensureKpiTablesMock = vi.fn()

vi.mock("@/lib/db", () => ({
  query: (...args: unknown[]) => queryMock(...args),
}))

vi.mock("@/lib/kpi-db", () => ({
  ensureKpiTables: () => ensureKpiTablesMock(),
}))

describe("POST /api/kpi/page-view/start", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ensureKpiTablesMock.mockResolvedValue(undefined)
  })

  it("returns 400 for missing required fields", async () => {
    const request = new Request("http://localhost/api/kpi/page-view/start", {
      method: "POST",
      body: JSON.stringify({ sessionId: "s1" }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it("inserts page view and returns id", async () => {
    queryMock.mockResolvedValue([{ id: "pv-1" }])

    const request = new Request("http://localhost/api/kpi/page-view/start", {
      method: "POST",
      body: JSON.stringify({
        sessionId: "s1",
        anonymousId: "a1",
        pageUrl: "https://x.test/dashboard",
        pagePath: "/dashboard",
      }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ pageViewId: "pv-1" })
  })
})
