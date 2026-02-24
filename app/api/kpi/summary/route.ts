import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { ensureKpiTables } from "@/lib/kpi-db"

export const runtime = "nodejs"

export async function GET() {
  try {
    await ensureKpiTables()

    const [uniqueRow] = await query<{ count: number }>(
      `
      SELECT COUNT(DISTINCT anonymous_id)::int AS count
      FROM "KPIs".sessions
      WHERE started_at >= NOW() - INTERVAL '24 hours'
      `
    )

    const [pageViewsRow] = await query<{ count: number }>(
      `
      SELECT COUNT(*)::int AS count
      FROM "KPIs".page_views
      WHERE entered_at >= NOW() - INTERVAL '24 hours'
      `
    )

    const [clicksRow] = await query<{ count: number }>(
      `
      SELECT COUNT(*)::int AS count
      FROM "KPIs".events
      WHERE event_type = 'click'
        AND created_at >= NOW() - INTERVAL '24 hours'
      `
    )

    const [avgTimeRow] = await query<{ avg_seconds: number | null }>(
      `
      SELECT AVG(EXTRACT(EPOCH FROM (exited_at - entered_at)))::float AS avg_seconds
      FROM "KPIs".page_views
      WHERE exited_at IS NOT NULL
        AND entered_at >= NOW() - INTERVAL '24 hours'
      `
    )

    const topPages = await query<{ page_path: string; views: number }>(
      `
      SELECT page_path, COUNT(*)::int AS views
      FROM "KPIs".page_views
      WHERE entered_at >= NOW() - INTERVAL '24 hours'
      GROUP BY page_path
      ORDER BY views DESC
      LIMIT 5
      `
    )

    const visitors = uniqueRow?.count ?? 0
    const pageViews = pageViewsRow?.count ?? 0
    const clicks = clicksRow?.count ?? 0

    return NextResponse.json(
      {
        uniqueVisitors24h: visitors,
        pageViews24h: pageViews,
        clicks24h: clicks,
        ctr24h: pageViews > 0 ? Number(((clicks / pageViews) * 100).toFixed(2)) : 0,
        avgTimeOnPageSecs24h: Number((avgTimeRow?.avg_seconds || 0).toFixed(2)),
        topPages,
      },
      { status: 200 }
    )
  } catch {
    return NextResponse.json(
      {
        uniqueVisitors24h: 0,
        pageViews24h: 0,
        clicks24h: 0,
        ctr24h: 0,
        avgTimeOnPageSecs24h: 0,
        topPages: [],
        synced: false,
      },
      { status: 200 }
    )
  }
}
