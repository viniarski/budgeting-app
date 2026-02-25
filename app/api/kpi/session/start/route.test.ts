import { POST } from "@/app/api/kpi/session/start/route"

const queryMock = vi.fn()
const ensureKpiTablesMock = vi.fn()
const parseDeviceTypeMock = vi.fn()
const parseBrowserMock = vi.fn()
const parseOsMock = vi.fn()

vi.mock("@/lib/db", () => ({
  query: (...args: unknown[]) => queryMock(...args),
}))

vi.mock("@/lib/kpi-db", () => ({
  ensureKpiTables: () => ensureKpiTablesMock(),
  parseDeviceType: (...args: unknown[]) => parseDeviceTypeMock(...args),
  parseBrowser: (...args: unknown[]) => parseBrowserMock(...args),
  parseOs: (...args: unknown[]) => parseOsMock(...args),
}))

describe("POST /api/kpi/session/start", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ensureKpiTablesMock.mockResolvedValue(undefined)
    parseDeviceTypeMock.mockReturnValue("desktop")
    parseBrowserMock.mockReturnValue("chrome")
    parseOsMock.mockReturnValue("macOS")
  })

  it("returns 400 when anonymousId is missing", async () => {
    const request = new Request("http://localhost/api/kpi/session/start", {
      method: "POST",
      body: JSON.stringify({}),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it("creates a session and returns sessionId", async () => {
    queryMock.mockResolvedValue([{ id: "session-1" }])

    const request = new Request("http://localhost/api/kpi/session/start", {
      method: "POST",
      headers: {
        "user-agent": "Mozilla/5.0",
        "x-forwarded-for": "1.2.3.4, 5.6.7.8",
      },
      body: JSON.stringify({ anonymousId: "anon-1" }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ sessionId: "session-1" })
    expect(queryMock).toHaveBeenCalledTimes(1)
  })
})
