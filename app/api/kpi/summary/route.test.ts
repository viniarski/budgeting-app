import { GET } from "@/app/api/kpi/summary/route"

const queryMock = vi.fn()
const ensureKpiTablesMock = vi.fn()

vi.mock("@/lib/db", () => ({
  query: (...args: unknown[]) => queryMock(...args),
}))

vi.mock("@/lib/kpi-db", () => ({
  ensureKpiTables: () => ensureKpiTablesMock(),
}))

describe("GET /api/kpi/summary", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ensureKpiTablesMock.mockResolvedValue(undefined)
  })

  it("returns computed KPI summary", async () => {
    queryMock
      .mockResolvedValueOnce([{ count: 20 }])
      .mockResolvedValueOnce([{ count: 50 }])
      .mockResolvedValueOnce([{ count: 10 }])
      .mockResolvedValueOnce([{ avg_seconds: 42.678 }])
      .mockResolvedValueOnce([{ page_path: "/dashboard", views: 24 }])

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({
      uniqueVisitors24h: 20,
      pageViews24h: 50,
      clicks24h: 10,
      ctr24h: 20,
      avgTimeOnPageSecs24h: 42.68,
      topPages: [{ page_path: "/dashboard", views: 24 }],
    })
  })

  it("falls back safely when query fails", async () => {
    queryMock.mockRejectedValue(new Error("db down"))

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual(
      expect.objectContaining({
        uniqueVisitors24h: 0,
        pageViews24h: 0,
        clicks24h: 0,
        synced: false,
      })
    )
  })
})
