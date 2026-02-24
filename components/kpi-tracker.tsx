"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

const KPI_ANON_ID_KEY = "uniwallet-anonymous-id"

function postKeepalive(url: string, payload: unknown) {
  const body = JSON.stringify(payload)
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([body], { type: "application/json" }))
    return
  }

  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // silent fail for analytics
  })
}

function getOrCreateAnonymousId(): string {
  const existing = localStorage.getItem(KPI_ANON_ID_KEY)
  if (existing) return existing
  const generated = crypto.randomUUID()
  localStorage.setItem(KPI_ANON_ID_KEY, generated)
  return generated
}

function getScrollDepthPct(): number {
  const doc = document.documentElement
  const maxScroll = doc.scrollHeight - doc.clientHeight
  if (maxScroll <= 0) return 100
  const ratio = window.scrollY / maxScroll
  return Math.max(0, Math.min(100, Math.round(ratio * 100)))
}

export default function KPITracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isSessionReady, setIsSessionReady] = useState(false)

  const anonymousIdRef = useRef<string | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const pageViewIdRef = useRef<string | null>(null)
  const pageCountRef = useRef(0)
  const previousUrlRef = useRef<string>("")

  useEffect(() => {
    let active = true

    async function startSession() {
      try {
        const anonymousId = getOrCreateAnonymousId()
        anonymousIdRef.current = anonymousId

        const url = new URL(window.location.href)
        const response = await fetch("/api/kpi/session/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            anonymousId,
            referrer: document.referrer || null,
            utmSource: url.searchParams.get("utm_source"),
            utmMedium: url.searchParams.get("utm_medium"),
            utmCampaign: url.searchParams.get("utm_campaign"),
          }),
        })

        const data = (await response.json()) as { sessionId?: string | null }
        if (!active || !data.sessionId) return
        sessionIdRef.current = data.sessionId
        setIsSessionReady(true)
      } catch {
        // silent analytics fallback
      }
    }

    void startSession()

    const handlePageHide = () => {
      const sessionId = sessionIdRef.current
      const pageViewId = pageViewIdRef.current
      if (pageViewId) {
        postKeepalive("/api/kpi/page-view/end", {
          pageViewId,
          scrollDepthPct: getScrollDepthPct(),
          isBounce: pageCountRef.current === 1,
        })
      }
      if (sessionId) {
        postKeepalive("/api/kpi/session/end", { sessionId })
      }
    }

    window.addEventListener("pagehide", handlePageHide)
    return () => {
      active = false
      window.removeEventListener("pagehide", handlePageHide)
    }
  }, [])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return

      const clickable = target.closest("a,button")
      if (!clickable) return

      const sessionId = sessionIdRef.current
      const anonymousId = anonymousIdRef.current
      if (!sessionId || !anonymousId) return

      const href = clickable instanceof HTMLAnchorElement ? clickable.href : null

      postKeepalive("/api/kpi/event", {
        sessionId,
        anonymousId,
        eventType: "click",
        pageUrl: window.location.href,
        pagePath: window.location.pathname,
        elementId: clickable.id || null,
        elementClass: clickable.className || null,
        elementText: clickable.textContent?.trim().slice(0, 160) || null,
        elementHref: href,
        metadata: { tagName: clickable.tagName.toLowerCase() },
      })
    }

    document.addEventListener("click", handleClick, { capture: true })
    return () => document.removeEventListener("click", handleClick, { capture: true })
  }, [])

  useEffect(() => {
    const sessionId = sessionIdRef.current
    const anonymousId = anonymousIdRef.current
    if (!sessionId || !anonymousId) return

    const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`

    // End previous page view when route changes.
    const previousPageViewId = pageViewIdRef.current
    if (previousPageViewId) {
      postKeepalive("/api/kpi/page-view/end", {
        pageViewId: previousPageViewId,
        scrollDepthPct: getScrollDepthPct(),
        isBounce: false,
      })
    }

    void (async () => {
      try {
        const response = await fetch("/api/kpi/page-view/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            anonymousId,
            pageUrl: window.location.href,
            pagePath: pathname,
            pageTitle: document.title,
            referrerUrl: previousUrlRef.current || document.referrer || null,
          }),
        })

        const data = (await response.json()) as { pageViewId?: string | null }
        if (data.pageViewId) {
          pageViewIdRef.current = data.pageViewId
          pageCountRef.current += 1
          previousUrlRef.current = currentUrl
        }
      } catch {
        // silent analytics fallback
      }
    })()
  }, [pathname, searchParams, isSessionReady])

  return null
}
