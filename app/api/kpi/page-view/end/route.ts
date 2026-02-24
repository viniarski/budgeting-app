import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { ensureKpiTables } from "@/lib/kpi-db"

export const runtime = "nodejs"

type Body = {
  pageViewId?: string
  scrollDepthPct?: number
  isBounce?: boolean
}

export async function POST(request: Request) {
  try {
    await ensureKpiTables()
    const body = (await request.json()) as Body

    if (!body.pageViewId) {
      return NextResponse.json({ error: "pageViewId is required" }, { status: 400 })
    }

    const scroll =
      typeof body.scrollDepthPct === "number"
        ? Math.max(0, Math.min(100, Math.round(body.scrollDepthPct)))
        : null

    await query(
      `
      UPDATE "KPIs".page_views
      SET exited_at = NOW(),
          scroll_depth_pct = COALESCE($2, scroll_depth_pct),
          is_bounce = COALESCE($3, is_bounce)
      WHERE id = $1
      `,
      [body.pageViewId, scroll, typeof body.isBounce === "boolean" ? body.isBounce : null]
    )

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch {
    return NextResponse.json({ ok: false, synced: false }, { status: 200 })
  }
}
