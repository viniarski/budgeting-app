import { NextResponse } from "next/server"
import { BudgetState } from "@/lib/types"
import { query } from "@/lib/db"
import { z } from "zod"
import { BudgetStateSchema } from "@/lib/validators/domain"

export const runtime = "nodejs"

function getStateIdFromUrl(request: Request): string {
  const { searchParams } = new URL(request.url)
  const raw = searchParams.get("stateId")
  const parsed = z.string().trim().min(1).safeParse(raw)
  return parsed.success ? parsed.data : "default"
}

async function ensureStateTable() {
  await query(
    `
    CREATE TABLE IF NOT EXISTS app_states (
      id TEXT PRIMARY KEY,
      state JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
    `
  )
}

export async function GET(request: Request) {
  try {
    await ensureStateTable()
    const stateId = getStateIdFromUrl(request)

    const rows = await query<{ state: BudgetState }>(
      "SELECT state FROM app_states WHERE id = $1 LIMIT 1",
      [stateId]
    )

    if (!rows[0]) {
      return NextResponse.json({ state: null }, { status: 200 })
    }

    return NextResponse.json({ state: rows[0].state }, { status: 200 })
  } catch {
    return NextResponse.json({ state: null, synced: false }, { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    await ensureStateTable()
    const stateId = getStateIdFromUrl(request)

    const body = (await request.json()) as { state?: unknown }
    const parsed = BudgetStateSchema.safeParse(body.state)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid state payload" }, { status: 400 })
    }

    await query(
      `
      INSERT INTO app_states (id, state, updated_at)
      VALUES ($1, $2::jsonb, now())
      ON CONFLICT (id)
      DO UPDATE SET state = EXCLUDED.state, updated_at = now()
      `,
      [stateId, JSON.stringify(parsed.data)]
    )

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch {
    return NextResponse.json({ ok: false, synced: false }, { status: 200 })
  }
}
