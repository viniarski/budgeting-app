import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { ensureKpiTables } from "@/lib/kpi-db"
import { KpiPageViewEndBodySchema } from "@/lib/validators/kpi"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    await ensureKpiTables()
    const parsed = KpiPageViewEndBodySchema.safeParse(await request.json())

    if (!parsed.success) {
      return NextResponse.json({ error: "pageViewId is required" }, { status: 400 })
    }
    const body = parsed.data

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
