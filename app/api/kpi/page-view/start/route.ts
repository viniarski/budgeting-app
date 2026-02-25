import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { ensureKpiTables } from "@/lib/kpi-db"
import { KpiPageViewStartBodySchema } from "@/lib/validators/kpi"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    await ensureKpiTables()
    const parsed = KpiPageViewStartBodySchema.safeParse(await request.json())

    if (!parsed.success) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const body = parsed.data

    const rows = await query<{ id: string }>(
      `
      INSERT INTO "KPIs".page_views (
        session_id,
        anonymous_id,
        page_url,
        page_path,
        page_title,
        referrer_url
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
      `,
      [
        body.sessionId,
        body.anonymousId,
        body.pageUrl,
        body.pagePath,
        body.pageTitle || null,
        body.referrerUrl || null,
      ]
    )

    return NextResponse.json({ pageViewId: rows[0]?.id ?? null }, { status: 200 })
  } catch {
    return NextResponse.json({ pageViewId: null, synced: false }, { status: 200 })
  }
}
