import { NextResponse } from "next/server"
import { BudgetState } from "@/lib/types"
import { query } from "@/lib/db"

export const runtime = "nodejs"

const STATE_ID = "default"

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

function isBudgetState(value: unknown): value is BudgetState {
  if (!value || typeof value !== "object") return false
  const obj = value as Record<string, unknown>
  return (
    "budget" in obj &&
    "expenses" in obj &&
    Array.isArray(obj.expenses) &&
    typeof obj.isOnboarded === "boolean"
  )
}

export async function GET() {
  try {
    await ensureStateTable()

    const rows = await query<{ state: BudgetState }>(
      "SELECT state FROM app_states WHERE id = $1 LIMIT 1",
      [STATE_ID]
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

    const body = (await request.json()) as { state?: unknown }
    if (!isBudgetState(body.state)) {
      return NextResponse.json({ error: "Invalid state payload" }, { status: 400 })
    }

    await query(
      `
      INSERT INTO app_states (id, state, updated_at)
      VALUES ($1, $2::jsonb, now())
      ON CONFLICT (id)
      DO UPDATE SET state = EXCLUDED.state, updated_at = now()
      `,
      [STATE_ID, JSON.stringify(body.state)]
    )

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch {
    return NextResponse.json({ ok: false, synced: false }, { status: 200 })
  }
}
