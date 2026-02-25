import { GET, POST } from "@/app/api/state/route"

const queryMock = vi.fn()

vi.mock("@/lib/db", () => ({
  query: (...args: unknown[]) => queryMock(...args),
}))

describe("/api/state extra", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("falls back to default stateId when stateId is not a string", async () => {
    queryMock.mockResolvedValueOnce([]).mockResolvedValueOnce([])

    await GET(new Request("http://localhost/api/state?stateId="))

    expect(queryMock).toHaveBeenLastCalledWith(
      "SELECT state FROM app_states WHERE id = $1 LIMIT 1",
      ["default"]
    )
  })

  it("rejects payload with invalid expense amount type", async () => {
    queryMock.mockResolvedValueOnce([])

    const request = new Request("http://localhost/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        state: {
          budget: null,
          expenses: [{ id: "e1", amount: "20", categoryId: "food", description: "x", date: "2026-01-01" }],
          isOnboarded: false,
        },
      }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({ error: "Invalid state payload" })
  })
})
