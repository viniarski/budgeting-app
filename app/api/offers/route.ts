import { NextResponse } from "next/server"
import { DEFAULT_OFFERS, OfferItem } from "@/lib/offers"

export const runtime = "nodejs"

function isOfferItem(value: unknown): value is OfferItem {
  if (!value || typeof value !== "object") return false
  const obj = value as Record<string, unknown>
  return (
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.desc === "string" &&
    typeof obj.discount === "string" &&
    typeof obj.category === "string"
  )
}

function normalizeLivePayload(payload: unknown): OfferItem[] {
  const raw = Array.isArray(payload)
    ? payload
    : payload &&
        typeof payload === "object" &&
        Array.isArray((payload as { offers?: unknown[] }).offers)
      ? (payload as { offers: unknown[] }).offers
      : []

  return raw.filter(isOfferItem)
}

export async function GET() {
  const feedUrl = process.env.OFFERS_API_URL
  if (!feedUrl) {
    return NextResponse.json({ offers: DEFAULT_OFFERS, source: "fallback" })
  }

  try {
    const response = await fetch(feedUrl, { cache: "no-store" })
    if (!response.ok) {
      return NextResponse.json({ offers: DEFAULT_OFFERS, source: "fallback" })
    }

    const data = (await response.json()) as unknown
    const offers = normalizeLivePayload(data)
    if (offers.length === 0) {
      return NextResponse.json({ offers: DEFAULT_OFFERS, source: "fallback" })
    }

    return NextResponse.json({ offers, source: "live" })
  } catch {
    return NextResponse.json({ offers: DEFAULT_OFFERS, source: "fallback" })
  }
}
