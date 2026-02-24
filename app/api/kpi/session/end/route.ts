import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { ensureKpiTables } from "@/lib/kpi-db"

export const runtime = "nodejs"

type Body = {
  sessionId?: string
}

export async function POST(request: Request) {
  try {
    await ensureKpiTables()
    const body = (await request.json()) as Body

    if (!body.sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 })
    }

    await query(
      `
      UPDATE "KPIs".sessions
      SET ended_at = NOW()
      WHERE id = $1
      `,
      [body.sessionId]
    )

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch {
    return NextResponse.json({ ok: false, synced: false }, { status: 200 })
  }
}
