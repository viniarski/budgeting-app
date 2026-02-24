import { query } from "@/lib/db"

let ensured = false

export async function ensureKpiTables(): Promise<void> {
  if (ensured) return

  await query('CREATE SCHEMA IF NOT EXISTS "KPIs"')

  await query(`
    CREATE TABLE IF NOT EXISTS "KPIs".sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
      anonymous_id TEXT NOT NULL,
      ip_address INET,
      user_agent TEXT,
      referrer TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      device_type TEXT,
      browser TEXT,
      os TEXT,
      country TEXT,
      started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      ended_at TIMESTAMPTZ
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS "KPIs".page_views (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID NOT NULL REFERENCES "KPIs".sessions(id) ON DELETE CASCADE,
      user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
      anonymous_id TEXT NOT NULL,
      page_url TEXT NOT NULL,
      page_path TEXT NOT NULL,
      page_title TEXT,
      referrer_url TEXT,
      entered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      exited_at TIMESTAMPTZ,
      scroll_depth_pct SMALLINT CHECK (scroll_depth_pct BETWEEN 0 AND 100),
      is_bounce BOOLEAN DEFAULT FALSE
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS "KPIs".events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID NOT NULL REFERENCES "KPIs".sessions(id) ON DELETE CASCADE,
      user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
      anonymous_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      page_url TEXT NOT NULL,
      page_path TEXT NOT NULL,
      element_id TEXT,
      element_class TEXT,
      element_text TEXT,
      element_href TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS "KPIs".element_impressions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID NOT NULL REFERENCES "KPIs".sessions(id) ON DELETE CASCADE,
      user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
      anonymous_id TEXT NOT NULL,
      page_view_id UUID REFERENCES "KPIs".page_views(id) ON DELETE SET NULL,
      page_url TEXT NOT NULL,
      page_path TEXT NOT NULL,
      element_id TEXT,
      element_class TEXT,
      element_text TEXT,
      element_href TEXT,
      placement TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS "KPIs".element_clicks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID NOT NULL REFERENCES "KPIs".sessions(id) ON DELETE CASCADE,
      user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
      anonymous_id TEXT NOT NULL,
      page_view_id UUID REFERENCES "KPIs".page_views(id) ON DELETE SET NULL,
      page_url TEXT NOT NULL,
      page_path TEXT NOT NULL,
      element_id TEXT,
      element_class TEXT,
      element_text TEXT,
      element_href TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await query('CREATE INDEX IF NOT EXISTS idx_kpi_sessions_started_at ON "KPIs".sessions(started_at DESC)')
  await query('CREATE INDEX IF NOT EXISTS idx_kpi_sessions_anonymous_id ON "KPIs".sessions(anonymous_id)')
  await query('CREATE INDEX IF NOT EXISTS idx_kpi_page_views_page_path ON "KPIs".page_views(page_path)')
  await query('CREATE INDEX IF NOT EXISTS idx_kpi_page_views_entered_at ON "KPIs".page_views(entered_at DESC)')
  await query('CREATE INDEX IF NOT EXISTS idx_kpi_events_event_type ON "KPIs".events(event_type)')
  await query('CREATE INDEX IF NOT EXISTS idx_kpi_events_page_path ON "KPIs".events(page_path)')
  await query('CREATE INDEX IF NOT EXISTS idx_kpi_events_created_at ON "KPIs".events(created_at DESC)')
  await query('CREATE INDEX IF NOT EXISTS idx_kpi_clicks_page_path ON "KPIs".element_clicks(page_path)')
  await query('CREATE INDEX IF NOT EXISTS idx_kpi_clicks_created_at ON "KPIs".element_clicks(created_at DESC)')
  await query('CREATE INDEX IF NOT EXISTS idx_kpi_impressions_page_path ON "KPIs".element_impressions(page_path)')
  await query('CREATE INDEX IF NOT EXISTS idx_kpi_impressions_created_at ON "KPIs".element_impressions(created_at DESC)')

  ensured = true
}

export function parseDeviceType(userAgent: string | null): "mobile" | "tablet" | "desktop" {
  const ua = (userAgent || "").toLowerCase()
  if (/ipad|tablet/.test(ua)) return "tablet"
  if (/mobi|iphone|android/.test(ua)) return "mobile"
  return "desktop"
}

export function parseBrowser(userAgent: string | null): string {
  const ua = (userAgent || "").toLowerCase()
  if (ua.includes("edg")) return "edge"
  if (ua.includes("chrome")) return "chrome"
  if (ua.includes("safari") && !ua.includes("chrome")) return "safari"
  if (ua.includes("firefox")) return "firefox"
  return "unknown"
}

export function parseOs(userAgent: string | null): string {
  const ua = (userAgent || "").toLowerCase()
  if (ua.includes("windows")) return "windows"
  if (ua.includes("mac os")) return "macos"
  if (ua.includes("iphone") || ua.includes("ipad")) return "ios"
  if (ua.includes("android")) return "android"
  if (ua.includes("linux")) return "linux"
  return "unknown"
}
