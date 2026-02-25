import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { ensureKpiTables } from "@/lib/kpi-db"
import { KpiEventBodySchema } from "@/lib/validators/kpi"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    await ensureKpiTables()
    const parsed = KpiEventBodySchema.safeParse(await request.json())

    if (!parsed.success) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const body = parsed.data

    await query(
      `
      INSERT INTO "KPIs".events (
        session_id,
        anonymous_id,
        event_type,
        page_url,
        page_path,
        element_id,
        element_class,
        element_text,
        element_href,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
      `,
      [
        body.sessionId,
        body.anonymousId,
        body.eventType,
        body.pageUrl,
        body.pagePath,
        body.elementId || null,
        body.elementClass || null,
        body.elementText || null,
        body.elementHref || null,
        JSON.stringify(body.metadata || {}),
      ]
    )

    if (body.eventType === "click") {
      await query(
        `
        INSERT INTO "KPIs".element_clicks (
          session_id,
          anonymous_id,
          page_url,
          page_path,
          element_id,
          element_class,
          element_text,
          element_href
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
        [
          body.sessionId,
          body.anonymousId,
          body.pageUrl,
          body.pagePath,
          body.elementId || null,
          body.elementClass || null,
          body.elementText || null,
          body.elementHref || null,
        ]
      )
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch {
    return NextResponse.json({ ok: false, synced: false }, { status: 200 })
  }
}
