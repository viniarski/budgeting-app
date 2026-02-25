import { POST } from "@/app/api/kpi/page-view/end/route"

const queryMock = vi.fn()
const ensureKpiTablesMock = vi.fn()

vi.mock("@/lib/db", () => ({
  query: (...args: unknown[]) => queryMock(...args),
}))

vi.mock("@/lib/kpi-db", () => ({
  ensureKpiTables: () => ensureKpiTablesMock(),
}))

describe("POST /api/kpi/page-view/end", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ensureKpiTablesMock.mockResolvedValue(undefined)
    queryMock.mockResolvedValue([])
  })

  it("returns 400 when pageViewId is missing", async () => {
    const request = new Request("http://localhost/api/kpi/page-view/end", {
      method: "POST",
      body: JSON.stringify({}),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it("clamps scroll depth and updates exit details", async () => {
    const request = new Request("http://localhost/api/kpi/page-view/end", {
      method: "POST",
      body: JSON.stringify({ pageViewId: "pv-1", scrollDepthPct: 136.7, isBounce: true }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ ok: true })
    expect(queryMock).toHaveBeenCalledWith(expect.any(String), ["pv-1", 100, true])
  })
})
