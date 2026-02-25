import { POST } from "@/app/api/kpi/session/end/route"

const queryMock = vi.fn()
const ensureKpiTablesMock = vi.fn()

vi.mock("@/lib/db", () => ({
  query: (...args: unknown[]) => queryMock(...args),
}))

vi.mock("@/lib/kpi-db", () => ({
  ensureKpiTables: () => ensureKpiTablesMock(),
}))

describe("POST /api/kpi/session/end", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ensureKpiTablesMock.mockResolvedValue(undefined)
    queryMock.mockResolvedValue([])
  })

  it("returns 400 when sessionId is missing", async () => {
    const request = new Request("http://localhost/api/kpi/session/end", {
      method: "POST",
      body: JSON.stringify({}),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it("marks session as ended", async () => {
    const request = new Request("http://localhost/api/kpi/session/end", {
      method: "POST",
      body: JSON.stringify({ sessionId: "session-1" }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ ok: true })
    expect(queryMock).toHaveBeenCalledTimes(1)
  })
})
