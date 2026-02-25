import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { ensureKpiTables, parseBrowser, parseDeviceType, parseOs } from "@/lib/kpi-db"
import { KpiSessionStartBodySchema } from "@/lib/validators/kpi"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    await ensureKpiTables()

    const parsed = KpiSessionStartBodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: "anonymousId is required" }, { status: 400 })
    }
    const body = parsed.data

    const ua = request.headers.get("user-agent")
    const forwardedFor = request.headers.get("x-forwarded-for")
    const ip = forwardedFor?.split(",")[0]?.trim() || null

    const rows = await query<{ id: string }>(
      `
      INSERT INTO "KPIs".sessions (
        anonymous_id,
        ip_address,
        user_agent,
        referrer,
        utm_source,
        utm_medium,
        utm_campaign,
        device_type,
        browser,
        os,
        country
      )
      VALUES ($1, $2::inet, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
      `,
      [
        body.anonymousId,
        ip,
        ua,
        body.referrer || null,
        body.utmSource || null,
        body.utmMedium || null,
        body.utmCampaign || null,
        parseDeviceType(ua),
        parseBrowser(ua),
        parseOs(ua),
        body.country || null,
      ]
    )

    return NextResponse.json({ sessionId: rows[0]?.id ?? null }, { status: 200 })
  } catch {
    return NextResponse.json({ sessionId: null, synced: false }, { status: 200 })
  }
}
