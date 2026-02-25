import { z } from "zod"

export const KpiEventBodySchema = z.object({
  sessionId: z.string().min(1),
  anonymousId: z.string().min(1),
  eventType: z.string().min(1),
  pageUrl: z.string().min(1),
  pagePath: z.string().min(1),
  elementId: z.string().optional(),
  elementClass: z.string().optional(),
  elementText: z.string().optional(),
  elementHref: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
})

export const KpiSessionStartBodySchema = z.object({
  anonymousId: z.string().min(1),
  referrer: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  country: z.string().optional(),
})

export const KpiSessionEndBodySchema = z.object({
  sessionId: z.string().min(1),
})

export const KpiPageViewStartBodySchema = z.object({
  sessionId: z.string().min(1),
  anonymousId: z.string().min(1),
  pageUrl: z.string().min(1),
  pagePath: z.string().min(1),
  pageTitle: z.string().optional(),
  referrerUrl: z.string().optional(),
})

export const KpiPageViewEndBodySchema = z.object({
  pageViewId: z.string().min(1),
  scrollDepthPct: z.number().finite().optional(),
  isBounce: z.boolean().optional(),
})
