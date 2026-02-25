import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { ensureKpiTables } from "@/lib/kpi-db"
import { KpiSessionEndBodySchema } from "@/lib/validators/kpi"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    await ensureKpiTables()
    const parsed = KpiSessionEndBodySchema.safeParse(await request.json())

    if (!parsed.success) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 })
    }
    const body = parsed.data

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
