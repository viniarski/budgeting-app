import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/db", () => ({
  query: vi.fn(),
}))

import { query } from "@/lib/db"
import { GET, POST } from "@/app/api/state/route"

const queryMock = vi.mocked(query)

const validState = {
  budget: null,
  expenses: [],
  isOnboarded: false,
}

describe("GET /api/state", () => {
  beforeEach(() => {
    queryMock.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns null state when no row exists", async () => {
    queryMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    const request = new Request("http://localhost/api/state?stateId=device-1")
    const response = await GET(request)
    const payload = (await response.json()) as { state: unknown }

    expect(response.status).toBe(200)
    expect(payload).toEqual({ state: null })
    expect(queryMock).toHaveBeenCalledTimes(2)
    expect(queryMock).toHaveBeenLastCalledWith(
      "SELECT state FROM app_states WHERE id = $1 LIMIT 1",
      ["device-1"]
    )
  })

  it("uses default stateId when missing", async () => {
    queryMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    const request = new Request("http://localhost/api/state")
    await GET(request)

    expect(queryMock).toHaveBeenLastCalledWith(
      "SELECT state FROM app_states WHERE id = $1 LIMIT 1",
      ["default"]
    )
  })

  it("trims and uses provided stateId", async () => {
    queryMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    const request = new Request("http://localhost/api/state?stateId=%20abc%20")
    await GET(request)

    expect(queryMock).toHaveBeenLastCalledWith(
      "SELECT state FROM app_states WHERE id = $1 LIMIT 1",
      ["abc"]
    )
  })

  it("uses default stateId when stateId query param is blank", async () => {
    queryMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    const request = new Request("http://localhost/api/state?stateId=%20%20")
    await GET(request)

    expect(queryMock).toHaveBeenLastCalledWith(
      "SELECT state FROM app_states WHERE id = $1 LIMIT 1",
      ["default"]
    )
  })

  it("returns stored state when row exists", async () => {
    queryMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ state: validState }])

    const request = new Request("http://localhost/api/state?stateId=device-2")
    const response = await GET(request)
    const payload = (await response.json()) as { state: unknown }

    expect(response.status).toBe(200)
    expect(payload).toEqual({ state: validState })
  })

  it("returns graceful fallback when db query fails", async () => {
    queryMock.mockRejectedValueOnce(new Error("db unavailable"))

    const request = new Request("http://localhost/api/state?stateId=device-1")
    const response = await GET(request)
    const payload = (await response.json()) as {
      state: unknown
      synced: boolean
    }

    expect(response.status).toBe(200)
    expect(payload).toEqual({ state: null, synced: false })
  })
})

describe("POST /api/state", () => {
  beforeEach(() => {
    queryMock.mockReset()
  })

  it("rejects invalid state payload", async () => {
    queryMock.mockResolvedValueOnce([])

    const request = new Request("http://localhost/api/state?stateId=device-1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: { bad: true } }),
    })

    const response = await POST(request)
    const payload = (await response.json()) as { error: string }

    expect(response.status).toBe(400)
    expect(payload.error).toBe("Invalid state payload")
  })

  it("rejects payload when expenses is not an array", async () => {
    queryMock.mockResolvedValueOnce([])

    const request = new Request("http://localhost/api/state?stateId=device-1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        state: { budget: null, expenses: "bad", isOnboarded: false },
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it("rejects payload when isOnboarded is not boolean", async () => {
    queryMock.mockResolvedValueOnce([])

    const request = new Request("http://localhost/api/state?stateId=device-1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        state: { budget: null, expenses: [], isOnboarded: "yes" },
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it("upserts valid state payload and returns ok", async () => {
    queryMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    const request = new Request("http://localhost/api/state?stateId=device-3", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: validState }),
    })

    const response = await POST(request)
    const payload = (await response.json()) as { ok: boolean }

    expect(response.status).toBe(200)
    expect(payload).toEqual({ ok: true })
    expect(queryMock).toHaveBeenCalledTimes(2)
    expect(queryMock).toHaveBeenLastCalledWith(
      expect.stringContaining("INSERT INTO app_states"),
      ["device-3", JSON.stringify(validState)]
    )
  })

  it("defaults stateId to default on POST when missing", async () => {
    queryMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    const request = new Request("http://localhost/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: validState }),
    })

    const response = await POST(request)
    const payload = (await response.json()) as { ok: boolean }

    expect(response.status).toBe(200)
    expect(payload).toEqual({ ok: true })
    expect(queryMock).toHaveBeenLastCalledWith(
      expect.stringContaining("INSERT INTO app_states"),
      ["default", JSON.stringify(validState)]
    )
  })

  it("defaults stateId on POST when query value is blank", async () => {
    queryMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    const request = new Request("http://localhost/api/state?stateId=%20%20", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: validState }),
    })

    await POST(request)

    expect(queryMock).toHaveBeenLastCalledWith(
      expect.stringContaining("INSERT INTO app_states"),
      ["default", JSON.stringify(validState)]
    )
  })

  it("returns graceful fallback when body is invalid JSON", async () => {
    queryMock.mockResolvedValueOnce([])

    const request = new Request("http://localhost/api/state?stateId=device-5", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    })

    const response = await POST(request)
    const payload = (await response.json()) as {
      ok: boolean
      synced: boolean
    }

    expect(response.status).toBe(200)
    expect(payload).toEqual({ ok: false, synced: false })
  })

  it("returns graceful fallback when db write fails", async () => {
    queryMock.mockRejectedValueOnce(new Error("write failed"))

    const request = new Request("http://localhost/api/state?stateId=device-4", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: validState }),
    })

    const response = await POST(request)
    const payload = (await response.json()) as {
      ok: boolean
      synced: boolean
    }

    expect(response.status).toBe(200)
    expect(payload).toEqual({ ok: false, synced: false })
  })
})
